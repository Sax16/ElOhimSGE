import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

// Dashboard económico (R2 — E5): accesible a cualquier usuario autenticado con acceso al panel
// (sin @RequirePermission, mismo patrón que el resumen mínimo de R1).
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  summary(@Query('yearId') yearId?: string) {
    return this.dashboard.summary(yearId?.trim() || undefined);
  }
}
