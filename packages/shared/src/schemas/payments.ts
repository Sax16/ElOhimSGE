import { z } from 'zod';

// Esquemas de la pantalla Pensiones (R2 — E2): listado de cuotas, exoneración de mora y recordatorios.
// Única definición de validación (compartida entre React Hook Form y la API).

// Exonerar mora: motivo obligatorio ≥ 10 caracteres (solo Admin en el service).
export const lateFeeExonerateSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type LateFeeExonerateInput = z.infer<typeof lateFeeExonerateSchema>;

// Enviar recordatorio consolidado a un apoderado principal.
export const reminderCreateSchema = z.object({
  guardianId: z.string().min(1),
});
export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;

// Listado paginado de cuotas por año, con filtros de mes, tipo y estado + búsqueda por estudiante.
export const installmentsQuerySchema = z.object({
  yearId: z.string().min(1),
  month: z.coerce.number().int().min(3).max(12).optional(),
  type: z.enum(['PENSION', 'MATRICULA', 'PROGRAMA', 'TODAS']).default('PENSION'),
  status: z.enum(['TODAS', 'PENDIENTES', 'PAGADAS', 'VENCIDAS']).default('TODAS'),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type InstallmentsQueryInput = z.infer<typeof installmentsQuerySchema>;
