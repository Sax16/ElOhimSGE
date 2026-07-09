import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type BillingSettingsUpdateInput,
  type DiscountUpdateInput,
  type DiscountUpsertInput,
  type InstallmentCancelInput,
  type LevelFeeUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { YearAccessService } from '../academic-structure/year-access.service';

// Prisma.Decimal → string decimal de dos dígitos "280.00" (frontera de dinero de la API).
function money(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly yearAccess: YearAccessService,
  ) {}

  private async resolveYearId(yearId?: string): Promise<string> {
    if (yearId) return yearId;
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year.id;
  }

  // GET /api/fees — tarifario por nivel + programas + configuración + descuentos con beneficiarios.
  async getFees(yearId?: string) {
    const resolvedYearId = await this.resolveYearId(yearId);

    const [levels, programs, settings, discounts] = await Promise.all([
      this.prisma.level.findMany({
        where: { academicYearId: resolvedYearId },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, fee: true },
      }),
      this.prisma.program.findMany({
        where: { academicYearId: resolvedYearId },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          type: true,
          enrollmentFee: true,
          monthlyFee: true,
          status: true,
        },
      }),
      this.prisma.billingSettings.findUnique({ where: { id: 1 } }),
      this.prisma.discount.findMany({ orderBy: { name: 'asc' } }),
    ]);

    // Beneficiarios: matrículas activas (no anuladas) del año con cada descuento.
    const grouped = await this.prisma.enrollment.groupBy({
      by: ['discountId'],
      where: { academicYearId: resolvedYearId, canceledAt: null, discountId: { not: null } },
      _count: { _all: true },
    });
    const beneficiaries = new Map<string, number>();
    for (const g of grouped) {
      if (g.discountId) beneficiaries.set(g.discountId, g._count._all);
    }

    return {
      levels: levels.map((l) => ({
        levelId: l.id,
        levelName: l.name,
        enrollmentFee: l.fee ? money(l.fee.enrollmentFee) : null,
        monthlyFee: l.fee ? money(l.fee.monthlyFee) : null,
        installmentsCount: l.fee?.installmentsCount ?? null,
      })),
      programs: programs.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        enrollmentFee: money(p.enrollmentFee),
        monthlyFee: money(p.monthlyFee),
        status: p.status,
      })),
      settings: settings
        ? {
            lateFeeAmount: money(settings.lateFeeAmount),
            graceDays: settings.graceDays,
            transferCutoffDay: settings.transferCutoffDay,
            autoLateFee: settings.autoLateFee,
            dueDayOfMonth: settings.dueDayOfMonth,
          }
        : null,
      discounts: discounts.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        percent: money(d.percent),
        application: d.application,
        condition: d.condition,
        status: d.status,
        beneficiaries: beneficiaries.get(d.id) ?? 0,
      })),
    };
  }

  // PUT /api/fees/levels/:levelId — upsert del tarifario del nivel. No toca cronogramas existentes.
  async updateLevelFee(levelId: string, input: LevelFeeUpdateInput, actorId: string) {
    const level = await this.prisma.level.findUnique({
      where: { id: levelId },
      select: { id: true },
    });
    if (!level) throw new NotFoundException('Nivel no encontrado');
    await this.yearAccess.assertYearOpenByLevel(levelId);

    return this.prisma.$transaction(async (tx) => {
      const fee = await tx.levelFee.upsert({
        where: { levelId },
        create: {
          levelId,
          enrollmentFee: input.enrollmentFee,
          monthlyFee: input.monthlyFee,
          installmentsCount: input.installmentsCount,
        },
        update: {
          enrollmentFee: input.enrollmentFee,
          monthlyFee: input.monthlyFee,
          installmentsCount: input.installmentsCount,
        },
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'fee.update',
          entity: 'LevelFee',
          entityId: fee.id,
          payload: {
            levelId,
            enrollmentFee: input.enrollmentFee,
            monthlyFee: input.monthlyFee,
            installmentsCount: input.installmentsCount,
          },
        },
        tx,
      );
      return {
        levelId,
        enrollmentFee: money(fee.enrollmentFee),
        monthlyFee: money(fee.monthlyFee),
        installmentsCount: fee.installmentsCount,
      };
    });
  }

  // PATCH /api/billing-settings — configuración de cobranza (singleton id=1).
  async updateSettings(input: BillingSettingsUpdateInput, actorId: string) {
    const data: Prisma.BillingSettingsUpdateInput = {};
    const payload: Record<string, unknown> = {};
    if (input.lateFeeAmount !== undefined) {
      data.lateFeeAmount = input.lateFeeAmount;
      payload.lateFeeAmount = input.lateFeeAmount;
    }
    if (input.graceDays !== undefined) {
      data.graceDays = input.graceDays;
      payload.graceDays = input.graceDays;
    }
    if (input.transferCutoffDay !== undefined) {
      data.transferCutoffDay = input.transferCutoffDay;
      payload.transferCutoffDay = input.transferCutoffDay;
    }
    if (input.autoLateFee !== undefined) {
      data.autoLateFee = input.autoLateFee;
      payload.autoLateFee = input.autoLateFee;
    }
    if (input.dueDayOfMonth !== undefined) {
      data.dueDayOfMonth = input.dueDayOfMonth;
      payload.dueDayOfMonth = input.dueDayOfMonth;
    }

    return this.prisma.$transaction(async (tx) => {
      // El singleton siempre existe (seed); update basta. Create solo cubre el primer arranque.
      const settings = await tx.billingSettings.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          lateFeeAmount: input.lateFeeAmount ?? '5.00',
          graceDays: input.graceDays ?? 3,
          transferCutoffDay: input.transferCutoffDay ?? 20,
          autoLateFee: input.autoLateFee ?? true,
          dueDayOfMonth: input.dueDayOfMonth ?? null,
        },
        update: data,
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'billing_settings.update',
          entity: 'BillingSettings',
          entityId: '1',
          payload: payload as Prisma.InputJsonValue,
        },
        tx,
      );
      return {
        lateFeeAmount: money(settings.lateFeeAmount),
        graceDays: settings.graceDays,
        transferCutoffDay: settings.transferCutoffDay,
        autoLateFee: settings.autoLateFee,
        dueDayOfMonth: settings.dueDayOfMonth,
      };
    });
  }

  // POST /api/discounts — alta de descuento (sin código; el catálogo con code es del seed).
  async createDiscount(input: DiscountUpsertInput, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const discount = await tx.discount.create({
        data: {
          name: input.name,
          percent: input.percent,
          application: input.application,
          condition: input.condition,
          status: input.status,
        },
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'discount.create',
          entity: 'Discount',
          entityId: discount.id,
          payload: { name: discount.name, percent: input.percent },
        },
        tx,
      );
      return this.serializeDiscount(discount);
    });
  }

  // PATCH /api/discounts/:id — edición parcial. Sin DELETE (nada se borra).
  async updateDiscount(id: string, input: DiscountUpdateInput, actorId: string) {
    const existing = await this.prisma.discount.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException('Descuento no encontrado');

    const data: Prisma.DiscountUpdateInput = {};
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) {
      data.name = input.name;
      payload.name = input.name;
    }
    if (input.percent !== undefined) {
      data.percent = input.percent;
      payload.percent = input.percent;
    }
    if (input.application !== undefined) {
      data.application = input.application;
      payload.application = input.application;
    }
    if (input.condition !== undefined) {
      data.condition = input.condition;
      payload.condition = input.condition;
    }
    if (input.status !== undefined) {
      data.status = input.status;
      payload.status = input.status;
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const discount = await tx.discount.update({ where: { id }, data });
        await this.audit.log(
          {
            userId: actorId,
            action: 'discount.update',
            entity: 'Discount',
            entityId: id,
            payload: payload as Prisma.InputJsonValue,
          },
          tx,
        );
        return this.serializeDiscount(discount);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un descuento con ese código');
      }
      throw error;
    }
  }

  // POST /api/installments/:id/cancel — anula una cuota PENDIENTE (motivo obligatorio).
  async cancelInstallment(id: string, input: InstallmentCancelInput, actorId: string) {
    const installment = await this.prisma.installment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!installment) throw new NotFoundException('Cuota no encontrada');
    if (installment.status !== 'PENDIENTE') {
      throw new BadRequestException('Solo se puede anular una cuota pendiente');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.installment.update({
        where: { id },
        data: {
          status: 'ANULADO',
          cancelReason: input.reason,
          canceledAt: new Date(),
          canceledById: actorId,
        },
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'installment.cancel',
          entity: 'Installment',
          entityId: id,
          payload: { reason: input.reason, concept: updated.concept },
        },
        tx,
      );
      return { id: updated.id, status: updated.status };
    });
  }

  private serializeDiscount(d: {
    id: string;
    code: string | null;
    name: string;
    percent: Prisma.Decimal;
    application: string;
    condition: string;
    status: string;
  }) {
    return {
      id: d.id,
      code: d.code,
      name: d.name,
      percent: money(d.percent),
      application: d.application,
      condition: d.condition,
      status: d.status,
    };
  }
}
