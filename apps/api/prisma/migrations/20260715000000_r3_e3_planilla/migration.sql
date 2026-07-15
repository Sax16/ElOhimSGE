-- Planilla (R3 — E3): planilla mensual, descuentos, pago (individual/masivo) y gasto por evento.

-- AlterEnum: origen de gasto de tesorería "Planilla" (badge; no editable/anulable desde Tesorería).
ALTER TYPE "TreasuryOrigin" ADD VALUE 'PLANILLA';

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('PENDIENTE', 'PAGADO');

-- CreateEnum
CREATE TYPE "PayrollItemKind" AS ENUM ('AUTO_TARDANZAS', 'ADELANTO', 'DANO_PERDIDA', 'INASISTENCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "PayrollItemStatus" AS ENUM ('APLICADO', 'ANULADO');

-- CreateTable
CREATE TABLE "PayrollPeriod" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollEntry" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "staffCode" TEXT NOT NULL,
    "staffName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "schemeName" TEXT NOT NULL,
    "schemeKind" "PensionKind" NOT NULL,
    "onpRatePct" DECIMAL(5,2),
    "fundRatePct" DECIMAL(5,2),
    "commissionRatePct" DECIMAL(5,2),
    "insuranceRatePct" DECIMAL(5,2),
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "grossEdited" BOOLEAN NOT NULL DEFAULT false,
    "lateCount" INTEGER NOT NULL DEFAULT 0,
    "status" "PayrollStatus" NOT NULL DEFAULT 'PENDIENTE',
    "paidAt" TIMESTAMP(3),
    "paidById" TEXT,
    "paymentMethod" "PaymentMethod",
    "operationNumber" TEXT,
    "batchId" TEXT,
    "treasuryMovementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollItem" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "kind" "PayrollItemKind" NOT NULL,
    "auto" BOOLEAN NOT NULL,
    "detail" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayrollItemStatus" NOT NULL DEFAULT 'APLICADO',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledById" TEXT,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "PayrollItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollBatch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidById" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "treasuryMovementId" TEXT NOT NULL,

    CONSTRAINT "PayrollBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "essaludRatePct" DECIMAL(5,2) NOT NULL DEFAULT 9.00,
    "gratiRatePct" DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    "gratiBonusPct" DECIMAL(5,2) NOT NULL DEFAULT 9.00,
    "ctsDaysPerYear" INTEGER NOT NULL DEFAULT 15,
    "payDayOfMonth" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPeriod_year_month_key" ON "PayrollPeriod"("year", "month");

-- CreateIndex
CREATE INDEX "PayrollEntry_staffId_idx" ON "PayrollEntry"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollEntry_periodId_staffId_key" ON "PayrollEntry"("periodId", "staffId");

-- CreateIndex
CREATE INDEX "PayrollItem_entryId_idx" ON "PayrollItem"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollBatch_code_key" ON "PayrollBatch"("code");

-- AddForeignKey
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollEntry" ADD CONSTRAINT "PayrollEntry_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "PayrollBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "PayrollEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollBatch" ADD CONSTRAINT "PayrollBatch_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "PayrollPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollBatch" ADD CONSTRAINT "PayrollBatch_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
