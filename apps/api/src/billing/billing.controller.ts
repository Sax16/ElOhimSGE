import { Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common';
import {
  billingSettingsUpdateSchema,
  discountUpdateSchema,
  discountUpsertSchema,
  installmentCancelSchema,
  levelFeeUpdateSchema,
  saleConceptUpdateSchema,
  saleConceptUpsertSchema,
  type BillingSettingsUpdateInput,
  type DiscountUpdateInput,
  type DiscountUpsertInput,
  type InstallmentCancelInput,
  type LevelFeeUpdateInput,
  type SaleConceptUpdateInput,
  type SaleConceptUpsertInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { BillingService } from './billing.service';

// Tarifario y cobranza (Etapa 5): tarifario por nivel, configuración de mora, descuentos y anulación de cuotas.
@Controller()
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('fees')
  @RequirePermission('tarifario', 'ver')
  getFees(@Query('yearId') yearId?: string) {
    return this.billing.getFees(yearId);
  }

  @Put('fees/levels/:levelId')
  @RequirePermission('tarifario', 'editar')
  updateLevelFee(
    @Param('levelId') levelId: string,
    @(zodBody(levelFeeUpdateSchema)) body: LevelFeeUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.billing.updateLevelFee(levelId, body, actor.sub);
  }

  @Patch('billing-settings')
  @RequirePermission('tarifario', 'editar')
  updateSettings(
    @(zodBody(billingSettingsUpdateSchema)) body: BillingSettingsUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.billing.updateSettings(body, actor.sub);
  }

  @Post('discounts')
  @RequirePermission('tarifario', 'editar')
  createDiscount(
    @(zodBody(discountUpsertSchema)) body: DiscountUpsertInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.billing.createDiscount(body, actor.sub);
  }

  @Patch('discounts/:id')
  @RequirePermission('tarifario', 'editar')
  updateDiscount(
    @Param('id') id: string,
    @(zodBody(discountUpdateSchema)) body: DiscountUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.billing.updateDiscount(id, body, actor.sub);
  }

  @Post('installments/:id/cancel')
  @HttpCode(200)
  @RequirePermission('pensiones', 'editar')
  cancelInstallment(
    @Param('id') id: string,
    @(zodBody(installmentCancelSchema)) body: InstallmentCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.billing.cancelInstallment(id, body, actor.sub);
  }

  // ===== Conceptos de venta (otros conceptos) =====

  @Get('billing/sale-concepts')
  @RequirePermission('tarifario', 'ver')
  listSaleConcepts() {
    return this.billing.listSaleConcepts();
  }

  @Post('billing/sale-concepts')
  @RequirePermission('tarifario', 'editar')
  createSaleConcept(
    @(zodBody(saleConceptUpsertSchema)) body: SaleConceptUpsertInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.billing.createSaleConcept(body, actor.sub);
  }

  @Patch('billing/sale-concepts/:id')
  @RequirePermission('tarifario', 'editar')
  updateSaleConcept(
    @Param('id') id: string,
    @(zodBody(saleConceptUpdateSchema)) body: SaleConceptUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.billing.updateSaleConcept(id, body, actor.sub);
  }

  @Delete('billing/sale-concepts/:id')
  @RequirePermission('tarifario', 'editar')
  deleteSaleConcept(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.billing.deleteSaleConcept(id, actor.sub);
  }
}
