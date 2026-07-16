import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Avatar,
  Breadcrumb,
  Button,
  Icons,
  IconButton,
  Select,
  Sidebar,
  Switch,
  Tooltip,
  Topbar,
  useToast,
} from '@elohim/ui';
import { USER_ROLE_LABELS, type UserRole } from '@elohim/shared';
import { apiFetch } from '../lib/api';
import { useMe } from '../lib/useMe';
import { queryClient } from '../lib/queryClient';
import { useUiStore } from '../stores/ui.store';
import { useThemeStore } from '../stores/theme.store';
import { useYearStore } from '../stores/year.store';
import { META, NAV_BY_ROLE } from './nav';
import './app-layout.css';

interface AcademicYear {
  id: string;
  name: string;
  status: 'ACTIVO' | 'CERRADO';
}

const ROLE_COLOR: Record<UserRole, string> = {
  ADMIN: 'var(--gold-500)',
  SECRETARIA_CAJA: 'var(--blue-500)',
  DOCENTE: 'var(--blue-500)',
  PORTERIA: 'var(--green-500)',
  APODERADO: 'var(--blue-500)',
};

function searchPlaceholderFor(role: UserRole): string {
  if (role === 'DOCENTE') return 'Buscar estudiante en mis aulas…';
  if (role === 'PORTERIA') return 'Buscar empleado…';
  return 'Buscar estudiante, docente, recibo…';
}

function notificationsFor(role: UserRole): string {
  if (role === 'DOCENTE') return 'Tienes 2 clases sin asistencia hoy · 36% de notas del bimestre pendientes.';
  if (role === 'PORTERIA') return '3 empleados aún no marcan ingreso · tolerancia hasta las 8:00.';
  return '8 pensiones vencen el 31/07 · 1 tardanza de personal hoy · caja abierta desde 7:45.';
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useMe();
  const { toast } = useToast();

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  // En móvil (<768) el sidebar es un drawer sobre overlay (responsive.md);
  // el hamburger lo abre en vez de colapsarlo.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen]);

  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const onMenuClick = () => {
    if (isMobile()) setMobileNavOpen((v) => !v);
    else toggleSidebar();
  };
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const selectedYearName = useYearStore((s) => s.selectedYearName);
  const setSelectedYear = useYearStore((s) => s.setSelectedYear);

  const isAdmin = me?.role === 'ADMIN';

  const yearsQuery = useQuery<AcademicYear[]>({
    queryKey: ['academic-years'],
    queryFn: () => apiFetch<AcademicYear[]>('/academic-years'),
    enabled: isAdmin,
  });

  const logout = useMutation({
    mutationFn: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      navigate('/login');
    },
  });

  if (!me) return null;

  const role = me.role;
  const userName = me.fullName;
  const userRoleLabel = USER_ROLE_LABELS[role];
  const userColor = ROLE_COLOR[role];

  const activeId = location.pathname.split('/')[1] || 'dash';
  const meta = META[activeId] ?? { title: 'Sección', crumbs: ['Inicio'] };

  const years = yearsQuery.data ?? [];
  const activeYearName = years.find((y) => y.status === 'ACTIVO')?.name ?? null;
  const currentYearName = selectedYearName ?? activeYearName ?? '';
  const viewingClosedYear =
    selectedYearName != null && activeYearName != null && selectedYearName !== activeYearName;

  return (
    <div className="app">
      {mobileNavOpen && (
        <div className="app__nav-overlay" onClick={() => setMobileNavOpen(false)} aria-hidden />
      )}
      <Sidebar
        className={mobileNavOpen ? 'app__sidebar app__sidebar--open' : 'app__sidebar'}
        logoSrc="/elohim-insignia.png"
        brandName="Elohim"
        brandSub="SGE"
        items={NAV_BY_ROLE(role, me.permissions)}
        activeId={activeId}
        onSelect={(id) => {
          setMobileNavOpen(false);
          navigate('/' + id);
        }}
        collapsed={sidebarCollapsed}
        footer={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: sidebarCollapsed ? 0 : '2px 4px',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            }}
          >
            <Avatar name={userName} size="sm" color={userColor} />
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: 'var(--type-label)', color: '#fff', whiteSpace: 'nowrap' }}>{userName}</div>
                <div style={{ font: 'var(--type-2xs)', color: 'var(--sidebar-muted)' }}>{userRoleLabel}</div>
              </div>
            )}
            {!sidebarCollapsed && (
              <span
                style={{ color: 'var(--sidebar-muted)', cursor: 'pointer', display: 'inline-flex' }}
                title="Cerrar sesión"
                onClick={() => logout.mutate()}
              >
                <Icons.Logout />
              </span>
            )}
          </div>
        }
      />
      <div className="app__main">
        <Topbar
          menuButton={
            <IconButton label="Menú">
              <Icons.Dashboard />
            </IconButton>
          }
          onMenuClick={onMenuClick}
          searchPlaceholder={searchPlaceholderFor(role)}
          actions={
            <>
              {isAdmin && (
                <Tooltip content="Año académico">
                  <span style={{ display: 'inline-flex' }}>
                    <Select
                      size="sm"
                      options={years.map((y) => y.name)}
                      value={currentYearName}
                      aria-label="Año académico"
                      onChange={(e) => {
                        const name = e.target.value;
                        setSelectedYear(name === activeYearName ? null : name);
                        const isActive = name === activeYearName;
                        toast(
                          isActive ? 'info' : 'warning',
                          `Año académico ${name}`,
                          isActive
                            ? 'Año en curso — edición habilitada.'
                            : 'Año cerrado — consulta en modo solo lectura.',
                        );
                      }}
                      containerStyle={{ width: 92 }}
                    />
                  </span>
                </Tooltip>
              )}
              <Tooltip content={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0 4px' }}>
                  <Switch
                    checked={theme === 'dark'}
                    onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    size="sm"
                  />
                </span>
              </Tooltip>
              <Tooltip content="Notificaciones">
                <IconButton label="Notificaciones" onClick={() => toast('info', 'Notificaciones', notificationsFor(role))}>
                  <Icons.Bell />
                </IconButton>
              </Tooltip>
            </>
          }
          user={{
            name: userName,
            role: userRoleLabel,
            avatar: <Avatar name={userName} size="sm" color={userColor} />,
            onClick: () => toast('info', 'Cuenta', `${userName} · ${userRoleLabel} · sesión iniciada a las 07:40.`),
          }}
        />
        {viewingClosedYear && (
          <div
            style={{
              background: 'var(--warning-soft)',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              font: 'var(--type-label)',
              color: 'var(--warning-soft-fg)',
              flexShrink: 0,
            }}
          >
            <Icons.Lock style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>
              Año académico <b>{selectedYearName}</b> cerrado — estás consultando el histórico en modo solo lectura. Notas,
              pagos y asistencia de ese año no se pueden modificar.
            </span>
            <Button size="sm" variant="secondary" onClick={() => setSelectedYear(null)}>
              Volver a {activeYearName}
            </Button>
          </div>
        )}
        <div className="app__content">
          <div className="app__pagehead">
            <div>
              <div className="app__crumb">
                <Breadcrumb
                  items={meta.crumbs.map((c, i) => ({
                    label: c,
                    href: i < meta.crumbs.length - 1 ? '#' : undefined,
                    icon: i === 0 ? <Icons.Home /> : undefined,
                  }))}
                />
              </div>
              <h1 className="app__title">{meta.title}</h1>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
