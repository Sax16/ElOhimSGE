-- Pensiones + mora + recordatorios (R2 — E2). Escrita a mano: incluye los CHECK de negocio
-- (mora no negativa; la exoneración exige motivo ≥ 10) y el historial de recordatorios.

-- ============================================================
-- (1) Installment: campos de mora fija y de exoneración.
-- ============================================================
ALTER TABLE "Installment"
  ADD COLUMN "lateFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "lateFeeAppliedAt" TIMESTAMP(3),
  ADD COLUMN "lateFeeExoneratedAt" TIMESTAMP(3),
  ADD COLUMN "lateFeeExoneratedById" TEXT,
  ADD COLUMN "lateFeeExonerationReason" TEXT;

ALTER TABLE "Installment"
  ADD CONSTRAINT "Installment_lateFeeAmount_nonneg_check" CHECK ("lateFeeAmount" >= 0),
  -- Exonerar la mora exige motivo ≥ 10 (mismo patrón que las anulaciones).
  ADD CONSTRAINT "Installment_lateFeeExoneration_reason_check"
    CHECK (("lateFeeExoneratedAt" IS NULL) OR (char_length("lateFeeExonerationReason") >= 10));

ALTER TABLE "Installment" ADD CONSTRAINT "Installment_lateFeeExoneratedById_fkey"
  FOREIGN KEY ("lateFeeExoneratedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- (2) ReminderLog: historial de recordatorios enviados por apoderado.
-- ============================================================
CREATE TABLE "ReminderLog" (
    "id" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "sentById" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "message" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "itemsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReminderLog_guardianId_createdAt_idx" ON "ReminderLog"("guardianId", "createdAt");

ALTER TABLE "ReminderLog"
  ADD CONSTRAINT "ReminderLog_totalAmount_nonneg_check" CHECK ("totalAmount" >= 0),
  ADD CONSTRAINT "ReminderLog_itemsCount_nonneg_check" CHECK ("itemsCount" >= 0);

ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_guardianId_fkey"
  FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReminderLog" ADD CONSTRAINT "ReminderLog_sentById_fkey"
  FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
