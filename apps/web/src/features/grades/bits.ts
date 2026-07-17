// Utilidades de Notas: escala literal AD/A/B/C, colores/tonos por letra, cálculo
// del logro automático y la condición del curso. La escala y el cálculo puro
// vienen de @elohim/shared (con tests); aquí solo la adaptación de presentación.
import type { BadgeTone } from '@elohim/ui';
import {
  GRADE_LETTERS as SHARED_GRADE_LETTERS,
  GRADE_LETTER_LABELS,
  GRADE_LETTER_TONES as SHARED_GRADE_LETTER_TONES,
  COURSE_CONDITION_LABELS,
  computeCourseResult as sharedComputeCourseResult,
  courseCondition as sharedCourseCondition,
  gradeValue,
} from '@elohim/shared';
import type { CourseCondition } from '@elohim/shared';
import type { GradeLetter } from './types';

/** Letras en orden de mérito (mejor → peor). */
export const GRADE_LETTERS: GradeLetter[] = [...SHARED_GRADE_LETTERS];

/** Valor numérico de cada letra (AD=4 … C=1) para promediar. */
export const GRADE_VALUE: Record<GradeLetter, number> = {
  AD: gradeValue('AD'),
  A: gradeValue('A'),
  B: gradeValue('B'),
  C: gradeValue('C'),
};

export { GRADE_LETTER_LABELS };

/** Tono de badge por letra. AD destaca en verde sólido. */
export const GRADE_LETTER_TONES: Record<GradeLetter, BadgeTone> = SHARED_GRADE_LETTER_TONES;

/** Color CSS del borde/acento por letra (para el NotaSelect). */
export const GRADE_LETTER_COLOR: Record<GradeLetter, string> = {
  AD: 'var(--success)',
  A: 'var(--brand)',
  B: 'var(--gold-500)',
  C: 'var(--danger)',
};

/**
 * Logro automático del bimestre: promedio (half-up) de las notas de competencia
 * presentes (cálculo puro de shared). Null si el alumno no tiene notas todavía.
 */
export function computeCourseResult(letters: Array<GradeLetter | null | undefined>): GradeLetter | null {
  return sharedComputeCourseResult(letters.filter((l): l is GradeLetter => !!l));
}

export interface Condition {
  label: string;
  tone: BadgeTone;
  color: string;
}

const CONDITION_PRESENTATION: Record<CourseCondition, Condition> = {
  LOGRADO: { label: COURSE_CONDITION_LABELS.LOGRADO, tone: 'success', color: 'var(--success)' },
  EN_PROCESO: {
    label: COURSE_CONDITION_LABELS.EN_PROCESO,
    tone: 'warning',
    color: 'var(--warning-soft-fg)',
  },
  EN_INICIO: { label: COURSE_CONDITION_LABELS.EN_INICIO, tone: 'danger', color: 'var(--danger)' },
};

/**
 * Condición del curso a partir del logro efectivo (regla pura de shared: ≥2.5
 * Logrado, ≥1.5 En proceso, si no En inicio).
 */
export function courseCondition(letter: GradeLetter | null): Condition | null {
  if (!letter) return null;
  const condition = sharedCourseCondition([letter]);
  return condition ? CONDITION_PRESENTATION[condition] : null;
}

// ---- Etiquetas cortas de competencia (C1..Cn) ------------------------------
/** "C" + índice 1-based, para los encabezados compactos de la tabla. */
export function shortCompetency(index: number): string {
  return `C${index + 1}`;
}

// ---- Avance ----------------------------------------------------------------
/** Porcentaje entero de avance (filled/total), 0 si total es 0. */
export function pct(filled: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((filled / total) * 100);
}

/** Tono del ProgressBar por porcentaje: 100 success · ≥50 brand · resto warning. */
export function progressTone(percent: number): 'success' | 'brand' | 'warning' {
  if (percent >= 100) return 'success';
  if (percent >= 50) return 'brand';
  return 'warning';
}
