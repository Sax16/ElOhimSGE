import {
  type PrismaClient,
  type ConductSeverity,
  type ConductStatus,
} from '@prisma/client';

// Académico (R4 — E3): incidencias de conducta demo. Idempotente (upsert por code I-000#).
// 5 incidencias deterministas en secciones de Primaria con matrículas vigentes.

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

// occurredAt/citationAt son DateTime absolutos. 10:00 Lima = 15:00 UTC → cae siempre en el mismo
// día civil de Lima que se pretende. Se usa para fijar las incidencias dentro del mes correcto.
function limaMorningUtc(year: number, month1: number, day: number): Date {
  return new Date(Date.UTC(year, month1 - 1, day, 15, 0, 0));
}

// Próximo viernes (o hoy si hoy es viernes) a las 08:00 Lima = 13:00 UTC.
function parseISO(iso: string): { y: number; m: number; d: number } {
  const p = iso.split('-');
  return { y: Number(p[0]), m: Number(p[1]), d: Number(p[2]) };
}

function nextFridayCitation(todayISO: string): Date {
  const { y, m, d } = parseISO(todayISO);
  const base = new Date(Date.UTC(y, m - 1, d));
  const dow = base.getUTCDay(); // 0 dom … 6 sáb
  const delta = (5 - dow + 7) % 7; // días hasta el viernes
  const friday = new Date(base.getTime() + delta * 86_400_000);
  friday.setUTCHours(13, 0, 0, 0);
  return friday;
}

interface IncidentSpec {
  code: string;
  severity: ConductSeverity;
  status: ConductStatus;
  summary: string;
  description: string;
  measure: string | null;
  // offset de días (dentro del mes) hacia atrás desde hoy para occurredAt; o 'last-month'.
  when: number | 'last-month';
  notified: boolean; // marca notifiedAt
  citation: boolean; // marca citationAt (próximo viernes)
  closed: boolean; // marca closedAt/status CERRADA
}

const SPECS: IncidentSpec[] = [
  {
    code: 'I-0001',
    severity: 'LEVE',
    status: 'CERRADA',
    summary: 'Tardanza reiterada al aula',
    description:
      'Ingresó al aula 15 minutos después del inicio de clases por tercera vez en la semana, sin justificación del apoderado.',
    measure: 'Llamada de atención verbal y registro en el cuaderno de incidencias.',
    when: 6,
    notified: false,
    citation: false,
    closed: true,
  },
  {
    code: 'I-0002',
    severity: 'MODERADA',
    status: 'APODERADO_NOTIFICADO',
    summary: 'Agresión verbal a compañero',
    description:
      'Durante el recreo profirió insultos a un compañero de aula. El auxiliar intervino para separarlos.',
    measure: 'Reflexión guiada con el tutor y disculpa al compañero afectado.',
    when: 4,
    notified: true,
    citation: false,
    closed: false,
  },
  {
    code: 'I-0003',
    severity: 'MODERADA',
    status: 'REGISTRADA',
    summary: 'No presenta tareas (3.ª vez)',
    description:
      'No entregó las tareas asignadas de Comunicación por tercera vez consecutiva pese a los recordatorios en clase.',
    measure: null,
    when: 2,
    notified: false,
    citation: false,
    closed: false,
  },
  {
    code: 'I-0004',
    severity: 'GRAVE',
    status: 'CITACION_PROGRAMADA',
    summary: 'Uso de celular en examen',
    description:
      'Se le encontró usando el celular durante la evaluación de Matemática. Se retiró el equipo y se anuló la prueba.',
    measure: 'Citación al apoderado para acuerdo disciplinario y reprogramación de la evaluación.',
    when: 1,
    notified: true,
    citation: true,
    closed: false,
  },
  {
    code: 'I-0005',
    severity: 'GRAVE',
    status: 'CERRADA',
    summary: 'Daño a mobiliario del aula',
    description:
      'Rayó y dañó intencionalmente dos carpetas del aula durante la hora de tutoría del mes anterior.',
    measure: 'Citación al apoderado, reposición del mobiliario y compromiso de conducta firmado.',
    when: 'last-month',
    notified: true,
    citation: false,
    closed: true,
  },
];

