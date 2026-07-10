import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import {
  programEnrollSchema,
  programEnrollmentCancelSchema,
  type ProgramEnrollInput,
  type ProgramEnrollmentCancelInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { ProgramEnrollmentService } from './program-enrollment.service';

// Inscripción a programas complementarios (independiente de la matrícula escolar).
@Controller()
export class ProgramEnrollmentController {
  constructor(private readonly service: ProgramEnrollmentService) {}

  @Post('programs/:id/enrollments/preview')
  @HttpCode(200)
  @RequirePermission('matricula', 'ver')
  preview(
    @Param('id') programId: string,
    @(zodBody(programEnrollSchema)) body: ProgramEnrollInput,
  ) {
    return this.service.preview(programId, body);
  }

  @Post('programs/:id/enrollments')
  @RequirePermission('matricula', 'editar')
  create(
    @Param('id') programId: string,
    @(zodBody(programEnrollSchema)) body: ProgramEnrollInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.service.create(programId, body, actor.sub);
  }

  @Get('programs/:id/enrollments')
  @RequirePermission('matricula', 'ver')
  roster(@Param('id') programId: string) {
    return this.service.roster(programId);
  }

  @Post('program-enrollments/:id/cancel')
  @HttpCode(200)
  @RequirePermission('matricula', 'editar')
  cancel(
    @Param('id') id: string,
    @(zodBody(programEnrollmentCancelSchema)) body: ProgramEnrollmentCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.service.cancel(id, body.reason, actor.sub);
  }
}
