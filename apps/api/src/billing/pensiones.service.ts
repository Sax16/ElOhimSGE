import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  fromCents,
  formatPEN,
  type InstallmentsQueryInput,
  type LateFeeExonerateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { decimalToCents } from '../common/money.util';
import { LateFeesService } from '../jobs/late-fees.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';

// ===== Fronteras de dinero y fecha =====
function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}
function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

// Placement de la matrícula escolar activa: "3° B Primaria".
const placementSelect = {
  section: {
    select: {
      name: true,
      gradeLevel: { select: { name: true, level: { select: { name: true } } } },
    },
  },
} satisfies Prisma.EnrollmentSelect;

type PlacementEnrollment = Prisma.EnrollmentGetPayload<{ select: typeof placementSelect }>;

function gradeSection(enrollment: PlacementEnrollment | undefined): string | null {
  if (!enrollment) return null;
  const g = enrollment.section.gradeLevel;
  return `${g.name} ${enrollment.section.name} ${g.level.name}`;
}

function fullName(s: {
  firstNames: string;
  paternalLastName: string;
  maternalLastName: string | null;
}): string {
  return [s.firstNames, s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
}

// Estudiante embebido en la cuota: identidad + placement + apoderado principal.
const studentSelect = {
  id: true,
  code: true,
  firstNames: true,
  paternalLastName: true,
  maternalLastName: true,
  enrollments: {
    where: { canceledAt: null, academicYear: { status: 'ACTIVO' as const } },
    take: 1,
    select: placementSelect,
  },
  guardians: {
    where: { isPrimary: true, active: true },
    take: 1,
    select: { guardian: { select: { id: true, fullName: true, phone: true } } },
  },
} satisfies Prisma.StudentSelect;

const installmentInclude = {
  enrollment: { select: { student: { select: studentSelect } } },
  programEnrollment: { select: { student: { select: studentSelect } } },
  receiptItems: {
    where: { receipt: { status: 'EMITIDO' as const } },
    take: 1,
    select: { receipt: { select: { id: true, code: true } } },
  },
} satisfies Prisma.InstallmentInclude;

type InstallmentRow = Prisma.InstallmentGetPayload<{ include: typeof installmentInclude }>;

/**
 * Pensiones (R2 — E2): seguimiento de cobranza (listado, indicadores), exoneración de mora
 * (solo Admin), recordatorios WhatsApp consolidados y corrida manual del job de mora (solo Admin).
 * El cobro NO ocurre aquí: se deriva a Caja (un solo punto de registro del dinero).
 */
@Injectable()
export class PensionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly lateFees: LateFeesService,
  ) {}

  // ===== GET /billing/installments =====
  async listInstallments(query: InstallmentsQueryInput) {
    const { yearId, month, type, status, q, page, pageSize } = query;
    const today = todayISO();

    const year = await this.prisma.academicYear.findUnique({
      where: { id: yearId },
      select: { name: true },
    });
    if (!year) throw new NotFoundException('Año académico no encontrado');
    const yearNum = Number(year.name);

    const and: Prisma.InstallmentWhereInput[] = [];

    // Tipo (define también el origen escolar/programa).
    switch (type) {
      case 'PENSION':
        and.push({ type: 'PENSION', enrollment: { academicYearId: yearId, canceledAt: null } });
        break;
      case 'MATRICULA':
        and.push({ type: 'MATRICULA', enrollment: { academicYearId: yearId, canceledAt: null } });
        break;
      case 'PROGRAMA':
        and.push({
          programEnrollment: { canceledAt: null, program: { academicYearId: yearId } },
        });
        break;
      case 'TODAS':
        and.push({
          OR: [
            { enrollment: { academicYearId: yearId, canceledAt: null } },
            { programEnrollment: { canceledAt: null, program: { academicYearId: yearId } } },
          ],
        });
        break;
    }

    // Mes: rango [mes/01, mes+1/01) sobre el año académico.
    if (month !== undefined) {
      const start = isoToDate(`${yearNum}-${pad2(month)}-01`);
      const endYear = month === 12 ? yearNum + 1 : yearNum;
      const endMonth = month === 12 ? 1 : month + 1;
      const end = isoToDate(`${endYear}-${pad2(endMonth)}-01`);
      and.push({ dueDate: { gte: start, lt: end } });
    }

    // Estado.
    switch (status) {
      case 'PENDIENTES':
        and.push({ status: { in: ['PENDIENTE', 'VENCIDO'] } });
        break;
      case 'PAGADAS':
        and.push({ status: 'PAGADO' });
        break;
      case 'VENCIDAS':
        and.push({ status: 'VENCIDO' });
        break;
      case 'TODAS':
        break;
    }

    // Búsqueda por estudiante (tokens AND como en Caja).
    if (q && q.trim()) {
      const studentIds = await this.searchStudentIds(q.trim());
      if (studentIds.length === 0) return { total: 0, page, pageSize, items: [] };
      and.push({
        OR: [
          { enrollment: { studentId: { in: studentIds } } },
          { programEnrollment: { studentId: { in: studentIds } } },
        ],
      });
    }

    const rows = await this.prisma.installment.findMany({
      where: { AND: and },
      include: installmentInclude,
    });

    const items = rows.map((r) => this.mapItem(r, today));
    // Orden: dueDate asc, luego nombre del estudiante.
    items.sort((a, b) => {
      if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
      return a.studentName.localeCompare(b.studentName);
    });

    const total = items.length;
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    // lastReminderAt solo para los apoderados de la página.
    const guardianIds = [
      ...new Set(pageItems.map((i) => i.guardianId).filter((x): x is string => x !== null)),
    ];
    const reminders = await this.lastRemindersByGuardian(guardianIds);
    for (const it of pageItems) {
      it.lastReminderAt = it.guardianId ? reminders.get(it.guardianId) ?? null : null;
    }

    return { total, page, pageSize, items: pageItems };
  }

  private mapItem(row: InstallmentRow, today: string) {
    const student = row.enrollment?.student ?? row.programEnrollment!.student;
    const source: 'ESCOLAR' | 'PROGRAMA' = row.enrollmentId ? 'ESCOLAR' : 'PROGRAMA';
    const iso = dateToISO(row.dueDate);
    // Robustez de lectura: PENDIENTE con vencimiento pasado se reporta VENCIDO (el job aún no corrió).
    const displayStatus =
      row.status === 'PENDIENTE' && iso < today ? 'VENCIDO' : row.status;
    const amountCents = decimalToCents(row.amount);
    const feeCents = decimalToCents(row.lateFeeAmount);
    const receipt = row.status === 'PAGADO' ? row.receiptItems[0]?.receipt ?? null : null;
    const primary = student.guardians[0]?.guardian ?? null;

    return {
      id: row.id,
      studentId: student.id,
      studentName: fullName(student),
      studentCode: student.code,
      gradeSection: gradeSection(student.enrollments[0]),
      concept: row.concept,
      type: row.type as 'MATRICULA' | 'PENSION',
      source,
      dueDate: iso,
      amount: money(row.amount),
      lateFee: money(row.lateFeeAmount),
      totalWithFee: fromCents(amountCents + feeCents),
      status: displayStatus,
      exonerated: row.lateFeeExoneratedAt !== null,
      receiptId: receipt?.id ?? null,
      receiptCode: receipt?.code ?? null,
      guardianId: primary?.id ?? null,
      guardianName: primary?.fullName ?? null,
      guardianPhone: primary?.phone ?? null,
      lastReminderAt: null as string | null,
    };
  }

  private async searchStudentIds(term: string): Promise<string[]> {
    const tokens = term.split(/\s+/).filter(Boolean);
    const students = await this.prisma.student.findMany({
      where: {
        AND: tokens.map((t) => ({
          OR: [
            { firstNames: { contains: t, mode: 'insensitive' as const } },
            { paternalLastName: { contains: t, mode: 'insensitive' as const } },
            { maternalLastName: { contains: t, mode: 'insensitive' as const } },
            { code: { contains: t, mode: 'insensitive' as const } },
            { dni: { contains: t, mode: 'insensitive' as const } },
          ],
        })),
      },
      select: { id: true },
    });
    return students.map((s) => s.id);
  }

  private async lastRemindersByGuardian(ids: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (ids.length === 0) return map;
    const grouped = await this.prisma.reminderLog.groupBy({
      by: ['guardianId'],
      where: { guardianId: { in: ids } },
      _max: { createdAt: true },
    });
    for (const g of grouped) {
      if (g._max.createdAt) map.set(g.guardianId, g._max.createdAt.toISOString());
    }
    return map;
  }

  private async buildItemDto(id: string, today: string) {
    const row = await this.prisma.installment.findUnique({
      where: { id },
      include: installmentInclude,
    });
    if (!row) throw new NotFoundException('Cuota no encontrada');
    const item = this.mapItem(row, today);
    if (item.guardianId) {
      const map = await this.lastRemindersByGuardian([item.guardianId]);
      item.lastReminderAt = map.get(item.guardianId) ?? null;
    }
    return item;
  }

  // ===== GET /billing/installments/stats =====
  async stats(yearId: string, month?: number) {
    const today = todayISO();
    const effectiveMonth = month ?? Number(today.slice(5, 7));

    const year = await this.prisma.academicYear.findUnique({
      where: { id: yearId },
      select: { id: true },
    });
    if (!year) throw new NotFoundException('Año académico no encontrado');

    // SOLO pensiones escolares del año (matrículas no anuladas).
    const rows = await this.prisma.installment.findMany({
      where: {
        type: 'PENSION',
        enrollment: { academicYearId: yearId, canceledAt: null },
      },
      select: { status: true, dueDate: true, amount: true, lateFeeAmount: true },
    });

    let collectedCents = 0;
    let collectedCount = 0;
    let pendingCents = 0;
    let pendingCount = 0;
    let overdueCents = 0;
    let overdueCount = 0;
    let dueToDateCount = 0;

    for (const r of rows) {
      const iso = dateToISO(r.dueDate);
      const m = Number(iso.slice(5, 7));
      const past = iso < today;
      const amountCents = decimalToCents(r.amount);
      const feeCents = decimalToCents(r.lateFeeAmount);

      // Métricas del mes seleccionado.
      if (m === effectiveMonth) {
        if (r.status === 'PAGADO') {
          collectedCount += 1;
          collectedCents += amountCents;
        } else if (r.status === 'PENDIENTE' || r.status === 'VENCIDO') {
          pendingCount += 1;
          pendingCents += amountCents;
        }
      }

      // Morosidad acumulada del año (montos con mora).
      if (r.status === 'VENCIDO' || (r.status === 'PENDIENTE' && past)) {
        overdueCount += 1;
        overdueCents += amountCents + feeCents;
      }

      if (iso <= today) dueToDateCount += 1;
    }

    const overdueRate =
      dueToDateCount > 0 ? Math.round((overdueCount / dueToDateCount) * 1000) / 10 : 0;

    return {
      collectedAmount: fromCents(collectedCents),
      collectedCount,
      pendingAmount: fromCents(pendingCents),
      pendingCount,
      overdueAmount: fromCents(overdueCents),
      overdueCount,
      dueToDateCount,
      overdueRate,
    };
  }

  // ===== POST /billing/installments/:id/exonerate-late-fee (ADMIN) =====
  async exonerateLateFee(id: string, input: LateFeeExonerateInput, actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede exonerar la mora');
    }
    const inst = await this.prisma.installment.findUnique({
      where: { id },
      select: { id: true, status: true, lateFeeAmount: true },
    });
    if (!inst) throw new NotFoundException('Cuota no encontrada');
    const feeCents = decimalToCents(inst.lateFeeAmount);
    if (feeCents <= 0) throw new BadRequestException('La cuota no tiene mora para exonerar');
    if (inst.status === 'PAGADO' || inst.status === 'ANULADO') {
      throw new ConflictException('No se puede exonerar la mora de una cuota pagada o anulada');
    }
    const previousFee = money(inst.lateFeeAmount);

    await this.prisma.$transaction(async (tx) => {
      await tx.installment.update({
        where: { id },
        data: {
          lateFeeAmount: new Prisma.Decimal(0),
          lateFeeExoneratedAt: new Date(),
          lateFeeExoneratedById: actor.sub,
          lateFeeExonerationReason: input.reason,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'installment.exonerateLateFee',
          entity: 'Installment',
          entityId: id,
          payload: { previousFee, reason: input.reason },
        },
        tx,
      );
    });

    return this.buildItemDto(id, todayISO());
  }

  // ===== Recordatorios consolidados por apoderado =====
  private async computeReminder(guardianId: string) {
    const today = todayISO();
    const currentMonth = Number(today.slice(5, 7));
    const threshold = isoToDate(today);

    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId },
      select: { id: true, fullName: true, phone: true },
    });
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    const digits = guardian.phone.replace(/\D/g, '');
    if (digits.length < 9) {
      throw new ConflictException('El apoderado no tiene un número de WhatsApp válido');
    }

    // Estudiantes de los que este apoderado es contacto principal activo.
    const links = await this.prisma.studentGuardian.findMany({
      where: { guardianId, isPrimary: true, active: true },
      select: {
        studentId: true,
        student: { select: { firstNames: true } },
      },
    });
    const studentIds = links.map((l) => l.studentId);
    const childFirstName = new Map(
      links.map((l) => [l.studentId, l.student.firstNames.split(/\s+/)[0] ?? l.student.firstNames]),
    );

    type Line = {
      studentId: string;
      childName: string;
      concept: string;
      dueDate: string;
      amountCents: number;
      feeCents: number;
      kind: 'overdue' | 'current';
    };
    const lines: Line[] = [];

    if (studentIds.length > 0) {
      // (1) Cuotas VENCIDAS de todos sus hijos (escolar + programa), años no CERRADO.
      const overdue = await this.prisma.installment.findMany({
        where: {
          OR: [{ status: 'VENCIDO' }, { status: 'PENDIENTE', dueDate: { lt: threshold } }],
          AND: {
            OR: [
              {
                enrollment: {
                  studentId: { in: studentIds },
                  canceledAt: null,
                  academicYear: { status: { not: 'CERRADO' } },
                },
              },
              {
                programEnrollment: {
                  studentId: { in: studentIds },
                  canceledAt: null,
                  program: { academicYear: { status: { not: 'CERRADO' } } },
                },
              },
            ],
          },
        },
        select: {
          concept: true,
          amount: true,
          lateFeeAmount: true,
          dueDate: true,
          enrollment: { select: { studentId: true } },
          programEnrollment: { select: { studentId: true } },
        },
      });
      for (const o of overdue) {
        const sid = o.enrollment?.studentId ?? o.programEnrollment?.studentId;
        if (!sid) continue;
        lines.push({
          studentId: sid,
          childName: childFirstName.get(sid) ?? '',
          concept: o.concept,
          dueDate: dateToISO(o.dueDate),
          amountCents: decimalToCents(o.amount),
          feeCents: decimalToCents(o.lateFeeAmount),
          kind: 'overdue',
        });
      }

      // (2) Pensión escolar del mes en curso que siga PENDIENTE y aún no venza.
      const current = await this.prisma.installment.findMany({
        where: {
          type: 'PENSION',
          status: 'PENDIENTE',
          dueDate: { gte: threshold },
          enrollment: {
            studentId: { in: studentIds },
            canceledAt: null,
            academicYear: { status: { not: 'CERRADO' } },
          },
        },
        select: {
          concept: true,
          amount: true,
          dueDate: true,
          enrollment: { select: { studentId: true } },
        },
      });
      for (const c of current) {
        const iso = dateToISO(c.dueDate);
        if (Number(iso.slice(5, 7)) !== currentMonth) continue;
        const sid = c.enrollment!.studentId;
        lines.push({
          studentId: sid,
          childName: childFirstName.get(sid) ?? '',
          concept: c.concept,
          dueDate: iso,
          amountCents: decimalToCents(c.amount),
          feeCents: 0,
          kind: 'current',
        });
      }
    }

    // Cuotas de monto cero (beca completa) no se reclaman: fuera del mensaje.
    const collectable = lines.filter((l) => l.amountCents + l.feeCents > 0);
    lines.length = 0;
    lines.push(...collectable);

    if (lines.length === 0) {
      throw new ConflictException('El apoderado no tiene cuotas pendientes por recordar');
    }

    // Orden: por hijo, luego por vencimiento.
    lines.sort((a, b) => {
      if (a.childName !== b.childName) return a.childName.localeCompare(b.childName);
      return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
    });

    const institution = await this.prisma.institution.findUnique({
      where: { id: 1 },
      select: { name: true },
    });
    const institutionName = institution?.name ?? 'la institución';

    let totalCents = 0;
    const lineTexts = lines.map((l) => {
      totalCents += l.amountCents + l.feeCents;
      const amt = formatPEN(l.amountCents);
      if (l.kind === 'overdue') {
        let t = `• ${l.concept} (${l.childName}): ${amt}`;
        if (l.feeCents > 0) t += ` + mora ${formatPEN(l.feeCents)}`;
        return t;
      }
      const ddmm = `${l.dueDate.slice(8, 10)}/${l.dueDate.slice(5, 7)}`;
      return `• ${l.concept} (${l.childName}): ${amt} — vence ${ddmm}`;
    });

    const message = [
      `Hola ${guardian.fullName}, le saluda *${institutionName}*.`,
      '',
      'Le recordamos las siguientes cuotas pendientes:',
      '',
      ...lineTexts,
      '',
      `*Total: ${formatPEN(totalCents)}*`,
      '',
      'Puede acercarse a caja para regularizar el pago. Quedamos atentos, ¡gracias!',
    ].join('\n');

    const waUrl = `https://wa.me/51${digits}?text=${encodeURIComponent(message)}`;

    const reminders = await this.lastRemindersByGuardian([guardian.id]);

    return {
      guardianId: guardian.id,
      guardianName: guardian.fullName,
      phone: guardian.phone,
      waUrl,
      message,
      totalAmount: fromCents(totalCents),
      itemsCount: lines.length,
      lastReminderAt: reminders.get(guardian.id) ?? null,
    };
  }

  // GET /billing/reminders/preview
  async reminderPreview(guardianId: string) {
    return this.computeReminder(guardianId);
  }

  // POST /billing/reminders
  async sendReminder(guardianId: string, actor: JwtUser) {
    const preview = await this.computeReminder(guardianId);

    const log = await this.prisma.$transaction(async (tx) => {
      const created = await tx.reminderLog.create({
        data: {
          guardianId: preview.guardianId,
          sentById: actor.sub,
          channel: 'WHATSAPP',
          message: preview.message,
          totalAmount: new Prisma.Decimal(preview.totalAmount),
          itemsCount: preview.itemsCount,
        },
        select: { id: true, createdAt: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'reminder.send',
          entity: 'ReminderLog',
          entityId: created.id,
          payload: {
            guardianId: preview.guardianId,
            totalAmount: preview.totalAmount,
            itemsCount: preview.itemsCount,
          },
        },
        tx,
      );
      return created;
    });

    return { ...preview, id: log.id, createdAt: log.createdAt.toISOString() };
  }

  // ===== POST /billing/late-fees/run (ADMIN) =====
  async runLateFees(actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede ejecutar el job de mora');
    }
    const result = await this.lateFees.run();
    await this.audit.log({
      userId: actor.sub,
      action: 'lateFees.run',
      entity: 'Installment',
      entityId: 'batch',
      payload: { markedOverdue: result.markedOverdue, feesApplied: result.feesApplied },
    });
    return result;
  }
}
