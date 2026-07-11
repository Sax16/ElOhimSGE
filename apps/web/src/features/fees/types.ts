// DTOs de la pantalla Tarifario y becas (Etapa 5), según el contrato de la API.
// Los montos viajan como string decimal ("250.00"); el front convierte a centavos
// para mostrar con formatPEN.
import type {
  ActiveStatus,
  DiscountApplication,
  ProgramStatus,
  ProgramType,
} from '@elohim/shared';

/** Tarifa por nivel — parte de GET /api/fees. */
export interface FeeLevel {
  levelId: string;
  levelName: string;
  enrollmentFee: string;
  monthlyFee: string;
  /** 10 (mar–dic) u 11 (feb–dic). */
  installmentsCount: number;
}

/** Programa complementario (solo lectura en esta pantalla). */
export interface FeeProgram {
  id: string;
  name: string;
  type: ProgramType;
  enrollmentFee: string;
  monthlyFee: string;
  status: ProgramStatus;
  /** Vigencia (2=Feb..12=Dic). Puede faltar con backend anterior. */
  startMonth?: number;
  endMonth?: number;
}

/** Parámetros de facturación (mora, día de corte, vencimiento). */
export interface BillingSettings {
  lateFeeAmount: string;
  graceDays: number;
  transferCutoffDay: number;
  autoLateFee: boolean;
  /** null = último día del mes. */
  dueDayOfMonth: number | null;
}

/** Descuento o beca — parte de GET /api/fees. */
export interface Discount {
  id: string;
  code: string;
  name: string;
  percent: string;
  application: DiscountApplication;
  condition: string;
  status: ActiveStatus;
  beneficiaries: number;
}

/** Respuesta completa — GET /api/fees?yearId=. */
export interface FeesResponse {
  levels: FeeLevel[];
  programs: FeeProgram[];
  settings: BillingSettings;
  discounts: Discount[];
}

/** Concepto de venta de ventanilla (libros, uniformes, etc.) — GET /billing/sale-concepts. */
export interface BillingSaleConcept {
  id: string;
  name: string;
  price: string;
  status: ActiveStatus;
  /** Cuántos recibos lo usan (bloquea el borrado si > 0). */
  receiptCount: number;
}

// ---- Bodies de mutación ----------------------------------------------------

export interface LevelFeeBody {
  enrollmentFee: string;
  monthlyFee: string;
  installmentsCount: number;
}

export type BillingSettingsBody = Partial<BillingSettings>;

export interface DiscountBody {
  name: string;
  percent: string;
  application: DiscountApplication;
  condition: string;
  status: ActiveStatus;
}

export interface SaleConceptBody {
  name: string;
  price: string;
  status: ActiveStatus;
}
