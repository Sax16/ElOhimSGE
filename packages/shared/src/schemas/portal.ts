import { z } from 'zod';

// Esquemas del Portal del apoderado (v1.0.0). El portal es 100% de solo lectura: las únicas
// entradas del usuario son consultas por mes (asistencia y calendario). Mensajes en español.

// GET /api/portal/students/:enrollmentId/attendance?month=yyyy-mm
// GET /api/portal/calendar?month=yyyy-mm
export const portalMonthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Mes inválido (yyyy-mm)'),
});
export type PortalMonthQuery = z.infer<typeof portalMonthQuerySchema>;
