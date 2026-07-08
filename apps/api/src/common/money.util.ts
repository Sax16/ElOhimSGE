import { Prisma } from '@prisma/client';
import { type Cents, fromCents, toCents } from '@elohim/shared';

/**
 * Frontera de dinero (D4): la BD guarda NUMERIC(10,2) (Prisma.Decimal);
 * las reglas de packages/shared operan en centavos enteros.
 */
export function decimalToCents(value: Prisma.Decimal | string | number): Cents {
  return toCents(typeof value === 'number' ? value : value.toString());
}

export function centsToDecimal(cents: Cents): Prisma.Decimal {
  return new Prisma.Decimal(fromCents(cents));
}
