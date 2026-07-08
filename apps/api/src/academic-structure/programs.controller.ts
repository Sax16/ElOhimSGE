import { BadRequestException, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  periodUpdateSchema,
  programCreateSchema,
  programUpdateSchema,
  type PeriodUpdateInput,
  type ProgramCreateInput,
  type ProgramUpdateInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { ProgramsService } from './programs.service';

@Controller()
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  // ===== Programas =====

  @Get('programs')
  @RequirePermission('estructura', 'ver')
  findAll(@Query('yearId') yearId?: string) {
    if (!yearId) throw new BadRequestException('Falta el parámetro yearId');
    return this.programs.findAll(yearId);
  }

  @Post('programs')
  @RequirePermission('estructura', 'editar')
  create(@(zodBody(programCreateSchema)) body: ProgramCreateInput, @CurrentUser() actor: JwtUser) {
    return this.programs.create(body, actor.sub);
  }

  @Patch('programs/:id')
  @RequirePermission('estructura', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(programUpdateSchema)) body: ProgramUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.programs.update(id, body, actor.sub);
  }

  // ===== Periodos =====

  @Patch('periods/:id')
  @RequirePermission('estructura', 'editar')
  updatePeriod(
    @Param('id') id: string,
    @(zodBody(periodUpdateSchema)) body: PeriodUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.programs.updatePeriod(id, body, actor.sub);
  }
}
