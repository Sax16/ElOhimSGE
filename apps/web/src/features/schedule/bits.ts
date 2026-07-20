// Utilidades de la Grilla de horarios: días L–V, color determinista por curso,
// formato del rango horario y el tono del chip de horas por curso.
import type { BadgeTone } from '@elohim/ui';

/** Días lectivos (dayOfWeek 1..5). */
export const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
export const DAY_LABELS_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
/** dayOfWeek 1..5 en orden fijo para recorrer las columnas. */
export const DAYS: number[] = [1, 2, 3, 4, 5];

/** Nombre corto del día por dayOfWeek (1=Lun). */
export function dayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek - 1] ?? '';
}

/** Nombre largo del día por dayOfWeek (1=Lunes). */
export function dayLabelLong(dayOfWeek: number): string {
  return DAY_LABELS_LONG[dayOfWeek - 1] ?? '';
}

// ---- Color por curso -------------------------------------------------------
/**
 * Paleta de barras por curso — tokens del design system (misma referencia
 * visual que CURSO_COLOR del prototipo). Se elige de forma determinista por
 * courseId para que un curso conserve su color en toda la grilla.
 */
export const COURSE_PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--gold-600)',
  'var(--brown-500)',
];

/** Hex paralelo a COURSE_PALETTE, para la impresión (el iframe no ve los tokens). */
export const COURSE_PALETTE_HEX = [
  '#2e72a8', // chart-1 (blue-500)
  '#c0892a', // chart-2 (gold-500)
  '#1f9254', // chart-3 (green-500)
  '#836032', // chart-4 (brown-400)
  '#7db2d8', // chart-5 (blue-300)
  '#cf3b2c', // chart-6 (red-500)
  '#a37121', // gold-600
  '#6b4a24', // brown-500
];

/** Índice determinista en la paleta a partir del courseId (hash simple). */
export function courseColorIndex(courseId: string): number {
  let h = 0;
  for (let i = 0; i < courseId.length; i++) {
    h = (h * 31 + courseId.charCodeAt(i)) >>> 0;
  }
  return h % COURSE_PALETTE.length;
}

/** Token CSS de color por courseId. */
export function courseColor(courseId: string): string {
  return COURSE_PALETTE[courseColorIndex(courseId)] ?? 'var(--brand)';
}

/** Hex de color por courseId (impresión). */
export function courseColorHex(courseId: string): string {
  return COURSE_PALETTE_HEX[courseColorIndex(courseId)] ?? '#2e72a8';
}

// ---- Rango horario ---------------------------------------------------------
/** "07:45"–"08:30" → "07:45–08:30" (guion en, tipografía mono). */
export function timeRange(startTime: string, endTime: string): string {
  return `${startTime}–${endTime}`;
}

// ---- Chip de horas ---------------------------------------------------------
/**
 * Tono del chip de horas por curso: success si programadas == semanales,
 * neutral si el curso no declara horas (0/undefined), warning si difieren.
 */
export function hoursTone(scheduled: number, weeklyHours: number): BadgeTone {
  if (!weeklyHours) return 'neutral';
  return scheduled === weeklyHours ? 'success' : 'warning';
}
