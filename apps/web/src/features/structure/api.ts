// Hooks TanStack Query para la pantalla Estructura académica (Etapa 3).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import type {
  ApiCourse,
  ApiLevel,
  ApiPeriod,
  ApiProgram,
  ApiProgramEnrollment,
  ApiRosterRow,
  ApiTeacher,
  ApiYear,
  CopyCoursesResult,
  CourseCreateBody,
  CourseUpdateBody,
  CoursesCopyBody,
  GradeCreateBody,
  GradeUpdateBody,
  LevelCreateBody,
  LevelUpdateBody,
  PeriodUpdateBody,
  ProgramCreateBody,
  ProgramEnrollPreview,
  ProgramUpdateBody,
  SectionCreateBody,
  SectionUpdateBody,
  StartNextYearBody,
  StartNextYearResult,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const structureKeys = {
  years: ['academic-years'] as const, // compartida con el selector del shell
  levels: (yearId: string) => ['levels-tree', yearId] as const,
  teachers: ['teachers'] as const,
  periods: (yearId: string) => ['periods', yearId] as const,
  courses: (gradeLevelId: string) => ['courses', gradeLevelId] as const,
  programs: (yearId: string) => ['programs', yearId] as const,
  roster: (sectionId: string) => ['roster', sectionId] as const,
  programRoster: (programId: string) => ['program-roster', programId] as const,
};

// ---- Consultas --------------------------------------------------------------
export function useYears() {
  return useQuery<ApiYear[]>({
    queryKey: structureKeys.years,
    queryFn: () => apiFetch<ApiYear[]>('/academic-years'),
  });
}

export function useLevelsTree(yearId: string | undefined) {
  return useQuery<ApiLevel[]>({
    queryKey: structureKeys.levels(yearId ?? ''),
    queryFn: () => apiFetch<ApiLevel[]>(`/academic-years/${yearId}/levels`),
    enabled: !!yearId,
  });
}

export function useTeachers() {
  return useQuery<ApiTeacher[]>({
    queryKey: structureKeys.teachers,
    queryFn: () => apiFetch<ApiTeacher[]>('/teachers'),
  });
}

export function usePeriods(yearId: string | undefined) {
  return useQuery<ApiPeriod[]>({
    queryKey: structureKeys.periods(yearId ?? ''),
    queryFn: () => apiFetch<ApiPeriod[]>(`/academic-years/${yearId}/periods`),
    enabled: !!yearId,
  });
}

export function useCourses(gradeLevelId: string | undefined) {
  return useQuery<ApiCourse[]>({
    queryKey: structureKeys.courses(gradeLevelId ?? ''),
    queryFn: () => apiFetch<ApiCourse[]>(`/grade-levels/${gradeLevelId}/courses`),
    enabled: !!gradeLevelId,
  });
}

export function usePrograms(yearId: string | undefined) {
  return useQuery<ApiProgram[]>({
    queryKey: structureKeys.programs(yearId ?? ''),
    queryFn: () => apiFetch<ApiProgram[]>(`/programs?yearId=${yearId}`),
    enabled: !!yearId,
  });
}

export function useRoster(sectionId: string | undefined) {
  return useQuery<ApiRosterRow[]>({
    queryKey: structureKeys.roster(sectionId ?? ''),
    queryFn: () => apiFetch<ApiRosterRow[]>(`/sections/${sectionId}/roster`),
    enabled: !!sectionId,
  });
}

// ---- Mutaciones -------------------------------------------------------------
// Todas reciben el yearId activo para invalidar el árbol correcto.

export function useCreateLevel(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LevelCreateBody) => apiFetch<ApiLevel>('/levels', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useUpdateLevel(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: LevelUpdateBody }) =>
      apiFetch<ApiLevel>(`/levels/${id}`, { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useDeleteLevel(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/levels/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useCreateGrade(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GradeCreateBody) => apiFetch('/grade-levels', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useUpdateGrade(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: GradeUpdateBody }) =>
      apiFetch(`/grade-levels/${id}`, { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useDeleteGrade(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/grade-levels/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useCreateSection(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SectionCreateBody) => apiFetch('/sections', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useUpdateSection(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SectionUpdateBody }) =>
      apiFetch(`/sections/${id}`, { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useDeleteSection(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/sections/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) }),
  });
}

export function useCreateCourse(gradeLevelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CourseCreateBody) => apiFetch<ApiCourse>('/courses', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.courses(gradeLevelId) }),
  });
}

