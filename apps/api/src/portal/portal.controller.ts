import { Controller, Get, Param } from '@nestjs/common';
import { portalMonthQuerySchema, type PortalMonthQuery } from '@elohim/shared';
import { zodQuery } from '../common/zod-validation.pipe';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { PortalService } from './portal.service';

// Portal del apoderado (v1.0.0). Solo lectura, solo rol APODERADO (validado en el service). No usa
// @RequirePermission: el rol APODERADO no tiene módulos; el acceso se deriva del Guardian vinculado.
@Controller('portal')
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Get('me')
  me(@CurrentUser() actor: JwtUser) {
    return this.portal.me(actor);
  }

  @Get('announcements')
  announcements(@CurrentUser() actor: JwtUser) {
    return this.portal.announcements(actor);
  }

  @Get('calendar')
  calendar(
    @(zodQuery(portalMonthQuerySchema)) query: PortalMonthQuery,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.portal.calendar(actor, query.month);
  }

  @Get('students/:enrollmentId/summary')
  summary(@Param('enrollmentId') enrollmentId: string, @CurrentUser() actor: JwtUser) {
    return this.portal.summary(actor, enrollmentId);
  }

  @Get('students/:enrollmentId/installments')
  installments(@Param('enrollmentId') enrollmentId: string, @CurrentUser() actor: JwtUser) {
    return this.portal.installments(actor, enrollmentId);
  }

  @Get('students/:enrollmentId/attendance')
  attendance(
    @Param('enrollmentId') enrollmentId: string,
    @(zodQuery(portalMonthQuerySchema)) query: PortalMonthQuery,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.portal.attendance(actor, enrollmentId, query.month);
  }

  @Get('students/:enrollmentId/schedule')
  schedule(@Param('enrollmentId') enrollmentId: string, @CurrentUser() actor: JwtUser) {
    return this.portal.studentSchedule(actor, enrollmentId);
  }

  @Get('students/:enrollmentId/grades')
  grades(@Param('enrollmentId') enrollmentId: string, @CurrentUser() actor: JwtUser) {
    return this.portal.studentGrades(actor, enrollmentId);
  }

  @Get('students/:enrollmentId/conduct')
  conduct(@Param('enrollmentId') enrollmentId: string, @CurrentUser() actor: JwtUser) {
    return this.portal.conduct(actor, enrollmentId);
  }
}
