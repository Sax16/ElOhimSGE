// Pestaña «Gastos» / «Otros ingresos» (mismo componente parametrizado por kind).
// Filtros (búsqueda debounced + categoría), tabla con Origen (solo gastos),
// método, monto coloreado y acciones (Editar/Anular solo en MANUAL activo).
import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  IconButton,
  Icons,
  Input,
  Pagination,
  Select,
  Table,
  Textarea,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import {
  PAYMENT_METHOD_LABELS,
  TREASURY_ORIGIN_LABELS,
  formatPEN,
  toCents,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDayMonth } from '../structure/bits';
import { methodTone } from '../cashier/bits';
import { useCancelMovement, useTreasuryCategories, useTreasuryMovements } from './api';
import { MonthYearSelect } from './bits';
import { MovDialog } from './MovDialog';
import { RenditionDetailDialog } from './RenditionDetailDialog';
import type { MovementsQuery, TreasuryKind, TreasuryMovement } from './types';

const PAGE_SIZE = 10;

export function MovTab({
  kind,
  month,
  year,
  onMonth,
  onYear,
  canEdit,
}: {
  kind: TreasuryKind;
  month: number;
  year: number;
  onMonth: (m: number) => void;
  onYear: (y: number) => void;
  canEdit: boolean;
}) {
  const { toast } = useToast();
  const esGasto = kind === 'GASTO';
  const { data: categories } = useTreasuryCategories(kind);
  const cancel = useCancelMovement();

  const [categoryId, setCategoryId] = useState<string>('');
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  const [dialog, setDialog] = useState<{ movement: TreasuryMovement | null } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<TreasuryMovement | null>(null);
  const [renditionId, setRenditionId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, debounced, month, year, kind]);

  const query: MovementsQuery = useMemo(
    () => ({ kind, categoryId: categoryId || null, month, year, q: debounced, page, pageSize: PAGE_SIZE }),
    [kind, categoryId, month, year, debounced, page],
  );

  const { data, isLoading } = useTreasuryMovements(query);
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filterTotalCents = rows.reduce(
    (acc, r) => (r.status === 'ANULADO' ? acc : acc + toCents(r.amount)),
    0,
  );

  const cols: TableColumn<TreasuryMovement>[] = [
    { key: 'code', header: 'N°', mono: true, width: 90 },
    {
      key: 'date',
      header: 'Fecha',
      mono: true,
      align: 'center',
      width: 74,
      render: (v) => fmtDayMonth(v as string),
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>
          {esGasto && r.supplier && (
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.supplier}</span>
          )}
        </div>
      ),
    },
    {
      key: 'categoryName',
      header: 'Categoría',
      render: (v) => <Badge tone={esGasto ? 'danger' : 'success'}>{v as string}</Badge>,
    },
    ...(esGasto
      ? ([
          {
            key: 'origin',
            header: 'Origen',
            align: 'center',
            render: (_v, r) =>
              r.origin === 'CAJA_CHICA' && r.originRef ? (
                <Button size="sm" variant="link" onClick={() => setRenditionId(r.originRef)}>
                  {TREASURY_ORIGIN_LABELS.CAJA_CHICA} · {r.originRef}
                </Button>
              ) : (
                <Badge tone="neutral">{TREASURY_ORIGIN_LABELS.MANUAL}</Badge>
              ),
          },
        ] as TableColumn<TreasuryMovement>[])
      : []),
    {
      key: 'method',
      header: 'Método',
      align: 'center',
      render: (_v, r) => <Badge tone={methodTone(r.method)}>{PAYMENT_METHOD_LABELS[r.method]}</Badge>,
    },
    {
      key: 'amount',
      header: 'Monto',
      num: true,
      mono: true,
      render: (v, r) => {
        const cents = toCents(v as string);
        if (r.status === 'ANULADO') {
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{formatPEN(cents)}</span>
              <Badge tone="neutral">Anulado</Badge>
            </span>
          );
        }
        return (
          <span style={{ fontWeight: 600, color: esGasto ? 'var(--danger)' : 'var(--success)' }}>
            {esGasto ? '−' : '+'} {formatPEN(cents)}
          </span>
        );
      },
    },
    {
      key: 'registeredByName',
      header: 'Registró',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Avatar name={v as string} size="xs" />
          <span style={{ font: 'var(--type-caption)' }}>{v}</span>
        </div>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => {
        if (r.origin === 'CAJA_CHICA') {
          return (
            <Tooltip content="Se gestiona en Caja chica">
              <IconButton
                label="Ver origen"
                size="sm"
                disabled={!r.originRef}
                onClick={() => r.originRef && setRenditionId(r.originRef)}
              >
                <Icons.Eye />
              </IconButton>
            </Tooltip>
          );
        }
        if (r.status === 'ANULADO') return null;
        return (
          <div style={{ display: 'inline-flex', gap: 2 }}>
            {canEdit && (
              <Tooltip content="Editar">
                <IconButton label="Editar" size="sm" onClick={() => setDialog({ movement: r })}>
                  <Icons.Pencil />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip content="Anular">
                <IconButton label="Anular" size="sm" variant="danger" onClick={() => setCancelTarget(r)}>
                  <Icons.Trash />
                </IconButton>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  const catFilterOptions = [
    { value: '', label: 'Todas las categorías' },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="esge-treasury-filters">
        <div className="esge-treasury-filters__search">
          <Input
            placeholder="Buscar por descripción, proveedor o N°…"
            iconLeft={<Icons.Search />}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <Select
          options={catFilterOptions}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          containerStyle={{ width: 220 }}
        />
        <MonthYearSelect month={month} year={year} onMonth={onMonth} onYear={onYear} />
        {canEdit && (
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setDialog({ movement: null })}>
            {esGasto ? 'Registrar gasto' : 'Registrar ingreso'}
          </Button>
        )}
      </div>

      {!isLoading && rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Icons.Search />}
            title={esGasto ? 'Sin gastos' : 'Sin ingresos'}
            description="No hay movimientos que coincidan con estos filtros este mes."
          />
        </Card>
      ) : (
        <Card flush>
          <Table
            columns={cols}
            data={rows}
            rowKey="id"
            hover
            zebra
            emptyText={isLoading ? 'Cargando…' : 'Sin movimientos.'}
          />
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Pagination page={page} pageCount={pageCount} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            <span
              style={{
                font: 'var(--type-label)',
                fontFamily: 'var(--font-mono)',
                color: esGasto ? 'var(--danger)' : 'var(--success)',
              }}
            >
              {esGasto ? '−' : '+'} {formatPEN(filterTotalCents)}{' '}
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                en esta página
              </span>
            </span>
          </div>
        </Card>
      )}

      <MovDialog
        kind={kind}
        open={!!dialog}
        movement={dialog?.movement ?? null}
        canEdit={canEdit}
        onClose={() => setDialog(null)}
      />
      <CancelMovementDialog
        target={cancelTarget}
        esGasto={esGasto}
        pending={cancel.isPending}
        onClose={() => setCancelTarget(null)}
        onConfirm={(id, reason) =>
          cancel.mutate(
            { id, reason },
            {
              onSuccess: () => {
                toast('warning', 'Movimiento anulado', `${cancelTarget?.code} anulado — queda en el historial con motivo.`);
                setCancelTarget(null);
              },
              onError: (err) =>
                toast('danger', 'No se pudo anular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
            },
          )
        }
      />
      <RenditionDetailDialog id={renditionId} onClose={() => setRenditionId(null)} />
    </div>
  );
}

// ---- Diálogo de anulación (motivo ≥ 10, patrón existente) -------------------
function CancelMovementDialog({
  target,
  esGasto,
  pending,
  onClose,
  onConfirm,
}: {
  target: TreasuryMovement | null;
  esGasto: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [target?.id]);

  const valid = reason.trim().length >= 10;

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      icon={<Icons.Trash />}
      iconTone="danger"
      title={esGasto ? 'Anular gasto' : 'Anular ingreso'}
      description={
        target ? `${target.code} · ${target.description} · ${formatPEN(toCents(target.amount))}` : ''
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            iconLeft={<Icons.Trash />}
            disabled={!valid || pending}
            onClick={() => target && onConfirm(target.id, reason.trim())}
          >
            {esGasto ? 'Anular gasto' : 'Anular ingreso'}
          </Button>
        </>
      }
    >
      <div style={{ paddingTop: 4 }}>
        <Textarea
          label="Motivo de anulación"
          rows={2}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej. monto erróneo, duplicado…"
          hint={valid ? 'Listo' : `${Math.max(0, 10 - reason.trim().length)} caracteres más`}
        />
      </div>
    </Dialog>
  );
}
