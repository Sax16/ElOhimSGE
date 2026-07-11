// Pantalla Pensiones (R2 · Etapa 2): seguimiento de cobranza. El cobro siempre
// ocurre en Caja; aquí se deriva («Cobrar en caja»), se recuerda por WhatsApp y
// el Admin exonera mora o corre la mora del día.
// Spec: design/ui_kits/sge/PaymentsScreen.jsx con los reemplazos de la etapa 2
// (alcance-funcional.md § «Pensiones — decisiones de la etapa 2»).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
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
  StatCard,
  Table,
  Tabs,
  Tag,
  Textarea,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { BadgeTone, TableColumn } from '@elohim/ui';
import { INSTALLMENT_STATUS_LABELS, formatPEN, toCents, type InstallmentStatus } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useCan } from '../../lib/useCan';
import { useMe } from '../../lib/useMe';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { fmtDate, fmtDayMonth } from '../structure/bits';
import { useReceipt } from '../cashier/api';
import { ReceiptDialog } from '../cashier/ReceiptDialog';
import {
  useExonerateLateFee,
  useInstallments,
  usePensionStats,
  useReminderPreview,
  useRunLateFees,
  useSendReminder,
} from './api';
import type { InstallmentRow, InstallmentsQuery, PensionStatusFilter, PensionTypeFilter } from './types';
import './payments.css';

const MONTH_NAMES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Mes actual acotado al año lectivo (marzo–diciembre). */
function defaultMonth(): number {
  return Math.min(12, Math.max(3, new Date().getMonth() + 1));
}

const TYPE_OPTIONS: { value: PensionTypeFilter; label: string }[] = [
  { value: 'PENSION', label: 'Pensiones' },
  { value: 'MATRICULA', label: 'Matrículas' },
  { value: 'PROGRAMA', label: 'Programas' },
  { value: 'TODAS', label: 'Todas' },
];

const TABS: { id: string; label: string; status: PensionStatusFilter }[] = [
  { id: 'todas', label: 'Todas', status: 'TODAS' },
  { id: 'pend', label: 'Pendientes', status: 'PENDIENTES' },
  { id: 'pag', label: 'Pagadas', status: 'PAGADAS' },
  { id: 'venc', label: 'Vencidas', status: 'VENCIDAS' },
];

const STATUS_TONE: Record<InstallmentStatus, BadgeTone> = {
  PAGADO: 'success',
  PENDIENTE: 'warning',
  VENCIDO: 'danger',
  ANULADO: 'neutral',
  EXONERADO: 'info',
};

const PAGE_SIZE = 20;

