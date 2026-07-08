import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './common/audit/audit.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InstitutionModule } from './institution/institution.module';
import { AcademicStructureModule } from './academic-structure/academic-structure.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    InstitutionModule,
    AcademicStructureModule,
    HealthModule,
  ],
})
export class AppModule {}
