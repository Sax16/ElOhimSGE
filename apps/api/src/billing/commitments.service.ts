import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { buildCommitmentDates, fromCents, type CommitmentCreateInput } from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { decimalToCents } from '../common/money.util';
import { todayISO, dateToISO, isoToDate } from '../common/installment-view.util';
import { type JwtUser } from '../auth/decorators/current-user.decorator';

function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

// Placement de la matrícula escolar activa.
const placementSelect = {
  section: {
    select: {
      name: true,
      gradeLevel: { select: { name: true, level: { select: { name: true } } } },
    },
  },
} satisfies Prisma.EnrollmentSelect;

type PlacementEnrollment = Prisma.EnrollmentGetPayload<{ select: typeof placementSelect }>;

// "6° A" (grado + sección) para el childrenLabel del compromiso.
function gradeSectionShort(enrollment: PlacementEnrollment | undefined): string | null {
  if (!enrollment) return null;
  return `${enrollment.section.gradeLevel.name} ${enrollment.section.name}`;
}

const studentMiniSelect = {
  id: true,
  firstNames: true,
  enrollments: {
    where: { canceledAt: null, academicYear: { status: 'ACTIVO' as const } },
    take: 1,
    select: placementSelect,
  },
} satisfies Prisma.StudentSelect;

const commitmentInclude = {
  guardian: { select: { id: true, fullName: true, phone: true } },
  proposedBy: { select: { fullName: true } },
  approvedBy: { select: { fullName: true } },
  items: {
    orderBy: { sequence: 'asc' as const },
    select: {
      installmentId: true,
      sequence: true,
      newDueDate: true,
      amount: true,
      installment: {
        select: {
          concept: true,
          dueDate: true,
          status: true,
          enrollment: { select: { student: { select: studentMiniSelect } } },
          programEnrollment: { select: { student: { select: studentMiniSelect } } },
        },
      },
    },
  },
} satisfies Prisma.PaymentCommitmentInclude;

type CommitmentRow = Prisma.PaymentCommitmentGetPayload<{ include: typeof commitmentInclude }>;

/**
 * Compromisos de pago (R2 — E3): reprograman 1:1 cuotas VENCIDAS de los hijos del apoderado
 * firmante. Secretaría propone → Admin aprueba (VIGENTE) / rechaza / anula. El "congelamiento" de
 * mora y recordatorios es consecuencia de la fecha efectiva (installment-view.util), no un flag.
 */
@Injectable()
export class CommitmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private mapCommitment(row: CommitmentRow) {
    const seenChild = new Set<string>();
    const childrenParts: string[] = [];
    const items = row.items.map((it) => {
      const student =
        it.installment.enrollment?.student ?? it.installment.programEnrollment!.student;
      if (!seenChild.has(student.id)) {
        seenChild.add(student.id);
        const short = gradeSectionShort(student.enrollments[0]);
        childrenParts.push(short ? `${student.firstNames} (${short})` : student.firstNames);
      }
      return {
        installmentId: it.installmentId,
        studentId: student.id,
        sequence: it.sequence,
        concept: it.installment.concept,
        childName: student.firstNames,
        originalDueDate: dateToISO(it.installment.dueDate),
        newDueDate: dateToISO(it.newDueDate),
        amount: money(it.amount),
        paid: it.installment.status === 'PAGADO',
      };
    });

