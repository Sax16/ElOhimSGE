import { Module } from '@nestjs/common';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';

// Personal (R3): E1 fichas de empleado, catálogo de regímenes pensionarios y grupos de marcación;
// E2 marcación y asistencia (ingreso/salida, correcciones, reglas y export mensual);
// E3 planilla (generación mensual, descuentos, pago individual/masivo y export).
@Module({
  controllers: [StaffController, AttendanceController, PayrollController],
  providers: [StaffService, AttendanceService, PayrollService],
})
export class StaffModule {}
