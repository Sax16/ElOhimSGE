import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

// Grilla de horarios (post-R4): plantilla de bloques por nivel+turno + celdas curso×día×bloque por
// sección (docente derivado de CourseAssignment). Permiso 'estructura'; 'Mi horario' del docente
// bajo 'asistencia'.
@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}
