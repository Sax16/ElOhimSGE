import { Controller, Get } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

// Resumen del dashboard: accesible a cualquier rol autenticado (sin @RequirePermission).
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly enrollment: EnrollmentService) {}

  @Get('summary')
  summary() {
    return this.enrollment.dashboardSummary();
  }
}
