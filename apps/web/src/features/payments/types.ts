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
