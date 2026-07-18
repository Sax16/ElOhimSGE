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
  calendarEventCreateSchema,
  calendarEventUpdateSchema,
  calendarMonthQuerySchema,
  type CalendarEventCreateInput,
  type CalendarEventUpdateInput,
  type CalendarMonthQuery,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';

// Calendario académico (R4 — E4). Permiso 'estructura' (ver para GET, editar para mutaciones).
// Los eventos se crean/editan en el año activo; año cerrado → 409 (validado en el service).
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  @Get()
  @RequirePermission('estructura', 'ver')
  month(@(zodQuery(calendarMonthQuerySchema)) query: CalendarMonthQuery) {
    return this.calendar.month(query);
  }

  @Post()
  @RequirePermission('estructura', 'editar')
  create(
    @(zodBody(calendarEventCreateSchema)) body: CalendarEventCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.calendar.create(body, actor);
  }

  @Patch(':id')
  @RequirePermission('estructura', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(calendarEventUpdateSchema)) body: CalendarEventUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.calendar.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermission('estructura', 'editar')
  async remove(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    await this.calendar.remove(id, actor);
  }
}
