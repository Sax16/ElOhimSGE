import { Module } from '@nestjs/common';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

// Caja y cobros (R2 — E1/E3). AuditService es global; el resto de dependencias son stateless.
@Module({
  controllers: [CashierController, RefundsController],
  providers: [CashierService, RefundsService],
  exports: [CashierService],
})
export class CashierModule {}
