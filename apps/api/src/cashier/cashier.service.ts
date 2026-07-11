import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { fromCents, type CashSessionCloseInput, type CashSessionOpenInput, type ReceiptCreateInput } from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { decimalToCents } from '../common/money.util';
import { debtCentsByStudent } from '../common/debt.util';

type DbClient = Prisma.TransactionClient | PrismaService;

// Prisma.Decimal | null → string decimal "280.00" (frontera de dinero de la API).
function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}
function moneyOrNull(value: Prisma.Decimal | null): string | null {
  return value === null ? null : value.toFixed(2);
}

// Fecha calendario de hoy (yyyy-mm-dd) con componentes locales — sin corrimiento por TZ.
function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
// Date (columna @db.Date, UTC medianoche) → yyyy-mm-dd.
function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}
// yyyy-mm-dd → Date UTC medianoche (columnas @db.Date).
function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}
// Medianoche local de hoy: umbral de vencimiento (misma definición que debt.util).
function startOfToday(): Date {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

// Placement de la matrícula escolar activa: "3° B Primaria" (grado + sección + nivel).
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

// Estudiante con lo necesario para el "hit" de ventanilla (placement + apoderado principal).
const studentHitSelect = {
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
    select: { guardian: { select: { fullName: true, phone: true } } },
  },
} satisfies Prisma.StudentSelect;

type StudentHitRow = Prisma.StudentGetPayload<{ select: typeof studentHitSelect }>;

