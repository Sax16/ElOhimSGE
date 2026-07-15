import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';

// Personal (R3): E1 fichas de empleado, catálogo de regímenes pensionarios y grupos de marcación;
// E2 marcación y asistencia (ingreso/salida, correcciones, reglas y export mensual).
@Module({
  controllers: [StaffController, AttendanceController],
  providers: [StaffService, AttendanceService],
})
export class StaffModule {}
