import { Module } from '@nestjs/common';
import { TreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';

// Tesorería (R2 — E4): gastos, otros ingresos, caja chica y resumen del mes.
// AuditService es global; PrismaService viene del módulo global de Prisma.
@Module({
  controllers: [TreasuryController],
  providers: [TreasuryService],
})
export class TreasuryModule {}
