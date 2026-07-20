import {
  type EmploymentType,
  type PrismaClient,
  type StaffRole,
  type StaffStatus,
} from '@prisma/client';

// Fecha UTC a medianoche (columnas @db.Date).
const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));

/**
 * Personal (R3 — E1): catálogos idempotentes (regímenes pensionarios upsert por name, grupos de
 * marcación upsert por name) y 8 empleados de ejemplo (upsert por dni, códigos P-001..P-008).
 * Los porcentajes AFP/ONP son referenciales (D5: configurables en Configuración → Planilla).
 */

// ===== Regímenes pensionarios (upsert por name) =====
type PensionSeed = {
  name: string;
  kind: 'ONP' | 'AFP';
  onpRatePct: string | null;
  fundRatePct: string | null;
  commissionRatePct: string | null;
  insuranceRatePct: string | null;
  sortOrder: number;
};

const PENSION_SCHEMES: PensionSeed[] = [
  { name: 'ONP', kind: 'ONP', onpRatePct: '13.00', fundRatePct: null, commissionRatePct: null, insuranceRatePct: null, sortOrder: 0 },
  { name: 'AFP Integra', kind: 'AFP', onpRatePct: null, fundRatePct: '10.00', commissionRatePct: '1.55', insuranceRatePct: '1.84', sortOrder: 1 },
  { name: 'AFP Prima', kind: 'AFP', onpRatePct: null, fundRatePct: '10.00', commissionRatePct: '1.60', insuranceRatePct: '1.84', sortOrder: 2 },
  { name: 'AFP Profuturo', kind: 'AFP', onpRatePct: null, fundRatePct: '10.00', commissionRatePct: '1.69', insuranceRatePct: '1.84', sortOrder: 3 },
  { name: 'AFP Habitat', kind: 'AFP', onpRatePct: null, fundRatePct: '10.00', commissionRatePct: '1.47', insuranceRatePct: '1.84', sortOrder: 4 },
];

// ===== Grupos de marcación (upsert por name) =====
type MarkingGroupSeed = {
  name: string;
  entryTime: string;
  toleranceMin: number;
  roles: StaffRole[];
  sortOrder: number;
};

const MARKING_GROUPS: MarkingGroupSeed[] = [
  { name: 'Docentes', entryTime: '07:45', toleranceMin: 15, roles: ['DOCENTE'], sortOrder: 0 },
  { name: 'Administrativos', entryTime: '07:30', toleranceMin: 10, roles: ['SECRETARIA', 'DIRECCION'], sortOrder: 1 },
  { name: 'Auxiliares', entryTime: '07:30', toleranceMin: 10, roles: ['AUXILIAR'], sortOrder: 2 },
  { name: 'Mantenimiento', entryTime: '06:30', toleranceMin: 10, roles: ['MANTENIMIENTO'], sortOrder: 3 },
  { name: 'Portería', entryTime: '06:00', toleranceMin: 5, roles: ['PORTERIA'], sortOrder: 4 },
];

// ===== Empleados (upsert convergente por dni; código estable por ficha) =====
// "El docente es un empleado": los 7 usuarios docentes de 02-users tienen una ficha de Personal con
// cargo docente (role DOCENTE), NOMBRE EXACTAMENTE igual al del User y vínculo Staff.userId (por
// `username`). El upsert converge sobre una BD existente (actualiza nombre/cargo/vínculo). Se conserva
// el resto de fichas no docentes (secretaría, auxiliares, mantenimiento) y una docente en LICENCIA
// (Saúl, sin usuario) para demostrar la regla de elegibilidad (LICENCIA no recibe nuevas asignaciones).
type StaffSeed = {
  code: string;
  fullName: string;
  dni: string;
  phone: string;
  role: StaffRole;
  area: string;
  employmentType: EmploymentType;
  baseSalary: string;
  scheme: string; // name del régimen
  status: StaffStatus;
  hire: [number, number, number];
  username?: string; // usuario de 02-users a vincular (Staff.userId); solo docentes con credencial
  useIndividualSchedule?: boolean;
  individualEntryTime?: string;
  individualToleranceMin?: number;
};

