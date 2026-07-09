// Descuento sobre la pensión (nunca matrícula ni programas). Cálculo puro en centavos.
import { roundHalfUp } from './money';

/**
 * Aplica un porcentaje de descuento a una base en centavos.
 * Redondeo half-up (único punto de redondeo del dominio). percent en 0..100.
 */
export function applyDiscount(baseCents: number, percent: number): number {
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error(`Porcentaje de descuento fuera de rango: ${percent}`);
  }
  return roundHalfUp((baseCents * percent) / 100);
}
