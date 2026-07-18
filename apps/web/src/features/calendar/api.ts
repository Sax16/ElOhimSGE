// Hooks TanStack Query del Calendario académico (R4 · Etapa 4). El backend va en
// paralelo contra el mismo contrato (base /api).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type { CalendarEvent, CalendarResponse, CreateEventBody, UpdateEventBody } from './types';

// ---- Claves de caché --------------------------------------------------------
export const calendarKeys = {
  all: ['calendar'] as const,
  month: (month: string) => ['calendar', 'month', month] as const,
};

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: calendarKeys.all });
}

// ---- Consultas --------------------------------------------------------------
/** Eventos + vencimientos de pensión del mes (YYYY-MM). */
export function useCalendarMonth(month: string) {
  return useQuery<CalendarResponse>({
    queryKey: calendarKeys.month(month),
    queryFn: () => apiFetch<CalendarResponse>(`/calendar?month=${month}`),
    placeholderData: (prev) => prev,
  });
}

// ---- Mutaciones -------------------------------------------------------------
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventBody) =>
      apiFetch<CalendarEvent>('/calendar', { method: 'POST', body }),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEventBody }) =>
      apiFetch<CalendarEvent>(`/calendar/${id}`, { method: 'PATCH', body }),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/calendar/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateAll(qc),
  });
}
