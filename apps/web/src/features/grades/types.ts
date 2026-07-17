// DTOs de Notas por competencias, libreta y Configuración → Evaluación
// (R4 · Etapa 2), según el contrato de la API. La escala literal vive en
// @elohim/shared (enum espejo de Prisma + cálculo puro con tests).

import type { PeriodStatus } from '@elohim/shared';

export type { GradeLetter } from '@elohim/shared';
import type { GradeLetter } from '@elohim/shared';

/** Bimestre para los selectores de Notas (GET /grades/periods). */
export interface GradePeriod {
  id: string;
  name: string;
  order: number;
  status: PeriodStatus;
}

// ---- Registro de notas por competencias ------------------------------------

/** Periodo mínimo que devuelve my-courses. */
export interface GradePeriodRef {
  id: string;
  name: string;
}

/** Curso×sección que el usuario puede calificar — GET /grades/my-courses. */
export interface MyCourse {
  sectionId: string;
  sectionLabel: string; // "3° A · Primaria"
  courseId: string;
  courseName: string; // "Matemática"
  students: number;
  filled: number; // competencias-alumno con nota
  total: number; // competencias-alumno esperadas
}

export interface MyCoursesResponse {
  period: GradePeriodRef;
  courses: MyCourse[];
}

/** Competencia de un curso. */
export interface Competency {
  id: string;
  name: string;
  order: number;
}

/** Resultado de curso (logro del bimestre) de un alumno. */
export interface CourseResult {
  letter: GradeLetter;
  /** true = calculado automático; false = ajustado a mano por el docente. */
  auto: boolean;
}

/** Fila de la hoja de notas — GET /grades/sheet. */
export interface SheetStudent {
  enrollmentId: string;
  studentCode: string; // "E-1042"
  fullName: string; // "Quispe Roca, María"
  letters: Record<string, GradeLetter | null>; // por competencyId
  result: CourseResult | null;
}

export interface SheetResponse {
  section: { id: string; label: string };
  course: { id: string; name: string };
  period: { id: string; name: string; status: PeriodStatus };
  editable: boolean;
  competencies: Competency[];
  students: SheetStudent[];
  progress: { filled: number; total: number };
}

/** Entrada de nota de competencia para guardar. */
export interface SheetEntry {
  enrollmentId: string;
  competencyId: string;
  letter: GradeLetter | null; // null = borra la nota
}

export interface SaveSheetBody {
  sectionId: string;
  courseId: string;
  periodId: string;
  entries: SheetEntry[];
  reason?: string; // ≥10, exigido por el back en periodo cerrado
}

export interface SaveSheetResult {
  saved: number;
  removed: number;
  results: Array<{ enrollmentId: string; letter: GradeLetter | null; auto: boolean }>;
}

// ---- Aspectos del aula (formativos + evaluación del apoderado) -------------

export type AspectKind = 'FORMATIVO' | 'APODERADO';

export interface Aspect {
  id: string;
  kind: AspectKind;
  name: string;
  order: number;
  active: boolean;
}

/** Aspecto tal como llega en aspects-sheet (el API solo manda los activos). */
export interface SheetAspect {
  id: string;
  kind: AspectKind;
  name: string;
  order: number;
}

/** Fila de la matriz de aspectos — GET /grades/aspects-sheet. */
export interface AspectsSheetStudent {
  enrollmentId: string;
  studentCode: string;
  fullName: string;
  letters: Record<string, GradeLetter | null>; // por aspectId
}

export interface AspectsSheetResponse {
  section: { id: string; label: string };
  period: { id: string; name: string; status: PeriodStatus };
  editable: boolean;
  isTutor: boolean;
  aspects: SheetAspect[];
  students: AspectsSheetStudent[];
}

export interface AspectEntry {
  enrollmentId: string;
  aspectId: string;
  letter: GradeLetter | null;
}

export interface SaveAspectsBody {
  sectionId: string;
  periodId: string;
  entries: AspectEntry[];
  reason?: string;
}

export interface SaveAspectsResult {
  saved: number;
  removed: number;
}

// ---- Libreta (report card) -------------------------------------------------

export interface ReportCardPeriod {
  id: string;
  name: string;
  order: number;
  status: PeriodStatus;
}

export interface ReportCardCourse {
  courseId: string;
  courseName: string;
  byPeriod: Record<string, CourseResult | null>;
}

export interface ReportCardAspect {
  id: string;
  kind: AspectKind;
  name: string;
  byPeriod: Record<string, GradeLetter | null>;
}

export interface ReportCard {
  student: {
    code: string;
    fullName: string;
    gradeLabel: string;
    sectionLabel: string;
    tutorName: string | null;
  };
  year: string;
  period: ReportCardPeriod;
  periods: ReportCardPeriod[];
  courses: ReportCardCourse[];
  aspects: ReportCardAspect[];
  attendance: { pct: number | null; tardanzas: number; faltas: number };
}

// ---- Configuración → Evaluación --------------------------------------------

export interface AspectsConfigResponse {
  aspects: Aspect[];
}

export interface CreateAspectBody {
  kind: AspectKind;
  name: string;
}

export interface UpdateAspectBody {
  name?: string;
  active?: boolean;
}

/** Curso con sus competencias — GET /evaluation-config/competencies. */
export interface CourseCompetencies {
  courseId: string;
  courseName: string;
  competencies: Competency[];
}

export interface CompetenciesConfigResponse {
  courses: CourseCompetencies[];
}

export interface CreateCompetencyBody {
  courseId: string;
  name: string;
}

export interface UpdateCompetencyBody {
  name: string;
}
