import { z } from 'zod';
import { CALENDAR_EVENT_TYPES } from '../enums';

// Esquemas del Calendario académico (R4 — E4). Única definición de validación (compartida entre
// React Hook Form y la API). Mensajes de error en español. Fechas civiles yyyy-mm-dd (@db.Date).

// Fecha civil yyyy-mm-dd.
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

// POST/PATCH /api/calendar — evento del calendario. endDate ≥ startDate (superRefine).
export const calendarEventCreateSchema = z
  .object({
    type: z.enum(CALENDAR_EVENT_TYPES),
    name: z.string().trim().min(3, 'Escribe un nombre (mínimo 3 caracteres)'),
    startDate: isoDate,
    endDate: isoDate,
    description: z.string().trim().max(500, 'La descripción es demasiado larga').optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'La fecha de fin no puede ser anterior a la de inicio',
      });
    }
  });
export type CalendarEventCreateInput = z.infer<typeof calendarEventCreateSchema>;

// PATCH usa el mismo shape completo (edición de todos los campos del evento).
export const calendarEventUpdateSchema = calendarEventCreateSchema;
export type CalendarEventUpdateInput = z.infer<typeof calendarEventUpdateSchema>;

// GET /api/calendar?month=yyyy-mm — mes a consultar.
export const calendarMonthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Mes inválido (yyyy-mm)'),
});
export type CalendarMonthQuery = z.infer<typeof calendarMonthQuerySchema>;
