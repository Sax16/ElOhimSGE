import { describe, expect, it } from 'vitest';
import {
  computeEssaludCents,
  computeNetCents,
  computePensionContributions,
  computeTardinessDiscountCents,
  type PensionSchemeInput,
} from '../payroll';

// Regímenes del seed (10-staff.ts): ONP 13% y las AFP con fondo 10% + comisión + seguro 1.84%.
const ONP: PensionSchemeInput = { kind: 'ONP', onpRatePct: 13.0 };
const INTEGRA: PensionSchemeInput = {
  kind: 'AFP',
  name: 'AFP Integra',
  fundRatePct: 10.0,
  commissionRatePct: 1.55,
  insuranceRatePct: 1.84,
};
const HABITAT: PensionSchemeInput = {
  kind: 'AFP',
  name: 'AFP Habitat',
  fundRatePct: 10.0,
  commissionRatePct: 1.47,
  insuranceRatePct: 1.84,
};

describe('computePensionContributions — ONP', () => {
  it('ONP 13% sobre S/1800: un solo ítem "ONP (13%)" = 234.00', () => {
    const r = computePensionContributions(180000, ONP);
    expect(r.items).toHaveLength(1);
    expect(r.items[0]).toEqual({ concept: 'ONP (13%)', amountCents: 23400 });
    expect(r.totalCents).toBe(23400);
  });

  it('etiqueta compacta de tasa entera: 13.00 → "13%"', () => {
    expect(computePensionContributions(100000, ONP).items[0]!.concept).toBe('ONP (13%)');
  });

  it('gross 0 → aporte 0', () => {
    const r = computePensionContributions(0, ONP);
    expect(r.totalCents).toBe(0);
    expect(r.items[0]!.amountCents).toBe(0);
  });
});

describe('computePensionContributions — AFP Integra (S/1800)', () => {
  const r = computePensionContributions(180000, INTEGRA);
  it('tres ítems: fondo, comisión, seguro con conceptos exactos', () => {
    expect(r.items.map((i) => i.concept)).toEqual([
      'AFP Integra · fondo (10%)',
      'AFP Integra · comisión (1.55%)',
      'AFP Integra · seguro (1.84%)',
    ]);
  });
  it('fondo 10% = 180.00', () => {
    expect(r.items[0]!.amountCents).toBe(18000);
  });
  it('comisión 1.55% = 27.90', () => {
    expect(r.items[1]!.amountCents).toBe(2790);
  });
  it('seguro 1.84% = 33.12', () => {
    expect(r.items[2]!.amountCents).toBe(3312);
  });
  it('total = 241.02', () => {
    expect(r.totalCents).toBe(24102);
  });
});

describe('computePensionContributions — AFP Habitat (S/1500, redondeos a mano)', () => {
  // fondo 10% de 1500 = 150.00; comisión 1.47% = 22.05; seguro 1.84% = 27.60.
  const r = computePensionContributions(150000, HABITAT);
  it('fondo = 150.00', () => {
    expect(r.items[0]!.amountCents).toBe(15000);
  });
  it('comisión 1.47% de 1500 = 22.05', () => {
    expect(r.items[1]!.amountCents).toBe(2205);
  });
  it('seguro 1.84% de 1500 = 27.60', () => {
    expect(r.items[2]!.amountCents).toBe(2760);
  });
  it('total = 199.65', () => {
    expect(r.totalCents).toBe(19965);
  });
});

describe('computePensionContributions — redondeo half-up por concepto', () => {
  it('1.55% de 1333.33 (133333 cts) = 2066.6615 → 2067 cts (half-up)', () => {
    // 133333 * 1.55 / 100 = 2066.6615 → floor(2066.6615 + 0.5) = 2067
    const r = computePensionContributions(133333, INTEGRA);
    expect(r.items[1]!.amountCents).toBe(2067);
  });

  it('tasa 100% retiene todo el bruto', () => {
    const r = computePensionContributions(50000, { kind: 'ONP', onpRatePct: 100 });
    expect(r.totalCents).toBe(50000);
  });

  it('tasa 0% no retiene nada', () => {
    const r = computePensionContributions(50000, { kind: 'ONP', onpRatePct: 0 });
    expect(r.items[0]).toEqual({ concept: 'ONP (0%)', amountCents: 0 });
    expect(r.totalCents).toBe(0);
  });

  it('etiqueta con decimal no entero: 1.50 → "1.5%"', () => {
    const r = computePensionContributions(100000, {
      kind: 'AFP',
      name: 'AFP X',
      fundRatePct: 10,
      commissionRatePct: 1.5,
      insuranceRatePct: 1.84,
    });
    expect(r.items[1]!.concept).toBe('AFP X · comisión (1.5%)');
  });
});

describe('computeTardinessDiscountCents', () => {
  const rule = { enabled: true, threshold: 3, amountCents: 2000 };

  it('conteo bajo el umbral → 0', () => {
    expect(computeTardinessDiscountCents(2, rule)).toBe(0);
  });
  it('conteo en el umbral exacto → aplica', () => {
    expect(computeTardinessDiscountCents(3, rule)).toBe(2000);
  });
  it('conteo sobre el umbral → aplica (una sola vez)', () => {
    expect(computeTardinessDiscountCents(7, rule)).toBe(2000);
  });
  it('regla desactivada → 0 aunque supere el umbral', () => {
    expect(computeTardinessDiscountCents(9, { ...rule, enabled: false })).toBe(0);
  });
  it('umbral 1: una tardanza ya descuenta', () => {
    expect(computeTardinessDiscountCents(1, { enabled: true, threshold: 1, amountCents: 500 })).toBe(500);
  });
  it('cero tardanzas → 0', () => {
    expect(computeTardinessDiscountCents(0, rule)).toBe(0);
  });
});

describe('computeNetCents', () => {
  it('neto normal: 1800 − 241.02 (aportes) − 0 = 1558.98', () => {
    expect(computeNetCents(180000, 24102, 0)).toBe(155898);
  });
  it('con descuento: 1800 − 234 (ONP) − 200 = 1366', () => {
    expect(computeNetCents(180000, 23400, 20000)).toBe(136600);
  });
  it('clamp a 0: descuentos + aportes superan el bruto', () => {
    expect(computeNetCents(10000, 8000, 5000)).toBe(0);
  });
  it('bruto 0 → neto 0', () => {
    expect(computeNetCents(0, 0, 0)).toBe(0);
  });
});

describe('computeEssaludCents', () => {
  it('9% de 1800 = 162.00', () => {
    expect(computeEssaludCents(180000, 9)).toBe(16200);
  });
  it('9% de 1500 = 135.00', () => {
    expect(computeEssaludCents(150000, 9)).toBe(13500);
  });
  it('gross 0 → 0', () => {
    expect(computeEssaludCents(0, 9)).toBe(0);
  });
  it('tasa 0 → 0', () => {
    expect(computeEssaludCents(180000, 0)).toBe(0);
  });
});
