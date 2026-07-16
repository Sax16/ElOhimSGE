// Utilidades de Asistencia de estudiantes: etiquetas, tonos, letras, fechas y
// el mensaje de WhatsApp para avisar faltas al apoderado.
import type { BadgeTone } from '@elohim/ui';
import {
  STUDENT_ATTENDANCE_STATUS_LABELS,
  STUDENT_ATTENDANCE_STATUS_TONES,
} from '@elohim/shared';
import type {
  Shift,
  StatusLetter,
  StudentAttendanceStatus,
} from './types';

// ---- Estado ----------------------------------------------------------------
export const STATUS_LABELS: Record<StudentAttendanceStatus, string> =
  STUDENT_ATTENDANCE_STATUS_LABELS;

export const STATUS_TONE: Record<StudentAttendanceStatus, BadgeTone> =
  STUDENT_ATTENDANCE_STATUS_TONES;

/** Letra del botón/celda por estado (P/T/F/J). */
export const STATUS_LETTER: Record<StudentAttendanceStatus, StatusLetter> = {
  PRESENTE: 'P',
  TARDANZA: 'T',
  FALTA: 'F',
  JUSTIFICADA: 'J',
};

/** Estado ↔ letra inverso (para la matriz mensual, que llega en letras). */
export const LETTER_STATUS: Record<StatusLetter, StudentAttendanceStatus> = {
  P: 'PRESENTE',
  T: 'TARDANZA',
  F: 'FALTA',
  J: 'JUSTIFICADA',
};

/** Color CSS del estado activo (fondo del botón circular). */
export const STATUS_COLOR: Record<StudentAttendanceStatus, string> = {
  PRESENTE: 'var(--success)',
  TARDANZA: 'var(--warning)',
  FALTA: 'var(--danger)',
  JUSTIFICADA: 'var(--info)',
};

/** Fondo suave + color de texto de la celda mensual, por letra. */
export const LETTER_CELL: Record<StatusLetter, { bg: string; fg: string }> = {
  P: { bg: 'var(--success-soft)', fg: 'var(--success)' },
  T: { bg: 'var(--warning-soft)', fg: 'var(--warning)' },
  F: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  J: { bg: 'var(--info-soft)', fg: 'var(--info)' },
};

/** Orden fijo de los botones/estados: Presente, Tardanza, Falta, Justificada. */
export const STATUS_ORDER: StudentAttendanceStatus[] = [
  'PRESENTE',
  'TARDANZA',
  'FALTA',
  'JUSTIFICADA',
];

// ---- Turno -----------------------------------------------------------------
export const SHIFT_LABELS: Record<Shift, string> = {
  MANANA: 'Mañana',
  TARDE: 'Tarde',
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

/** Mes (YYYY-MM) actual. */
export function currentMonth(): string {
  return todayStr().slice(0, 7);
}

/** "2026-07-07" → "Martes 07 de julio de 2026". */
export function longDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  const dt = new Date(y, m - 1, d);
  const text = dt.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "2026-07-07" → "Martes 07/07/2026". */
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

/** "2026-07-07" → "07/07/2026". */
export function shortDate(date: string): string {
  const [y, m, d] = date.split('-');
  return y && m && d ? `${d}/${m}/${y}` : date;
}

/** Número de día del mes de una fecha ("2026-07-07" → "07"). */
export function dayNum(date: string): string {
  return date.slice(8, 10);
}

/** Sábado o domingo (para atenuar columnas de fin de semana en la matriz). */
export function isWeekend(date: string): boolean {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return false;
  const wd = new Date(y, m - 1, d).getDay();
  return wd === 0 || wd === 6;
}

// ---- Saludo ----------------------------------------------------------------
/** "Buenos días" / "Buenas tardes" / "Buenas noches" según la hora local. */
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Primer nombre de un nombre completo "Pedro Gómez Silva" → "Pedro". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

// ---- WhatsApp --------------------------------------------------------------
/** Normaliza un teléfono a los 9 dígitos peruanos (quita espacios, +51, etc.). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('51') && digits.length > 9 ? digits.slice(2) : digits;
}

/**
 * Enlace wa.me con el aviso de falta prellenado (contacto principal).
 * Mensaje acordado en las decisiones de la etapa; el envío es manual.
 */
export function absenceWaUrl(studentName: string, date: string, phone: string): string {
  const tel = normalizePhone(phone);
  const msg =
    `Estimada familia: le informamos que ${studentName} no asistió hoy ` +
    `${shortDate(date)} a la I.E.P. Elohim. Si tiene una justificación, ` +
    `acérquese a secretaría.`;
  return `https://wa.me/51${tel}?text=${encodeURIComponent(msg)}`;
}
