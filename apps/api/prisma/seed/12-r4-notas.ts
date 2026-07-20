import { type PrismaClient, type GradeLetter } from '@prisma/client';
import { computeCourseResult } from '@elohim/shared';

// Académico (R4 — E2): catálogo de aspectos + competencias CNEB por curso, y notas demo.
// Idempotente (upserts). Letras deterministas por hash estable → mayoría A, algunos AD/B, pocos C.

// Aspectos de la libreta (orden 1..3 por tipo).
const ASPECTS: { kind: 'FORMATIVO' | 'APODERADO'; name: string; order: number }[] = [
  { kind: 'FORMATIVO', name: 'Comportamiento', order: 1 },
  { kind: 'FORMATIVO', name: 'Uniformidad', order: 2 },
  { kind: 'FORMATIVO', name: 'Puntualidad', order: 3 },
  { kind: 'APODERADO', name: 'Asiste a reuniones', order: 1 },
  { kind: 'APODERADO', name: 'Acompañamiento en casa', order: 2 },
  { kind: 'APODERADO', name: 'Comunicación con el tutor', order: 3 },
];

// Competencias CNEB reales por nombre de curso (se aplican a todos los grados que tengan ese curso).
const COMPETENCIES_BY_COURSE: Record<string, string[]> = {
  Matemática: [
    'Resuelve problemas de cantidad',
    'Resuelve problemas de regularidad, equivalencia y cambio',
    'Resuelve problemas de forma, movimiento y localización',
    'Resuelve problemas de gestión de datos e incertidumbre',
  ],
  Comunicación: [
    'Se comunica oralmente en su lengua materna',
    'Lee diversos tipos de textos escritos',
    'Escribe diversos tipos de textos',
  ],
  'Ciencia y Tecnología': [
    'Indaga mediante métodos científicos para construir sus conocimientos',
    'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía',
    'Diseña y construye soluciones tecnológicas para resolver problemas',
  ],
  'Personal Social': [
    'Construye su identidad',
    'Convive y participa democráticamente en la búsqueda del bien común',
    'Construye interpretaciones históricas',
    'Gestiona responsablemente el espacio y el ambiente',
    'Gestiona responsablemente los recursos económicos',
  ],
  Inglés: [
    'Se comunica oralmente en inglés como lengua extranjera',
    'Lee diversos tipos de textos escritos en inglés',
    'Escribe diversos tipos de textos en inglés',
  ],
  'Educación Física': [
    'Se desenvuelve de manera autónoma a través de su motricidad',
    'Asume una vida saludable',
    'Interactúa a través de sus habilidades sociomotrices',
  ],
  'Arte y Cultura': [
    'Aprecia de manera crítica manifestaciones artístico-culturales',
    'Crea proyectos desde los lenguajes artísticos',
  ],
  'Educación Religiosa': [
    'Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente',
    'Asume la experiencia del encuentro personal y comunitario con Dios',
  ],
  Psicomotricidad: ['Se desenvuelve de manera autónoma a través de su motricidad'],
};

const FALLBACK_COMPETENCIES = ['Competencia 1', 'Competencia 2', 'Competencia 3'];

// Hash estable → entero 0..99.
function hash100(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h % 100;
}

// Letra determinista: mayoría A, algunos AD/B, pocos C.
function deterministicLetter(key: string): GradeLetter {
  const n = hash100(key);
  if (n < 10) return 'AD'; // ~10%
  if (n < 75) return 'A'; // ~65%
  if (n < 92) return 'B'; // ~17%
  return 'C'; // ~8%
}

