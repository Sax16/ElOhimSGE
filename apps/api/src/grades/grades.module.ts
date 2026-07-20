import { Module } from '@nestjs/common';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { EvaluationConfigController } from './evaluation-config.controller';
import { EvaluationConfigService } from './evaluation-config.service';

// Académico (R4 — E2): notas por competencias (permiso 'notas') + Configuración → Evaluación
// (permiso 'config'). Libreta y acta en Excel incluidas.
@Module({
  controllers: [GradesController, EvaluationConfigController],
  providers: [GradesService, EvaluationConfigService],
  exports: [GradesService],
})
export class GradesModule {}
