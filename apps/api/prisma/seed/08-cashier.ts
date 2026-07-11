import { type PrismaClient } from '@prisma/client';

/**
 * Catálogo de "otros conceptos" (libros, uniformes…) para la ventanilla de Caja.
 * Idempotente por nombre. NO siembra sesiones de caja ni recibos: eso lo genera el uso real.
 */
export async function seedCashier(prisma: PrismaClient) {
  const concepts = [
    { name: 'Libros 3° Primaria', price: '120.00' },
    { name: 'Uniforme diario', price: '85.00' },
    { name: 'Buzo institucional', price: '95.00' },
    { name: 'Agenda escolar', price: '25.00' },
  ] as const;

  for (const c of concepts) {
    await prisma.saleConcept.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, price: c.price, status: 'ACTIVO' },
    });
  }
  console.log(`  ✓ Conceptos de venta: ${concepts.length}`);
}
