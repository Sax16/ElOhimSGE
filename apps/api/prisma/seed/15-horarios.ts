import { type PrismaClient, type Shift } from '@prisma/client';

// Grilla de horarios (post-R4): plantillas de bloques por nivel+turno + horario demo de dos
// secciones (3° A y 3° B · Primaria) sin choques de docente. Idempotente.

type BlockSeed = { order: number; startTime: string; endTime: string; isBreak?: boolean; label?: string };

// Primaria/Secundaria — Mañana.
const REGULAR_MANANA: BlockSeed[] = [
  { order: 1, startTime: '07:45', endTime: '08:30' },
  { order: 2, startTime: '08:30', endTime: '09:15' },
  { order: 3, startTime: '09:15', endTime: '10:00' },
  { order: 4, startTime: '10:00', endTime: '10:20', isBreak: true, label: 'Recreo' },
  { order: 5, startTime: '10:20', endTime: '11:05' },
  { order: 6, startTime: '11:05', endTime: '11:50' },
  { order: 7, startTime: '11:50', endTime: '12:35' },
];

// Inicial — Mañana (sin secciones de tarde en el seed).
const INICIAL_MANANA: BlockSeed[] = [
  { order: 1, startTime: '08:00', endTime: '08:45' },
  { order: 2, startTime: '08:45', endTime: '09:30' },
  { order: 3, startTime: '09:30', endTime: '10:00', isBreak: true, label: 'Recreo y lonchera' },
  { order: 4, startTime: '10:00', endTime: '10:45' },
  { order: 5, startTime: '10:45', endTime: '11:30' },
];

const DAYS = [1, 2, 3, 4, 5]; // lunes..viernes

// Plantillas a sembrar por nombre de nivel + turno. El colegio aún no maneja
// turno tarde: no se siembran plantillas TARDE (la funcionalidad queda — el
// Admin las creará en Horarios → Bloques horarios cuando se necesiten).
const TEMPLATES: { level: string; shift: Shift; blocks: BlockSeed[] }[] = [
  { level: 'Inicial', shift: 'MANANA', blocks: INICIAL_MANANA },
  { level: 'Primaria', shift: 'MANANA', blocks: REGULAR_MANANA },
  { level: 'Secundaria', shift: 'MANANA', blocks: REGULAR_MANANA },
];

