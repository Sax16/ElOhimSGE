// Navegación del shell — transcrito del prototipo design/ui_kits/sge/index.html.
// Los ids son la fuente de verdad de las rutas: cada uno mapea a '/'+id.
import { Icons, type SidebarItem } from '@elohim/ui';
import { can, type PermissionModule, type Permissions, type UserRole } from '@elohim/shared';

// Navegación admin (19 items). Secciones "Académico", "Finanzas" y "Sistema"
// se anclan al primer item de cada bloque, igual que en el prototipo.
export const NAV: SidebarItem[] = [
  { id: 'dash', label: 'Panel', icon: <Icons.Dashboard /> },
  { id: 'estructura', label: 'Estructura académica', icon: <Icons.Layers />, section: 'Académico' },
  { id: 'est', label: 'Estudiantes', icon: <Icons.Users /> },
  { id: 'apoderados', label: 'Apoderados', icon: <Icons.Home /> },
  { id: 'docentes', label: 'Personal', icon: <Icons.Teacher /> },
  { id: 'notas', label: 'Notas', icon: <Icons.Book /> },
  { id: 'asist', label: 'Asistencia', icon: <Icons.Calendar /> },
  { id: 'horarios', label: 'Horarios', icon: <Icons.Clock /> },
  { id: 'conducta', label: 'Conducta', icon: <Icons.Clipboard /> },
  { id: 'calendario', label: 'Calendario', icon: <Icons.Calendar /> },
  { id: 'matricula', label: 'Matrícula', icon: <Icons.Clipboard /> },
  { id: 'caja', label: 'Caja y cobros', icon: <Icons.Receipt />, section: 'Finanzas' },
  { id: 'pagos', label: 'Pensiones', icon: <Icons.Cash />, badge: 8 },
  { id: 'tarifario', label: 'Tarifario y becas', icon: <Icons.Clipboard /> },
  { id: 'tesoreria', label: 'Gastos e ingresos', icon: <Icons.Chart /> },
  { id: 'inventario', label: 'Inventario y activos', icon: <Icons.Box /> },
  { id: 'reportes', label: 'Reportes', icon: <Icons.Chart />, section: 'Sistema' },
  { id: 'comunicados', label: 'Comunicados', icon: <Icons.Megaphone /> },
  { id: 'config', label: 'Configuración', icon: <Icons.Settings /> },
];

export const TEACHER_NAV: SidebarItem[] = [
  { id: 'tclases', label: 'Mis clases', icon: <Icons.Dashboard /> },
  { id: 'tasist', label: 'Asistencia', icon: <Icons.Calendar />, section: 'Mis aulas' },
  { id: 'notas', label: 'Notas', icon: <Icons.Book /> },
  { id: 'conducta', label: 'Conducta', icon: <Icons.Clipboard /> },
];

export const PORTER_NAV: SidebarItem[] = [
  { id: 'pmarcacion', label: 'Marcación de personal', icon: <Icons.Clock /> },
];

// Navegación del portal del apoderado (rol APODERADO). Mobile-first: 5 secciones.
export const GUARDIAN_NAV: SidebarItem[] = [
  { id: 'phome', label: 'Inicio', icon: <Icons.Home /> },
  { id: 'ppagos', label: 'Pagos', icon: <Icons.Cash /> },
  { id: 'pasist', label: 'Asistencia', icon: <Icons.Calendar /> },
  { id: 'pnotas', label: 'Notas', icon: <Icons.Book /> },
  { id: 'pavisos', label: 'Avisos', icon: <Icons.Megaphone /> },
];

export interface RouteMeta {
  title: string;
  crumbs: string[];
}

