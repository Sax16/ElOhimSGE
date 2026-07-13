// Enums del dominio — espejo de los enums de Prisma (valores en español, glosario del proyecto).
// El front los consume sin depender del cliente Prisma.

export const USER_ROLES = ['ADMIN', 'SECRETARIA_CAJA', 'DOCENTE', 'PORTERIA', 'APODERADO'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVO', 'SUSPENDIDO'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const YEAR_STATUSES = ['ACTIVO', 'CERRADO'] as const;
export type YearStatus = (typeof YEAR_STATUSES)[number];

export const PERIOD_TYPES = ['BIMESTRE', 'TRIMESTRE', 'SEMESTRE'] as const;
export type PeriodType = (typeof PERIOD_TYPES)[number];

export const PERIOD_STATUSES = ['CERRADO', 'EN_CURSO', 'PROXIMO'] as const;
export type PeriodStatus = (typeof PERIOD_STATUSES)[number];

export const SHIFTS = ['MANANA', 'TARDE'] as const;
export type Shift = (typeof SHIFTS)[number];

export const PROGRAM_TYPES = ['TALLER', 'REFORZAMIENTO', 'ACADEMIA'] as const;
export type ProgramType = (typeof PROGRAM_TYPES)[number];

export const PROGRAM_STATUSES = ['ACTIVO', 'CERRADO'] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export const SEXES = ['M', 'F'] as const;
export type Sex = (typeof SEXES)[number];

export const INSURANCE_TYPES = ['SIS', 'ESSALUD', 'PRIVADO', 'NINGUNO'] as const;
export type InsuranceType = (typeof INSURANCE_TYPES)[number];

export const STUDENT_STATUSES = [
  'ACTIVO',
  'BECADO',
  'RETIRADO',
  'TRASLADADO',
  'EGRESADO',
  'RESERVADO',
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const NOTIFICATION_CHANNELS = [
  'WHATSAPP_Y_CORREO',
  'SOLO_WHATSAPP',
  'SOLO_CORREO',
  'NINGUNO',
] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const GUARDIAN_RELATIONS = ['MADRE', 'PADRE', 'ABUELO_A', 'TIO_A', 'TUTOR_LEGAL'] as const;
export type GuardianRelation = (typeof GUARDIAN_RELATIONS)[number];

export const ENROLLMENT_TYPES = ['NUEVA', 'RATIFICADA', 'TRASLADO'] as const;
export type EnrollmentType = (typeof ENROLLMENT_TYPES)[number];

export const ENROLLMENT_STATUSES = ['COMPLETA', 'PENDIENTE_PAGO', 'OBSERVADA'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const INSTALLMENT_TYPES = ['MATRICULA', 'PENSION'] as const;
export type InstallmentType = (typeof INSTALLMENT_TYPES)[number];

export const INSTALLMENT_STATUSES = [
  'PAGADO',
  'PENDIENTE',
  'VENCIDO',
  'ANULADO',
  'EXONERADO',
] as const;
export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number];

export const DISCOUNT_APPLICATIONS = ['AUTOMATICO', 'MANUAL'] as const;
export type DiscountApplication = (typeof DISCOUNT_APPLICATIONS)[number];

export const ACTIVE_STATUSES = ['ACTIVO', 'INACTIVO'] as const;
export type ActiveStatus = (typeof ACTIVE_STATUSES)[number];

// ===== Caja y cobros (R2 — E1) =====

export const PAYMENT_METHODS = ['EFECTIVO', 'YAPE_PLIN', 'TRANSFERENCIA', 'TARJETA'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CASH_SESSION_STATUSES = ['ABIERTA', 'CERRADA'] as const;
export type CashSessionStatus = (typeof CASH_SESSION_STATUSES)[number];

export const RECEIPT_STATUSES = ['EMITIDO', 'ANULADO'] as const;
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number];

// ===== Compromisos y devoluciones (R2 — E3) =====

export const COMMITMENT_STATUSES = [
  'PROPUESTO',
  'VIGENTE',
  'CUMPLIDO',
  'INCUMPLIDO',
  'RECHAZADO',
  'ANULADO',
] as const;
export type CommitmentStatus = (typeof COMMITMENT_STATUSES)[number];

export const COMMITMENT_FREQUENCIES = ['MENSUAL', 'QUINCENAL'] as const;
export type CommitmentFrequency = (typeof COMMITMENT_FREQUENCIES)[number];

export const REFUND_STATUSES = [
  'PENDIENTE_APROBACION',
  'APROBADA',
  'RECHAZADA',
  'DEVUELTA',
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const REFUND_METHODS = ['EFECTIVO', 'TRANSFERENCIA', 'APLICACION_CUOTA'] as const;
export type RefundMethod = (typeof REFUND_METHODS)[number];

// ===== Tesorería (R2 — E4): gastos, otros ingresos y caja chica =====

export const TREASURY_KINDS = ['GASTO', 'INGRESO'] as const;
export type TreasuryKind = (typeof TREASURY_KINDS)[number];

export const TREASURY_ORIGINS = ['MANUAL', 'CAJA_CHICA'] as const;
export type TreasuryOrigin = (typeof TREASURY_ORIGINS)[number];

export const PETTY_RENDITION_SOURCES = ['EFECTIVO_CAJA', 'TRANSFERENCIA'] as const;
export type PettyRenditionSource = (typeof PETTY_RENDITION_SOURCES)[number];

// ===== Personal (R3 — E1) =====

export const STAFF_ROLES = [
  'DOCENTE',
  'SECRETARIA',
  'AUXILIAR',
  'MANTENIMIENTO',
  'DIRECCION',
  'PORTERIA',
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const EMPLOYMENT_TYPES = ['TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'POR_HORAS'] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const STAFF_STATUSES = ['ACTIVO', 'LICENCIA', 'CESADO'] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

export const PENSION_KINDS = ['ONP', 'AFP'] as const;
export type PensionKind = (typeof PENSION_KINDS)[number];
