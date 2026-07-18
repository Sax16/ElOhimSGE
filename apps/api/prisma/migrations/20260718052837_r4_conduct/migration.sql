-- CreateEnum
CREATE TYPE "ConductSeverity" AS ENUM ('LEVE', 'MODERADA', 'GRAVE');

-- CreateEnum
CREATE TYPE "ConductStatus" AS ENUM ('REGISTRADA', 'APODERADO_NOTIFICADO', 'CITACION_PROGRAMADA', 'CERRADA', 'ANULADA');

-- CreateTable
CREATE TABLE "ConductIncident" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "measure" TEXT,
    "severity" "ConductSeverity" NOT NULL,
    "status" "ConductStatus" NOT NULL DEFAULT 'REGISTRADA',
    "citationAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "canceledById" TEXT,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConductIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConductIncident_code_key" ON "ConductIncident"("code");

-- CreateIndex
CREATE INDEX "ConductIncident_status_idx" ON "ConductIncident"("status");

-- CreateIndex
CREATE INDEX "ConductIncident_enrollmentId_idx" ON "ConductIncident"("enrollmentId");

-- AddForeignKey
ALTER TABLE "ConductIncident" ADD CONSTRAINT "ConductIncident_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConductIncident" ADD CONSTRAINT "ConductIncident_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConductIncident" ADD CONSTRAINT "ConductIncident_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConductIncident" ADD CONSTRAINT "ConductIncident_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
