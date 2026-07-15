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
  type PettyExpenseCreateInput,
  type PettyFundUpdateInput,
  type PettyRenditionSource,
  type TreasuryCategoryUpsertInput,
  type TreasuryCategoryUpdateInput,
  type TreasuryKind,
  type TreasuryMovementCreateInput,
  type TreasuryMovementUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { nextCode } from '../common/code-counter.util';
import { decimalToCents } from '../common/money.util';
import { todayISO, dateToISO, isoToDate } from '../common/installment-view.util';
import { type JwtUser } from '../auth/decorators/current-user.decorator';

type DbClient = Prisma.TransactionClient | PrismaService;

// Frontera de dinero: Prisma.Decimal → string "0.00".
function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

// Categoría "Otros gastos" es el destino de la rendición de caja chica.
const OTROS_GASTOS = 'Otros gastos';

// Include del movimiento para armar el DTO.
const movementInclude = {
  category: { select: { name: true } },
  cashSession: { select: { date: true, status: true } },
  registeredBy: { select: { fullName: true } },
  canceledBy: { select: { fullName: true } },
} satisfies Prisma.TreasuryMovementInclude;

type MovementRow = Prisma.TreasuryMovementGetPayload<{ include: typeof movementInclude }>;

@Injectable()
export class TreasuryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ===== DTO builders =====

  private mapMovement(m: MovementRow) {
    return {
      id: m.id,
      code: m.code,
      kind: m.kind,
      date: dateToISO(m.date),
      categoryId: m.categoryId,
      categoryName: m.category.name,
      description: m.description,
      supplier: m.supplier,
      voucherNumber: m.voucherNumber,
      notes: m.notes,
      method: m.method,
      amount: money(m.amount),
      origin: m.origin,
      originRef: m.originRef,
      cashSessionDate: m.cashSession ? dateToISO(m.cashSession.date) : null,
      registeredByName: m.registeredBy.fullName,
      status: m.canceledAt ? 'ANULADO' : 'ACTIVO',
      canceledAt: m.canceledAt ? m.canceledAt.toISOString() : null,
      cancelReason: m.cancelReason,
      canceledByName: m.canceledBy?.fullName ?? null,
      createdAt: m.createdAt.toISOString(),
    };
  }

  private async getMovementDto(client: DbClient, id: string) {
    const row = await client.treasuryMovement.findUnique({ where: { id }, include: movementInclude });
    if (!row) throw new NotFoundException('Movimiento no encontrado');
    return this.mapMovement(row);
  }

  // Rango de fechas [mes/01, mes+1/01) del mes/año dados (columnas @db.Date).
  private monthRange(month: number, year: number): { start: Date; end: Date } {
    const start = isoToDate(`${year}-${String(month).padStart(2, '0')}-01`);
    const endYear = month === 12 ? year + 1 : year;
    const endMonth = month === 12 ? 1 : month + 1;
    const end = isoToDate(`${endYear}-${String(endMonth).padStart(2, '0')}-01`);
    return { start, end };
  }

  // ===== Movimientos =====

  // GET /treasury/movements
  async listMovements(query: {
    kind?: TreasuryKind;
    categoryId?: string;
    month: number;
    year: number;
    q?: string;
    page: number;
    pageSize: number;
  }) {
    const { kind, categoryId, month, year, q, page, pageSize } = query;
    const { start, end } = this.monthRange(month, year);

    const and: Prisma.TreasuryMovementWhereInput[] = [{ date: { gte: start, lt: end } }];
    if (kind) and.push({ kind });
    if (categoryId) and.push({ categoryId });
    if (q && q.trim()) {
      const term = q.trim();
      and.push({
        OR: [
          { description: { contains: term, mode: 'insensitive' } },
          { supplier: { contains: term, mode: 'insensitive' } },
          { code: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.TreasuryMovementWhereInput = { AND: and };
    const total = await this.prisma.treasuryMovement.count({ where });
    const rows = await this.prisma.treasuryMovement.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: movementInclude,
    });
    return { total, page, pageSize, items: rows.map((r) => this.mapMovement(r)) };
  }

  // Valida la categoría destino: existe, del mismo kind y ACTIVO.
  private async loadActiveCategory(client: DbClient, categoryId: string, kind: TreasuryKind) {
    const cat = await client.treasuryCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, kind: true, status: true, name: true },
    });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    if (cat.kind !== kind) {
      throw new BadRequestException('La categoría no corresponde al tipo del movimiento');
    }
    if (cat.status !== 'ACTIVO') {
      throw new BadRequestException(`La categoría "${cat.name}" está desactivada`);
    }
    return cat;
  }

  // POST /treasury/movements
  async createMovement(input: TreasuryMovementCreateInput, actor: JwtUser) {
    const id = await this.prisma.$transaction(async (tx) => {
      await this.loadActiveCategory(tx, input.categoryId, input.kind);

      const amountCents = decimalToCents(input.amount);
      if (amountCents <= 0) throw new BadRequestException('El monto debe ser mayor a cero');

      const today = todayISO();
      let dateISO = input.date ?? today;
      let cashSessionId: string | null = null;

      const isCashIncome = input.kind === 'INGRESO' && input.method === 'EFECTIVO';
      if (isCashIncome) {
        // Otros ingresos en EFECTIVO entran al arqueo: exigen caja del día ABIERTA, fecha = hoy.
        const session = await tx.cashSession.findUnique({
          where: { date: isoToDate(today) },
          select: { id: true, status: true },
        });
        if (!session || session.status !== 'ABIERTA') {
          throw new ConflictException('La caja del día no está abierta');
        }
        cashSessionId = session.id;
        dateISO = today;
      } else {
        // Gastos (cualquier método) e ingresos digitales: sin caja, fecha libre ≤ hoy.
        if (dateISO > today) {
          throw new BadRequestException('La fecha no puede ser futura');
        }
      }

      const code =
        input.kind === 'GASTO'
          ? await nextCode(tx, 'treasury:expense', 'G-', 4)
          : await nextCode(tx, 'treasury:income', 'I-', 4);

      const created = await tx.treasuryMovement.create({
        data: {
          code,
          kind: input.kind,
          categoryId: input.categoryId,
          description: input.description,
          amount: new Prisma.Decimal(fromCents(amountCents)),
          method: input.method,
          date: isoToDate(dateISO),
          supplier: input.supplier ?? null,
          voucherNumber: input.voucherNumber ?? null,
          notes: input.notes ?? null,
          origin: 'MANUAL',
          cashSessionId,
          registeredById: actor.sub,
        },
        select: { id: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'treasury.create',
          entity: 'TreasuryMovement',
          entityId: created.id,
          payload: {
            code,
            kind: input.kind,
            amount: fromCents(amountCents),
            method: input.method,
            categoryId: input.categoryId,
            cashSessionId,
          },
        },
        tx,
      );
      return created.id;
    });
    return this.getMovementDto(this.prisma, id);
  }

  // PATCH /treasury/movements/:id — solo MANUAL, no anulado. Regla del arqueo cerrado.
  async updateMovement(id: string, input: TreasuryMovementUpdateInput, actor: JwtUser) {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.treasuryMovement.findUnique({
        where: { id },
        include: movementInclude,
      });
      if (!current) throw new NotFoundException('Movimiento no encontrado');
      if (current.origin !== 'MANUAL') {
        throw new ConflictException(
          current.origin === 'PLANILLA'
            ? 'Un gasto de planilla se corrige desde el módulo Personal, no aquí'
            : 'Un movimiento de caja chica se corrige por su rendición, no aquí',
        );
      }
      if (current.canceledAt) throw new ConflictException('El movimiento está anulado');

      const isIngreso = current.kind === 'INGRESO';
      const wasCashIncome =
        isIngreso && current.method === 'EFECTIVO' && current.cashSessionId !== null;
      const newMethod = input.method ?? current.method;
      const today = todayISO();

      // Arqueo cerrado: en un ingreso en efectivo, monto/método/fecha no se alteran tras el cierre.
      if (wasCashIncome && current.cashSession?.status === 'CERRADA') {
        const amountChanged =
          input.amount !== undefined && decimalToCents(input.amount) !== decimalToCents(current.amount);
        const methodChanged = input.method !== undefined && input.method !== current.method;
        const dateChanged = input.date !== undefined && input.date !== dateToISO(current.date);
        if (amountChanged || methodChanged || dateChanged) {
          throw new ConflictException('El arqueo de ese día ya cerró');
        }
      }

      // Categoría destino (si cambia): válida, mismo kind, ACTIVO. kind no es editable.
      if (input.categoryId !== undefined && input.categoryId !== current.categoryId) {
        await this.loadActiveCategory(tx, input.categoryId, current.kind);
      }

      // Monto.
      let amountDecimal: Prisma.Decimal | undefined;
      if (input.amount !== undefined) {
        const cents = decimalToCents(input.amount);
        if (cents <= 0) throw new BadRequestException('El monto debe ser mayor a cero');
        amountDecimal = new Prisma.Decimal(fromCents(cents));
      }

      // Vínculo de sesión y fecha resultantes según (kind, método) tras la edición.
      let cashSessionId: string | null = current.cashSessionId;
      let dateISO = input.date ?? dateToISO(current.date);
      if (isIngreso && newMethod === 'EFECTIVO') {
        if (wasCashIncome) {
          // Sigue vinculado a la misma caja; su fecha queda anclada a la del arqueo.
          cashSessionId = current.cashSessionId;
          dateISO = dateToISO(current.date);
        } else {
          // Pasa a ser ingreso en efectivo: exige la caja de hoy ABIERTA y se ancla a hoy.
          const session = await tx.cashSession.findUnique({
            where: { date: isoToDate(today) },
            select: { id: true, status: true },
          });
          if (!session || session.status !== 'ABIERTA') {
            throw new ConflictException('La caja del día no está abierta');
          }
          cashSessionId = session.id;
          dateISO = today;
        }
      } else {
        // Gasto (cualquier método) o ingreso digital: sin vínculo de caja, fecha libre ≤ hoy.
        cashSessionId = null;
        if (dateISO > today) throw new BadRequestException('La fecha no puede ser futura');
      }

      // Diff auditado (solo campos que cambian).
      const before: Record<string, Prisma.InputJsonValue | null> = {};
      const after: Record<string, Prisma.InputJsonValue | null> = {};
      const track = (
        key: string,
        oldV: Prisma.InputJsonValue | null,
        newV: Prisma.InputJsonValue | null,
      ) => {
        if (oldV !== newV) {
          before[key] = oldV;
          after[key] = newV;
        }
      };
      if (input.categoryId !== undefined) track('categoryId', current.categoryId, input.categoryId);
      if (input.description !== undefined) track('description', current.description, input.description);
      if (amountDecimal !== undefined) track('amount', money(current.amount), money(amountDecimal));
      if (input.method !== undefined) track('method', current.method, newMethod);
      track('date', dateToISO(current.date), dateISO);
      if (input.supplier !== undefined) track('supplier', current.supplier, input.supplier ?? null);
      if (input.voucherNumber !== undefined)
        track('voucherNumber', current.voucherNumber, input.voucherNumber ?? null);
      if (input.notes !== undefined) track('notes', current.notes, input.notes ?? null);
      track('cashSessionId', current.cashSessionId, cashSessionId);

      await tx.treasuryMovement.update({
        where: { id },
        data: {
          categoryId: input.categoryId ?? undefined,
          description: input.description ?? undefined,
          amount: amountDecimal ?? undefined,
          method: input.method ?? undefined,
          date: isoToDate(dateISO),
          supplier: input.supplier !== undefined ? input.supplier ?? null : undefined,
          voucherNumber:
            input.voucherNumber !== undefined ? input.voucherNumber ?? null : undefined,
          notes: input.notes !== undefined ? input.notes ?? null : undefined,
          cashSessionId,
        },
      });

      await this.audit.log(
        {
          userId: actor.sub,
          action: 'treasury.update',
          entity: 'TreasuryMovement',
          entityId: id,
          payload: { before, after },
        },
        tx,
      );
    });
    return this.getMovementDto(this.prisma, id);
  }

  // POST /treasury/movements/:id/cancel — solo MANUAL. Regla del arqueo cerrado para ingreso efectivo.
  async cancelMovement(id: string, reason: string, actor: JwtUser) {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.treasuryMovement.findUnique({
        where: { id },
        include: { cashSession: { select: { status: true } } },
      });
      if (!current) throw new NotFoundException('Movimiento no encontrado');
      if (current.origin !== 'MANUAL') {
        throw new ConflictException(
          current.origin === 'PLANILLA'
            ? 'Un gasto de planilla se anula desde el módulo Personal, no aquí'
            : 'Un movimiento de caja chica se corrige por su rendición, no se anula aquí',
        );
      }
      if (current.canceledAt) throw new ConflictException('El movimiento ya está anulado');

      const isCashIncome =
        current.kind === 'INGRESO' && current.method === 'EFECTIVO' && current.cashSessionId !== null;
      if (isCashIncome && current.cashSession?.status === 'CERRADA') {
        throw new ConflictException('El arqueo de ese día ya cerró');
      }

      await tx.treasuryMovement.update({
        where: { id },
        data: {
          canceledAt: new Date(),
          cancelReason: reason,
          canceledById: actor.sub,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'treasury.cancel',
          entity: 'TreasuryMovement',
          entityId: id,
          payload: { reason, code: current.code },
        },
        tx,
      );
    });
    return this.getMovementDto(this.prisma, id);
  }

  // ===== Categorías =====

  // GET /treasury/categories?kind
  async listCategories(kind?: TreasuryKind) {
    const where: Prisma.TreasuryCategoryWhereInput = {};
    if (kind) where.kind = kind;
    const rows = await this.prisma.treasuryCategory.findMany({
      where,
      orderBy: [{ kind: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        kind: true,
        name: true,
        status: true,
        _count: { select: { movements: true } },
      },
    });
    return rows.map((c) => ({
      id: c.id,
      kind: c.kind,
      name: c.name,
      status: c.status,
      movementCount: c._count.movements,
    }));
  }

  async createCategory(input: TreasuryCategoryUpsertInput, actor: JwtUser) {
    const existing = await this.prisma.treasuryCategory.findUnique({
      where: { kind_name: { kind: input.kind, name: input.name } },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Ya existe una categoría con ese nombre y tipo');

    const created = await this.prisma.$transaction(async (tx) => {
      const cat = await tx.treasuryCategory.create({
        data: { kind: input.kind, name: input.name, status: input.status },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'treasuryCategory.create',
          entity: 'TreasuryCategory',
          entityId: cat.id,
          payload: { kind: input.kind, name: input.name, status: input.status },
        },
        tx,
      );
      return cat;
    });
    return {
      id: created.id,
      kind: created.kind,
      name: created.name,
      status: created.status,
      movementCount: 0,
    };
  }

  async updateCategory(id: string, input: TreasuryCategoryUpdateInput, actor: JwtUser) {
    const current = await this.prisma.treasuryCategory.findUnique({
      where: { id },
      select: { id: true, kind: true, name: true, status: true },
    });
    if (!current) throw new NotFoundException('Categoría no encontrada');

    const nextKind = input.kind ?? current.kind;
    const nextName = input.name ?? current.name;
    if (nextKind !== current.kind || nextName !== current.name) {
      const clash = await this.prisma.treasuryCategory.findUnique({
        where: { kind_name: { kind: nextKind, name: nextName } },
        select: { id: true },
      });
      if (clash && clash.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre y tipo');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.treasuryCategory.update({
        where: { id },
        data: {
          kind: input.kind ?? undefined,
          name: input.name ?? undefined,
          status: input.status ?? undefined,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'treasuryCategory.update',
          entity: 'TreasuryCategory',
          entityId: id,
          payload: {
            before: current,
            after: { kind: nextKind, name: nextName, status: input.status ?? current.status },
          },
        },
        tx,
      );
    });
    const updated = await this.prisma.treasuryCategory.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        kind: true,
        name: true,
        status: true,
        _count: { select: { movements: true } },
      },
    });
    return {
      id: updated.id,
      kind: updated.kind,
      name: updated.name,
      status: updated.status,
      movementCount: updated._count.movements,
    };
  }

  async deleteCategory(id: string, actor: JwtUser) {
    const current = await this.prisma.treasuryCategory.findUnique({
      where: { id },
      select: { id: true, kind: true, name: true, _count: { select: { movements: true } } },
    });
    if (!current) throw new NotFoundException('Categoría no encontrada');
    if (current._count.movements > 0) {
      throw new ConflictException(
        'La categoría tiene movimientos: no se puede eliminar, desactívala',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.treasuryCategory.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'treasuryCategory.delete',
          entity: 'TreasuryCategory',
          entityId: id,
          payload: { kind: current.kind, name: current.name },
        },
        tx,
      );
    });
    return { ok: true };
  }

  // ===== Resumen del mes =====

  // GET /treasury/summary?month&year
  async summary(month: number, year: number) {
    const monthR = this.monthRange(month, year);
    const yearStart = isoToDate(`${year}-01-01`);
    const yearEnd = isoToDate(`${year + 1}-01-01`);

    // Cobros en caja = Σ recibos EMITIDO − Σ devoluciones DEVUELTA (por periodo).
    const monthCobros = await this.cobrosCents(monthR.start, monthR.end);
    const yearCobros = await this.cobrosCents(yearStart, yearEnd);

    // Otros ingresos y gastos (movimientos activos) por periodo.
    const monthMovements = await this.prisma.treasuryMovement.findMany({
      where: { canceledAt: null, date: { gte: monthR.start, lt: monthR.end } },
      select: { kind: true, amount: true, category: { select: { name: true } } },
    });
    const yearMovements = await this.prisma.treasuryMovement.findMany({
      where: { canceledAt: null, date: { gte: yearStart, lt: yearEnd } },
      select: { kind: true, amount: true },
    });

    let otrosIngresosCents = 0;
    let gastosCents = 0;
    const expenseByCat = new Map<string, number>();
    const incomeByCat = new Map<string, number>();
    for (const m of monthMovements) {
      const cents = decimalToCents(m.amount);
      if (m.kind === 'INGRESO') {
        otrosIngresosCents += cents;
        incomeByCat.set(m.category.name, (incomeByCat.get(m.category.name) ?? 0) + cents);
      } else {
        gastosCents += cents;
        expenseByCat.set(m.category.name, (expenseByCat.get(m.category.name) ?? 0) + cents);
      }
    }

    let yearOtrosIngresosCents = 0;
    let yearGastosCents = 0;
    for (const m of yearMovements) {
      const cents = decimalToCents(m.amount);
      if (m.kind === 'INGRESO') yearOtrosIngresosCents += cents;
      else yearGastosCents += cents;
    }

    const incomeTotalCents = monthCobros + otrosIngresosCents;
    const expenseTotalCents = gastosCents;
    const yearIncomeCents = yearCobros + yearOtrosIngresosCents;
    const yearExpenseCents = yearGastosCents;

    const byCat = (map: Map<string, number>) =>
      [...map.entries()]
        .map(([name, cents]) => ({ name, amount: fromCents(cents) }))
        .sort((a, b) => Number(b.amount) - Number(a.amount));

    return {
      incomeTotal: fromCents(incomeTotalCents),
      expenseTotal: fromCents(expenseTotalCents),
      net: fromCents(incomeTotalCents - expenseTotalCents),
      yearNet: fromCents(yearIncomeCents - yearExpenseCents),
      rubros: [
        { key: 'cobros', label: 'Cobros en caja', amount: fromCents(monthCobros) },
        { key: 'otrosIngresos', label: 'Otros ingresos', amount: fromCents(otrosIngresosCents) },
        { key: 'gastos', label: 'Gastos operativos', amount: fromCents(-gastosCents) },
      ],
      expensesByCategory: byCat(expenseByCat),
      incomesByCategory: byCat(incomeByCat),
    };
  }

  // Σ recibos EMITIDO − Σ devoluciones DEVUELTA en [start, end) (por createdAt / executedAt).
  private async cobrosCents(start: Date, end: Date): Promise<number> {
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
    return cents;
  }

  // ===== Caja chica =====

  private async fundView(client: DbClient) {
    const fund = await client.pettyCashFund.findUnique({
      where: { id: 1 },
      include: { responsible: { select: { id: true, fullName: true } } },
    });
    const amount = fund ? money(fund.amount) : '500.00';
    return {
      amount,
      responsibleId: fund?.responsibleId ?? null,
      responsibleName: fund?.responsible?.fullName ?? null,
      amountCents: fund ? decimalToCents(fund.amount) : decimalToCents('500.00'),
    };
  }

  // Suma de gastos menores ACTIVOS aún NO rendidos (consumen el saldo).
  private async spentCents(client: DbClient): Promise<number> {
    const rows = await client.pettyCashExpense.findMany({
      where: { renditionId: null, canceledAt: null },
      select: { amount: true },
    });
    let cents = 0;
    for (const r of rows) cents += decimalToCents(r.amount);
    return cents;
  }

  // GET /treasury/petty-cash
  async getPettyCash() {
    const fund = await this.fundView(this.prisma);
    const spent = await this.spentCents(this.prisma);
    const balanceCents = fund.amountCents - spent;

    const expenses = await this.prisma.pettyCashExpense.findMany({
      where: { renditionId: null },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: { registeredBy: { select: { fullName: true } } },
    });
    const renditions = await this.prisma.pettyCashRendition.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { treasuryMovement: { select: { code: true } } },
    });

    return {
      fund: {
        amount: fund.amount,
        responsibleId: fund.responsibleId,
        responsibleName: fund.responsibleName,
      },
      spent: fromCents(spent),
      balance: fromCents(balanceCents),
      expenses: expenses.map((e) => ({
        id: e.id,
        date: dateToISO(e.date),
        concept: e.concept,
        amount: money(e.amount),
        voucherNumber: e.voucherNumber,
        registeredByName: e.registeredBy.fullName,
        status: e.canceledAt ? 'ANULADO' : 'ACTIVO',
      })),
      renditions: renditions.map((r) => ({
        id: r.id,
        code: r.code,
        createdAt: r.createdAt.toISOString(),
        totalAmount: money(r.totalAmount),
        expensesCount: r.expensesCount,
        source: r.source,
        movementCode: r.treasuryMovement.code,
      })),
    };
  }

  // POST /treasury/petty-cash/expenses
  async createPettyExpense(input: PettyExpenseCreateInput, actor: JwtUser) {
    const id = await this.prisma.$transaction(async (tx) => {
      const amountCents = decimalToCents(input.amount);
      if (amountCents <= 0) throw new BadRequestException('El monto debe ser mayor a cero');

      const today = todayISO();
      const dateISO = input.date ?? today;
      if (dateISO > today) throw new BadRequestException('La fecha no puede ser futura');

      const fund = await this.fundView(tx);
      const spent = await this.spentCents(tx);
      const balanceCents = fund.amountCents - spent;
      if (amountCents > balanceCents) {
        throw new BadRequestException(
          `El gasto supera el saldo disponible de caja chica (${fromCents(balanceCents)})`,
        );
      }

      const created = await tx.pettyCashExpense.create({
        data: {
          date: isoToDate(dateISO),
          concept: input.concept,
          amount: new Prisma.Decimal(fromCents(amountCents)),
          voucherNumber: input.voucherNumber ?? null,
          registeredById: actor.sub,
        },
        select: { id: true },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'pettyExpense.create',
          entity: 'PettyCashExpense',
          entityId: created.id,
          payload: { concept: input.concept, amount: fromCents(amountCents) },
        },
        tx,
      );
      return created.id;
    });
    void id;
    return this.getPettyCash();
  }

  // POST /treasury/petty-cash/expenses/:id/cancel — solo no rendidos.
  async cancelPettyExpense(id: string, reason: string, actor: JwtUser) {
    await this.prisma.$transaction(async (tx) => {
      const current = await tx.pettyCashExpense.findUnique({
        where: { id },
        select: { id: true, renditionId: true, canceledAt: true },
      });
      if (!current) throw new NotFoundException('Gasto menor no encontrado');
      if (current.renditionId) {
        throw new ConflictException('El gasto ya fue rendido: no se puede anular');
      }
      if (current.canceledAt) throw new ConflictException('El gasto ya está anulado');

      await tx.pettyCashExpense.update({
        where: { id },
        data: { canceledAt: new Date(), cancelReason: reason, canceledById: actor.sub },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'pettyExpense.cancel',
          entity: 'PettyCashExpense',
          entityId: id,
          payload: { reason },
        },
        tx,
      );
    });
    return this.getPettyCash();
  }

  // POST /treasury/petty-cash/renditions — consolida gastos menores no rendidos en un gasto de tesorería.
  async createRendition(source: PettyRenditionSource, actor: JwtUser) {
    const renditionId = await this.prisma.$transaction(async (tx) => {
      const expenses = await tx.pettyCashExpense.findMany({
        where: { renditionId: null, canceledAt: null },
        select: { id: true, amount: true },
      });
      if (expenses.length === 0) {
        throw new ConflictException('No hay gastos menores por rendir');
      }
      let totalCents = 0;
      for (const e of expenses) totalCents += decimalToCents(e.amount);

      const today = todayISO();
      let cashSessionId: string | null = null;
      let method: 'EFECTIVO' | 'TRANSFERENCIA';
      if (source === 'EFECTIVO_CAJA') {
        // Egresa del arqueo del día: exige la caja de hoy ABIERTA.
        const session = await tx.cashSession.findUnique({
          where: { date: isoToDate(today) },
          select: { id: true, status: true },
        });
        if (!session || session.status !== 'ABIERTA') {
          throw new ConflictException('La caja del día no está abierta');
        }
        cashSessionId = session.id;
        method = 'EFECTIVO';
      } else {
        method = 'TRANSFERENCIA';
      }

      const category = await tx.treasuryCategory.findUnique({
        where: { kind_name: { kind: 'GASTO', name: OTROS_GASTOS } },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException(`No existe la categoría de gasto "${OTROS_GASTOS}"`);
      }

      const renditionCode = await nextCode(tx, 'petty-rendition', 'REND-', 4);
      const movementCode = await nextCode(tx, 'treasury:expense', 'G-', 4);

      const movement = await tx.treasuryMovement.create({
        data: {
          code: movementCode,
          kind: 'GASTO',
          categoryId: category.id,
          description: `Reposición caja chica · rendición de ${expenses.length} gastos menores`,
          amount: new Prisma.Decimal(fromCents(totalCents)),
          method,
          date: isoToDate(today),
          origin: 'CAJA_CHICA',
          originRef: renditionCode,
          cashSessionId,
          registeredById: actor.sub,
        },
        select: { id: true },
      });

      const rendition = await tx.pettyCashRendition.create({
        data: {
          code: renditionCode,
          totalAmount: new Prisma.Decimal(fromCents(totalCents)),
          expensesCount: expenses.length,
          source,
          treasuryMovementId: movement.id,
          cashSessionId,
          registeredById: actor.sub,
        },
        select: { id: true },
      });

      await tx.pettyCashExpense.updateMany({
        where: { id: { in: expenses.map((e) => e.id) } },
        data: { renditionId: rendition.id },
      });

      await this.audit.log(
        {
          userId: actor.sub,
          action: 'pettyRendition.create',
          entity: 'PettyCashRendition',
          entityId: rendition.id,
          payload: {
            code: renditionCode,
            movementCode,
            source,
            totalAmount: fromCents(totalCents),
            expensesCount: expenses.length,
            cashSessionId,
          },
        },
        tx,
      );
      return rendition.id;
    });
    return this.getRendition(renditionId);
  }

  // GET /treasury/petty-cash/renditions/:id — acepta el cuid (id) o el código REND-#### (los
  // movimientos de gasto solo exponen originRef = código, y el front lo usa para abrir el detalle).
  async getRendition(idOrCode: string) {
    const r = await this.prisma.pettyCashRendition.findFirst({
      where: { OR: [{ id: idOrCode }, { code: idOrCode }] },
      include: {
        treasuryMovement: { select: { code: true } },
        cashSession: { select: { date: true } },
        registeredBy: { select: { fullName: true } },
        expenses: {
          orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
          include: { registeredBy: { select: { fullName: true } } },
        },
      },
    });
    if (!r) throw new NotFoundException('Rendición no encontrada');
    return {
      id: r.id,
      code: r.code,
      createdAt: r.createdAt.toISOString(),
      totalAmount: money(r.totalAmount),
      expensesCount: r.expensesCount,
      source: r.source,
      movementCode: r.treasuryMovement.code,
      cashSessionDate: r.cashSession ? dateToISO(r.cashSession.date) : null,
      registeredByName: r.registeredBy.fullName,
      expenses: r.expenses.map((e) => ({
        id: e.id,
        date: dateToISO(e.date),
        concept: e.concept,
        amount: money(e.amount),
        voucherNumber: e.voucherNumber,
        registeredByName: e.registeredBy.fullName,
        status: e.canceledAt ? 'ANULADO' : 'ACTIVO',
      })),
    };
  }

  // PATCH /treasury/petty-cash/fund — solo ADMIN.
  async updateFund(input: PettyFundUpdateInput, actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede configurar el fondo de caja chica');
    }
    const amountCents = decimalToCents(input.amount);
    if (amountCents <= 0) throw new BadRequestException('El monto debe ser mayor a cero');

    const responsible = await this.prisma.user.findUnique({
      where: { id: input.responsibleId },
      select: { id: true },
    });
    if (!responsible) throw new NotFoundException('Responsable no encontrado');

    await this.prisma.$transaction(async (tx) => {
      const before = await tx.pettyCashFund.findUnique({
        where: { id: 1 },
        select: { amount: true, responsibleId: true },
      });
      await tx.pettyCashFund.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          amount: new Prisma.Decimal(fromCents(amountCents)),
          responsibleId: input.responsibleId,
        },
        update: {
          amount: new Prisma.Decimal(fromCents(amountCents)),
          responsibleId: input.responsibleId,
        },
      });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'pettyFund.update',
          entity: 'PettyCashFund',
          entityId: '1',
          payload: {
            before: before
              ? { amount: money(before.amount), responsibleId: before.responsibleId }
              : null,
            after: { amount: fromCents(amountCents), responsibleId: input.responsibleId },
          },
        },
        tx,
      );
    });
    return this.getPettyCash();
  }
}
