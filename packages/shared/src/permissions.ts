// Permisos granulares por módulo (D8): el rol define el alcance base; los permisos lo afinan.
// Se guardan en User.permissions (Json) y se consultan en PermissionsGuard (API) y useCan() (web).

import { type UserRole } from './enums';

export const PERMISSION_MODULES = [
  'estructura',
  'estudiantes',
  'apoderados',
  'matricula',
  'tarifario',
  'caja',
  'pensiones',
  'personal',
  'marcacion',
  'notas',
  'asistencia',
  'reportes',
  'comunicados',
  'config',
] as const;
export type PermissionModule = (typeof PERMISSION_MODULES)[number];

// Type alias (no interface): la index signature implícita lo hace asignable al Json de Prisma.
export type ModulePermission = {
  ver: boolean;
  editar: boolean;
};

export type Permissions = Record<PermissionModule, ModulePermission>;

const NONE: ModulePermission = { ver: false, editar: false };
const VER: ModulePermission = { ver: true, editar: false };
const FULL: ModulePermission = { ver: true, editar: true };

function base(overrides: Partial<Permissions>): Permissions {
  const all = Object.fromEntries(PERMISSION_MODULES.map((m) => [m, { ...NONE }])) as Permissions;
  return { ...all, ...overrides };
}

export const DEFAULT_PERMISSIONS: Record<UserRole, Permissions> = {
  ADMIN: Object.fromEntries(PERMISSION_MODULES.map((m) => [m, { ...FULL }])) as Permissions,
  SECRETARIA_CAJA: base({
    estudiantes: FULL,
    apoderados: FULL,
    matricula: FULL,
    caja: FULL,
    pensiones: FULL,
    estructura: VER,
    tarifario: VER,
    reportes: VER,
  }),
  DOCENTE: base({
    notas: FULL,
    asistencia: FULL,
  }),
  PORTERIA: base({
    marcacion: FULL,
  }),
  APODERADO: base({}),
};

export function can(
  permissions: Permissions | null | undefined,
  module: PermissionModule,
  action: keyof ModulePermission = 'ver',
): boolean {
  return permissions?.[module]?.[action] === true;
}
