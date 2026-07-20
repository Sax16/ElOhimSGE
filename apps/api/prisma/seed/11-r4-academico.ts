import { type PrismaClient, type StudentAttendanceStatus } from '@prisma/client';

// Académico (R4 — E1): asignación docente (curso × sección) y asistencia demo de estudiantes.
// Idempotente (upserts). No genera registros de HOY, para poder probar la toma en vivo.

// yyyy-mm-dd → Date UTC medianoche (columnas @db.Date).
const isoToDate = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`);

// Fecha civil de hoy en Lima (UTC−5) → yyyy-mm-dd.
function limaTodayISO(now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(now); // en-CA → "yyyy-mm-dd"
}

// Últimos `count` días hábiles (L–V) estrictamente ANTERIORES a hoy, en orden cronológico.
function businessDaysBeforeToday(count: number): string[] {
  const days: string[] = [];
  let cursor = isoToDate(limaTodayISO());
  while (days.length < count) {
    cursor = new Date(cursor.getTime() - 86_400_000);
    const dow = cursor.getUTCDay(); // 0 dom … 6 sáb
    if (dow >= 1 && dow <= 5) days.push(cursor.toISOString().slice(0, 10));
  }
  return days.reverse();
}

// Estado determinista derivado de un hash estable de (enrollmentId + fecha): mayoría PRESENTE.
function deterministicStatus(key: string): StudentAttendanceStatus {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const n = h % 100;
  if (n < 8) return 'FALTA'; // ~8%
  if (n < 16) return 'TARDANZA'; // ~8%
  if (n < 20) return 'JUSTIFICADA'; // ~4%
  return 'PRESENTE'; // ~80%
}

export async function seedR4Academico(prisma: PrismaClient) {
  const year2026 = await prisma.academicYear.findUnique({ where: { name: '2026' } });
  if (!year2026) throw new Error('Falta el año 2026 — corre primero el seed 04-academic-years');

  // ----- Asignación docente (curso × sección): teacherId = Staff docente -----
  // "El docente es un empleado": la asignación apunta a un Staff con cargo docente (ACTIVO). Reparto
  // determinista round-robin POR CURSO (orden por nivel/grado/nombre); el mismo docente-staff cubre
  // todas las secciones del grado (mismo docente en A y B), como antes.
  const docenteStaff = await prisma.staff.findMany({
    where: { role: 'DOCENTE', status: 'ACTIVO' },
    select: { id: true },
    orderBy: { code: 'asc' },
  });
  const staffIds = docenteStaff.map((s) => s.id);
  let rr = 0;
  const nextTeacher = () => (staffIds.length ? staffIds[rr++ % staffIds.length]! : null);

  const courses = await prisma.course.findMany({
    where: { gradeLevel: { level: { academicYearId: year2026.id } } },
    orderBy: [
      { gradeLevel: { level: { order: 'asc' } } },
      { gradeLevel: { order: 'asc' } },
      { name: 'asc' },
    ],
    select: { id: true, gradeLevelId: true },
  });

  // gradeLevelId → sectionIds.
  const sections = await prisma.section.findMany({
    where: { gradeLevel: { level: { academicYearId: year2026.id } } },
    select: { id: true, gradeLevelId: true },
  });
  const sectionsByGrade = new Map<string, string[]>();
  for (const s of sections) {
    const list = sectionsByGrade.get(s.gradeLevelId) ?? [];
    list.push(s.id);
    sectionsByGrade.set(s.gradeLevelId, list);
  }

  let assignmentCount = 0;
  for (const course of courses) {
    const teacherId = nextTeacher();
    if (!teacherId) break;
    const gradeSections = sectionsByGrade.get(course.gradeLevelId) ?? [];
    for (const sectionId of gradeSections) {
      await prisma.courseAssignment.upsert({
        where: { courseId_sectionId: { courseId: course.id, sectionId } },
        update: { teacherId },
        create: { courseId: course.id, sectionId, teacherId },
      });
      assignmentCount += 1;
    }
  }

  // ----- Asistencia demo: 4 secciones de Primaria, últimos ~10 días hábiles antes de hoy -----
  const docente = await prisma.user.findUnique({ where: { username: 'docente' }, select: { id: true } });
  if (!docente) throw new Error('Falta el usuario docente — corre primero el seed 02-users');

  const primariaSections = await prisma.section.findMany({
    where: { gradeLevel: { level: { academicYearId: year2026.id, name: 'Primaria' } } },
    orderBy: [{ gradeLevel: { order: 'asc' } }, { name: 'asc' }],
    // El tutor es un Staff; markedBy debe ser un User (actor de auditoría) → se usa el usuario
    // vinculado al tutor, o el usuario 'docente' como respaldo.
    select: { id: true, tutor: { select: { userId: true } } },
    take: 4,
  });

  const days = businessDaysBeforeToday(10);
  let entryCount = 0;
  for (const section of primariaSections) {
    const markedById = section.tutor?.userId ?? docente.id;
    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId: section.id,
        canceledAt: null,
        academicYearId: year2026.id,
        student: { status: { in: ['ACTIVO', 'BECADO'] } },
      },
      select: { id: true },
    });

    for (const iso of days) {
      const dateObj = isoToDate(iso);
      for (const enrollment of enrollments) {
        const status = deterministicStatus(`${enrollment.id}|${iso}`);
        await prisma.studentAttendanceEntry.upsert({
          where: { enrollmentId_date: { enrollmentId: enrollment.id, date: dateObj } },
          update: {},
          create: { enrollmentId: enrollment.id, date: dateObj, status, markedById },
        });
        entryCount += 1;
      }
    }
  }

  console.log(
    `  ✓ Académico R4: ${assignmentCount} asignaciones docente, ${entryCount} registros de asistencia demo (${primariaSections.length} secciones × ${days.length} días)`,
  );
}
