import { Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { type Response } from 'express';
import {
  payrollCancelPaymentSchema,
  payrollExportQuerySchema,
  payrollGrossUpdateSchema,
  payrollItemCancelSchema,
  payrollItemCreateSchema,
  payrollPayAllSchema,
  payrollPaySchema,
  payrollQuerySchema,
  type PayrollCancelPaymentInput,
  type PayrollExportQuery,
  type PayrollGrossUpdateInput,
  type PayrollItemCancelInput,
  type PayrollItemCreateInput,
  type PayrollPayAllInput,
  type PayrollPayInput,
  type PayrollQuery,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { PayrollService } from './payroll.service';

// Planilla (R3 — E3). Permiso 'personal' (ver/editar); pagar y anular pago validan rol ADMIN en el
// service (como las exoneraciones de R2). El pago crea su gasto en tesorería por evento (origin PLANILLA).
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  @Get()
  @RequirePermission('personal', 'ver')
  list(@(zodQuery(payrollQuerySchema)) query: PayrollQuery, @CurrentUser() actor: JwtUser) {
    return this.payroll.list(query, actor);
  }

  // Export antes de las rutas con :periodId para que no lo capture el parámetro.
  @Get('export')
  @RequirePermission('personal', 'ver')
  async export(
    @(zodQuery(payrollExportQuerySchema)) query: PayrollExportQuery,
    @Res() res: Response,
  ) {
    const file = await this.payroll.exportMonth(query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }

  @Post(':periodId/refresh')
  @RequirePermission('personal', 'editar')
  refresh(@Param('periodId') periodId: string, @CurrentUser() actor: JwtUser) {
    return this.payroll.refresh(periodId, actor);
  }

  @Post(':periodId/pay-all')
  @RequirePermission('personal', 'editar')
  payAll(
    @Param('periodId') periodId: string,
    @(zodBody(payrollPayAllSchema)) body: PayrollPayAllInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.payroll.payAll(periodId, body.method, actor);
  }

  @Patch('entries/:id/gross')
  @RequirePermission('personal', 'editar')
  updateGross(
    @Param('id') id: string,
    @(zodBody(payrollGrossUpdateSchema)) body: PayrollGrossUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.payroll.updateGross(id, body, actor);
  }

  @Post('entries/:id/items')
  @RequirePermission('personal', 'editar')
  addItem(
    @Param('id') id: string,
    @(zodBody(payrollItemCreateSchema)) body: PayrollItemCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.payroll.addItem(id, body, actor);
  }

  @Post('items/:id/cancel')
  @RequirePermission('personal', 'editar')
  cancelItem(
    @Param('id') id: string,
    @(zodBody(payrollItemCancelSchema)) body: PayrollItemCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.payroll.cancelItem(id, body.reason, actor);
  }

  @Post('entries/:id/pay')
  @RequirePermission('personal', 'editar')
  pay(
    @Param('id') id: string,
    @(zodBody(payrollPaySchema)) body: PayrollPayInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.payroll.pay(id, body, actor);
  }

  @Post('entries/:id/cancel-payment')
  @RequirePermission('personal', 'editar')
  cancelPayment(
    @Param('id') id: string,
    @(zodBody(payrollCancelPaymentSchema)) body: PayrollCancelPaymentInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.payroll.cancelPayment(id, body.reason, actor);
  }
}
