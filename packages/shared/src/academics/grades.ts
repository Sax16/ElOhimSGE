// Cálculo puro de notas por competencias (R4 — E2). Reglas PURAS y testeables.
// Escala literal AD/A/B/C con valores numéricos AD=4 A=3 B=2 C=1. El "logro del bimestre" de un
// curso es el promedio de sus competencias con redondeo half-up a entero → letra. La "condición"
// se deriva del mismo promedio con umbrales fijos. Sin dependencia de Prisma ni de la API.

import { roundHalfUp } from '../money/money';
import { type CourseCondition, type GradeLetter } from '../enums';

/** Valor numérico de una letra: AD=4, A=3, B=2, C=1. */
export function gradeValue(letter: GradeLetter): number {
  switch (letter) {
    case 'AD':
      return 4;
    case 'A':
      return 3;
    case 'B':
      return 2;
    case 'C':
      return 1;
  }
}

// Valor entero (1..4) → letra.
function valueToLetter(value: number): GradeLetter {
  switch (value) {
    case 4:
      return 'AD';
    case 3:
      return 'A';
    case 2:
      return 'B';
    default:
      return 'C';
  }
}

/**
 * Logro del bimestre de un curso = promedio de las competencias, redondeo half-up a entero → letra.
 * Devuelve null si no hay competencias con nota (array vacío). Ej: [AD, A] → (4+3)/2 = 3.5 → 4 → AD.
 */
export function computeCourseResult(letters: GradeLetter[]): GradeLetter | null {
  if (letters.length === 0) return null;
  const sum = letters.reduce((acc, l) => acc + gradeValue(l), 0);
  const avg = sum / letters.length;
  return valueToLetter(roundHalfUp(avg));
}

/**
 * Condición del curso a partir del promedio de competencias (sin redondear a letra):
 * promedio ≥ 2.5 → LOGRADO, ≥ 1.5 → EN_PROCESO, si no EN_INICIO. Null si no hay competencias.
 */
export function courseCondition(letters: GradeLetter[]): CourseCondition | null {
  if (letters.length === 0) return null;
  const sum = letters.reduce((acc, l) => acc + gradeValue(l), 0);
  const avg = sum / letters.length;
  if (avg >= 2.5) return 'LOGRADO';
  if (avg >= 1.5) return 'EN_PROCESO';
  return 'EN_INICIO';
}
