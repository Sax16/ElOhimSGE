import { z } from 'zod';
import { COMMITMENT_FREQUENCIES } from '../enums';

// Esquemas de compromisos de pago (R2 — E3): propuesta, aprobación/rechazo y anulación.
// Única definición de validación (compartida entre React Hook Form y la API).

// Fecha civil yyyy-mm-dd (nunca Date con TZ).
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');

// Proponer un compromiso: apoderado firmante + cuotas VENCIDAS seleccionadas + primera fecha y frecuencia.
export const commitmentCreateSchema = z.object({
  guardianId: z.string().min(1),
  installmentIds: z.array(z.string().min(1)).min(1, 'Selecciona al menos una cuota'),
  firstDueDate: isoDate,
  frequency: z.enum(COMMITMENT_FREQUENCIES),
});
export type CommitmentCreateInput = z.infer<typeof commitmentCreateSchema>;

// Rechazar (Admin): motivo obligatorio ≥ 10 caracteres.
export const commitmentRejectSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type CommitmentRejectInput = z.infer<typeof commitmentRejectSchema>;

// Anular (Admin): motivo obligatorio ≥ 10 caracteres.
export const commitmentCancelSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type CommitmentCancelInput = z.infer<typeof commitmentCancelSchema>;
