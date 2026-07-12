// Reprogramación de cuotas de un compromiso de pago (R2 — E3). Cálculo PURO, testeable.
// Fechas SIEMPRE como strings yyyy-mm-dd; aritmética civil con Date.UTC (nunca TZ local).

import { type CommitmentFrequency } from '../enums';

/** Último día calendario del mes (1-based) en un año dado, vía Date UTC. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Suma `days` días a una fecha civil yyyy-mm-dd → otra fecha civil yyyy-mm-dd.
 * Usa Date.UTC (no TZ local): aritmética de calendario exacta y estable.
 */
function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const base = Date.UTC(y!, m! - 1, d! + days);
  const result = new Date(base);
  return `${result.getUTCFullYear()}-${pad2(result.getUTCMonth() + 1)}-${pad2(result.getUTCDate())}`;
}

/**
 * Construye las `count` nuevas fechas de vencimiento de un compromiso, a partir de la primera
 * fecha pactada `firstDueDate` (yyyy-mm-dd) y la frecuencia.
 *
 * - MENSUAL: el MISMO día en meses sucesivos, con clamp al último día del mes de destino.
 *   El día deseado se conserva del original (no arrastra el clamp): 31/01 → 28/02 → 31/03.
 * - QUINCENAL: +14 días sucesivos desde la primera fecha (cruza mes y año sin problema).
 *
 * `count` ≥ 1; devuelve exactamente `count` fechas (la primera es siempre `firstDueDate`).
 */
export function buildCommitmentDates(
  count: number,
  firstDueDate: string,
  frequency: CommitmentFrequency,
): string[] {
  if (count < 1) return [];
  const dates: string[] = [];

  if (frequency === 'QUINCENAL') {
    for (let i = 0; i < count; i += 1) {
      dates.push(addDays(firstDueDate, 14 * i));
    }
    return dates;
  }

  // MENSUAL: conserva el día deseado del original y lo acota al fin de cada mes destino.
  const [y, m, d] = firstDueDate.split('-').map(Number);
  const desiredDay = d!;
  for (let i = 0; i < count; i += 1) {
    const monthIndex = m! - 1 + i; // 0-based mes acumulado
    const year = y! + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12) + 1;
    const day = Math.min(desiredDay, daysInMonth(year, month));
    dates.push(`${year}-${pad2(month)}-${pad2(day)}`);
  }
  return dates;
}
