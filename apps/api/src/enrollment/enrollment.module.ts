import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { ProgramEnrollmentController } from './program-enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { ProgramEnrollmentService } from './program-enrollment.service';

// Matrícula (Etapa 5): wizard, cronograma automático y anulación.
// + Inscripción a programas complementarios (independiente de la matrícula escolar).
// El dashboard económico vive ahora en su propio módulo (R2 — E5).
@Module({
  controllers: [EnrollmentController, ProgramEnrollmentController],
  providers: [EnrollmentService, ProgramEnrollmentService],
})
export class EnrollmentModule {}
