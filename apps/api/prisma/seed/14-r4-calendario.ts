import {
  type PrismaClient,
  type CalendarEventType,
} from '@prisma/client';

// Académico (R4 — E4): calendario académico (feriados nacionales 2026 + demo) y comunicados demo.
// Idempotente: eventos por clave estable (año + nombre + fecha de inicio); comunicados por code.

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

interface EventSpec {
  type: CalendarEventType;
  name: string;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd (== startDate para un solo día)
  description?: string;
}

// Feriados nacionales del Perú 2026 que caen de marzo a diciembre (lista oficial). Semana Santa
// (Jueves y Viernes Santo) como un rango. Editables/eliminables por Admin.
const HOLIDAYS_2026: EventSpec[] = [
  { type: 'FERIADO', name: 'Semana Santa (Jueves y Viernes Santo)', startDate: '2026-04-02', endDate: '2026-04-03' },
  { type: 'FERIADO', name: 'Día del Trabajo', startDate: '2026-05-01', endDate: '2026-05-01' },
  { type: 'FERIADO', name: 'Día de la Bandera (Batalla de Arica)', startDate: '2026-06-07', endDate: '2026-06-07' },
  { type: 'FERIADO', name: 'San Pedro y San Pablo', startDate: '2026-06-29', endDate: '2026-06-29' },
  { type: 'FERIADO', name: 'Día de la Fuerza Aérea del Perú', startDate: '2026-07-23', endDate: '2026-07-23' },
  { type: 'FERIADO', name: 'Fiestas Patrias', startDate: '2026-07-28', endDate: '2026-07-29' },
  { type: 'FERIADO', name: 'Batalla de Junín', startDate: '2026-08-06', endDate: '2026-08-06' },
  { type: 'FERIADO', name: 'Santa Rosa de Lima', startDate: '2026-08-30', endDate: '2026-08-30' },
  { type: 'FERIADO', name: 'Combate de Angamos', startDate: '2026-10-08', endDate: '2026-10-08' },
  { type: 'FERIADO', name: 'Día de Todos los Santos', startDate: '2026-11-01', endDate: '2026-11-01' },
  { type: 'FERIADO', name: 'Inmaculada Concepción', startDate: '2026-12-08', endDate: '2026-12-08' },
  { type: 'FERIADO', name: 'Batalla de Ayacucho', startDate: '2026-12-09', endDate: '2026-12-09' },
  { type: 'FERIADO', name: 'Navidad', startDate: '2026-12-25', endDate: '2026-12-25' },
];

