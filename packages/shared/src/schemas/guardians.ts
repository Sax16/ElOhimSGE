import { z } from 'zod';
import { GUARDIAN_RELATIONS, NOTIFICATION_CHANNELS } from '../enums';

const dni = z.string().regex(/^\d{8}$/, 'DNI de 8 dígitos');

export const guardianCreateSchema = z.object({
  fullName: z.string().min(3),
  dni,
  phone: z.string().min(6),
  // El correo es opcional; el formulario puede enviar '' (se normaliza a null en el servicio).
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().min(3),
  notificationChannel: z.enum(NOTIFICATION_CHANNELS).default('SOLO_WHATSAPP'),
});
export type GuardianCreateInput = z.infer<typeof guardianCreateSchema>;

export const guardianUpdateSchema = guardianCreateSchema.partial();
export type GuardianUpdateInput = z.infer<typeof guardianUpdateSchema>;

// Vínculo N:M estudiante↔apoderado.
export const linkGuardianSchema = z.object({
  relation: z.enum(GUARDIAN_RELATIONS),
  isPrimary: z.boolean().default(false),
});
export type LinkGuardianInput = z.infer<typeof linkGuardianSchema>;

export const guardianListQuerySchema = z.object({
  search: z.string().optional(),
  account: z.enum(['todas', 'con_deuda', 'al_dia']).default('todas'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type GuardianListQuery = z.infer<typeof guardianListQuerySchema>;
