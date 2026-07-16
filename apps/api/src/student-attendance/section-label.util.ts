import { SHIFT_LABELS, type Shift, type StudentAttendanceStatus } from '@elohim/shared';
import { isoToDate } from '../common/installment-view.util';

// Forma mínima de una sección para construir etiquetas (grado + nivel + turno).
export interface SectionLabelParts {
  name: string; // "A" | "Los Girasoles"
  shift: Shift;
  gradeLevel: { name: string; level: { name: string } };
}

// "3° A · Primaria"
export function sectionFullLabel(s: SectionLabelParts): string {
  return `${s.gradeLevel.name} ${s.name} · ${s.gradeLevel.level.name}`;
}

// "3° · Primaria"
export function gradeLabel(gradeName: string, levelName: string): string {
  return `${gradeName} · ${levelName}`;
}

// "A · Mañana"
export function sectionShortLabel(name: string, shift: Shift): string {
  return `${name} · ${SHIFT_LABELS[shift]}`;
}

// Día hábil = lunes a viernes. Las columnas @db.Date guardan UTC medianoche → getUTCDay es estable.
export function isBusinessDayISO(iso: string): boolean {
  const day = isoToDate(iso).getUTCDay(); // 0 dom … 6 sáb
  return day >= 1 && day <= 5;
}

// Contadores por estado en cero.
export function emptyCounts(): Record<StudentAttendanceStatus, number> {
  return { PRESENTE: 0, TARDANZA: 0, FALTA: 0, JUSTIFICADA: 0 };
}
