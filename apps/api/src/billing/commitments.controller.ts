import { Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import {
  commitmentCancelSchema,
  commitmentCreateSchema,
  commitmentRejectSchema,
  type CommitmentCancelInput,
  type CommitmentCreateInput,
  type CommitmentRejectInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { CommitmentsService } from './commitments.service';

const commitmentsQuerySchema = z.object({
  yearId: z.string().min(1),
  status: z
    .enum(['PROPUESTO', 'VIGENTE', 'CUMPLIDO', 'INCUMPLIDO', 'RECHAZADO', 'ANULADO'])
    .optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
type CommitmentsQueryInput = z.infer<typeof commitmentsQuerySchema>;

// Compromisos de pago (R2 — E3). Permiso `pensiones`; aprobación/rechazo/anulación exigen ADMIN.
@Controller('billing/commitments')
export class CommitmentsController {
  constructor(private readonly commitments: CommitmentsService) {}

  @Get()
  @RequirePermission('pensiones', 'ver')
  list(@(zodQuery(commitmentsQuerySchema)) query: CommitmentsQueryInput) {
    return this.commitments.list(query);
  }

  @Get('eligible-installments')
  @RequirePermission('pensiones', 'ver')
  eligibleInstallments(@Query('guardianId') guardianId: string) {
    return this.commitments.eligibleInstallments(guardianId);
  }

  @Post()
  @RequirePermission('pensiones', 'editar')
  create(
    @(zodBody(commitmentCreateSchema)) body: CommitmentCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.commitments.create(body, actor);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermission('pensiones', 'editar')
  approve(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.commitments.approve(id, actor);
  }

  @Post(':id/reject')
  @HttpCode(200)
  @RequirePermission('pensiones', 'editar')
  reject(
    @Param('id') id: string,
    @(zodBody(commitmentRejectSchema)) body: CommitmentRejectInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.commitments.reject(id, body.reason, actor);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @RequirePermission('pensiones', 'editar')
  cancel(
    @Param('id') id: string,
    @(zodBody(commitmentCancelSchema)) body: CommitmentCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.commitments.cancel(id, body.reason, actor);
  }
}
