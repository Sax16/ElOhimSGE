// DTOs de la pantalla Reportes (R2 · Etapa 5), según el contrato de la API.
// Montos como string decimal ("0.00"); fechas civiles "yyyy-mm-dd".
import type { EnrollmentType, PaymentMethod, StudentStatus } from '@elohim/shared';
import type { CashierSessionSummary } from '../cashier/types';

/** Identificador del reporte activo. */
export type ReportKey = 'delinquency' | 'income' | 'cash' | 'roster' | 'payrollAnnual';

// ---- Morosidad por grado ----------------------------------------------------
export interface DelinquencyGroup {
  groupLabel: string;
  studentsCount: number;
  debtorsCount: number;
  /** % morosidad con 1 decimal. */
  rate: number;
  overdueAmount: string;
}
export interface DelinquencyReport {
  groups: DelinquencyGroup[];
  totalAmount: string;
  totalCount: number;
  totalDebtors: number;
}

// ---- Ingresos por concepto --------------------------------------------------
export interface IncomeByConcept {
  concept: string;
  /** Puede ser negativo (concepto «Devoluciones»). */
  amount: string;
  count: number;
}
export interface IncomeByMethod {
  method: PaymentMethod;
  amount: string;
  count: number;
}
export interface IncomeReport {
  byConcept: IncomeByConcept[];
  byMethod: IncomeByMethod[];
  total: string;
}

// ---- Caja diaria ------------------------------------------------------------
export interface CashReportTotals {
  collected: string;
  cash: string;
  digital: string;
  refunds: string;
  otherIncome: string;
  pettyOut: string;
  differencesTotal: string;
}
export interface CashReport {
  sessions: CashierSessionSummary[];
  totals: CashReportTotals;
}

// ---- Padrón de estudiantes --------------------------------------------------
export interface RosterRow {
  code: string;
  fullName: string;
  dni: string;
  gradeSection: string;
  status: StudentStatus;
  enrollmentType: EnrollmentType;
  guardianName: string;
  guardianDni: string;
  guardianPhone: string;
  guardianEmail: string;
}
export interface RosterReport {
  rows: RosterRow[];
  total: number;
}
