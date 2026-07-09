import { type Prisma } from '@prisma/client';

/**
 * Secuencias de códigos legibles sobre CodeCounter (D: nada hard-codeado, sin gaps por concurrencia).
 * Se llama SIEMPRE dentro de una $transaction: el upsert incrementa atómicamente y
 * formatea con prefijo + relleno de ceros.
 *
 * Ejemplos:
 *   nextCode(tx, 'student', 'E-', 4, 1001)          → "E-1001"
 *   nextCode(tx, 'guardian', 'A-', 4, 201)          → "A-0201"
 *   nextCode(tx, 'enrollment:2026', 'M-2026-', 4)   → "M-2026-0001"
 *
 * @param start valor del PRIMER código cuando el contador aún no existe (por defecto 1).
 */
export async function nextCode(
  tx: Prisma.TransactionClient,
  key: string,
  prefix: string,
  pad: number,
  start = 1,
): Promise<string> {
  const counter = await tx.codeCounter.upsert({
    where: { key },
    create: { key, value: start },
    update: { value: { increment: 1 } },
  });
  return `${prefix}${String(counter.value).padStart(pad, '0')}`;
}