export async function seedR4Notas(prisma: PrismaClient) {
  const year2026 = await prisma.academicYear.findUnique({ where: { name: '2026' } });
  if (!year2026) throw new Error('Falta el año 2026 — corre primero el seed 04-academic-years');

  // ----- Aspectos -----
  for (const a of ASPECTS) {
    await prisma.evaluationAspect.upsert({
      where: { kind_name: { kind: a.kind, name: a.name } },
      update: { order: a.order },
      create: { kind: a.kind, name: a.name, order: a.order },
    });
  }

  // ----- Competencias por curso (todos los cursos del año activo) -----
  const courses = await prisma.course.findMany({
    where: { gradeLevel: { level: { academicYearId: year2026.id } } },
    select: { id: true, name: true },
  });
  let competencyCount = 0;
  for (const course of courses) {
    const names = COMPETENCIES_BY_COURSE[course.name] ?? FALLBACK_COMPETENCIES;
    for (const [i, name] of names.entries()) {
      await prisma.courseCompetency.upsert({
        where: { courseId_name: { courseId: course.id, name } },
        update: { order: i + 1 },
        create: { courseId: course.id, name, order: i + 1 },
      });
      competencyCount += 1;
    }
  }

  // ----- Notas demo -----
  const docente = await prisma.user.findUnique({ where: { username: 'docente' }, select: { id: true } });
  if (!docente) throw new Error('Falta el usuario docente — corre primero el seed 02-users');

  const [bimI, bimII] = await Promise.all([
    prisma.period.findFirst({ where: { academicYearId: year2026.id, order: 1 }, select: { id: true } }),
    prisma.period.findFirst({ where: { academicYearId: year2026.id, order: 2 }, select: { id: true } }),
  ]);
  if (!bimI || !bimII) throw new Error('Faltan los bimestres 2026 — corre primero el seed 05-structure');

  // Mismas 3 secciones de Primaria con matrículas de la asistencia demo.
  // El tutor y el docente de curso son ahora Staff; gradedById debe ser un User (actor de auditoría),
  // así que se resuelve el usuario vinculado al Staff (Staff.userId), con 'docente' como respaldo.
  const sections = await prisma.section.findMany({
    where: { gradeLevel: { level: { academicYearId: year2026.id, name: 'Primaria' } } },
    orderBy: [{ gradeLevel: { order: 'asc' } }, { name: 'asc' }],
    select: { id: true, tutor: { select: { userId: true } }, gradeLevelId: true },
    take: 3,
  });

  const activeAspects = await prisma.evaluationAspect.findMany({
    where: { active: true },
    select: { id: true },
  });

  let gradeEntryCount = 0;
  let resultCount = 0;
  let aspectGradeCount = 0;

  for (const section of sections) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId: section.id,
        canceledAt: null,
        academicYearId: year2026.id,
        student: { status: { in: ['ACTIVO', 'BECADO'] } },
      },
      select: { id: true },
    });
    if (enrollments.length === 0) continue;

    // Cursos del grado con sus competencias, orden alfabético.
    const gradeCourses = await prisma.course.findMany({
      where: { gradeLevelId: section.gradeLevelId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        competencies: { orderBy: { order: 'asc' }, select: { id: true } },
        assignments: {
          where: { sectionId: section.id },
          select: { teacher: { select: { userId: true } } },
          take: 1,
        },
      },
    });

    const bimICourses = gradeCourses.slice(0, 3); // completo en 3 cursos
    const bimIICourses = gradeCourses.slice(0, 2); // parcial en 2 cursos

    // ----- Bimestre I (CERRADO): notas completas + logro auto -----
    for (const course of bimICourses) {
      const gradedById = course.assignments[0]?.teacher?.userId ?? section.tutor?.userId ?? docente.id;
      for (const enrollment of enrollments) {
        const letters: GradeLetter[] = [];
        for (const comp of course.competencies) {
          const letter = deterministicLetter(`${enrollment.id}|${course.id}|${comp.id}|B1`);
          letters.push(letter);
          await prisma.gradeEntry.upsert({
            where: {
              enrollmentId_courseId_periodId_competencyId: {
                enrollmentId: enrollment.id,
                courseId: course.id,
                periodId: bimI.id,
                competencyId: comp.id,
              },
            },
            update: { letter, gradedById },
            create: {
              enrollmentId: enrollment.id,
              courseId: course.id,
              periodId: bimI.id,
              competencyId: comp.id,
              letter,
              gradedById,
            },
          });
          gradeEntryCount += 1;
        }
        const auto = computeCourseResult(letters);
        if (auto) {
          await prisma.courseResult.upsert({
            where: {
              enrollmentId_courseId_periodId: {
                enrollmentId: enrollment.id,
                courseId: course.id,
                periodId: bimI.id,
              },
            },
            update: { letter: auto, auto: true, gradedById },
            create: {
              enrollmentId: enrollment.id,
              courseId: course.id,
              periodId: bimI.id,
              letter: auto,
              auto: true,
              gradedById,
            },
          });
          resultCount += 1;
        }
      }
    }

    // ----- Aspectos Bimestre I (completos, los registra el tutor) -----
    const aspectGradedBy = section.tutor?.userId ?? docente.id;
    for (const enrollment of enrollments) {
      for (const aspect of activeAspects) {
        const letter = deterministicLetter(`${enrollment.id}|${aspect.id}|B1`);
        await prisma.aspectGrade.upsert({
          where: {
            enrollmentId_periodId_aspectId: {
              enrollmentId: enrollment.id,
              periodId: bimI.id,
              aspectId: aspect.id,
            },
          },
          update: { letter, gradedById: aspectGradedBy },
          create: {
            enrollmentId: enrollment.id,
            periodId: bimI.id,
            aspectId: aspect.id,
            letter,
            gradedById: aspectGradedBy,
          },
        });
        aspectGradeCount += 1;
      }
    }

    // ----- Bimestre II (EN_CURSO): captura parcial (~60% de estudiantes completos) -----
    for (const course of bimIICourses) {
      const gradedById = course.assignments[0]?.teacher?.userId ?? section.tutor?.userId ?? docente.id;
      for (const enrollment of enrollments) {
        // ~60% de los estudiantes ya tienen notas del bimestre en curso.
        if (hash100(`${enrollment.id}|${course.id}|B2`) >= 60) continue;
        const letters: GradeLetter[] = [];
        for (const comp of course.competencies) {
          const letter = deterministicLetter(`${enrollment.id}|${course.id}|${comp.id}|B2`);
          letters.push(letter);
          await prisma.gradeEntry.upsert({
            where: {
              enrollmentId_courseId_periodId_competencyId: {
                enrollmentId: enrollment.id,
                courseId: course.id,
                periodId: bimII.id,
                competencyId: comp.id,
              },
            },
            update: { letter, gradedById },
            create: {
              enrollmentId: enrollment.id,
              courseId: course.id,
              periodId: bimII.id,
              competencyId: comp.id,
              letter,
              gradedById,
            },
          });
          gradeEntryCount += 1;
        }
        const auto = computeCourseResult(letters);
        if (auto) {
          await prisma.courseResult.upsert({
            where: {
              enrollmentId_courseId_periodId: {
                enrollmentId: enrollment.id,
                courseId: course.id,
                periodId: bimII.id,
              },
            },
            update: { letter: auto, auto: true, gradedById },
            create: {
              enrollmentId: enrollment.id,
              courseId: course.id,
              periodId: bimII.id,
              letter: auto,
              auto: true,
              gradedById,
            },
          });
          resultCount += 1;
        }
      }
    }
  }

  console.log(
    `  ✓ Notas R4: ${ASPECTS.length} aspectos, ${competencyCount} competencias, ${gradeEntryCount} notas, ${resultCount} logros, ${aspectGradeCount} aspectos calificados (${sections.length} secciones)`,
  );
}
