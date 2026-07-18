import { z } from 'zod';
import { CONDUCT_SEVERITIES, CONDUCT_STATUSES } from '../enums';

// Esquemas de Conducta e incidencias (R4 — E3). Única definición de validación (compartida entre
// React Hook Form y la API). Mensajes de error en español. Solo faltas disciplinarias, no méritos.

// ===== Registrar / listar incidencias =====

// POST /api/conduct — registra una incidencia. La citación es obligatoria solo si la gravedad es
// GRAVE (superRefine → error apuntado a citationAt).
export const conductCreateSchema = z
  .object({
    enrollmentId: z.string().min(1, 'Selecciona un estudiante'),
    severity: z.enum(CONDUCT_SEVERITIES),
    occurredAt: z.string().datetime({ message: 'Fecha y hora inválidas' }),
    summary: z.string().trim().min(3, 'Escribe un asunto (mínimo 3 caracteres)'),
    description: z.string().trim().min(10, 'Describe los hechos (mínimo 10 caracteres)'),
    measure: z
      .string()
      .trim()
      .max(500, 'La medida es demasiado larga')
      .optional()
      .or(z.literal('')),
    citationAt: z.string().datetime({ message: 'Fecha de citación inválida' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.severity === 'GRAVE' && !data.citationAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['citationAt'],
        message: 'La citación es obligatoria en incidencias graves',
      });
    }
  });
export type ConductCreateInput = z.infer<typeof conductCreateSchema>;

// GET /api/conduct?search=&severity=&status=
export const conductListQuerySchema = z.object({
  search: z.string().trim().optional(),
  severity: z.enum(CONDUCT_SEVERITIES).optional(),
  status: z.enum(CONDUCT_STATUSES).optional(),
});
export type ConductListQuery = z.infer<typeof conductListQuerySchema>;

// GET /api/conduct/students?search= (buscador de estudiantes para registrar). Mínimo 2 caracteres.
export const conductStudentsQuerySchema = z.object({
  search: z.string().trim().min(2, 'Escribe al menos 2 caracteres'),
});
export type ConductStudentsQuery = z.infer<typeof conductStudentsQuerySchema>;

// POST /api/conduct/:id/cancel — anula (solo Admin). Justificación ≥ 10 caracteres.
export const conductCancelSchema = z.object({
  reason: z.string().trim().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type ConductCancelInput = z.infer<typeof conductCancelSchema>;
