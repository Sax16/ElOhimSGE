// Utilidades del Portal del apoderado: formato de dinero, fechas, letras de
// asistencia/nota (reusando los tonos de sus módulos) y el enlace wa.me a
// secretaría. Sin lógica de negocio: todo llega resuelto por la API.
import type { BadgeTone } from '@elohim/ui';
import { formatPEN, toCents } from '@elohim/shared';
import { LETTER_CELL } from '../student-attendance/bits';
import type { AttendanceLetter, InstallmentStatus } from './types';

// ---- Dinero ----------------------------------------------------------------
/** Monto string decimal "1234.00" → "S/ 1,234.00" (mismo pipe que el resto del front). */
export function money(decimal: string | null | undefined): string {
  if (decimal == null) return '—';
  return formatPEN(toCents(decimal));
}

/** ¿El monto decimal string es > 0? */
export function isPositive(decimal: string | null | undefined): boolean {
  if (decimal == null) return false;
  return toCents(decimal) > 0;
}

// ---- Fechas ----------------------------------------------------------------
/** ISO o "YYYY-MM-DD" → "07/07/2026" (fecha civil local, sin desfase UTC). */
export function shortDate(value: string | null | undefined): string {
  if (!value) return '';
  // Fecha pura (sin hora): parsear como civil para evitar el corrimiento UTC.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = dateOnly ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** ISO/fecha → "7 de julio" (para eventos y calendario). */
export function dayMonthLong(value: string | null | undefined): string {
  if (!value) return '';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = dateOnly ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'long' });
}

/** ISO/fecha → "07:45" (hora local 24h). '' si no trae hora. */
export function timeOnly(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Mes (YYYY-MM) actual. */
export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** "2026-07" → "julio 2026" (capitalizado). */
export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month;
  const text = new Date(y, m - 1, 1).toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Número de día ("2026-07-07" → "07"). */
export function dayNum(value: string): string {
  const d = /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(8, 10) : String(new Date(value).getDate());
  return d.padStart(2, '0');
}

/** Primer nombre de un nombre completo. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

// ---- Cuotas (pensiones) ----------------------------------------------------
export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  PAGADO: 'Pagado',
  PENDIENTE: 'Pendiente',
  VENCIDO: 'Vencido',
  EXONERADO: 'Exonerado',
  ANULADO: 'Anulado',
};

export const INSTALLMENT_STATUS_TONE: Record<InstallmentStatus, BadgeTone> = {
  PAGADO: 'success',
  PENDIENTE: 'neutral',
  VENCIDO: 'danger',
  EXONERADO: 'info',
  ANULADO: 'neutral',
};

// ---- Asistencia ------------------------------------------------------------
/** Nombre del estado por letra. */
export const ATTENDANCE_LETTER_LABELS: Record<AttendanceLetter, string> = {
  P: 'Presente',
  T: 'Tardanza',
  F: 'Falta',
  J: 'Justificada',
};

/** Fondo suave + color de texto por letra (reusa los tonos de asistencia). */
export const ATTENDANCE_LETTER_CELL = LETTER_CELL;

// ---- Eventos / calendario --------------------------------------------------
const EVENT_TYPE_LABELS: Record<string, string> = {
  FERIADO: 'Feriado',
  ACTIVIDAD: 'Actividad',
  EVALUACION: 'Evaluación',
  VENCIMIENTO: 'Vencimiento de pensión',
  CIVICO: 'Fecha cívica',
  SUSPENSION: 'Suspensión de clases',
};

export function eventTypeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type] ?? type.charAt(0) + type.slice(1).toLowerCase();
}

export function eventTypeTone(type: string): BadgeTone {
  switch (type) {
    case 'FERIADO':
    case 'SUSPENSION':
      return 'danger';
    case 'VENCIMIENTO':
      return 'warning';
    case 'EVALUACION':
      return 'brand';
    case 'CIVICO':
      return 'info';
    default:
      return 'neutral';
  }
}

// ---- WhatsApp a secretaría -------------------------------------------------
/** Normaliza un teléfono a los 9 dígitos peruanos. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('51') && digits.length > 9 ? digits.slice(2) : digits;
}

/**
 * Enlace wa.me a secretaría con un saludo prellenado. Devuelve null si no hay
 * teléfono institucional configurado (entonces el botón se oculta).
 */
export function secretariaWaUrl(params: {
  phone: string | null;
  guardianName: string;
  studentName: string;
  sectionLabel: string;
}): string | null {
  const { phone, guardianName, studentName, sectionLabel } = params;
  if (!phone) return null;
  const tel = normalizePhone(phone);
  if (!tel) return null;
  const msg = `Hola, soy ${guardianName}, apoderado de ${studentName} (${sectionLabel}). `;
  return `https://wa.me/51${tel}?text=${encodeURIComponent(msg)}`;
}
