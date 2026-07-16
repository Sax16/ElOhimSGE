import { Controller, Get, Param, Patch, Put, Res } from '@nestjs/common';
import { type Response } from 'express';
import {
  attendanceMonthlyQuerySchema,
  attendanceRosterQuerySchema,
  myAttendanceSectionsQuerySchema,
  studentAttendanceCorrectSchema,
  studentAttendanceSaveSchema,
  type AttendanceMonthlyQuery,
  type AttendanceRosterQuery,
  type MyAttendanceSectionsQuery,
  type StudentAttendanceCorrectInput,
  type StudentAttendanceSaveInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { StudentAttendanceService } from './student-attendance.service';

// Asistencia de estudiantes (R4 — E1). Permiso 'asistencia' (DOCENTE FULL por defecto).
// El docente solo ve/edita sus secciones y solo HOY; días pasados y correcciones son de ADMIN
// (validado en el service). Rutas estáticas antes que las paramétricas.
@Controller('student-attendance')
export class StudentAttendanceController {
  constructor(private readonly attendance: StudentAttendanceService) {}

  @Get('my-sections')
  @RequirePermission('asistencia', 'ver')
  mySections(
    @(zodQuery(myAttendanceSectionsQuerySchema)) query: MyAttendanceSectionsQuery,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.attendance.mySections(actor, query.date);
  }

  @Get('roster')
  @RequirePermission('asistencia', 'ver')
  roster(
    @(zodQuery(attendanceRosterQuerySchema)) query: AttendanceRosterQuery,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.attendance.roster(actor, query.sectionId, query.date);
  }

  @Get('monthly')
  @RequirePermission('asistencia', 'ver')
  monthly(
    @(zodQuery(attendanceMonthlyQuerySchema)) query: AttendanceMonthlyQuery,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.attendance.monthly(actor, query.sectionId, query.month);
  }

  @Get('monthly/export')
  @RequirePermission('asistencia', 'ver')
  async export(
    @(zodQuery(attendanceMonthlyQuerySchema)) query: AttendanceMonthlyQuery,
    @CurrentUser() actor: JwtUser,
    @Res() res: Response,
  ) {
    const file = await this.attendance.exportMonthly(actor, query.sectionId, query.month);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }

  @Put()
  @RequirePermission('asistencia', 'editar')
  save(
    @(zodBody(studentAttendanceSaveSchema)) body: StudentAttendanceSaveInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.attendance.save(body, actor);
  }

  // Corrección individual (solo ADMIN, validado en el service).
  @Patch(':id/correct')
  @RequirePermission('asistencia', 'editar')
  correct(
    @Param('id') id: string,
    @(zodBody(studentAttendanceCorrectSchema)) body: StudentAttendanceCorrectInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.attendance.correct(id, body, actor);
  }
}
