// DTOs de la pantalla Caja y cobros (R2 · Etapa 1), según el contrato de la API.
// Los montos viajan como string decimal ("280.00"); el front convierte a centavos
// para mostrar con formatPEN. Fechas civiles como "yyyy-mm-dd"; datetimes en ISO.
import type { ActiveStatus } from '@elohim/shared';

/** Método de cobro. Espejo del enum del backend (PAYMENT_METHODS). */
export type PaymentMethod = 'EFECTIVO' | 'YAPE_PLIN' | 'TRANSFERENCIA' | 'TARJETA';
/** Estado de un recibo. */
export type ReceiptStatus = 'EMITIDO' | 'ANULADO';
/** Estado de la caja del día. */
export type CashSessionStatus = 'ABIERTA' | 'CERRADA';

/** Caja del día (apertura + arqueo de cierre). */
export interface CashSession {
  id: string;
  /** yyyy-mm-dd (fecha civil). */
  date: string;
  status: CashSessionStatus;
  /** ISO datetime de apertura. */
  openedAt: string;
  openedByName: string;
  initialAmount: string;
  /** Presentes solo cuando la caja ya cerró. */
  closedAt?: string | null;
  closedByName?: string | null;
  expectedCash?: string | null;
  countedCash?: string | null;
  difference?: string | null;
  closeNotes?: string | null;
}

/** Totales del día para las StatCards. */
export interface DayStats {
  totalAmount: string;
  cashAmount: string;
  digitalAmount: string;
  operationsCount: number;
  cashCount: number;
  digitalCount: number;
  canceledCount: number;
  /** Devoluciones en efectivo del día (restan del efectivo esperado). E3. */
  refundsCashAmount: string;
  /** Cantidad de devoluciones ejecutadas hoy. E3. */
  refundsCount: number;
}

/** Tipo de movimiento de la caja: un cobro o una devolución. E3. */
export type MovementKind = 'COBRO' | 'DEVOLUCION';
/** Estado mostrado en el movimiento (recibo EMITIDO/ANULADO o devolución DEVUELTA). */
export type MovementStatus = ReceiptStatus | 'DEVUELTA';

/** Fila de la tabla «Movimientos del día». */
export interface Movement {
  id: string;
  code: string;
  /** ISO datetime. */
  createdAt: string;
  studentName: string;
  summary: string;
  method: PaymentMethod;
  totalAmount: string;
  cashierName: string;
  status: MovementStatus;
  /** COBRO (recibo) o DEVOLUCION (egreso D-xxxx). E3. */
  kind: MovementKind;
}

/** Respuesta de GET /cashier/day. */
export interface CashierDayResponse {
  session: CashSession | null;
  stats: DayStats;
  movements: Movement[];
}

/** Concepto de venta activo, catálogo de «Otros conceptos». */
export interface SaleConceptOption {
  id: string;
  name: string;
  price: string;
  status: ActiveStatus;
}

/** Resultado de la búsqueda de estudiantes en Caja. */
export interface StudentHit {
  id: string;
  code: string;
  fullName: string;
  gradeSection: string;
  primaryGuardianName: string;
  primaryGuardianPhone: string;
  debtAmount: string;
}

/** Estado de una cuota cobrable. */
export type CollectibleStatus = 'PENDIENTE' | 'VENCIDO';

/** Cuota pendiente o vencida de un estudiante. */
export interface Collectible {
  id: string;
  concept: string;
  /** yyyy-mm-dd (fecha original de la cuota). */
  dueDate: string;
  /** yyyy-mm-dd — la reprogramada si su compromiso está VIGENTE, si no la original. */
  effectiveDueDate?: string;
  /** Código del compromiso VIGENTE que la incluye (CP-####), si hay. */
  commitmentCode?: string | null;
  amount: string;
  /** Mora acumulada en la cuota (0.00 si no aplica). */
  lateFee: string;
  /** amount + lateFee: el monto que realmente se cobra. */
  totalWithFee: string;
  status: CollectibleStatus;
  type: 'MATRICULA' | 'PENSION';
  source: 'ESCOLAR' | 'PROGRAMA';
}

/** Respuesta de GET /cashier/students/:id/collectibles. */
export interface CollectiblesResponse {
  student: {
    id: string;
    code: string;
    fullName: string;
    gradeSection: string;
    primaryGuardianName?: string;
    primaryGuardianPhone?: string;
    debtAmount?: string;
  };
  installments: Collectible[];
}

