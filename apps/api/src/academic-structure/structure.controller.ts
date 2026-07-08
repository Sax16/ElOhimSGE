import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  courseCreateSchema,
  coursesCopySchema,
  courseUpdateSchema,
  gradeCreateSchema,
  gradeUpdateSchema,
  levelCreateSchema,
  levelUpdateSchema,
  sectionCreateSchema,
  sectionUpdateSchema,
  type CourseCreateInput,
  type CoursesCopyInput,
  type CourseUpdateInput,
  type GradeCreateInput,
  type GradeUpdateInput,
  type LevelCreateInput,
  type LevelUpdateInput,
  type SectionCreateInput,
  type SectionUpdateInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { StructureService } from './structure.service';

@Controller()
export class StructureController {
  constructor(private readonly structure: StructureService) {}

  // ===== Niveles =====

  @Post('levels')
  @RequirePermission('estructura', 'editar')
  createLevel(@(zodBody(levelCreateSchema)) body: LevelCreateInput, @CurrentUser() actor: JwtUser) {
    return this.structure.createLevel(body, actor.sub);
  }

  @Patch('levels/:id')
  @RequirePermission('estructura', 'editar')
  updateLevel(
    @Param('id') id: string,
    @(zodBody(levelUpdateSchema)) body: LevelUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.structure.updateLevel(id, body, actor.sub);
  }

  // ===== Grados =====

  @Post('grade-levels')
  @RequirePermission('estructura', 'editar')
  createGrade(@(zodBody(gradeCreateSchema)) body: GradeCreateInput, @CurrentUser() actor: JwtUser) {
    return this.structure.createGrade(body, actor.sub);
  }

  @Patch('grade-levels/:id')
  @RequirePermission('estructura', 'editar')
  updateGrade(
    @Param('id') id: string,
    @(zodBody(gradeUpdateSchema)) body: GradeUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.structure.updateGrade(id, body, actor.sub);
  }

  @Get('grade-levels/:id/courses')
  @RequirePermission('estructura', 'ver')
  courses(@Param('id') id: string) {
    return this.structure.courses(id);
  }

  // ===== Secciones =====

  @Post('sections')
  @RequirePermission('estructura', 'editar')
  createSection(
    @(zodBody(sectionCreateSchema)) body: SectionCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.structure.createSection(body, actor.sub);
  }

  @Patch('sections/:id')
  @RequirePermission('estructura', 'editar')
  updateSection(
    @Param('id') id: string,
    @(zodBody(sectionUpdateSchema)) body: SectionUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.structure.updateSection(id, body, actor.sub);
  }

  @Get('sections/:id/roster')
  @RequirePermission('estructura', 'ver')
  roster(@Param('id') id: string) {
    return this.structure.roster(id);
  }

  // ===== Docentes (para asignar tutor / docente de curso) =====

  @Get('teachers')
  @RequirePermission('estructura', 'ver')
  teachers() {
    return this.structure.teachers();
  }

  // ===== Cursos (plan de estudios) =====

  @Post('courses')
  @RequirePermission('estructura', 'editar')
  createCourse(@(zodBody(courseCreateSchema)) body: CourseCreateInput, @CurrentUser() actor: JwtUser) {
    return this.structure.createCourse(body, actor.sub);
  }

  @Post('courses/copy')
  @RequirePermission('estructura', 'editar')
  copyCourses(@(zodBody(coursesCopySchema)) body: CoursesCopyInput, @CurrentUser() actor: JwtUser) {
    return this.structure.copyCourses(body, actor.sub);
  }

  @Patch('courses/:id')
  @RequirePermission('estructura', 'editar')
  updateCourse(
    @Param('id') id: string,
    @(zodBody(courseUpdateSchema)) body: CourseUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.structure.updateCourse(id, body, actor.sub);
  }
}
