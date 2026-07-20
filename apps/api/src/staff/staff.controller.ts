import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  staffAccessSchema,
  staffCreateSchema,
  staffListQuerySchema,
  staffUpdateSchema,
  type StaffAccessInput,
  type StaffCreateInput,
  type StaffListQuery,
  type StaffUpdateInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  @Get()
  @RequirePermission('personal', 'ver')
  list(@(zodQuery(staffListQuerySchema)) query: StaffListQuery) {
    return this.staff.list(query);
  }

  // Antes de :id para que la ruta estática no la capture el parámetro.
  @Get('catalogs')
  @RequirePermission('personal', 'ver')
  catalogs() {
    return this.staff.catalogs();
  }

  @Post()
  @RequirePermission('personal', 'editar')
  create(@(zodBody(staffCreateSchema)) body: StaffCreateInput, @CurrentUser() actor: JwtUser) {
    return this.staff.create(body, actor.sub);
  }

  @Get(':id')
  @RequirePermission('personal', 'ver')
  findOne(@Param('id') id: string) {
    return this.staff.findOne(id);
  }

  // Acceso al sistema desde la ficha (solo personal docente).
  @Get(':id/access')
  @RequirePermission('personal', 'ver')
  getAccess(@Param('id') id: string) {
    return this.staff.getAccess(id);
  }

  @Post(':id/access')
  @RequirePermission('personal', 'editar')
  generateAccess(
    @Param('id') id: string,
    @(zodBody(staffAccessSchema)) body: StaffAccessInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.staff.generateAccess(id, body, actor.sub);
  }

  @Patch(':id')
  @RequirePermission('personal', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(staffUpdateSchema)) body: StaffUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.staff.update(id, body, actor.sub);
  }
}
