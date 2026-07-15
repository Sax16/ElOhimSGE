import { z } from 'zod';
import { LATE_COUNT_PERIODS } from '../enums';

// Esquemas de Marcación y asistencia (R3 — E2). Única definición de validación
// (compartida entre React Hook Form y la API). Mensajes de error en español.

// Hora HH:mm (columna @db.Char(5)).
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora inválida (HH:mm)');
// Fecha civil yyyy-mm-dd (columna @db.Date).
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (yyyy-mm-dd)');
// Mes yyyy-mm.
const isoMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mes inválido (yyyy-mm)');
// Monto decimal (nunca float en la BD: NUMERIC(10,2)).
const money = z.union([
  z.number(),
  z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido'),
]);

// GET /api/attendance/day?date=yyyy-mm-dd (default hoy).
export const attendanceDayQuerySchema = z.object({
  date: isoDate.optional(),
});
export type AttendanceDayQuery = z.infer<typeof attendanceDayQuerySchema>;

// POST /api/attendance/check-in | check-out.
export const attendanceMarkSchema = z.object({
  staffId: z.string().min(1, 'Selecciona un empleado'),
});
export type AttendanceMarkInput = z.infer<typeof attendanceMarkSchema>;

// PATCH /api/attendance/correct (solo Admin). checkIn/checkOut: undefined = no tocar,
// null = quitar la marca, 'HH:mm' = fijar. La regla "salida sin ingreso" se valida en el service.
export const attendanceCorrectSchema = z.object({
  staffId: z.string().min(1, 'Selecciona un empleado'),
  date: isoDate,
  checkIn: hhmm.nullable().optional(),
  checkOut: hhmm.nullable().optional(),
  reason: z.string().trim().min(10, 'La justificación debe tener al menos 10 caracteres'),
});
export type AttendanceCorrectInput = z.infer<typeof attendanceCorrectSchema>;

// PUT /api/attendance/rules.
export const attendanceRulesUpdateSchema = z.object({
  groups: z.array(
    z.object({
      id: z.string().min(1),
      entryTime: hhmm,
      toleranceMin: z.coerce
        .number()
        .int('La tolerancia debe ser un entero')
        .min(0, 'La tolerancia no puede ser negativa')
        .max(120, 'La tolerancia no puede superar 120 minutos'),
    }),
  ),
  settings: z.object({
    autoDiscountEnabled: z.boolean(),
    lateCountThreshold: z.coerce
      .number()
      .int('El número de tardanzas debe ser un entero')
      .min(1, 'Debe ser al menos 1')
      .max(20, 'No puede superar 20'),
    discountAmount: money.refine((v) => Number(v) > 0, 'El descuento debe ser mayor a 0'),
    countPeriod: z.enum(LATE_COUNT_PERIODS),
  }),
});
export type AttendanceRulesUpdateInput = z.infer<typeof attendanceRulesUpdateSchema>;

// GET /api/attendance/export?month=yyyy-mm.
export const attendanceExportQuerySchema = z.object({
  month: isoMonth,
});
export type AttendanceExportQuery = z.infer<typeof attendanceExportQuerySchema>;
