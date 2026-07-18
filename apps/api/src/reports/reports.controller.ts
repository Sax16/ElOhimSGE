import { Controller, Get, Res } from '@nestjs/common';
import { type Response } from 'express';
import {
  cashReportQuerySchema,
  delinquencyQuerySchema,
  incomeQuerySchema,
  payrollAnnualQuerySchema,
  rosterQuerySchema,
  studentAttendanceReportQuerySchema,
  type CashReportQueryInput,
  type DelinquencyQueryInput,
  type IncomeQueryInput,
  type PayrollAnnualQueryInput,
  type RosterQueryInput,
  type StudentAttendanceReportQueryInput,
} from '@elohim/shared';
import { zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { ReportsService } from './reports.service';

// Reportes (R2 — E5): 4 reportes con vista previa JSON y exportación .xlsx real (exceljs).
// Permiso 'reportes' · 'ver' para todo (incluidos los exports).
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  // Envía un .xlsx como descarga (attachment) con su Content-Disposition.
  private send(res: Response, file: { buffer: Buffer; filename: string }) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }

  // ===== Morosidad por grado =====
  @Get('delinquency')
  @RequirePermission('reportes', 'ver')
  delinquency(@(zodQuery(delinquencyQuerySchema)) query: DelinquencyQueryInput) {
    return this.reports.delinquency(query);
  }

  @Get('delinquency/export')
  @RequirePermission('reportes', 'ver')
  async delinquencyExport(
    @(zodQuery(delinquencyQuerySchema)) query: DelinquencyQueryInput,
    @Res() res: Response,
  ) {
    this.send(res, await this.reports.delinquencyExport(query));
  }

  // ===== Ingresos por concepto =====
  @Get('income')
  @RequirePermission('reportes', 'ver')
  income(@(zodQuery(incomeQuerySchema)) query: IncomeQueryInput) {
    return this.reports.income(query);
  }

  @Get('income/export')
  @RequirePermission('reportes', 'ver')
  async incomeExport(
    @(zodQuery(incomeQuerySchema)) query: IncomeQueryInput,
    @Res() res: Response,
  ) {
    this.send(res, await this.reports.incomeExport(query));
  }

  // ===== Caja diaria =====
  @Get('cash')
  @RequirePermission('reportes', 'ver')
  cash(@(zodQuery(cashReportQuerySchema)) query: CashReportQueryInput) {
    return this.reports.cash(query);
  }

  @Get('cash/export')
  @RequirePermission('reportes', 'ver')
  async cashExport(
    @(zodQuery(cashReportQuerySchema)) query: CashReportQueryInput,
    @Res() res: Response,
  ) {
    this.send(res, await this.reports.cashExport(query));
  }

  // ===== Padrón de estudiantes =====
  @Get('roster')
  @RequirePermission('reportes', 'ver')
  roster(@(zodQuery(rosterQuerySchema)) query: RosterQueryInput) {
    return this.reports.roster(query);
  }

  @Get('roster/export')
  @RequirePermission('reportes', 'ver')
  async rosterExport(
    @(zodQuery(rosterQuerySchema)) query: RosterQueryInput,
    @Res() res: Response,
  ) {
    this.send(res, await this.reports.rosterExport(query));
  }

  // ===== Planilla anual (R3 — E4) =====
  @Get('payroll-annual')
  @RequirePermission('reportes', 'ver')
  async payrollAnnual(
    @(zodQuery(payrollAnnualQuerySchema)) query: PayrollAnnualQueryInput,
    @Res() res: Response,
  ) {
    this.send(res, await this.reports.payrollAnnualExport(query));
  }

  // ===== Asistencia mensual de estudiantes (R4 — E4) =====
  @Get('student-attendance')
  @RequirePermission('reportes', 'ver')
  studentAttendance(
    @(zodQuery(studentAttendanceReportQuerySchema)) query: StudentAttendanceReportQueryInput,
  ) {
    return this.reports.studentAttendance(query);
  }

  @Get('student-attendance/export')
  @RequirePermission('reportes', 'ver')
  async studentAttendanceExport(
    @(zodQuery(studentAttendanceReportQuerySchema)) query: StudentAttendanceReportQueryInput,
    @Res() res: Response,
  ) {
    this.send(res, await this.reports.studentAttendanceExport(query));
  }
}
