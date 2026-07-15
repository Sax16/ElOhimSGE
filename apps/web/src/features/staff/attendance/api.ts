// Hooks TanStack Query para Marcación y asistencia (R3 · Etapa 2).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api';
import { downloadFile } from '../../../lib/download';
import type {
  AttendanceDay,
  AttendanceRow,
  AttendanceRules,
  CheckBody,
  CorrectBody,
  SaveRulesBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const attendanceKeys = {
  all: ['attendance'] as const,
  day: (date: string) => ['attendance', 'day', date] as const,
  rules: () => ['attendance', 'rules'] as const,
};

function invalidateAttendance(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: attendanceKeys.all });
}

// ---- Consultas --------------------------------------------------------------
/** Jornada de un día. `refetchIntervalMs` refresca en vivo (vista Portería). */
export function useAttendanceDay(date: string, refetchIntervalMs?: number) {
  return useQuery<AttendanceDay>({
    queryKey: attendanceKeys.day(date),
    queryFn: () => apiFetch<AttendanceDay>(`/attendance/day?date=${date}`),
    placeholderData: (prev) => prev,
    refetchInterval: refetchIntervalMs ?? false,
  });
}

export function useAttendanceRules(enabled = true) {
  return useQuery<AttendanceRules>({
    queryKey: attendanceKeys.rules(),
    queryFn: () => apiFetch<AttendanceRules>('/attendance/rules'),
    staleTime: 5 * 60 * 1000, // las reglas cambian poco
    enabled,
  });
}

// ---- Mutaciones -------------------------------------------------------------
export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckBody) =>
      apiFetch<AttendanceRow>('/attendance/check-in', { method: 'POST', body }),
    onSuccess: () => invalidateAttendance(qc),
  });
}

export function useCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckBody) =>
      apiFetch<AttendanceRow>('/attendance/check-out', { method: 'POST', body }),
    onSuccess: () => invalidateAttendance(qc),
  });
}

export function useCorrectAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CorrectBody) =>
      apiFetch<AttendanceRow>('/attendance/correct', { method: 'PATCH', body }),
    onSuccess: () => invalidateAttendance(qc),
  });
}

export function useSaveRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveRulesBody) =>
      apiFetch<AttendanceRules>('/attendance/rules', { method: 'PUT', body }),
    onSuccess: () => invalidateAttendance(qc),
  });
}

/** Descarga la asistencia del mes (YYYY-MM) como .xlsx. */
export function exportAttendance(month: string): Promise<void> {
  return downloadFile(`/attendance/export?month=${month}`, `asistencia-${month}.xlsx`);
}
