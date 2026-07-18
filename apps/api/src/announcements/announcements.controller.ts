import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  announcementCreateSchema,
  announcementListQuerySchema,
  announcementUpdateSchema,
  type AnnouncementCreateInput,
  type AnnouncementListQuery,
  type AnnouncementUpdateInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { AnnouncementsService } from './announcements.service';

// Comunicados (R4 — E4). Permiso 'comunicados' (ver para GET, editar para mutaciones). Canal wa.me
// manual (el front abre los enlaces y luego confirma /send). Rutas estáticas antes que paramétricas.
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get()
  @RequirePermission('comunicados', 'ver')
  list(@(zodQuery(announcementListQuerySchema)) query: AnnouncementListQuery) {
    return this.announcements.list(query);
  }

  @Get('options')
  @RequirePermission('comunicados', 'ver')
  options() {
    return this.announcements.options();
  }

  @Post()
  @RequirePermission('comunicados', 'editar')
  create(
    @(zodBody(announcementCreateSchema)) body: AnnouncementCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.announcements.create(body, actor);
  }

  @Get(':id')
  @RequirePermission('comunicados', 'ver')
  detail(@Param('id') id: string) {
    return this.announcements.detail(id);
  }

  @Patch(':id')
  @RequirePermission('comunicados', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(announcementUpdateSchema)) body: AnnouncementUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.announcements.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('comunicados', 'editar')
  async remove(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    await this.announcements.remove(id, actor);
  }

  @Get(':id/recipients')
  @RequirePermission('comunicados', 'ver')
  recipients(@Param('id') id: string) {
    return this.announcements.recipients(id);
  }

  @Post(':id/send')
  @RequirePermission('comunicados', 'editar')
  send(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.announcements.send(id, actor);
  }
}
