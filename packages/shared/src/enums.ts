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

export const TREASURY_ORIGINS = ['MANUAL', 'CAJA_CHICA', 'PLANILLA'] as const;
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

export const STAFF_STATUSES = ['ACTIVO', 'LICENCIA', 'INACTIVO'] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

export const PENSION_KINDS = ['ONP', 'AFP'] as const;
export type PensionKind = (typeof PENSION_KINDS)[number];

// ===== Marcación y asistencia (R3 — E2) =====

export const LATE_COUNT_PERIODS = ['MES', 'BIMESTRE'] as const;
export type LateCountPeriod = (typeof LATE_COUNT_PERIODS)[number];

// Estado derivado de asistencia de un empleado en un día (no se materializa en BD).
export const ATTENDANCE_STATUSES = [
  'PUNTUAL',
  'TARDANZA',
  'SIN_MARCAR',
  'FALTA',
  'LICENCIA',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// ===== Planilla (R3 — E3) =====

export const PAYROLL_STATUSES = ['PENDIENTE', 'PAGADO'] as const;
export type PayrollStatus = (typeof PAYROLL_STATUSES)[number];

export const PAYROLL_ITEM_KINDS = [
  'AUTO_TARDANZAS',
  'ADELANTO',
  'DANO_PERDIDA',
  'INASISTENCIA',
  'OTRO',
] as const;
export type PayrollItemKind = (typeof PAYROLL_ITEM_KINDS)[number];

// Descuentos manuales que Secretaría/Admin puede agregar (el AUTO_TARDANZAS lo crea el sistema).
export const PAYROLL_MANUAL_ITEM_KINDS = ['ADELANTO', 'DANO_PERDIDA', 'INASISTENCIA', 'OTRO'] as const;
export type PayrollManualItemKind = (typeof PAYROLL_MANUAL_ITEM_KINDS)[number];

export const PAYROLL_ITEM_STATUSES = ['APLICADO', 'ANULADO'] as const;
export type PayrollItemStatus = (typeof PAYROLL_ITEM_STATUSES)[number];

// ===== Académico (R4 — E1): asistencia de estudiantes =====

// Estado de asistencia de un estudiante en un día (P/T/F/J). Se materializa por matrícula y día.
export const STUDENT_ATTENDANCE_STATUSES = [
  'PRESENTE',
  'TARDANZA',
  'FALTA',
  'JUSTIFICADA',
] as const;
export type StudentAttendanceStatus = (typeof STUDENT_ATTENDANCE_STATUSES)[number];

// Rol del docente sobre una sección (para la vista "mis secciones").
export const SECTION_TEACHER_ROLES = ['TUTOR', 'DOCENTE'] as const;
export type SectionTeacherRole = (typeof SECTION_TEACHER_ROLES)[number];

// ===== Académico (R4 — E2): notas por competencias =====

// Escala literal única para todos los niveles (incluido Inicial). Orden de mejor a peor.
export const GRADE_LETTERS = ['AD', 'A', 'B', 'C'] as const;
export type GradeLetter = (typeof GRADE_LETTERS)[number];

// Aspectos de evaluación cualitativa de la libreta: los registra el TUTOR del aula.
export const EVALUATION_ASPECT_KINDS = ['FORMATIVO', 'APODERADO'] as const;
export type EvaluationAspectKind = (typeof EVALUATION_ASPECT_KINDS)[number];

// Condición del curso en el bimestre (derivada del promedio de competencias; no se materializa).
export const COURSE_CONDITIONS = ['LOGRADO', 'EN_PROCESO', 'EN_INICIO'] as const;
export type CourseCondition = (typeof COURSE_CONDITIONS)[number];

// ===== Académico (R4 — E3): conducta e incidencias =====

// Gravedad de una incidencia disciplinaria (solo faltas, no méritos).
// LEVE = solo registro · MODERADA = aviso al apoderado · GRAVE = aviso + citación presencial.
export const CONDUCT_SEVERITIES = ['LEVE', 'MODERADA', 'GRAVE'] as const;
export type ConductSeverity = (typeof CONDUCT_SEVERITIES)[number];

// Estados de una incidencia. REGISTRADA → APODERADO_NOTIFICADO (moderada) / CITACION_PROGRAMADA
// (grave) → CERRADA. ANULADA (solo Admin) es terminal — "nada se borra".
export const CONDUCT_STATUSES = [
  'REGISTRADA',
  'APODERADO_NOTIFICADO',
  'CITACION_PROGRAMADA',
  'CERRADA',
  'ANULADA',
] as const;
export type ConductStatus = (typeof CONDUCT_STATUSES)[number];
