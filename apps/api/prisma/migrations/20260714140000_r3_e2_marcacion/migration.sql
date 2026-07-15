-- Marcación (R3 — E2): asistencia de ingreso/salida del personal + reglas.

-- CreateEnum
CREATE TYPE "LateCountPeriod" AS ENUM ('MES', 'BIMESTRE');

-- CreateTable
CREATE TABLE "StaffTimeEntry" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkInAt" CHAR(5),
    "checkOutAt" CHAR(5),
    "late" BOOLEAN NOT NULL DEFAULT false,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "expectedEntryTime" CHAR(5) NOT NULL,
    "toleranceMin" INTEGER NOT NULL,
    "markedInById" TEXT,
    "markedOutById" TEXT,
    "correctedById" TEXT,
    "correctedAt" TIMESTAMP(3),
    "correctionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarkingSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "autoDiscountEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lateCountThreshold" INTEGER NOT NULL DEFAULT 3,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 20.00,
    "countPeriod" "LateCountPeriod" NOT NULL DEFAULT 'MES',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffTimeEntry_date_idx" ON "StaffTimeEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffTimeEntry_staffId_date_key" ON "StaffTimeEntry"("staffId", "date");

-- AddForeignKey
ALTER TABLE "StaffTimeEntry" ADD CONSTRAINT "StaffTimeEntry_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTimeEntry" ADD CONSTRAINT "StaffTimeEntry_markedInById_fkey" FOREIGN KEY ("markedInById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTimeEntry" ADD CONSTRAINT "StaffTimeEntry_markedOutById_fkey" FOREIGN KEY ("markedOutById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTimeEntry" ADD CONSTRAINT "StaffTimeEntry_correctedById_fkey" FOREIGN KEY ("correctedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
