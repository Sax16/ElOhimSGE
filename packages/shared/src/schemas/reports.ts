import { z } from 'zod';

// Esquemas de query de Reportes (R2 — E5): morosidad, ingresos, caja y padrón.
// Única definición de validación (compartida entre la API y, si aplica, el front).
// Los endpoints /export reciben el mismo query y responden un .xlsx real.

// Fecha civil yyyy-mm-dd (columna @db.Date).
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

// ===== Morosidad por grado =====
export const delinquencyQuerySchema = z.object({
  yearId: z.string().min(1),
});
export type DelinquencyQueryInput = z.infer<typeof delinquencyQuerySchema>;

// ===== Ingresos por concepto =====
// month opcional = todo el año.
export const incomeQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12).optional(),
});
export type IncomeQueryInput = z.infer<typeof incomeQuerySchema>;

// ===== Caja diaria =====
// Rango de fechas (por defecto el mes actual, resuelto en el server).
export const cashReportQuerySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
});
export type CashReportQueryInput = z.infer<typeof cashReportQuerySchema>;

// ===== Padrón de estudiantes =====
export const rosterQuerySchema = z.object({
  yearId: z.string().min(1),
  levelId: z.string().optional(),
});
export type RosterQueryInput = z.infer<typeof rosterQuerySchema>;

// ===== Planilla anual (R3 — E4) =====
// Todos los meses del año con planilla generada: hoja resumen (por mes) + hoja detalle (por fila).
export const payrollAnnualQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});
export type PayrollAnnualQueryInput = z.infer<typeof payrollAnnualQuerySchema>;
