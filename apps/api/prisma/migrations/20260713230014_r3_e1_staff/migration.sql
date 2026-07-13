-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('DOCENTE', 'SECRETARIA', 'AUXILIAR', 'MANTENIMIENTO', 'DIRECCION', 'PORTERIA');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'POR_HORAS');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVO', 'LICENCIA', 'CESADO');

-- CreateEnum
CREATE TYPE "PensionKind" AS ENUM ('ONP', 'AFP');

-- CreateTable
CREATE TABLE "PensionScheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "PensionKind" NOT NULL,
    "onpRatePct" DECIMAL(5,2),
    "fundRatePct" DECIMAL(5,2),
    "commissionRatePct" DECIMAL(5,2),
    "insuranceRatePct" DECIMAL(5,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "PensionScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkingGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entryTime" CHAR(5) NOT NULL,
    "toleranceMin" INTEGER NOT NULL,
    "roles" "StaffRole"[],
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "MarkingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dni" CHAR(8) NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "StaffRole" NOT NULL,
    "area" TEXT,
    "employmentType" "EmploymentType" NOT NULL,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVO',
    "baseSalary" DECIMAL(10,2) NOT NULL,
    "hireDate" DATE,
    "pensionSchemeId" TEXT NOT NULL,
    "useIndividualSchedule" BOOLEAN NOT NULL DEFAULT false,
    "individualEntryTime" CHAR(5),
    "individualToleranceMin" INTEGER,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PensionScheme_name_key" ON "PensionScheme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MarkingGroup_name_key" ON "MarkingGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_code_key" ON "Staff"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_dni_key" ON "Staff"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_pensionSchemeId_fkey" FOREIGN KEY ("pensionSchemeId") REFERENCES "PensionScheme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
