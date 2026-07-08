import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  startNextYearSchema,
  yearCreateSchema,
  yearUpdateSchema,
  type StartNextYearInput,
  type YearCreateInput,
  type YearUpdateInput,
} from '@elohim/shared';
import { zodBody } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { YearsService } from './years.service';
import { StructureService } from './structure.service';
import { ProgramsService } from './programs.service';

@Controller('academic-years')
export class YearsController {
  constructor(
    private readonly years: YearsService,
    private readonly structure: StructureService,
    private readonly programs: ProgramsService,
  ) {}

  @Get()
  findAll() {
    return this.years.findAll();
  }

  @Post()
  @RequirePermission('estructura', 'editar')
  create(@(zodBody(yearCreateSchema)) body: YearCreateInput, @CurrentUser() actor: JwtUser) {
    return this.years.create(body, actor.sub);
  }

  @Patch(':id')
  @RequirePermission('estructura', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(yearUpdateSchema)) body: YearUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.years.update(id, body, actor.sub);
  }

  @Post(':id/close')
  @RequirePermission('estructura', 'editar')
  close(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.years.close(id, actor.sub);
  }

  @Post(':id/start-next')
  @RequirePermission('estructura', 'editar')
  startNext(
    @Param('id') id: string,
    @(zodBody(startNextYearSchema)) body: StartNextYearInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.years.startNext(id, body, actor.sub);
  }

  @Get(':yearId/levels')
  @RequirePermission('estructura', 'ver')
  tree(@Param('yearId') yearId: string) {
    return this.structure.tree(yearId);
  }

  @Get(':yearId/periods')
  @RequirePermission('estructura', 'ver')
  periods(@Param('yearId') yearId: string) {
    return this.programs.periods(yearId);
  }
}
