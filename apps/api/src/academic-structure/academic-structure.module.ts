import { Module } from '@nestjs/common';
import { YearsController } from './years.controller';
import { StructureController } from './structure.controller';
import { ProgramsController } from './programs.controller';
import { YearsService } from './years.service';
import { StructureService } from './structure.service';
import { ProgramsService } from './programs.service';
import { YearAccessService } from './year-access.service';

// Estructura académica anualizada (Etapa 3): años, niveles, grados, secciones,
// plan de estudios, programas y periodos. Única fuente para /academic-years
// (absorbe el módulo academic-years de la Etapa 1).
@Module({
  controllers: [YearsController, StructureController, ProgramsController],
  providers: [YearsService, StructureService, ProgramsService, YearAccessService],
})
export class AcademicStructureModule {}
