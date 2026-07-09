// Hooks TanStack Query para la pantalla Tarifario y becas (Etapa 5).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  BillingSettingsBody,
  DiscountBody,
  FeesResponse,
  LevelFeeBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const feeKeys = {
  all: ['fees'] as const,
  list: (yearId: string) => ['fees', yearId] as const,
};

// ---- Consultas --------------------------------------------------------------
export function useFees(yearId: string | undefined) {
  return useQuery<FeesResponse>({
    queryKey: feeKeys.list(yearId ?? ''),
    queryFn: () => apiFetch<FeesResponse>(`/fees?yearId=${yearId}`),
    enabled: !!yearId,
  });
}

// ---- Mutaciones -------------------------------------------------------------
// Todas invalidan el tarifario completo (una sola query por año).

export function useUpdateLevelFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ levelId, body }: { levelId: string; body: LevelFeeBody }) =>
      apiFetch(`/fees/levels/${levelId}`, { method: 'PUT', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: feeKeys.all }),
  });
}

export function useUpdateBillingSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: BillingSettingsBody) =>
      apiFetch('/billing-settings', { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: feeKeys.all }),
  });
}

export function useCreateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: DiscountBody) => apiFetch('/discounts', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: feeKeys.all }),
  });
}

export function useUpdateDiscount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DiscountBody> }) =>
      apiFetch(`/discounts/${id}`, { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: feeKeys.all }),
  });
}
