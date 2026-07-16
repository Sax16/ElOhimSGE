import { Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  courseAssignmentCreateSchema,
  courseAssignmentUpdateSchema,
  courseAssignmentsQuerySchema,
  type CourseAssignmentCreateInput,
  type CourseAssignmentUpdateInput,
  type CourseAssignmentsQuery,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { CourseAssignmentsService } from './course-assignments.service';

// Asignación docente por curso×sección (R4 — E1). Permiso 'estructura' (fuente de verdad de
// qué dicta cada docente). Año CERRADO → 409 al mutar. Rutas estáticas antes que las paramétricas.
@Controller('course-assignments')
export class CourseAssignmentsController {
  constructor(private readonly assignments: CourseAssignmentsService) {}

  @Get('options')
  @RequirePermission('estructura', 'ver')
  options(@(zodQuery(courseAssignmentsQuerySchema)) query: CourseAssignmentsQuery) {
    return this.assignments.options(query.yearId);
  }

  @Get()
  @RequirePermission('estructura', 'ver')
  list(@(zodQuery(courseAssignmentsQuerySchema)) query: CourseAssignmentsQuery) {
    return this.assignments.list(query.yearId);
  }

  @Post()
  @RequirePermission('estructura', 'editar')
  create(
    @(zodBody(courseAssignmentCreateSchema)) body: CourseAssignmentCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.assignments.create(body, actor);
  }

  @Patch(':id')
  @RequirePermission('estructura', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(courseAssignmentUpdateSchema)) body: CourseAssignmentUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.assignments.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('estructura', 'editar')
  async remove(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    await this.assignments.remove(id, actor);
  }
}
