// Hooks TanStack Query para la pantalla Pensiones (R2 · Etapa 2).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { cashierKeys } from '../cashier/api';
import type {
  InstallmentsPage,
  InstallmentsQuery,
  InstallmentRow,
  LateFeeRunResult,
  PensionStats,
  ReminderPreview,
  ReminderResult,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const paymentsKeys = {
  all: ['payments'] as const,
  installments: (q: InstallmentsQuery) => ['payments', 'installments', q] as const,
  stats: (yearId: string | undefined, month: number | null) =>
    ['payments', 'stats', yearId ?? '', month] as const,
  reminderPreview: (guardianId: string) => ['payments', 'reminder-preview', guardianId] as const,
};

/** Invalida todo lo que depende de cuotas: lista/stats de Pensiones y cobrables de Caja. */
function invalidateBilling(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: paymentsKeys.all });
  void qc.invalidateQueries({ queryKey: cashierKeys.all });
}

function installmentsQueryString(q: InstallmentsQuery): string {
  const p = new URLSearchParams();
  if (q.yearId) p.set('yearId', q.yearId);
  if (q.month != null) p.set('month', String(q.month));
  p.set('type', q.type);
  p.set('status', q.status);
  const term = q.q.trim();
  if (term) p.set('q', term);
  p.set('page', String(q.page));
  p.set('pageSize', String(q.pageSize));
  return p.toString();
}

// ---- Consultas --------------------------------------------------------------

/** Lista paginada de cuotas según filtros. Mantiene la tabla al cambiar filtros/página. */
export function useInstallments(query: InstallmentsQuery) {
  return useQuery<InstallmentsPage>({
    queryKey: paymentsKeys.installments(query),
    queryFn: () => apiFetch<InstallmentsPage>(`/billing/installments?${installmentsQueryString(query)}`),
    enabled: !!query.yearId,
    placeholderData: (prev) => prev,
  });
}

/** Totales del mes (cobrado/por cobrar) y del año (vencido/morosidad). */
export function usePensionStats(yearId: string | undefined, month: number | null) {
  return useQuery<PensionStats>({
    queryKey: paymentsKeys.stats(yearId, month),
    queryFn: () => {
      const p = new URLSearchParams();
      if (yearId) p.set('yearId', yearId);
      if (month != null) p.set('month', String(month));
      return apiFetch<PensionStats>(`/billing/installments/stats?${p.toString()}`);
    },
    enabled: !!yearId,
  });
}

/** Vista previa del recordatorio de un apoderado. 409 si no tiene teléfono o deuda. */
export function useReminderPreview(guardianId: string | null) {
  return useQuery<ReminderPreview>({
    queryKey: paymentsKeys.reminderPreview(guardianId ?? ''),
    queryFn: () =>
      apiFetch<ReminderPreview>(`/billing/reminders/preview?guardianId=${encodeURIComponent(guardianId!)}`),
    enabled: !!guardianId,
    retry: false,
  });
}

// ---- Mutaciones -------------------------------------------------------------

/** Exonera la mora de una cuota (solo Admin). Motivo ≥ 10 caracteres. */
export function useExonerateLateFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<InstallmentRow>(`/billing/installments/${id}/exonerate-late-fee`, {
        method: 'POST',
        body: { reason },
      }),
    onSuccess: () => invalidateBilling(qc),
  });
}

/** Registra el recordatorio enviado por WhatsApp a un apoderado. */
export function useSendReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guardianId: string) =>
      apiFetch<ReminderResult>('/billing/reminders', { method: 'POST', body: { guardianId } }),
    onSuccess: () => invalidateBilling(qc),
  });
}

/** Corre la mora del día: materializa VENCIDO y carga la mora fija (solo Admin). */
export function useRunLateFees() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<LateFeeRunResult>('/billing/late-fees/run', { method: 'POST' }),
    onSuccess: () => invalidateBilling(qc),
  });
}
