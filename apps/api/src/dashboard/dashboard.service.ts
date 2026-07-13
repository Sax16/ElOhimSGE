import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { fromCents } from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { decimalToCents } from '../common/money.util';
import { todayISO, dateToISO, isoToDate } from '../common/installment-view.util';
import { overdueInstallments } from '../common/overdue.util';
import { PensionesService } from '../billing/pensiones.service';

// Frontera de dinero: Prisma.Decimal → "0.00".
function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

function fullName(s: {
  firstNames: string;
  paternalLastName: string;
  maternalLastName: string | null;
}): string {
  return [s.firstNames, s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
}

function firstNameOf(s: { firstNames: string }): string {
  return s.firstNames.split(/\s+/)[0] ?? s.firstNames;
}

// Placement "3° B Primaria" a partir de la matrícula escolar activa.
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

// pct a 1 decimal.
function pct1(numCents: number, denCents: number): number {
  if (denCents <= 0) return 0;
  return Math.round((numCents / denCents) * 1000) / 10;
}

/**
 * Dashboard económico (R2 — E5): reemplaza el resumen mínimo de R1 con datos reales de dinero
 * (cobranza del mes, morosidad efectiva, caja de hoy, últimos movimientos, principales deudores).
 * Reutiliza la definición de morosidad de Pensiones (E2) y la de deuda efectiva (overdue.util) —
 * sin duplicar la fecha efectiva de compromisos.
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pensiones: PensionesService,
  ) {}

  private monthRange(year: number, month: number): { start: Date; end: Date } {
    const start = isoToDate(`${year}-${String(month).padStart(2, '0')}-01`);
    const endYear = month === 12 ? year + 1 : year;
    const endMonth = month === 12 ? 1 : month + 1;
    const end = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);
    return { start, end };
  }

  // GET /dashboard/summary?yearId — año dado o el activo.
  async summary(yearId?: string) {
    const year = yearId
      ? await this.prisma.academicYear.findUnique({
          where: { id: yearId },
          select: { id: true, name: true },
        })
      : await this.prisma.academicYear.findFirst({
          where: { status: 'ACTIVO' },
          select: { id: true, name: true },
        });
    if (!year) throw new NotFoundException('Año académico no encontrado');

    const today = todayISO();
    const nowYear = Number(today.slice(0, 4));
    const nowMonth = Number(today.slice(5, 7));

    const [
      students,
      monthCollected,
      overdue,
      todayCash,
      collection,
      recentReceipts,
      recentExpenses,
      topDebtors,
    ] = await Promise.all([
      this.students(year.id, year.name),
      this.monthCollected(nowYear, nowMonth),
      this.overdue(year.id),
      this.todayCash(),
      this.collection(year.id, nowMonth),
      this.recentReceipts(),
      this.recentExpenses(),
      this.topDebtors(year.id),
    ]);

    return {
      students,
      monthCollected,
      overdue,
      todayCash,
      collectionGoal: collection.goal,
      collectionByLevel: collection.byLevel,
      recentReceipts,
      recentExpenses,
      topDebtors,
    };
  }

  // Matrículas activas del año + variación % vs. año anterior (si hay datos).
  private async students(yearId: string, yearName: string) {
    const active = await this.prisma.enrollment.count({
      where: { academicYearId: yearId, canceledAt: null },
    });
    const prevYear = await this.prisma.academicYear.findUnique({
      where: { name: String(Number(yearName) - 1) },
      select: { id: true },
    });
    let deltaPct: string | null = null;
    if (prevYear) {
      const prev = await this.prisma.enrollment.count({
        where: { academicYearId: prevYear.id, canceledAt: null },
      });
      if (prev > 0) deltaPct = (Math.round(((active - prev) / prev) * 1000) / 10).toFixed(1);
    }
    return { active, deltaPct };
  }

  // Cobrado del mes calendario actual: Σ recibos EMITIDO − Σ devoluciones DEVUELTA del mes.
  private async monthCollected(year: number, month: number) {
    const { start, end } = this.monthRange(year, month);
    const receipts = await this.prisma.receipt.findMany({
      where: { status: 'EMITIDO', createdAt: { gte: start, lt: end } },
      select: { totalAmount: true },
    });
    let cents = 0;
    for (const r of receipts) cents += decimalToCents(r.totalAmount);
    const refunds = await this.prisma.refund.findMany({
      where: { status: 'DEVUELTA', executedAt: { gte: start, lt: end } },
      select: { amount: true },
    });
    for (const r of refunds) cents -= decimalToCents(r.amount);
    return { amount: fromCents(cents), count: receipts.length, month };
  }

  // Morosidad efectiva acumulada del año (pensiones escolares): misma definición que Pensiones E2.
  private async overdue(yearId: string) {
    const stats = await this.pensiones.stats(yearId);
    return { amount: stats.overdueAmount, count: stats.overdueCount, rate: stats.overdueRate };
  }

  // Caja de HOY (estado + cobrado hoy). Sin caja del día → sessionStatus null (sin abrir).
  private async todayCash() {
    const session = await this.prisma.cashSession.findUnique({
      where: { date: isoToDate(todayISO()) },
      select: { id: true, status: true },
    });
    if (!session) {
      return { sessionStatus: null as null, collectedToday: '0.00', operationsCount: 0 };
    }
    const receipts = await this.prisma.receipt.findMany({
      where: { cashSessionId: session.id, status: 'EMITIDO' },
      select: { totalAmount: true },
    });
    let cents = 0;
    for (const r of receipts) cents += decimalToCents(r.totalAmount);
    return {
      sessionStatus: session.status,
      collectedToday: fromCents(cents),
      operationsCount: receipts.length,
    };
  }

  // Meta de cobranza del mes (pensiones escolares con dueDate en el mes actual) global y por nivel,
  // + fila 'Programas' (cuotas de programa del mes). expected = Σ (amount + mora) de no
  // anuladas/exoneradas; collected = Σ de las PAGADO.
  private async collection(yearId: string, month: number) {
    const yearRow = await this.prisma.academicYear.findUnique({
      where: { id: yearId },
      select: { name: true },
    });
    const yearNum = Number(yearRow?.name ?? new Date().getFullYear());
    const { start, end } = this.monthRange(yearNum, month);

    // Niveles del año (orden de presentación).
    const levels = await this.prisma.level.findMany({
      where: { academicYearId: yearId },
      orderBy: { order: 'asc' },
      select: { id: true, name: true },
    });
    const levelExpected = new Map<string, number>();
    const levelCollected = new Map<string, number>();
    for (const l of levels) {
      levelExpected.set(l.id, 0);
      levelCollected.set(l.id, 0);
    }

    // Pensiones escolares del mes (no anuladas/exoneradas) con su nivel.
    const school = await this.prisma.installment.findMany({
      where: {
        type: 'PENSION',
        status: { notIn: ['ANULADO', 'EXONERADO'] },
        dueDate: { gte: start, lt: end },
        // La cuota manda: una matrícula anulada dejó sus cuotas en ANULADO (excluidas por estado);
        // la pensión exigible de un retirado sí cuenta en la meta del mes.
        enrollment: { academicYearId: yearId },
      },
      select: {
        amount: true,
        lateFeeAmount: true,
        status: true,
        enrollment: {
          select: { section: { select: { gradeLevel: { select: { levelId: true } } } } },
        },
      },
    });

    let goalExpected = 0;
    let goalCollected = 0;
    for (const i of school) {
      const total = decimalToCents(i.amount) + decimalToCents(i.lateFeeAmount);
      const levelId = i.enrollment?.section.gradeLevel.levelId;
      goalExpected += total;
      levelExpected.set(levelId!, (levelExpected.get(levelId!) ?? 0) + total);
      if (i.status === 'PAGADO') {
        goalCollected += total;
        levelCollected.set(levelId!, (levelCollected.get(levelId!) ?? 0) + total);
      }
    }

    // Cuotas de programa del mes (no anuladas/exoneradas).
    const programs = await this.prisma.installment.findMany({
      where: {
        status: { notIn: ['ANULADO', 'EXONERADO'] },
        dueDate: { gte: start, lt: end },
        programEnrollment: { program: { academicYearId: yearId } },
      },
      select: { amount: true, lateFeeAmount: true, status: true },
    });
    let progExpected = 0;
    let progCollected = 0;
    for (const i of programs) {
      const total = decimalToCents(i.amount) + decimalToCents(i.lateFeeAmount);
      progExpected += total;
      if (i.status === 'PAGADO') progCollected += total;
    }

    const byLevel = levels.map((l) => {
      const exp = levelExpected.get(l.id) ?? 0;
      const col = levelCollected.get(l.id) ?? 0;
      return { label: l.name, expected: fromCents(exp), collected: fromCents(col), pct: pct1(col, exp) };
    });
    byLevel.push({
      label: 'Programas',
      expected: fromCents(progExpected),
      collected: fromCents(progCollected),
      pct: pct1(progCollected, progExpected),
    });

    return {
      goal: {
        expected: fromCents(goalExpected),
        collected: fromCents(goalCollected),
        pct: pct1(goalCollected, goalExpected),
      },
      byLevel,
    };
  }

  // Últimos 5 recibos emitidos.
  private async recentReceipts() {
    const rows = await this.prisma.receipt.findMany({
      where: { status: 'EMITIDO' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        code: true,
        createdAt: true,
        method: true,
        status: true,
        totalAmount: true,
        student: {
          select: {
            firstNames: true,
            paternalLastName: true,
            maternalLastName: true,
            enrollments: {
              where: { canceledAt: null, academicYear: { status: 'ACTIVO' } },
              take: 1,
              select: placementSelect,
            },
          },
        },
        items: { select: { concept: true, quantity: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      studentName: fullName(r.student),
      gradeSection: gradeSection(r.student.enrollments[0]),
      summary: r.items
        .map((i) => (i.quantity > 1 ? `${i.concept} ×${i.quantity}` : i.concept))
        .join(' + '),
      createdAt: r.createdAt.toISOString(),
      totalAmount: money(r.totalAmount),
      method: r.method,
      status: r.status,
    }));
  }

  // Últimos 5 gastos ACTIVO de tesorería.
  private async recentExpenses() {
    const rows = await this.prisma.treasuryMovement.findMany({
      where: { kind: 'GASTO', canceledAt: null },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        code: true,
        date: true,
        description: true,
        amount: true,
        category: { select: { name: true } },
      },
    });
    return rows.map((m) => ({
      id: m.id,
      code: m.code,
      date: dateToISO(m.date),
      description: m.description,
      categoryName: m.category.name,
      amount: money(m.amount),
    }));
  }

  // Top 5 familias por deuda vencida efectiva (agrupadas por apoderado principal). Excluye cuotas
  // congeladas por un compromiso VIGENTE (via overdue.util). amount con mora.
  private async topDebtors(yearId: string) {
    const overdue = await overdueInstallments(this.prisma, {
      // Incluye la deuda vencida de retirados/trasladados (la cuota manda, no la matrícula viva).
      OR: [
        { enrollment: { academicYearId: yearId } },
        { programEnrollment: { program: { academicYearId: yearId } } },
      ],
    });
    if (overdue.length === 0) return [];

    // Agregar por estudiante.
    const perStudent = new Map<string, { cents: number; count: number }>();
    for (const o of overdue) {
      const acc = perStudent.get(o.studentId) ?? { cents: 0, count: 0 };
      acc.cents += o.amountCents + o.feeCents;
      acc.count += 1;
      perStudent.set(o.studentId, acc);
    }

    // Apoderado principal de cada estudiante deudor.
    const links = await this.prisma.studentGuardian.findMany({
      where: { studentId: { in: [...perStudent.keys()], }, isPrimary: true, active: true },
      select: {
        guardianId: true,
        guardian: { select: { fullName: true, phone: true } },
        student: { select: { id: true, firstNames: true } },
      },
    });

    type Fam = {
      guardianId: string;
      guardianName: string;
      phone: string;
      cents: number;
      count: number;
      children: { firstNames: string }[];
    };
    const fams = new Map<string, Fam>();
    for (const l of links) {
      const acc = perStudent.get(l.student.id);
      if (!acc) continue;
      const fam =
        fams.get(l.guardianId) ??
        ({
          guardianId: l.guardianId,
          guardianName: l.guardian.fullName,
          phone: l.guardian.phone,
          cents: 0,
          count: 0,
          children: [],
        } satisfies Fam);
      fam.cents += acc.cents;
      fam.count += acc.count;
      fam.children.push({ firstNames: l.student.firstNames });
      fams.set(l.guardianId, fam);
    }

    return [...fams.values()]
      .sort((a, b) => b.cents - a.cents)
      .slice(0, 5)
      .map((f) => ({
        guardianId: f.guardianId,
        guardianName: f.guardianName,
        childrenLabel: f.children.map((c) => firstNameOf(c)).join(', '),
        overdueCount: f.count,
        amount: fromCents(f.cents),
        phone: f.phone,
      }));
  }
}
