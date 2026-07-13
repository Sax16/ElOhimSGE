import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

// Personal (R3 — E1): fichas de empleado, catálogo de regímenes pensionarios y grupos de marcación.
@Module({
  controllers: [StaffController],
  providers: [StaffService],
})
export class StaffModule {}