function fullName(s: { firstNames: string; paternalLastName: string; maternalLastName: string | null }): string {
  return [s.firstNames, s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
}

// Include del recibo para armar el ReceiptDto (reimpresión / respuesta de cobro y anulación).
const receiptInclude = {
  cashier: { select: { fullName: true } },
  canceledBy: { select: { fullName: true } },
  student: {
    select: {
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
    },
  },
  items: { select: { concept: true, quantity: true, amount: true } },
} satisfies Prisma.ReceiptInclude;

type ReceiptRow = Prisma.ReceiptGetPayload<{ include: typeof receiptInclude }>;

// Include de la caja para armar el SessionDto.
const sessionInclude = {
  openedBy: { select: { fullName: true } },
  closedBy: { select: { fullName: true } },
} satisfies Prisma.CashSessionInclude;

type SessionRow = Prisma.CashSessionGetPayload<{ include: typeof sessionInclude }>;

@Injectable()
export class CashierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async activeYearName(client: DbClient): Promise<number> {
    const year = await client.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { name: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return Number(year.name);
  }

  // ===== DTO builders =====

  private mapSession(s: SessionRow) {
    return {
      id: s.id,
      date: dateToISO(s.date),
      status: s.status,
      openedAt: s.openedAt.toISOString(),
      openedByName: s.openedBy.fullName,
      initialAmount: money(s.initialAmount),
      closedAt: s.closedAt ? s.closedAt.toISOString() : null,
      closedByName: s.closedBy?.fullName ?? null,
      expectedCash: moneyOrNull(s.expectedCash),
      countedCash: moneyOrNull(s.countedCash),
      difference: moneyOrNull(s.difference),
      closeNotes: s.closeNotes,
    };
  }

  private mapReceipt(r: ReceiptRow) {
    return {
      id: r.id,
      code: r.code,
      createdAt: r.createdAt.toISOString(),
      status: r.status,
      method: r.method,
      operationNumber: r.operationNumber,
      totalAmount: money(r.totalAmount),
      receivedAmount: moneyOrNull(r.receivedAmount),
      changeAmount: moneyOrNull(r.changeAmount),
      cashierName: r.cashier.fullName,
      student: {
        id: r.student.id,
        code: r.student.code,
        fullName: fullName(r.student),
        gradeSection: gradeSection(r.student.enrollments[0]),
      },
      guardianName: r.guardianName,
      guardianPhone: r.guardianPhone,
      items: r.items.map((i) => ({
        concept: i.concept,
        quantity: i.quantity,
        amount: money(i.amount),
      })),
      canceledAt: r.canceledAt ? r.canceledAt.toISOString() : null,
      cancelReason: r.cancelReason,
      canceledByName: r.canceledBy?.fullName ?? null,
    };
  }

  private async getReceiptDto(client: DbClient, id: string) {
    const receipt = await client.receipt.findUnique({ where: { id }, include: receiptInclude });
    if (!receipt) throw new NotFoundException('Recibo no encontrado');
    return this.mapReceipt(receipt);
  }

  // ===== Caja del día =====

  // GET /cashier/day — la caja relevante con indicadores y movimientos:
  // la de HOY si existe; si no, una ABIERTA de un día anterior pendiente de cierre.
  async getDay() {
    const todayDate = isoToDate(todayISO());
    let session = await this.prisma.cashSession.findUnique({
      where: { date: todayDate },
      include: sessionInclude,
    });
    if (!session) {
      session = await this.prisma.cashSession.findFirst({
        where: { status: 'ABIERTA' },
        orderBy: { date: 'desc' },
        include: sessionInclude,
      });
    }

    if (!session) {
      return {
        session: null,
        stats: {
          totalAmount: '0.00',
          cashAmount: '0.00',
          digitalAmount: '0.00',
          operationsCount: 0,
          cashCount: 0,
          digitalCount: 0,
          canceledCount: 0,
        },
        movements: [],
      };
    }

    const receipts = await this.prisma.receipt.findMany({
      where: { cashSessionId: session.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        createdAt: true,
        method: true,
        totalAmount: true,
        status: true,
        cashier: { select: { fullName: true } },
        student: { select: { firstNames: true, paternalLastName: true, maternalLastName: true } },
        items: { select: { concept: true, quantity: true } },
      },
    });

    let cashCents = 0;
    let digitalCents = 0;
    let cashCount = 0;
    let digitalCount = 0;
    let operationsCount = 0;
    let canceledCount = 0;
    for (const r of receipts) {
      if (r.status === 'ANULADO') {
        canceledCount += 1;
        continue;
      }
      operationsCount += 1;
      const cents = decimalToCents(r.totalAmount);
      if (r.method === 'EFECTIVO') {
        cashCents += cents;
        cashCount += 1;
      } else {
        digitalCents += cents;
        digitalCount += 1;
      }
    }

    const movements = receipts.map((r) => ({
      id: r.id,
      code: r.code,
      createdAt: r.createdAt.toISOString(),
      studentName: fullName(r.student),
      summary: r.items
        .map((i) => (i.quantity > 1 ? `${i.concept} ×${i.quantity}` : i.concept))
        .join(' + '),
      method: r.method,
      totalAmount: money(r.totalAmount),
      cashierName: r.cashier.fullName,
      status: r.status,
    }));

    return {
      session: this.mapSession(session),
      stats: {
        totalAmount: fromCents(cashCents + digitalCents),
        cashAmount: fromCents(cashCents),
        digitalAmount: fromCents(digitalCents),
        operationsCount,
        cashCount,
        digitalCount,
        canceledCount,
      },
      movements,
    };
  }

  // POST /cashier/session/open — abre la caja de HOY (una por día, sin reapertura).
  // Bloqueada mientras exista una caja de un día anterior sin cerrar.
  async openSession(input: CashSessionOpenInput, actorId: string) {
    const todayDate = isoToDate(todayISO());
    const existing = await this.prisma.cashSession.findUnique({
      where: { date: todayDate },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Ya existe una caja para hoy');
    }
    const pending = await this.prisma.cashSession.findFirst({
      where: { status: 'ABIERTA' },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    if (pending) {
      const dmy = dateToISO(pending.date).split('-').reverse().join('/');
      throw new ConflictException(
        `La caja del ${dmy} sigue abierta — realiza su arqueo y ciérrala antes de abrir la de hoy`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const session = await tx.cashSession.create({
        data: {
          date: todayDate,
          status: 'ABIERTA',
          openedById: actorId,
          initialAmount: input.initialAmount,
        },
        include: sessionInclude,
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'cashSession.open',
          entity: 'CashSession',
          entityId: session.id,
          payload: { date: dateToISO(session.date), initialAmount: input.initialAmount },
        },
        tx,
      );
      return this.mapSession(session);
    });
  }

  // POST /cashier/session/close — cierra la caja ABIERTA con arqueo (solo efectivo).
  // Opera sobre la caja abierta aunque sea de un día anterior: el cierre no caduca
  // a medianoche — quien cuadra tarde igual registra su arqueo (queda trazado en closedAt).
  async closeSession(input: CashSessionCloseInput, actorId: string) {
    const session = await this.prisma.cashSession.findFirst({
      where: { status: 'ABIERTA' },
      orderBy: { date: 'desc' },
      select: { id: true, status: true, initialAmount: true },
    });
    if (!session) throw new NotFoundException('No hay ninguna caja abierta');

    // Efectivo esperado = monto inicial + efectivo de recibos EMITIDO de la sesión.
    const cashReceipts = await this.prisma.receipt.findMany({
      where: { cashSessionId: session.id, status: 'EMITIDO', method: 'EFECTIVO' },
      select: { totalAmount: true },
    });
    let expectedCents = decimalToCents(session.initialAmount);
    for (const r of cashReceipts) expectedCents += decimalToCents(r.totalAmount);

    const expected = fromCents(expectedCents);
    const countedCents = decimalToCents(input.countedCash);
    const difference = fromCents(countedCents - expectedCents);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.cashSession.update({
        where: { id: session.id },
        data: {
          status: 'CERRADA',
          closedById: actorId,
          closedAt: new Date(),
          expectedCash: expected,
          countedCash: input.countedCash,
          difference,
          closeNotes: input.notes ?? null,
        },
        include: sessionInclude,
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'cashSession.close',
          entity: 'CashSession',
          entityId: session.id,
          payload: { expectedCash: expected, countedCash: input.countedCash, difference },
        },
        tx,
      );
      return this.mapSession(updated);
    });
  }

  // ===== Ventanilla: catálogo, estudiantes y cuotas cobrables =====

  // GET /cashier/sale-concepts — conceptos ACTIVO para el selector de ventanilla.
  async listSaleConcepts() {
    const concepts = await this.prisma.saleConcept.findMany({
      where: { status: 'ACTIVO' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, price: true, status: true },
    });
    return concepts.map((c) => ({
      id: c.id,
      name: c.name,
      price: money(c.price),
      status: c.status,
    }));
  }

  // GET /cashier/students?q= — máx 8 hits (nombre completo, código o DNI).
  async searchStudents(q?: string) {
    const term = (q ?? '').trim();
    if (!term) return [];

    // Cada token debe aparecer en algún campo de nombre / código / DNI (AND de tokens).
    const tokens = term.split(/\s+/).filter(Boolean);
    const where: Prisma.StudentWhereInput = {
      AND: tokens.map((t) => ({
        OR: [
          { firstNames: { contains: t, mode: 'insensitive' } },
          { paternalLastName: { contains: t, mode: 'insensitive' } },
          { maternalLastName: { contains: t, mode: 'insensitive' } },
          { code: { contains: t, mode: 'insensitive' } },
          { dni: { contains: t, mode: 'insensitive' } },
        ],
      })),
    };

    const students = await this.prisma.student.findMany({
      where,
      orderBy: [{ paternalLastName: 'asc' }, { maternalLastName: 'asc' }, { firstNames: 'asc' }],
      take: 8,
      select: studentHitSelect,
    });

    const debt = await debtCentsByStudent(this.prisma, students.map((s) => s.id));
    return students.map((s) => this.mapStudentHit(s, debt.get(s.id) ?? 0));
  }

  private mapStudentHit(s: StudentHitRow, debtCents: number) {
    return {
      id: s.id,
      code: s.code,
      fullName: fullName(s),
      gradeSection: gradeSection(s.enrollments[0]),
      primaryGuardianName: s.guardians[0]?.guardian.fullName ?? null,
      primaryGuardianPhone: s.guardians[0]?.guardian.phone ?? null,
      debtAmount: fromCents(debtCents),
    };
  }

  // GET /cashier/students/:id/collectibles — cuotas PENDIENTE cobrables (excluye años CERRADO).
  async collectibles(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: studentHitSelect,
    });
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    const debt = await debtCentsByStudent(this.prisma, [studentId]);

    const rows = await this.prisma.installment.findMany({
      where: {
        // Cobrable = sigue por pagar: PENDIENTE o VENCIDO (el job materializa VENCIDO con su mora).
        status: { in: ['PENDIENTE', 'VENCIDO'] },
        OR: [
          {
            enrollment: {
              studentId,
              canceledAt: null,
              academicYear: { status: { not: 'CERRADO' } },
            },
          },
          {
            programEnrollment: {
              studentId,
              canceledAt: null,
              program: { academicYear: { status: { not: 'CERRADO' } } },
            },
          },
        ],
      },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        concept: true,
        dueDate: true,
        amount: true,
        lateFeeAmount: true,
        type: true,
        enrollmentId: true,
      },
    });

    const threshold = startOfToday();
    const installments = rows.map((i) => {
      const totalCents = decimalToCents(i.amount) + decimalToCents(i.lateFeeAmount);
      return {
        id: i.id,
        concept: i.concept,
        dueDate: dateToISO(i.dueDate),
        amount: money(i.amount),
        lateFee: money(i.lateFeeAmount),
        totalWithFee: fromCents(totalCents),
        status: i.dueDate < threshold ? 'VENCIDO' : 'PENDIENTE',
        type: i.type,
        source: i.enrollmentId ? 'ESCOLAR' : 'PROGRAMA',
      };
    });

    return {
      student: this.mapStudentHit(student, debt.get(studentId) ?? 0),
      installments,
    };
  }

  // ===== Cobro y anulación =====

  // POST /cashier/receipts — cobra cuotas completas + ventas, en una sola $transaction.
  async createReceipt(input: ReceiptCreateInput, actorId: string) {
    const receiptId = await this.prisma.$transaction(async (tx) => {
      // (1) Caja de hoy ABIERTA.
      const todayDate = isoToDate(todayISO());
      const session = await tx.cashSession.findUnique({
        where: { date: todayDate },
        select: { id: true, status: true },
      });
      if (!session || session.status !== 'ABIERTA') {
        throw new ConflictException('La caja del día no está abierta');
      }

      // (2) Cuotas: existen, del estudiante, PENDIENTE, año no CERRADO. Sin duplicados.
      const installmentIds = [...new Set(input.installmentIds)];
      const enrollmentIds = new Set<string>();
      let installmentsCents = 0;
      const installmentItems: {
        installmentId: string;
        concept: string;
        amount: Prisma.Decimal;
      }[] = [];

      for (const installmentId of installmentIds) {
        const inst = await tx.installment.findUnique({
          where: { id: installmentId },
          select: {
            id: true,
            concept: true,
            amount: true,
            lateFeeAmount: true,
            status: true,
            enrollmentId: true,
            enrollment: {
              select: { studentId: true, academicYear: { select: { status: true } } },
            },
            programEnrollment: {
              select: { studentId: true, program: { select: { academicYear: { select: { status: true } } } } },
            },
          },
        });
        if (!inst) throw new NotFoundException(`Cuota ${installmentId} no encontrada`);
        const ownerStudentId = inst.enrollment?.studentId ?? inst.programEnrollment?.studentId;
        if (ownerStudentId !== input.studentId) {
          throw new BadRequestException('Una cuota no pertenece al estudiante indicado');
        }
        // Cobrable si sigue por pagar: PENDIENTE o VENCIDO (el job materializa VENCIDO).
        if (inst.status !== 'PENDIENTE' && inst.status !== 'VENCIDO') {
          throw new ConflictException(`La cuota "${inst.concept}" ya no está pendiente`);
        }
        const yearStatus =
          inst.enrollment?.academicYear.status ??
          inst.programEnrollment?.program.academicYear.status;
        if (yearStatus === 'CERRADO') {
          throw new ConflictException('No se puede cobrar una cuota de un año cerrado');
        }
        // Se cobra la cuota + su mora fija (snapshot en la línea del recibo).
        const feeCents = decimalToCents(inst.lateFeeAmount);
        const lineCents = decimalToCents(inst.amount) + feeCents;
        installmentsCents += lineCents;
        installmentItems.push({
          installmentId: inst.id,
          concept: feeCents > 0 ? `${inst.concept} (+ mora)` : inst.concept,
          amount: new Prisma.Decimal(fromCents(lineCents)),
        });
        if (inst.enrollmentId) enrollmentIds.add(inst.enrollmentId);
      }

      // (3) Ventas: SaleConcept ACTIVO; snapshot de nombre y precio.
      let salesCents = 0;
      const saleItemsData: {
        saleConceptId: string;
        concept: string;
        quantity: number;
        unitAmount: Prisma.Decimal;
        amount: Prisma.Decimal;
      }[] = [];
      for (const si of input.saleItems) {
        const concept = await tx.saleConcept.findUnique({
          where: { id: si.saleConceptId },
          select: { id: true, name: true, price: true, status: true },
        });
        if (!concept) throw new NotFoundException(`Concepto ${si.saleConceptId} no encontrado`);
        if (concept.status !== 'ACTIVO') {
          throw new BadRequestException(`El concepto "${concept.name}" no está activo`);
        }
        const unitCents = decimalToCents(concept.price);
        const lineCents = unitCents * si.quantity;
        salesCents += lineCents;
        saleItemsData.push({
          saleConceptId: concept.id,
          concept: concept.name,
          quantity: si.quantity,
          unitAmount: concept.price,
          amount: new Prisma.Decimal(fromCents(lineCents)),
        });
      }

      // (4) Total y efectivo/vuelto.
      const totalCents = installmentsCents + salesCents;
      let receivedAmount: string | null = null;
      let changeAmount: string | null = null;
      if (input.method === 'EFECTIVO') {
        if (input.receivedAmount === undefined) {
          throw new BadRequestException('Indica el monto recibido en efectivo');
        }
        const receivedCents = decimalToCents(input.receivedAmount);
        if (receivedCents < totalCents) {
          throw new BadRequestException('El monto recibido es menor al total');
        }
        receivedAmount = fromCents(receivedCents);
        changeAmount = fromCents(receivedCents - totalCents);
      }

      // (5) Snapshot del apoderado principal activo.
      const primary = await tx.studentGuardian.findFirst({
        where: { studentId: input.studentId, isPrimary: true, active: true },
        select: { guardian: { select: { fullName: true, phone: true } } },
      });

      // (5) Recibo + líneas.
      const year = await this.activeYearName(tx);
      const code = await nextCode(tx, `receipt:${year}`, `R-${year}-`, 5);
      const receipt = await tx.receipt.create({
        data: {
          code,
          cashSessionId: session.id,
          studentId: input.studentId,
          guardianName: primary?.guardian.fullName ?? null,
          guardianPhone: primary?.guardian.phone ?? null,
          method: input.method,
          operationNumber: input.operationNumber ?? null,
          totalAmount: new Prisma.Decimal(fromCents(totalCents)),
          receivedAmount,
          changeAmount,
          status: 'EMITIDO',
          cashierId: actorId,
          items: {
            create: [
              ...installmentItems.map((it) => ({
                installmentId: it.installmentId,
                concept: it.concept,
                quantity: 1,
                unitAmount: it.amount,
                amount: it.amount,
              })),
              ...saleItemsData.map((it) => ({
                saleConceptId: it.saleConceptId,
                concept: it.concept,
                quantity: it.quantity,
                unitAmount: it.unitAmount,
                amount: it.amount,
              })),
            ],
          },
        },
        select: { id: true },
      });

      // (6) Marca las cuotas PAGADO y recalcula el estado de las matrículas afectadas.
      if (installmentIds.length > 0) {
        await tx.installment.updateMany({
          where: { id: { in: installmentIds } },
          data: { status: 'PAGADO' },
        });
      }
      await this.recalcEnrollmentStatuses(tx, [...enrollmentIds]);

      // (7) Auditoría.
      await this.audit.log(
        {
          userId: actorId,
          action: 'receipt.create',
          entity: 'Receipt',
          entityId: receipt.id,
          payload: {
            code,
            studentId: input.studentId,
            method: input.method,
            totalAmount: fromCents(totalCents),
            installmentIds,
            saleItems: input.saleItems,
          },
        },
        tx,
      );

      return receipt.id;
    });

    return this.getReceiptDto(this.prisma, receiptId);
  }

  // GET /cashier/receipts/:id — reimpresión.
  async getReceipt(id: string) {
    return this.getReceiptDto(this.prisma, id);
  }

  // POST /cashier/receipts/:id/cancel — anula (solo con la caja del día aún abierta).
  async cancelReceipt(id: string, reason: string, actorId: string) {
    await this.prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          cashSession: { select: { date: true, status: true } },
          items: { select: { installmentId: true } },
        },
      });
      if (!receipt) throw new NotFoundException('Recibo no encontrado');
      if (receipt.status !== 'EMITIDO') {
        throw new ConflictException('El recibo ya está anulado');
      }
      // Solo mientras la caja de ESE día siga abierta (aunque el cierre ocurra pasada
      // la medianoche): cerrada la caja, la corrección va por devolución.
      if (receipt.cashSession.status !== 'ABIERTA') {
        throw new ConflictException(
          'La caja de ese día ya cerró — la corrección va por devolución',
        );
      }

      // Cuotas del recibo → vuelven a su estado por pagar: VENCIDO si ya vencieron, PENDIENTE si no.
      // La mora (lateFeeAmount) permanece en la cuota: reaparece como vencida con su recargo.
      const installmentIds = receipt.items
        .map((i) => i.installmentId)
        .filter((x): x is string => x !== null);
      const enrollmentIds = new Set<string>();
      if (installmentIds.length > 0) {
        const threshold = startOfToday();
        const affected = await tx.installment.findMany({
          where: { id: { in: installmentIds } },
          select: { id: true, enrollmentId: true, dueDate: true },
        });
        const overdueIds: string[] = [];
        const pendingIds: string[] = [];
        for (const a of affected) {
          if (a.enrollmentId) enrollmentIds.add(a.enrollmentId);
          if (a.dueDate < threshold) overdueIds.push(a.id);
          else pendingIds.push(a.id);
        }
        if (overdueIds.length > 0) {
          await tx.installment.updateMany({
            where: { id: { in: overdueIds } },
            data: { status: 'VENCIDO' },
          });
        }
        if (pendingIds.length > 0) {
          await tx.installment.updateMany({
            where: { id: { in: pendingIds } },
            data: { status: 'PENDIENTE' },
          });
        }
      }

      await tx.receipt.update({
        where: { id },
        data: {
          status: 'ANULADO',
          canceledAt: new Date(),
          cancelReason: reason,
          canceledById: actorId,
        },
      });

      await this.recalcEnrollmentStatuses(tx, [...enrollmentIds]);

      await this.audit.log(
        {
          userId: actorId,
          action: 'receipt.cancel',
          entity: 'Receipt',
          entityId: id,
          payload: { reason, restoredInstallments: installmentIds.length },
        },
        tx,
      );
    });

    return this.getReceiptDto(this.prisma, id);
  }

  /**
   * Recalcula Enrollment.status con el mismo criterio del seed/debt.util:
   * PENDIENTE_PAGO si le quedan cuotas vencidas (VENCIDO o PENDIENTE con dueDate < hoy),
   * COMPLETA en caso contrario. No toca matrículas anuladas.
   */
  private async recalcEnrollmentStatuses(tx: Prisma.TransactionClient, enrollmentIds: string[]) {
    if (enrollmentIds.length === 0) return;
    const threshold = startOfToday();
    for (const id of enrollmentIds) {
      const overdue = await tx.installment.count({
        where: {
          enrollmentId: id,
          OR: [{ status: 'VENCIDO' }, { status: 'PENDIENTE', dueDate: { lt: threshold } }],
        },
      });
      await tx.enrollment.update({
        where: { id },
        data: { status: overdue > 0 ? 'PENDIENTE_PAGO' : 'COMPLETA' },
      });
    }
  }
}
