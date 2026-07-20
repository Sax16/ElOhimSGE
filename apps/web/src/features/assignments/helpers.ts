// Utilidades compartidas por las vistas de Asignación docente (Por sección /
// Por docente). Etiquetas, entradas de sección y umbral de carga.
import type { AssignmentOptions, OptionTeacher } from './types';

/** Umbral de carga alta (horas semanales por docente). */
export const HIGH_LOAD = 16;

/** "3° · Primaria" + "A · Mañana" → "3° A · Primaria" (misma etiqueta que la grilla). */
export function sectionDisplay(gradeLabel: string, sectionLabel: string): string {
  const gp = gradeLabel.split('·').map((s) => s.trim());
  const gradeNum = gp[0] ?? gradeLabel;
  const level = gp[1];
  const sectionName = sectionLabel.split('·')[0]?.trim() ?? sectionLabel;
  return level ? `${gradeNum} ${sectionName} · ${level}` : `${gradeNum} ${sectionName}`;
}

export interface SectionEntry {
  sectionId: string;
  gradeLevelId: string;
  gradeLabel: string; // crudo "3° · Primaria"
  display: string; // "3° A · Primaria"
  courses: { id: string; name: string; weeklyHours: number }[];
}

/** Aplana options.grades → una entrada por sección, con los cursos del grado
 *  ordenados alfabéticamente. Conserva el orden de options.grades (nivel →
 *  grado, como la grilla de horarios) en vez de ordenar alfabéticamente, que
 *  mezclaría Inicial/Primaria/Secundaria. */
export function buildSectionEntries(options: AssignmentOptions | undefined): SectionEntry[] {
  const out: SectionEntry[] = [];
  for (const g of options?.grades ?? []) {
    const courses = [...g.courses].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    for (const s of g.sections) {
      out.push({
        sectionId: s.id,
        gradeLevelId: g.gradeLevelId,
        gradeLabel: g.label,
        display: sectionDisplay(g.label, s.label),
        courses,
      });
    }
  }
  return out;
}

/** Índice teacherId → { code, status } para pintar P-### y marcar licencias. */
export function teacherIndex(options: AssignmentOptions | undefined): Map<string, OptionTeacher> {
  const map = new Map<string, OptionTeacher>();
  for (const t of options?.teachers ?? []) map.set(t.id, t);
  return map;
}
