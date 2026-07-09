import { Controller, Param, Post, Put } from '@nestjs/common';
import { linkGuardianSchema, type LinkGuardianInput } from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { GuardiansService } from './guardians.service';

// Vínculos N:M estudiante↔apoderado (bajo /students/... pero gestionados por el módulo apoderados).
@Controller('students/:studentId/guardians')
export class StudentGuardiansController {
  constructor(private readonly guardians: GuardiansService) {}

  @Put(':guardianId')
  @RequirePermission('apoderados', 'editar')
  link(
    @Param('studentId') studentId: string,
    @Param('guardianId') guardianId: string,
    @(zodBody(linkGuardianSchema)) body: LinkGuardianInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.guardians.link(studentId, guardianId, body, actor.sub);
  }

  @Post(':guardianId/unlink')
  @RequirePermission('apoderados', 'editar')
  unlink(
    @Param('studentId') studentId: string,
    @Param('guardianId') guardianId: string,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.guardians.unlink(studentId, guardianId, actor.sub);
  }
}
