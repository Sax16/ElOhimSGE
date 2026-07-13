import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  fromCents,
  ENROLLMENT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  STUDENT_STATUS_LABELS,
  type CashReportQueryInput,
  type DelinquencyQueryInput,
  type IncomeQueryInput,
  type RosterQueryInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { decimalToCents } from '../common/money.util';
import { todayISO, dateToISO, isoToDate } from '../common/installment-view.util';
import { overdueInstallments } from '../common/overdue.util';
import { CashierService } from '../cashier/cashier.service';
import {
  addSheet,
  ddmmyyyy,
  datetimeText,
  newWorkbook,
  num,
  timeText,
  workbookToBuffer,
  type CellValue,
} from './reports.xlsx';

function fullName(s: {
  firstNames: string;
  paternalLastName: string;
  maternalLastName: string | null;
}): string {
  return [s.firstNames, s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
}

function pct1(numCents: number, denCents: number): number {
  if (denCents <= 0) return 0;
  return Math.round((numCents / denCents) * 1000) / 10;
}

// Rango [start, end) de un mes.
function monthRange(year: number, month: number): { start: Date; end: Date } {
  const start = isoToDate(`${year}-${String(month).padStart(2, '0')}-01`);
  const endYear = month === 12 ? year + 1 : year;
  const endMonth = month === 12 ? 1 : month + 1;
  const end = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);
  return { start, end };
}

// Fila de detalle de un deudor (morosidad · hoja "Detalle").
interface DebtorDetail {
  code: string;
  studentName: string;
  gradeSection: string;
  guardianName: string;
  guardianPhone: string;
  overdueCount: number;
  amountCents: number; // sin mora
  feeCents: number; // mora
  commitmentCode: string | null;
  order: [number, number, string]; // [levelOrder, gradeOrder, nombre] para el orden estable
}

/**
 * Reportes (R2 — E5): morosidad por grado, ingresos por concepto, caja diaria y padrón. Cada
 * reporte expone su vista previa JSON y su exportación .xlsx. Reutiliza la deuda vencida efectiva
 * (overdue.util) y la lógica del historial de cajas (CashierService) — sin duplicar definiciones.
 */
