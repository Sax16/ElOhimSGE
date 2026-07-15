import { type StaffRole } from '@prisma/client';

// Horario efectivo de referencia si un rol no está cubierto por ningún grupo de marcación.
export const FALLBACK_ENTRY_TIME = '07:45';
export const FALLBACK_TOLERANCE_MIN = 10;

// Datos mínimos del empleado para calcular su horario efectivo.
export interface ScheduleStaff {
  role: StaffRole;
  useIndividualSchedule: boolean;
  individualEntryTime: string | null;
  individualToleranceMin: number | null;
}

export interface MarkingGroupRow {
  name: string;
  entryTime: string;
  toleranceMin: number;
  roles: string[];
}

export interface EffectiveSchedule {
  source: 'INDIVIDUAL' | 'GRUPO';
  groupName: string | null;
  entryTime: string;
  toleranceMin: number;
}

/**
 * Horario efectivo de un empleado (fuente única, compartida por Personal y Marcación):
 * INDIVIDUAL si la ficha lo define; si no, el grupo de marcación que cubre su rol (GRUPO).
 * Sin grupo → GRUPO con groupName null y el fallback defensivo (07:45 / 10 min).
 */
export function effectiveSchedule(
  staff: ScheduleStaff,
  groups: MarkingGroupRow[],
): EffectiveSchedule {
  if (staff.useIndividualSchedule && staff.individualEntryTime && staff.individualToleranceMin !== null) {
    return {
      source: 'INDIVIDUAL',
      groupName: null,
      entryTime: staff.individualEntryTime,
      toleranceMin: staff.individualToleranceMin,
    };
  }
  const group = groups.find((g) => g.roles.includes(staff.role));
  return {
    source: 'GRUPO',
    groupName: group?.name ?? null,
    entryTime: group?.entryTime ?? FALLBACK_ENTRY_TIME,
    toleranceMin: group?.toleranceMin ?? FALLBACK_TOLERANCE_MIN,
  };
}

// "HH:mm" → minutos desde medianoche.
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

/**
 * Tardanza contra un horario (snapshot): es tarde si el ingreso supera entrada + tolerancia.
 * lateMinutes = exceso sobre la HORA DE ENTRADA (no sobre la tolerancia) cuando hay tardanza.
 */
export function computeLateness(
  checkIn: string,
  entryTime: string,
  toleranceMin: number,
): { late: boolean; lateMinutes: number } {
  const inMin = hhmmToMinutes(checkIn);
  const entryMin = hhmmToMinutes(entryTime);
  const late = inMin > entryMin + toleranceMin;
  return { late, lateMinutes: late ? inMin - entryMin : 0 };
}
