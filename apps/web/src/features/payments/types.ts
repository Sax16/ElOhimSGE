// DTOs de la pantalla Pensiones (R2 · Etapa 2), según el contrato de la API.
// Montos como string decimal ("280.00"); fechas civiles "yyyy-mm-dd"; datetimes ISO.
import type { InstallmentStatus } from '@elohim/shared';

/** Filtro de tipo de cuota en la barra de Pensiones. */
export type PensionTypeFilter = 'PENSION' | 'MATRICULA' | 'PROGRAMA' | 'TODAS';
/** Filtro de estado (pestañas). */
export type PensionStatusFilter = 'TODAS' | 'PENDIENTES' | 'PAGADAS' | 'VENCIDAS';
/** Origen de la cuota: enseñanza regular o programa complementario. */
export type InstallmentSource = 'ESCOLAR' | 'PROGRAMA';
/** Tipo concreto de la cuota devuelta. */
export type InstallmentRowType = 'PENSION' | 'MATRICULA' | 'PROGRAMA';

/** Fila de la tabla de Pensiones (GET /billing/installments). */
export interface InstallmentRow {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  gradeSection: string;
  concept: string;
  type: InstallmentRowType;
  source: InstallmentSource;
  /** yyyy-mm-dd. */
  dueDate: string;
  /** Monto base de la cuota. */
  amount: string;
  /** Mora acumulada en la cuota (0.00 si no aplica). */
  lateFee: string;
  /** amount + lateFee. */
  totalWithFee: string;
  status: InstallmentStatus;
  /** La mora fue exonerada por un Admin. */
  exonerated: boolean;
  receiptId: string | null;
  receiptCode: string | null;
  guardianId: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  /** ISO datetime del último recordatorio enviado, o null. */
  lastReminderAt: string | null;
  /** Código del compromiso VIGENTE que reprograma esta cuota, o null (E3). */
  commitmentCode?: string | null;
  /** Fecha efectiva: la reprogramada si el compromiso está vigente, si no la original (E3). */
  effectiveDueDate?: string | null;
}

/** Respuesta paginada de GET /billing/installments. */
export interface InstallmentsPage {
  total: number;
  page: number;
  pageSize: number;
  items: InstallmentRow[];
}

/** Parámetros de consulta de la lista de cuotas. */
export interface InstallmentsQuery {
  yearId: string | undefined;
  /** 3..12, o null para «Todo el año». */
  month: number | null;
  type: PensionTypeFilter;
  status: PensionStatusFilter;
  q: string;
  page: number;
  pageSize: number;
}

/** Totales para las StatCards (GET /billing/installments/stats). */
export interface PensionStats {
  /** Cobrado del mes seleccionado. */
  collectedAmount: string;
  collectedCount: number;
  /** Por cobrar del mes seleccionado. */
  pendingAmount: string;
  pendingCount: number;
  /** Vencido acumulado del año. */
  overdueAmount: string;
  overdueCount: number;
  /** Cuotas exigibles a la fecha (para el denominador de morosidad). */
  dueToDateCount: number;
  /** % de morosidad con 1 decimal (cuotas vencidas vs. exigibles). */
  overdueRate: number;
}

/** Vista previa de un recordatorio (GET /billing/reminders/preview). */
export interface ReminderPreview {
  guardianId: string;
  guardianName: string;
  phone: string;
  /** Enlace wa.me con el mensaje prellenado. */
  waUrl: string;
  message: string;
  totalAmount: string;
  itemsCount: number;
  lastReminderAt: string | null;
}

/** Recordatorio persistido (POST /billing/reminders). */
export interface ReminderResult extends ReminderPreview {
  id: string;
  createdAt: string;
}

/** Resultado de correr la mora del día (POST /billing/late-fees/run). */
export interface LateFeeRunResult {
  markedOverdue: number;
  feesApplied: number;
}

// ---- Compromisos de pago (R2 · Etapa 3) -------------------------------------

/** Estado de un compromiso. Espejo del enum del backend (COMMITMENT_STATUSES). */
export type CommitmentStatus =
  | 'PROPUESTO'
  | 'VIGENTE'
  | 'CUMPLIDO'
  | 'INCUMPLIDO'
  | 'RECHAZADO'
  | 'ANULADO';

/** Frecuencia de reprogramación de las cuotas del compromiso. */
export type CommitmentFrequency = 'MENSUAL' | 'QUINCENAL';

/** Filtro de estado en la pestaña Compromisos. */
export type CommitmentStatusFilter = 'TODOS' | CommitmentStatus;

/** Cuota reprogramada por el compromiso (item del plan 1:1). */
export interface CommitmentItem {
  installmentId: string;
  /** Id del estudiante dueño de la cuota (para el deep-link a Caja). */
  studentId: string;
  sequence: number;
  concept: string;
  childName: string;
  /** yyyy-mm-dd — fecha original de la cuota. */
  originalDueDate: string;
  /** yyyy-mm-dd — nueva fecha pactada. */
  newDueDate: string;
  amount: string;
  paid: boolean;
}

/** Compromiso de pago (GET /billing/commitments). */
export interface Commitment {
  id: string;
  code: string;
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  /** Etiqueta de los hijos ("María Q. · José R."). */
  childrenLabel: string;
  totalAmount: string;
  itemsCount: number;
  paidCount: number;
  status: CommitmentStatus;
  frequency: CommitmentFrequency;
  /** yyyy-mm-dd — primera cuota pactada. */
  firstDueDate: string;
  proposedByName: string | null;
  approvedByName: string | null;
  rejectReason: string | null;
  cancelReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  breachedAt: string | null;
  fulfilledAt: string | null;
  items: CommitmentItem[];
}

/** Respuesta paginada de GET /billing/commitments. */
export interface CommitmentsPage {
  total: number;
  page: number;
  pageSize: number;
  items: Commitment[];
}

/** Parámetros de consulta de la lista de compromisos. */
export interface CommitmentsQuery {
  yearId: string | undefined;
  status: CommitmentStatusFilter;
  q: string;
  page: number;
  pageSize: number;
}

/** Cuota vencida elegible para refinanciar (GET .../eligible-installments). */
export interface EligibleInstallment {
  id: string;
  concept: string;
  childName: string;
  /** yyyy-mm-dd. */
  dueDate: string;
  amount: string;
  lateFee: string;
  totalWithFee: string;
  source: InstallmentSource;
}

/** Respuesta de GET /billing/commitments/eligible-installments. */
export interface EligibleInstallmentsResponse {
  guardianName: string;
  guardianPhone: string;
  items: EligibleInstallment[];
}

/** Body de POST /billing/commitments. */
export interface CreateCommitmentBody {
  guardianId: string;
  installmentIds: string[];
  /** yyyy-mm-dd. */
  firstDueDate: string;
  frequency: CommitmentFrequency;
}