@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cashier: CashierService,
  ) {}

  private async yearOrThrow(yearId: string) {
    const year = await this.prisma.academicYear.findUnique({
      where: { id: yearId },
      select: { id: true, name: true },
    });
    if (!year) throw new NotFoundException('Año académico no encontrado');
    return year;
  }

  // ===================== 1) Morosidad por grado =====================

  // Estructura de grupos del año: Inicial agrupa todas sus aulas; los demás niveles, un grupo por grado.
  private async buildGroups(yearId: string) {
    const levels = await this.prisma.level.findMany({
      where: { academicYearId: yearId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        order: true,
        grades: {
          orderBy: { order: 'asc' },
          select: { id: true, name: true, order: true, sections: { select: { id: true, name: true } } },
        },
      },
    });

    // groupKey → { label, order }.
    const groups = new Map<string, { label: string; order: [number, number] }>();
    // sectionId → { groupKey, gradeSection, levelOrder, gradeOrder }.
    const sectionMap = new Map<
      string,
      { groupKey: string; gradeSection: string; levelOrder: number; gradeOrder: number }
    >();

    for (const level of levels) {
      const isInicial = level.name.toLowerCase() === 'inicial';
      if (isInicial) {
        const key = `L:${level.id}`;
        groups.set(key, { label: level.name, order: [level.order, 0] });
      }
      for (const grade of level.grades) {
        const key = isInicial ? `L:${level.id}` : `G:${grade.id}`;
        if (!isInicial) {
          groups.set(key, { label: `${grade.name} ${level.name}`, order: [level.order, grade.order] });
        }
        for (const section of grade.sections) {
          sectionMap.set(section.id, {
            groupKey: key,
            gradeSection: `${grade.name} ${section.name} ${level.name}`,
            levelOrder: level.order,
            gradeOrder: grade.order,
          });
        }
      }
    }
    return { groups, sectionMap };
  }

  // Mapa studentId → código de compromiso VIGENTE (si tiene alguno cubriendo sus cuotas).
  private async vigenteCommitmentByStudent(): Promise<Map<string, string>> {
    const rows = await this.prisma.commitmentInstallment.findMany({
      where: { commitment: { status: 'VIGENTE' } },
      select: {
        commitment: { select: { code: true } },
        installment: {
          select: {
            enrollment: { select: { studentId: true } },
            programEnrollment: { select: { studentId: true } },
          },
        },
      },
    });
    const map = new Map<string, string>();
    for (const r of rows) {
      const sid =
        r.installment.enrollment?.studentId ?? r.installment.programEnrollment?.studentId;
      if (sid && !map.has(sid)) map.set(sid, r.commitment.code);
    }
    return map;
  }

  // Datos base compartidos por la vista previa y la exportación.
  private async delinquencyData(yearId: string) {
    const { groups, sectionMap } = await this.buildGroups(yearId);

    // Matrículas escolares no anuladas del año → censo de estudiantes por grupo + su placement/apoderado.
    const enrollments = await this.prisma.enrollment.findMany({
      where: { academicYearId: yearId, canceledAt: null },
      select: {
        studentId: true,
        sectionId: true,
        type: true,
        student: {
          select: {
            code: true,
            firstNames: true,
            paternalLastName: true,
            maternalLastName: true,
            dni: true,
            guardians: {
              where: { isPrimary: true, active: true },
              take: 1,
              select: { guardian: { select: { fullName: true, phone: true } } },
            },
          },
        },
      },
    });

    interface StudentInfo {
      studentId: string;
      groupKey: string;
      gradeSection: string;
      levelOrder: number;
      gradeOrder: number;
      code: string;
      studentName: string;
      guardianName: string;
      guardianPhone: string;
    }
    const studentInfo = new Map<string, StudentInfo>();
    const studentsByGroup = new Map<string, number>();
    for (const e of enrollments) {
      const sec = sectionMap.get(e.sectionId);
      if (!sec) continue;
      studentsByGroup.set(sec.groupKey, (studentsByGroup.get(sec.groupKey) ?? 0) + 1);
      studentInfo.set(e.studentId, {
        studentId: e.studentId,
        groupKey: sec.groupKey,
        gradeSection: sec.gradeSection,
        levelOrder: sec.levelOrder,
        gradeOrder: sec.gradeOrder,
        code: e.student.code,
        studentName: fullName(e.student),
        guardianName: e.student.guardians[0]?.guardian.fullName ?? '',
        guardianPhone: e.student.guardians[0]?.guardian.phone ?? '',
      });
    }

    // Deuda vencida efectiva del año (pensiones + matrícula + programas), con mora.
    const overdue = await overdueInstallments(this.prisma, {
      OR: [
        { enrollment: { academicYearId: yearId, canceledAt: null } },
        { programEnrollment: { canceledAt: null, program: { academicYearId: yearId } } },
      ],
    });

    const perStudent = new Map<string, { amountCents: number; feeCents: number; count: number }>();
    for (const o of overdue) {
      const acc = perStudent.get(o.studentId) ?? { amountCents: 0, feeCents: 0, count: 0 };
      acc.amountCents += o.amountCents;
      acc.feeCents += o.feeCents;
      acc.count += 1;
      perStudent.set(o.studentId, acc);
    }

    const commitmentByStudent = await this.vigenteCommitmentByStudent();

    // Agregar por grupo + armar detalle por deudor.
    const groupAgg = new Map<string, { overdueCents: number; debtors: number; count: number }>();
    const details: DebtorDetail[] = [];
    for (const [studentId, acc] of perStudent) {
      const info = studentInfo.get(studentId);
      if (!info) continue; // sin matrícula escolar del año: fuera del censo por grado
      const g = groupAgg.get(info.groupKey) ?? { overdueCents: 0, debtors: 0, count: 0 };
      g.overdueCents += acc.amountCents + acc.feeCents;
      g.debtors += 1;
      g.count += acc.count;
      groupAgg.set(info.groupKey, g);
      details.push({
        code: info.code,
        studentName: info.studentName,
        gradeSection: info.gradeSection,
        guardianName: info.guardianName,
        guardianPhone: info.guardianPhone,
        overdueCount: acc.count,
        amountCents: acc.amountCents,
        feeCents: acc.feeCents,
        commitmentCode: commitmentByStudent.get(studentId) ?? null,
        order: [info.levelOrder, info.gradeOrder, info.studentName],
      });
    }

    // Filas por grupo (todos los grupos, incluso sin deuda), ordenadas.
    const groupRows = [...groups.entries()]
      .map(([key, meta]) => {
        const agg = groupAgg.get(key) ?? { overdueCents: 0, debtors: 0, count: 0 };
        const studentsCount = studentsByGroup.get(key) ?? 0;
        return {
          groupLabel: meta.label,
          studentsCount,
          debtorsCount: agg.debtors,
          rate: pct1(agg.debtors, studentsCount),
          overdueCents: agg.overdueCents,
          count: agg.count,
          order: meta.order,
        };
      })
      .sort((a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1]);

    details.sort(
      (a, b) => a.order[0] - b.order[0] || a.order[1] - b.order[1] || a.order[2].localeCompare(b.order[2]),
    );

    const totalCents = groupRows.reduce((s, g) => s + g.overdueCents, 0);
    const totalCount = groupRows.reduce((s, g) => s + g.count, 0);
    const totalDebtors = groupRows.reduce((s, g) => s + g.debtorsCount, 0);

    return { groupRows, details, totalCents, totalCount, totalDebtors };
  }

  async delinquency(query: DelinquencyQueryInput) {
    await this.yearOrThrow(query.yearId);
    const d = await this.delinquencyData(query.yearId);
    return {
      groups: d.groupRows.map((g) => ({
        groupLabel: g.groupLabel,
        studentsCount: g.studentsCount,
        debtorsCount: g.debtorsCount,
        rate: g.rate,
        overdueAmount: fromCents(g.overdueCents),
      })),
      totalAmount: fromCents(d.totalCents),
      totalCount: d.totalCount,
      totalDebtors: d.totalDebtors,
    };
  }

  async delinquencyExport(query: DelinquencyQueryInput) {
    const year = await this.yearOrThrow(query.yearId);
    const d = await this.delinquencyData(query.yearId);
    const wb = newWorkbook();

    addSheet(
      wb,
      'Resumen por grado',
      [
        { header: 'Nivel / grado', key: 'grupo', width: 22 },
        { header: 'Estudiantes', key: 'est', width: 14 },
        { header: 'Con deuda', key: 'deudores', width: 14 },
        { header: '% morosidad', key: 'rate', width: 14 },
        { header: 'Deuda', key: 'monto', width: 16, money: true },
      ],
      [
        ...d.groupRows.map((g) => ({
          grupo: g.groupLabel,
          est: g.studentsCount,
          deudores: g.debtorsCount,
          rate: g.rate,
          monto: num(fromCents(g.overdueCents)),
        })),
        {
          grupo: 'TOTAL',
          est: d.groupRows.reduce((s, g) => s + g.studentsCount, 0),
          deudores: d.totalDebtors,
          rate: '',
          monto: num(fromCents(d.totalCents)),
        },
      ],
    );

    addSheet(
      wb,
      'Detalle',
      [
        { header: 'Código', key: 'code', width: 12 },
        { header: 'Estudiante', key: 'name', width: 28 },
        { header: 'Grado / sección', key: 'grade', width: 22 },
        { header: 'Apoderado principal', key: 'guardian', width: 26 },
        { header: 'Teléfono', key: 'phone', width: 14 },
        { header: 'Cuotas vencidas', key: 'count', width: 16 },
        { header: 'Deuda sin mora', key: 'amount', width: 16, money: true },
        { header: 'Mora', key: 'fee', width: 12, money: true },
        { header: 'Total', key: 'total', width: 16, money: true },
        { header: 'Compromiso vigente', key: 'commitment', width: 18 },
      ],
      d.details.map((r) => ({
        code: r.code,
        name: r.studentName,
        grade: r.gradeSection,
        guardian: r.guardianName,
        phone: r.guardianPhone,
        count: r.overdueCount,
        amount: num(fromCents(r.amountCents)),
        fee: num(fromCents(r.feeCents)),
        total: num(fromCents(r.amountCents + r.feeCents)),
        commitment: r.commitmentCode ?? '',
      })),
    );

    return { buffer: await workbookToBuffer(wb), filename: `morosidad-${year.name}.xlsx` };
  }

  // ===================== 2) Ingresos por concepto =====================

  private incomeRange(query: IncomeQueryInput): { start: Date; end: Date } {
    if (query.month) return monthRange(query.year, query.month);
    return { start: isoToDate(`${query.year}-01-01`), end: isoToDate(`${query.year + 1}-01-01`) };
  }

  private async incomeData(query: IncomeQueryInput) {
    const { start, end } = this.incomeRange(query);

    const receipts = await this.prisma.receipt.findMany({
      where: { createdAt: { gte: start, lt: end } },
      orderBy: { createdAt: 'asc' },
      select: {
        code: true,
        createdAt: true,
        method: true,
        status: true,
        totalAmount: true,
        cashier: { select: { fullName: true } },
        student: {
          select: { firstNames: true, paternalLastName: true, maternalLastName: true },
        },
        items: {
          select: {
            concept: true,
            amount: true,
            saleConceptId: true,
            installment: { select: { type: true, enrollmentId: true } },
          },
        },
      },
    });

    const conceptCents = {
      Matrículas: { amount: 0, count: 0 },
      Pensiones: { amount: 0, count: 0 },
      Programas: { amount: 0, count: 0 },
      Ventas: { amount: 0, count: 0 },
      'Otros ingresos': { amount: 0, count: 0 },
    };
    const methodMap = new Map<string, { amount: number; count: number }>();

    for (const r of receipts) {
      if (r.status !== 'EMITIDO') continue;
      const m = methodMap.get(r.method) ?? { amount: 0, count: 0 };
      m.amount += decimalToCents(r.totalAmount);
      m.count += 1;
      methodMap.set(r.method, m);
      for (const it of r.items) {
        const cents = decimalToCents(it.amount);
        if (it.saleConceptId) {
          conceptCents.Ventas.amount += cents;
          conceptCents.Ventas.count += 1;
        } else if (it.installment?.enrollmentId) {
          if (it.installment.type === 'MATRICULA') {
            conceptCents.Matrículas.amount += cents;
            conceptCents.Matrículas.count += 1;
          } else {
            conceptCents.Pensiones.amount += cents;
            conceptCents.Pensiones.count += 1;
          }
        } else {
          conceptCents.Programas.amount += cents;
          conceptCents.Programas.count += 1;
        }
      }
    }

    // Otros ingresos (tesorería INGRESO ACTIVO) por periodo (por fecha del movimiento).
    const incomes = await this.prisma.treasuryMovement.findMany({
      where: { kind: 'INGRESO', canceledAt: null, date: { gte: start, lt: end } },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      select: {
        code: true,
        date: true,
        description: true,
        method: true,
        amount: true,
        category: { select: { name: true } },
        registeredBy: { select: { fullName: true } },
      },
    });
    for (const inc of incomes) {
      const cents = decimalToCents(inc.amount);
      conceptCents['Otros ingresos'].amount += cents;
      conceptCents['Otros ingresos'].count += 1;
      const m = methodMap.get(inc.method) ?? { amount: 0, count: 0 };
      m.amount += cents;
      m.count += 1;
      methodMap.set(inc.method, m);
    }

    // Devoluciones DEVUELTA del periodo (por fecha de ejecución) → concepto negativo.
    const refunds = await this.prisma.refund.findMany({
      where: { status: 'DEVUELTA', executedAt: { gte: start, lt: end } },
      select: { amount: true },
    });
    let refundCents = 0;
    for (const rf of refunds) refundCents += decimalToCents(rf.amount);

    const byConcept = Object.entries(conceptCents).map(([concept, v]) => ({
      concept,
      amount: fromCents(v.amount),
      count: v.count,
    }));
    if (refunds.length > 0) {
      byConcept.push({ concept: 'Devoluciones', amount: fromCents(-refundCents), count: refunds.length });
    }

    const byMethod = [...methodMap.entries()].map(([method, v]) => ({
      method,
      amount: fromCents(v.amount),
      count: v.count,
    }));

    const totalCents =
      Object.values(conceptCents).reduce((s, v) => s + v.amount, 0) - refundCents;

    return { byConcept, byMethod, incomes, receipts, totalCents };
  }

  async income(query: IncomeQueryInput) {
    const d = await this.incomeData(query);
    return { byConcept: d.byConcept, byMethod: d.byMethod, total: fromCents(d.totalCents) };
  }

  async incomeExport(query: IncomeQueryInput) {
    const d = await this.incomeData(query);
    const wb = newWorkbook();

    // Hoja "Resumen": concepto y método en una sola tabla.
    const resumenRows: Record<string, CellValue>[] = [
      ...d.byConcept.map((c) => ({
        seccion: 'Concepto',
        detalle: c.concept,
        monto: num(c.amount),
        ops: c.count,
      })),
      ...d.byMethod.map((m) => ({
        seccion: 'Método',
        detalle: PAYMENT_METHOD_LABELS[m.method as keyof typeof PAYMENT_METHOD_LABELS] ?? m.method,
        monto: num(m.amount),
        ops: m.count,
      })),
      { seccion: 'TOTAL', detalle: '', monto: num(fromCents(d.totalCents)), ops: '' },
    ];
    addSheet(
      wb,
      'Resumen',
      [
        { header: 'Sección', key: 'seccion', width: 14 },
        { header: 'Detalle', key: 'detalle', width: 22 },
        { header: 'Monto', key: 'monto', width: 16, money: true },
        { header: 'Operaciones', key: 'ops', width: 14 },
      ],
      resumenRows,
    );

    // Hoja "Recibos".
    addSheet(
      wb,
      'Recibos',
      [
        { header: 'Código', key: 'code', width: 16 },
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Estudiante', key: 'student', width: 28 },
        { header: 'Conceptos', key: 'concepts', width: 34 },
        { header: 'Método', key: 'method', width: 16 },
        { header: 'Monto', key: 'amount', width: 14, money: true },
        { header: 'Estado', key: 'status', width: 12 },
        { header: 'Cobró', key: 'cashier', width: 24 },
      ],
      d.receipts.map((r) => ({
        code: r.code,
        date: datetimeText(r.createdAt.toISOString()),
        student: fullName(r.student),
        concepts: r.items.map((i) => i.concept).join(' + '),
        method: PAYMENT_METHOD_LABELS[r.method as keyof typeof PAYMENT_METHOD_LABELS] ?? r.method,
        amount: num(r.totalAmount.toFixed(2)),
        status: r.status === 'EMITIDO' ? 'Emitido' : 'Anulado',
        cashier: r.cashier.fullName,
      })),
    );

    // Hoja "Otros ingresos".
    addSheet(
      wb,
      'Otros ingresos',
      [
        { header: 'Código', key: 'code', width: 12 },
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Categoría', key: 'category', width: 22 },
        { header: 'Descripción', key: 'description', width: 34 },
        { header: 'Método', key: 'method', width: 16 },
        { header: 'Monto', key: 'amount', width: 14, money: true },
        { header: 'Registró', key: 'registered', width: 24 },
      ],
      d.incomes.map((i) => ({
        code: i.code,
        date: ddmmyyyy(dateToISO(i.date)),
        category: i.category.name,
        description: i.description,
        method: PAYMENT_METHOD_LABELS[i.method as keyof typeof PAYMENT_METHOD_LABELS] ?? i.method,
        amount: num(i.amount.toFixed(2)),
        registered: i.registeredBy.fullName,
      })),
    );

    const suffix = query.month ? `${query.year}-${String(query.month).padStart(2, '0')}` : `${query.year}`;
    return { buffer: await workbookToBuffer(wb), filename: `ingresos-${suffix}.xlsx` };
  }

  // ===================== 3) Caja diaria =====================

  private resolveCashRange(query: CashReportQueryInput): { from: string; to: string } {
    const today = todayISO();
    const firstOfMonth = `${today.slice(0, 7)}-01`;
    return { from: query.from ?? firstOfMonth, to: query.to ?? today };
  }

  async cash(query: CashReportQueryInput) {
    const { from, to } = this.resolveCashRange(query);
    const data = await this.cashier.reportData(isoToDate(from), isoToDate(to));
    return { sessions: data.sessions, totals: data.totals };
  }

  async cashExport(query: CashReportQueryInput) {
    const { from, to } = this.resolveCashRange(query);
    const data = await this.cashier.reportData(isoToDate(from), isoToDate(to));
    const wb = newWorkbook();

    addSheet(
      wb,
      'Arqueos',
      [
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Abrió', key: 'opened', width: 22 },
        { header: 'Cerró', key: 'closed', width: 22 },
        { header: 'Inicial', key: 'initial', width: 14, money: true },
        { header: 'Cobros efectivo', key: 'cash', width: 16, money: true },
        { header: 'Digital', key: 'digital', width: 14, money: true },
        { header: 'Otros ingresos', key: 'other', width: 16, money: true },
        { header: 'Devoluciones', key: 'refunds', width: 16, money: true },
        { header: 'Reposición', key: 'petty', width: 14, money: true },
        { header: 'Esperado', key: 'expected', width: 14, money: true },
        { header: 'Contado', key: 'counted', width: 14, money: true },
        { header: 'Diferencia', key: 'difference', width: 14, money: true },
        { header: 'Observaciones', key: 'notes', width: 30 },
      ],
      data.sessions.map((s) => ({
        date: ddmmyyyy(s.date),
        opened: s.openedByName,
        closed: s.closedByName ?? '',
        initial: num(s.initialAmount),
        cash: num(s.cashAmount),
        digital: num(s.digitalAmount),
        other: num(s.otherIncomeCashAmount),
        refunds: num(s.refundsCashAmount),
        petty: num(s.pettyCashOutAmount),
        expected: s.expectedCash === null ? '' : num(s.expectedCash),
        counted: s.countedCash === null ? '' : num(s.countedCash),
        difference: s.difference === null ? '' : num(s.difference),
        notes: s.closeNotes ?? '',
      })),
    );

    const kindLabel: Record<string, string> = {
      COBRO: 'Cobro',
      DEVOLUCION: 'Devolución',
      INGRESO: 'Ingreso',
      CAJA_CHICA: 'Caja chica',
    };
    addSheet(
      wb,
      'Movimientos',
      [
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Hora', key: 'time', width: 10 },
        { header: 'Tipo', key: 'kind', width: 14 },
        { header: 'Código', key: 'code', width: 16 },
        { header: 'Estudiante', key: 'student', width: 26 },
        { header: 'Concepto', key: 'concept', width: 30 },
        { header: 'Método', key: 'method', width: 16 },
        { header: 'Monto', key: 'amount', width: 14, money: true },
        { header: 'Registró', key: 'cashier', width: 24 },
        { header: 'Estado', key: 'status', width: 12 },
      ],
      data.movements.map((m) => ({
        date: ddmmyyyy(m.sessionDate),
        time: timeText(m.createdAt),
        kind: kindLabel[m.kind] ?? m.kind,
        code: m.code,
        student: m.studentName,
        concept: m.summary,
        method: PAYMENT_METHOD_LABELS[m.method as keyof typeof PAYMENT_METHOD_LABELS] ?? m.method,
        amount: num(m.totalAmount),
        cashier: m.cashierName ?? '',
        status: m.status,
      })),
    );

    return { buffer: await workbookToBuffer(wb), filename: `caja-${from}_${to}.xlsx` };
  }

  // ===================== 4) Padrón de estudiantes =====================

  private async rosterData(query: RosterQueryInput) {
    const year = await this.yearOrThrow(query.yearId);
    const where: Prisma.EnrollmentWhereInput = {
      academicYearId: query.yearId,
      canceledAt: null,
    };
    if (query.levelId) {
      where.section = { gradeLevel: { levelId: query.levelId } };
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where,
      select: {
        type: true,
        section: {
          select: {
            name: true,
            gradeLevel: {
              select: {
                name: true,
                order: true,
                level: { select: { name: true, order: true } },
              },
            },
          },
        },
        student: {
          select: {
            code: true,
            firstNames: true,
            paternalLastName: true,
            maternalLastName: true,
            dni: true,
            status: true,
            guardians: {
              where: { isPrimary: true, active: true },
              take: 1,
              select: {
                guardian: { select: { fullName: true, dni: true, phone: true, email: true } },
              },
            },
          },
        },
      },
    });

    const rows = enrollments
      .map((e) => {
        const g = e.section.gradeLevel;
        const guardian = e.student.guardians[0]?.guardian ?? null;
        return {
          levelOrder: g.level.order,
          gradeOrder: g.order,
          sectionName: e.section.name,
          paternal: e.student.paternalLastName,
          code: e.student.code,
          fullName: fullName(e.student),
          dni: e.student.dni,
          gradeSection: `${g.name} ${e.section.name} ${g.level.name}`,
          status: STUDENT_STATUS_LABELS[e.student.status],
          enrollmentType: ENROLLMENT_TYPE_LABELS[e.type],
          guardianName: guardian?.fullName ?? '',
          guardianDni: guardian?.dni ?? '',
          guardianPhone: guardian?.phone ?? '',
          guardianEmail: guardian?.email ?? '',
        };
      })
      .sort(
        (a, b) =>
          a.levelOrder - b.levelOrder ||
          a.gradeOrder - b.gradeOrder ||
          a.sectionName.localeCompare(b.sectionName) ||
          a.paternal.localeCompare(b.paternal),
      );

    return { year, rows };
  }

  async roster(query: RosterQueryInput) {
    const { rows } = await this.rosterData(query);
    return {
      rows: rows.map((r) => ({
        code: r.code,
        fullName: r.fullName,
        dni: r.dni,
        gradeSection: r.gradeSection,
        status: r.status,
        enrollmentType: r.enrollmentType,
        guardianName: r.guardianName,
        guardianDni: r.guardianDni,
        guardianPhone: r.guardianPhone,
        guardianEmail: r.guardianEmail,
      })),
      total: rows.length,
    };
  }

  async rosterExport(query: RosterQueryInput) {
    const { year, rows } = await this.rosterData(query);
    const wb = newWorkbook();
    addSheet(
      wb,
      'Padrón',
      [
        { header: 'Código', key: 'code', width: 12 },
        { header: 'Estudiante', key: 'name', width: 30 },
        { header: 'DNI', key: 'dni', width: 12 },
        { header: 'Grado / sección', key: 'grade', width: 22 },
        { header: 'Estado', key: 'status', width: 14 },
        { header: 'Matrícula', key: 'type', width: 14 },
        { header: 'Apoderado principal', key: 'guardian', width: 28 },
        { header: 'DNI apoderado', key: 'gdni', width: 14 },
        { header: 'Teléfono', key: 'gphone', width: 14 },
        { header: 'Correo', key: 'gemail', width: 26 },
      ],
      rows.map((r) => ({
        code: r.code,
        name: r.fullName,
        dni: r.dni,
        grade: r.gradeSection,
        status: r.status,
        type: r.enrollmentType,
        guardian: r.guardianName,
        gdni: r.guardianDni,
        gphone: r.guardianPhone,
        gemail: r.guardianEmail,
      })),
    );
    return { buffer: await workbookToBuffer(wb), filename: `padron-${year.name}.xlsx` };
  }
}
