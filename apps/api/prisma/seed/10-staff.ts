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

// ===== Empleados (upsert por dni, P-001..P-008) =====
type StaffSeed = {
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
  useIndividualSchedule?: boolean;
  individualEntryTime?: string;
  individualToleranceMin?: number;
};

const STAFF: StaffSeed[] = [
  { fullName: 'Pedro Gómez Silva', dni: '41118906', phone: '964880213', role: 'DOCENTE', area: 'Primaria · Matemática', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1800.00', scheme: 'AFP Integra', status: 'ACTIVO', hire: [2021, 3, 1] },
  { fullName: 'Lucía Díaz Rojas', dni: '42230145', phone: '964880214', role: 'DOCENTE', area: 'Primaria · Comunicación', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1800.00', scheme: 'ONP', status: 'ACTIVO', hire: [2020, 3, 2] },
  { fullName: 'Iris Quinto Vega', dni: '43567012', phone: '964880215', role: 'DOCENTE', area: 'Secundaria · Inglés', employmentType: 'MEDIO_TIEMPO', baseSalary: '1100.00', scheme: 'ONP', status: 'ACTIVO', hire: [2022, 3, 1] },
  { fullName: 'Liliana Campos Paz', dni: '40985233', phone: '964880216', role: 'SECRETARIA', area: 'Administración · Caja', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1500.00', scheme: 'AFP Habitat', status: 'ACTIVO', hire: [2020, 3, 2] },
  { fullName: 'Saúl Ramos Cruz', dni: '44120876', phone: '964880217', role: 'DOCENTE', area: 'Secundaria · Ed. Física', employmentType: 'POR_HORAS', baseSalary: '900.00', scheme: 'ONP', status: 'LICENCIA', hire: [2023, 3, 15], useIndividualSchedule: true, individualEntryTime: '13:00', individualToleranceMin: 10 },
  { fullName: 'Nora Paz Salas', dni: '42667490', phone: '964880218', role: 'AUXILIAR', area: 'Inicial', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1300.00', scheme: 'ONP', status: 'ACTIVO', hire: [2021, 3, 1] },
  { fullName: 'Raúl Meza Campos', dni: '43891207', phone: '964880219', role: 'MANTENIMIENTO', area: 'Servicios generales', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1200.00', scheme: 'ONP', status: 'ACTIVO', hire: [2024, 4, 1] },
  { fullName: 'Marta Quispe Rojas', dni: '45012388', phone: '964880220', role: 'AUXILIAR', area: 'Primaria', employmentType: 'TIEMPO_COMPLETO', baseSalary: '1300.00', scheme: 'AFP Prima', status: 'ACTIVO', hire: [2025, 3, 3] },
];

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

  // ----- Empleados -----
  for (let i = 0; i < STAFF.length; i++) {
    const s = STAFF[i]!;
    const code = `P-${String(i + 1).padStart(3, '0')}`;
    const pensionSchemeId = schemeIds.get(s.scheme);
    if (!pensionSchemeId) throw new Error(`Régimen no sembrado: ${s.scheme}`);
    await prisma.staff.upsert({
      where: { dni: s.dni },
      update: {},
      create: {
        code,
        fullName: s.fullName,
        dni: s.dni,
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
      },
    });
  }

  // ----- Secuencia de códigos (marca de agua: la API continúa la numeración; solo sube) -----
  const key = 'staff';
  const current = await prisma.codeCounter.findUnique({ where: { key } });
  const next = Math.max(current?.value ?? 0, STAFF.length);
  await prisma.codeCounter.upsert({
    where: { key },
    update: { value: next },
    create: { key, value: next },
  });

  console.log(
    `  ✓ Personal: ${PENSION_SCHEMES.length} regímenes, ${MARKING_GROUPS.length} grupos de marcación, ${STAFF.length} empleados`,
  );
}
