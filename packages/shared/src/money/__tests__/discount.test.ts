import { describe, expect, it } from 'vitest';
import { applyDiscount } from '../discount';

describe('applyDiscount', () => {
  it('calcula el descuento con redondeo half-up', () => {
    expect(applyDiscount(28000, 10)).toBe(2800);
    expect(applyDiscount(28000, 50)).toBe(14000);
    expect(applyDiscount(28000, 100)).toBe(28000);
    expect(applyDiscount(28000, 0)).toBe(0);
  });

  it('redondea half-up en montos no exactos', () => {
    // 33333 * 10 / 100 = 3333.3 → 3333
    expect(applyDiscount(33333, 10)).toBe(3333);
    // 12345 * 50 / 100 = 6172.5 → 6173 (half-up)
    expect(applyDiscount(12345, 50)).toBe(6173);
  });

  it('rechaza porcentajes fuera de rango', () => {
    expect(() => applyDiscount(28000, -1)).toThrow();
    expect(() => applyDiscount(28000, 101)).toThrow();
    expect(() => applyDiscount(28000, NaN)).toThrow();
  });
});
