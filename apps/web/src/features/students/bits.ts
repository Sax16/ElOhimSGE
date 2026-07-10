// Utilidades compartidas de la feature Estudiantes.
import type { BadgeTone } from '@elohim/ui';
import type { StudentStatus } from '@elohim/shared';
import { useYearStore } from '../../stores/year.store';
import { useYears } from '../structure/api';

/** Tono de badge por estado del estudiante (vocabulario del glosario). */
export const STUDENT_STATUS_TONE: Record<StudentStatus, BadgeTone> = {
  ACTIVO: 'success',
  BECADO: 'brand',
  RETIRADO: 'neutral',
  TRASLADADO: 'neutral',
  EGRESADO: 'neutral',
  RESERVADO: 'info',
};

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

/** "Apellidos Nombres" — orden de listados escolares (paterno + materno opcional + nombres). */
export function fullName(p: {
  firstNames: string;
  paternalLastName: string;
  maternalLastName?: string | null;
}): string {
  const apellidos = `${p.paternalLastName}${p.maternalLastName ? ` ${p.maternalLastName}` : ''}`;
  return `${apellidos} ${p.firstNames}`.trim();
}

/**
 * ¿El año seleccionado está cerrado? Bloquea mutaciones (mismo criterio que Estructura).
 * Un año cerrado es solo lectura a nivel API; aquí se refleja en la UI.
 */
export function useYearReadOnly(): boolean {
  const selectedYearName = useYearStore((s) => s.selectedYearName);
  const years = useYears().data ?? [];
  const activeYear = years.find((y) => y.status === 'ACTIVO') ?? null;
  const currentName = selectedYearName ?? activeYear?.name ?? '';
  const selectedYear = years.find((y) => y.name === currentName) ?? activeYear ?? years[0] ?? null;
  return selectedYear?.status === 'CERRADO';
}
