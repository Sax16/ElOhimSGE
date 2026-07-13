import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CashierModule } from '../cashier/cashier.module';

// Reportes (R2 — E5). Reutiliza CashierService (historial de cajas) de CashierModule.
@Module({
  imports: [CashierModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
