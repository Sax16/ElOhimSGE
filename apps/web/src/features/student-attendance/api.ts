// Hooks TanStack Query para Asistencia de estudiantes (R4 · Etapa 1).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { downloadFile } from '../../lib/download';
import type {
  CorrectBody,
  MonthlyResponse,
  MySectionsResponse,
  RosterEntry,
  RosterResponse,
  SaveBody,
  SaveResult,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const attKeys = {
  all: ['student-attendance'] as const,
  mySections: (date: string) => ['student-attendance', 'my-sections', date] as const,
  roster: (sectionId: string, date: string) =>
    ['student-attendance', 'roster', sectionId, date] as const,
  monthly: (sectionId: string, month: string) =>
    ['student-attendance', 'monthly', sectionId, month] as const,
};

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: attKeys.all });
}

// ---- Consultas --------------------------------------------------------------
/** Secciones del docente (o de quien consulta) para una fecha. */
export function useMySections(date: string) {
  return useQuery<MySectionsResponse>({
    queryKey: attKeys.mySections(date),
    queryFn: () => apiFetch<MySectionsResponse>(`/student-attendance/my-sections?date=${date}`),
    placeholderData: (prev) => prev,
  });
}

/** Roster de una sección en una fecha. Deshabilitado sin sección elegida. */
export function useRoster(sectionId: string | undefined, date: string) {
  return useQuery<RosterResponse>({
    queryKey: attKeys.roster(sectionId ?? '', date),
    queryFn: () =>
      apiFetch<RosterResponse>(`/student-attendance/roster?sectionId=${sectionId}&date=${date}`),
    enabled: !!sectionId,
    placeholderData: (prev) => prev,
  });
}

/** Matriz mensual de una sección. */
export function useMonthly(sectionId: string | undefined, month: string) {
  return useQuery<MonthlyResponse>({
    queryKey: attKeys.monthly(sectionId ?? '', month),
    queryFn: () =>
      apiFetch<MonthlyResponse>(`/student-attendance/monthly?sectionId=${sectionId}&month=${month}`),
    enabled: !!sectionId,
    placeholderData: (prev) => prev,
  });
}

// ---- Mutaciones -------------------------------------------------------------
/** Guarda la toma completa (PUT). Devuelve conteos y saltados por corrección. */
export function useSaveAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveBody) =>
      apiFetch<SaveResult>('/student-attendance', { method: 'PUT', body }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Corrige una entrada (PATCH, solo Admin). */
export function useCorrectEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CorrectBody }) =>
      apiFetch<RosterEntry>(`/student-attendance/${id}/correct`, { method: 'PATCH', body }),
    onSuccess: () => invalidateAll(qc),
  });
}

/** Descarga la matriz mensual (YYYY-MM) de una sección como .xlsx. */
export function exportMonthly(sectionId: string, month: string): Promise<void> {
  return downloadFile(
    `/student-attendance/monthly/export?sectionId=${sectionId}&month=${month}`,
    `asistencia-${month}.xlsx`,
  );
}
