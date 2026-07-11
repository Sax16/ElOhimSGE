import { PrismaClient } from '@prisma/client';
import { seedInstitution } from './01-institution';
import { seedUsers } from './02-users';
import { seedBilling } from './03-billing';
import { seedAcademicYears } from './04-academic-years';
import { seedStructure2026 } from './05-structure-2026';
import { seedStudentsGuardians } from './06-students-guardians';
import { seedInstallments } from './07-installments';
import { seedCashier } from './08-cashier';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed Elohim SGE — inicio');
  await seedInstitution(prisma);
  await seedUsers(prisma);
  await seedBilling(prisma);
  await seedAcademicYears(prisma);
  await seedStructure2026(prisma);
  await seedStudentsGuardians(prisma);
  await seedInstallments(prisma);
  await seedCashier(prisma);
  console.log('Seed Elohim SGE — completado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