export function useUpdateCourse(gradeLevelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CourseUpdateBody }) =>
      apiFetch<ApiCourse>(`/courses/${id}`, { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.courses(gradeLevelId) }),
  });
}

export function useDeleteCourse(gradeLevelId: string, yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/courses/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: structureKeys.courses(gradeLevelId) });
      // coursesCount vive en el árbol: refréscalo para que el grado vuelva a ser eliminable.
      void qc.invalidateQueries({ queryKey: structureKeys.levels(yearId) });
    },
  });
}

export function useCopyCourses(targetGradeLevelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CoursesCopyBody) =>
      apiFetch<CopyCoursesResult>('/courses/copy', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.courses(targetGradeLevelId) }),
  });
}

export function useCreateProgram(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProgramCreateBody) => apiFetch<ApiProgram>('/programs', { method: 'POST', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.programs(yearId) }),
  });
}

export function useUpdateProgram(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProgramUpdateBody }) =>
      apiFetch<ApiProgram>(`/programs/${id}`, { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.programs(yearId) }),
  });
}

export function useDeleteProgram(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/programs/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.programs(yearId) }),
  });
}

// ---- Inscripciones a programas ---------------------------------------------

/** Roster real de un programa — GET /api/programs/:id/enrollments. */
export function useProgramRoster(programId: string | undefined) {
  return useQuery<ApiProgramEnrollment[]>({
    queryKey: structureKeys.programRoster(programId ?? ''),
    queryFn: () => apiFetch<ApiProgramEnrollment[]>(`/programs/${programId}/enrollments`),
    enabled: !!programId,
  });
}

/** Preview de cuotas al inscribir a un estudiante (no persiste). */
export function useProgramEnrollPreview(programId: string) {
  return useMutation({
    mutationFn: (studentId: string) =>
      apiFetch<ProgramEnrollPreview>(`/programs/${programId}/enrollments/preview`, {
        method: 'POST',
        body: { studentId },
      }),
  });
}

/** Invalida lo que cambia al inscribir/anular en un programa. */
function invalidateProgramGraph(
  qc: ReturnType<typeof useQueryClient>,
  programId: string,
  yearId: string,
) {
  void qc.invalidateQueries({ queryKey: structureKeys.programs(yearId) });
  void qc.invalidateQueries({ queryKey: structureKeys.programRoster(programId) });
  void qc.invalidateQueries({ queryKey: ['students'] });
  void qc.invalidateQueries({ queryKey: ['guardians'] });
  void qc.invalidateQueries({ queryKey: ['fees'] });
  void qc.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useEnrollInProgram(programId: string, yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: string) =>
      apiFetch<{ id: string }>(`/programs/${programId}/enrollments`, {
        method: 'POST',
        body: { studentId },
      }),
    onSuccess: () => invalidateProgramGraph(qc, programId, yearId),
  });
}

export function useCancelProgramEnrollment(programId: string, yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiFetch<void>(`/program-enrollments/${id}/cancel`, { method: 'POST', body: { reason } }),
    onSuccess: () => invalidateProgramGraph(qc, programId, yearId),
  });
}

export function useUpdatePeriod(yearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PeriodUpdateBody }) =>
      apiFetch<ApiPeriod>(`/periods/${id}`, { method: 'PATCH', body }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.periods(yearId) }),
  });
}

export function useDeleteYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/academic-years/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.years }),
  });
}

export function useStartNextYear(currentYearId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: StartNextYearBody) =>
      apiFetch<StartNextYearResult>(`/academic-years/${currentYearId}/start-next`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: structureKeys.years }),
  });
}
