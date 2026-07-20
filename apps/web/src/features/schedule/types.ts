// DTOs de Grilla de horarios (post-R4), según el contrato de la API. Tipos
// locales del feature hasta que @elohim/shared los exporte; el backend va en
// paralelo contra este mismo contrato.
import type { Shift } from '../student-attendance/types';

// ---- Bloques (Configuración de la grilla) ----------------------------------
/** Bloque de la grilla — fila de la tabla horaria de un nivel+turno. */
export interface ScheduleBlock {
  id: string;
  order: number;
  startTime: string; // "07:45"
  endTime: string; // "08:30"
  isBreak: boolean;
  label: string | null;
}

/** GET /schedule/blocks?levelId=&shift=. */
export interface BlocksResponse {
  blocks: ScheduleBlock[];
}

/** Fila editable de un bloque en la pestaña Bloques (sin id: el orden es la fila). */
export interface BlockDraft {
  order: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label?: string;
}

/** PUT /schedule/blocks. */
export interface SaveBlocksBody {
  levelId: string;
  shift: Shift;
  blocks: BlockDraft[];
}

// ---- Horario por sección ---------------------------------------------------
/** Cabecera de la sección en la vista de horario. */
export interface ScheduleSection {
  id: string;
  label: string; // "3° A · Primaria"
  shift: Shift;
  levelId: string;
  gradeLevelId: string;
}

/** Celda ocupada de la grilla (día × bloque). */
export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 1..5 (Lun..Vie)
  blockId: string;
  courseId: string;
  courseName: string;
  teacherId: string | null;
  teacherName: string | null;
}

/** Resumen de horas por curso (chips del pie + opciones del diálogo). */
export interface CourseHours {
  courseId: string;
  courseName: string;
  weeklyHours: number;
  scheduled: number;
}

/** GET /schedule?sectionId=. */
export interface ScheduleResponse {
  section: ScheduleSection;
  blocks: ScheduleBlock[];
  slots: ScheduleSlot[];
  hours: CourseHours[];
}

/** PUT /schedule/slot — courseId null = vaciar la celda. */
export interface SaveSlotBody {
  sectionId: string;
  dayOfWeek: number;
  blockId: string;
  courseId: string | null;
}

/** Respuesta de PUT /schedule/slot. */
export interface SaveSlotResult {
  slot: ScheduleSlot | null;
  hours: CourseHours[];
}

// ---- Copiar de otra sección ------------------------------------------------
export interface CopyScheduleBody {
  fromSectionId: string;
  toSectionId: string;
}

/** Bloque omitido al copiar (recreo, curso ajeno, choque…). */
export interface CopySkipped {
  dayOfWeek: number;
  blockLabel: string;
  courseName: string;
  reason: string;
}

/** POST /schedule/copy. */
export interface CopyScheduleResult {
  copied: number;
  skipped: CopySkipped[];
}

// ---- Mi horario (portal docente) -------------------------------------------
/** Clase del docente actual — GET /schedule/my-week. */
export interface MyWeekItem {
  dayOfWeek: number; // 1..5
  startTime: string;
  endTime: string;
  courseName: string;
  sectionLabel: string;
}

export interface MyWeekResponse {
  items: MyWeekItem[];
}
