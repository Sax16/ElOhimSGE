// DTOs de la pantalla Personal (R3 · Etapa 1), según el contrato de la API.
// Los tipos calcan las respuestas/bodies que consume el front; la validación de
// dominio vive en el backend. Se definen localmente porque el módulo `staff` de
// @elohim/shared aún no exporta estos símbolos.

export type StaffRole =
  | 'DOCENTE'
  | 'SECRETARIA'
  | 'AUXILIAR'
  | 'MANTENIMIENTO'
  | 'DIRECCION'
  | 'PORTERIA';

export type EmploymentType = 'TIEMPO_COMPLETO' | 'MEDIO_TIEMPO' | 'POR_HORAS';

export type StaffStatus = 'ACTIVO' | 'LICENCIA' | 'INACTIVO';

export type PensionKind = 'ONP' | 'AFP';

/** Régimen pensionario asociado a un empleado (dentro del StaffDto). */
export interface StaffPensionScheme {
  id: string;
  name: string;
  kind: PensionKind;
}

/** Horario de marcación efectivo (resuelto por el backend: grupo o individual). */
export interface StaffEffectiveSchedule {
  source: 'GRUPO' | 'INDIVIDUAL';
  groupName: string | null;
  entryTime: string; // 'HH:mm'
  toleranceMin: number;
}

/** Fila del listado y ficha — GET /api/staff. */
export interface StaffDto {
  id: string;
  code: string;
  fullName: string;
  dni: string;
  phone: string | null;
  email: string | null;
  role: StaffRole;
  area: string | null;
  employmentType: EmploymentType;
  status: StaffStatus;
  baseSalary: string; // NUMERIC(10,2) serializado como string
  hireDate: string | null; // ISO
  pensionScheme: StaffPensionScheme;
  useIndividualSchedule: boolean;
  individualEntryTime: string | null; // 'HH:mm'
  individualToleranceMin: number | null;
  userId: string | null;
  effectiveSchedule: StaffEffectiveSchedule;
}

// ---- Catálogos -------------------------------------------------------------

export interface PensionSchemeCatalog {
  id: string;
  name: string;
  kind: PensionKind;
  active: boolean;
  sortOrder: number;
}

export interface MarkingGroupCatalog {
  id: string;
  name: string;
  entryTime: string;
  toleranceMin: number;
  roles: StaffRole[];
  sortOrder: number;
}

/** GET /api/staff/catalogs. */
export interface StaffCatalogs {
  pensionSchemes: PensionSchemeCatalog[];
  markingGroups: MarkingGroupCatalog[];
}

// ---- Acceso al sistema (portal docente) ------------------------------------
export type StaffAccessStatus = 'SIN_ACCESO' | 'ACTIVO';

/** GET /api/staff/:id/access. Responde 422 si el cargo no es docente. */
export interface StaffAccess {
  status: StaffAccessStatus;
  username: string | null;
  role: string | null;
  suggestedUsername: string;
}

/** POST /api/staff/:id/access — credencial mostrada una sola vez. */
export interface StaffAccessCredential {
  username: string;
  tempPassword: string;
}

// ---- Bodies de mutación ----------------------------------------------------

export interface StaffCreateBody {
  fullName: string;
  dni: string;
  phone?: string | null;
  email?: string | null;
  role: StaffRole;
  area?: string | null;
  employmentType: EmploymentType;
  baseSalary: number;
  hireDate?: string; // 'YYYY-MM-DD'
  pensionSchemeId: string;
  status?: StaffStatus;
  useIndividualSchedule?: boolean;
  individualEntryTime?: string | null;
  individualToleranceMin?: number | null;
}

/** Edición parcial; comparte forma con el alta. */
export type StaffUpdateBody = Partial<StaffCreateBody>;
