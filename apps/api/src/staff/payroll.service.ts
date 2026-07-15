import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  EMPLOYMENT_TYPE_ABBR,
  STAFF_ROLE_LABELS,
  computeEssaludCents,
  computeNetCents,
  computePensionContributions,
  fromCents,
  type PayrollGrossUpdateInput,
  type PayrollItemCreateInput,
  type PayrollPayInput,
  type PensionSchemeInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { decimalToCents } from '../common/money.util';
import { dateToISO, isoToDate } from '../common/installment-view.util';
import { limaTodayISO } from '../common/lima-time.util';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { buildPayrollWorkbook } from './payroll.xlsx';

type DbClient = Prisma.TransactionClient | PrismaService;

// Categoría de tesorería destino del gasto de planilla (se crea si el seed no la tiene).
const PAYROLL_CATEGORY = 'Planilla y personal';

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

function monthLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

// Estados de empleado que entran a planilla (INACTIVO no entra).
const PAYROLL_STAFF_STATUSES = ['ACTIVO', 'LICENCIA'] as const;

// Snapshot de la ficha necesario para generar/sincronizar una fila de planilla.
const payrollStaffSelect = {
  id: true,
  code: true,
  fullName: true,
  role: true,
  employmentType: true,
  status: true,
  baseSalary: true,
  pensionScheme: {
    select: {
      name: true,
      kind: true,
      onpRatePct: true,
      fundRatePct: true,
      commissionRatePct: true,
      insuranceRatePct: true,
    },
  },
} satisfies Prisma.StaffSelect;

type PayrollStaff = Prisma.StaffGetPayload<{ select: typeof payrollStaffSelect }>;

const entryInclude = {
  items: {
    orderBy: { createdAt: 'asc' },
    include: { canceledBy: { select: { fullName: true } } },
  },
  batch: { select: { code: true } },
  paidBy: { select: { fullName: true } },
} satisfies Prisma.PayrollEntryInclude;

