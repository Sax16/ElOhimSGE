// DTOs de Asistencia de estudiantes (R4 · Etapa 1), según el contrato de la API.
// El enum vive en @elohim/shared (espejo de Prisma); aquí solo los shapes de
// respuesta que el API no comparte.
import type { StudentAttendanceStatus } from '@elohim/shared';

export { STUDENT_ATTENDANCE_STATUSES } from '@elohim/shared';
export type { StudentAttendanceStatus } from '@elohim/shared';

export type Shift = 'MANANA' | 'TARDE';
export type SectionRole = 'TUTOR' | 'DOCENTE';

/** Conteo por estado (mismas claves en my-sections, save y monthly totals). */
export interface StatusCounts {
  PRESENTE: number;
  TARDANZA: number;
  FALTA: number;
  JUSTIFICADA: number;
}

// ---- Mis secciones (portal docente) ----------------------------------------
/** GET /student-attendance/my-sections?date= — una entrada por aula. */
export interface MySection {
  sectionId: string;
  label: string; // "3° A · Primaria"
  shift: Shift;
  role: SectionRole;
  courseNames: string[];
  studentCount: number;
  taken: boolean;
  counts: StatusCounts | null;
}

export interface MySectionsResponse {
  date: string;
  sections: MySection[];
}

// ---- Roster del día (toma diaria) ------------------------------------------
export interface RosterSection {
  id: string;
  label: string;
  shift: Shift;
}

/** Fila del roster — GET /student-attendance/roster. */
export interface RosterEntry {
  id: string | null; // id del registro de asistencia (null si aún no hay toma)
  enrollmentId: string;
  studentCode: string; // "E-1042"
  fullName: string; // "Quispe Roca, María"
  status: StudentAttendanceStatus | null;
  corrected: boolean;
  guardianName: string | null;
  guardianPhone: string | null;
}

export interface RosterResponse {
  section: RosterSection;
  date: string;
  editable: boolean;
  taken: boolean;
  entries: RosterEntry[];
}

// ---- Guardar la toma -------------------------------------------------------
export interface SaveEntry {
  enrollmentId: string;
  status: StudentAttendanceStatus;
}

export interface SaveBody {
  sectionId: string;
  date: string; // 'YYYY-MM-DD'
  entries: SaveEntry[];
}

export interface SaveResult {
  saved: number;
  skippedCorrected: number;
  counts: StatusCounts;
}

// ---- Corrección (solo Admin) -----------------------------------------------
export interface CorrectBody {
  status: StudentAttendanceStatus;
  reason: string; // ≥ 10 caracteres
}

// ---- Vista mensual ---------------------------------------------------------
export type StatusLetter = 'P' | 'T' | 'F' | 'J';

export interface MonthlyStudent {
  studentCode: string;
  fullName: string;
  byDate: Record<string, StatusLetter>; // { "2026-07-01": "P", … }
  totals: StatusCounts;
  pct: number | null; // % de asistencia (null si no hay días registrados)
}

export interface MonthlyResponse {
  section: RosterSection;
  month: string; // 'YYYY-MM'
  days: string[]; // ["2026-07-01", …]
  students: MonthlyStudent[];
}
