// Pantalla Apoderados (Etapa 4): listado con estado de cuenta consolidado.
import { useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  Icons,
  Input,
  Pagination,
  Select,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { formatPEN } from '@elohim/shared';
import { avatarColor, useYearReadOnly } from '../students/bits';
import { useCan } from '../../lib/useCan';
import { useGuardians, type GuardiansFilters } from './api';
import { GuardianDialog } from './GuardianDialog';
import { GuardianFormDialog } from './GuardianFormDialog';
import { BulkAccessDialog } from './BulkAccessDialog';
import type { GuardianAccountFilter, GuardianDetail, GuardianListItem } from './types';

const PAGE_SIZE = 20;

const ACCOUNT_OPTIONS: { value: GuardianAccountFilter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'al_dia', label: 'Al día' },
  { value: 'con_deuda', label: 'Con deuda' },
];

export function GuardiansPage() {
  const { toast } = useToast();
  const readOnly = useYearReadOnly();
  const canEdit = useCan('apoderados', 'editar');

  const [search, setSearch] = useState('');
  const [account, setAccount] = useState<GuardianAccountFilter>('todas');
  const [page, setPage] = useState(1);

  const [fichaId, setFichaId] = useState<string | null>(null);
  const [form, setForm] = useState<{ guardian?: GuardianDetail } | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const filters: GuardiansFilters = { search, account, page, pageSize: PAGE_SIZE };
  const { data, isLoading } = useGuardians(filters);
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetTo = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const columns: TableColumn<GuardianListItem>[] = [
    {
      key: 'nombre',
      header: 'Apoderado',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.fullName} size="sm" color={avatarColor(r.code)} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</span>
            <span style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {r.code}
            </span>
          </div>
        </div>
      ),
    },
    { key: 'dni', header: 'DNI', mono: true },
    { key: 'phone', header: 'Teléfono', mono: true },
    { key: 'childrenCount', header: 'Hijos', align: 'center', mono: true },
    {
      key: 'debt',
      header: 'Deuda familiar',
      num: true,
      mono: true,
      render: (_v, r) =>
        r.debtCents > 0 ? (
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatPEN(r.debtCents)}</span>
        ) : (
          <Badge tone="success" dot>
            Al día
          </Badge>
        ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 2 }}>
          <Tooltip content="Recordatorio de pago">
            <IconButton
              label="Recordatorio de pago"
              size="sm"
              onClick={() =>
                toast(
                  'info',
                  'Módulo de cobranza (R2)',
                  'Los recordatorios de pago llegan con el módulo de cobranza.',
                )
              }
            >
              <Icons.Send />
            </IconButton>
          </Tooltip>
          <Tooltip content="Ver ficha">
            <IconButton label="Ver ficha" size="sm" onClick={() => setFichaId(r.id)}>
              <Icons.Eye />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            placeholder="Buscar por nombre, DNI o teléfono…"
            iconLeft={<Icons.Search />}
            value={search}
            onChange={(e) => resetTo(() => setSearch(e.target.value))}
          />
        </div>
        <Select
          aria-label="Estado de cuenta"
          options={ACCOUNT_OPTIONS}
          value={account}
          onChange={(e) => resetTo(() => setAccount(e.target.value as GuardianAccountFilter))}
          containerStyle={{ width: 170 }}
        />
        {!readOnly && canEdit && (
          <Button variant="secondary" iconLeft={<Icons.Lock />} onClick={() => setBulkOpen(true)}>
            Generar accesos pendientes
          </Button>
        )}
        {!readOnly && (
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setForm({})}>
            Registrar apoderado
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
          emptyText={isLoading ? 'Cargando apoderados…' : 'No hay apoderados que coincidan.'}
        />
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
            total={total}
            pageSize={PAGE_SIZE}
          />
        </div>
      </Card>

      <GuardianDialog
        guardianId={fichaId}
        readOnly={readOnly}
        onClose={() => setFichaId(null)}
        onEdit={(guardian) => {
          setFichaId(null);
          setForm({ guardian });
        }}
      />

      <GuardianFormDialog
        open={!!form}
        guardian={form?.guardian ?? null}
        readOnly={readOnly}
        onClose={() => setForm(null)}
      />

      <BulkAccessDialog open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}
