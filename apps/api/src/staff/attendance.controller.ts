import { Controller, Get, Patch, Post, Put, Res } from '@nestjs/common';
import { type Response } from 'express';
import {
  attendanceCorrectSchema,
  attendanceDayQuerySchema,
  attendanceExportQuerySchema,
  attendanceMarkSchema,
  attendanceRulesUpdateSchema,
  type AttendanceCorrectInput,
  type AttendanceDayQuery,
  type AttendanceExportQuery,
  type AttendanceMarkInput,
  type AttendanceRulesUpdateInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';

// Marcación y asistencia (R3 — E2). Permiso 'marcacion' (PORTERIA FULL); correcciones validan
// rol ADMIN en el service; editar reglas exige permiso 'personal' · editar (no basta marcacion).
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get('day')
  @RequirePermission('marcacion', 'ver')
  day(@(zodQuery(attendanceDayQuerySchema)) query: AttendanceDayQuery) {
    return this.attendance.day(query.date);
  }

  @Post('check-in')
  @RequirePermission('marcacion', 'editar')
  checkIn(@(zodBody(attendanceMarkSchema)) body: AttendanceMarkInput, @CurrentUser() actor: JwtUser) {
    return this.attendance.checkIn(body.staffId, actor);
  }

  @Post('check-out')
  @RequirePermission('marcacion', 'editar')
  checkOut(@(zodBody(attendanceMarkSchema)) body: AttendanceMarkInput, @CurrentUser() actor: JwtUser) {
    return this.attendance.checkOut(body.staffId, actor);
  }

  @Patch('correct')
  @RequirePermission('marcacion', 'editar')
  correct(
    @(zodBody(attendanceCorrectSchema)) body: AttendanceCorrectInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.attendance.correct(body, actor);
  }

  @Get('rules')
  @RequirePermission('marcacion', 'ver')
  rules() {
    return this.attendance.rules();
  }

  // Editar reglas exige permiso de Personal (no basta marcación).
  @Put('rules')
  @RequirePermission('personal', 'editar')
  updateRules(
    @(zodBody(attendanceRulesUpdateSchema)) body: AttendanceRulesUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.attendance.updateRules(body, actor);
  }

  @Get('export')
  @RequirePermission('marcacion', 'ver')
  async export(
    @(zodQuery(attendanceExportQuerySchema)) query: AttendanceExportQuery,
    @Res() res: Response,
  ) {
    const file = await this.attendance.exportMonth(query.month);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }
}
