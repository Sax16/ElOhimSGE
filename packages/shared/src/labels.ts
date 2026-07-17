// Etiquetas de presentación exactas del glosario del proyecto.
// Los badges/estados de la UI deben usar SIEMPRE estos textos (HANDOFF: "Status words: keep these exact").

import {
  type ActiveStatus,
  type AttendanceStatus,
  type CashSessionStatus,
  type CommitmentFrequency,
  type CommitmentStatus,
  type CourseCondition,
  type DiscountApplication,
  type EvaluationAspectKind,
  type GradeLetter,
  type EmploymentType,
  type EnrollmentStatus,
  type EnrollmentType,
  type GuardianRelation,
  type InstallmentStatus,
  type InstallmentType,
  type InsuranceType,
  type LateCountPeriod,
  type NotificationChannel,
  type PayrollItemKind,
  type PayrollItemStatus,
  type PayrollStatus,
  type PaymentMethod,
  type PeriodStatus,
  type PeriodType,
  type PettyRenditionSource,
  type ProgramStatus,
  type ProgramType,
  type ReceiptStatus,
  type RefundMethod,
  type RefundStatus,
  type Sex,
  type Shift,
  type StaffRole,
  type StaffStatus,
  type StudentAttendanceStatus,
  type StudentStatus,
  type TreasuryKind,
  type TreasuryOrigin,
  type UserRole,
  type UserStatus,
  type YearStatus,
} from './enums';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  SECRETARIA_CAJA: 'Secretaría / Caja',
  DOCENTE: 'Docente',
  PORTERIA: 'Portería',
  APODERADO: 'Apoderado',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVO: 'Activo',
  SUSPENDIDO: 'Suspendido',
};

export const YEAR_STATUS_LABELS: Record<YearStatus, string> = {
  ACTIVO: 'Activo',
  CERRADO: 'Cerrado',
};

export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  BIMESTRE: 'Bimestre',
  TRIMESTRE: 'Trimestre',
  SEMESTRE: 'Semestre',
};

export const PERIOD_STATUS_LABELS: Record<PeriodStatus, string> = {
  CERRADO: 'Cerrado',
  EN_CURSO: 'En curso',
  PROXIMO: 'Próximo',
};

export const SHIFT_LABELS: Record<Shift, string> = {
  MANANA: 'Mañana',
  TARDE: 'Tarde',
};

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  TALLER: 'Taller',
  REFORZAMIENTO: 'Reforzamiento',
  ACADEMIA: 'Academia',
};

export const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  ACTIVO: 'Activo',
  CERRADO: 'Cerrado',
};

export const SEX_LABELS: Record<Sex, string> = {
  M: 'Masculino',
  F: 'Femenino',
};

export const INSURANCE_TYPE_LABELS: Record<InsuranceType, string> = {
  SIS: 'SIS',
  ESSALUD: 'EsSalud',
  PRIVADO: 'Privado',
  NINGUNO: 'Ninguno',
};

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVO: 'Activo',
  BECADO: 'Becado',
  RETIRADO: 'Retirado',
  TRASLADADO: 'Trasladado',
  EGRESADO: 'Egresado',
  RESERVADO: 'Reservado',
};

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  WHATSAPP_Y_CORREO: 'WhatsApp + correo',
  SOLO_WHATSAPP: 'Solo WhatsApp',
  SOLO_CORREO: 'Solo correo',
  NINGUNO: 'Ninguno',
};

export const GUARDIAN_RELATION_LABELS: Record<GuardianRelation, string> = {
  MADRE: 'Madre',
  PADRE: 'Padre',
  ABUELO_A: 'Abuelo/a',
  TIO_A: 'Tío/a',
  TUTOR_LEGAL: 'Tutor legal',
};

export const ENROLLMENT_TYPE_LABELS: Record<EnrollmentType, string> = {
  NUEVA: 'Nueva',
  RATIFICADA: 'Ratificada',
  TRASLADO: 'Traslado',
};

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  COMPLETA: 'Completa',
  PENDIENTE_PAGO: 'Pendiente de pago',
  OBSERVADA: 'Observada',
};

export const INSTALLMENT_TYPE_LABELS: Record<InstallmentType, string> = {
  MATRICULA: 'Matrícula',
  PENSION: 'Pensión',
};

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  PAGADO: 'Pagado',
  PENDIENTE: 'Pendiente',
  VENCIDO: 'Vencido',
  ANULADO: 'Anulado',
  EXONERADO: 'Exonerado',
};

export const DISCOUNT_APPLICATION_LABELS: Record<DiscountApplication, string> = {
  AUTOMATICO: 'Automático',
  MANUAL: 'Manual',
};

export const ACTIVE_STATUS_LABELS: Record<ActiveStatus, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  YAPE_PLIN: 'Yape / Plin',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
};

export const CASH_SESSION_STATUS_LABELS: Record<CashSessionStatus, string> = {
  ABIERTA: 'Abierta',
  CERRADA: 'Cerrada',
};

export const RECEIPT_STATUS_LABELS: Record<ReceiptStatus, string> = {
  EMITIDO: 'Emitido',
  ANULADO: 'Anulado',
};

export const COMMITMENT_STATUS_LABELS: Record<CommitmentStatus, string> = {
  PROPUESTO: 'Propuesto',
  VIGENTE: 'Vigente',
  CUMPLIDO: 'Cumplido',
  INCUMPLIDO: 'Incumplido',
  RECHAZADO: 'Rechazado',
  ANULADO: 'Anulado',
};

