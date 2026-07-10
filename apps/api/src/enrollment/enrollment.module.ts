import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { DashboardController } from './dashboard.controller';
import { ProgramEnrollmentController } from './program-enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { ProgramEnrollmentService } from './program-enrollment.service';

// Matrícula (Etapa 5): wizard, cronograma automático, anulación y resumen del dashboard.
// + Inscripción a programas complementarios (independiente de la matrícula escolar).
@Module({
  controllers: [EnrollmentController, DashboardController, ProgramEnrollmentController],
  providers: [EnrollmentService, ProgramEnrollmentService],
})
export class EnrollmentModule {}
