import { z } from 'zod';
import { ACTIVE_STATUSES, PAYMENT_METHODS } from '../enums';

// Monto decimal como string (nunca float): la BD guarda NUMERIC(10,2).
const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido');

// ===== Caja del día =====

export const cashSessionOpenSchema = z.object({
  initialAmount: decimalString,
});
export type CashSessionOpenInput = z.infer<typeof cashSessionOpenSchema>;

export const cashSessionCloseSchema = z.object({
  countedCash: decimalString,
  notes: z.string().optional(),
});
export type CashSessionCloseInput = z.infer<typeof cashSessionCloseSchema>;

// ===== Cobro (recibo multi-concepto) =====

const saleItemSchema = z.object({
  saleConceptId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export const receiptCreateSchema = z
  .object({
    studentId: z.string().min(1),
    installmentIds: z.array(z.string().min(1)).default([]),
    saleItems: z.array(saleItemSchema).default([]),
    method: z.enum(PAYMENT_METHODS),
    operationNumber: z.string().optional(),
    receivedAmount: decimalString.optional(),
  })
  // Al menos un concepto cobrable (cuota o venta).
  .refine((d) => d.installmentIds.length + d.saleItems.length >= 1, {
    message: 'Selecciona al menos una cuota o concepto de venta',
    path: ['installmentIds'],
  });
export type ReceiptCreateInput = z.infer<typeof receiptCreateSchema>;

export const receiptCancelSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type ReceiptCancelInput = z.infer<typeof receiptCancelSchema>;

// ===== Catálogo de conceptos de venta (otros conceptos) =====

export const saleConceptUpsertSchema = z.object({
  name: z.string().min(3),
  price: decimalString,
  status: z.enum(ACTIVE_STATUSES).default('ACTIVO'),
});
export type SaleConceptUpsertInput = z.infer<typeof saleConceptUpsertSchema>;

export const saleConceptUpdateSchema = saleConceptUpsertSchema.partial();
export type SaleConceptUpdateInput = z.infer<typeof saleConceptUpdateSchema>;
