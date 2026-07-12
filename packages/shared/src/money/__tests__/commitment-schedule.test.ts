import { describe, expect, it } from 'vitest';
import { buildCommitmentDates } from '../commitment-schedule';

describe('buildCommitmentDates — MENSUAL', () => {
  it('mismo día en meses sucesivos', () => {
    expect(buildCommitmentDates(3, '2026-08-15', 'MENSUAL')).toEqual([
      '2026-08-15',
      '2026-09-15',
      '2026-10-15',
    ]);
  });

  it('clamp de fin de mes: 31/01 → 28/02 → 31/03 (conserva el día deseado)', () => {
    expect(buildCommitmentDates(4, '2026-01-31', 'MENSUAL')).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
  });

  it('clamp de febrero bisiesto: 31/01/2028 → 29/02/2028', () => {
    expect(buildCommitmentDates(2, '2028-01-31', 'MENSUAL')).toEqual([
      '2028-01-31',
      '2028-02-29',
    ]);
  });

  it('30/01 → 28/02 y de vuelta 30/03 (no arrastra el clamp)', () => {
    expect(buildCommitmentDates(3, '2026-01-30', 'MENSUAL')).toEqual([
      '2026-01-30',
      '2026-02-28',
      '2026-03-30',
    ]);
  });

  it('cruza el año en meses sucesivos', () => {
    expect(buildCommitmentDates(3, '2026-11-10', 'MENSUAL')).toEqual([
      '2026-11-10',
      '2026-12-10',
      '2027-01-10',
    ]);
  });

  it('count 1 → solo la primera fecha', () => {
    expect(buildCommitmentDates(1, '2026-08-15', 'MENSUAL')).toEqual(['2026-08-15']);
  });
});

describe('buildCommitmentDates — QUINCENAL', () => {
  it('+14 días sucesivos', () => {
    expect(buildCommitmentDates(3, '2026-08-01', 'QUINCENAL')).toEqual([
      '2026-08-01',
      '2026-08-15',
      '2026-08-29',
    ]);
  });

  it('cruza el mes', () => {
    expect(buildCommitmentDates(2, '2026-08-25', 'QUINCENAL')).toEqual([
      '2026-08-25',
      '2026-09-08',
    ]);
  });

  it('cruza el año', () => {
    expect(buildCommitmentDates(2, '2026-12-25', 'QUINCENAL')).toEqual([
      '2026-12-25',
      '2027-01-08',
    ]);
  });

  it('count 6 → seis fechas cada 14 días', () => {
    expect(buildCommitmentDates(6, '2026-03-01', 'QUINCENAL')).toEqual([
      '2026-03-01',
      '2026-03-15',
      '2026-03-29',
      '2026-04-12',
      '2026-04-26',
      '2026-05-10',
    ]);
  });
});

describe('buildCommitmentDates — límites', () => {
  it('count 0 → vacío', () => {
    expect(buildCommitmentDates(0, '2026-08-15', 'MENSUAL')).toEqual([]);
  });
});
