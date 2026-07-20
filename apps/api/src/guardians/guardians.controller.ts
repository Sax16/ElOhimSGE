import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  guardianCreateSchema,
  guardianListQuerySchema,
  guardianUpdateSchema,
  type GuardianCreateInput,
  type GuardianListQuery,
  type GuardianUpdateInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { GuardiansService } from './guardians.service';

@Controller('guardians')
export class GuardiansController {
  constructor(private readonly guardians: GuardiansService) {}

  @Get()
  @RequirePermission('apoderados', 'ver')
  list(@(zodQuery(guardianListQuerySchema)) query: GuardianListQuery) {
    return this.guardians.list(query);
  }

  @Post()
  @RequirePermission('apoderados', 'editar')
  create(@(zodBody(guardianCreateSchema)) body: GuardianCreateInput, @CurrentUser() actor: JwtUser) {
    return this.guardians.create(body, actor.sub);
  }

  // Acceso al portal del apoderado (v1.0.0). La ruta estática (bulk) va antes que las paramétricas.
  @Post('access/bulk')
  @RequirePermission('apoderados', 'editar')
  bulkAccess(@CurrentUser() actor: JwtUser) {
    return this.guardians.bulkAccess(actor.sub);
  }

  @Get(':id')
  @RequirePermission('apoderados', 'ver')
  findOne(@Param('id') id: string) {
    return this.guardians.findOne(id);
  }

  @Get(':id/access')
  @RequirePermission('apoderados', 'ver')
  getAccess(@Param('id') id: string) {
    return this.guardians.getAccess(id);
  }

  @Post(':id/access')
  @RequirePermission('apoderados', 'editar')
  generateAccess(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.guardians.generateAccess(id, actor.sub);
  }

  @Patch(':id')
  @RequirePermission('apoderados', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(guardianUpdateSchema)) body: GuardianUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.guardians.update(id, body, actor.sub);
  }
}
