// Utilidades del Calendario académico: colores/etiquetas por tipo, helpers de
// fecha (grilla mensual real, navegación de mes) y prellenado del comunicado que
// nace de una actividad. Sin dependencias del API.
import type { BadgeTone } from '@elohim/ui';
import type { CalendarEventType } from './types';

// ---- Tipos de evento -------------------------------------------------------
export interface EventTypeMeta {
  label: string;
  /** Color del punto/borde (leyenda y chips). */
  color: string;
  /** Fondo suave del chip. */
  soft: string;
  /** Color del texto del chip. */
  fg: string;
  tone: BadgeTone;
}

export const EVENT_TYPE_META: Record<CalendarEventType, EventTypeMeta> = {
  FERIADO: {
    label: 'Feriado / no lectivo',
    color: 'var(--danger)',
    soft: 'var(--danger-soft)',
    fg: 'var(--danger-soft-fg)',
    tone: 'danger',
  },
  EXAMEN: {
    label: 'Exámenes',
    color: 'var(--brand)',
    soft: 'var(--surface-brand-soft)',
    fg: 'var(--info-soft-fg)',
    tone: 'brand',
  },
  ACTIVIDAD: {
    label: 'Actividad',
    color: 'var(--gold-500)',
    soft: 'var(--surface-accent-soft)',
    fg: 'var(--gold-700)',
    tone: 'accent',
  },
};

/** Meta de la leyenda para el vencimiento de pensiones (no es un tipo editable). */
export const PENSION_META = {
  label: 'Vencimiento pensiones',
  color: 'var(--success)',
  soft: 'var(--success-soft)',
  fg: 'var(--success-soft-fg)',
} as const;

/** Orden fijo para el Select de tipos (sin FERIADO derivado ni pensiones). */
export const EVENT_TYPE_ORDER: CalendarEventType[] = ['FERIADO', 'EXAMEN', 'ACTIVIDAD'];

// ---- Fechas ----------------------------------------------------------------
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export { WEEKDAY_SHORT };

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Mes en curso como 'YYYY-MM' (fecha civil local). */
export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Hoy como 'YYYY-MM-DD' (fecha civil local). */
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 'YYYY-MM' → { year, monthIndex (0..11) }. */
function parseMonth(month: string): { year: number; monthIndex: number } {
  const [y, m] = month.split('-').map(Number);
  return { year: y ?? new Date().getFullYear(), monthIndex: (m ?? 1) - 1 };
}

/** 'YYYY-MM' → "Julio 2026". */
export function monthLabel(month: string): string {
  const { year, monthIndex } = parseMonth(month);
  return `${MONTH_NAMES[monthIndex] ?? ''} ${year}`;
}

/** Desplaza 'YYYY-MM' en `delta` meses (maneja el cambio de año). */
export function addMonths(month: string, delta: number): string {
  const { year, monthIndex } = parseMonth(month);
  const d = new Date(year, monthIndex + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export interface CalendarCell {
  /** null = relleno antes/después del mes. */
  date: string | null;
  day: number | null;
  /** Fin de semana (sáb/dom). */
  weekend: boolean;
}

/**
 * Celdas de la grilla mensual (semanas completas Lun–Dom). Devuelve múltiplos de
 * 7; las posiciones fuera del mes van con `date: null`.
 */
export function monthGrid(month: string): CalendarCell[] {
  const { year, monthIndex } = parseMonth(month);
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // 0 = lunes
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ date: null, day: null, weekend: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const col = (firstWeekday + d - 1) % 7;
    cells.push({
      date: `${year}-${pad(monthIndex + 1)}-${pad(d)}`,
      day: d,
      weekend: col >= 5,
    });
  }
  // Completa la última semana con relleno para que la grilla cierre en 7.
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null, weekend: false });
  return cells;
}

/** 'YYYY-MM-DD' → "24/07/2026". */
export function shortDate(date: string | null | undefined): string {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
}

/** Rango legible de un evento: "24/07/2026" o "27/07/2026 – 29/07/2026". */
export function eventDateRange(ev: { startDate: string; endDate: string }): string {
  if (!ev.endDate || ev.endDate === ev.startDate) return shortDate(ev.startDate);
  return `${shortDate(ev.startDate)} – ${shortDate(ev.endDate)}`;
}

/** ¿La fecha `date` cae dentro del rango [start, end] del evento? */
export function coversDate(
  ev: { startDate: string; endDate: string | null },
  date: string,
): boolean {
  const end = ev.endDate || ev.startDate;
  return ev.startDate <= date && date <= end;
}

/** "sábado 25/07" para los encabezados de la agenda móvil. */
export function agendaDayLabel(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  const weekday = dt.toLocaleDateString('es-PE', { weekday: 'long' });
  return `${weekday} ${pad(d ?? 1)}/${pad(m ?? 1)}`;
}

// ---- Comunicado derivado de una actividad ----------------------------------
/** Cuerpo prellenado del borrador que se crea al guardar una ACTIVIDAD. */
export function activityAnnouncementBody(name: string, startDate: string): string {
  return (
    `Estimadas familias: los invitamos a ${name} el ${shortDate(startDate)}. ` +
    `Agradecemos su participación y puntualidad. Cualquier detalle adicional se ` +
    `comunicará oportunamente.`
  );
}
