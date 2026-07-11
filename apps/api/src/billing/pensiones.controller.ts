import { Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import {
  installmentsQuerySchema,
  lateFeeExonerateSchema,
  reminderCreateSchema,
  type InstallmentsQueryInput,
  type LateFeeExonerateInput,
  type ReminderCreateInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { PensionesService } from './pensiones.service';

// Indicadores: año + mes (mes opcional; por defecto el mes en curso).
const statsQuerySchema = z.object({
  yearId: z.string().min(1),
  month: z.coerce.number().int().min(3).max(12).optional(),
});
type StatsQueryInput = z.infer<typeof statsQuerySchema>;

// Pensiones (R2 — E2): seguimiento de cobranza, mora y recordatorios. El cobro va por Caja.
@Controller('billing')
export class PensionesController {
  constructor(private readonly pensiones: PensionesService) {}

  @Get('installments')
  @RequirePermission('pensiones', 'ver')
  listInstallments(@(zodQuery(installmentsQuerySchema)) query: InstallmentsQueryInput) {
    return this.pensiones.listInstallments(query);
  }

  @Get('installments/stats')
  @RequirePermission('pensiones', 'ver')
  stats(@(zodQuery(statsQuerySchema)) query: StatsQueryInput) {
    return this.pensiones.stats(query.yearId, query.month);
  }

  @Post('installments/:id/exonerate-late-fee')
  @HttpCode(200)
  @RequirePermission('pensiones', 'editar')
  exonerateLateFee(
    @Param('id') id: string,
    @(zodBody(lateFeeExonerateSchema)) body: LateFeeExonerateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.pensiones.exonerateLateFee(id, body, actor);
  }

  @Get('reminders/preview')
  @RequirePermission('pensiones', 'ver')
  reminderPreview(@Query('guardianId') guardianId: string) {
    return this.pensiones.reminderPreview(guardianId);
  }

  @Post('reminders')
  @RequirePermission('pensiones', 'editar')
  sendReminder(
    @(zodBody(reminderCreateSchema)) body: ReminderCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.pensiones.sendReminder(body.guardianId, actor);
  }

  @Post('late-fees/run')
  @HttpCode(200)
  @RequirePermission('pensiones', 'editar')
  runLateFees(@CurrentUser() actor: JwtUser) {
    return this.pensiones.runLateFees(actor);
  }
}
