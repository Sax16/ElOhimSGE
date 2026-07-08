// Página de QA visual del design system (solo DEV). Replica los demos de
// design/components/**/**.card.html para revisar los componentes portados.
import { useState, type CSSProperties } from 'react';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Dialog,
  EmptyState,
  Icons,
  IconButton,
  Input,
  Pagination,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Sidebar,
  StatCard,
  Switch,
  Table,
  Tabs,
  Toast,
  Tooltip,
  Topbar,
  type TableColumn,
} from '@elohim/ui';
import { useThemeStore } from '../../stores/theme.store';

const sub: CSSProperties = {
  font: 'var(--type-caption)',
  textTransform: 'uppercase',
  letterSpacing: 'var(--tracking-caps)',
  color: 'var(--text-muted)',
  fontWeight: 600,
  marginBottom: 10,
};
const panel: CSSProperties = {
  background: 'var(--surface-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: 18,
};
const row: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' };

interface StudentRow {
  codigo: string;
  nombre: string;
  grado: string;
  estado: string;
  deuda: string;
}

const columns: TableColumn<StudentRow>[] = [
  { key: 'codigo', header: 'Código', mono: true, width: 92 },
  { key: 'nombre', header: 'Estudiante' },
  { key: 'grado', header: 'Grado', align: 'center' },
  { key: 'estado', header: 'Estado', render: (v) => <Badge tone={v === 'Activo' ? 'success' : 'neutral'} dot>{v}</Badge> },
  { key: 'deuda', header: 'Deuda', num: true, mono: true, render: (v) => `S/ ${v}` },
];
const rows: StudentRow[] = [
  { codigo: 'E-1042', nombre: 'María Quispe Roca', grado: '3° Prim', estado: 'Activo', deuda: '0.00' },
  { codigo: 'E-1043', nombre: 'José Ramos Lía', grado: '5° Prim', estado: 'Activo', deuda: '280.00' },
  { codigo: 'E-1051', nombre: 'Ana Flores M.', grado: '1° Sec', estado: 'Retirado', deuda: '560.00' },
];

