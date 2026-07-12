// Hooks TanStack Query para la pantalla Caja y cobros (R2 · Etapa 1).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  CancelReceiptBody,
  CashierDayResponse,
  CollectiblesResponse,
  CreateReceiptBody,
  CreateRefundBody,
  CloseSessionBody,
  ExecuteRefundBody,
  OpenSessionBody,
  Receipt,
  ReceiptHit,
  Refund,
  RefundsPage,
  RefundStatusFilter,
  SaleConceptOption,
  SessionDetailResponse,
  SessionsPage,
  StudentHit,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const cashierKeys = {
  all: ['cashier'] as const,
  day: ['cashier', 'day'] as const,
  saleConcepts: ['cashier', 'sale-concepts'] as const,
  students: (q: string) => ['cashier', 'students', q] as const,
  collectibles: (studentId: string) => ['cashier', 'collectibles', studentId] as const,
  receipt: (id: string) => ['cashier', 'receipt', id] as const,
  receiptSearch: (q: string) => ['cashier', 'receipt-search', q] as const,
  refunds: (status: RefundStatusFilter, page: number, pageSize: number) =>
    ['cashier', 'refunds', status, page, pageSize] as const,
  sessions: (page: number, pageSize: number) => ['cashier', 'sessions', page, pageSize] as const,
  session: (id: string) => ['cashier', 'session', id] as const,
};

/** Invalida caja + todo lo que depende de cuotas (Pensiones/compromisos usan ['payments']). */
function invalidateCashierAndBilling(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: cashierKeys.all });
  void qc.invalidateQueries({ queryKey: ['payments'] });
}

// ---- Consultas --------------------------------------------------------------

/** Caja del día: sesión, totales y movimientos. */
export function useCashierDay() {
  return useQuery<CashierDayResponse>({
    queryKey: cashierKeys.day,
    queryFn: () => apiFetch<CashierDayResponse>('/cashier/day'),
  });
}

/** Catálogo de conceptos de venta activos (para «Otros conceptos»). */
export function useCashierSaleConcepts() {
  return useQuery<SaleConceptOption[]>({
    queryKey: cashierKeys.saleConcepts,
    queryFn: () => apiFetch<SaleConceptOption[]>('/cashier/sale-concepts'),
  });
}

/** Búsqueda de estudiantes (máx. 8). Se activa a partir de 2 caracteres. */
export function useStudentSearch(q: string) {
  const term = q.trim();
  return useQuery<StudentHit[]>({
    queryKey: cashierKeys.students(term),
    queryFn: () => apiFetch<StudentHit[]>(`/cashier/students?q=${encodeURIComponent(term)}`),
    enabled: term.length >= 2,
  });
}

/** Cuotas cobrables de un estudiante. */
export function useCollectibles(studentId: string | null) {
  return useQuery<CollectiblesResponse>({
    queryKey: cashierKeys.collectibles(studentId ?? ''),
    queryFn: () => apiFetch<CollectiblesResponse>(`/cashier/students/${studentId}/collectibles`),
    enabled: !!studentId,
  });
}

/** Recibo por id (para «Ver recibo» desde la caja del día). */
export function useReceipt(id: string | null) {
  return useQuery<Receipt>({
    queryKey: cashierKeys.receipt(id ?? ''),
    queryFn: () => apiFetch<Receipt>(`/cashier/receipts/${id}`),
    enabled: !!id,
  });
}

// ---- Mutaciones -------------------------------------------------------------

export function useOpenSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OpenSessionBody) =>
      apiFetch('/cashier/session/open', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: cashierKeys.day }),
  });
}

export function useCloseSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CloseSessionBody) =>
      apiFetch('/cashier/session/close', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: cashierKeys.day }),
  });
}

export function useCreateReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReceiptBody) =>
      apiFetch<Receipt>('/cashier/receipts', { method: 'POST', body }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: cashierKeys.day });
      void qc.invalidateQueries({ queryKey: cashierKeys.collectibles(vars.studentId) });
    },
  });
}

export function useCancelReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CancelReceiptBody }) =>
      apiFetch<Receipt>(`/cashier/receipts/${id}/cancel`, { method: 'POST', body }),
    onSuccess: () => invalidateCashierAndBilling(qc),
  });
}

// ---- Devoluciones (R2 · Etapa 3) --------------------------------------------

/** Búsqueda de recibos EMITIDO por número o estudiante (máx. 8). */
export function useReceiptSearch(q: string) {
  const term = q.trim();
  return useQuery<ReceiptHit[]>({
    queryKey: cashierKeys.receiptSearch(term),
    queryFn: () => apiFetch<ReceiptHit[]>(`/cashier/receipts/search?q=${encodeURIComponent(term)}`),
    enabled: term.length >= 2,
  });
}

/** Lista de devoluciones filtradas por estado. */
export function useRefunds(status: RefundStatusFilter, page: number, pageSize: number) {
  return useQuery<RefundsPage>({
    queryKey: cashierKeys.refunds(status, page, pageSize),
    queryFn: () => {
      const p = new URLSearchParams();
      if (status !== 'TODAS') p.set('status', status);
      p.set('page', String(page));
      p.set('pageSize', String(pageSize));
      return apiFetch<RefundsPage>(`/cashier/refunds?${p.toString()}`);
    },
    placeholderData: (prev) => prev,
  });
}

/** Registra una solicitud de devolución (Secretaría). */
export function useCreateRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRefundBody) => apiFetch<Refund>('/cashier/refunds', { method: 'POST', body }),
    onSuccess: () => invalidateCashierAndBilling(qc),
  });
}

/** Aprueba una devolución pendiente (solo Admin). */
export function useApproveRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Refund>(`/cashier/refunds/${id}/approve`, { method: 'POST' }),
    onSuccess: () => invalidateCashierAndBilling(qc),
  });
}

/** Rechaza una devolución con justificación ≥ 10 (solo Admin). */
export function useRejectRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<Refund>(`/cashier/refunds/${id}/reject`, { method: 'POST', body: { reason } }),
    onSuccess: () => invalidateCashierAndBilling(qc),
  });
}

/** Ejecuta la devolución aprobada según su forma (Caja). 409 si no hay caja abierta (efectivo). */
export function useExecuteRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ExecuteRefundBody }) =>
      apiFetch<Refund>(`/cashier/refunds/${id}/execute`, { method: 'POST', body }),
    onSuccess: () => invalidateCashierAndBilling(qc),
  });
}

// ---- Historial de cajas (R2 · Etapa 3) --------------------------------------

/** Historial paginado de cajas (cerradas y abiertas). */
export function useCashierSessions(page: number, pageSize: number) {
  return useQuery<SessionsPage>({
    queryKey: cashierKeys.sessions(page, pageSize),
    queryFn: () => apiFetch<SessionsPage>(`/cashier/sessions?page=${page}&pageSize=${pageSize}`),
    placeholderData: (prev) => prev,
  });
}

/** Detalle de una caja del historial: sesión, totales y movimientos. */
export function useCashierSession(id: string | null) {
  return useQuery<SessionDetailResponse>({
    queryKey: cashierKeys.session(id ?? ''),
    queryFn: () => apiFetch<SessionDetailResponse>(`/cashier/sessions/${id}`),
    enabled: !!id,
  });
}
