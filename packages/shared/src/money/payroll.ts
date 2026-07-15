// Cálculo puro de planilla (R3 — E3). Reglas PURAS, testeables, en centavos enteros.
// La frontera API convierte Decimal(10,2) ↔ centavos (money.util). Redondeo half-up por concepto:
// único punto de redondeo del dominio (roundHalfUp de money.ts).
//
// Solo planilla mensual: sueldo bruto, aportes pensionarios (ONP/AFP), descuentos (tardanzas +
// manuales), neto. EsSalud (9% a cargo del colegio) se calcula aparte — no descuenta al trabajador.

import { roundHalfUp, type Cents } from './money';

/** Régimen pensionario (snapshot de tasas como number en %, 2 decimales). */
export type PensionSchemeInput =
  | { kind: 'ONP'; onpRatePct: number }
  | {
      kind: 'AFP';
      name: string;
      fundRatePct: number;
      commissionRatePct: number;
      insuranceRatePct: number;
    };

export interface PensionContribItem {
  concept: string;
  amountCents: Cents;
}

export interface PensionContributions {
  items: PensionContribItem[];
  totalCents: Cents;
}

/** Tasa en % a etiqueta compacta: 13.00 → "13%", 1.55 → "1.55%", 1.50 → "1.5%". */
function pctLabel(pct: number): string {
  return `${Number(pct.toFixed(2)).toString()}%`;
}

/**
 * pct% de un monto en centavos, con redondeo half-up.
 * toPrecision(15) corrige el ruido de float antes de redondear (igual que money.toCents).
 */
function pctOfCents(grossCents: Cents, pct: number): Cents {
  if (grossCents === 0 || pct === 0) return 0;
  return roundHalfUp(Number(((grossCents * pct) / 100).toPrecision(15)));
}

/**
 * Aportes pensionarios retenidos al trabajador, un ítem por concepto de la boleta.
 * ONP → un solo concepto "ONP (13%)". AFP → fondo / comisión / seguro con las tasas reales.
 * El total es la suma de los ítems ya redondeados (no se redondea el total aparte).
 */
export function computePensionContributions(
  grossCents: Cents,
  scheme: PensionSchemeInput,
): PensionContributions {
  const items: PensionContribItem[] = [];
  if (scheme.kind === 'ONP') {
    items.push({
      concept: `ONP (${pctLabel(scheme.onpRatePct)})`,
      amountCents: pctOfCents(grossCents, scheme.onpRatePct),
    });
  } else {
    items.push({
      concept: `${scheme.name} · fondo (${pctLabel(scheme.fundRatePct)})`,
      amountCents: pctOfCents(grossCents, scheme.fundRatePct),
    });
    items.push({
      concept: `${scheme.name} · comisión (${pctLabel(scheme.commissionRatePct)})`,
      amountCents: pctOfCents(grossCents, scheme.commissionRatePct),
    });
    items.push({
      concept: `${scheme.name} · seguro (${pctLabel(scheme.insuranceRatePct)})`,
      amountCents: pctOfCents(grossCents, scheme.insuranceRatePct),
    });
  }
  const totalCents = items.reduce((sum, i) => sum + i.amountCents, 0);
  return { items, totalCents };
}

/**
 * Descuento por tardanzas acumuladas: el monto fijo de la regla si está activa y el conteo del
 * periodo alcanza el umbral; si no, 0. La NO-duplicación por periodo la maneja el service.
 */
export function computeTardinessDiscountCents(
  lateCount: number,
  rule: { enabled: boolean; threshold: number; amountCents: Cents },
): Cents {
  return rule.enabled && lateCount >= rule.threshold ? rule.amountCents : 0;
}

/**
 * Neto a pagar = bruto − aportes − descuentos, nunca negativo (clamp a 0).
 * El service valida antes que un descuento no deje el neto negativo; el clamp es la última red.
 */
export function computeNetCents(
  grossCents: Cents,
  contribTotalCents: Cents,
  discountTotalCents: Cents,
): Cents {
  return Math.max(0, grossCents - contribTotalCents - discountTotalCents);
}

/** EsSalud (a cargo del colegio, no descuenta al trabajador): ratePct% del bruto, half-up. */
export function computeEssaludCents(grossCents: Cents, ratePct: number): Cents {
  return pctOfCents(grossCents, ratePct);
}
