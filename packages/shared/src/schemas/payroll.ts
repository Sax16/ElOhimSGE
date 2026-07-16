import { z } from 'zod';
import { PAYMENT_METHODS, PAYROLL_MANUAL_ITEM_KINDS } from '../enums';

// Esquemas de Planilla (R3 — E3): generación mensual, edición de sueldo por horas, descuentos
// manuales, pago (individual/masivo) y anulación. Única definición de validación (RHF + API).
// Mensajes en español. Todo movimiento sensible se audita en el service.

// Monto decimal como string (nunca float): la BD guarda NUMERIC(10,2).
const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido');

// ===== Consulta / periodo =====

// GET /api/payroll?year&month — sin filtros = mes actual (Lima) en el service.
export const payrollQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});
export type PayrollQuery = z.infer<typeof payrollQuerySchema>;

// ===== Edición de sueldo (solo POR_HORAS y PENDIENTE) =====

export const payrollGrossUpdateSchema = z.object({
  grossAmount: decimalString.refine((v) => Number(v) >= 0, 'El monto no puede ser negativo'),
});
export type PayrollGrossUpdateInput = z.infer<typeof payrollGrossUpdateSchema>;

// ===== Descuento manual =====

export const payrollItemCreateSchema = z.object({
  kind: z.enum(PAYROLL_MANUAL_ITEM_KINDS),
  amount: decimalString.refine((v) => Number(v) > 0, 'El monto debe ser mayor a cero'),
  detail: z.string().trim().min(3, 'El motivo debe tener al menos 3 caracteres'),
});
export type PayrollItemCreateInput = z.infer<typeof payrollItemCreateSchema>;

// Anular un descuento: motivo obligatorio ≥ 10 caracteres.
export const payrollItemCancelSchema = z.object({
  reason: z.string().trim().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type PayrollItemCancelInput = z.infer<typeof payrollItemCancelSchema>;

// ===== Pago (individual y masivo) — solo ADMIN en el service =====

export const payrollPaySchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  operationNumber: z.string().trim().optional(),
});
export type PayrollPayInput = z.infer<typeof payrollPaySchema>;

export const payrollPayAllSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
});
export type PayrollPayAllInput = z.infer<typeof payrollPayAllSchema>;

// Anular un pago (individual o de un batch): motivo obligatorio ≥ 10 caracteres.
export const payrollCancelPaymentSchema = z.object({
  reason: z.string().trim().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type PayrollCancelPaymentInput = z.infer<typeof payrollCancelPaymentSchema>;

// ===== Export .xlsx =====

export const payrollExportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});
export type PayrollExportQuery = z.infer<typeof payrollExportQuerySchema>;

// ===== Configuración de planilla (R3 — E4, solo ADMIN en el service) =====

// Porcentaje decimal como string (nunca float), con rango configurable [min, max].
const pctString = (max: number, label: string) =>
  z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Porcentaje inválido')
    .refine((v) => Number(v) >= 0 && Number(v) <= max, label);

// PUT /api/payroll/settings — EsSalud, gratificación/CTS (futuros) y día de pago.
export const payrollSettingsUpdateSchema = z.object({
  essaludRatePct: pctString(30, 'El porcentaje de EsSalud debe estar entre 0 y 30'),
  gratiRatePct: pctString(100, 'El porcentaje de gratificación debe estar entre 0 y 100'),
  gratiBonusPct: pctString(100, 'El bono de gratificación debe estar entre 0 y 100'),
  ctsDaysPerYear: z.coerce.number().int().min(0).max(60),
  payDayOfMonth: z.coerce.number().int().min(1).max(31).nullable(),
});
export type PayrollSettingsUpdateInput = z.infer<typeof payrollSettingsUpdateSchema>;

// PATCH /api/payroll/pension-schemes/:id — tasas del régimen y activación (solo ADMIN).
// La coherencia (ONP solo onpRatePct; AFP las otras tres) se valida en el service según su kind.
export const pensionSchemeUpdateSchema = z
  .object({
    onpRatePct: pctString(100, 'La tasa ONP debe estar entre 0 y 100').optional(),
    fundRatePct: pctString(100, 'La tasa de fondo debe estar entre 0 y 100').optional(),
    commissionRatePct: pctString(100, 'La comisión debe estar entre 0 y 100').optional(),
    insuranceRatePct: pctString(100, 'El seguro debe estar entre 0 y 100').optional(),
    active: z.boolean().optional(),
  })
  .refine((b) => Object.keys(b).length > 0, 'No hay cambios que aplicar');
export type PensionSchemeUpdateInput = z.infer<typeof pensionSchemeUpdateSchema>;
