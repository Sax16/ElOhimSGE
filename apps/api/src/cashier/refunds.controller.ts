import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { z } from 'zod';
import {
  refundCreateSchema,
  refundExecuteSchema,
  refundRejectSchema,
  type RefundCreateInput,
  type RefundExecuteInput,
  type RefundRejectInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { RefundsService } from './refunds.service';

const refundsQuerySchema = z.object({
  status: z.enum(['PENDIENTE_APROBACION', 'APROBADA', 'RECHAZADA', 'DEVUELTA']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
type RefundsQueryInput = z.infer<typeof refundsQuerySchema>;

// Devoluciones (R2 — E3): solicitud → aprobación/rechazo (Admin) → ejecución en Caja.
@Controller('cashier/refunds')
export class RefundsController {
  constructor(private readonly refunds: RefundsService) {}

  @Get()
  @RequirePermission('caja', 'ver')
  list(@(zodQuery(refundsQuerySchema)) query: RefundsQueryInput) {
    return this.refunds.list(query.status, query.page, query.pageSize);
  }

  @Post()
  @RequirePermission('caja', 'editar')
  create(@(zodBody(refundCreateSchema)) body: RefundCreateInput, @CurrentUser() actor: JwtUser) {
    return this.refunds.create(body, actor);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('caja', 'editar')
  approve(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.refunds.approve(id, actor);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('caja', 'editar')
  reject(
    @Param('id') id: string,
    @(zodBody(refundRejectSchema)) body: RefundRejectInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.refunds.reject(id, body.reason, actor);
  }

  @Post(':id/execute')
  @HttpCode(200)
  @RequirePermission('caja', 'editar')
  execute(
    @Param('id') id: string,
    @(zodBody(refundExecuteSchema)) body: RefundExecuteInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.refunds.execute(id, body, actor);
  }
}
