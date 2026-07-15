// Utilidades de Marcación y asistencia: etiquetas, tonos, fechas y textos.
import type { BadgeTone } from '@elohim/ui';
import type { AttendanceStatus, CountPeriod } from './types';

// ---- Estado de marca -------------------------------------------------------
export const ATT_STATUS_LABELS: Record<AttendanceStatus, string> = {
  PUNTUAL: 'Puntual',
  TARDANZA: 'Tardanza',
  SIN_MARCAR: 'Sin marcar',
  FALTA: 'Falta',
  LICENCIA: 'Licencia',
};

export const ATT_STATUS_TONE: Record<AttendanceStatus, BadgeTone> = {
  PUNTUAL: 'success',
  TARDANZA: 'warning',
  SIN_MARCAR: 'neutral',
  FALTA: 'danger',
  LICENCIA: 'info',
};

export const COUNT_PERIOD_LABELS: Record<CountPeriod, string> = {
  MES: 'Por mes',
  BIMESTRE: 'Por bimestre',
};

// ---- Fechas ----------------------------------------------------------------
/** Fecha civil local de hoy en formato YYYY-MM-DD (sin desfase UTC). */
export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Mes (YYYY-MM) de una fecha YYYY-MM-DD. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** "2026-07-07" → "Martes 07/07/2026" (día de la semana capitalizado). */
export function dayTitle(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  const weekday = dt.toLocaleDateString('es-PE', { weekday: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${cap} ${dd}/${mm}/${y}`;
}

/** "2026-07-07" → "07/07". */
export function shortDate(date: string): string {
  const [, m, d] = date.split('-');
  return d && m ? `${d}/${m}` : date;
}

// ---- Nombres ---------------------------------------------------------------
/** "Saúl Ramos Cruz" → "S. Ramos" (inicial del nombre + primer apellido). */
export function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return `${parts[0]!.charAt(0)}. ${parts[1]}`;
}