// ---- Recibo -----------------------------------------------------------------

export interface ReceiptStudent {
  id: string;
  code: string;
  fullName: string;
  gradeSection: string;
}

export interface ReceiptItem {
  concept: string;
  quantity: number;
  amount: string;
}

/** Recibo emitido (respuesta de POST /cashier/receipts y GET /cashier/receipts/:id). */
export interface Receipt {
  id: string;
  code: string;
  /** ISO datetime. */
  createdAt: string;
  status: ReceiptStatus;
  method: PaymentMethod;
  operationNumber: string | null;
  totalAmount: string;
  receivedAmount: string | null;
  changeAmount: string | null;
  cashierName: string;
  student: ReceiptStudent;
  guardianName: string;
  guardianPhone: string;
  items: ReceiptItem[];
  canceledAt?: string | null;
  cancelReason?: string | null;
  canceledByName?: string | null;
}

// ---- Bodies de mutación -----------------------------------------------------

export interface OpenSessionBody {
  initialAmount: string;
}

export interface CloseSessionBody {
  countedCash: string;
  notes?: string;
}

export interface SaleItemInput {
  saleConceptId: string;
  quantity: number;
}

export interface CreateReceiptBody {
  studentId: string;
  installmentIds: string[];
  saleItems: SaleItemInput[];
  method: PaymentMethod;
  operationNumber?: string;
  receivedAmount?: string;
}

export interface CancelReceiptBody {
  reason: string;
}

// ---- Devoluciones (R2 · Etapa 3) --------------------------------------------

/** Estado de una devolución (dos pasos + ejecución). */
export type RefundStatus = 'PENDIENTE_APROBACION' | 'APROBADA' | 'RECHAZADA' | 'DEVUELTA';
/** Forma en que se ejecuta la devolución. */
export type RefundMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'APLICACION_CUOTA';
/** Filtro de estado en la pestaña Devoluciones. */
export type RefundStatusFilter = 'TODAS' | RefundStatus;

/** Solicitud de devolución (GET /cashier/refunds). */
export interface Refund {
  id: string;
  code: string;
  receiptId: string;
  receiptCode: string;
  studentId: string;
  studentName: string;
  amount: string;
  reason: string;
  method: RefundMethod;
  /** Cuota destino cuando method === 'APLICACION_CUOTA'. */
  targetInstallmentId: string | null;
  targetConcept: string | null;
  status: RefundStatus;
  requestedByName: string | null;
  approvedByName: string | null;
  rejectReason: string | null;
  executedByName: string | null;
  /** ISO datetime de la ejecución (cuando quedó DEVUELTA). */
  executedAt: string | null;
  operationNumber: string | null;
  createdAt: string;
}

/** Respuesta de GET /cashier/refunds. */
export interface RefundsPage {
  total: number;
  items: Refund[];
}

/** Recibo emitido encontrado en la búsqueda (GET /cashier/receipts/search). */
export interface ReceiptHit {
  id: string;
  code: string;
  studentName: string;
  totalAmount: string;
  /** ISO datetime. */
  createdAt: string;
  method: PaymentMethod;
}

export interface CreateRefundBody {
  receiptId: string;
  amount: string;
  method: RefundMethod;
  targetInstallmentId?: string;
  reason: string;
}

export interface ExecuteRefundBody {
  operationNumber?: string;
}

// ---- Historial de cajas (R2 · Etapa 3) --------------------------------------

/** Fila del historial de cajas cerradas/abiertas (GET /cashier/sessions). */
export interface CashierSessionSummary {
  id: string;
  /** yyyy-mm-dd. */
  date: string;
  status: CashSessionStatus;
  openedByName: string;
  closedByName: string | null;
  openedAt: string;
  closedAt: string | null;
  initialAmount: string;
  totalAmount: string;
  cashAmount: string;
  digitalAmount: string;
  refundsCashAmount: string;
  expectedCash: string | null;
  countedCash: string | null;
  difference: string | null;
  closeNotes: string | null;
  operationsCount: number;
  canceledCount: number;
}

/** Respuesta de GET /cashier/sessions. */
export interface SessionsPage {
  total: number;
  items: CashierSessionSummary[];
}

/** Detalle de una caja (GET /cashier/sessions/:id) — mismos shapes que /day. */
export interface SessionDetailResponse {
  session: CashSession;
  stats: DayStats;
  movements: Movement[];
}
