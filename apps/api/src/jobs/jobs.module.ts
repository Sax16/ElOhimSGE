import { Module } from '@nestjs/common';
import { LateFeesService } from './late-fees.service';

// Jobs de fondo (R2 — E2): pg-boss + job diario de mora. PrismaService es global.
@Module({
  providers: [LateFeesService],
  exports: [LateFeesService],
})
export class JobsModule {}
