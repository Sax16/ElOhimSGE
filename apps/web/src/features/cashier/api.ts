// Hooks TanStack Query para la pantalla Caja y cobros (R2 · Etapa 1).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  CancelReceiptBody,
  CashierDayResponse,
  CollectiblesResponse,
  CreateReceiptBody,
  CloseSessionBody,
  OpenSessionBody,
  Receipt,
  SaleConceptOption,
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
};

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
    onSuccess: () => void qc.invalidateQueries({ queryKey: cashierKeys.all }),
  });
}
