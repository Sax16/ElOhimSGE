import { z } from 'zod';

export const institutionUpdateSchema = z.object({
  name: z.string().min(3),
  modularCode: z.string().min(1),
  ruc: z.string().regex(/^\d{11}$/, 'RUC de 11 dígitos'),
  address: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email('Correo inválido'),
  region: z.string().min(1),
  ugel: z.string().min(1),
  motto: z.string().optional().nullable(),
});
export type InstitutionUpdateInput = z.infer<typeof institutionUpdateSchema>;
