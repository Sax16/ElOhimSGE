import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { EmptyState, Icons } from '@elohim/ui';
import type { UserRole } from '@elohim/shared';
import { AppLayout } from './AppLayout';
import { RequireAuth, RequireRole } from './guards';
import { HOME_BY_ROLE, NAV, PORTER_NAV, TEACHER_NAV } from './nav';
import { useMe } from '../lib/useMe';

const LoginPage = lazy(() => import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const PlaceholderPage = lazy(() =>
  import('../features/placeholder/PlaceholderPage').then((m) => ({ default: m.PlaceholderPage })),
);
const DevKitPage = lazy(() => import('../features/dev/DevKitPage').then((m) => ({ default: m.DevKitPage })));
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const StructurePage = lazy(() =>
  import('../features/structure/StructurePage').then((m) => ({ default: m.StructurePage })),
);
const StudentsPage = lazy(() =>
  import('../features/students/StudentsPage').then((m) => ({ default: m.StudentsPage })),
);
const GuardiansPage = lazy(() =>
  import('../features/guardians/GuardiansPage').then((m) => ({ default: m.GuardiansPage })),
);
const StaffPage = lazy(() => import('../features/staff/StaffPage').then((m) => ({ default: m.StaffPage })));
const FeesPage = lazy(() => import('../features/fees/FeesPage').then((m) => ({ default: m.FeesPage })));
const CashierPage = lazy(() =>
  import('../features/cashier/CashierPage').then((m) => ({ default: m.CashierPage })),
);
const PensionsPage = lazy(() =>
  import('../features/payments/PensionsPage').then((m) => ({ default: m.PensionsPage })),
);
const EnrollmentPage = lazy(() =>
  import('../features/enrollment/EnrollmentPage').then((m) => ({ default: m.EnrollmentPage })),
);
const TreasuryPage = lazy(() =>
  import('../features/treasury/TreasuryPage').then((m) => ({ default: m.TreasuryPage })),
);
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const ReportsPage = lazy(() =>
  import('../features/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);
const PorteriaPage = lazy(() =>
  import('../features/porteria/PorteriaPage').then((m) => ({ default: m.PorteriaPage })),
);
const TeacherHomePage = lazy(() =>
  import('../features/teacher/TeacherHomePage').then((m) => ({ default: m.TeacherHomePage })),
);
const TakeAttendancePage = lazy(() =>
  import('../features/student-attendance/TakeAttendancePage').then((m) => ({
    default: m.TakeAttendancePage,
  })),
);
const StudentAttendancePage = lazy(() =>
  import('../features/student-attendance/StudentAttendancePage').then((m) => ({
    default: m.StudentAttendancePage,
  })),
);
const SchedulePage = lazy(() =>
  import('../features/schedule/SchedulePage').then((m) => ({ default: m.SchedulePage })),
);
const GradesPage = lazy(() =>
  import('../features/grades/GradesPage').then((m) => ({ default: m.GradesPage })),
);
const ConductPage = lazy(() =>
  import('../features/conduct/ConductPage').then((m) => ({ default: m.ConductPage })),
);
const CalendarPage = lazy(() =>
  import('../features/calendar/CalendarPage').then((m) => ({ default: m.CalendarPage })),
);
const AnnouncementsPage = lazy(() =>
  import('../features/announcements/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage })),
);

function Loading() {
  return (
    <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
  );
}

function Suspended({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

/** Redirige "/" al inicio del rol actual. */
function HomeRedirect() {
  const { data: me } = useMe();
  if (!me) return <Navigate to="/login" replace />;
  return <Navigate to={HOME_BY_ROLE[me.role]} replace />;
}

// Roles permitidos por id de ruta. Base admin = ADMIN + SECRETARIA_CAJA;
// las secciones docentes suman DOCENTE; portería es exclusiva.
const ADMIN_ROLES: UserRole[] = ['ADMIN', 'SECRETARIA_CAJA'];
const routeRoles: Record<string, UserRole[]> = {};
for (const item of NAV) routeRoles[item.id] = [...ADMIN_ROLES];
routeRoles['config'] = ['ADMIN'];
for (const item of TEACHER_NAV) {
  const existing = routeRoles[item.id];
  routeRoles[item.id] = existing ? [...existing, 'DOCENTE'] : ['DOCENTE'];
}
for (const item of PORTER_NAV) routeRoles[item.id] = ['PORTERIA'];
// La toma diaria /tasist también la usa Admin (día editable); asegúrale acceso.
routeRoles['tasist'] = Array.from(new Set([...(routeRoles['tasist'] ?? []), 'ADMIN']));

const moduleRoutes: RouteObject[] = Object.entries(routeRoles).map(([id, roles]) => ({
  path: id,
  element: (
    <RequireRole allowedRoles={roles}>
      <Suspended>
        {id === 'config' ? (
          <SettingsPage />
        ) : id === 'estructura' ? (
          <StructurePage />
        ) : id === 'est' ? (
          <StudentsPage />
        ) : id === 'apoderados' ? (
          <GuardiansPage />
        ) : id === 'docentes' ? (
          <StaffPage />
        ) : id === 'tarifario' ? (
          <FeesPage />
        ) : id === 'caja' ? (
          <CashierPage />
        ) : id === 'pagos' ? (
          <PensionsPage />
        ) : id === 'matricula' ? (
          <EnrollmentPage />
        ) : id === 'tesoreria' ? (
          <TreasuryPage />
        ) : id === 'dash' ? (
          <DashboardPage />
        ) : id === 'reportes' ? (
          <ReportsPage />
        ) : id === 'pmarcacion' ? (
          <PorteriaPage />
        ) : id === 'tclases' ? (
          <TeacherHomePage />
        ) : id === 'tasist' ? (
          <TakeAttendancePage />
        ) : id === 'asist' ? (
          <StudentAttendancePage />
        ) : id === 'horarios' ? (
          <SchedulePage />
        ) : id === 'notas' ? (
          <GradesPage />
        ) : id === 'conducta' ? (
          <ConductPage />
        ) : id === 'calendario' ? (
          <CalendarPage />
        ) : id === 'comunicados' ? (
          <AnnouncementsPage />
        ) : (
          <PlaceholderPage />
        )}
      </Suspended>
    </RequireRole>
  ),
}));

const routes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <Suspended>
        <LoginPage />
      </Suspended>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [{ index: true, element: <HomeRedirect /> }, ...moduleRoutes],
  },
  ...(import.meta.env.DEV
    ? [
        {
          path: '/dev/kit',
          element: (
            <Suspended>
              <DevKitPage />
            </Suspended>
          ),
        } satisfies RouteObject,
      ]
    : []),
  {
    path: '*',
    element: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <EmptyState icon={<Icons.Search />} title="Página no encontrada" description="La ruta que buscas no existe." />
      </div>
    ),
  },
];

export const router = createBrowserRouter(routes);
