// DTOs de la pantalla Gastos e ingresos (Tesorería · R2 · Etapa 4), según el
// contrato de la API. Los montos viajan como string decimal ("0.00"); el front
// convierte a centavos para mostrar con formatPEN. Fechas civiles "yyyy-mm-dd".
import type { ActiveStatus } from '@elohim/shared';
import type { PaymentMethod } from '../cashier/types';

/** Tipo de movimiento de tesorería. */
export type TreasuryKind = 'GASTO' | 'INGRESO';
/** Origen del movimiento: registrado a mano o derivado de una rendición de caja chica. */
export type TreasuryOrigin = 'MANUAL' | 'CAJA_CHICA';
/** Estado del movimiento (auditoría append-only: anular no borra). */
export type TreasuryStatus = 'ACTIVO' | 'ANULADO';
/** Origen de la reposición al rendir la caja chica. */
export type PettyRenditionSource = 'EFECTIVO_CAJA' | 'TRANSFERENCIA';

export type { PaymentMethod };

/** Un gasto o ingreso de tesorería (GET /treasury/movements). */
export interface TreasuryMovement {
  id: string;
  code: string;
  kind: TreasuryKind;
  /** yyyy-mm-dd (fecha civil). */
  date: string;
  categoryId: string;
  categoryName: string;
  description: string;
  supplier: string | null;
  voucherNumber: string | null;
  notes: string | null;
  method: PaymentMethod;
  amount: string;
  origin: TreasuryOrigin;
  /** Referencia al origen (código de rendición REND-#### para CAJA_CHICA). */
  originRef: string | null;
  /** Fecha de la caja del día vinculada (ingresos en efectivo). */
  cashSessionDate: string | null;
  registeredByName: string;
  status: TreasuryStatus;
  canceledAt: string | null;
  cancelReason: string | null;
  canceledByName: string | null;
  /** ISO datetime. */
  createdAt: string;
}

/** Respuesta paginada de GET /treasury/movements. */
export interface TreasuryMovementsPage {
  total: number;
  page: number;
  pageSize: number;
  items: TreasuryMovement[];
}

/** Filtros de la lista de movimientos. */
export interface MovementsQuery {
  kind: TreasuryKind;
  categoryId: string | null;
  month: number;
  year: number;
  q: string;
  page: number;
  pageSize: number;
}

/** Categoría de gasto o ingreso (GET /treasury/categories). */
export interface TreasuryCategory {
  id: string;
  kind: TreasuryKind;
  name: string;
  status: ActiveStatus;
  movementCount: number;
}

/** Fila de un rubro del resumen (Cobros en caja, Otros ingresos, Gastos…). */
export interface SummaryRubro {
  key: string;
  label: string;
  /** Monto con signo: positivo = ingreso, negativo = egreso. */
  amount: string;
}

/** Monto agrupado por categoría (para las barras de progreso). */
export interface CategoryAmount {
  name: string;
  amount: string;
}

/** Respuesta de GET /treasury/summary. */
export interface TreasurySummary {
  incomeTotal: string;
  expenseTotal: string;
  net: string;
  /** Resultado acumulado del año (reemplaza «Caja disponible» del prototipo). */
  yearNet: string;
  rubros: SummaryRubro[];
  expensesByCategory: CategoryAmount[];
  incomesByCategory: CategoryAmount[];
}

// ---- Caja chica -------------------------------------------------------------

/** Gasto menor del fondo fijo. */
export interface PettyExpense {
  id: string;
  /** yyyy-mm-dd. */
  date: string;
  concept: string;
  amount: string;
  voucherNumber: string | null;
  registeredByName: string;
  status: TreasuryStatus;
}

/** Rendición del fondo (consolida los gastos menores en un gasto de Tesorería). */
export interface PettyRendition {
  id: string;
  code: string;
  /** ISO datetime. */
  createdAt: string;
  totalAmount: string;
  expensesCount: number;
  source: PettyRenditionSource;
  /** Código del gasto consolidado creado en Gastos. */
  movementCode: string;
}

/** Detalle de una rendición (GET /treasury/petty-cash/renditions/:id). */
export interface PettyRenditionDetail extends PettyRendition {
  expenses: PettyExpense[];
}

/** Respuesta de GET /treasury/petty-cash. */
export interface PettyCashResponse {
  fund: {
    amount: string;
    responsibleId: string;
    responsibleName: string;
  };
  spent: string;
  balance: string;
  expenses: PettyExpense[];
  renditions: PettyRendition[];
}

// ---- Bodies de mutación -----------------------------------------------------

export interface CreateMovementBody {
  kind: TreasuryKind;
  categoryId: string;
  description: string;
  amount: string;
  method: PaymentMethod;
  date?: string;
  supplier?: string;
  voucherNumber?: string;
  notes?: string;
}

export interface UpdateMovementBody {
  categoryId?: string;
  description?: string;
  amount?: string;
  method?: PaymentMethod;
  date?: string;
  supplier?: string;
  voucherNumber?: string;
  notes?: string;
}

export interface CancelBody {
  reason: string;
}

export interface CategoryBody {
  kind: TreasuryKind;
  name: string;
  status: ActiveStatus;
}

export interface UpdateCategoryBody {
  name?: string;
  status?: ActiveStatus;
}

export interface PettyExpenseBody {
  concept: string;
  amount: string;
  voucherNumber?: string;
  date?: string;
}

export interface RenditionBody {
  source: PettyRenditionSource;
}

export interface FundBody {
  amount: string;
  responsibleId: string;
}
