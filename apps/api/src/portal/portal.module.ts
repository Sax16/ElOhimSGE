import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';
import { GradesModule } from '../grades/grades.module';
import { ScheduleModule } from '../schedule/schedule.module';

// Portal del apoderado (v1.0.0): vistas de solo lectura para el rol APODERADO. Reutiliza la lógica
// de notas (libreta) y de horario de la sección exportadas por sus módulos.
@Module({
  imports: [GradesModule, ScheduleModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
