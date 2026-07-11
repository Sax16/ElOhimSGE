import { Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import {
  cashSessionCloseSchema,
  cashSessionOpenSchema,
  receiptCancelSchema,
  receiptCreateSchema,
  type CashSessionCloseInput,
  type CashSessionOpenInput,
  type ReceiptCancelInput,
  type ReceiptCreateInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { CashierService } from './cashier.service';

// Caja y cobros (R2 — E1): caja del día, ventanilla de cobro y recibos.
@Controller('cashier')
export class CashierController {
  constructor(private readonly cashier: CashierService) {}

  @Get('day')
  @RequirePermission('caja', 'ver')
  getDay() {
    return this.cashier.getDay();
  }

  @Post('session/open')
  @RequirePermission('caja', 'editar')
  openSession(
    @(zodBody(cashSessionOpenSchema)) body: CashSessionOpenInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.cashier.openSession(body, actor.sub);
  }

  @Post('session/close')
  @RequirePermission('caja', 'editar')
  closeSession(
    @(zodBody(cashSessionCloseSchema)) body: CashSessionCloseInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.cashier.closeSession(body, actor.sub);
  }

  @Get('sale-concepts')
  @RequirePermission('caja', 'ver')
  listSaleConcepts() {
    return this.cashier.listSaleConcepts();
  }

  @Get('students')
  @RequirePermission('caja', 'ver')
  searchStudents(@Query('q') q?: string) {
    return this.cashier.searchStudents(q);
  }

  @Get('students/:id/collectibles')
  @RequirePermission('caja', 'ver')
  collectibles(@Param('id') id: string) {
    return this.cashier.collectibles(id);
  }

  @Post('receipts')
  @RequirePermission('caja', 'editar')
  createReceipt(
    @(zodBody(receiptCreateSchema)) body: ReceiptCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.cashier.createReceipt(body, actor.sub);
  }

  @Get('receipts/:id')
  @RequirePermission('caja', 'ver')
  getReceipt(@Param('id') id: string) {
    return this.cashier.getReceipt(id);
  }

  @Post('receipts/:id/cancel')
  @HttpCode(200)
  @RequirePermission('caja', 'editar')
  cancelReceipt(
    @Param('id') id: string,
    @(zodBody(receiptCancelSchema)) body: ReceiptCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.cashier.cancelReceipt(id, body.reason, actor.sub);
  }
}
