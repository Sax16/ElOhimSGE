import { describe, expect, it } from 'vitest';
import { formatPEN, fromCents, roundHalfUp, toCents } from '../money';

describe('toCents', () => {
  it('parsea strings decimales sin errores de float', () => {
    expect(toCents('280.00')).toBe(28000);
    expect(toCents('0.10')).toBe(10);
    expect(toCents('333.33')).toBe(33333);
    expect(toCents('5')).toBe(500);
    expect(toCents('5.1')).toBe(510);
  });

  it('convierte números redondeando half-up', () => {
    expect(toCents(280)).toBe(28000);
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004
    expect(toCents(1.005)).toBe(101);
  });

  it('rechaza montos malformados', () => {
    expect(() => toCents('12.345')).toThrow();
    expect(() => toCents('abc')).toThrow();
    expect(() => toCents(NaN)).toThrow();
  });
});

describe('fromCents', () => {
  it('produce string decimal de dos dígitos', () => {
    expect(fromCents(28000)).toBe('280.00');
    expect(fromCents(10)).toBe('0.10');
    expect(fromCents(5)).toBe('0.05');
    expect(fromCents(-150)).toBe('-1.50');
  });

  it('es inversa de toCents para strings válidos', () => {
    for (const s of ['0.00', '1.50', '280.00', '99999.99']) {
      expect(fromCents(toCents(s))).toBe(s);
    }
  });
});

describe('roundHalfUp', () => {
  it('redondea .5 hacia arriba', () => {
    expect(roundHalfUp(2.5)).toBe(3);
    expect(roundHalfUp(2.4)).toBe(2);
    expect(roundHalfUp(2.6)).toBe(3);
  });
});

describe('formatPEN', () => {
  it('formatea con prefijo S/ y dos decimales', () => {
    expect(formatPEN(28000)).toMatch(/^S\/ 280[.,]00$/);
    expect(formatPEN(123456)).toMatch(/^S\/ 1[,.]234[.,]56$/);
  });
});