    return {
      id: row.id,
      code: row.code,
      guardianId: row.guardianId,
      guardianName: row.guardian.fullName,
      guardianPhone: row.guardian.phone,
      childrenLabel: childrenParts.join(', '),
      totalAmount: money(row.totalAmount),
      itemsCount: items.length,
      paidCount: items.filter((i) => i.paid).length,
      status: row.status,
      frequency: row.frequency,
      firstDueDate: dateToISO(row.firstDueDate),
      proposedByName: row.proposedBy.fullName,
      approvedByName: row.approvedBy?.fullName ?? null,
      rejectReason: row.rejectReason,
      cancelReason: row.cancelReason,
      createdAt: row.createdAt.toISOString(),
      approvedAt: row.approvedAt ? row.approvedAt.toISOString() : null,
      breachedAt: row.breachedAt ? row.breachedAt.toISOString() : null,
      fulfilledAt: row.fulfilledAt ? row.fulfilledAt.toISOString() : null,
      items,
    };
  }

  private async getDto(id: string) {
    const row = await this.prisma.paymentCommitment.findUnique({
      where: { id },
      include: commitmentInclude,
    });
    if (!row) throw new NotFoundException('Compromiso no encontrado');
    return this.mapCommitment(row);
  }

  // GET /billing/commitments
  async list(query: {
    yearId: string;
    status?: string;
    q?: string;
    page: number;
    pageSize: number;
  }) {
    const { yearId, status, q, page, pageSize } = query;
    const and: Prisma.PaymentCommitmentWhereInput[] = [
      {
        items: {
          some: {
            installment: {
              OR: [
                { enrollment: { academicYearId: yearId } },
                { programEnrollment: { program: { academicYearId: yearId } } },
              ],
            },
          },
        },
      },
    ];
    if (status) and.push({ status: status as Prisma.PaymentCommitmentWhereInput['status'] });
    if (q && q.trim()) {
      const term = q.trim();
      and.push({
        OR: [
          { code: { contains: term, mode: 'insensitive' } },
          { guardian: { fullName: { contains: term, mode: 'insensitive' } } },
        ],
      });
    }

    const where: Prisma.PaymentCommitmentWhereInput = { AND: and };
    const total = await this.prisma.paymentCommitment.count({ where });
    const rows = await this.prisma.paymentCommitment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: commitmentInclude,
    });
    return { total, page, pageSize, items: rows.map((r) => this.mapCommitment(r)) };
  }

  // Cuotas elegibles para un compromiso: VENCIDAS (fecha efectiva = original al no tener override),
  // no pagadas/anuladas, de los hijos del apoderado, sin compromiso PROPUESTO/VIGENTE, año no CERRADO,
  // monto > 0. Devuelve un Map por id (para reuso en create) con los datos de snapshot.
  private async eligibleMap(guardianId: string): Promise<
    Map<
      string,
      {
        studentId: string;
        childName: string;
        concept: string;
        dueDate: Date;
        amountCents: number;
        feeCents: number;
        source: 'ESCOLAR' | 'PROGRAMA';
      }
    >
  > {
    const today = todayISO();
    const links = await this.prisma.studentGuardian.findMany({
      where: { guardianId, active: true },
      select: { studentId: true, student: { select: { firstNames: true } } },
    });
    const childFirstName = new Map(links.map((l) => [l.studentId, l.student.firstNames]));
    const studentIds = links.map((l) => l.studentId);
    const map = new Map<
      string,
      {
        studentId: string;
        childName: string;
        concept: string;
        dueDate: Date;
        amountCents: number;
        feeCents: number;
        source: 'ESCOLAR' | 'PROGRAMA';
      }
    >();
    if (studentIds.length === 0) return map;

    const rows = await this.prisma.installment.findMany({
      where: {
        status: { in: ['PENDIENTE', 'VENCIDO'] },
        // La deuda del retirado también es refinanciable: no se filtra por matrícula anulada.
        OR: [
          {
            enrollment: {
              studentId: { in: studentIds },
              academicYear: { status: { not: 'CERRADO' } },
            },
          },
          {
            programEnrollment: {
              studentId: { in: studentIds },
              program: { academicYear: { status: { not: 'CERRADO' } } },
            },
          },
        ],
      },
      select: {
        id: true,
        concept: true,
        dueDate: true,
        amount: true,
        lateFeeAmount: true,
        enrollmentId: true,
        enrollment: { select: { studentId: true } },
        programEnrollment: { select: { studentId: true } },
      },
    });

    // Cuotas ya comprometidas (PROPUESTO/VIGENTE): no reutilizables.
    const committed = await this.prisma.commitmentInstallment.findMany({
      where: {
        installmentId: { in: rows.map((r) => r.id) },
        commitment: { status: { in: ['PROPUESTO', 'VIGENTE'] } },
      },
      select: { installmentId: true },
    });
    const committedIds = new Set(committed.map((c) => c.installmentId));

    for (const r of rows) {
      if (committedIds.has(r.id)) continue;
      if (dateToISO(r.dueDate) >= today) continue; // no vencida (fecha efectiva = original)
      const amountCents = decimalToCents(r.amount);
      const feeCents = decimalToCents(r.lateFeeAmount);
      if (amountCents + feeCents <= 0) continue; // beca completa: nada que reprogramar
      const sid = r.enrollment?.studentId ?? r.programEnrollment?.studentId;
      if (!sid) continue;
      map.set(r.id, {
        studentId: sid,
        childName: childFirstName.get(sid) ?? '',
        concept: r.concept,
        dueDate: r.dueDate,
        amountCents,
        feeCents,
        source: r.enrollmentId ? 'ESCOLAR' : 'PROGRAMA',
      });
    }
    return map;
  }

  // GET /billing/commitments/eligible-installments?guardianId=
  async eligibleInstallments(guardianId: string) {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId },
      select: { fullName: true, phone: true },
    });
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    const map = await this.eligibleMap(guardianId);
    const installments = [...map.entries()]
      .map(([id, e]) => ({
        id,
        concept: e.concept,
        childName: e.childName,
        dueDate: dateToISO(e.dueDate),
        amount: fromCents(e.amountCents),
        lateFee: fromCents(e.feeCents),
        totalWithFee: fromCents(e.amountCents + e.feeCents),
        source: e.source,
      }))
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));

    return { guardianName: guardian.fullName, guardianPhone: guardian.phone, items: installments };
  }

  // POST /billing/commitments — propone (PROPUESTO).
  async create(input: CommitmentCreateInput, actor: JwtUser) {
    const today = todayISO();
    if (input.firstDueDate <= today) {
      throw new BadRequestException('La primera fecha pactada debe ser posterior a hoy');
    }

    const guardian = await this.prisma.guardian.findUnique({
      where: { id: input.guardianId },
      select: { id: true },
    });
    if (!guardian) throw new NotFoundException('Apoderado no encontrado');

    const eligible = await this.eligibleMap(input.guardianId);
    const selectedIds = [...new Set(input.installmentIds)];
    const selected = selectedIds.map((id) => {
      const e = eligible.get(id);
      if (!e) {
        throw new ConflictException(
          'Una cuota no es elegible (ya pagada, comprometida, no vencida o de otro apoderado)',
        );
      }
      return { id, ...e };
    });

    // Orden por fecha original asc; asigna newDueDate según la frecuencia.
    selected.sort((a, b) =>
      a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0,
    );
    const newDates = buildCommitmentDates(selected.length, input.firstDueDate, input.frequency);

    let totalCents = 0;
    const itemsData = selected.map((s, i) => {
      const lineCents = s.amountCents + s.feeCents;
      totalCents += lineCents;
      return {
        installmentId: s.id,
        sequence: i + 1,
        newDueDate: isoToDate(newDates[i]!),
        amount: new Prisma.Decimal(fromCents(lineCents)),
      };
    });

    const id = await this.prisma.$transaction(async (tx) => {
      const code = await nextCode(tx, 'commitment', 'CP-', 4);
      const created = await tx.paymentCommitment.create({
        data: {
          code,
          guardianId: input.guardianId,
          proposedById: actor.sub,
          status: 'PROPUESTO',
          frequency: input.frequency,
          firstDueDate: isoToDate(input.firstDueDate),
          totalAmount: new Prisma.Decimal(fromCents(totalCents)),
          items: { create: itemsData },
        },
        select: { id: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'commitment.propose',
          entity: 'PaymentCommitment',
          entityId: created.id,
          payload: {
            code,
            guardianId: input.guardianId,
            installmentIds: selectedIds,
            frequency: input.frequency,
            firstDueDate: input.firstDueDate,
            totalAmount: fromCents(totalCents),
          },
        },
        tx,
      );
      return created.id;
    });

    return this.getDto(id);
  }

  // POST /billing/commitments/:id/approve (ADMIN) → VIGENTE.
  async approve(id: string, actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede aprobar compromisos');
    }
    await this.prisma.$transaction(async (tx) => {
      const commitment = await tx.paymentCommitment.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!commitment) throw new NotFoundException('Compromiso no encontrado');
      if (commitment.status !== 'PROPUESTO') {
        throw new ConflictException('Solo se puede aprobar un compromiso propuesto');
      }
      await tx.paymentCommitment.update({
        where: { id },
        data: { status: 'VIGENTE', approvedById: actor.sub, approvedAt: new Date() },
      });
      await this.audit.log(
        { userId: actor.sub, action: 'commitment.approve', entity: 'PaymentCommitment', entityId: id },
        tx,
      );
    });
    return this.getDto(id);
  }

  // POST /billing/commitments/:id/reject (ADMIN) → RECHAZADO.
  async reject(id: string, reason: string, actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede rechazar compromisos');
    }
    await this.prisma.$transaction(async (tx) => {
      const commitment = await tx.paymentCommitment.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!commitment) throw new NotFoundException('Compromiso no encontrado');
      if (commitment.status !== 'PROPUESTO') {
        throw new ConflictException('Solo se puede rechazar un compromiso propuesto');
      }
      await tx.paymentCommitment.update({
        where: { id },
        data: { status: 'RECHAZADO', rejectReason: reason },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'commitment.reject',
          entity: 'PaymentCommitment',
          entityId: id,
          payload: { reason },
        },
        tx,
      );
    });
    return this.getDto(id);
  }

  // POST /billing/commitments/:id/cancel (ADMIN) → ANULADO. Las cuotas quedan libres al instante
  // (la fecha efectiva vuelve a la original: sin override VIGENTE).
  async cancel(id: string, reason: string, actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede anular compromisos');
    }
    await this.prisma.$transaction(async (tx) => {
      const commitment = await tx.paymentCommitment.findUnique({
        where: { id },
        select: { status: true },
      });
      if (!commitment) throw new NotFoundException('Compromiso no encontrado');
      if (commitment.status !== 'VIGENTE' && commitment.status !== 'PROPUESTO') {
        throw new ConflictException('Solo se puede anular un compromiso vigente o propuesto');
      }
      await tx.paymentCommitment.update({
        where: { id },
        data: { status: 'ANULADO', cancelReason: reason, canceledById: actor.sub },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'commitment.cancel',
          entity: 'PaymentCommitment',
          entityId: id,
          payload: { reason },
        },
        tx,
      );
    });
    return this.getDto(id);
  }
}
