import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { DashboardController } from './dashboard.controller';
import { EnrollmentService } from './enrollment.service';

// Matrícula (Etapa 5): wizard, cronograma automático, anulación y resumen del dashboard.
@Module({
  controllers: [EnrollmentController, DashboardController],
  providers: [EnrollmentService],
})
export class EnrollmentModule {}
