// Hooks TanStack Query para la Grilla de horarios (post-R4). El backend va en
// paralelo contra el mismo contrato (base /api).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { Shift } from '../student-attendance/types';
import type {
  BlocksResponse,
  CopyScheduleBody,
  CopyScheduleResult,
  MyWeekResponse,
  SaveBlocksBody,
  SaveSlotBody,
  SaveSlotResult,
  ScheduleResponse,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const scheduleKeys = {
  all: ['schedule'] as const,
  section: (sectionId: string) => ['schedule', 'section', sectionId] as const,
  blocks: (levelId: string, shift: string) => ['schedule', 'blocks', levelId, shift] as const,
  myWeek: ['schedule', 'my-week'] as const,
};

// ---- Horario por sección ----------------------------------------------------
export function useSchedule(sectionId: string | undefined) {
  return useQuery<ScheduleResponse>({
    queryKey: scheduleKeys.section(sectionId ?? ''),
    queryFn: () => apiFetch<ScheduleResponse>(`/schedule?sectionId=${sectionId}`),
    enabled: !!sectionId,
    placeholderData: (prev) => prev,
  });
}

export function useSaveSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveSlotBody) =>
      apiFetch<SaveSlotResult>('/schedule/slot', { method: 'PUT', body }),
    onSuccess: (_res, body) => {
      void qc.invalidateQueries({ queryKey: scheduleKeys.section(body.sectionId) });
    },
  });
}

export function useCopySchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CopyScheduleBody) =>
      apiFetch<CopyScheduleResult>('/schedule/copy', { method: 'POST', body }),
    onSuccess: (_res, body) => {
      void qc.invalidateQueries({ queryKey: scheduleKeys.section(body.toSectionId) });
    },
  });
}

// ---- Bloques (Configuración de la grilla) ----------------------------------
export function useBlocks(levelId: string | undefined, shift: Shift | undefined) {
  return useQuery<BlocksResponse>({
    queryKey: scheduleKeys.blocks(levelId ?? '', shift ?? ''),
    queryFn: () => apiFetch<BlocksResponse>(`/schedule/blocks?levelId=${levelId}&shift=${shift}`),
    enabled: !!levelId && !!shift,
    placeholderData: (prev) => prev,
  });
}

export function useSaveBlocks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveBlocksBody) =>
      apiFetch<BlocksResponse>('/schedule/blocks', { method: 'PUT', body }),
    onSuccess: (_res, body) => {
      void qc.invalidateQueries({ queryKey: scheduleKeys.blocks(body.levelId, body.shift) });
      // Un cambio de bloques redibuja la grilla de todas las secciones del nivel+turno.
      void qc.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}

// ---- Mi horario (portal docente) -------------------------------------------
export function useMyWeek() {
  return useQuery<MyWeekResponse>({
    queryKey: scheduleKeys.myWeek,
    queryFn: () => apiFetch<MyWeekResponse>('/schedule/my-week'),
  });
}
