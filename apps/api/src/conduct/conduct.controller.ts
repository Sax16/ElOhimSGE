import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  conductCancelSchema,
  conductCreateSchema,
  conductListQuerySchema,
  conductStudentsQuerySchema,
  type ConductCancelInput,
  type ConductCreateInput,
  type ConductListQuery,
  type ConductStudentsQuery,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { ConductService } from './conduct.service';

// Conducta e incidencias (R4 — E3). Permiso 'notas' (DOCENTE FULL por defecto). El docente solo
// sus secciones (tutor o CourseAssignment); ADMIN todo; anular solo ADMIN (reglas en el service).
// Rutas estáticas antes que las paramétricas.
@Controller('conduct')
export class ConductController {
  constructor(private readonly conduct: ConductService) {}

  @Get()
  @RequirePermission('notas', 'ver')
  list(@(zodQuery(conductListQuerySchema)) query: ConductListQuery, @CurrentUser() actor: JwtUser) {
    return this.conduct.list(actor, query);
  }

  @Get('students')
  @RequirePermission('notas', 'ver')
  students(
    @(zodQuery(conductStudentsQuerySchema)) query: ConductStudentsQuery,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.conduct.students(actor, query.search);
  }

  @Post()
  @RequirePermission('notas', 'editar')
  create(@(zodBody(conductCreateSchema)) body: ConductCreateInput, @CurrentUser() actor: JwtUser) {
    return this.conduct.create(body, actor);
  }

  @Get(':id')
  @RequirePermission('notas', 'ver')
  detail(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.conduct.detail(actor, id);
  }

  @Post(':id/notified')
  @RequirePermission('notas', 'editar')
  notified(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.conduct.notified(actor, id);
  }

  @Post(':id/close')
  @RequirePermission('notas', 'editar')
  close(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.conduct.close(actor, id);
  }

  // Anular (solo ADMIN, validado en el service).
  @Post(':id/cancel')
  @RequirePermission('notas', 'editar')
  cancel(
    @Param('id') id: string,
    @(zodBody(conductCancelSchema)) body: ConductCancelInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.conduct.cancel(actor, id, body);
  }
}
