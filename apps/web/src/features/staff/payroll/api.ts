// Hooks TanStack Query para la pestaña Planilla (R3 · Etapa 3).
// Tras pagar / anular pago se invalida también Tesorería (el pago crea/anula un
// gasto con origen "Planilla"). Se usa la clave cruda ['treasury'] para no acoplar
// features (equivale a treasuryKeys.all).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { downloadFile } from '../../../lib/download';
import type {
  AddItemBody,
  CancelItemBody,
  CancelPaymentBody,
  PayAllBody,
  PayEntryBody,
  PayrollResponseDto,
  UpdateGrossBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const payrollKeys = {
  all: ['payroll'] as const,
  period: (year: number, month: number) => ['payroll', 'period', year, month] as const,
};

function invalidatePayroll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: payrollKeys.all });
}

/** Invalida planilla + tesorería (el pago genera/anula el gasto "Planilla"). */
function invalidatePayrollAndTreasury(qc: ReturnType<typeof useQueryClient>) {
  invalidatePayroll(qc);
  void qc.invalidateQueries({ queryKey: ['treasury'] });
}

// ---- Consultas --------------------------------------------------------------
/** Planilla del periodo (se autogenera en el back al abrirla por primera vez). */
export function usePayroll(year: number, month: number) {
  return useQuery<PayrollResponseDto>({
    queryKey: payrollKeys.period(year, month),
    queryFn: () => apiFetch<PayrollResponseDto>(`/payroll?year=${year}&month=${month}`),
    placeholderData: (prev) => prev,
  });
}

// ---- Mutaciones -------------------------------------------------------------
/** "Actualizar": re-sincroniza las filas pendientes (sueldos, empleados nuevos, tardanzas). */
export function useRefreshPayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) =>
      apiFetch<PayrollResponseDto>(`/payroll/${periodId}/refresh`, { method: 'POST' }),
    onSuccess: () => invalidatePayroll(qc),
  });
}

export function useUpdateGross() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateGrossBody }) =>
      apiFetch<PayrollResponseDto>(`/payroll/entries/${id}/gross`, { method: 'PATCH', body }),
    onSuccess: () => invalidatePayroll(qc),
  });
}

export function useAddItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddItemBody }) =>
      apiFetch<PayrollResponseDto>(`/payroll/entries/${id}/items`, { method: 'POST', body }),
    onSuccess: () => invalidatePayroll(qc),
  });
}

export function useCancelItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CancelItemBody }) =>
      apiFetch<PayrollResponseDto>(`/payroll/items/${id}/cancel`, { method: 'POST', body }),
    onSuccess: () => invalidatePayroll(qc),
  });
}

export function usePayEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PayEntryBody }) =>
      apiFetch<PayrollResponseDto>(`/payroll/entries/${id}/pay`, { method: 'POST', body }),
    onSuccess: () => invalidatePayrollAndTreasury(qc),
  });
}

export function usePayAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ periodId, body }: { periodId: string; body: PayAllBody }) =>
      apiFetch<PayrollResponseDto>(`/payroll/${periodId}/pay-all`, { method: 'POST', body }),
    onSuccess: () => invalidatePayrollAndTreasury(qc),
  });
}

export function useCancelPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CancelPaymentBody }) =>
      apiFetch<PayrollResponseDto>(`/payroll/entries/${id}/cancel-payment`, { method: 'POST', body }),
    onSuccess: () => invalidatePayrollAndTreasury(qc),
  });
}

/** Descarga la planilla del periodo como .xlsx. */
export function exportPayroll(year: number, month: number): Promise<void> {
  return downloadFile(
    `/payroll/export?year=${year}&month=${month}`,
    `planilla-${year}-${String(month).padStart(2, '0')}.xlsx`,
  );
}
