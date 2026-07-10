// DTOs de la pantalla Estructura académica, según el contrato de la API (Etapa 3).
// Nota: los schemas Zod de estructura viven en @elohim/shared (schemas/structure.ts),
// creados por otro agente; aquí solo tipamos las respuestas/bodies que consume el front.
import type {
  PeriodStatus,
  PeriodType,
  ProgramStatus,
  ProgramType,
  Shift,
  StudentStatus,
  YearStatus,
} from '@elohim/shared';

/** Año académico — GET /api/academic-years. */
export interface ApiYear {
  id: string;
  name: string;
  status: YearStatus;
  startDate: string;
  endDate: string;
  periodType: PeriodType;
  enrollmentStart: string;
  /** Matrículas del año (incluye anuladas) — bloquea la eliminación del año si > 0. */
  enrollmentsCount: number;
}

/** Docente — GET /api/teachers. */
export interface ApiTeacher {
  id: string;
  fullName: string;
}

/** Sección dentro del árbol de estructura. */
export interface ApiSection {
  id: string;
  name: string;
  shift: Shift;
  capacity: number;
  enrolled: number;
  tutor: { id: string; fullName: string } | null;
  assistantName: string | null;
}

/** Grado dentro del árbol de estructura. */
export interface ApiGrade {
  id: string;
  name: string;
  order: number;
  /** Cursos del plan del grado — bloquea la eliminación del grado si > 0. */
  coursesCount: number;
  sections: ApiSection[];
}

/** Nivel dentro del árbol de estructura — GET /api/academic-years/:yearId/levels. */
export interface ApiLevel {
  id: string;
  name: string;
  description: string | null;
  order: number;
  grades: ApiGrade[];
}

/** Curso del plan de estudios — GET /api/grade-levels/:id/courses. */
export interface ApiCourse {
  id: string;
  name: string;
  weeklyHours: number;
  teacher: { id: string; fullName: string } | null;
}

/** Programa complementario — GET /api/programs?yearId=. */
export interface ApiProgram {
  id: string;
  name: string;
  type: ProgramType;
  scheduleText: string;
  capacity: number;
  enrolled: number;
  enrollmentFee: string;
  monthlyFee: string;
  status: ProgramStatus;
  /** Mes de inicio (2=Feb..12=Dic). Puede faltar si el backend es anterior a la vigencia. */
  startMonth?: number;
  /** Mes de fin (2=Feb..12=Dic). */
  endMonth?: number;
}

/** Inscripción a un programa — GET /api/programs/:id/enrollments. */
export interface ApiProgramEnrollment {
  id: string;
  student: { id: string; code: string; firstNames: string; lastNames: string };
  enrolledAt: string;
  canceledAt: string | null;
  paidCount: number;
  totalCount: number;
  debtCents: number;
}

/** Cuota calculada al inscribir a un programa. */
export interface ProgramEnrollPreviewItem {
  type: string;
  concept: string;
  sequence: number;
  dueDate: string;
  totalCents: number;
}

/** Preview de inscripción — POST /api/programs/:id/enrollments/preview. */
export interface ProgramEnrollPreview {
  items: ProgramEnrollPreviewItem[];
  totalCents: number;
  total: string;
}

/** Periodo académico — GET /api/academic-years/:yearId/periods. */
export interface ApiPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  order: number;
}

/** Fila de nómina — GET /api/sections/:id/roster (vacío en esta etapa). */
export interface ApiRosterRow {
  id: string;
  student: {
    id: string;
    code: string;
    firstNames: string;
    lastNames: string;
    status: StudentStatus;
  };
}

/** Resultado de POST /api/academic-years/:id/start-next. */
export interface StartNextYearResult {
  id: string;
  name: string;
  counts: {
    levels: number;
    grades: number;
    sections: number;
    courses: number;
    programs: number;
  };
}

/** Resultado de POST /api/courses/copy. */
export interface CopyCoursesResult {
  copied: number;
  skipped: number;
}

// ---- Bodies de mutación (espejo de los schemas de @elohim/shared) ----------

export interface LevelCreateBody {
  academicYearId: string;
  name: string;
  description?: string;
}
export interface LevelUpdateBody {
  name?: string;
  description?: string;
}
export interface GradeCreateBody {
  levelId: string;
  name: string;
}
export interface GradeUpdateBody {
  name?: string;
}
export interface SectionCreateBody {
  gradeLevelId: string;
  name: string;
  shift: Shift;
  capacity: number;
  tutorId?: string | null;
  assistantName?: string | null;
}
export interface SectionUpdateBody {
  name?: string;
  shift?: Shift;
  capacity?: number;
  tutorId?: string | null;
  assistantName?: string | null;
}
export interface CourseCreateBody {
  gradeLevelId: string;
  name: string;
  weeklyHours: number;
  teacherId?: string | null;
}
export interface CourseUpdateBody {
  name?: string;
  weeklyHours?: number;
  teacherId?: string | null;
}
export interface CoursesCopyBody {
  fromGradeLevelId: string;
  toGradeLevelIds: string[];
}
export interface ProgramCreateBody {
  academicYearId: string;
  name: string;
  type: ProgramType;
  scheduleText: string;
  capacity: number;
  enrollmentFee: string;
  monthlyFee: string;
  status: ProgramStatus;
  startMonth: number;
  endMonth: number;
}
export interface ProgramUpdateBody {
  name?: string;
  type?: ProgramType;
  scheduleText?: string;
  capacity?: number;
  enrollmentFee?: string;
  monthlyFee?: string;
  status?: ProgramStatus;
  startMonth?: number;
  endMonth?: number;
}
export interface PeriodUpdateBody {
  startDate?: string;
  endDate?: string;
}
export interface StartNextYearBody {
  name: string;
  startDate: string;
  endDate: string;
  periodType: PeriodType;
  enrollmentStart: string;
  copy: {
    structure: boolean;
    plan: boolean;
    tutors: boolean;
    programs: boolean;
  };
}
