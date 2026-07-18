import { Module } from '@nestjs/common';
import { ConductController } from './conduct.controller';
import { ConductService } from './conduct.service';

// Académico (R4 — E3): conducta e incidencias disciplinarias por sección. Permiso 'notas'.
@Module({
  controllers: [ConductController],
  providers: [ConductService],
})
export class ConductModule {}
