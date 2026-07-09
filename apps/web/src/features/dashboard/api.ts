// Hook del Dashboard mínimo R1.
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { DashboardSummary } from './types';

export const dashboardKeys = {
  summary: (yearId: string) => ['dashboard', 'summary', yearId] as const,
};

export function useDashboardSummary(yearId: string | undefined) {
  return useQuery<DashboardSummary>({
    queryKey: dashboardKeys.summary(yearId ?? ''),
    queryFn: () => apiFetch<DashboardSummary>(`/dashboard/summary${yearId ? `?yearId=${yearId}` : ''}`),
    enabled: !!yearId,
  });
}
