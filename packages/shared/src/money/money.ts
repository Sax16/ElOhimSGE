// Dinero en centavos enteros (D4). La BD guarda NUMERIC(10,2); la frontera API convierte.
// Todas las reglas de dinero de packages/shared operan en centavos — exactas y testeables.

export type Cents = number;

/** Redondeo half-up a entero (único punto de redondeo del dominio). */
export function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

/**
 * Convierte un monto decimal (número o string "280.00") a centavos.
 * Para strings parsea sin pasar por float; para números redondea half-up.
 */
export function toCents(amount: number | string): Cents {
  if (typeof amount === 'number') {
    if (!Number.isFinite(amount)) throw new Error(`Monto inválido: ${amount}`);
    // toPrecision(15) corrige el ruido de float antes de redondear (1.005*100 = 100.4999… → 100.5).
    return roundHalfUp(Number((amount * 100).toPrecision(15)));
  }
  const trimmed = amount.trim();
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(trimmed);
  if (!match) throw new Error(`Monto inválido: "${amount}"`);
  const [, sign, whole, decimals = ''] = match;
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, '0'));
  return sign === '-' ? -cents : cents;
}

/** Centavos → string decimal "280.00" (para NUMERIC(10,2) en la API). */
export function fromCents(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.trunc(cents));
  const whole = Math.floor(abs / 100);
  const decimals = String(abs % 100).padStart(2, '0');
  return `${sign}${whole}.${decimals}`;
}

/** Centavos → "S/ 1,234.00" (formato es-PE con prefijo del glosario). */
export function formatPEN(cents: Cents): string {
  const value = Math.trunc(cents) / 100;
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
