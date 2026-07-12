-- Tesorería (R2 — E4): gastos, otros ingresos y caja chica. Escrita a mano: incluye los CHECK de
-- negocio (montos > 0; anulaciones con motivo ≥ 10) y los correlativos G-#### / I-#### / REND-####.
-- Incluye la migración de DATOS del permiso nuevo `tesoreria` (heredado del permiso `caja`).

-- ============================================================
-- (0) Enums
-- ============================================================
CREATE TYPE "TreasuryKind" AS ENUM ('GASTO', 'INGRESO');
CREATE TYPE "TreasuryOrigin" AS ENUM ('MANUAL', 'CAJA_CHICA');
CREATE TYPE "PettyRenditionSource" AS ENUM ('EFECTIVO_CAJA', 'TRANSFERENCIA');

-- ============================================================
-- (1) TreasuryCategory: categoría administrable de gasto/ingreso.
-- ============================================================
CREATE TABLE "TreasuryCategory" (
    "id" TEXT NOT NULL,
    "kind" "TreasuryKind" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ActiveStatus" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TreasuryCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TreasuryCategory_kind_name_key" ON "TreasuryCategory"("kind", "name");

-- ============================================================
-- (2) TreasuryMovement: un gasto (G-####) o un otro ingreso (I-####).
-- ============================================================
CREATE TABLE "TreasuryMovement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "TreasuryKind" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "date" DATE NOT NULL,
    "supplier" TEXT,
    "voucherNumber" TEXT,
    "notes" TEXT,
    "origin" "TreasuryOrigin" NOT NULL DEFAULT 'MANUAL',
    "originRef" TEXT,
    "cashSessionId" TEXT,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "canceledById" TEXT,

    CONSTRAINT "TreasuryMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TreasuryMovement_code_key" ON "TreasuryMovement"("code");
CREATE INDEX "TreasuryMovement_kind_date_idx" ON "TreasuryMovement"("kind", "date");
CREATE INDEX "TreasuryMovement_cashSessionId_idx" ON "TreasuryMovement"("cashSessionId");

ALTER TABLE "TreasuryMovement"
  ADD CONSTRAINT "TreasuryMovement_amount_pos_check" CHECK ("amount" > 0),
  -- Anular exige motivo ≥ 10 (mismo patrón que el resto de anulaciones del sistema).
  ADD CONSTRAINT "TreasuryMovement_cancel_reason_check"
    CHECK (("canceledAt" IS NULL) OR ("cancelReason" IS NOT NULL AND char_length("cancelReason") >= 10));

ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "TreasuryCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_cashSessionId_fkey"
  FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_registeredById_fkey"
  FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_canceledById_fkey"
  FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- (3) PettyCashFund: fondo fijo (singleton id = 1).
-- ============================================================
CREATE TABLE "PettyCashFund" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "responsibleId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PettyCashFund_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PettyCashFund"
  ADD CONSTRAINT "PettyCashFund_amount_pos_check" CHECK ("amount" > 0);

ALTER TABLE "PettyCashFund" ADD CONSTRAINT "PettyCashFund_responsibleId_fkey"
  FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- (4) PettyCashRendition: consolida gastos menores en un gasto de tesorería y repone el fondo.
-- (Se crea antes de PettyCashExpense por la FK renditionId.)
-- ============================================================
CREATE TABLE "PettyCashRendition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "expensesCount" INTEGER NOT NULL,
    "source" "PettyRenditionSource" NOT NULL,
    "treasuryMovementId" TEXT NOT NULL,
    "cashSessionId" TEXT,
    "registeredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PettyCashRendition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PettyCashRendition_code_key" ON "PettyCashRendition"("code");
CREATE UNIQUE INDEX "PettyCashRendition_treasuryMovementId_key" ON "PettyCashRendition"("treasuryMovementId");

ALTER TABLE "PettyCashRendition"
  ADD CONSTRAINT "PettyCashRendition_total_pos_check" CHECK ("totalAmount" > 0),
  ADD CONSTRAINT "PettyCashRendition_count_pos_check" CHECK ("expensesCount" >= 1);

ALTER TABLE "PettyCashRendition" ADD CONSTRAINT "PettyCashRendition_treasuryMovementId_fkey"
  FOREIGN KEY ("treasuryMovementId") REFERENCES "TreasuryMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PettyCashRendition" ADD CONSTRAINT "PettyCashRendition_cashSessionId_fkey"
  FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PettyCashRendition" ADD CONSTRAINT "PettyCashRendition_registeredById_fkey"
  FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- (5) PettyCashExpense: gasto menor contra el fondo de caja chica.
-- ============================================================
CREATE TABLE "PettyCashExpense" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "concept" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "voucherNumber" TEXT,
    "registeredById" TEXT NOT NULL,
    "renditionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "canceledById" TEXT,

    CONSTRAINT "PettyCashExpense_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PettyCashExpense_renditionId_idx" ON "PettyCashExpense"("renditionId");

ALTER TABLE "PettyCashExpense"
  ADD CONSTRAINT "PettyCashExpense_amount_pos_check" CHECK ("amount" > 0),
  ADD CONSTRAINT "PettyCashExpense_cancel_reason_check"
    CHECK (("canceledAt" IS NULL) OR ("cancelReason" IS NOT NULL AND char_length("cancelReason") >= 10));

ALTER TABLE "PettyCashExpense" ADD CONSTRAINT "PettyCashExpense_registeredById_fkey"
  FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PettyCashExpense" ADD CONSTRAINT "PettyCashExpense_renditionId_fkey"
  FOREIGN KEY ("renditionId") REFERENCES "PettyCashRendition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PettyCashExpense" ADD CONSTRAINT "PettyCashExpense_canceledById_fkey"
  FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- (6) Migración de DATOS: permiso nuevo `tesoreria` heredado del permiso `caja`.
-- Cada usuario existente recibe en su Json `permissions` la clave `tesoreria` con el MISMO
-- { ver, editar } que ya tiene en `caja` (si no tuviera `caja`, queda sin acceso). Idempotente:
-- solo toca a quien aún no tiene la clave.
-- ============================================================
UPDATE "User"
SET "permissions" = jsonb_set(
  "permissions",
  '{tesoreria}',
  COALESCE("permissions" -> 'caja', '{"ver": false, "editar": false}'::jsonb),
  true
)
WHERE NOT ("permissions" ? 'tesoreria');