export const COMMITMENT_FREQUENCY_LABELS: Record<CommitmentFrequency, string> = {
  MENSUAL: 'Mensual',
  QUINCENAL: 'Quincenal',
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  PENDIENTE_APROBACION: 'Pendiente de aprobación',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  DEVUELTA: 'Devuelta',
};

export const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
  EFECTIVO: 'Efectivo en caja',
  TRANSFERENCIA: 'Transferencia',
  APLICACION_CUOTA: 'Aplicación a cuota',
};

export const TREASURY_KIND_LABELS: Record<TreasuryKind, string> = {
  GASTO: 'Gasto',
  INGRESO: 'Ingreso',
};

export const TREASURY_ORIGIN_LABELS: Record<TreasuryOrigin, string> = {
  MANUAL: 'Manual',
  CAJA_CHICA: 'Caja chica',
  PLANILLA: 'Planilla',
};

export const PETTY_RENDITION_SOURCE_LABELS: Record<PettyRenditionSource, string> = {
  EFECTIVO_CAJA: 'Efectivo de caja del día',
  TRANSFERENCIA: 'Transferencia',
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  DOCENTE: 'Docente',
  SECRETARIA: 'Secretaría',
  AUXILIAR: 'Auxiliar',
  MANTENIMIENTO: 'Mantenimiento',
  DIRECCION: 'Dirección',
  PORTERIA: 'Portería',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  TIEMPO_COMPLETO: 'Tiempo completo',
  MEDIO_TIEMPO: 'Medio tiempo',
  POR_HORAS: 'Por horas',
};

// Abreviaturas del cargo en planilla: "Docente TC", "Docente PH"... (R3 — E3).
export const EMPLOYMENT_TYPE_ABBR: Record<EmploymentType, string> = {
  TIEMPO_COMPLETO: 'TC',
  MEDIO_TIEMPO: 'MT',
  POR_HORAS: 'PH',
};

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  ACTIVO: 'Activo',
  LICENCIA: 'Licencia',
  INACTIVO: 'Inactivo',
};

export const LATE_COUNT_PERIOD_LABELS: Record<LateCountPeriod, string> = {
  MES: 'Por mes',
  BIMESTRE: 'Por bimestre',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PUNTUAL: 'Puntual',
  TARDANZA: 'Tardanza',
  SIN_MARCAR: 'Sin marcar',
  FALTA: 'Falta',
  LICENCIA: 'Licencia',
};

export const PAYROLL_STATUS_LABELS: Record<PayrollStatus, string> = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
};

export const PAYROLL_ITEM_KIND_LABELS: Record<PayrollItemKind, string> = {
  AUTO_TARDANZAS: 'Auto · tardanzas',
  ADELANTO: 'Adelanto de sueldo',
  DANO_PERDIDA: 'Daño o pérdida',
  INASISTENCIA: 'Inasistencia injustificada',
  OTRO: 'Otro',
};

export const PAYROLL_ITEM_STATUS_LABELS: Record<PayrollItemStatus, string> = {
  APLICADO: 'Aplicado',
  ANULADO: 'Anulado',
};

// ===== Académico (R4 — E1): asistencia de estudiantes =====

export const STUDENT_ATTENDANCE_STATUS_LABELS: Record<StudentAttendanceStatus, string> = {
  PRESENTE: 'Presente',
  TARDANZA: 'Tardanza',
  FALTA: 'Falta',
  JUSTIFICADA: 'Justificada',
};

// Letra para la matriz mensual y celdas compactas (P/T/F/J).
export const STUDENT_ATTENDANCE_STATUS_LETTERS: Record<StudentAttendanceStatus, string> = {
  PRESENTE: 'P',
  TARDANZA: 'T',
  FALTA: 'F',
  JUSTIFICADA: 'J',
};

// Tono del badge (design system): éxito/advertencia/peligro/informativo.
export const STUDENT_ATTENDANCE_STATUS_TONES: Record<
  StudentAttendanceStatus,
  'success' | 'warning' | 'danger' | 'info'
> = {
  PRESENTE: 'success',
  TARDANZA: 'warning',
  FALTA: 'danger',
  JUSTIFICADA: 'info',
};

// ===== Académico (R4 — E2): notas por competencias =====

export const GRADE_LETTER_LABELS: Record<GradeLetter, string> = {
  AD: 'Logro destacado',
  A: 'Logrado',
  B: 'En proceso',
  C: 'En inicio',
};

// Tono del badge (design system): éxito/marca/advertencia/peligro.
export const GRADE_LETTER_TONES: Record<GradeLetter, 'success' | 'brand' | 'warning' | 'danger'> = {
  AD: 'success',
  A: 'brand',
  B: 'warning',
  C: 'danger',
};

export const EVALUATION_ASPECT_KIND_LABELS: Record<EvaluationAspectKind, string> = {
  FORMATIVO: 'Aspectos formativos',
  APODERADO: 'Evaluación del apoderado',
};

export const COURSE_CONDITION_LABELS: Record<CourseCondition, string> = {
  LOGRADO: 'Logrado',
  EN_PROCESO: 'En proceso',
  EN_INICIO: 'En inicio',
};
