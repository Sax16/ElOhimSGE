// Hooks TanStack Query para Conducta e incidencias (R4 · Etapa 3). El backend va
// en paralelo contra el mismo contrato (base /api).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  CancelIncidentBody,
  ConductFilters,
  ConductListResponse,
  ConductStudentsResponse,
  CreateIncidentBody,
  Incident,
  IncidentDetail,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const conductKeys = {
  all: ['conduct'] as const,
  list: (filters: ConductFilters) => ['conduct', 'list', filters] as const,
  detail: (id: string) => ['conduct', 'detail', id] as const,
  students: (search: string) => ['conduct', 'students', search] as const,
};

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: conductKeys.all });
}

function listQuery(filters: ConductFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ---- Consultas --------------------------------------------------------------
/** Listado + stats. Filtros server-side (search/severity/status). */
export function useConductList(filters: ConductFilters) {
  return useQuery<ConductListResponse>({
    queryKey: conductKeys.list(filters),
    queryFn: () => apiFetch<ConductListResponse>(`/conduct${listQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

/** Detalle de una incidencia (para el dialog). */
export function useIncidentDetail(id: string | null) {
  return useQuery<IncidentDetail>({
    queryKey: conductKeys.detail(id ?? ''),
    queryFn: () => apiFetch<IncidentDetail>(`/conduct/${id}`),
    enabled: !!id,
  });
}

/**
 * Buscador de estudiantes del dialog. Solo dispara con ≥ 2 caracteres; con
 * menos, no consulta y devuelve lista vacía.
 */
export function useConductStudents(search: string) {
  const term = search.trim();
  const enabled = term.length >= 2;
  return useQuery<ConductStudentsResponse>({
    queryKey: conductKeys.students(term),
    queryFn: () =>
      apiFetch<ConductStudentsResponse>(`/conduct/students?search=${encodeURIComponent(term)}`),
    enabled,
    placeholderData: (prev) => prev,
  });
}

// ---- Mutaciones -------------------------------------------------------------
/** Crea una incidencia. Devuelve el item creado. */
export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateIncidentBody) =>
      apiFetch<Incident>('/conduct', { method: 'POST', body }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Marca el aviso hecho (se llama DESPUÉS de abrir wa.me). */
export function useMarkNotified() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Incident>(`/conduct/${id}/notified`, { method: 'POST' }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Cierra la incidencia (queda en el historial). */
export function useCloseIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Incident>(`/conduct/${id}/close`, { method: 'POST' }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Anula la incidencia con motivo ≥ 10 (solo Admin; 403 para otros). */
export function useCancelIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CancelIncidentBody }) =>
      apiFetch<Incident>(`/conduct/${id}/cancel`, { method: 'POST', body }),
    onSuccess: () => invalidateAll(qc),
  });
}
