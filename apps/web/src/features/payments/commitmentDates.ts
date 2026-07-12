// Cálculo cliente de las nuevas fechas de un compromiso — SOLO para la vista
// previa del diálogo «Proponer compromiso». La verdad la fija el backend; esto
// reproduce su regla para que Secretaría vea el plan antes de proponer:
// mensual = mismo día en meses sucesivos con clamp a fin de mes; quincenal = +14 días.

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Suma `i` meses a una fecha civil 'yyyy-mm-dd' con clamp al último día del mes. */
export function addMonthsClamp(iso: string, i: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  const monthIndex = m - 1 + i;
  const year = y + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12; // 0-based, normalizado
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(d, lastDay);
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** Suma `days` días a una fecha civil 'yyyy-mm-dd'. */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

/** Nuevas fechas por cuota (en orden), según frecuencia y primera fecha pactada. */
export function commitmentDates(
  firstDueDate: string,
  frequency: 'MENSUAL' | 'QUINCENAL',
  count: number,
): string[] {
  return Array.from({ length: Math.max(0, count) }, (_, i) =>
    frequency === 'MENSUAL' ? addMonthsClamp(firstDueDate, i) : addDays(firstDueDate, i * 14),
  );
}

/** Fecha civil de MAÑANA como 'yyyy-mm-dd' en hora local (mínimo de la primera cuota). */
export function tomorrowLocalISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