type EntryRow = Prisma.PayrollEntryGetPayload<{ include: typeof entryInclude }>;

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ===== Helpers de cálculo (frontera Decimal ↔ centavos ↔ funciones puras de shared) =====

  private schemeInput(entry: {
    schemeKind: 'ONP' | 'AFP';
    schemeName: string;
    onpRatePct: Prisma.Decimal | null;
    fundRatePct: Prisma.Decimal | null;
    commissionRatePct: Prisma.Decimal | null;
    insuranceRatePct: Prisma.Decimal | null;
  }): PensionSchemeInput {
    if (entry.schemeKind === 'ONP') {
      return { kind: 'ONP', onpRatePct: Number(entry.onpRatePct ?? 0) };
    }
    return {
      kind: 'AFP',
      name: entry.schemeName,
      fundRatePct: Number(entry.fundRatePct ?? 0),
      commissionRatePct: Number(entry.commissionRatePct ?? 0),
      insuranceRatePct: Number(entry.insuranceRatePct ?? 0),
    };
  }

  // Deriva aportes / descuentos / neto / EsSalud de una fila (nada se guarda: se calcula al vuelo).
  private computeMoney(entry: EntryRow, essaludRatePct: number) {
    const grossCents = decimalToCents(entry.grossAmount);
    const contrib = computePensionContributions(grossCents, this.schemeInput(entry));
    // Descuentos: solo ítems APLICADO suman al total (los ANULADO quedan como evidencia).
    let discountTotalCents = 0;
    for (const it of entry.items) {
      if (it.status === 'APLICADO') discountTotalCents += decimalToCents(it.amount);
    }
    const netCents = computeNetCents(grossCents, contrib.totalCents, discountTotalCents);
    const essaludCents = computeEssaludCents(grossCents, essaludRatePct);
    return { grossCents, contrib, discountTotalCents, netCents, essaludCents };
  }

  // ===== DTO =====

  private toDto(entry: EntryRow, essaludRatePct: number) {
    const m = this.computeMoney(entry, essaludRatePct);
    const grossEditable = entry.employmentType === 'POR_HORAS' && entry.status === 'PENDIENTE';
    return {
      id: entry.id,
      staffId: entry.staffId,
      staffCode: entry.staffCode,
      staffName: entry.staffName,
      position: entry.position,
      employmentType: entry.employmentType,
      schemeName: entry.schemeName,
      schemeKind: entry.schemeKind,
      grossAmount: entry.grossAmount.toFixed(2),
      grossEditable,
      grossEdited: entry.grossEdited,
      lateCount: entry.lateCount,
      items: entry.items.map((it) => ({
        id: it.id,
        kind: it.kind,
        auto: it.auto,
        detail: it.detail,
        amount: it.amount.toFixed(2),
        status: it.status,
        cancelReason: it.cancelReason,
        canceledByName: it.canceledBy?.fullName ?? null,
      })),
      contribItems: m.contrib.items.map((c) => ({
        concept: c.concept,
        amount: fromCents(c.amountCents),
      })),
      contribTotal: fromCents(m.contrib.totalCents),
      discountTotal: fromCents(m.discountTotalCents),
      netAmount: fromCents(m.netCents),
      essaludAmount: fromCents(m.essaludCents),
      status: entry.status,
      paidAt: entry.paidAt ? entry.paidAt.toISOString() : null,
      paymentMethod: entry.paymentMethod,
      operationNumber: entry.operationNumber,
      paidByName: entry.paidBy?.fullName ?? null,
      batchCode: entry.batch?.code ?? null,
    };
  }

  // ===== Rango del periodo de conteo de tardanzas =====

  // Rango [start, end) del mes calendario (fechas Lima → columnas @db.Date).
  private monthRange(year: number, month: number): { start: Date; end: Date } {
    const start = isoToDate(`${year}-${String(month).padStart(2, '0')}-01`);
    const endYear = month === 12 ? year + 1 : year;
    const endMonth = month === 12 ? 1 : month + 1;
    const end = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);
    return { start, end };
  }

  // Día 15 del mes de la planilla (marca representativa para ubicar el bimestre académico).
  private midMonth(year: number, month: number): Date {
    return isoToDate(`${year}-${String(month).padStart(2, '0')}-15`);
  }

  /**
   * Rango de conteo de tardanzas según la regla (MarkingSettings.countPeriod):
   * - MES: mes calendario del periodo.
   * - BIMESTRE: el Period del año académico ACTIVO cuyo rango contiene el día 15 del mes; si no
   *   hay (año sin bimestres o fuera de rango), cae al mes calendario.
   * Además devuelve los meses (year,month) que abarca el bimestre para no duplicar el ítem auto.
   */
  private async countRange(
    year: number,
    month: number,
    countPeriod: 'MES' | 'BIMESTRE',
  ): Promise<{ startInclusive: Date; endInclusive: Date; bimonthMonths: Array<{ year: number; month: number }> }> {
    const monthR = this.monthRange(year, month);
    const monthResult = {
      startInclusive: monthR.start,
      // fin inclusivo del mes = último día (end es el 1° del mes siguiente → menos un día).
      endInclusive: new Date(monthR.end.getTime() - 24 * 3600 * 1000),
      bimonthMonths: [{ year, month }],
    };
    if (countPeriod !== 'BIMESTRE') return monthResult;

    const mid = this.midMonth(year, month);
    const period = await this.prisma.period.findFirst({
      where: {
        academicYear: { status: 'ACTIVO' as const },
        startDate: { lte: mid },
        endDate: { gte: mid },
      },
      select: { startDate: true, endDate: true },
    });
    if (!period) return monthResult;

    // Meses cuyo día 15 cae dentro del bimestre (típicamente 2).
    const bimonthMonths: Array<{ year: number; month: number }> = [];
    let cursorY = period.startDate.getUTCFullYear();
    let cursorM = period.startDate.getUTCMonth() + 1;
    const guard = 6;
    for (let i = 0; i < guard; i++) {
      const cMid = this.midMonth(cursorY, cursorM);
      if (cMid >= period.startDate && cMid <= period.endDate) {
        bimonthMonths.push({ year: cursorY, month: cursorM });
      }
      if (cMid > period.endDate) break;
      cursorM++;
      if (cursorM > 12) {
        cursorM = 1;
        cursorY++;
      }
    }
    if (bimonthMonths.length === 0) bimonthMonths.push({ year, month });
    return { startInclusive: period.startDate, endInclusive: period.endDate, bimonthMonths };
  }

  private async lateCountInRange(staffId: string, startInclusive: Date, endInclusive: Date): Promise<number> {
    return this.prisma.staffTimeEntry.count({
      where: { staffId, late: true, date: { gte: startInclusive, lte: endInclusive } },
    });
  }

  // ===== Generación / sincronización =====

  private position(staff: { role: PayrollStaff['role']; employmentType: PayrollStaff['employmentType'] }): string {
    return `${STAFF_ROLE_LABELS[staff.role]} ${EMPLOYMENT_TYPE_ABBR[staff.employmentType]}`;
  }

  private schemeSnapshot(staff: PayrollStaff) {
    const s = staff.pensionScheme;
    return {
      schemeName: s.name,
      schemeKind: s.kind,
      onpRatePct: s.onpRatePct,
      fundRatePct: s.fundRatePct,
      commissionRatePct: s.commissionRatePct,
      insuranceRatePct: s.insuranceRatePct,
    };
  }

  // ¿Existe ya un ítem AUTO_TARDANZAS (de cualquier status) para este staff en el bimestre?
  // Un auto anulado NO se regenera; en BIMESTRE no se duplica entre los meses del bimestre.
  private async autoItemExists(
    client: DbClient,
    staffId: string,
    bimonthMonths: Array<{ year: number; month: number }>,
  ): Promise<boolean> {
    const found = await client.payrollItem.findFirst({
      where: {
        kind: 'AUTO_TARDANZAS',
        entry: {
          staffId,
          period: { OR: bimonthMonths.map((m) => ({ year: m.year, month: m.month })) },
        },
      },
      select: { id: true },
    });
    return Boolean(found);
  }

  // Crea el ítem AUTO_TARDANZAS si la regla aplica y aún no existe uno en el bimestre.
  private async maybeCreateAutoItem(
    client: DbClient,
    entryId: string,
    staffId: string,
    lateCount: number,
    rule: { enabled: boolean; threshold: number; amountCents: number },
    countPeriod: 'MES' | 'BIMESTRE',
    year: number,
    month: number,
    bimonthMonths: Array<{ year: number; month: number }>,
    actorId: string,
  ): Promise<void> {
    if (!rule.enabled || lateCount < rule.threshold) return;
    if (await this.autoItemExists(client, staffId, bimonthMonths)) return;
    const periodTxt =
      countPeriod === 'BIMESTRE' ? `el bimestre` : `${MONTH_NAMES[month - 1]}`;
    await client.payrollItem.create({
      data: {
        entryId,
        kind: 'AUTO_TARDANZAS',
        auto: true,
        detail: `${lateCount} tardanzas en ${periodTxt} (regla vigente)`,
        amount: new Prisma.Decimal(fromCents(rule.amountCents)),
        status: 'APLICADO',
        createdById: actorId,
      },
    });
  }

  private async payrollSettings() {
    return this.prisma.payrollSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  }

  private async markingRule() {
    const s = await this.prisma.markingSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
    return {
      enabled: s.autoDiscountEnabled,
      threshold: s.lateCountThreshold,
      amountCents: decimalToCents(s.discountAmount),
      countPeriod: s.countPeriod,
    };
  }

  // Crea el periodo (si no existe) y genera sus filas para todo el personal ACTIVO/LICENCIA.
  private async generatePeriod(year: number, month: number, actorId: string): Promise<string> {
    const rule = await this.markingRule();
    const range = await this.countRange(year, month, rule.countPeriod);

    const staffList = await this.prisma.staff.findMany({
      where: { status: { in: [...PAYROLL_STAFF_STATUSES] } },
      orderBy: { fullName: 'asc' },
      select: payrollStaffSelect,
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        const period = await tx.payrollPeriod.create({
          data: { year, month, createdById: actorId },
          select: { id: true },
        });
        for (const staff of staffList) {
          const lateCount = await this.lateCountInRange(staff.id, range.startInclusive, range.endInclusive);
          const entry = await tx.payrollEntry.create({
            data: {
              periodId: period.id,
              staffId: staff.id,
              staffCode: staff.code,
              staffName: staff.fullName,
              position: this.position(staff),
              employmentType: staff.employmentType,
              ...this.schemeSnapshot(staff),
              grossAmount: staff.baseSalary,
              lateCount,
              status: 'PENDIENTE',
            },
            select: { id: true },
          });
          await this.maybeCreateAutoItem(
            tx, entry.id, staff.id, lateCount, rule, rule.countPeriod, year, month, range.bimonthMonths, actorId,
          );
        }
        await this.audit.log(
          {
            userId: actorId,
            action: 'payroll.generate',
            entity: 'PayrollPeriod',
            entityId: period.id,
            payload: { year, month, employees: staffList.length },
          },
          tx,
        );
        return period.id;
      });
    } catch (error) {
      // Carrera: otra petición creó el periodo primero → reusa el existente.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await this.prisma.payrollPeriod.findUnique({
          where: { year_month: { year, month } },
          select: { id: true },
        });
        if (existing) return existing.id;
      }
      throw error;
    }
  }

  // ===== GET /api/payroll =====

  async list(query: { year?: number; month?: number }, actor: JwtUser) {
    const today = limaTodayISO();
    const [ty, tm] = today.split('-').map(Number);
    const year = query.year ?? ty!;
    const month = query.month ?? tm!;

    let period = await this.prisma.payrollPeriod.findUnique({
      where: { year_month: { year, month } },
      select: { id: true, year: true, month: true },
    });
    if (!period) {
      const id = await this.generatePeriod(year, month, actor.sub);
      period = { id, year, month };
    }

    return this.buildPayload(period.id);
  }

  private async buildPayload(periodId: string) {
    const [period, settings, entries] = await Promise.all([
      this.prisma.payrollPeriod.findUniqueOrThrow({
        where: { id: periodId },
        select: { id: true, year: true, month: true },
      }),
      this.payrollSettings(),
      this.prisma.payrollEntry.findMany({
        where: { periodId },
        orderBy: { staffName: 'asc' },
        include: entryInclude,
      }),
    ]);
    const essaludRatePct = Number(settings.essaludRatePct);

    let totalNet = 0;
    let paidNet = 0;
    let paidCount = 0;
    let pendingNet = 0;
    let pendingCount = 0;
    let discountsTotal = 0;
    const dtos = entries.map((e) => {
      const m = this.computeMoney(e, essaludRatePct);
      totalNet += m.netCents;
      discountsTotal += m.discountTotalCents;
      if (e.status === 'PAGADO') {
        paidNet += m.netCents;
        paidCount++;
      } else {
        pendingNet += m.netCents;
        pendingCount++;
      }
      return this.toDto(e, essaludRatePct);
    });

    return {
      period: { id: period.id, year: period.year, month: period.month },
      essaludRatePct: settings.essaludRatePct.toFixed(2),
      stats: {
        totalNet: fromCents(totalNet),
        paidNet: fromCents(paidNet),
        paidCount,
        pendingNet: fromCents(pendingNet),
        pendingCount,
        discountsTotal: fromCents(discountsTotal),
        employeeCount: entries.length,
      },
      entries: dtos,
    };
  }

  // ===== POST /api/payroll/:periodId/refresh =====

  async refresh(periodId: string, actor: JwtUser) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      select: { id: true, year: true, month: true },
    });
    if (!period) throw new NotFoundException('Periodo de planilla no encontrado');

    const rule = await this.markingRule();
    const range = await this.countRange(period.year, period.month, rule.countPeriod);

    const staffList = await this.prisma.staff.findMany({
      where: { status: { in: [...PAYROLL_STAFF_STATUSES] } },
      orderBy: { fullName: 'asc' },
      select: payrollStaffSelect,
    });
    const staffById = new Map(staffList.map((s) => [s.id, s]));

    const existing = await this.prisma.payrollEntry.findMany({
      where: { periodId },
      select: {
        id: true, staffId: true, status: true, grossEdited: true,
        staff: { select: { status: true } },
      },
    });
    const existingByStaff = new Map(existing.map((e) => [e.staffId, e]));

    await this.prisma.$transaction(async (tx) => {
      // 1) Sincroniza / limpia las filas PENDIENTES existentes. Las PAGADO no se tocan.
      for (const e of existing) {
        if (e.status === 'PAGADO') continue;
        const staff = staffById.get(e.staffId);
        if (!staff) {
          // Empleado ya INACTIVO (o fuera de ACTIVO/LICENCIA): elimina su fila pendiente y sus ítems.
          await tx.payrollItem.deleteMany({ where: { entryId: e.id } });
          await tx.payrollEntry.delete({ where: { id: e.id } });
          continue;
        }
        const lateCount = await this.lateCountInRange(staff.id, range.startInclusive, range.endInclusive);
        await tx.payrollEntry.update({
          where: { id: e.id },
          data: {
            staffCode: staff.code,
            staffName: staff.fullName,
            position: this.position(staff),
            employmentType: staff.employmentType,
            ...this.schemeSnapshot(staff),
            // grossEdited protege el monto editado a mano de un "por horas".
            grossAmount: e.grossEdited ? undefined : staff.baseSalary,
            lateCount,
          },
        });
        await this.maybeCreateAutoItem(
          tx, e.id, staff.id, lateCount, rule, rule.countPeriod, period.year, period.month, range.bimonthMonths, actor.sub,
        );
      }

      // 2) Agrega empleados nuevos ACTIVO/LICENCIA sin fila.
      for (const staff of staffList) {
        if (existingByStaff.has(staff.id)) continue;
        const lateCount = await this.lateCountInRange(staff.id, range.startInclusive, range.endInclusive);
        const entry = await tx.payrollEntry.create({
          data: {
            periodId,
            staffId: staff.id,
            staffCode: staff.code,
            staffName: staff.fullName,
            position: this.position(staff),
            employmentType: staff.employmentType,
            ...this.schemeSnapshot(staff),
            grossAmount: staff.baseSalary,
            lateCount,
            status: 'PENDIENTE',
          },
          select: { id: true },
        });
        await this.maybeCreateAutoItem(
          tx, entry.id, staff.id, lateCount, rule, rule.countPeriod, period.year, period.month, range.bimonthMonths, actor.sub,
        );
      }

      await this.audit.log(
        {
          userId: actor.sub,
          action: 'payroll.refresh',
          entity: 'PayrollPeriod',
          entityId: periodId,
          payload: { year: period.year, month: period.month },
        },
        tx,
      );
    });

    return this.buildPayload(periodId);
  }

  // ===== PATCH /api/payroll/entries/:id/gross =====

  async updateGross(id: string, input: PayrollGrossUpdateInput, actor: JwtUser) {
    const entry = await this.prisma.payrollEntry.findUnique({
      where: { id },
      select: { id: true, periodId: true, employmentType: true, status: true, grossAmount: true },
    });
    if (!entry) throw new NotFoundException('Fila de planilla no encontrada');
    if (entry.status !== 'PENDIENTE') throw new ConflictException('La fila ya fue pagada; no se puede editar el sueldo');
    if (entry.employmentType !== 'POR_HORAS') {
      throw new BadRequestException('Solo el personal por horas tiene sueldo editable por mes');
    }
    const cents = decimalToCents(input.grossAmount);
    if (cents < 0) throw new BadRequestException('El monto no puede ser negativo');

    await this.prisma.$transaction(async (tx) => {
      await tx.payrollEntry.update({
        where: { id },
        data: { grossAmount: new Prisma.Decimal(fromCents(cents)), grossEdited: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'payroll.entry.gross',
          entity: 'PayrollEntry',
          entityId: id,
          payload: { before: entry.grossAmount.toFixed(2), after: fromCents(cents) },
        },
        tx,
      );
    });
    return this.buildPayload(entry.periodId);
  }

  // ===== POST /api/payroll/entries/:id/items =====

  async addItem(id: string, input: PayrollItemCreateInput, actor: JwtUser) {
    const settings = await this.payrollSettings();
    const entry = await this.prisma.payrollEntry.findUnique({ where: { id }, include: entryInclude });
    if (!entry) throw new NotFoundException('Fila de planilla no encontrada');
    if (entry.status !== 'PENDIENTE') {
      throw new ConflictException('La fila ya fue pagada; no se pueden agregar descuentos');
    }
    const amountCents = decimalToCents(input.amount);
    if (amountCents <= 0) throw new BadRequestException('El monto debe ser mayor a cero');

    // Neto prospectivo (descuentos aplicados + este ítem) no puede quedar negativo.
    const m = this.computeMoney(entry, Number(settings.essaludRatePct));
    const grossCents = m.grossCents;
    const prospectiveDiscount = m.discountTotalCents + amountCents;
    if (grossCents - m.contrib.totalCents - prospectiveDiscount < 0) {
      throw new BadRequestException(
        `El descuento deja el neto negativo (bruto ${fromCents(grossCents)} · aportes ${fromCents(m.contrib.totalCents)} · descuentos ${fromCents(prospectiveDiscount)})`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const created = await tx.payrollItem.create({
        data: {
          entryId: id,
          kind: input.kind,
          auto: false,
          detail: input.detail.trim(),
          amount: new Prisma.Decimal(fromCents(amountCents)),
          status: 'APLICADO',
          createdById: actor.sub,
        },
        select: { id: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'payroll.item.create',
          entity: 'PayrollItem',
          entityId: created.id,
          payload: { entryId: id, kind: input.kind, amount: fromCents(amountCents), detail: input.detail.trim() },
        },
        tx,
      );
    });
    return this.buildPayload(entry.periodId);
  }

  // ===== POST /api/payroll/items/:id/cancel =====

  async cancelItem(id: string, reason: string, actor: JwtUser) {
    const item = await this.prisma.payrollItem.findUnique({
      where: { id },
      select: { id: true, status: true, kind: true, amount: true, entry: { select: { id: true, periodId: true, status: true } } },
    });
    if (!item) throw new NotFoundException('Descuento no encontrado');
    if (item.entry.status !== 'PENDIENTE') {
      throw new ConflictException('La fila ya fue pagada; no se pueden anular descuentos');
    }
    if (item.status === 'ANULADO') throw new ConflictException('El descuento ya está anulado');

    await this.prisma.$transaction(async (tx) => {
      await tx.payrollItem.update({
        where: { id },
        data: { status: 'ANULADO', canceledById: actor.sub, canceledAt: new Date(), cancelReason: reason },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'payroll.item.cancel',
          entity: 'PayrollItem',
          entityId: id,
          payload: { entryId: item.entry.id, kind: item.kind, amount: item.amount.toFixed(2), reason },
        },
        tx,
      );
    });
    return this.buildPayload(item.entry.periodId);
  }

  // ===== Gasto de tesorería (origin PLANILLA) =====

  private async payrollCategoryId(tx: Prisma.TransactionClient): Promise<string> {
    const existing = await tx.treasuryCategory.findUnique({
      where: { kind_name: { kind: 'GASTO', name: PAYROLL_CATEGORY } },
      select: { id: true },
    });
    if (existing) return existing.id;
    const created = await tx.treasuryCategory.create({
      data: { kind: 'GASTO', name: PAYROLL_CATEGORY, status: 'ACTIVO' },
      select: { id: true },
    });
    return created.id;
  }

  // ===== POST /api/payroll/entries/:id/pay (ADMIN) =====

  async pay(id: string, input: PayrollPayInput, actor: JwtUser) {
    if (actor.role !== 'ADMIN') throw new ForbiddenException('Solo un administrador puede pagar la planilla');

    const settings = await this.payrollSettings();
    const periodId = await this.prisma.$transaction(async (tx) => {
      const entry = await tx.payrollEntry.findUnique({ where: { id }, include: entryInclude });
      if (!entry) throw new NotFoundException('Fila de planilla no encontrada');
      if (entry.status !== 'PENDIENTE') throw new ConflictException('La fila ya fue pagada');

      const m = this.computeMoney(entry, Number(settings.essaludRatePct));
      if (m.netCents <= 0) throw new BadRequestException('El neto a pagar debe ser mayor a cero');

      const period = await tx.payrollPeriod.findUniqueOrThrow({
        where: { id: entry.periodId },
        select: { year: true, month: true },
      });
      const categoryId = await this.payrollCategoryId(tx);
      const movementCode = await nextCode(tx, 'treasury:expense', 'G-', 4);
      const movement = await tx.treasuryMovement.create({
        data: {
          code: movementCode,
          kind: 'GASTO',
          categoryId,
          description: `Planilla ${monthLabel(period.month, period.year)} · ${entry.staffName}`,
          amount: new Prisma.Decimal(fromCents(m.netCents)),
          method: input.method,
          date: isoToDate(limaTodayISO()),
          origin: 'PLANILLA',
          originRef: entry.staffCode,
          registeredById: actor.sub,
        },
        select: { id: true },
      });

      await tx.payrollEntry.update({
        where: { id },
        data: {
          status: 'PAGADO',
          paidAt: new Date(),
          paidById: actor.sub,
          paymentMethod: input.method,
          operationNumber: input.operationNumber?.trim() || null,
          treasuryMovementId: movement.id,
          batchId: null,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'payroll.pay',
          entity: 'PayrollEntry',
          entityId: id,
          payload: {
            net: fromCents(m.netCents),
            method: input.method,
            movementCode,
            staffCode: entry.staffCode,
          },
        },
        tx,
      );
      return entry.periodId;
    });
    return this.buildPayload(periodId);
  }

  // ===== POST /api/payroll/:periodId/pay-all (ADMIN) =====

  async payAll(periodId: string, method: PayrollPayInput['method'], actor: JwtUser) {
    if (actor.role !== 'ADMIN') throw new ForbiddenException('Solo un administrador puede pagar la planilla');

    const settings = await this.payrollSettings();
    await this.prisma.$transaction(async (tx) => {
      const period = await tx.payrollPeriod.findUnique({
        where: { id: periodId },
        select: { id: true, year: true, month: true },
      });
      if (!period) throw new NotFoundException('Periodo de planilla no encontrado');

      const pendientes = await tx.payrollEntry.findMany({
        where: { periodId, status: 'PENDIENTE' },
        include: entryInclude,
      });
      if (pendientes.length === 0) throw new ConflictException('No hay filas pendientes por pagar');

      let totalCents = 0;
      const nets = new Map<string, number>();
      for (const e of pendientes) {
        const net = this.computeMoney(e, Number(settings.essaludRatePct)).netCents;
        nets.set(e.id, net);
        totalCents += net;
      }
      if (totalCents <= 0) throw new ConflictException('El total a pagar debe ser mayor a cero');

      const batchCode = await nextCode(tx, 'payroll-batch', 'PL-', 4);
      const categoryId = await this.payrollCategoryId(tx);
      const movementCode = await nextCode(tx, 'treasury:expense', 'G-', 4);
      const movement = await tx.treasuryMovement.create({
        data: {
          code: movementCode,
          kind: 'GASTO',
          categoryId,
          description: `Planilla ${monthLabel(period.month, period.year)} · pago masivo (${pendientes.length} empleados)`,
          amount: new Prisma.Decimal(fromCents(totalCents)),
          method,
          date: isoToDate(limaTodayISO()),
          origin: 'PLANILLA',
          originRef: batchCode,
          registeredById: actor.sub,
        },
        select: { id: true },
      });
      const batch = await tx.payrollBatch.create({
        data: {
          code: batchCode,
          periodId,
          paymentMethod: method,
          totalAmount: new Prisma.Decimal(fromCents(totalCents)),
          paidById: actor.sub,
          treasuryMovementId: movement.id,
        },
        select: { id: true },
      });
      const paidAt = new Date();
      for (const e of pendientes) {
        await tx.payrollEntry.update({
          where: { id: e.id },
          data: {
            status: 'PAGADO',
            paidAt,
            paidById: actor.sub,
            paymentMethod: method,
            operationNumber: null,
            batchId: batch.id,
            treasuryMovementId: null,
          },
        });
      }
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'payroll.payAll',
          entity: 'PayrollBatch',
          entityId: batch.id,
          payload: {
            batchCode,
            movementCode,
            method,
            employees: pendientes.length,
            total: fromCents(totalCents),
          },
        },
        tx,
      );
    });
    return this.buildPayload(periodId);
  }

  // ===== POST /api/payroll/entries/:id/cancel-payment (ADMIN) =====

  async cancelPayment(id: string, reason: string, actor: JwtUser) {
    if (actor.role !== 'ADMIN') throw new ForbiddenException('Solo un administrador puede anular un pago de planilla');

    const settings = await this.payrollSettings();
    const periodId = await this.prisma.$transaction(async (tx) => {
      const entry = await tx.payrollEntry.findUnique({ where: { id }, include: entryInclude });
      if (!entry) throw new NotFoundException('Fila de planilla no encontrada');
      if (entry.status !== 'PAGADO') throw new ConflictException('La fila no está pagada');

      const prevState = {
        paidAt: entry.paidAt ? entry.paidAt.toISOString() : null,
        paymentMethod: entry.paymentMethod,
        operationNumber: entry.operationNumber,
        batchId: entry.batchId,
        batchCode: entry.batch?.code ?? null,
        treasuryMovementId: entry.treasuryMovementId,
      };
      const net = this.computeMoney(entry, Number(settings.essaludRatePct)).netCents;

      if (entry.batchId) {
        // Pago masivo: reduce el movimiento consolidado por el neto de esta fila (nunca < 0).
        const batch = await tx.payrollBatch.findUniqueOrThrow({
          where: { id: entry.batchId },
          select: { id: true, code: true, totalAmount: true, treasuryMovementId: true },
        });
        const movement = await tx.treasuryMovement.findUnique({
          where: { id: batch.treasuryMovementId },
          select: { id: true, amount: true, canceledAt: true },
        });
        if (movement && !movement.canceledAt) {
          const reducedCents = Math.max(0, decimalToCents(movement.amount) - net);
          if (reducedCents === 0) {
            await tx.treasuryMovement.update({
              where: { id: movement.id },
              data: { canceledAt: new Date(), cancelReason: reason, canceledById: actor.sub },
            });
          } else {
            await tx.treasuryMovement.update({
              where: { id: movement.id },
              data: { amount: new Prisma.Decimal(fromCents(reducedCents)) },
            });
          }
        }
        const newBatchTotal = Math.max(0, decimalToCents(batch.totalAmount) - net);
        await tx.payrollBatch.update({
          where: { id: batch.id },
          data: { totalAmount: new Prisma.Decimal(fromCents(newBatchTotal)) },
        });
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'payroll.cancelPayment',
            entity: 'PayrollEntry',
            entityId: id,
            payload: {
              reason,
              net: fromCents(net),
              batchCode: batch.code,
              movementReducedTo: fromCents(Math.max(0, decimalToCents(batch.totalAmount) - net)),
              previous: prevState,
            },
          },
          tx,
        );
      } else if (entry.treasuryMovementId) {
        // Pago individual: anula el movimiento (forzado interno, aunque origin PLANILLA lo bloquee).
        const movement = await tx.treasuryMovement.findUnique({
          where: { id: entry.treasuryMovementId },
          select: { id: true, canceledAt: true },
        });
        if (movement && !movement.canceledAt) {
          await tx.treasuryMovement.update({
            where: { id: movement.id },
            data: { canceledAt: new Date(), cancelReason: reason, canceledById: actor.sub },
          });
        }
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'payroll.cancelPayment',
            entity: 'PayrollEntry',
            entityId: id,
            payload: { reason, net: fromCents(net), movementCanceled: entry.treasuryMovementId, previous: prevState },
          },
          tx,
        );
      }

      await tx.payrollEntry.update({
        where: { id },
        data: {
          status: 'PENDIENTE',
          paidAt: null,
          paidById: null,
          paymentMethod: null,
          operationNumber: null,
          batchId: null,
          treasuryMovementId: null,
        },
      });
      return entry.periodId;
    });
    return this.buildPayload(periodId);
  }

  // ===== GET /api/payroll/export =====

  async exportMonth(query: { year?: number; month?: number }): Promise<{ buffer: Buffer; filename: string }> {
    const today = limaTodayISO();
    const [ty, tm] = today.split('-').map(Number);
    const year = query.year ?? ty!;
    const month = query.month ?? tm!;

    const period = await this.prisma.payrollPeriod.findUnique({
      where: { year_month: { year, month } },
      select: { id: true },
    });
    const settings = await this.payrollSettings();
    const essaludRatePct = Number(settings.essaludRatePct);

    const entries = period
      ? await this.prisma.payrollEntry.findMany({
          where: { periodId: period.id },
          orderBy: { staffName: 'asc' },
          include: entryInclude,
        })
      : [];

    const rows = entries.map((e) => {
      const m = this.computeMoney(e, essaludRatePct);
      return {
        code: e.staffCode,
        name: e.staffName,
        position: e.position,
        scheme: e.schemeName,
        gross: e.grossAmount.toFixed(2),
        discount: fromCents(m.discountTotalCents),
        contrib: fromCents(m.contrib.totalCents),
        net: fromCents(m.netCents),
        status: e.status,
        method: e.paymentMethod,
        paidAt: e.paidAt ? dateToISO(e.paidAt) : null,
      };
    });

    const buffer = await buildPayrollWorkbook(year, month, rows);
    return { buffer, filename: `planilla-${year}-${String(month).padStart(2, '0')}.xlsx` };
  }
}
