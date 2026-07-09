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

  @Get(':id')
  @RequirePermission('apoderados', 'ver')
  findOne(@Param('id') id: string) {
    return this.guardians.findOne(id);
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
