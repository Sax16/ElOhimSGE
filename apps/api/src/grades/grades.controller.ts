import { Controller, Get, Put, Res } from '@nestjs/common';
import { type Response } from 'express';
import {
  aspectsSaveSchema,
  aspectsSheetQuerySchema,
  gradeSheetQuerySchema,
  gradeSheetSaveSchema,
  gradesPeriodsQuerySchema,
  myCoursesQuerySchema,
  reportCardQuerySchema,
  type AspectsSaveInput,
  type AspectsSheetQuery,
  type GradeSheetQuery,
  type GradeSheetSaveInput,
  type GradesPeriodsQuery,
  type MyCoursesQuery,
  type ReportCardQuery,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { GradesService } from './grades.service';

// Notas por competencias (R4 — E2). Permiso 'notas' (DOCENTE FULL por defecto). El docente solo
// sus cursos×secciones de CourseAssignment; el tutor los aspectos de su aula; ADMIN todo (reglas
// en el service). Rutas estáticas antes que las paramétricas.
@Controller('grades')
export class GradesController {
  constructor(private readonly grades: GradesService) {}

  @Get('periods')
  @RequirePermission('notas', 'ver')
  periods(@(zodQuery(gradesPeriodsQuerySchema)) query: GradesPeriodsQuery) {
    return this.grades.periods(query.yearId);
  }

  @Get('my-courses')
  @RequirePermission('notas', 'ver')
  myCourses(@(zodQuery(myCoursesQuerySchema)) query: MyCoursesQuery, @CurrentUser() actor: JwtUser) {
    return this.grades.myCourses(actor, query.periodId);
  }

  @Get('sheet')
  @RequirePermission('notas', 'ver')
  sheet(@(zodQuery(gradeSheetQuerySchema)) query: GradeSheetQuery, @CurrentUser() actor: JwtUser) {
    return this.grades.sheet(actor, query.sectionId, query.courseId, query.periodId);
  }

  @Get('sheet/export')
  @RequirePermission('notas', 'ver')
  async exportSheet(
    @(zodQuery(gradeSheetQuerySchema)) query: GradeSheetQuery,
    @CurrentUser() actor: JwtUser,
    @Res() res: Response,
  ) {
    const file = await this.grades.exportSheet(actor, query.sectionId, query.courseId, query.periodId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }

  @Put('sheet')
  @RequirePermission('notas', 'editar')
  saveSheet(@(zodBody(gradeSheetSaveSchema)) body: GradeSheetSaveInput, @CurrentUser() actor: JwtUser) {
    return this.grades.saveSheet(body, actor);
  }

  @Get('aspects-sheet')
  @RequirePermission('notas', 'ver')
  aspectsSheet(
    @(zodQuery(aspectsSheetQuerySchema)) query: AspectsSheetQuery,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.grades.aspectsSheet(actor, query.sectionId, query.periodId);
  }

  @Put('aspects')
  @RequirePermission('notas', 'editar')
  saveAspects(@(zodBody(aspectsSaveSchema)) body: AspectsSaveInput, @CurrentUser() actor: JwtUser) {
    return this.grades.saveAspects(body, actor);
  }

  @Get('report-card')
  @RequirePermission('notas', 'ver')
  reportCard(@(zodQuery(reportCardQuerySchema)) query: ReportCardQuery, @CurrentUser() actor: JwtUser) {
    return this.grades.reportCard(actor, query.enrollmentId, query.periodId);
  }
}
