import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { BillingModule } from '../billing/billing.module';

// Dashboard económico (R2 — E5). Reutiliza PensionesService (morosidad efectiva, E2) de BillingModule.
@Module({
  imports: [BillingModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
