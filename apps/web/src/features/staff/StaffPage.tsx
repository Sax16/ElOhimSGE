// Pantalla Personal (R3 · Etapa 1): pestaña "Personal" (listado + ficha + alta).
// Las pestañas "Asistencia y marcación" y "Planilla" llegan más adelante en R3.
// Spec: design/ui_kits/sge/StaffScreen.jsx (pestaña Personal).
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  Icons,
  Input,
  Select,
  Table,
  Tabs,
  Tooltip,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { useCan } from '../../lib/useCan';
import { useStaff } from './api';
import {
  EMPLOYMENT_TYPE_LABELS,
  STAFF_ROLES,
  STAFF_ROLE_LABELS,
  STAFF_ROLE_TONE,
  STAFF_STATUSES,
  STAFF_STATUS_LABELS,
  STAFF_STATUS_TONE,
  avatarColor,
  formatSalary,
} from './bits';
import { StaffDialog } from './StaffDialog';
import { StaffFormDialog } from './StaffFormDialog';
import { AttendanceTab } from './attendance/AttendanceTab';
import { PayrollTab } from './payroll/PayrollTab';
import type { StaffDto, StaffRole, StaffStatus } from './types';

type TabId = 'personal' | 'asist' | 'planilla';

export function StaffPage() {
  // El Dashboard puede enlazar directo a la pestaña Planilla (state del router).
  const location = useLocation();
  const initialTab = (location.state as { tab?: TabId } | null)?.tab ?? 'personal';
  const [tab, setTab] = useState<TabId>(initialTab);
  const canEdit = useCan('personal', 'editar');

  const { data, isLoading } = useStaff();
  const staff = useMemo(() => data ?? [], [data]);
  const activeCount = staff.filter((s) => s.status !== 'INACTIVO').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'personal', label: 'Personal', count: activeCount || undefined },
          { id: 'asist', label: 'Asistencia y marcación' },
          { id: 'planilla', label: 'Planilla' },
        ]}
      />

      {tab === 'personal' && <PersonalTab staff={staff} isLoading={isLoading} canEdit={canEdit} />}
      {tab === 'asist' && <AttendanceTab />}
      {tab === 'planilla' && <PayrollTab />}
    </div>
  );
}

function PersonalTab({
  staff,
  isLoading,
  canEdit,
}: {
  staff: StaffDto[];
  isLoading: boolean;
  canEdit: boolean;
}) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('');
  const [status, setStatus] = useState<StaffStatus | ''>('');
  const [ficha, setFicha] = useState<StaffDto | null>(null);
  const [form, setForm] = useState<{ staff?: StaffDto } | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return staff.filter((s) => {
      if (role && s.role !== role) return false;
      if (status && s.status !== status) return false;
      if (!term) return true;
      return (
        s.fullName.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.dni.includes(term)
      );
    });
  }, [staff, search, role, status]);

  const columns: TableColumn<StaffDto>[] = [
    { key: 'code', header: 'Código', mono: true, width: 90 },
    {
      key: 'nombre',
      header: 'Empleado',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.fullName} size="sm" color={avatarColor(r.code)} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</span>
            {r.area && (
              <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.area}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      align: 'center',
      render: (_v, r) => <Badge tone={STAFF_ROLE_TONE[r.role]}>{STAFF_ROLE_LABELS[r.role]}</Badge>,
    },
    {
      key: 'employmentType',
      header: 'Régimen',
      render: (_v, r) => EMPLOYMENT_TYPE_LABELS[r.employmentType],
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => (
        <Badge tone={STAFF_STATUS_TONE[r.status]} dot>
          {STAFF_STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
    {
      key: 'baseSalary',
      header: 'Sueldo base',
      num: true,
      mono: true,
      render: (_v, r) => formatSalary(r.baseSalary),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 2 }}>
          <Tooltip content="Ver ficha">
            <IconButton label="Ver ficha" size="sm" onClick={() => setFicha(r)}>
              <Icons.Eye />
            </IconButton>
          </Tooltip>
          {canEdit && (
            <Tooltip content="Editar">
              <IconButton label="Editar" size="sm" onClick={() => setForm({ staff: r })}>
                <Icons.Pencil />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            placeholder="Buscar por nombre, código o DNI…"
            iconLeft={<Icons.Search />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          aria-label="Rol"
          placeholder="Rol"
          options={STAFF_ROLES.map((r) => ({ value: r, label: STAFF_ROLE_LABELS[r] }))}
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          containerStyle={{ width: 150 }}
        />
        <Select
          aria-label="Estado"
          placeholder="Estado"
          options={STAFF_STATUSES.map((s) => ({ value: s, label: STAFF_STATUS_LABELS[s] }))}
          value={status}
          onChange={(e) => setStatus(e.target.value as StaffStatus)}
          containerStyle={{ width: 140 }}
        />
        {canEdit && (
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setForm({})}>
            Registrar empleado
          </Button>
        )}
      </div>

      <Card flush>
        <Table
          columns={columns}
          data={rows}
          rowKey="id"
          hover
          zebra
          emptyText={isLoading ? 'Cargando personal…' : 'No hay empleados que coincidan.'}
        />
      </Card>

      <StaffDialog
        staff={ficha}
        canEdit={canEdit}
        onClose={() => setFicha(null)}
        onEdit={(s) => {
          setFicha(null);
          setForm({ staff: s });
        }}
      />

      <StaffFormDialog open={!!form} staff={form?.staff ?? null} onClose={() => setForm(null)} />
    </div>
  );
}
