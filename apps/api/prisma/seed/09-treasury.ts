import { type PrismaClient } from '@prisma/client';

/**
 * Tesorería (R2 — E4): categorías de gasto/ingreso (idempotentes por [kind, name]) y el fondo
 * fijo de caja chica (singleton id = 1, responsable = usuario secretaria). NO siembra movimientos:
 * los crea el uso real.
 */
export async function seedTreasury(prisma: PrismaClient) {
  const expenseCategories = [
    'Servicios (luz, agua, internet)',
    'Materiales y útiles',
    'Mantenimiento y reparaciones',
    'Infraestructura',
    'Transporte',
    'Trámites y licencias',
    'Planilla y personal',
    'Otros gastos',
  ];
  const incomeCategories = [
    'Impresiones y copias',
    'Alquiler de ambientes',
    'Trámites documentarios',
    'Venta de materiales',
    'Kiosco / cafetería',
    'Donaciones',
    'Otros ingresos',
  ];

  for (const name of expenseCategories) {
    await prisma.treasuryCategory.upsert({
      where: { kind_name: { kind: 'GASTO', name } },
      update: {},
      create: { kind: 'GASTO', name, status: 'ACTIVO' },
    });
  }
  for (const name of incomeCategories) {
    await prisma.treasuryCategory.upsert({
      where: { kind_name: { kind: 'INGRESO', name } },
      update: {},
      create: { kind: 'INGRESO', name, status: 'ACTIVO' },
    });
  }

  // Fondo fijo de caja chica: 500.00, responsable = secretaria (si existe).
  const secretaria = await prisma.user.findUnique({
    where: { username: 'secretaria' },
    select: { id: true },
  });
  await prisma.pettyCashFund.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, amount: '500.00', responsibleId: secretaria?.id ?? null },
  });

  console.log(
    `  ✓ Tesorería: ${expenseCategories.length} categorías de gasto, ${incomeCategories.length} de ingreso, fondo caja chica`,
  );
}