export async function seedR4Conducta(prisma: PrismaClient) {
  const year2026 = await prisma.academicYear.findUnique({ where: { name: '2026' } });
  if (!year2026) throw new Error('Falta el año 2026 — corre primero el seed 04-academic-years');

  const admin = await prisma.user.findUnique({ where: { username: 'admin' }, select: { id: true } });
  if (!admin) throw new Error('Falta el usuario admin — corre primero el seed 02-users');

  // Secciones de Primaria con matrículas vigentes (mismas que la demo de asistencia/notas).
  // El tutor es un Staff; registeredById debe ser un User (actor de auditoría) → se usa el usuario
  // vinculado al tutor (Staff.userId), con 'admin' como respaldo.
  const sections = await prisma.section.findMany({
    where: { gradeLevel: { level: { academicYearId: year2026.id, name: 'Primaria' } } },
    orderBy: [{ gradeLevel: { order: 'asc' } }, { name: 'asc' }],
    select: { id: true, tutor: { select: { userId: true } } },
  });

  // Aplana (sección, matrícula) para asignar cada incidencia a un estudiante distinto y estable.
  const pairs: { sectionId: string; tutorUserId: string | null; enrollmentId: string }[] = [];
  for (const section of sections) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId: section.id,
        canceledAt: null,
        academicYearId: year2026.id,
        student: { status: { in: ['ACTIVO', 'BECADO'] } },
      },
      orderBy: [
        { student: { paternalLastName: 'asc' } },
        { student: { maternalLastName: 'asc' } },
        { student: { firstNames: 'asc' } },
      ],
      select: { id: true },
    });
    for (const e of enrollments) {
      pairs.push({ sectionId: section.id, tutorUserId: section.tutor?.userId ?? null, enrollmentId: e.id });
    }
  }
  if (pairs.length < SPECS.length) {
    throw new Error('No hay suficientes matrículas de Primaria para la demo de conducta');
  }

  const todayISO = limaTodayISO();
  const { y: ty, m: tm, d: td } = parseISO(todayISO);
  const prevMonth = tm === 1 ? 12 : tm - 1;
  const prevYear = tm === 1 ? ty - 1 : ty;
  const citation = nextFridayCitation(todayISO);

  let count = 0;
  for (const [i, spec] of SPECS.entries()) {
    const pair = pairs[i]!;
    const registeredById = pair.tutorUserId ?? admin.id;

    const occurredAt =
      spec.when === 'last-month'
        ? limaMorningUtc(prevYear, prevMonth, 20)
        : limaMorningUtc(ty, tm, Math.max(1, td - spec.when));

    const data = {
      enrollmentId: pair.enrollmentId,
      occurredAt,
      summary: spec.summary,
      description: spec.description,
      measure: spec.measure,
      severity: spec.severity,
      status: spec.status,
      citationAt: spec.citation ? citation : null,
      notifiedAt: spec.notified ? occurredAt : null,
      closedAt: spec.closed ? occurredAt : null,
      closedById: spec.closed ? registeredById : null,
      registeredById,
    };

    await prisma.conductIncident.upsert({
      where: { code: spec.code },
      update: data,
      create: { code: spec.code, ...data },
    });
    count += 1;
  }

  // Secuencia de códigos (marca de agua: la API continúa desde I-0006). Solo sube.
  const key = 'conduct';
  const current = await prisma.codeCounter.findUnique({ where: { key } });
  const next = Math.max(current?.value ?? 0, SPECS.length);
  await prisma.codeCounter.upsert({
    where: { key },
    update: { value: next },
    create: { key, value: next },
  });

  console.log(`  ✓ Conducta R4: ${count} incidencias demo (CodeCounter conduct = ${next})`);
}
