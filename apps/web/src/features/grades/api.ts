// Hooks TanStack Query para Notas por competencias, libreta y Configuración →
// Evaluación (R4 · Etapa 2). El backend va en paralelo contra el mismo contrato.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { downloadFile } from '../../lib/download';
import type {
  AspectsConfigResponse,
  AspectsSheetResponse,
  CompetenciesConfigResponse,
  CreateAspectBody,
  CreateCompetencyBody,
  GradePeriod,
  MyCoursesResponse,
  ReportCard,
  SaveAspectsBody,
  SaveAspectsResult,
  SaveSheetBody,
  SaveSheetResult,
  SheetResponse,
  UpdateAspectBody,
  UpdateCompetencyBody,
  Aspect,
  Competency,
} from './types';

// ---- Claves de caché --------------------------------------------------------
export const gradeKeys = {
  all: ['grades'] as const,
  periods: (yearId: string) => ['grades', 'periods', yearId] as const,
  myCourses: (periodId: string) => ['grades', 'my-courses', periodId] as const,
  sheet: (sectionId: string, courseId: string, periodId: string) =>
    ['grades', 'sheet', sectionId, courseId, periodId] as const,
  aspectsSheet: (sectionId: string, periodId: string) =>
    ['grades', 'aspects-sheet', sectionId, periodId] as const,
  reportCard: (enrollmentId: string, periodId: string) =>
    ['grades', 'report-card', enrollmentId, periodId] as const,
  evalAspects: ['evaluation-config', 'aspects'] as const,
  evalCompetencies: (gradeLevelId: string) =>
    ['evaluation-config', 'competencies', gradeLevelId] as const,
};

function invalidateGrades(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: gradeKeys.all });
}

// ---- Registro de notas ------------------------------------------------------
/**
 * Bimestres del año para los selectores de Notas, bajo permiso `notas` (el
 * docente no puede leer la ruta de estructura académica). yearId opcional:
 * default año activo en el API.
 */
export function useGradePeriods(yearId: string | undefined) {
  return useQuery<GradePeriod[]>({
    queryKey: gradeKeys.periods(yearId ?? ''),
    queryFn: () =>
      apiFetch<GradePeriod[]>(`/grades/periods${yearId ? `?yearId=${yearId}` : ''}`),
    placeholderData: (prev) => prev,
  });
}

/** Cursos×sección que el usuario puede calificar en un periodo. */
export function useMyCourses(periodId: string | undefined) {
  return useQuery<MyCoursesResponse>({
    queryKey: gradeKeys.myCourses(periodId ?? ''),
    queryFn: () => apiFetch<MyCoursesResponse>(`/grades/my-courses?periodId=${periodId}`),
    enabled: !!periodId,
    placeholderData: (prev) => prev,
  });
}

/** Hoja de notas de un curso×sección×periodo. */
export function useGradeSheet(
  sectionId: string | undefined,
  courseId: string | undefined,
  periodId: string | undefined,
) {
  return useQuery<SheetResponse>({
    queryKey: gradeKeys.sheet(sectionId ?? '', courseId ?? '', periodId ?? ''),
    queryFn: () =>
      apiFetch<SheetResponse>(
        `/grades/sheet?sectionId=${sectionId}&courseId=${courseId}&periodId=${periodId}`,
      ),
    enabled: !!sectionId && !!courseId && !!periodId,
    placeholderData: (prev) => prev,
  });
}

export function useSaveGradeSheet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveSheetBody) =>
      apiFetch<SaveSheetResult>('/grades/sheet', { method: 'PUT', body }),
    onSuccess: () => invalidateGrades(qc),
  });
}

/** Descarga el acta del curso×sección×periodo como .xlsx. */
export function exportGradeSheet(
  sectionId: string,
  courseId: string,
  periodId: string,
): Promise<void> {
  return downloadFile(
    `/grades/sheet/export?sectionId=${sectionId}&courseId=${courseId}&periodId=${periodId}`,
    `acta-notas.xlsx`,
  );
}

// ---- Aspectos del aula ------------------------------------------------------
export function useAspectsSheet(sectionId: string | undefined, periodId: string | undefined) {
  return useQuery<AspectsSheetResponse>({
    queryKey: gradeKeys.aspectsSheet(sectionId ?? '', periodId ?? ''),
    queryFn: () =>
      apiFetch<AspectsSheetResponse>(
        `/grades/aspects-sheet?sectionId=${sectionId}&periodId=${periodId}`,
      ),
    enabled: !!sectionId && !!periodId,
    placeholderData: (prev) => prev,
  });
}

export function useSaveAspects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveAspectsBody) =>
      apiFetch<SaveAspectsResult>('/grades/aspects', { method: 'PUT', body }),
    onSuccess: () => invalidateGrades(qc),
  });
}

// ---- Libreta ----------------------------------------------------------------
export function useReportCard(enrollmentId: string | undefined, periodId: string | undefined) {
  return useQuery<ReportCard>({
    queryKey: gradeKeys.reportCard(enrollmentId ?? '', periodId ?? ''),
    queryFn: () =>
      apiFetch<ReportCard>(
        `/grades/report-card?enrollmentId=${enrollmentId}&periodId=${periodId}`,
      ),
    enabled: !!enrollmentId && !!periodId,
    placeholderData: (prev) => prev,
  });
}

// ---- Configuración → Evaluación: aspectos ----------------------------------
export function useEvalAspects() {
  return useQuery<AspectsConfigResponse>({
    queryKey: gradeKeys.evalAspects,
    queryFn: () => apiFetch<AspectsConfigResponse>('/evaluation-config/aspects'),
  });
}

export function useCreateAspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAspectBody) =>
      apiFetch<Aspect>('/evaluation-config/aspects', { method: 'POST', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: gradeKeys.evalAspects });
      invalidateGrades(qc);
    },
  });
}

export function useUpdateAspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAspectBody }) =>
      apiFetch<Aspect>(`/evaluation-config/aspects/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: gradeKeys.evalAspects });
      invalidateGrades(qc);
    },
  });
}

// ---- Configuración → Evaluación: competencias ------------------------------
export function useEvalCompetencies(gradeLevelId: string | undefined) {
  return useQuery<CompetenciesConfigResponse>({
    queryKey: gradeKeys.evalCompetencies(gradeLevelId ?? ''),
    queryFn: () =>
      apiFetch<CompetenciesConfigResponse>(
        `/evaluation-config/competencies?gradeLevelId=${gradeLevelId}`,
      ),
    enabled: !!gradeLevelId,
  });
}

export function useCreateCompetency(gradeLevelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCompetencyBody) =>
      apiFetch<Competency>('/evaluation-config/competencies', { method: 'POST', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: gradeKeys.evalCompetencies(gradeLevelId) });
      invalidateGrades(qc);
    },
  });
}

export function useUpdateCompetency(gradeLevelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCompetencyBody }) =>
      apiFetch<Competency>(`/evaluation-config/competencies/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: gradeKeys.evalCompetencies(gradeLevelId) });
      invalidateGrades(qc);
    },
  });
}

export function useDeleteCompetency(gradeLevelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/evaluation-config/competencies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: gradeKeys.evalCompetencies(gradeLevelId) });
      invalidateGrades(qc);
    },
  });
}
