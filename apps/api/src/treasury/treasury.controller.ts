import { Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { z } from 'zod';
import {
  TREASURY_KINDS,
  pettyExpenseCancelSchema,
  pettyExpenseCreateSchema,
  pettyFundUpdateSchema,
  pettyRenditionCreateSchema,
  treasuryCategoryUpdateSchema,
  treasuryCategoryUpsertSchema,
  treasuryMovementCancelSchema,
  treasuryMovementCreateSchema,
  treasuryMovementUpdateSchema,
  type PettyExpenseCancelInput,
  type PettyExpenseCreateInput,
  type PettyFundUpdateInput,
  type PettyRenditionCreateInput,
  type TreasuryCategoryUpdateInput,
  type TreasuryCategoryUpsertInput,
  type TreasuryMovementCancelInput,
  type TreasuryMovementCreateInput,
  type TreasuryMovementUpdateInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { TreasuryService } from './treasury.service';

const now = new Date();

// Listado de movimientos: mes/año (por defecto el mes/año actual) + filtros.
const movementsQuerySchema = z.object({
  kind: z.enum(TREASURY_KINDS).optional(),
  categoryId: z.string().optional(),
  month: z.coerce.number().int().min(1).max(12).default(now.getMonth() + 1),
  year: z.coerce.number().int().min(2000).max(2100).default(now.getFullYear()),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
type MovementsQueryInput = z.infer<typeof movementsQuerySchema>;

const summaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).default(now.getMonth() + 1),
  year: z.coerce.number().int().min(2000).max(2100).default(now.getFullYear()),
});
type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;

const categoriesQuerySchema = z.object({
  kind: z.enum(TREASURY_KINDS).optional(),
});
type CategoriesQueryInput = z.infer<typeof categoriesQuerySchema>;

// Tesorería (R2 — E4): gastos, otros ingresos, categorías, caja chica y resumen del mes.
@Controller('treasury')
export class TreasuryController {
  constructor(private readonly treasury: TreasuryService) {}

  // ===== Movimientos =====

  @Get('movements')
  @RequirePermission('tesoreria', 'ver')
  listMovements(@(zodQuery(movementsQuerySchema)) query: MovementsQueryInput) {
    return this.treasury.listMovements(query);
  }

  @Post('movements')
  @RequirePermission('tesoreria', 'editar')
  createMovement(
    @(zodBody(treasuryMovementCreateSchema)) body: TreasuryMovementCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.createMovement(body, actor);
  }

  @Patch('movements/:id')
  @RequirePermission('tesoreria', 'editar')
  updateMovement(
    @Param('id') id: string,
    @(zodBody(treasuryMovementUpdateSchema)) body: TreasuryMovementUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.updateMovement(id, body, actor);
  }

  @Post('movements/:id/cancel')
  @HttpCode(200)
  @RequirePermission('tesoreria', 'editar')
  cancelMovement(
    @Param('id') id: string,
    @(zodBody(treasuryMovementCancelSchema)) body: TreasuryMovementCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.cancelMovement(id, body.reason, actor);
  }

  // ===== Categorías =====

  @Get('categories')
  @RequirePermission('tesoreria', 'ver')
  listCategories(@(zodQuery(categoriesQuerySchema)) query: CategoriesQueryInput) {
    return this.treasury.listCategories(query.kind);
  }

  @Post('categories')
  @RequirePermission('tesoreria', 'editar')
  createCategory(
    @(zodBody(treasuryCategoryUpsertSchema)) body: TreasuryCategoryUpsertInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.createCategory(body, actor);
  }

  @Patch('categories/:id')
  @RequirePermission('tesoreria', 'editar')
  updateCategory(
    @Param('id') id: string,
    @(zodBody(treasuryCategoryUpdateSchema)) body: TreasuryCategoryUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.updateCategory(id, body, actor);
  }

  @Delete('categories/:id')
  @RequirePermission('tesoreria', 'editar')
  deleteCategory(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.treasury.deleteCategory(id, actor);
  }

  // ===== Resumen del mes =====

  @Get('summary')
  @RequirePermission('tesoreria', 'ver')
  summary(@(zodQuery(summaryQuerySchema)) query: SummaryQueryInput) {
    return this.treasury.summary(query.month, query.year);
  }

  // ===== Caja chica =====

  @Get('petty-cash')
  @RequirePermission('tesoreria', 'ver')
  getPettyCash() {
    return this.treasury.getPettyCash();
  }

  @Post('petty-cash/expenses')
  @RequirePermission('tesoreria', 'editar')
  createPettyExpense(
    @(zodBody(pettyExpenseCreateSchema)) body: PettyExpenseCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.createPettyExpense(body, actor);
  }

  @Post('petty-cash/expenses/:id/cancel')
  @HttpCode(200)
  @RequirePermission('tesoreria', 'editar')
  cancelPettyExpense(
    @Param('id') id: string,
    @(zodBody(pettyExpenseCancelSchema)) body: PettyExpenseCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.cancelPettyExpense(id, body.reason, actor);
  }

  @Post('petty-cash/renditions')
  @RequirePermission('tesoreria', 'editar')
  createRendition(
    @(zodBody(pettyRenditionCreateSchema)) body: PettyRenditionCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.createRendition(body.source, actor);
  }

  @Get('petty-cash/renditions/:id')
  @RequirePermission('tesoreria', 'ver')
  getRendition(@Param('id') id: string) {
    return this.treasury.getRendition(id);
  }

  @Patch('petty-cash/fund')
  @RequirePermission('tesoreria', 'editar')
  updateFund(
    @(zodBody(pettyFundUpdateSchema)) body: PettyFundUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.treasury.updateFund(body, actor);
  }
}
