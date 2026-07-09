// Hooks TanStack Query para la pantalla Estudiantes (Etapa 4).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, apiFetch } from '../../lib/api';
import { structureKeys } from '../structure/api';
import type {
  StudentCreateBody,
  StudentDetail,
  StudentUpdateBody,
  StudentsFilters,
  StudentsResponse,
  WithdrawBody,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const studentKeys = {
  all: ['students'] as const,
  list: (filters: StudentsFilters) => ['students', 'list', filters] as const,
  detail: (id: string) => ['students', 'detail', id] as const,
};

// Invalida todo lo que puede cambiar cuando se registra/edita/retira un estudiante.
function invalidateStudentGraph(qc: ReturnType<typeof useQueryClient>, id?: string) {
  void qc.invalidateQueries({ queryKey: studentKeys.all });
  void qc.invalidateQueries({ queryKey: ['guardians'] });
  if (id) void qc.invalidateQueries({ queryKey: studentKeys.detail(id) });
}

function toQuery(filters: StudentsFilters): string {
  const p = new URLSearchParams();
  if (filters.search.trim()) p.set('search', filters.search.trim());
  if (filters.levelId) p.set('levelId', filters.levelId);
  if (filters.gradeLevelId) p.set('gradeLevelId', filters.gradeLevelId);
  if (filters.sectionId) p.set('sectionId', filters.sectionId);
  if (filters.status) p.set('status', filters.status);
  p.set('page', String(filters.page));
  p.set('pageSize', String(filters.pageSize));
  return p.toString();
}

// ---- Consultas --------------------------------------------------------------
export function useStudents(filters: StudentsFilters) {
  return useQuery<StudentsResponse>({
    queryKey: studentKeys.list(filters),
    queryFn: () => apiFetch<StudentsResponse>(`/students?${toQuery(filters)}`),
    placeholderData: (prev) => prev, // mantiene la tabla mientras cambian filtros/página
  });
}

export function useStudent(id: string | undefined) {
  return useQuery<StudentDetail>({
    queryKey: studentKeys.detail(id ?? ''),
    queryFn: () => apiFetch<StudentDetail>(`/students/${id}`),
    enabled: !!id,
  });
}

// ---- Mutaciones -------------------------------------------------------------
export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StudentCreateBody) =>
      apiFetch<StudentDetail>('/students', { method: 'POST', body }),
    onSuccess: (created) => invalidateStudentGraph(qc, created.id),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: StudentUpdateBody }) =>
      apiFetch<StudentDetail>(`/students/${id}`, { method: 'PATCH', body }),
    onSuccess: (_data, { id }) => invalidateStudentGraph(qc, id),
  });
}

/** Subida de foto — multipart, no pasa por apiFetch (que serializa a JSON). */
export function useUploadStudentPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/students/${id}/photo`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const data = (await res.json()) as { message?: string | string[] };
          if (Array.isArray(data.message)) message = data.message.join(' ');
          else if (data.message) message = data.message;
        } catch {
          // sin cuerpo JSON
        }
        throw new ApiError(res.status, message);
      }
      return (await res.json()) as { photoUrl: string };
    },
    onSuccess: (_data, { id }) => invalidateStudentGraph(qc, id),
  });
}

export function useWithdrawStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: WithdrawBody }) =>
      apiFetch<void>(`/students/${id}/withdraw`, { method: 'POST', body }),
    onSuccess: (_data, { id }) => {
      invalidateStudentGraph(qc, id);
      // El retiro libera vacante: refresca el árbol de estructura (matriculados por sección).
      void qc.invalidateQueries({ queryKey: structureKeys.years });
      void qc.invalidateQueries({ queryKey: ['levels-tree'] });
    },
  });
}

// ---- Vínculo con apoderados -------------------------------------------------
export function useLinkGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      guardianId,
      relation,
      isPrimary,
    }: {
      studentId: string;
      guardianId: string;
      relation: string;
      isPrimary: boolean;
    }) =>
      apiFetch<void>(`/students/${studentId}/guardians/${guardianId}`, {
        method: 'PUT',
        body: { relation, isPrimary },
      }),
    onSuccess: (_data, { studentId }) => invalidateStudentGraph(qc, studentId),
  });
}

export function useUnlinkGuardian() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, guardianId }: { studentId: string; guardianId: string }) =>
      apiFetch<void>(`/students/${studentId}/guardians/${guardianId}/unlink`, { method: 'POST' }),
    onSuccess: (_data, { studentId }) => invalidateStudentGraph(qc, studentId),
  });
}
