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
