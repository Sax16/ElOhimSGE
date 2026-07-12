// Hooks TanStack Query para la pantalla Gastos e ingresos (Tesorería · R2 · Etapa 4).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { cashierKeys } from '../cashier/api';
import type {
  CategoryBody,
  CreateMovementBody,
  FundBody,
  MovementsQuery,
  PettyCashResponse,
  PettyExpenseBody,
  PettyRenditionDetail,
  RenditionBody,
  TreasuryCategory,
  TreasuryKind,
  TreasuryMovement,
  TreasuryMovementsPage,
  TreasurySummary,
  UpdateCategoryBody,
  UpdateMovementBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const treasuryKeys = {
  all: ['treasury'] as const,
  movements: (q: MovementsQuery) => ['treasury', 'movements', q] as const,
  categories: (kind: TreasuryKind | undefined) => ['treasury', 'categories', kind ?? 'all'] as const,
  summary: (month: number, year: number) => ['treasury', 'summary', month, year] as const,
  pettyCash: ['treasury', 'petty-cash'] as const,
  rendition: (id: string) => ['treasury', 'rendition', id] as const,
};

/** Invalida tesorería. */
function invalidateTreasury(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: treasuryKeys.all });
}

/** Invalida tesorería + caja (ingresos en efectivo y rendiciones tocan la caja del día). */
function invalidateTreasuryAndCashier(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: treasuryKeys.all });
  void qc.invalidateQueries({ queryKey: cashierKeys.all });
}

// ---- Consultas --------------------------------------------------------------

function movementsQueryString(q: MovementsQuery): string {
  const p = new URLSearchParams();
  p.set('kind', q.kind);
  if (q.categoryId) p.set('categoryId', q.categoryId);
  p.set('month', String(q.month));
  p.set('year', String(q.year));
  const term = q.q.trim();
  if (term) p.set('q', term);
  p.set('page', String(q.page));
  p.set('pageSize', String(q.pageSize));
  return p.toString();
}

/** Lista paginada de movimientos (gastos o ingresos) según filtros. */
export function useTreasuryMovements(query: MovementsQuery) {
  return useQuery<TreasuryMovementsPage>({
    queryKey: treasuryKeys.movements(query),
    queryFn: () => apiFetch<TreasuryMovementsPage>(`/treasury/movements?${movementsQueryString(query)}`),
    placeholderData: (prev) => prev,
  });
}

/** Catálogo de categorías (de un kind, o todas si se omite). */
export function useTreasuryCategories(kind?: TreasuryKind) {
  return useQuery<TreasuryCategory[]>({
    queryKey: treasuryKeys.categories(kind),
    queryFn: () => {
      const qs = kind ? `?kind=${kind}` : '';
      return apiFetch<TreasuryCategory[]>(`/treasury/categories${qs}`);
    },
  });
}

/** Resumen del mes: totales, resultado del año, rubros y desgloses por categoría. */
export function useTreasurySummary(month: number, year: number) {
  return useQuery<TreasurySummary>({
    queryKey: treasuryKeys.summary(month, year),
    queryFn: () => apiFetch<TreasurySummary>(`/treasury/summary?month=${month}&year=${year}`),
  });
}

/** Estado del fondo de caja chica: fondo, gastado, saldo, gastos y rendiciones. */
export function usePettyCash() {
  return useQuery<PettyCashResponse>({
    queryKey: treasuryKeys.pettyCash,
    queryFn: () => apiFetch<PettyCashResponse>('/treasury/petty-cash'),
  });
}

/** Detalle de una rendición (gastos consolidados). */
export function useRenditionDetail(id: string | null) {
  return useQuery<PettyRenditionDetail>({
    queryKey: treasuryKeys.rendition(id ?? ''),
    queryFn: () => apiFetch<PettyRenditionDetail>(`/treasury/petty-cash/renditions/${id}`),
    enabled: !!id,
  });
}

// ---- Mutaciones · movimientos -----------------------------------------------

export function useCreateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMovementBody) =>
      apiFetch<TreasuryMovement>('/treasury/movements', { method: 'POST', body }),
    onSuccess: () => invalidateTreasuryAndCashier(qc),
  });
}

export function useUpdateMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMovementBody }) =>
      apiFetch<TreasuryMovement>(`/treasury/movements/${id}`, { method: 'PATCH', body }),
    onSuccess: () => invalidateTreasuryAndCashier(qc),
  });
}

export function useCancelMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<TreasuryMovement>(`/treasury/movements/${id}/cancel`, { method: 'POST', body: { reason } }),
    onSuccess: () => invalidateTreasuryAndCashier(qc),
  });
}

// ---- Mutaciones · categorías ------------------------------------------------

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryBody) =>
      apiFetch<TreasuryCategory>('/treasury/categories', { method: 'POST', body }),
    onSuccess: () => invalidateTreasury(qc),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryBody }) =>
      apiFetch<TreasuryCategory>(`/treasury/categories/${id}`, { method: 'PATCH', body }),
    onSuccess: () => invalidateTreasury(qc),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/treasury/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateTreasury(qc),
  });
}

// ---- Mutaciones · caja chica ------------------------------------------------

export function useCreatePettyExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PettyExpenseBody) =>
      apiFetch('/treasury/petty-cash/expenses', { method: 'POST', body }),
    onSuccess: () => invalidateTreasury(qc),
  });
}

export function useCancelPettyExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch(`/treasury/petty-cash/expenses/${id}/cancel`, { method: 'POST', body: { reason } }),
    onSuccess: () => invalidateTreasury(qc),
  });
}

export function useCreateRendition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RenditionBody) =>
      apiFetch('/treasury/petty-cash/renditions', { method: 'POST', body }),
    // La rendición crea un gasto consolidado y, si es EFECTIVO_CAJA, un egreso de la caja del día.
    onSuccess: () => invalidateTreasuryAndCashier(qc),
  });
}

export function useUpdateFund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FundBody) => apiFetch('/treasury/petty-cash/fund', { method: 'PATCH', body }),
    onSuccess: () => invalidateTreasury(qc),
  });
}