export async function seedR4Calendario(prisma: PrismaClient) {
  const year2026 = await prisma.academicYear.findUnique({
    where: { name: '2026' },
    select: { id: true },
  });
  if (!year2026) throw new Error('Falta el año 2026 — corre primero el seed 04-academic-years');

  const admin = await prisma.user.findUnique({ where: { username: 'admin' }, select: { id: true } });
  if (!admin) throw new Error('Falta el usuario admin — corre primero el seed 02-users');

  // ===== Eventos del calendario =====
  const specs: EventSpec[] = [...HOLIDAYS_2026];

  // 1 ACTIVIDAD demo (fecha fija próxima al inicio del ciclo de trabajo).
  specs.push({
    type: 'ACTIVIDAD',
    name: 'Aniversario de Satipo — festival folclórico',
    startDate: '2026-08-15',
    endDate: '2026-08-15',
    description: 'Festival folclórico por el aniversario de la ciudad de Satipo. Participan todos los niveles.',
  });

  // 1 EXAMEN demo dentro del Bimestre III (order = 3), rango de 5 días desde su inicio + 20 días.
  const bimIII = await prisma.period.findFirst({
    where: { academicYearId: year2026.id, order: 3 },
    select: { startDate: true, endDate: true },
  });
  if (bimIII) {
    const start = new Date(bimIII.startDate.getTime() + 20 * 86_400_000);
    let end = new Date(start.getTime() + 4 * 86_400_000);
    if (end > bimIII.endDate) end = bimIII.endDate;
    specs.push({
      type: 'EXAMEN',
      name: 'Exámenes Bimestre III',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      description: 'Evaluaciones de fin de bimestre en todas las áreas.',
    });
  }

  let eventCount = 0;
  for (const spec of specs) {
    const data = {
      academicYearId: year2026.id,
      type: spec.type,
      name: spec.name,
      startDate: isoToDate(spec.startDate),
      endDate: isoToDate(spec.endDate),
      description: spec.description ?? null,
      createdById: admin.id,
    };
    // No hay unique compuesto en CalendarEvent → upsert manual por clave estable.
    const existing = await prisma.calendarEvent.findFirst({
      where: { academicYearId: year2026.id, name: spec.name, startDate: isoToDate(spec.startDate) },
      select: { id: true },
    });
    if (existing) {
      await prisma.calendarEvent.update({ where: { id: existing.id }, data });
    } else {
      await prisma.calendarEvent.create({ data });
    }
    eventCount += 1;
  }

  // ===== Comunicados demo =====

  // Recipients reales del alcance COLEGIO: apoderados de contacto principal (dedup) de matrículas
  // vigentes del año con estudiante ACTIVO/BECADO.
  const enrollments = await prisma.enrollment.findMany({
    where: {
      academicYearId: year2026.id,
      canceledAt: null,
      student: { status: { in: ['ACTIVO', 'BECADO'] } },
    },
    select: {
      student: {
        select: {
          guardians: {
            where: { isPrimary: true, active: true },
            take: 1,
            select: { guardianId: true },
          },
        },
      },
    },
  });
  const guardianIds = new Set<string>();
  for (const e of enrollments) {
    const link = e.student.guardians[0];
    if (link) guardianIds.add(link.guardianId);
  }
  const collegeRecipients = guardianIds.size;

  // Sección de Primaria para el BORRADOR de alcance SECCION.
  const primariaSection = await prisma.section.findFirst({
    where: { gradeLevel: { level: { academicYearId: year2026.id, name: 'Primaria' } } },
    orderBy: [{ gradeLevel: { order: 'asc' } }, { name: 'asc' }],
    select: { id: true },
  });

  // Comunicado ENVIADO (COLEGIO): preserva sentAt si ya existe; si no, lo fija dentro del mes actual.
  const c1 = await prisma.announcement.findUnique({ where: { code: 'C-0001' }, select: { id: true, sentAt: true } });
  const todayISO = limaTodayISO();
  const sentAt = c1?.sentAt ?? isoToDate(`${todayISO.slice(0, 7)}-05`);
  const c1Data = {
    academicYearId: year2026.id,
    title: 'Suspensión de clases por feriado de Fiestas Patrias',
    body: 'Estimadas familias, recordamos que el martes 28 y miércoles 29 de julio no habrá clases por el feriado nacional de Fiestas Patrias. Las clases se reanudan el jueves 30 de julio con normalidad. ¡Felices Fiestas Patrias!',
    scope: 'COLEGIO' as const,
    levelId: null,
    gradeLevelId: null,
    sectionId: null,
    status: 'ENVIADO' as const,
    recipientsCount: collegeRecipients,
    sentAt,
    sentById: admin.id,
    createdById: admin.id,
  };
  if (c1) {
    await prisma.announcement.update({ where: { code: 'C-0001' }, data: c1Data });
  } else {
    await prisma.announcement.create({ data: { code: 'C-0001', ...c1Data } });
  }

  // Comunicado BORRADOR (SECCION): reunión de apoderados de una sección de Primaria.
  if (primariaSection) {
    const c2Data = {
      academicYearId: year2026.id,
      title: 'Reunión de apoderados del aula',
      body: 'Se convoca a los señores apoderados a la reunión de aula para tratar el avance académico del bimestre y las actividades del próximo mes. Se coordinará la fecha y hora por este medio.',
      scope: 'SECCION' as const,
      levelId: null,
      gradeLevelId: null,
      sectionId: primariaSection.id,
      status: 'BORRADOR' as const,
      recipientsCount: null,
      sentAt: null,
      sentById: null,
      createdById: admin.id,
    };
    const c2 = await prisma.announcement.findUnique({ where: { code: 'C-0002' }, select: { id: true } });
    if (c2) {
      await prisma.announcement.update({ where: { code: 'C-0002' }, data: c2Data });
    } else {
      await prisma.announcement.create({ data: { code: 'C-0002', ...c2Data } });
    }
  }

  // CodeCounter 'announcement': la API continúa desde C-0003. Solo sube.
  const key = 'announcement';
  const current = await prisma.codeCounter.findUnique({ where: { key } });
  const next = Math.max(current?.value ?? 0, 2);
  await prisma.codeCounter.upsert({
    where: { key },
    update: { value: next },
    create: { key, value: next },
  });

  console.log(
    `  ✓ Calendario R4: ${eventCount} eventos + 2 comunicados demo (COLEGIO=${collegeRecipients} destinatarios, CodeCounter announcement = ${next})`,
  );
}
