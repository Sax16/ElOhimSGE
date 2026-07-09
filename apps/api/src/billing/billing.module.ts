import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { YearAccessService } from '../academic-structure/year-access.service';

// Tarifario y cobranza (Etapa 5). YearAccessService se provee localmente (stateless, solo lee estado del año).
@Module({
  controllers: [BillingController],
  providers: [BillingService, YearAccessService],
})
export class BillingModule {}
