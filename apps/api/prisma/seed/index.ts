import { PrismaClient } from '@prisma/client';
import { seedInstitution } from './01-institution';
import { seedUsers } from './02-users';
import { seedBilling } from './03-billing';
import { seedAcademicYears } from './04-academic-years';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed Elohim SGE — inicio');
  await seedInstitution(prisma);
  await seedUsers(prisma);
  await seedBilling(prisma);
  await seedAcademicYears(prisma);
  console.log('Seed Elohim SGE — completado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
