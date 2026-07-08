import { type PrismaClient } from '@prisma/client';

export async function seedInstitution(prisma: PrismaClient) {
  await prisma.institution.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'I.E.P. Elohim — Colegio Cristocéntrico',
      modularCode: '1698340',
      ruc: '20601234567',
      address: 'Jr. Francisco Irazola 590, Satipo',
      phone: '(064) 545-210',
      email: 'informes@elohim.edu.pe',
      region: 'Junín',
      ugel: 'UGEL Satipo',
      motto: 'Educación cristocéntrica, gestión moderna.',
    },
  });
  console.log('  ✓ Institución');
}
