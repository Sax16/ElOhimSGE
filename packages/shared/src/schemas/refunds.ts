import { z } from 'zod';
import { REFUND_METHODS } from '../enums';

// Esquemas de devoluciones (R2 — E3): solicitud (dos pasos), rechazo y ejecución.
// Única definición de validación (compartida entre React Hook Form y la API).

// Monto decimal como string (nunca float): la BD guarda NUMERIC(10,2).
const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido');

// Solicitar devolución: vinculada a un recibo EMITIDO, con motivo ≥ 10.
// APLICACION_CUOTA exige la cuota destino (mismo estudiante, monto exacto — validado en el service).
export const refundCreateSchema = z
  .object({
    receiptId: z.string().min(1),
    amount: decimalString,
    method: z.enum(REFUND_METHODS),
    targetInstallmentId: z.string().min(1).optional(),
    reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
  })
  .refine((d) => d.method !== 'APLICACION_CUOTA' || !!d.targetInstallmentId, {
    message: 'La aplicación a cuota exige una cuota destino',
    path: ['targetInstallmentId'],
  });
export type RefundCreateInput = z.infer<typeof refundCreateSchema>;

// Rechazar devolución (Admin): motivo obligatorio ≥ 10 caracteres.
export const refundRejectSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type RefundRejectInput = z.infer<typeof refundRejectSchema>;

// Ejecutar devolución (Caja): n° de operación opcional (para transferencias).
export const refundExecuteSchema = z.object({
  operationNumber: z.string().optional(),
});
export type RefundExecuteInput = z.infer<typeof refundExecuteSchema>;
