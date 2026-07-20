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
import { seedR4Calendario } from './14-r4-calendario';
import { seedHorarios } from './15-horarios';
import { seedPortal } from './16-portal';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed Elohim SGE — inicio');
  await seedInstitution(prisma);
  await seedUsers(prisma);
  // El personal se siembra ANTES de la estructura: el tutor de aula es un empleado (Staff) con cargo
  // docente, así que 05-structure necesita las fichas docentes ya vinculadas a sus usuarios.
  await seedStaff(prisma);
  await seedBilling(prisma);
  await seedAcademicYears(prisma);
  await seedStructure2026(prisma);
  await seedStudentsGuardians(prisma);
  await seedInstallments(prisma);
  await seedCashier(prisma);
  await seedTreasury(prisma);
  await seedR4Academico(prisma);
  await seedR4Notas(prisma);
  await seedR4Conducta(prisma);
  await seedR4Calendario(prisma);
  await seedHorarios(prisma);
  await seedPortal(prisma);
  console.log('Seed Elohim SGE — completado');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