export async function seedHorarios(prisma: PrismaClient) {
  const year2026 = await prisma.academicYear.findUnique({ where: { name: '2026' } });
  if (!year2026) throw new Error('Falta el año 2026 — corre primero el seed 04-academic-years');

  const admin = await prisma.user.findUnique({ where: { username: 'admin' }, select: { id: true } });
  if (!admin) throw new Error('Falta el usuario admin — corre primero el seed 02-users');

  // ----- Plantillas de bloques -----
  const levels = await prisma.level.findMany({
    where: { academicYearId: year2026.id },
    select: { id: true, name: true },
  });
  const levelByName = new Map(levels.map((l) => [l.name, l.id]));

  // El colegio aún no maneja turno tarde: retira las plantillas TARDE sembradas
  // antes, solo si no tienen clases programadas (si el Admin ya las usó, se respetan).
  const removedTarde = await prisma.scheduleBlock.deleteMany({
    where: {
      shift: 'TARDE',
      levelId: { in: levels.map((l) => l.id) },
      slots: { none: {} },
    },
  });
  if (removedTarde.count > 0) {
    console.log(`  ✓ Horarios: ${removedTarde.count} bloques de turno tarde retirados (sin uso)`);
  }

  let blockCount = 0;
  for (const tpl of TEMPLATES) {
    const levelId = levelByName.get(tpl.level);
    if (!levelId) continue;
    for (const b of tpl.blocks) {
      await prisma.scheduleBlock.upsert({
        where: { levelId_shift_order: { levelId, shift: tpl.shift, order: b.order } },
        update: { startTime: b.startTime, endTime: b.endTime, isBreak: b.isBreak ?? false, label: b.label ?? null },
        create: {
          levelId,
          shift: tpl.shift,
          order: b.order,
          startTime: b.startTime,
          endTime: b.endTime,
          isBreak: b.isBreak ?? false,
          label: b.label ?? null,
        },
      });
      blockCount += 1;
    }
  }

  // ----- Horario demo: 3° A y 3° B · Primaria (Mañana) -----
  const grade3 = await prisma.gradeLevel.findFirst({
    where: { name: '3°', level: { academicYearId: year2026.id, name: 'Primaria' } },
    select: { id: true },
  });
  if (!grade3) {
    console.log(`  ✓ Horarios: ${blockCount} bloques (sin 3° Primaria para horario demo)`);
    return;
  }

  const sections = await prisma.section.findMany({
    where: { gradeLevelId: grade3.id, shift: 'MANANA' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  const secA = sections.find((s) => s.name === 'A');
  const secB = sections.find((s) => s.name === 'B');

  const primariaLevelId = levelByName.get('Primaria');
  const teachingBlocks = await prisma.scheduleBlock.findMany({
    where: { levelId: primariaLevelId, shift: 'MANANA', isBreak: false },
    orderBy: { order: 'asc' },
    select: { id: true },
  });

  // Cursos del grado (orden estable por nombre) + demanda por weeklyHours.
  const courses = await prisma.course.findMany({
    where: { gradeLevelId: grade3.id },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, weeklyHours: true },
  });
  // Docente por curso: se deriva de CourseAssignment (curso × sección) — ya no de Course.teacherId.
  // El mismo docente-staff cubre A y B, así que basta el teacherId de cualquier asignación del curso.
  const gradeSectionIds = sections.map((s) => s.id);
  const assignments = await prisma.courseAssignment.findMany({
    where: { sectionId: { in: gradeSectionIds }, course: { gradeLevelId: grade3.id } },
    select: { courseId: true, teacherId: true },
  });
  const teacherOf = new Map<string, string | null>(courses.map((c) => [c.id, null]));
  for (const a of assignments) teacherOf.set(a.courseId, a.teacherId);

  // Celdas (día × bloque) en orden día-mayor.
  const cells: { dayOfWeek: number; blockId: string }[] = [];
  for (const day of DAYS) for (const b of teachingBlocks) cells.push({ dayOfWeek: day, blockId: b.id });

  // Cola intercalada: una hora de cada curso por ronda hasta agotar weeklyHours (capada a nº de celdas).
  const remainingA = new Map(courses.map((c) => [c.id, c.weeklyHours]));
  const queueA: string[] = [];
  let progress = true;
  while (progress && queueA.length < cells.length) {
    progress = false;
    for (const c of courses) {
      const left = remainingA.get(c.id) ?? 0;
      if (left > 0 && queueA.length < cells.length) {
        queueA.push(c.id);
        remainingA.set(c.id, left - 1);
        progress = true;
      }
    }
  }

  // Sección A: asigna la cola a las celdas en orden.
  const slotsA = queueA.map((courseId, i) => ({ ...cells[i]!, courseId }));
  const courseAt = new Map(slotsA.map((s) => [`${s.dayOfWeek}:${s.blockId}`, s.courseId]));

  // Sección B: mismo multiset; por celda elige un curso cuyo docente difiera del de A (misma hora).
  const remainingB = new Map(courses.map((c) => [c.id, c.weeklyHours]));
  const slotsB: { dayOfWeek: number; blockId: string; courseId: string }[] = [];
  for (const cell of cells) {
    const aCourse = courseAt.get(`${cell.dayOfWeek}:${cell.blockId}`);
    const aTeacher = aCourse ? teacherOf.get(aCourse) ?? null : null;
    // Candidatos con horas restantes y docente distinto al de A en esa celda; el más demandado primero.
    const candidate = courses
      .filter((c) => (remainingB.get(c.id) ?? 0) > 0 && teacherOf.get(c.id) !== aTeacher)
      .sort((x, y) => (remainingB.get(y.id) ?? 0) - (remainingB.get(x.id) ?? 0))[0];
    if (!candidate) continue; // sin candidato válido → celda vacía (weeklyHours es solo informativo)
    slotsB.push({ ...cell, courseId: candidate.id });
    remainingB.set(candidate.id, (remainingB.get(candidate.id) ?? 0) - 1);
  }

  // Verificación propia: ningún docente en dos secciones a la misma hora (bloques idénticos → mismo blockId).
  const seen = new Set<string>();
  for (const s of [...slotsA, ...slotsB]) {
    const t = teacherOf.get(s.courseId);
    if (!t) continue;
    const key = `${t}:${s.dayOfWeek}:${s.blockId}`;
    if (seen.has(key)) throw new Error(`Choque de docente en el horario demo: ${key}`);
    seen.add(key);
  }

  // Escribe (idempotente): reemplaza el horario de A y B.
  let slotCount = 0;
  for (const [section, slots] of [
    [secA, slotsA],
    [secB, slotsB],
  ] as const) {
    if (!section) continue;
    await prisma.scheduleSlot.deleteMany({ where: { sectionId: section.id } });
    for (const s of slots) {
      await prisma.scheduleSlot.create({
        data: {
          sectionId: section.id,
          dayOfWeek: s.dayOfWeek,
          blockId: s.blockId,
          courseId: s.courseId,
          createdById: admin.id,
        },
      });
      slotCount += 1;
    }
  }

  console.log(
    `  ✓ Horarios: ${blockCount} bloques de plantilla + ${slotCount} celdas demo (3° A/B · Primaria, sin choques)`,
  );
}
