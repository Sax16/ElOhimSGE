import { describe, expect, it } from 'vitest';
import { addDaysISO, isLateFeeEligible, type LateFeeInput } from '../late-fee';

// Cuota base elegible: pensión escolar vencida, sin mora, no exonerada, gracia ya cumplida.
function base(overrides: Partial<LateFeeInput> = {}): LateFeeInput {
  return {
    type: 'PENSION',
    source: 'ESCOLAR',
    status: 'VENCIDO',
    dueDate: '2026-06-30',
    graceDays: 3,
    today: '2026-07-04',
    lateFeeCents: 0,
    exonerated: false,
    ...overrides,
  };
}

describe('addDaysISO — aritmética de fechas civiles', () => {
  it('suma días dentro del mes', () => {
    expect(addDaysISO('2026-06-10', 3)).toBe('2026-06-13');
  });
  it('cruza el fin de mes', () => {
    expect(addDaysISO('2026-06-30', 3)).toBe('2026-07-03');
  });
  it('cruza el fin de año', () => {
    expect(addDaysISO('2026-12-30', 3)).toBe('2027-01-02');
  });
  it('respeta años bisiestos (2028 febrero)', () => {
    expect(addDaysISO('2028-02-28', 1)).toBe('2028-02-29');
  });
  it('suma 0 días devuelve la misma fecha', () => {
    expect(addDaysISO('2026-06-30', 0)).toBe('2026-06-30');
  });
});

describe('isLateFeeEligible — regla de mora fija', () => {
  it('pensión escolar vencida con gracia cumplida → elegible', () => {
    expect(isLateFeeEligible(base())).toBe(true);
  });

  it('acepta también status PENDIENTE (el job aún no materializó VENCIDO)', () => {
    expect(isLateFeeEligible(base({ status: 'PENDIENTE' }))).toBe(true);
  });

  it('límite de gracia exacto: vence 30/06 + gracia 3 → NO elegible el 03/07', () => {
    // dueDate + graceDays = 2026-07-03; elegible solo cuando 2026-07-03 < today.
    expect(isLateFeeEligible(base({ today: '2026-07-03' }))).toBe(false);
  });

  it('límite de gracia exacto: elegible recién el 04/07', () => {
    expect(isLateFeeEligible(base({ today: '2026-07-04' }))).toBe(true);
  });

  it('dentro de la gracia (mismo día del vencimiento) → NO elegible', () => {
    expect(isLateFeeEligible(base({ today: '2026-06-30' }))).toBe(false);
  });

  it('gracia 0: elegible al día siguiente del vencimiento', () => {
    expect(isLateFeeEligible(base({ graceDays: 0, today: '2026-07-01' }))).toBe(true);
    expect(isLateFeeEligible(base({ graceDays: 0, today: '2026-06-30' }))).toBe(false);
  });

  it('matrícula nunca lleva mora', () => {
    expect(isLateFeeEligible(base({ type: 'MATRICULA' }))).toBe(false);
  });

  it('cuota de programa nunca lleva mora', () => {
    expect(isLateFeeEligible(base({ source: 'PROGRAMA' }))).toBe(false);
  });

  it('cuota ya pagada no es elegible', () => {
    expect(isLateFeeEligible(base({ status: 'PAGADO' }))).toBe(false);
  });

  it('cuota anulada no es elegible', () => {
    expect(isLateFeeEligible(base({ status: 'ANULADO' }))).toBe(false);
  });

  it('cuota ya con mora cargada no se recarga', () => {
    expect(isLateFeeEligible(base({ lateFeeCents: 500 }))).toBe(false);
  });

  it('cuota exonerada nunca vuelve a cargar mora', () => {
    expect(isLateFeeEligible(base({ exonerated: true }))).toBe(false);
  });

  it('exonerada aunque siga vencida y sin mora → no elegible', () => {
    expect(isLateFeeEligible(base({ exonerated: true, lateFeeCents: 0 }))).toBe(false);
  });
});