const STAFF: StaffSeed[] = [
  // --- Docentes vinculados a sus usuarios (nombres EXACTOS a 02-users) ---
  { code: 'P-001', fullName: 'Pedro Gómez Silva', dni: '41118906', phone: '964880213', role: 'DOCENTE', area: 'Primaria · Matemática', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1800.00', scheme: 'AFP Integra', status: 'ACTIVO', hire: [2021, 3, 1], username: 'docente' },
  { code: 'P-002', fullName: 'Lucía Díaz Paredes', dni: '42230145', phone: '964880214', role: 'DOCENTE', area: 'Primaria · Comunicación', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1800.00', scheme: 'ONP', status: 'ACTIVO', hire: [2020, 3, 2], username: 'lucia.diaz' },
  { code: 'P-003', fullName: 'Mario Silva Chávez', dni: '43567012', phone: '964880215', role: 'DOCENTE', area: 'Secundaria · Ciencia y Tecnología', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1800.00', scheme: 'ONP', status: 'ACTIVO', hire: [2022, 3, 1], username: 'mario.silva' },
  // --- No docentes (se conservan) ---
  { code: 'P-004', fullName: 'Liliana Campos Paz', dni: '40985233', phone: '964880216', role: 'SECRETARIA', area: 'Administración · Caja', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1500.00', scheme: 'AFP Habitat', status: 'ACTIVO', hire: [2020, 3, 2] },
  // --- Docente en LICENCIA sin usuario: demuestra la regla de elegibilidad (no elegible para nuevas) ---
  { code: 'P-005', fullName: 'Saúl Ramos Cruz', dni: '44120876', phone: '964880217', role: 'DOCENTE', area: 'Secundaria · Ed. Física', employmentType: 'POR_HORAS', baseSalary: '900.00', scheme: 'ONP', status: 'LICENCIA', hire: [2023, 3, 15], useIndividualSchedule: true, individualEntryTime: '13:00', individualToleranceMin: 10 },
  { code: 'P-006', fullName: 'Nora Paz Salas', dni: '42667490', phone: '964880218', role: 'AUXILIAR', area: 'Inicial', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1300.00', scheme: 'ONP', status: 'ACTIVO', hire: [2021, 3, 1] },
  { code: 'P-007', fullName: 'Raúl Meza Campos', dni: '43891207', phone: '964880219', role: 'MANTENIMIENTO', area: 'Servicios generales', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1200.00', scheme: 'ONP', status: 'ACTIVO', hire: [2024, 4, 1] },
  { code: 'P-008', fullName: 'Marta Quispe Rojas', dni: '45012388', phone: '964880220', role: 'AUXILIAR', area: 'Primaria', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1300.00', scheme: 'AFP Prima', status: 'ACTIVO', hire: [2025, 3, 3] },
  // --- Resto de docentes vinculados (nombres EXACTOS a 02-users) ---
  { code: 'P-009', fullName: 'Carmen Rojas Vega', dni: '46001122', phone: '964880221', role: 'DOCENTE', area: 'Secundaria · Comunicación', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1800.00', scheme: 'AFP Prima', status: 'ACTIVO', hire: [2021, 3, 1], username: 'carmen.rojas' },
  { code: 'P-010', fullName: 'Jorge Mendoza Ríos', dni: '46220345', phone: '964880222', role: 'DOCENTE', area: 'Secundaria · Inglés', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1800.00', scheme: 'AFP Integra', status: 'ACTIVO', hire: [2022, 3, 1], username: 'jorge.mendoza' },
  { code: 'P-011', fullName: 'Elena Castro Salas', dni: '46330456', phone: '964880223', role: 'DOCENTE', area: 'Inicial · Aula', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1700.00', scheme: 'AFP Integra', status: 'ACTIVO', hire: [2023, 3, 1], username: 'elena.castro' },
  { code: 'P-012', fullName: 'Raúl Torres Ninanya', dni: '47440567', phone: '964880224', role: 'DOCENTE', area: 'Primaria · Educación Física', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1600.00', scheme: 'ONP', status: 'ACTIVO', hire: [2020, 3, 2], username: 'raul.torres' },
];

// Siguiente código de empleado libre desde el contador 'staff' (mismo que usa la app). Reintenta si
// el valor cae sobre un código ya usado (nunca colisiona).
async function nextStaffCode(prisma: PrismaClient): Promise<string> {
  for (;;) {
    const counter = await prisma.codeCounter.upsert({
      where: { key: 'staff' },
      create: { key: 'staff', value: 1 },
      update: { value: { increment: 1 } },
    });
    const code = `P-${String(counter.value).padStart(3, '0')}`;
    const taken = await prisma.staff.findUnique({ where: { code }, select: { id: true } });
    if (!taken) return code;
  }
}

// Deja el contador 'staff' al menos en el mayor número de código existente (P-###), para que la app
// continúe la numeración sin repetir.
async function bumpStaffCounter(prisma: PrismaClient): Promise<void> {
  const all = await prisma.staff.findMany({ select: { code: true } });
  let max = 0;
  for (const s of all) {
    const n = Number(s.code.replace(/^P-/, ''));
    if (Number.isFinite(n) && n > max) max = n;
  }
  const current = await prisma.codeCounter.findUnique({ where: { key: 'staff' } });
  if ((current?.value ?? 0) < max) {
    await prisma.codeCounter.upsert({
      where: { key: 'staff' },
      update: { value: max },
      create: { key: 'staff', value: max },
    });
  }
}

export async function seedStaff(prisma: PrismaClient) {
  // ----- Regímenes pensionarios -----
  const schemeIds = new Map<string, string>();
  for (const s of PENSION_SCHEMES) {
    const row = await prisma.pensionScheme.upsert({
      where: { name: s.name },
      update: {},
      create: {
        name: s.name,
        kind: s.kind,
        onpRatePct: s.onpRatePct,
        fundRatePct: s.fundRatePct,
        commissionRatePct: s.commissionRatePct,
        insuranceRatePct: s.insuranceRatePct,
        sortOrder: s.sortOrder,
      },
    });
    schemeIds.set(s.name, row.id);
  }

  // ----- Grupos de marcación -----
  for (const g of MARKING_GROUPS) {
    await prisma.markingGroup.upsert({
      where: { name: g.name },
      update: {},
      create: {
        name: g.name,
        entryTime: g.entryTime,
        toleranceMin: g.toleranceMin,
        roles: g.roles,
        sortOrder: g.sortOrder,
      },
    });
  }

  // ----- Empleados (convergente por dni) -----
  // Existente (por dni): se actualizan nombre/cargo/estado/vínculo, conservando su código. Nuevo: se
  // crea con el código deseado si está libre; si no (p. ej. lo tomó una ficha creada desde la app),
  // se toma el siguiente del contador. Nunca se pisa un código ya usado (nada se borra).
  for (const s of STAFF) {
    const pensionSchemeId = schemeIds.get(s.scheme);
    if (!pensionSchemeId) throw new Error(`Régimen no sembrado: ${s.scheme}`);

    // Vínculo con el usuario del sistema (solo docentes con credencial). El User debe existir (02-users).
    let userId: string | null = null;
    if (s.username) {
      const user = await prisma.user.findUnique({ where: { username: s.username }, select: { id: true } });
      if (!user) throw new Error(`Usuario no sembrado para la ficha ${s.code}: ${s.username}`);
      userId = user.id;
    }

    // Campos convergentes (sin `code`: el código no se cambia en fichas existentes).
    const fields = {
      fullName: s.fullName,
      phone: s.phone,
      role: s.role,
      area: s.area,
      employmentType: s.employmentType,
      status: s.status,
      baseSalary: s.baseSalary,
      hireDate: d(...s.hire),
      pensionSchemeId,
      useIndividualSchedule: s.useIndividualSchedule ?? false,
      individualEntryTime: s.individualEntryTime ?? null,
      individualToleranceMin: s.individualToleranceMin ?? null,
      userId,
    };

    const existing = await prisma.staff.findUnique({ where: { dni: s.dni }, select: { id: true } });
    if (existing) {
      await prisma.staff.update({ where: { id: existing.id }, data: fields });
    } else {
      const codeTaken = await prisma.staff.findUnique({ where: { code: s.code }, select: { id: true } });
      const code = codeTaken ? await nextStaffCode(prisma) : s.code;
      await prisma.staff.create({ data: { code, dni: s.dni, ...fields } });
    }
  }

  // El contador de códigos queda al menos en el mayor código de empleado usado (la app sigue desde ahí).
  await bumpStaffCounter(prisma);

  // ----- Configuración de marcación (R3 — E2): fila única con defaults (idempotente) -----
  await prisma.markingSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // ----- Configuración de planilla (R3 — E3): fila única con seed MYPE (idempotente) -----
  await prisma.payrollSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log(
    `  ✓ Personal: ${PENSION_SCHEMES.length} regímenes, ${MARKING_GROUPS.length} grupos de marcación, ${STAFF.length} empleados, MarkingSettings + PayrollSettings (defaults)`,
  );
}
