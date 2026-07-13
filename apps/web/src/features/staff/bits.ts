// Utilidades compartidas de la feature Personal: etiquetas, tonos y formatos.
import type { BadgeTone } from '@elohim/ui';
import { formatPEN, toCents } from '@elohim/shared';
import type {
  EmploymentType,
  StaffEffectiveSchedule,
  StaffRole,
  StaffStatus,
} from './types';

// ---- Rol -------------------------------------------------------------------
export const STAFF_ROLES: StaffRole[] = [
  'DOCENTE',
  'SECRETARIA',
  'AUXILIAR',
  'MANTENIMIENTO',
  'DIRECCION',
  'PORTERIA',
];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  DOCENTE: 'Docente',
  SECRETARIA: 'Secretaría',
  AUXILIAR: 'Auxiliar',
  MANTENIMIENTO: 'Mantenimiento',
  DIRECCION: 'Dirección',
  PORTERIA: 'Portería',
};

/** DOCENTE brand, SECRETARIA accent, el resto info (spec del prototipo). */
export const STAFF_ROLE_TONE: Record<StaffRole, BadgeTone> = {
  DOCENTE: 'brand',
  SECRETARIA: 'accent',
  AUXILIAR: 'info',
  MANTENIMIENTO: 'info',
  DIRECCION: 'info',
  PORTERIA: 'info',
};

// ---- Régimen laboral -------------------------------------------------------
export const EMPLOYMENT_TYPES: EmploymentType[] = [
  'TIEMPO_COMPLETO',
  'MEDIO_TIEMPO',
  'POR_HORAS',
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  TIEMPO_COMPLETO: 'Tiempo completo',
  MEDIO_TIEMPO: 'Medio tiempo',
  POR_HORAS: 'Por horas',
};

// ---- Estado ----------------------------------------------------------------
export const STAFF_STATUSES: StaffStatus[] = ['ACTIVO', 'LICENCIA', 'CESADO'];

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  ACTIVO: 'Activo',
  LICENCIA: 'Licencia',
  CESADO: 'Cesado',
};

export const STAFF_STATUS_TONE: Record<StaffStatus, BadgeTone> = {
  ACTIVO: 'success',
  LICENCIA: 'warning',
  CESADO: 'neutral',
};

// ---- Avatar ----------------------------------------------------------------
const AVATAR_COLORS = [
  'var(--blue-500)',
  'var(--gold-500)',
  'var(--green-500)',
  'var(--brown-400)',
  'var(--blue-400)',
];

/** Color estable para el avatar a partir de una semilla (código/id). */
export function avatarColor(seed: string): string {
  let h = 0;
  for (const c of seed) h = (h + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h] ?? 'var(--blue-500)';
}

// ---- Formatos --------------------------------------------------------------
/** Sueldo base (string NUMERIC) → "S/ 1,234.00". */
export function formatSalary(baseSalary: string): string {
  return formatPEN(toCents(baseSalary));
}

/** ISO ("YYYY-MM-DD" o datetime) → "dd/mm/yyyy". Cadena vacía si no hay fecha. */
export function formatHireDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return '—';
  return `${d}/${m}/${y}`;
}

/**
 * Texto del horario de marcación efectivo (ficha):
 * - Individual · 13:00 (tol. 10 min)
 * - Según su grupo · Docentes 07:45 (tol. 15 min)
 */
export function scheduleText(s: StaffEffectiveSchedule): string {
  const tail = `${s.entryTime} (tol. ${s.toleranceMin} min)`;
  return s.source === 'INDIVIDUAL'
    ? `Individual · ${tail}`
    : `Según su grupo · ${s.groupName ?? 'Sin grupo'} ${tail}`;
}
