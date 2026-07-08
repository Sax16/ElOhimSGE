import { type PrismaClient, type Shift } from '@prisma/client';

// Docentes del seed 02 (role DOCENTE): se reparten como tutores y docentes de curso.
const DOCENTE_NAMES = [
  'Pedro Gómez Silva',
  'Lucía Díaz Paredes',
  'Mario Silva Chávez',
  'Carmen Rojas Vega',
  'Jorge Mendoza Ríos',
  'Elena Castro Salas',
  'Raúl Torres Ninanya',
];

type SectionSeed = { name: string; shift: Shift; capacity: number };
type GradeSeed = { name: string; order: number; sections: SectionSeed[] };
type LevelSeed = {
  name: string;
  description: string;
  order: number;
  fee: { enrollmentFee: string; monthlyFee: string; installmentsCount: number };
  courses: { name: string; weeklyHours: number }[];
  grades: GradeSeed[];
};

const REGULAR_COURSES = [
  { name: 'Matemática', weeklyHours: 6 },
  { name: 'Comunicación', weeklyHours: 6 },
  { name: 'Ciencia y Tecnología', weeklyHours: 4 },
  { name: 'Personal Social', weeklyHours: 3 },
  { name: 'Inglés', weeklyHours: 3 },
  { name: 'Educación Física', weeklyHours: 2 },
  { name: 'Arte y Cultura', weeklyHours: 2 },
  { name: 'Educación Religiosa', weeklyHours: 2 },
];

const INICIAL_COURSES = [
  { name: 'Comunicación', weeklyHours: 5 },
  { name: 'Matemática', weeklyHours: 5 },
  { name: 'Personal Social', weeklyHours: 3 },
  { name: 'Psicomotricidad', weeklyHours: 3 },
];

// Secciones A/B por grado (Primaria/Secundaria): capacidad 30, mayoría mañana.
function abSections(tardeB = false): SectionSeed[] {
  return [
    { name: 'A', shift: 'MANANA', capacity: 30 },
    { name: 'B', shift: tardeB ? 'TARDE' : 'MANANA', capacity: 30 },
  ];
}

const LEVELS_2026: LevelSeed[] = [
  {
    name: 'Inicial',
    description: '3–5 años',
    order: 1,
    fee: { enrollmentFee: '200.00', monthlyFee: '250.00', installmentsCount: 10 },
    courses: INICIAL_COURSES,
    grades: [
      { name: '3 años', order: 1, sections: [{ name: 'Los Pollitos', shift: 'MANANA', capacity: 25 }] },
      { name: '4 años', order: 2, sections: [{ name: 'Los Girasoles', shift: 'MANANA', capacity: 25 }] },
      {
        name: '5 años',
        order: 3,
        sections: [
          { name: 'Las Estrellitas', shift: 'MANANA', capacity: 25 },
          { name: 'Los Delfines', shift: 'MANANA', capacity: 25 },
        ],
      },
    ],
  },
  {
    name: 'Primaria',
    description: '1° – 6°',
    order: 2,
    fee: { enrollmentFee: '250.00', monthlyFee: '280.00', installmentsCount: 10 },
    courses: REGULAR_COURSES,
    grades: [1, 2, 3, 4, 5, 6].map((g, i) => ({
      name: `${g}°`,
      order: i + 1,
      sections: abSections(g === 1), // 1° B en la tarde
    })),
  },
  {
    name: 'Secundaria',
    description: '1° – 5°',
    order: 3,
    fee: { enrollmentFee: '280.00', monthlyFee: '310.00', installmentsCount: 10 },
    courses: REGULAR_COURSES,
    grades: [1, 2, 3, 4, 5].map((g, i) => ({
      name: `${g}°`,
      order: i + 1,
      sections: abSections(g === 4), // 4° B en la tarde
    })),
  },
];

const PROGRAMS_2026 = [
  {
    name: 'Taller de Danza',
    type: 'TALLER' as const,
    scheduleText: 'Sáb 9:00–11:00',
    capacity: 25,
    enrollmentFee: '0.00',
    monthlyFee: '60.00',
    status: 'ACTIVO' as const,
  },
  {
    name: 'Taller de Música',
    type: 'TALLER' as const,
    scheduleText: 'Vie 15:30–17:00',
    capacity: 20,
    enrollmentFee: '0.00',
    monthlyFee: '70.00',
    status: 'ACTIVO' as const,
  },
  {
    name: 'Reforzamiento · Matemática',
    type: 'REFORZAMIENTO' as const,
    scheduleText: 'Lun y Mié 15:00–16:30',
    capacity: 30,
    enrollmentFee: '0.00',
    monthlyFee: '80.00',
    status: 'ACTIVO' as const,
  },
  {
    name: 'Academia Pre verano',
    type: 'ACADEMIA' as const,
    scheduleText: 'Ene–Feb 8:00–12:00',
    capacity: 40,
    enrollmentFee: '100.00',
    monthlyFee: '150.00',
    status: 'CERRADO' as const,
  },
];

const PERIODS_2026 = [
  { name: 'Bimestre I', order: 1, startDate: '2026-03-09', endDate: '2026-05-15', status: 'CERRADO' as const },
  { name: 'Bimestre II', order: 2, startDate: '2026-05-18', endDate: '2026-07-24', status: 'EN_CURSO' as const },
  { name: 'Bimestre III', order: 3, startDate: '2026-08-10', endDate: '2026-10-16', status: 'PROXIMO' as const },
  { name: 'Bimestre IV', order: 4, startDate: '2026-10-19', endDate: '2026-12-18', status: 'PROXIMO' as const },
];

