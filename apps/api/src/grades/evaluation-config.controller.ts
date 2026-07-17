import { Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import {
  competenciesConfigQuerySchema,
  competencyCreateSchema,
  competencyUpdateSchema,
  evaluationAspectCreateSchema,
  evaluationAspectUpdateSchema,
  type CompetenciesConfigQuery,
  type CompetencyCreateInput,
  type CompetencyUpdateInput,
  type EvaluationAspectCreateInput,
  type EvaluationAspectUpdateInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { EvaluationConfigService } from './evaluation-config.service';

// Configuración → Evaluación (R4 — E2). Permiso 'config'; las mutaciones exigen además rol ADMIN
// (validado en el service). Rutas estáticas antes que las paramétricas.
@Controller('evaluation-config')
export class EvaluationConfigController {
  constructor(private readonly config: EvaluationConfigService) {}

  @Get('aspects')
  @RequirePermission('config', 'ver')
  listAspects() {
    return this.config.listAspects();
  }

  @Post('aspects')
  @RequirePermission('config', 'ver')
  createAspect(
    @(zodBody(evaluationAspectCreateSchema)) body: EvaluationAspectCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.config.createAspect(body, actor);
  }

  @Patch('aspects/:id')
  @RequirePermission('config', 'ver')
  updateAspect(
    @Param('id') id: string,
    @(zodBody(evaluationAspectUpdateSchema)) body: EvaluationAspectUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.config.updateAspect(id, body, actor);
  }

  @Get('competencies')
  @RequirePermission('config', 'ver')
  listCompetencies(@(zodQuery(competenciesConfigQuerySchema)) query: CompetenciesConfigQuery) {
    return this.config.listCompetencies(query.gradeLevelId);
  }

  @Post('competencies')
  @RequirePermission('config', 'ver')
  createCompetency(
    @(zodBody(competencyCreateSchema)) body: CompetencyCreateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.config.createCompetency(body, actor);
  }

  @Patch('competencies/:id')
  @RequirePermission('config', 'ver')
  updateCompetency(
    @Param('id') id: string,
    @(zodBody(competencyUpdateSchema)) body: CompetencyUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.config.updateCompetency(id, body, actor);
  }

  @Delete('competencies/:id')
  @HttpCode(204)
  @RequirePermission('config', 'ver')
  async removeCompetency(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    await this.config.removeCompetency(id, actor);
  }
}
