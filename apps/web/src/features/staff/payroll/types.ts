// DTOs de la pestaña Planilla (R3 · Etapa 3), según el contrato de la API.
// Los montos viajan como string decimal ("1234.00"); el front convierte a centavos
// para mostrar con formatPEN. Tipos locales: el backend va en paralelo, no se
// importan símbolos nuevos de '@elohim/shared'.
import type { EmploymentType } from '../types';

/** Régimen pensionario del snapshot de la fila. */
export type PayrollSchemeKind = 'ONP' | 'AFP';

/** Estado de una fila de planilla. */
export type PayrollEntryStatus = 'PENDIENTE' | 'PAGADO';

/** Estado de un ítem de descuento (append-only: anular no borra). */
export type PayrollItemStatus = 'APLICADO' | 'ANULADO';

/** Tipo de ítem de descuento. AUTO_TARDANZAS es el único automático. */
export type PayrollItemKind =
  | 'AUTO_TARDANZAS'
  | 'ADELANTO'
  | 'DANO_PERDIDA'
  | 'INASISTENCIA'
  | 'OTRO';

/** Método de pago de planilla (subconjunto de los métodos de caja). */
export type PayrollMethod = 'EFECTIVO' | 'YAPE_PLIN' | 'TRANSFERENCIA';

/** Un ítem de descuento de la fila (tardanzas auto, adelantos, etc.). */
export interface PayrollItemDto {
  id: string;
  kind: PayrollItemKind;
  /** true = generado por el sistema (tardanzas); no se agrega a mano. */
  auto: boolean;
  detail: string;
  amount: string;
  status: PayrollItemStatus;
  cancelReason: string | null;
  canceledByName: string | null;
}

/** Fila de planilla de un empleado en el periodo. */
export interface PayrollEntryDto {
  id: string;
  staffId: string;
  staffCode: string;
  staffName: string;
  position: string;
  employmentType: EmploymentType;
  schemeName: string;
  schemeKind: PayrollSchemeKind;
  /** Sueldo bruto del mes (editable en POR_HORAS). */
  grossAmount: string;
  /** true si el bruto de la fila se puede editar (POR_HORAS). */
  grossEditable: boolean;
  /** true si el bruto fue editado a mano para este mes. */
  grossEdited: boolean;
  lateCount: number;
  items: PayrollItemDto[];
  /** Aportes retenidos (ONP/AFP) que se muestran en la boleta tal cual. */
  contribItems: { concept: string; amount: string }[];
  contribTotal: string;
  discountTotal: string;
  netAmount: string;
  essaludAmount: string;
  status: PayrollEntryStatus;
  paidAt: string | null;
  paymentMethod: PayrollMethod | null;
  operationNumber: string | null;
  batchCode: string | null;
}

/** Periodo de planilla (mes/año). */
export interface PayrollPeriodDto {
  id: string;
  year: number;
  month: number;
}

/** Totales del periodo para las StatCards. */
export interface PayrollStatsDto {
  totalNet: string;
  paidNet: string;
  paidCount: number;
  pendingNet: string;
  pendingCount: number;
  discountsTotal: string;
  employeeCount: number;
}

/** Respuesta de GET /payroll y POST /payroll/:periodId/refresh. */
export interface PayrollResponseDto {
  /**
   * true si el periodo tiene planilla generada. Solo el mes en curso se genera
   * solo al abrirlo; un mes pasado sin planilla llega con generated=false,
   * period=null, entries=[] y stats en ceros.
   */
  generated: boolean;
  period: PayrollPeriodDto | null;
  /** Tasa de EsSalud a cargo del colegio ("9.00"). */
  essaludRatePct: string;
  stats: PayrollStatsDto;
  entries: PayrollEntryDto[];
}

// ---- Bodies de mutación -----------------------------------------------------

// Montos como string decimal "1234.00" — la API valida contra NUMERIC(10,2), nunca float.
export interface UpdateGrossBody {
  grossAmount: string;
}

export interface AddItemBody {
  kind: PayrollItemKind;
  amount: string;
  detail: string;
}

export interface CancelItemBody {
  reason: string;
}

export interface PayEntryBody {
  method: PayrollMethod;
  operationNumber?: string;
}

export interface PayAllBody {
  method: PayrollMethod;
}

export interface CancelPaymentBody {
  reason: string;
}
