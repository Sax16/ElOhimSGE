import { type PrismaClient } from '@prisma/client';

export async function seedBilling(prisma: PrismaClient) {
  await prisma.billingSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      lateFeeAmount: '5.00',
      graceDays: 3,
      transferCutoffDay: 20,
      autoLateFee: true,
      dueDayOfMonth: null, // último día del mes
    },
  });

  const discounts = [
    {
      code: 'HERMANOS',
      name: 'Descuento hermanos',
      percent: '10.00',
      application: 'AUTOMATICO',
      condition: 'Desde el 2° hijo matriculado',
      status: 'ACTIVO',
    },
    {
      code: 'BECA_PARCIAL',
      name: 'Beca parcial',
      percent: '50.00',
      application: 'MANUAL',
      condition: 'Evaluación socioeconómica anual',
      status: 'ACTIVO',
    },
    {
      code: 'BECA_COMPLETA',
      name: 'Beca completa',
      percent: '100.00',
      application: 'MANUAL',
      condition: 'Aprobación de dirección',
      status: 'ACTIVO',
    },
    {
      code: 'PRONTO_PAGO',
      name: 'Pronto pago',
      percent: '5.00',
      application: 'AUTOMATICO',
      condition: 'Pago antes del día 5 del mes',
      status: 'INACTIVO',
    },
  ] as const;

  for (const d of discounts) {
    await prisma.discount.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
  }
  console.log('  ✓ Configuración de cobranza + 4 descuentos');
}
