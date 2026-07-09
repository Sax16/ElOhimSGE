import { z } from 'zod';
import { INSURANCE_TYPES, SEXES, SHIFTS, STUDENT_STATUSES } from '../enums';

// DNI peruano: exactamente 8 dígitos.
const dni = z.string().regex(/^\d{8}$/, 'DNI de 8 dígitos');

// Persona autorizada a recoger al estudiante (ficha de salud/emergencia).
export const authorizedPickupSchema = z.object({
  name: z.string().min(3),
  dni: z
    .string()
    .regex(/^\d{8}$/, 'DNI de 8 dígitos')
    .optional(),
  relation: z.string().min(2),
});
export type AuthorizedPickup = z.infer<typeof authorizedPickupSchema>;

export const studentCreateSchema = z.object({
  firstNames: z.string().min(2),
  lastNames: z.string().min(2),
  dni,
  birthDate: z.coerce.date(),
  sex: z.enum(SEXES),
  address: z.string().min(3),
  previousSchool: z.string().optional().nullable(),
  shift: z.enum(SHIFTS).optional().nullable(),
  allergies: z.string().optional().nullable(),
  insuranceType: z.enum(INSURANCE_TYPES).default('NINGUNO'),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  authorizedPickups: z.array(authorizedPickupSchema).default([]),
});
export type StudentCreateInput = z.infer<typeof studentCreateSchema>;

// El estado solo se edita a ACTIVO/BECADO/RESERVADO por esta vía.
// RETIRADO/TRASLADADO viven en /withdraw; EGRESADO en la promoción futura.
export const studentUpdateSchema = studentCreateSchema.partial().extend({
  status: z.enum(['ACTIVO', 'BECADO', 'RESERVADO']).optional(),
});
export type StudentUpdateInput = z.infer<typeof studentUpdateSchema>;

// Retiro o traslado saliente: nada se borra, se registra el motivo.
export const withdrawSchema = z
  .object({
    type: z.enum(['RETIRO', 'TRASLADO']),
    reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
    effectiveDate: z.coerce.date(),
    destinationSchool: z.string().optional(),
  })
  .refine(
    (d) => d.type !== 'TRASLADO' || Boolean(d.destinationSchool && d.destinationSchool.trim()),
    { message: 'Indica la I.E. de destino', path: ['destinationSchool'] },
  );
export type WithdrawInput = z.infer<typeof withdrawSchema>;

export const studentListQuerySchema = z.object({
  search: z.string().optional(),
  levelId: z.string().optional(),
  gradeLevelId: z.string().optional(),
  sectionId: z.string().optional(),
  status: z.enum(STUDENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