export function DevKitPage() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [turno, setTurno] = useState('m');
  const [tab, setTab] = useState('notas');
  const [page, setPage] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shellRoute, setShellRoute] = useState('est');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-app)', padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ font: 'var(--type-h1)' }}>Design system — QA</h1>
          <Switch
            label="Modo oscuro"
            checked={theme === 'dark'}
            onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        </div>

        {/* ---- Forms ---- */}
        <section>
          <h2 style={{ font: 'var(--type-h2)', marginBottom: 14 }}>Formularios</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <div style={sub}>Buttons</div>
              <div style={panel}>
                <div style={{ ...row, marginBottom: 12 }}>
                  <Button variant="primary" iconLeft={<Icons.Plus />}>Nuevo</Button>
                  <Button variant="accent">Matricular</Button>
                  <Button variant="secondary">Cancelar</Button>
                  <Button variant="ghost">Ver</Button>
                  <Button variant="danger" iconLeft={<Icons.Trash />}>Eliminar</Button>
                </div>
                <div style={row}>
                  <Button size="sm">Pequeño</Button>
                  <Button size="md">Mediano</Button>
                  <Button size="lg">Grande</Button>
                  <Button disabled>Deshabilitado</Button>
                  <IconButton label="Buscar" variant="outline"><Icons.Search /></IconButton>
                  <IconButton label="Agregar" variant="solid"><Icons.Plus /></IconButton>
                </div>
              </div>
            </div>
            <div>
              <div style={sub}>Inputs y selects</div>
              <div style={{ ...panel, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Nombre del estudiante" placeholder="María Quispe" iconLeft={<Icons.Search />} />
                <Input label="Pensión" prefix="S/." defaultValue="280.00" />
                <Select label="Grado" placeholder="Seleccione" options={['1° Primaria', '2° Primaria', '3° Primaria']} />
                <Input label="Correo" type="email" error="Correo no válido" defaultValue="abc@" />
              </div>
            </div>
            <div>
              <div style={sub}>Controles de selección</div>
              <div style={{ ...panel, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Checkbox label="Becado" description="Exonera 50%" defaultChecked />
                  <Checkbox indeterminate label="Seleccionar todos" />
                  <Switch label="Pago en línea" defaultChecked />
                </div>
                <RadioGroup name="t" value={turno} onChange={(e) => setTurno(e.target.value)}>
                  <Radio value="m" label="Turno mañana" />
                  <Radio value="t" label="Turno tarde" />
                </RadioGroup>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Data ---- */}
        <section>
          <h2 style={{ font: 'var(--type-h2)', marginBottom: 14 }}>Datos y presentación</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={sub}>Stat cards</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                <StatCard label="Estudiantes" value="482" icon={<Icons.Users />} delta={4.2} caption="vs. 2025" />
                <StatCard label="Cobrado (Jun)" value="S/ 84,320" iconTone="success" icon={<Icons.Cash />} delta={-2.1} caption="del mes" />
                <StatCard label="Morosidad" value="12.4%" iconTone="danger" icon={<Icons.Cash />} delta={1.3} deltaDirection="up" />
              </div>
            </div>
            <div>
              <div style={sub}>Badges, tags y avatars</div>
              <Card>
                <div style={{ ...row, marginBottom: 14 }}>
                  <Badge tone="success" dot>Pagado</Badge>
                  <Badge tone="warning" dot>Pendiente</Badge>
                  <Badge tone="danger" dot>Vencido</Badge>
                  <Badge tone="brand">Matriculado</Badge>
                  <Badge tone="accent" solid>Becado</Badge>
                  <Badge tone="neutral">Retirado</Badge>
                </div>
                <div style={{ ...row, justifyContent: 'space-between' }}>
                  <AvatarGroup max={4}>
                    <Avatar name="María Quispe" color="var(--blue-500)" />
                    <Avatar name="José Ramos" color="var(--gold-500)" />
                    <Avatar name="Ana Flores" color="var(--green-500)" />
                    <Avatar name="Luis Paz" />
                    <Avatar name="Rosa Lima" />
                    <Avatar name="Hugo Vela" />
                  </AvatarGroup>
                  <div style={{ flex: 1, maxWidth: 240 }}>
                    <ProgressBar value={87} label="Asistencia hoy" showValue tone="success" />
                  </div>
                </div>
              </Card>
            </div>
            <div>
              <div style={sub}>Tabla de datos</div>
              <Card flush>
                <Table columns={columns} data={rows} hover zebra />
              </Card>
            </div>
          </div>
        </section>

        {/* ---- Navigation ---- */}
        <section>
          <h2 style={{ font: 'var(--type-h2)', marginBottom: 14 }}>Navegación</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={sub}>App shell · sidebar + topbar</div>
              <div style={{ height: 280, display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <Sidebar
                  logoSrc="/elohim-insignia.png"
                  activeId={shellRoute}
                  onSelect={setShellRoute}
                  items={[
                    { id: 'dash', label: 'Panel', icon: <Icons.Home /> },
                    { id: 'est', label: 'Estudiantes', icon: <Icons.Users />, section: 'Académico' },
                    { id: 'notas', label: 'Notas', icon: <Icons.Book /> },
                    { id: 'pagos', label: 'Pensiones', icon: <Icons.Cash />, badge: 8, section: 'Finanzas' },
                  ]}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface-app)' }}>
                  <Topbar
                    title="Estudiantes"
                    actions={<IconButton label="Notificaciones"><Icons.Bell /></IconButton>}
                    user={{ name: 'Dir. Pérez', role: 'Administrador', avatar: <Avatar name="Dir Pérez" size="sm" color="var(--blue-500)" /> }}
                  />
                  <div style={{ padding: 18 }}>
                    <Breadcrumb items={[{ label: 'Inicio', href: '#', icon: <Icons.Home /> }, { label: 'Estudiantes', href: '#' }, { label: 'María Quispe' }]} />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div style={sub}>Tabs y paginación</div>
              <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Tabs value={tab} onChange={setTab} items={[{ id: 'datos', label: 'Datos' }, { id: 'notas', label: 'Notas', count: 4 }, { id: 'asist', label: 'Asistencia' }, { id: 'pagos', label: 'Pagos' }]} />
                <Tabs variant="pill" value={tab} onChange={setTab} items={[{ id: 'datos', label: 'Datos' }, { id: 'notas', label: 'Notas' }, { id: 'asist', label: 'Asistencia' }]} />
                <Pagination page={page} pageCount={24} onPageChange={setPage} total={482} pageSize={20} />
              </div>
            </div>
          </div>
        </section>

        {/* ---- Feedback ---- */}
        <section>
          <h2 style={{ font: 'var(--type-h2)', marginBottom: 14 }}>Feedback</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={sub}>Alerts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Alert tone="success" title="Matrícula registrada">El estudiante fue matriculado en 3° Primaria.</Alert>
                <Alert tone="warning" title="Pensión vencida" onClose={() => {}}>Hay 2 cuotas pendientes de pago.</Alert>
                <Alert tone="danger" title="Error de validación">El número de DNI ya está registrado.</Alert>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, alignItems: 'start' }}>
              <div>
                <div style={sub}>Toast y dialog</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Toast tone="success" title="Pago registrado" message="S/ 280.00 · María Quispe" onClose={() => {}} style={{ position: 'relative', width: '100%' }} />
                  <Button variant="secondary" onClick={() => setDialogOpen(true)}>Abrir diálogo</Button>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Tooltip content="Exportar a Excel"><IconButton label="Exportar" variant="outline"><Icons.Download /></IconButton></Tooltip>
                    <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>← pasa el cursor</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={sub}>Empty state</div>
                <div style={{ ...panel, padding: 0 }}>
                  <EmptyState
                    size="sm"
                    icon={<Icons.Box />}
                    title="Sin estudiantes"
                    description="Aún no hay matriculados en este grado."
                    actions={<Button size="sm" iconLeft={<Icons.Plus />}>Matricular</Button>}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Eliminar estudiante"
          description="Esta acción no se puede deshacer."
          icon={<Icons.Trash />}
          iconTone="danger"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button variant="danger">Eliminar</Button>
            </>
          }
        >
          ¿Seguro que deseas eliminar a <b>María Quispe</b> del registro?
        </Dialog>
      </div>
    </div>
  );
}
