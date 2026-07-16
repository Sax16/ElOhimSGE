import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './common/audit/audit.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InstitutionModule } from './institution/institution.module';
import { AcademicStructureModule } from './academic-structure/academic-structure.module';
import { StudentsModule } from './students/students.module';
import { GuardiansModule } from './guardians/guardians.module';
import { StaffModule } from './staff/staff.module';
import { BillingModule } from './billing/billing.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { CashierModule } from './cashier/cashier.module';
import { TreasuryModule } from './treasury/treasury.module';
import { JobsModule } from './jobs/jobs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { StudentAttendanceModule } from './student-attendance/student-attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    InstitutionModule,
    AcademicStructureModule,
    StudentsModule,
    GuardiansModule,
    StaffModule,
    BillingModule,
    EnrollmentModule,
    CashierModule,
    TreasuryModule,
    JobsModule,
    DashboardModule,
    ReportsModule,
    StudentAttendanceModule,
    HealthModule,
  ],
})
export class AppModule {}
