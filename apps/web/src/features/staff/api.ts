// Hooks TanStack Query para la pantalla Personal (R3 · Etapa 1).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  StaffCatalogs,
  StaffCreateBody,
  StaffDto,
  StaffUpdateBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const staffKeys = {
  all: ['staff'] as const,
  list: () => ['staff', 'list'] as const,
  catalogs: () => ['staff', 'catalogs'] as const,
};

function invalidateStaff(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: staffKeys.all });
}

// ---- Consultas --------------------------------------------------------------
/** Listado completo; el filtrado (búsqueda, rol, estado) es en cliente. */
export function useStaff() {
  return useQuery<StaffDto[]>({
    queryKey: staffKeys.list(),
    queryFn: () => apiFetch<StaffDto[]>('/staff'),
    placeholderData: (prev) => prev,
  });
}

export function useStaffCatalogs() {
  return useQuery<StaffCatalogs>({
    queryKey: staffKeys.catalogs(),
    queryFn: () => apiFetch<StaffCatalogs>('/staff/catalogs'),
    staleTime: 5 * 60 * 1000, // los catálogos cambian poco
  });
}

// ---- Mutaciones -------------------------------------------------------------
export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StaffCreateBody) =>
      apiFetch<StaffDto>('/staff', { method: 'POST', body }),
    onSuccess: () => invalidateStaff(qc),
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: StaffUpdateBody }) =>
      apiFetch<StaffDto>(`/staff/${id}`, { method: 'PATCH', body }),
    onSuccess: () => invalidateStaff(qc),
  });
}
