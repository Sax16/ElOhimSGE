// Hooks TanStack Query para la pantalla Matrícula (Etapa 5).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { structureKeys } from '../structure/api';
import { studentKeys } from '../students/api';
import type {
  CreateEnrollmentResult,
  EnrollmentDetail,
  EnrollmentStats,
  EnrollmentWizardBody,
  EnrollmentsFilters,
  EnrollmentsResponse,
  PreviewResponse,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const enrollmentKeys = {
  all: ['enrollments'] as const,
  list: (filters: EnrollmentsFilters) => ['enrollments', 'list', filters] as const,
  stats: (yearId: string) => ['enrollments', 'stats', yearId] as const,
  detail: (id: string) => ['enrollments', 'detail', id] as const,
};

function toQuery(filters: EnrollmentsFilters): string {
  const p = new URLSearchParams();
  if (filters.yearId) p.set('yearId', filters.yearId);
  if (filters.search.trim()) p.set('search', filters.search.trim());
  if (filters.status) p.set('status', filters.status);
  if (filters.type) p.set('type', filters.type);
  p.set('page', String(filters.page));
  p.set('pageSize', String(filters.pageSize));
  return p.toString();
}

// ---- Consultas --------------------------------------------------------------
export function useEnrollments(filters: EnrollmentsFilters) {
  return useQuery<EnrollmentsResponse>({
    queryKey: enrollmentKeys.list(filters),
    queryFn: () => apiFetch<EnrollmentsResponse>(`/enrollments?${toQuery(filters)}`),
    enabled: !!filters.yearId,
    placeholderData: (prev) => prev,
  });
}

export function useEnrollmentStats(yearId: string | undefined) {
  return useQuery<EnrollmentStats>({
    queryKey: enrollmentKeys.stats(yearId ?? ''),
    queryFn: () => apiFetch<EnrollmentStats>(`/enrollments/stats?yearId=${yearId}`),
    enabled: !!yearId,
  });
}

export function useEnrollment(id: string | undefined) {
  return useQuery<EnrollmentDetail>({
    queryKey: enrollmentKeys.detail(id ?? ''),
    queryFn: () => apiFetch<EnrollmentDetail>(`/enrollments/${id}`),
    enabled: !!id,
  });
}

// ---- Mutaciones -------------------------------------------------------------

/** Calcula el cronograma sin persistir (paso «Tarifa y cronograma»). */
export function usePreview() {
  return useMutation({
    mutationFn: (body: EnrollmentWizardBody) =>
      apiFetch<PreviewResponse>('/enrollment/preview', { method: 'POST', body }),
  });
}

/** Invalida todo lo que cambia al matricular: listado, KPIs, estudiantes,
 *  árbol de estructura (ocupación de secciones), apoderados y dashboard. */
function invalidateEnrollmentGraph(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: enrollmentKeys.all });
  void qc.invalidateQueries({ queryKey: studentKeys.all });
  void qc.invalidateQueries({ queryKey: ['levels-tree'] });
  void qc.invalidateQueries({ queryKey: structureKeys.years });
  void qc.invalidateQueries({ queryKey: ['guardians'] });
  void qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useCreateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EnrollmentWizardBody) =>
      apiFetch<CreateEnrollmentResult>('/enrollments', { method: 'POST', body }),
    onSuccess: () => invalidateEnrollmentGraph(qc),
  });
}

export function useCancelEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<void>(`/enrollments/${id}/cancel`, { method: 'POST', body: { reason } }),
    onSuccess: (_data, { id }) => {
      invalidateEnrollmentGraph(qc);
      void qc.invalidateQueries({ queryKey: enrollmentKeys.detail(id) });
    },
  });
}
