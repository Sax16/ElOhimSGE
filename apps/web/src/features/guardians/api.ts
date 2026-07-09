// Hooks TanStack Query para la pantalla Apoderados (Etapa 4).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  GuardianAccountFilter,
  GuardianCreateBody,
  GuardianDetail,
  GuardianListItem,
  GuardianUpdateBody,
  GuardiansResponse,
} from './types';

export interface GuardiansFilters {
  search: string;
  account: GuardianAccountFilter;
  page: number;
  pageSize: number;
}

// ---- Claves de caché --------------------------------------------------------
export const guardianKeys = {
  all: ['guardians'] as const,
  list: (filters: GuardiansFilters) => ['guardians', 'list', filters] as const,
  detail: (id: string) => ['guardians', 'detail', id] as const,
};

function invalidateGuardianGraph(qc: ReturnType<typeof useQueryClient>, id?: string) {
  void qc.invalidateQueries({ queryKey: guardianKeys.all });
  // Un apoderado aparece como "apoderado principal" en el listado de estudiantes.
  void qc.invalidateQueries({ queryKey: ['students'] });
  if (id) void qc.invalidateQueries({ queryKey: guardianKeys.detail(id) });
}

function toQuery(filters: GuardiansFilters): string {
  const p = new URLSearchParams();
  if (filters.search.trim()) p.set('search', filters.search.trim());
  if (filters.account !== 'todas') p.set('account', filters.account);
  p.set('page', String(filters.page));
  p.set('pageSize', String(filters.pageSize));
  return p.toString();
}

// ---- Consultas --------------------------------------------------------------
export function useGuardians(filters: GuardiansFilters) {
  return useQuery<GuardiansResponse>({
    queryKey: guardianKeys.list(filters),
    queryFn: () => apiFetch<GuardiansResponse>(`/guardians?${toQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

export function useGuardian(id: string | undefined) {
  return useQuery<GuardianDetail>({
    queryKey: guardianKeys.detail(id ?? ''),
    queryFn: () => apiFetch<GuardianDetail>(`/guardians/${id}`),
    enabled: !!id,
  });
}

/** Búsqueda puntual para vincular apoderados desde la ficha del estudiante. */
export function useGuardianSearch(term: string) {
  const search = term.trim();
  return useQuery<GuardiansResponse>({
    queryKey: ['guardians', 'search', search],
    queryFn: () =>
      apiFetch<GuardiansResponse>(
        `/guardians?search=${encodeURIComponent(search)}&page=1&pageSize=10`,
      ),
    enabled: search.length >= 2,
  });
}

// ---- Mutaciones -------------------------------------------------------------
export function useCreateGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GuardianCreateBody) =>
      apiFetch<GuardianListItem>('/guardians', { method: 'POST', body }),
    onSuccess: (created) => invalidateGuardianGraph(qc, created.id),
  });
}

export function useUpdateGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: GuardianUpdateBody }) =>
      apiFetch<GuardianListItem>(`/guardians/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { id }) => invalidateGuardianGraph(qc, id),
  });
}