// Estructura mínima 2025 (año CERRADO) para probar el candado de solo lectura.
const PERIODS_2025 = [
  { name: 'Bimestre I', order: 1, startDate: '2025-03-10', endDate: '2025-05-16', status: 'CERRADO' as const },
  { name: 'Bimestre II', order: 2, startDate: '2025-05-19', endDate: '2025-07-25', status: 'CERRADO' as const },
  { name: 'Bimestre III', order: 3, startDate: '2025-08-11', endDate: '2025-10-17', status: 'CERRADO' as const },
  { name: 'Bimestre IV', order: 4, startDate: '2025-10-20', endDate: '2025-12-19', status: 'CERRADO' as const },
];

export async function seedStructure2026(prisma: PrismaClient) {
  const year2026 = await prisma.academicYear.findUnique({ where: { name: '2026' } });
  const year2025 = await prisma.academicYear.findUnique({ where: { name: '2025' } });
  if (!year2026 || !year2025) {
    throw new Error('Faltan los años 2025/2026 — corre primero el seed 04-academic-years');
  }

  // Docentes: mapa fullName → id, con rotación round-robin para tutores y cursos.
  const docentes = await prisma.user.findMany({
    where: { role: 'DOCENTE', fullName: { in: DOCENTE_NAMES } },
    select: { id: true },
    orderBy: { fullName: 'asc' },
  });
  const teacherIds = docentes.map((d) => d.id);
  let rr = 0;
  const nextTeacher = () =>
    teacherIds.length ? teacherIds[rr++ % teacherIds.length] : null;

  let levelCount = 0;
  let gradeCount = 0;
  let sectionCount = 0;
  let courseCount = 0;

  // ----- Periodos 2026 -----
  for (const p of PERIODS_2026) {
    await prisma.period.upsert({
      where: { academicYearId_order: { academicYearId: year2026.id, order: p.order } },
      update: {},
      create: {
        academicYearId: year2026.id,
        name: p.name,
        order: p.order,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
        status: p.status,
      },
    });
  }

  // ----- Estructura 2026 -----
  for (const level of LEVELS_2026) {
    const dbLevel = await prisma.level.upsert({
      where: { academicYearId_name: { academicYearId: year2026.id, name: level.name } },
      update: {},
      create: {
        academicYearId: year2026.id,
        name: level.name,
        description: level.description,
        order: level.order,
      },
    });
    levelCount += 1;

    await prisma.levelFee.upsert({
      where: { levelId: dbLevel.id },
      update: {},
      create: {
        levelId: dbLevel.id,
        enrollmentFee: level.fee.enrollmentFee,
        monthlyFee: level.fee.monthlyFee,
        installmentsCount: level.fee.installmentsCount,
      },
    });

    for (const grade of level.grades) {
      const dbGrade = await prisma.gradeLevel.upsert({
        where: { levelId_name: { levelId: dbLevel.id, name: grade.name } },
        update: {},
        create: { levelId: dbLevel.id, name: grade.name, order: grade.order },
      });
      gradeCount += 1;

      for (const section of grade.sections) {
        await prisma.section.upsert({
          where: {
            gradeLevelId_name_shift: {
              gradeLevelId: dbGrade.id,
              name: section.name,
              shift: section.shift,
            },
          },
          update: {},
          create: {
            gradeLevelId: dbGrade.id,
            name: section.name,
            shift: section.shift,
            capacity: section.capacity,
            tutorId: nextTeacher(),
          },
        });
        sectionCount += 1;
      }

      for (const course of level.courses) {
        await prisma.course.upsert({
          where: { gradeLevelId_name: { gradeLevelId: dbGrade.id, name: course.name } },
          update: {},
          create: {
            gradeLevelId: dbGrade.id,
            name: course.name,
            weeklyHours: course.weeklyHours,
            teacherId: nextTeacher(),
          },
        });
        courseCount += 1;
      }
    }
  }

  // ----- Programas 2026 -----
  for (const program of PROGRAMS_2026) {
    await prisma.program.upsert({
      where: { academicYearId_name: { academicYearId: year2026.id, name: program.name } },
      update: {},
      create: { academicYearId: year2026.id, ...program },
    });
  }

  // ----- Estructura mínima 2025 (año cerrado) -----
  for (const p of PERIODS_2025) {
    await prisma.period.upsert({
      where: { academicYearId_order: { academicYearId: year2025.id, order: p.order } },
      update: {},
      create: {
        academicYearId: year2025.id,
        name: p.name,
        order: p.order,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
        status: p.status,
      },
    });
  }

  const level2025 = await prisma.level.upsert({
    where: { academicYearId_name: { academicYearId: year2025.id, name: 'Primaria' } },
    update: {},
    create: { academicYearId: year2025.id, name: 'Primaria', description: '1° – 6°', order: 1 },
  });
  const grade2025 = await prisma.gradeLevel.upsert({
    where: { levelId_name: { levelId: level2025.id, name: '1°' } },
    update: {},
    create: { levelId: level2025.id, name: '1°', order: 1 },
  });
  await prisma.section.upsert({
    where: {
      gradeLevelId_name_shift: { gradeLevelId: grade2025.id, name: 'A', shift: 'MANANA' },
    },
    update: {},
    create: { gradeLevelId: grade2025.id, name: 'A', shift: 'MANANA', capacity: 30 },
  });

  console.log(
    `  ✓ Estructura 2026 (${levelCount} niveles, ${gradeCount} grados, ${sectionCount} secciones, ${courseCount} cursos, ${PROGRAMS_2026.length} programas, 4 periodos) + estructura mínima 2025`,
  );
}