export function PensionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { yearId, yearName, readOnly } = useSelectedYear();
  const canEdit = useCan('pensiones', 'editar');
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const canMutate = canEdit && !readOnly;

  const [month, setMonth] = useState<number | null>(defaultMonth());
  const [type, setType] = useState<PensionTypeFilter>('PENSION');
  const [tab, setTab] = useState<string>('todas');
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  // Diálogos.
  const [reminderTarget, setReminderTarget] = useState<{ id: string; name: string } | null>(null);
  const [exonerateTarget, setExonerateTarget] = useState<InstallmentRow | null>(null);
  const [runLateFees, setRunLateFees] = useState(false);
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);

  const receiptQuery = useReceipt(viewReceiptId);

  // Debounce ~300ms de la búsqueda.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  const status = TABS.find((t) => t.id === tab)?.status ?? 'TODAS';

  // Al cambiar cualquier filtro, vuelve a la primera página.
  useEffect(() => {
    setPage(1);
  }, [month, type, status, debounced, yearId]);

  const query: InstallmentsQuery = useMemo(
    () => ({ yearId, month, type, status, q: debounced, page, pageSize: PAGE_SIZE }),
    [yearId, month, type, status, debounced, page],
  );

  const { data, isLoading, isError, error } = useInstallments(query);
  const stats = usePensionStats(yearId, month).data;

  // Errores de carga → toast danger.
  useEffect(() => {
    if (isError) {
      toast('danger', 'No se pudieron cargar las cuotas', error instanceof ApiError ? error.message : 'Inténtalo de nuevo.');
    }
  }, [isError, error, toast]);

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const monthName = month != null ? MONTH_NAMES[month] : null;

  const goCollect = (r: InstallmentRow) => {
    navigate(`/caja?student=${encodeURIComponent(r.studentId)}&installment=${encodeURIComponent(r.id)}`);
  };

  const cols: TableColumn<InstallmentRow>[] = [
    {
      key: 'studentName',
      header: 'Estudiante',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.studentName} size="sm" color="var(--blue-500)" />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.gradeSection}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'concept',
      header: 'Concepto',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{v}</span>
          {r.source === 'PROGRAMA' && <Tag>Programa</Tag>}
        </div>
      ),
    },
    { key: 'dueDate', header: 'Vence', mono: true, align: 'center', render: (v) => fmtDayMonth(v as string) },
    {
      key: 'totalWithFee',
      header: 'Monto',
      align: 'right',
      render: (_v, r) => {
        const lateCents = r.lateFee ? toCents(r.lateFee) : 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
              {formatPEN(toCents(r.totalWithFee ?? r.amount))}
            </span>
            {lateCents > 0 ? (
              <span style={{ font: 'var(--type-2xs)', color: 'var(--danger)' }}>+ mora {formatPEN(lateCents)}</span>
            ) : r.exonerated ? (
              <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>mora exonerada</span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v) => (
        <Badge tone={STATUS_TONE[v as InstallmentStatus]} dot>
          {INSTALLMENT_STATUS_LABELS[v as InstallmentStatus]}
        </Badge>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => <RowActions row={r} />,
    },
  ];

  function RowActions({ row }: { row: InstallmentRow }) {
    if (row.status === 'PAGADO') {
      return row.receiptId ? (
        <Tooltip content="Ver recibo">
          <IconButton label="Ver recibo" size="sm" onClick={() => setViewReceiptId(row.receiptId)}>
            <Icons.Receipt />
          </IconButton>
        </Tooltip>
      ) : null;
    }
    if (row.status === 'PENDIENTE' || row.status === 'VENCIDO') {
      const lateCents = row.lateFee ? toCents(row.lateFee) : 0;
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Button size="sm" variant="primary" disabled={!canMutate} onClick={() => goCollect(row)}>
            Cobrar en caja
          </Button>
          <Button
            size="sm"
            variant="ghost"
            iconLeft={<Icons.Send />}
            disabled={!canMutate || !row.guardianId}
            onClick={() => row.guardianId && setReminderTarget({ id: row.guardianId, name: row.guardianName ?? row.studentName })}
          >
            Recordar
          </Button>
          {isAdmin && lateCents > 0 && (
            <Tooltip content="Exonerar mora">
              <IconButton
                label="Exonerar mora"
                size="sm"
                variant="danger"
                disabled={!canMutate}
                onClick={() => setExonerateTarget(row)}
              >
                <Icons.Check />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    }
    return null;
  }

  const overdueRate = stats?.overdueRate ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* StatCards */}
      <div className="esge-pensions-stats">
        <StatCard
          label={`Cobrado · ${monthName ?? 'Año'}`}
          value={stats ? formatPEN(toCents(stats.collectedAmount)) : '—'}
          iconTone="success"
          icon={<Icons.Cash />}
          caption={stats ? `${stats.collectedCount} ${stats.collectedCount === 1 ? 'cuota' : 'cuotas'}` : undefined}
        />
        <StatCard
          label="Por cobrar"
          value={stats ? formatPEN(toCents(stats.pendingAmount)) : '—'}
          iconTone="accent"
          icon={<Icons.Clock />}
          caption={stats ? `${stats.pendingCount} ${stats.pendingCount === 1 ? 'cuota' : 'cuotas'}` : undefined}
        />
        <StatCard
          label="Vencido"
          value={stats ? formatPEN(toCents(stats.overdueAmount)) : '—'}
          iconTone="danger"
          icon={<Icons.Chart />}
          caption={stats ? `${stats.overdueCount} ${stats.overdueCount === 1 ? 'cuota' : 'cuotas'} · acumulado del año` : undefined}
        />
        <StatCard
          label="Morosidad"
          value={stats ? `${overdueRate}%` : '—'}
          iconTone={overdueRate > 10 ? 'danger' : 'brand'}
          icon={<Icons.Chart />}
          caption="cuotas vencidas vs. exigibles"
        />
      </div>

      {/* Card de cuotas */}
      <Card
        flush
        title={`Pensiones · ${monthName ? `${monthName} ` : ''}${yearName}`.trim()}
        actions={
          isAdmin ? (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Icons.Clock />}
              disabled={!canMutate}
              onClick={() => setRunLateFees(true)}
            >
              Aplicar mora del día
            </Button>
          ) : undefined
        }
      >
        <div className="esge-pensions-filters">
          <Select
            label="Mes"
            options={[
              { value: '', label: 'Todo el año' },
              ...Array.from({ length: 10 }, (_, i) => ({ value: String(i + 3), label: MONTH_NAMES[i + 3] ?? '' })),
            ]}
            value={month == null ? '' : String(month)}
            onChange={(e) => setMonth(e.target.value === '' ? null : Number(e.target.value))}
            containerStyle={{ width: 160 }}
          />
          <Select
            label="Tipo"
            options={TYPE_OPTIONS}
            value={type}
            onChange={(e) => setType(e.target.value as PensionTypeFilter)}
            containerStyle={{ width: 170 }}
          />
          <div className="esge-pensions-filters__search">
            <Input
              label="Buscar"
              placeholder="Nombre, código o DNI…"
              iconLeft={<Icons.Search />}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={{ padding: '0 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Tabs
            value={tab}
            onChange={setTab}
            items={TABS.map((t) => ({
              id: t.id,
              label: t.label,
              // Solo el total de la consulta activa; evita 4 queries.
              count: t.id === tab ? total : undefined,
            }))}
          />
        </div>

        {!isLoading && rows.length === 0 ? (
          <EmptyState
            icon={<Icons.Search />}
            title="Sin cuotas"
            description="No hay cuotas que coincidan con estos filtros."
          />
        ) : (
          <Table
            columns={cols}
            data={rows}
            rowKey="id"
            hover
            emptyText={isLoading ? 'Cargando cuotas…' : 'Sin cuotas.'}
          />
        )}

        {total > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
            <Pagination page={page} pageCount={pageCount} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <ReminderDialog
        target={reminderTarget}
        canMutate={canMutate}
        onClose={() => setReminderTarget(null)}
      />
      <ExonerateDialog target={exonerateTarget} onClose={() => setExonerateTarget(null)} />
      <RunLateFeesDialog open={runLateFees} onClose={() => setRunLateFees(false)} />
      <ReceiptDialog
        open={!!viewReceiptId}
        receipt={receiptQuery.data ?? null}
        loading={receiptQuery.isLoading}
        onClose={() => setViewReceiptId(null)}
      />
    </div>
  );
}

// ---- Diálogo Recordar por WhatsApp -----------------------------------------
function ReminderDialog({
  target,
  canMutate,
  onClose,
}: {
  target: { id: string; name: string } | null;
  canMutate: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const preview = useReminderPreview(target?.id ?? null);
  const send = useSendReminder();

  const data = preview.data;
  const previewError = preview.error;

  const submit = () => {
    if (!target || !canMutate) return;
    send.mutate(target.id, {
      onSuccess: (r) => {
        window.open(r.waUrl, '_blank', 'noopener,noreferrer');
        toast('success', 'Recordatorio registrado', `${r.guardianName} · ${formatPEN(toCents(r.totalAmount))} en ${r.itemsCount} ${r.itemsCount === 1 ? 'cuota' : 'cuotas'}.`);
        onClose();
      },
      onError: (err) =>
        toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const blocked =
    !canMutate || preview.isLoading || !!previewError || !data || send.isPending;

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      icon={<Icons.Send />}
      title="Recordar deuda por WhatsApp"
      description={target ? target.name : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Send />} disabled={blocked} onClick={submit}>
            Abrir WhatsApp y registrar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        {preview.isLoading ? (
          <div style={{ padding: '12px 0', color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
        ) : previewError ? (
          <Alert tone="warning" title="No se puede enviar el recordatorio">
            {previewError instanceof ApiError ? previewError.message : 'El apoderado no tiene teléfono o deuda que recordar.'}
          </Alert>
        ) : data ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--surface-sunken)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Avatar name={data.guardianName} size="sm" color="var(--green-500)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{data.guardianName}</div>
                <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {data.phone}
                </div>
              </div>
              <Badge tone="danger" dot>
                {formatPEN(toCents(data.totalAmount))}
              </Badge>
            </div>
            {data.lastReminderAt && (
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                Último recordatorio: {fmtDate(data.lastReminderAt)}
              </div>
            )}
            <div
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-body)',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {data.message}
            </div>
          </>
        ) : null}
      </div>
    </Dialog>
  );
}

// ---- Diálogo Exonerar mora (solo Admin) ------------------------------------
function ExonerateDialog({ target, onClose }: { target: InstallmentRow | null; onClose: () => void }) {
  const { toast } = useToast();
  const exonerate = useExonerateLateFee();
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [target?.id]);

  const valid = reason.trim().length >= 10;

  const submit = () => {
    if (!target || !valid) return;
    exonerate.mutate(
      { id: target.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast('success', 'Mora exonerada', `${target.concept} · ${target.studentName} — la mora se quitó de esta cuota.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo exonerar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const lateCents = target?.lateFee ? toCents(target.lateFee) : 0;

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      icon={<Icons.Check />}
      iconTone="danger"
      title="Exonerar mora"
      description={target ? `${target.concept} · ${target.studentName}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" iconLeft={<Icons.Check />} disabled={!valid || exonerate.isPending} onClick={submit}>
            Exonerar mora
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <Alert tone="info" title="Queda registrado">
          La mora de {lateCents > 0 ? formatPEN(lateCents) : 'esta cuota'} se quita solo de esta cuota; el resto del
          monto se cobra normal. La cuota conserva la marca de exoneración para que el job no la vuelva a cargar. La
          acción queda auditada.
        </Alert>
        <Textarea
          label="Motivo de la exoneración"
          rows={2}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej. pago comprometido antes del vencimiento…"
          hint={valid ? 'Listo' : `${Math.max(0, 10 - reason.trim().length)} caracteres más`}
        />
      </div>
    </Dialog>
  );
}

// ---- Diálogo Aplicar mora del día (solo Admin) -----------------------------
function RunLateFeesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const run = useRunLateFees();

  const submit = () => {
    run.mutate(undefined, {
      onSuccess: (r) => {
        toast(
          'success',
          'Mora del día aplicada',
          `${r.markedOverdue} ${r.markedOverdue === 1 ? 'cuota marcada vencida' : 'cuotas marcadas vencidas'} · ${r.feesApplied} ${r.feesApplied === 1 ? 'mora aplicada' : 'moras aplicadas'}.`,
        );
        onClose();
      },
      onError: (err) =>
        toast('danger', 'No se pudo aplicar la mora', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Clock />}
      title="Aplicar mora del día"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Clock />} disabled={run.isPending} onClick={submit}>
            Aplicar ahora
          </Button>
        </>
      }
    >
      <Alert tone="info">
        Marca <b>Vencido</b> lo atrasado y carga la mora fija a las pensiones que pasaron los días de gracia — lo mismo
        que corre solo cada madrugada. Respeta las exoneraciones y no recarga moras ya aplicadas.
      </Alert>
    </Dialog>
  );
}
