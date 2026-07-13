// Etiquetas de presentación exactas del glosario del proyecto.
// Los badges/estados de la UI deben usar SIEMPRE estos textos (HANDOFF: "Status words: keep these exact").

import {
  type ActiveStatus,
  type CashSessionStatus,
  type CommitmentFrequency,
  type CommitmentStatus,
  type DiscountApplication,
  type EmploymentType,
  type EnrollmentStatus,
  type EnrollmentType,
  type GuardianRelation,
  type InstallmentStatus,
  type InstallmentType,
  type InsuranceType,
  type NotificationChannel,
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

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  ACTIVO: 'Activo',
  LICENCIA: 'Licencia',
  CESADO: 'Cesado',
};
