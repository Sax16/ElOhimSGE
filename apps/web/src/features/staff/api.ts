// Hooks TanStack Query para la pantalla Personal (R3 · Etapa 1).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  StaffAccess,
  StaffAccessCredential,
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
  access: (id: string) => ['staff', 'access', id] as const,
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

// ---- Acceso al sistema (portal docente) ------------------------------------
/** Estado del acceso del docente. Solo tiene sentido en cargos docentes;
 *  actívalo por rol para no golpear el 422 del backend. */
export function useStaffAccess(id: string | undefined, enabled = true) {
  return useQuery<StaffAccess>({
    queryKey: staffKeys.access(id ?? ''),
    queryFn: () => apiFetch<StaffAccess>(`/staff/${id}/access`),
    enabled: !!id && enabled,
    retry: false,
  });
}

/** Genera o REGENERA la clave del portal docente — credencial una sola vez.
 *  En generación se puede enviar un username editado; en regeneración se ignora. */
export function useGenerateStaffAccess(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username?: string) =>
      apiFetch<StaffAccessCredential>(`/staff/${id}/access`, {
        method: 'POST',
        body: username ? { username } : {},
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: staffKeys.access(id) });
      invalidateStaff(qc);
    },
  });
}
