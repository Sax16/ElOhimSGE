// Piezas compartidas de la pantalla Gastos e ingresos (Tesorería).
import { Select } from '@elohim/ui';
import { toCents } from '@elohim/shared';

export const MONTH_NAMES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Nombre del mes (1..12). */
export function monthName(m: number): string {
  return MONTH_NAMES[m] ?? '';
}

/** Monto decimal con posible signo → { neg, cents } (cents siempre ≥ 0). */
export function signedCents(v: string | null | undefined): { neg: boolean; cents: number } {
  const t = (v ?? '').trim();
  if (!t) return { neg: false, cents: 0 };
  const neg = t.startsWith('-');
  let cents = 0;
  try {
    cents = Math.abs(toCents(t));
  } catch {
    cents = 0;
  }
  return { neg, cents };
}

/** Selector de mes + año compartido por las pestañas Resumen, Gastos e Ingresos. */
export function MonthYearSelect({
  month,
  year,
  onMonth,
  onYear,
}: {
  month: number;
  year: number;
  onMonth: (m: number) => void;
  onYear: (y: number) => void;
}) {
  const thisYear = new Date().getFullYear();
  const years = [thisYear, thisYear - 1, thisYear - 2];
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Select
        label="Mes"
        options={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: MONTH_NAMES[i + 1] ?? '' }))}
        value={String(month)}
        onChange={(e) => onMonth(Number(e.target.value))}
        containerStyle={{ width: 150 }}
      />
      <Select
        label="Año"
        options={years.map((y) => ({ value: String(y), label: String(y) }))}
        value={String(year)}
        onChange={(e) => onYear(Number(e.target.value))}
        containerStyle={{ width: 110 }}
      />
    </div>
  );
}