// Título y ruta de migas por id — verbatim del prototipo.
export const META: Record<string, RouteMeta> = {
  dash: { title: 'Panel administrativo', crumbs: ['Inicio', 'Panel'] },
  estructura: { title: 'Estructura académica', crumbs: ['Inicio', 'Académico', 'Estructura'] },
  matricula: { title: 'Matrícula', crumbs: ['Inicio', 'Académico', 'Matrícula'] },
  caja: { title: 'Caja y cobros', crumbs: ['Inicio', 'Finanzas', 'Caja'] },
  docentes: { title: 'Personal', crumbs: ['Inicio', 'Académico', 'Personal'] },
  apoderados: { title: 'Apoderados', crumbs: ['Inicio', 'Académico', 'Apoderados'] },
  tarifario: { title: 'Tarifario y becas', crumbs: ['Inicio', 'Finanzas', 'Tarifario'] },
  tesoreria: { title: 'Gastos e ingresos', crumbs: ['Inicio', 'Finanzas', 'Gastos e ingresos'] },
  inventario: { title: 'Inventario y activos', crumbs: ['Inicio', 'Finanzas', 'Inventario'] },
  config: { title: 'Configuración', crumbs: ['Inicio', 'Sistema', 'Configuración'] },
  est: { title: 'Estudiantes', crumbs: ['Inicio', 'Académico', 'Estudiantes'] },
  pagos: { title: 'Pensiones', crumbs: ['Inicio', 'Finanzas', 'Pensiones'] },
  notas: { title: 'Registro de notas', crumbs: ['Inicio', 'Académico', 'Notas'] },
  horarios: { title: 'Horarios', crumbs: ['Inicio', 'Académico', 'Horarios'] },
  calendario: { title: 'Calendario académico', crumbs: ['Inicio', 'Académico', 'Calendario'] },
  conducta: { title: 'Conducta e incidencias', crumbs: ['Inicio', 'Académico', 'Conducta'] },
  asist: { title: 'Asistencia de estudiantes', crumbs: ['Inicio', 'Académico', 'Asistencia'] },
  comunicados: { title: 'Comunicados', crumbs: ['Inicio', 'Sistema', 'Comunicados'] },
  reportes: { title: 'Reportes', crumbs: ['Inicio', 'Sistema', 'Reportes'] },
  tclases: { title: 'Mis clases', crumbs: ['Inicio', 'Mis clases'] },
  tasist: { title: 'Asistencia de estudiantes', crumbs: ['Inicio', 'Mis aulas', 'Asistencia'] },
  pmarcacion: { title: 'Marcación de personal', crumbs: ['Inicio', 'Marcación'] },
  phome: { title: 'Portal del apoderado', crumbs: ['Inicio'] },
  ppagos: { title: 'Pagos', crumbs: ['Inicio', 'Pagos'] },
  pasist: { title: 'Asistencia', crumbs: ['Inicio', 'Asistencia'] },
  pnotas: { title: 'Notas', crumbs: ['Inicio', 'Notas'] },
  pavisos: { title: 'Avisos', crumbs: ['Inicio', 'Avisos'] },
};

// Ruta de aterrizaje por rol.
export const HOME_BY_ROLE: Record<UserRole, string> = {
  ADMIN: '/dash',
  SECRETARIA_CAJA: '/dash',
  DOCENTE: '/tclases',
  PORTERIA: '/pmarcacion',
  APODERADO: '/phome',
};

// Mapa id de nav → módulo de permiso para filtrar la vista de Secretaría/Caja.
// `null` = item siempre visible (no depende de permisos granulares).
const NAV_MODULE: Record<string, PermissionModule | null> = {
  dash: null,
  estructura: 'estructura',
  est: 'estudiantes',
  apoderados: 'apoderados',
  docentes: 'personal',
  notas: 'notas',
  asist: 'asistencia',
  horarios: 'estructura',
  conducta: 'notas',
  calendario: 'estructura',
  matricula: 'matricula',
  caja: 'caja',
  pagos: 'pensiones',
  tarifario: 'tarifario',
  tesoreria: 'tesoreria',
  inventario: 'caja',
  reportes: 'reportes',
  comunicados: 'comunicados',
  config: 'config',
};

/** Navegación visible según el rol (y permisos, para Secretaría/Caja). */
export function NAV_BY_ROLE(role: UserRole, permissions: Permissions | null | undefined): SidebarItem[] {
  switch (role) {
    case 'ADMIN':
      return NAV;
    case 'DOCENTE':
      return TEACHER_NAV;
    case 'PORTERIA':
      return PORTER_NAV;
    case 'APODERADO':
      return GUARDIAN_NAV;
    case 'SECRETARIA_CAJA':
      return NAV.filter((item) => {
        const mod = NAV_MODULE[item.id];
        return mod == null || can(permissions, mod, 'ver');
      });
    default:
      return [];
  }
}
