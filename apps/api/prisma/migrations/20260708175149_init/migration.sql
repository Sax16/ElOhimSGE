-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SECRETARIA_CAJA', 'DOCENTE', 'PORTERIA', 'APODERADO');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "YearStatus" AS ENUM ('ACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('BIMESTRE', 'TRIMESTRE', 'SEMESTRE');

-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('CERRADO', 'EN_CURSO', 'PROXIMO');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MANANA', 'TARDE');

-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('TALLER', 'REFORZAMIENTO', 'ACADEMIA');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('ACTIVO', 'CERRADO');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('SIS', 'ESSALUD', 'PRIVADO', 'NINGUNO');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVO', 'BECADO', 'RETIRADO', 'TRASLADADO', 'EGRESADO', 'RESERVADO');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('WHATSAPP_Y_CORREO', 'SOLO_WHATSAPP', 'SOLO_CORREO', 'NINGUNO');

-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('MADRE', 'PADRE', 'ABUELO_A', 'TIO_A', 'TUTOR_LEGAL');

-- CreateEnum
CREATE TYPE "EnrollmentType" AS ENUM ('NUEVA', 'RATIFICADA', 'TRASLADO');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('COMPLETA', 'PENDIENTE_PAGO', 'OBSERVADA');

-- CreateEnum
CREATE TYPE "InstallmentType" AS ENUM ('MATRICULA', 'PENSION');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PAGADO', 'PENDIENTE', 'VENCIDO', 'ANULADO', 'EXONERADO');

-- CreateEnum
CREATE TYPE "DiscountApplication" AS ENUM ('AUTOMATICO', 'MANUAL');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVO',
    "permissions" JSONB NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "modularCode" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ugel" TEXT NOT NULL,
    "motto" TEXT,
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "lateFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 5.00,
    "graceDays" INTEGER NOT NULL DEFAULT 3,
    "transferCutoffDay" INTEGER NOT NULL DEFAULT 20,
    "autoLateFee" BOOLEAN NOT NULL DEFAULT true,
    "dueDayOfMonth" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "enrollmentStart" DATE NOT NULL,
    "status" "YearStatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "PeriodStatus" NOT NULL DEFAULT 'PROXIMO',
    "order" INTEGER NOT NULL,

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeLevel" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "GradeLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shift" "Shift" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "tutorId" TEXT,
    "assistantName" TEXT,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "gradeLevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weeklyHours" INTEGER NOT NULL,
    "teacherId" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProgramType" NOT NULL,
    "scheduleText" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "enrollmentFee" DECIMAL(10,2) NOT NULL,
    "monthlyFee" DECIMAL(10,2) NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelFee" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "enrollmentFee" DECIMAL(10,2) NOT NULL,
    "monthlyFee" DECIMAL(10,2) NOT NULL,
    "installmentsCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LevelFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "percent" DECIMAL(5,2) NOT NULL,
    "application" "DiscountApplication" NOT NULL,
    "condition" TEXT NOT NULL,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVO',

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "firstNames" TEXT NOT NULL,
    "lastNames" TEXT NOT NULL,
    "dni" CHAR(8) NOT NULL,
    "birthDate" DATE NOT NULL,
    "sex" "Sex" NOT NULL,
    "address" TEXT NOT NULL,
    "previousSchool" TEXT,
    "photoUrl" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVO',
    "shift" "Shift",
    "allergies" TEXT,
    "insuranceType" "InsuranceType" NOT NULL DEFAULT 'NINGUNO',
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "authorizedPickups" JSONB NOT NULL DEFAULT '[]',
    "withdrawalReason" TEXT,
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dni" CHAR(8) NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "notificationChannel" "NotificationChannel" NOT NULL DEFAULT 'SOLO_WHATSAPP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGuardian" (
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "relation" "GuardianRelation" NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StudentGuardian_pkey" PRIMARY KEY ("studentId","guardianId")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "type" "EnrollmentType" NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "signingGuardianId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountId" TEXT,
    "originSchool" TEXT,
    "siagieCode" CHAR(14),
    "entryDate" DATE,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentProgram" (
    "enrollmentId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "monthlyFeeSnapshot" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "EnrollmentProgram_pkey" PRIMARY KEY ("enrollmentId","programId")
);

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "type" "InstallmentType" NOT NULL,
    "concept" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "dueDate" DATE NOT NULL,
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "programsAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "canceledById" TEXT,

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeCounter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "CodeCounter_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_name_key" ON "AcademicYear"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Period_academicYearId_order_key" ON "Period"("academicYearId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Level_academicYearId_name_key" ON "Level"("academicYearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GradeLevel_levelId_name_key" ON "GradeLevel"("levelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_gradeLevelId_name_shift_key" ON "Section"("gradeLevelId", "name", "shift");

-- CreateIndex
CREATE UNIQUE INDEX "Course_gradeLevelId_name_key" ON "Course"("gradeLevelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Program_academicYearId_name_key" ON "Program"("academicYearId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "LevelFee_levelId_key" ON "LevelFee"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_code_key" ON "Discount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Student_code_key" ON "Student"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Student_dni_key" ON "Student"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_code_key" ON "Guardian"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_dni_key" ON "Guardian"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_code_key" ON "Enrollment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_academicYearId_key" ON "Enrollment"("studentId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_enrollmentId_sequence_key" ON "Installment"("enrollmentId", "sequence");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeLevel" ADD CONSTRAINT "GradeLevel_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_gradeLevelId_fkey" FOREIGN KEY ("gradeLevelId") REFERENCES "GradeLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelFee" ADD CONSTRAINT "LevelFee_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGuardian" ADD CONSTRAINT "StudentGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_signingGuardianId_fkey" FOREIGN KEY ("signingGuardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentProgram" ADD CONSTRAINT "EnrollmentProgram_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentProgram" ADD CONSTRAINT "EnrollmentProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===== Constraints de negocio (no expresables en Prisma) =====
ALTER TABLE "Student"  ADD CONSTRAINT student_dni_digits  CHECK ("dni" ~ '^[0-9]{8}$');
ALTER TABLE "Guardian" ADD CONSTRAINT guardian_dni_digits CHECK ("dni" ~ '^[0-9]{8}$');
ALTER TABLE "Enrollment" ADD CONSTRAINT siagie_digits CHECK ("siagieCode" IS NULL OR "siagieCode" ~ '^[0-9]{14}$');
ALTER TABLE "Section" ADD CONSTRAINT section_capacity_positive CHECK ("capacity" > 0);
ALTER TABLE "Installment" ADD CONSTRAINT installment_amounts_nonneg CHECK ("amount" >= 0 AND "discountAmount" >= 0 AND "programsAmount" >= 0 AND "baseAmount" >= 0);
ALTER TABLE "Installment" ADD CONSTRAINT installment_cancel_needs_reason CHECK ("status" <> 'ANULADO' OR length("cancelReason") >= 10);
ALTER TABLE "Enrollment" ADD CONSTRAINT enrollment_cancel_needs_reason CHECK ("canceledAt" IS NULL OR length("cancelReason") >= 10);
