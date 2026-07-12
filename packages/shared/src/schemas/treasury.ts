import { z } from 'zod';
import {
  ACTIVE_STATUSES,
  PAYMENT_METHODS,
  PETTY_RENDITION_SOURCES,
  TREASURY_KINDS,
} from '../enums';

// Esquemas de Tesorería (R2 — E4): movimientos (gastos/otros ingresos), categorías,
// caja chica (gastos menores y rendición) y fondo fijo.
// Única definición de validación (compartida entre React Hook Form y la API).

// Monto decimal como string (nunca float): la BD guarda NUMERIC(10,2).
const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido');
// Fecha civil yyyy-mm-dd (columna @db.Date); el server valida ≤ hoy donde aplica.
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

// ===== Movimientos de tesorería =====

// Crear un gasto o un ingreso. La fecha es opcional (default hoy en el server).
// INGRESO en EFECTIVO exige caja del día abierta y su fecha es siempre hoy (regla en el service).
export const treasuryMovementCreateSchema = z.object({
  kind: z.enum(TREASURY_KINDS),
  categoryId: z.string().min(1),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  amount: decimalString,
  method: z.enum(PAYMENT_METHODS),
  date: isoDate.optional(),
  supplier: z.string().optional(),
  voucherNumber: z.string().optional(),
  notes: z.string().optional(),
});
export type TreasuryMovementCreateInput = z.infer<typeof treasuryMovementCreateSchema>;

// Editar un movimiento MANUAL (parcial de los campos editables). Reglas del arqueo en el service.
export const treasuryMovementUpdateSchema = z
  .object({
    categoryId: z.string().min(1),
    description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
    amount: decimalString,
    method: z.enum(PAYMENT_METHODS),
    date: isoDate,
    supplier: z.string().optional(),
    voucherNumber: z.string().optional(),
    notes: z.string().optional(),
  })
  .partial();
export type TreasuryMovementUpdateInput = z.infer<typeof treasuryMovementUpdateSchema>;

// Anular un movimiento MANUAL: motivo obligatorio ≥ 10 caracteres.
export const treasuryMovementCancelSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type TreasuryMovementCancelInput = z.infer<typeof treasuryMovementCancelSchema>;

// ===== Categorías de gasto/ingreso =====

export const treasuryCategoryUpsertSchema = z.object({
  kind: z.enum(TREASURY_KINDS),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  status: z.enum(ACTIVE_STATUSES).default('ACTIVO'),
});
export type TreasuryCategoryUpsertInput = z.infer<typeof treasuryCategoryUpsertSchema>;

export const treasuryCategoryUpdateSchema = treasuryCategoryUpsertSchema.partial();
export type TreasuryCategoryUpdateInput = z.infer<typeof treasuryCategoryUpdateSchema>;

// ===== Caja chica =====

// Gasto menor contra el saldo del fondo (tope = saldo disponible, validado en el service).
export const pettyExpenseCreateSchema = z.object({
  concept: z.string().min(3, 'El concepto debe tener al menos 3 caracteres'),
  amount: decimalString,
  voucherNumber: z.string().optional(),
  date: isoDate.optional(),
});
export type PettyExpenseCreateInput = z.infer<typeof pettyExpenseCreateSchema>;

// Anular un gasto menor no rendido: motivo obligatorio ≥ 10 caracteres.
export const pettyExpenseCancelSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type PettyExpenseCancelInput = z.infer<typeof pettyExpenseCancelSchema>;

// Rendición: consolida los gastos menores no rendidos en un gasto de tesorería y repone el fondo.
// EFECTIVO_CAJA exige caja del día abierta (egresa del arqueo); TRANSFERENCIA es libre.
export const pettyRenditionCreateSchema = z.object({
  source: z.enum(PETTY_RENDITION_SOURCES),
});
export type PettyRenditionCreateInput = z.infer<typeof pettyRenditionCreateSchema>;

// Configuración del fondo fijo (solo ADMIN en el service): monto + responsable.
export const pettyFundUpdateSchema = z.object({
  amount: decimalString,
  responsibleId: z.string().min(1),
});
export type PettyFundUpdateInput = z.infer<typeof pettyFundUpdateSchema>;
