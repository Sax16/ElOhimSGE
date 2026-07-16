// Hooks TanStack Query para Asignación docente (R4 · Etapa 1).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  AssignmentOptions,
  AssignmentsResponse,
  CourseAssignment,
  CreateAssignmentBody,
  UpdateAssignmentBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const assignmentKeys = {
  all: ['course-assignments'] as const,
  list: (yearId: string) => ['course-assignments', 'list', yearId] as const,
  options: (yearId: string) => ['course-assignments', 'options', yearId] as const,
};

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: assignmentKeys.all });
}

// ---- Consultas --------------------------------------------------------------
export function useAssignments(yearId: string | undefined) {
  return useQuery<AssignmentsResponse>({
    queryKey: assignmentKeys.list(yearId ?? ''),
    queryFn: () => apiFetch<AssignmentsResponse>(`/course-assignments?yearId=${yearId}`),
    enabled: !!yearId,
  });
}

export function useAssignmentOptions(yearId: string | undefined, enabled = true) {
  return useQuery<AssignmentOptions>({
    queryKey: assignmentKeys.options(yearId ?? ''),
    queryFn: () => apiFetch<AssignmentOptions>(`/course-assignments/options?yearId=${yearId}`),
    enabled: !!yearId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Mutaciones -------------------------------------------------------------
export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAssignmentBody) =>
      apiFetch<CourseAssignment>('/course-assignments', { method: 'POST', body }),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAssignmentBody }) =>
      apiFetch<CourseAssignment>(`/course-assignments/${id}`, { method: 'PATCH', body }),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/course-assignments/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidate(qc),
  });
}
