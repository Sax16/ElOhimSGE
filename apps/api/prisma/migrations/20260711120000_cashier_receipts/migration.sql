-- Caja y cobros (R2 — E1): caja compartida por día, recibos numerados multi-concepto y
-- catálogo de "otros conceptos" (libros, uniformes…). Escrita a mano: incluye los CHECK de
-- negocio (pertenencia XOR de la línea, cantidades y montos no negativos, anulación con motivo).

-- ============================================================
-- (0) Enums
-- ============================================================
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'YAPE_PLIN', 'TRANSFERENCIA', 'TARJETA');
CREATE TYPE "CashSessionStatus" AS ENUM ('ABIERTA', 'CERRADA');
CREATE TYPE "ReceiptStatus" AS ENUM ('EMITIDO', 'ANULADO');

-- ============================================================
-- (1) SaleConcept: catálogo simple nombre + precio (sin stock).
-- ============================================================
CREATE TABLE "SaleConcept" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleConcept_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SaleConcept_name_key" ON "SaleConcept"("name");

ALTER TABLE "SaleConcept"
  ADD CONSTRAINT "SaleConcept_price_nonneg_check" CHECK ("price" >= 0);

-- ============================================================
-- (2) CashSession: una caja compartida por día (única por fecha).
-- ============================================================
CREATE TABLE "CashSession" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "CashSessionStatus" NOT NULL DEFAULT 'ABIERTA',
    "openedById" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initialAmount" DECIMAL(10,2) NOT NULL,
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "expectedCash" DECIMAL(10,2),
    "countedCash" DECIMAL(10,2),
    "difference" DECIMAL(10,2),
    "closeNotes" TEXT,

    CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CashSession_date_key" ON "CashSession"("date");

ALTER TABLE "CashSession"
  ADD CONSTRAINT "CashSession_initialAmount_nonneg_check" CHECK ("initialAmount" >= 0);

ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_openedById_fkey"
  FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_closedById_fkey"
  FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- (3) Receipt: recibo interno numerado, multi-concepto, con quién cobró.
-- ============================================================
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cashSessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "method" "PaymentMethod" NOT NULL,
    "operationNumber" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "receivedAmount" DECIMAL(10,2),
    "changeAmount" DECIMAL(10,2),
    "status" "ReceiptStatus" NOT NULL DEFAULT 'EMITIDO',
    "cashierId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "canceledById" TEXT,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Receipt_code_key" ON "Receipt"("code");
CREATE INDEX "Receipt_cashSessionId_idx" ON "Receipt"("cashSessionId");
CREATE INDEX "Receipt_studentId_idx" ON "Receipt"("studentId");

ALTER TABLE "Receipt"
  ADD CONSTRAINT "Receipt_totalAmount_nonneg_check" CHECK ("totalAmount" >= 0),
  -- Anulación con motivo (mismo patrón que Installment): si está ANULADO exige motivo ≥ 10.
  ADD CONSTRAINT "Receipt_cancel_reason_check"
    CHECK (("status" <> 'ANULADO') OR ("cancelReason" IS NOT NULL AND length("cancelReason") >= 10));

ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_cashSessionId_fkey"
  FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_cashierId_fkey"
  FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_canceledById_fkey"
  FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- (4) ReceiptItem: línea de recibo (cuota XOR venta), con snapshot de concepto y montos.
-- ============================================================
CREATE TABLE "ReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "installmentId" TEXT,
    "saleConceptId" TEXT,
    "concept" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitAmount" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ReceiptItem"
  -- Una línea es una cuota O una venta de catálogo, nunca ambas ni ninguna.
  ADD CONSTRAINT "ReceiptItem_owner_xor_check"
    CHECK (("installmentId" IS NULL) <> ("saleConceptId" IS NULL)),
  ADD CONSTRAINT "ReceiptItem_quantity_pos_check" CHECK ("quantity" > 0),
  ADD CONSTRAINT "ReceiptItem_unitAmount_nonneg_check" CHECK ("unitAmount" >= 0),
  ADD CONSTRAINT "ReceiptItem_amount_nonneg_check" CHECK ("amount" >= 0);

ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_receiptId_fkey"
  FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_installmentId_fkey"
  FOREIGN KEY ("installmentId") REFERENCES "Installment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_saleConceptId_fkey"
  FOREIGN KEY ("saleConceptId") REFERENCES "SaleConcept"("id") ON DELETE SET NULL ON UPDATE CASCADE;
