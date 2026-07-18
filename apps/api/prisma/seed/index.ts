import { PrismaClient } from '@prisma/client';
import { seedInstitution } from './01-institution';
import { seedUsers } from './02-users';
import { seedBilling } from './03-billing';
import { seedAcademicYears } from './04-academic-years';
import { seedStructure2026 } from './05-structure-2026';
import { seedStudentsGuardians } from './06-students-guardians';
import { seedInstallments } from './07-installments';
import { seedCashier } from './08-cashier';
import { seedTreasury } from './09-treasury';
import { seedStaff } from './10-staff';
import { seedR4Academico } from './11-r4-academico';
import { seedR4Notas } from './12-r4-notas';
import { seedR4Conducta } from './13-r4-conducta';

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
  await seedTreasury(prisma);
  await seedStaff(prisma);
  await seedR4Academico(prisma);
  await seedR4Notas(prisma);
  await seedR4Conducta(prisma);
  console.log('Seed Elohim SGE — completado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
