import { describe, expect, it } from 'vitest';
import { billableMonths } from '../proration';

const YEAR_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // marzo..diciembre (10 cuotas)

describe('billableMonths', () => {
  it('incluye el mes de ingreso cuando el día cae dentro del corte', () => {
    // entryDate 2026-08-17, corte 20 → agosto SÍ (ago..dic = 5 meses)
    expect(billableMonths(YEAR_MONTHS, '2026-08-17', 20)).toEqual([8, 9, 10, 11, 12]);
  });

  it('excluye el mes de ingreso cuando el día pasa el corte', () => {
    // entryDate 2026-08-21, corte 20 → agosto NO (sep..dic = 4 meses)
    expect(billableMonths(YEAR_MONTHS, '2026-08-21', 20)).toEqual([9, 10, 11, 12]);
  });

  it('respeta un corte configurable más estricto', () => {
    // entryDate 2026-08-17, corte 15 → agosto NO (sep..dic = 4 meses)
    expect(billableMonths(YEAR_MONTHS, '2026-08-17', 15)).toEqual([9, 10, 11, 12]);
  });

  it('el día de corte exacto se incluye', () => {
    expect(billableMonths(YEAR_MONTHS, '2026-08-20', 20)).toEqual([8, 9, 10, 11, 12]);
  });

  it('descarta meses anteriores al de ingreso', () => {
    expect(billableMonths(YEAR_MONTHS, '2026-11-05', 20)).toEqual([11, 12]);
    expect(billableMonths(YEAR_MONTHS, '2026-12-25', 20)).toEqual([]);
  });

  it('parsea la fecha como string, sin depender de la zona horaria', () => {
    // 2026-03-01 con corte 20 → incluye marzo aunque sea el primer día
    expect(billableMonths(YEAR_MONTHS, '2026-03-01', 20)).toEqual(YEAR_MONTHS);
  });
});
