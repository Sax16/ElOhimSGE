import { z } from 'zod';
import {
  ACTIVE_STATUSES,
  DISCOUNT_APPLICATIONS,
  ENROLLMENT_STATUSES,
  ENROLLMENT_TYPES,
} from '../enums';
import { studentCreateSchema } from './students';

// Monto decimal como string (nunca float): la BD guarda NUMERIC(10,2).
const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Monto inválido');

// ===== Wizard de matrícula =====

// Traslado entrante: aprobado antes en SIAGIE. Define desde cuándo se cobran pensiones.
const transferSchema = z.object({
  originSchool: z.string().min(2),
  siagieCode: z.string().regex(/^\d{14}$/, 'Código SIAGIE de 14 dígitos'),
  entryDate: z.coerce.date(),
});

export const enrollmentWizardSchema = z
  .object({
    academicYearId: z.string(),
    sectionId: z.string(),
    type: z.enum(ENROLLMENT_TYPES),
    studentId: z.string().optional(),
    newStudent: studentCreateSchema.optional(),
    signingGuardianId: z.string(),
    discountId: z.string().optional().nullable(),
    programIds: z.array(z.string()).default([]),
    transfer: transferSchema.optional(),
  })
  // El estudiante viene por id (existente) o por objeto (nuevo), nunca ambos ni ninguno.
  .refine((d) => Boolean(d.studentId) !== Boolean(d.newStudent), {
    message: 'Indica el estudiante o registra uno nuevo',
    path: ['studentId'],
  })
  // Un traslado exige sus datos de origen.
  .refine((d) => d.type !== 'TRASLADO' || Boolean(d.transfer), {
    message: 'Los datos de traslado son obligatorios',
    path: ['transfer'],
  });
export type EnrollmentWizardInput = z.infer<typeof enrollmentWizardSchema>;

// ===== Inscripción a programas complementarios (independiente de la matrícula escolar) =====

// El estudiante ya existe y debe tener matrícula escolar activa del año (se valida en la API).
export const programEnrollSchema = z.object({
  studentId: z.string().min(1),
});
export type ProgramEnrollInput = z.infer<typeof programEnrollSchema>;

export const programEnrollmentCancelSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type ProgramEnrollmentCancelInput = z.infer<typeof programEnrollmentCancelSchema>;

// ===== Anulaciones (nada se borra) =====

export const enrollmentCancelSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type EnrollmentCancelInput = z.infer<typeof enrollmentCancelSchema>;

export const installmentCancelSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres'),
});
export type InstallmentCancelInput = z.infer<typeof installmentCancelSchema>;

// ===== Tarifario y cobranza =====

export const levelFeeUpdateSchema = z.object({
  enrollmentFee: decimalString,
  monthlyFee: decimalString,
  installmentsCount: z.union([z.literal(10), z.literal(11)]),
});
export type LevelFeeUpdateInput = z.infer<typeof levelFeeUpdateSchema>;

export const billingSettingsUpdateSchema = z.object({
  lateFeeAmount: decimalString.optional(),
  graceDays: z.number().int().min(0).optional(),
  transferCutoffDay: z.number().int().min(1).max(28).optional(),
  autoLateFee: z.boolean().optional(),
  dueDayOfMonth: z.number().int().min(1).max(28).nullable().optional(),
});
export type BillingSettingsUpdateInput = z.infer<typeof billingSettingsUpdateSchema>;

export const discountUpsertSchema = z.object({
  name: z.string().min(3),
  percent: z
    .string()
    .regex(/^\d{1,3}(\.\d{1,2})?$/, 'Porcentaje inválido')
    .refine((v) => Number(v) <= 100, 'El porcentaje no puede superar 100'),
  application: z.enum(DISCOUNT_APPLICATIONS),
  condition: z.string().min(3),
  status: z.enum(ACTIVE_STATUSES),
});
export type DiscountUpsertInput = z.infer<typeof discountUpsertSchema>;

export const discountUpdateSchema = discountUpsertSchema.partial();
export type DiscountUpdateInput = z.infer<typeof discountUpdateSchema>;

// ===== Listado de matrículas =====

export const enrollmentListQuerySchema = z.object({
  yearId: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(ENROLLMENT_STATUSES).optional(),
  type: z.enum(ENROLLMENT_TYPES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type EnrollmentListQuery = z.infer<typeof enrollmentListQuerySchema>;
