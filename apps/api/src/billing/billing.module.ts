import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PensionesController } from './pensiones.controller';
import { PensionesService } from './pensiones.service';
import { CommitmentsController } from './commitments.controller';
import { CommitmentsService } from './commitments.service';
import { YearAccessService } from '../academic-structure/year-access.service';
import { JobsModule } from '../jobs/jobs.module';

// Tarifario y cobranza. YearAccessService se provee localmente (stateless, solo lee estado del año).
// Pensiones (R2 — E2) consume LateFeesService de JobsModule para la corrida manual del job.
// Compromisos de pago (R2 — E3): reprograman cuotas vencidas del apoderado.
@Module({
  imports: [JobsModule],
  controllers: [BillingController, PensionesController, CommitmentsController],
  providers: [BillingService, PensionesService, CommitmentsService, YearAccessService],
})
export class BillingModule {}
