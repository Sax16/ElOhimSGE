import { Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import {
  enrollmentCancelSchema,
  enrollmentListQuerySchema,
  enrollmentWizardSchema,
  type EnrollmentCancelInput,
  type EnrollmentListQuery,
  type EnrollmentWizardInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { EnrollmentService } from './enrollment.service';

// Matrícula (Etapa 5): listado, estadísticas, detalle, preview del cronograma, alta y anulación.
@Controller()
export class EnrollmentController {
  constructor(private readonly enrollment: EnrollmentService) {}

  @Get('enrollments')
  @RequirePermission('matricula', 'ver')
  list(@(zodQuery(enrollmentListQuerySchema)) query: EnrollmentListQuery) {
    return this.enrollment.list(query);
  }

  @Get('enrollments/stats')
  @RequirePermission('matricula', 'ver')
  stats(@Query('yearId') yearId?: string) {
    return this.enrollment.stats(yearId);
  }

  @Get('enrollments/:id')
  @RequirePermission('matricula', 'ver')
  findOne(@Param('id') id: string) {
    return this.enrollment.findOne(id);
  }

  @Post('enrollment/preview')
  @HttpCode(200)
  @RequirePermission('matricula', 'ver')
  preview(@(zodBody(enrollmentWizardSchema)) body: EnrollmentWizardInput) {
    return this.enrollment.preview(body);
  }

  @Post('enrollments')
  @RequirePermission('matricula', 'editar')
  create(
    @(zodBody(enrollmentWizardSchema)) body: EnrollmentWizardInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.enrollment.create(body, actor.sub);
  }

  @Post('enrollments/:id/cancel')
  @HttpCode(200)
  @RequirePermission('matricula', 'editar')
  cancel(
    @Param('id') id: string,
    @(zodBody(enrollmentCancelSchema)) body: EnrollmentCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.enrollment.cancel(id, body.reason, actor.sub);
  }
}
