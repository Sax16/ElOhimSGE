import { type PrismaClient } from '@prisma/client';

// Años académicos base. Sin periodos: los bimestres llegan en Etapa 3.
const YEARS = [
  {
    name: '2025',
    startDate: new Date('2025-03-10'),
    endDate: new Date('2025-12-19'),
    periodType: 'BIMESTRE' as const,
    enrollmentStart: new Date('2025-01-13'),
    status: 'CERRADO' as const,
  },
  {
    name: '2026',
    startDate: new Date('2026-03-09'),
    endDate: new Date('2026-12-18'),
    periodType: 'BIMESTRE' as const,
    enrollmentStart: new Date('2026-01-12'),
    status: 'ACTIVO' as const,
  },
];

export async function seedAcademicYears(prisma: PrismaClient) {
  for (const y of YEARS) {
    await prisma.academicYear.upsert({
      where: { name: y.name },
      update: {},
      create: y,
    });
  }
  console.log(`  ✓ ${YEARS.length} años académicos (2025 cerrado, 2026 activo)`);
}
