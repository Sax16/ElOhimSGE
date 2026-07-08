import { Controller, Get, Patch } from '@nestjs/common';
import { institutionUpdateSchema, type InstitutionUpdateInput } from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { InstitutionService } from './institution.service';

@Controller('institution')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get()
  get() {
    return this.institutionService.get();
  }

  @Patch()
  @RequirePermission('config', 'editar')
  update(
    @(zodBody(institutionUpdateSchema)) body: InstitutionUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.institutionService.update(body, actor.sub);
  }
}
