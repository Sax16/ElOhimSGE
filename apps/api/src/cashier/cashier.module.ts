import { Module } from '@nestjs/common';
import { CashierController } from './cashier.controller';
import { CashierService } from './cashier.service';

// Caja y cobros (R2 — E1). AuditService es global; el resto de dependencias son stateless.
@Module({
  controllers: [CashierController],
  providers: [CashierService],
})
export class CashierModule {}
