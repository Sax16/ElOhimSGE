import { describe, expect, it } from 'vitest';
import { computeCourseResult, courseCondition, gradeValue } from '../grades';

describe('gradeValue', () => {
  it('mapea cada letra a su valor numérico', () => {
    expect(gradeValue('AD')).toBe(4);
    expect(gradeValue('A')).toBe(3);
    expect(gradeValue('B')).toBe(2);
    expect(gradeValue('C')).toBe(1);
  });
});

describe('computeCourseResult', () => {
  it('devuelve null cuando no hay competencias', () => {
    expect(computeCourseResult([])).toBeNull();
  });

  it('una sola competencia se refleja tal cual', () => {
    expect(computeCourseResult(['A'])).toBe('A');
    expect(computeCourseResult(['AD'])).toBe('AD');
    expect(computeCourseResult(['C'])).toBe('C');
  });

  it('promedia varias competencias iguales', () => {
    expect(computeCourseResult(['A', 'A', 'A'])).toBe('A');
  });

  it('redondea half-up: 2.5 → 3 → A', () => {
    // [AD, B] → (4+2)/2 = 3 → A ; [A, B] → (3+2)/2 = 2.5 → 3 → A
    expect(computeCourseResult(['A', 'B'])).toBe('A');
  });

  it('AD + A promedia 3.5 → 4 → AD', () => {
    expect(computeCourseResult(['AD', 'A'])).toBe('AD');
  });

  it('B + C promedia 1.5 → 2 → B', () => {
    expect(computeCourseResult(['B', 'C'])).toBe('B');
  });

  it('mayoría baja arrastra el promedio hacia abajo', () => {
    // [C, C, B] → (1+1+2)/3 = 1.33 → 1 → C
    expect(computeCourseResult(['C', 'C', 'B'])).toBe('C');
  });

  it('cuatro competencias CNEB mixtas', () => {
    // [AD, A, A, B] → (4+3+3+2)/4 = 3 → A
    expect(computeCourseResult(['AD', 'A', 'A', 'B'])).toBe('A');
  });
});

describe('courseCondition', () => {
  it('devuelve null sin competencias', () => {
    expect(courseCondition([])).toBeNull();
  });

  it('promedio ≥ 2.5 → LOGRADO', () => {
    expect(courseCondition(['A', 'B'])).toBe('LOGRADO'); // 2.5
    expect(courseCondition(['AD', 'AD'])).toBe('LOGRADO'); // 4
  });

  it('promedio en [1.5, 2.5) → EN_PROCESO', () => {
    expect(courseCondition(['B', 'C'])).toBe('EN_PROCESO'); // 1.5
    expect(courseCondition(['B', 'B'])).toBe('EN_PROCESO'); // 2
  });

  it('promedio < 1.5 → EN_INICIO', () => {
    expect(courseCondition(['C', 'C'])).toBe('EN_INICIO'); // 1
    expect(courseCondition(['C', 'C', 'B'])).toBe('EN_INICIO'); // 1.33
  });
});
