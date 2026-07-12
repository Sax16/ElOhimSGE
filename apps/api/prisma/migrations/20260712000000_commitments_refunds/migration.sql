-- Compromisos de pago y devoluciones (R2 — E3). Escrita a mano: incluye los CHECK de negocio
-- (montos > 0; anulación/rechazo con motivo ≥ 10; APLICACION_CUOTA exige cuota destino) y los
-- correlativos CP-#### / D-####. El "congelamiento" de la mora/recordatorios es una consecuencia
-- de la fecha efectiva (compromiso VIGENTE ⇒ newDueDate), no una columna: no hay flags aquí.

-- ============================================================
-- (0) Enums
-- ============================================================
CREATE TYPE "CommitmentStatus" AS ENUM ('PROPUESTO', 'VIGENTE', 'CUMPLIDO', 'INCUMPLIDO', 'RECHAZADO', 'ANULADO');
CREATE TYPE "CommitmentFrequency" AS ENUM ('MENSUAL', 'QUINCENAL');
CREATE TYPE "RefundStatus" AS ENUM ('PENDIENTE_APROBACION', 'APROBADA', 'RECHAZADA', 'DEVUELTA');
CREATE TYPE "RefundMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'APLICACION_CUOTA');

-- ============================================================
-- (1) PaymentCommitment: cabecera del compromiso (reprograma cuotas 1:1).
-- ============================================================
CREATE TABLE "PaymentCommitment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "proposedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "status" "CommitmentStatus" NOT NULL DEFAULT 'PROPUESTO',
    "frequency" "CommitmentFrequency" NOT NULL,
    "firstDueDate" DATE NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "rejectReason" TEXT,
    "cancelReason" TEXT,
    "canceledById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "breachedAt" TIMESTAMP(3),
    "fulfilledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentCommitment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentCommitment_code_key" ON "PaymentCommitment"("code");
CREATE INDEX "PaymentCommitment_guardianId_idx" ON "PaymentCommitment"("guardianId");
CREATE INDEX "PaymentCommitment_status_idx" ON "PaymentCommitment"("status");

ALTER TABLE "PaymentCommitment"
  ADD CONSTRAINT "PaymentCommitment_totalAmount_pos_check" CHECK ("totalAmount" > 0),
  -- Rechazar exige motivo ≥ 10 (mismo patrón que las anulaciones).
  ADD CONSTRAINT "PaymentCommitment_reject_reason_check"
    CHECK (("status" <> 'RECHAZADO') OR ("rejectReason" IS NOT NULL AND char_length("rejectReason") >= 10)),
  -- Anular exige motivo ≥ 10.
  ADD CONSTRAINT "PaymentCommitment_cancel_reason_check"
    CHECK (("status" <> 'ANULADO') OR ("cancelReason" IS NOT NULL AND char_length("cancelReason") >= 10));

ALTER TABLE "PaymentCommitment" ADD CONSTRAINT "PaymentCommitment_guardianId_fkey"
  FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentCommitment" ADD CONSTRAINT "PaymentCommitment_proposedById_fkey"
  FOREIGN KEY ("proposedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PaymentCommitment" ADD CONSTRAINT "PaymentCommitment_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentCommitment" ADD CONSTRAINT "PaymentCommitment_canceledById_fkey"
  FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- (2) CommitmentInstallment: cuota reprogramada (nueva fecha + snapshot del monto con mora).
-- ============================================================
CREATE TABLE "CommitmentInstallment" (
    "id" TEXT NOT NULL,
    "commitmentId" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "newDueDate" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "CommitmentInstallment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommitmentInstallment_installmentId_commitmentId_key"
  ON "CommitmentInstallment"("installmentId", "commitmentId");
CREATE INDEX "CommitmentInstallment_commitmentId_idx" ON "CommitmentInstallment"("commitmentId");
CREATE INDEX "CommitmentInstallment_installmentId_idx" ON "CommitmentInstallment"("installmentId");

ALTER TABLE "CommitmentInstallment"
  ADD CONSTRAINT "CommitmentInstallment_amount_pos_check" CHECK ("amount" > 0);

ALTER TABLE "CommitmentInstallment" ADD CONSTRAINT "CommitmentInstallment_commitmentId_fkey"
  FOREIGN KEY ("commitmentId") REFERENCES "PaymentCommitment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommitmentInstallment" ADD CONSTRAINT "CommitmentInstallment_installmentId_fkey"
  FOREIGN KEY ("installmentId") REFERENCES "Installment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- (3) Refund: devolución sobre un recibo EMITIDO (dos pasos + ejecución en Caja).
-- ============================================================
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "method" "RefundMethod" NOT NULL,
    "targetInstallmentId" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDIENTE_APROBACION',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "executedById" TEXT,
    "executedAt" TIMESTAMP(3),
    "cashSessionId" TEXT,
    "operationNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Refund_code_key" ON "Refund"("code");
CREATE INDEX "Refund_status_createdAt_idx" ON "Refund"("status", "createdAt");
CREATE INDEX "Refund_receiptId_idx" ON "Refund"("receiptId");

ALTER TABLE "Refund"
  ADD CONSTRAINT "Refund_amount_pos_check" CHECK ("amount" > 0),
  -- La solicitud exige motivo ≥ 10 (siempre, no solo al rechazar).
  ADD CONSTRAINT "Refund_reason_check" CHECK (char_length("reason") >= 10),
  -- Rechazar exige justificación ≥ 10.
  ADD CONSTRAINT "Refund_reject_reason_check"
    CHECK (("status" <> 'RECHAZADA') OR ("rejectReason" IS NOT NULL AND char_length("rejectReason") >= 10)),
  -- Aplicación a cuota exige cuota destino.
  ADD CONSTRAINT "Refund_target_installment_check"
    CHECK (("method" <> 'APLICACION_CUOTA') OR ("targetInstallmentId" IS NOT NULL));

ALTER TABLE "Refund" ADD CONSTRAINT "Refund_receiptId_fkey"
  FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_targetInstallmentId_fkey"
  FOREIGN KEY ("targetInstallmentId") REFERENCES "Installment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_executedById_fkey"
  FOREIGN KEY ("executedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_cashSessionId_fkey"
  FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
