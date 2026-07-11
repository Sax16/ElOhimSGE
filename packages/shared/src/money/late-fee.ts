// Elegibilidad de mora por atraso (R2 — E2). Regla PURA, testeable, sin Date con TZ.
// La mora es FIJA y de una sola vez: se carga a la cuota vencida pasados los días de gracia.
// SOLO aplica a cuotas de PENSIÓN de enseñanza regular (source ESCOLAR); matrícula y programas nunca.

export interface LateFeeInput {
  type: 'MATRICULA' | 'PENSION';
  source: 'ESCOLAR' | 'PROGRAMA';
  status: string; // InstallmentStatus como string ('PENDIENTE' | 'VENCIDO' | ...)
  dueDate: string; // yyyy-mm-dd
  graceDays: number; // días de gracia tras el vencimiento (BillingSettings)
  today: string; // yyyy-mm-dd (fecha civil de hoy)
  lateFeeCents: number; // mora ya cargada en centavos (0 = sin cargar aún)
  exonerated: boolean; // true = mora exonerada (el job no debe recargar)
}

/**
 * Suma `days` días a una fecha civil yyyy-mm-dd y devuelve otra fecha civil yyyy-mm-dd.
 * Usa Date.UTC (no TZ local): la aritmética de calendario es exacta y estable.
 */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const base = Date.UTC(y!, m! - 1, d! + days);
  const result = new Date(base);
  const yy = result.getUTCFullYear();
  const mm = String(result.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(result.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * ¿Corresponde cargar la mora fija a esta cuota?
 *
 * true SOLO si:
 * - type === 'PENSION' y source === 'ESCOLAR' (enseñanza regular);
 * - status PENDIENTE o VENCIDO (no PAGADO/ANULADO/EXONERADO);
 * - lateFeeCents === 0 (no se carga dos veces);
 * - !exonerated (una exoneración congela la mora);
 * - dueDate + graceDays < today (venció y ya pasaron los días de gracia).
 *
 * Comparación de fechas como strings yyyy-mm-dd (orden lexicográfico = orden cronológico).
 * Ejemplo: vence 2026-06-30, gracia 3 → elegible recién cuando today ≥ 2026-07-04.
 */
export function isLateFeeEligible(i: LateFeeInput): boolean {
  if (i.type !== 'PENSION') return false;
  if (i.source !== 'ESCOLAR') return false;
  if (i.status !== 'PENDIENTE' && i.status !== 'VENCIDO') return false;
  if (i.lateFeeCents !== 0) return false;
  if (i.exonerated) return false;
  return addDaysISO(i.dueDate, i.graceDays) < i.today;
}
