// Hooks TanStack Query de Comunicados (R4 · Etapa 4). El backend va en paralelo
// contra el mismo contrato (base /api).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  Announcement,
  AnnouncementDetail,
  AnnouncementFilters,
  AnnouncementListResponse,
  AnnouncementOptions,
  AnnouncementRecipientsResponse,
  CreateAnnouncementBody,
  UpdateAnnouncementBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const announcementKeys = {
  all: ['announcements'] as const,
  list: (filters: AnnouncementFilters) => ['announcements', 'list', filters] as const,
  options: ['announcements', 'options'] as const,
  detail: (id: string) => ['announcements', 'detail', id] as const,
  recipients: (id: string) => ['announcements', 'recipients', id] as const,
};

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: announcementKeys.all });
}

function listQuery(filters: AnnouncementFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ---- Consultas --------------------------------------------------------------
/** Listado + stats. Filtros server-side (search/status). */
export function useAnnouncements(filters: AnnouncementFilters) {
  return useQuery<AnnouncementListResponse>({
    queryKey: announcementKeys.list(filters),
    queryFn: () => apiFetch<AnnouncementListResponse>(`/announcements${listQuery(filters)}`),
    placeholderData: (prev) => prev,
  });
}

/** Niveles / grados / secciones para los selectores encadenados de alcance. */
export function useAnnouncementOptions(enabled: boolean) {
  return useQuery<AnnouncementOptions>({
    queryKey: announcementKeys.options,
    queryFn: () => apiFetch<AnnouncementOptions>('/announcements/options'),
    enabled,
    staleTime: 5 * 60_000,
  });
}

/** Detalle de un comunicado (para editar borrador o ver enviado). */
export function useAnnouncementDetail(id: string | null) {
  return useQuery<AnnouncementDetail>({
    queryKey: announcementKeys.detail(id ?? ''),
    queryFn: () => apiFetch<AnnouncementDetail>(`/announcements/${id}`),
    enabled: !!id,
  });
}

/** Familias del alcance (para el dialog de envío). */
export function useAnnouncementRecipients(id: string | null) {
  return useQuery<AnnouncementRecipientsResponse>({
    queryKey: announcementKeys.recipients(id ?? ''),
    queryFn: () => apiFetch<AnnouncementRecipientsResponse>(`/announcements/${id}/recipients`),
    enabled: !!id,
  });
}

// ---- Mutaciones -------------------------------------------------------------
/** Crea un borrador. Devuelve el item creado (BORRADOR). */
export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAnnouncementBody) =>
      apiFetch<Announcement>('/announcements', { method: 'POST', body }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Edita un borrador (409 si ya fue enviado). */
export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAnnouncementBody }) =>
      apiFetch<Announcement>(`/announcements/${id}`, { method: 'PATCH', body }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Elimina un borrador (solo borrador). */
export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/announcements/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Marca el comunicado como ENVIADO (tras el envío manual por WhatsApp). */
export function useSendAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Announcement>(`/announcements/${id}/send`, { method: 'POST' }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Duplica un comunicado como borrador nuevo (copia título, cuerpo y alcance). */
export function useDuplicateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const src = await apiFetch<AnnouncementDetail>(`/announcements/${id}`);
      const body: CreateAnnouncementBody = {
        title: `Copia de ${src.title}`,
        body: src.body,
        scope: src.scope,
        levelId: src.levelId ?? undefined,
        gradeLevelId: src.gradeLevelId ?? undefined,
        sectionId: src.sectionId ?? undefined,
      };
      return apiFetch<Announcement>('/announcements', { method: 'POST', body });
    },
    onSuccess: () => invalidateAll(qc),
  });
}
