// DTOs del Dashboard económico (R2 · Etapa 5) — GET /api/dashboard/summary?yearId.
// Montos como string decimal ("0.00"); fechas civiles "yyyy-mm-dd"; datetimes ISO.
import type { PaymentMethod, ReceiptStatus } from '@elohim/shared';
import type { CashSessionStatus } from '../cashier/types';

/** Último recibo emitido (fila de «Pagos recientes»). */
export interface RecentReceipt {
  id: string;
  code: string;
  studentName: string;
  gradeSection: string;
  summary: string;
  /** ISO datetime. */
  createdAt: string;
  totalAmount: string;
  method: PaymentMethod;
  status: ReceiptStatus;
}

/** Gasto reciente de Tesorería (fila de «Últimos gastos»). */
export interface RecentExpense {
  id: string;
  code: string;
  /** yyyy-mm-dd. */
  date: string;
  description: string;
  categoryName: string;
  amount: string;
}

/** Familia con deuda vencida efectiva (fila de «Principales deudores»). */
export interface TopDebtor {
  guardianId: string;
  guardianName: string;
  /** Etiqueta de los hijos con deuda ("Hugo (6° A)"). */
  childrenLabel: string;
  overdueCount: number;
  amount: string;
  phone: string;
}

/** % cobrado del mes por nivel (Inicial/Primaria/Secundaria + Programas). */
export interface CollectionByLevel {
  label: string;
  expected: string;
  collected: string;
  /** % cobrado con 1 decimal. */
  pct: number;
}

/** Resumen económico del Dashboard. */
export interface DashboardSummary {
  students: {
    active: number;
    /** Variación vs. año anterior (%), o null si no hay comparativo. */
    deltaPct: number | null;
  };
  monthCollected: {
    amount: string;
    count: number;
    /** Mes del año lectivo (1..12). */
    month: number;
  };
  overdue: {
    amount: string;
    count: number;
    /** % de morosidad con 1 decimal. */
    rate: number;
  };
  todayCash: {
    sessionStatus: CashSessionStatus | null;
    collectedToday: string;
    operationsCount: number;
  };
  collectionGoal: {
    expected: string;
    collected: string;
    /** % cobrado con 1 decimal. */
    pct: number;
  };
  collectionByLevel: CollectionByLevel[];
  recentReceipts: RecentReceipt[];
  recentExpenses: RecentExpense[];
  topDebtors: TopDebtor[];
}
