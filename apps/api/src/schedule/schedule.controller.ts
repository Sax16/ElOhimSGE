import { Controller, Get, Post, Put } from '@nestjs/common';
import {
  scheduleBlocksPutSchema,
  scheduleBlocksQuerySchema,
  scheduleCopySchema,
  scheduleQuerySchema,
  scheduleSlotPutSchema,
  type ScheduleBlocksPutInput,
  type ScheduleBlocksQuery,
  type ScheduleCopyInput,
  type ScheduleQuery,
  type ScheduleSlotPutInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { ScheduleService } from './schedule.service';

// Grilla de horarios (post-R4). Bloques por nivel+turno y celdas curso×día×bloque. Permiso
// 'estructura' (ver/editar) salvo my-week ('asistencia'.ver, que tiene el docente). El docente se
// deriva SIEMPRE de CourseAssignment; el horario no lo guarda. Año CERRADO → 409 al mutar.
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get('blocks')
  @RequirePermission('estructura', 'ver')
  blocks(@(zodQuery(scheduleBlocksQuerySchema)) query: ScheduleBlocksQuery) {
    return this.schedule.blocks(query.levelId, query.shift);
  }

  @Put('blocks')
  @RequirePermission('estructura', 'editar')
  putBlocks(@(zodBody(scheduleBlocksPutSchema)) body: ScheduleBlocksPutInput, @CurrentUser() actor: JwtUser) {
    return this.schedule.putBlocks(body, actor);
  }

  @Get('my-week')
  @RequirePermission('asistencia', 'ver')
  myWeek(@CurrentUser() actor: JwtUser) {
    return this.schedule.myWeek(actor);
  }

  @Get()
  @RequirePermission('estructura', 'ver')
  schedule_(@(zodQuery(scheduleQuerySchema)) query: ScheduleQuery) {
    return this.schedule.schedule(query.sectionId);
  }

  @Put('slot')
  @RequirePermission('estructura', 'editar')
  putSlot(@(zodBody(scheduleSlotPutSchema)) body: ScheduleSlotPutInput, @CurrentUser() actor: JwtUser) {
    return this.schedule.putSlot(body, actor);
  }

  @Post('copy')
  @RequirePermission('estructura', 'editar')
  copy(@(zodBody(scheduleCopySchema)) body: ScheduleCopyInput, @CurrentUser() actor: JwtUser) {
    return this.schedule.copy(body, actor);
  }
}
