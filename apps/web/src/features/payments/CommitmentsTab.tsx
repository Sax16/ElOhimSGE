// Pestaña «Compromisos» de Pensiones (R2 · Etapa 3). Secretaría propone un plan
// que reprograma cuotas vencidas 1:1 → Admin aprueba/rechaza. Mientras esté
// vigente y al día, la mora y los recordatorios de la deuda quedan congelados.
// Spec: design/ui_kits/sge/PaymentsScreen.jsx (Compromisos) con los reemplazos de
// la etapa 3 (alcance-funcional.md § «Compromisos y devoluciones — etapa 3»).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
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
import type { BadgeTone, TableColumn } from '@elohim/ui';
import {
  COMMITMENT_FREQUENCY_LABELS,
  COMMITMENT_STATUS_LABELS,
  formatPEN,
  toCents,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDate, fmtDayMonth } from '../structure/bits';
import { useGuardianSearch } from '../guardians/api';
import { commitmentDates, tomorrowLocalISO } from './commitmentDates';
import {
  useApproveCommitment,
  useCancelCommitment,
  useCommitments,
  useCreateCommitment,
  useEligibleInstallments,
  useRejectCommitment,
} from './api';
import type {
  Commitment,
  CommitmentFrequency,
  CommitmentStatus,
  CommitmentStatusFilter,
  EligibleInstallment,
} from './types';

const PAGE_SIZE = 20;

const STATUS_TONE: Record<CommitmentStatus, BadgeTone> = {
  PROPUESTO: 'warning',
  VIGENTE: 'info',
  CUMPLIDO: 'success',
  INCUMPLIDO: 'danger',
  RECHAZADO: 'neutral',
  ANULADO: 'neutral',
};

const STATUS_FILTERS: { value: CommitmentStatusFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PROPUESTO', label: 'Propuestos' },
  { value: 'VIGENTE', label: 'Vigentes' },
  { value: 'CUMPLIDO', label: 'Cumplidos' },
  { value: 'INCUMPLIDO', label: 'Incumplidos' },
  { value: 'RECHAZADO', label: 'Rechazados' },
  { value: 'ANULADO', label: 'Anulados' },
];

const FREQUENCY_OPTIONS: { value: CommitmentFrequency; label: string }[] = [
  { value: 'MENSUAL', label: COMMITMENT_FREQUENCY_LABELS.MENSUAL },
  { value: 'QUINCENAL', label: COMMITMENT_FREQUENCY_LABELS.QUINCENAL },
];

/** "3 cuotas · quincenal desde 15/07". */
function planLabel(c: Commitment): string {
  const cuotas = `${c.itemsCount} ${c.itemsCount === 1 ? 'cuota' : 'cuotas'}`;
  const freq = COMMITMENT_FREQUENCY_LABELS[c.frequency].toLowerCase();
  return `${cuotas} · ${freq} desde ${fmtDayMonth(c.firstDueDate)}`;
}

export function CommitmentsTab({
  yearId,
  canMutate,
  isAdmin,
  onTotalChange,
}: {
  yearId: string | undefined;
  canMutate: boolean;
  isAdmin: boolean;
  onTotalChange: (total: number) => void;
}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const approve = useApproveCommitment();

  const [statusFilter, setStatusFilter] = useState<CommitmentStatusFilter>('TODOS');
  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  const [propose, setPropose] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Commitment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Commitment | null>(null);
  const [detailTarget, setDetailTarget] = useState<Commitment | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debounced, yearId]);

  const query = useMemo(
    () => ({ yearId, status: statusFilter, q: debounced, page, pageSize: PAGE_SIZE }),
    [yearId, statusFilter, debounced, page],
  );
  const { data, isLoading } = useCommitments(query);

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (data) onTotalChange(data.total);
  }, [data, onTotalChange]);

  const goCollect = (c: Commitment) => {
    const next = c.items.find((it) => !it.paid);
    if (!next) return;
    navigate(
      `/caja?student=${encodeURIComponent(next.studentId)}&installment=${encodeURIComponent(next.installmentId)}`,
    );
  };

  // Aprobar se resuelve inline (sin diálogo, no requiere motivo).
  const setApproveNow = (row: Commitment) => {
    approve.mutate(row.id, {
      onSuccess: () =>
        toast(
          'success',
          'Compromiso aprobado',
          `${row.code} · ${row.guardianName} — mora y recordatorios congelados mientras cumpla.`,
        ),
      onError: (err) =>
        toast('danger', 'No se pudo aprobar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const cols: TableColumn<Commitment>[] = [
    { key: 'code', header: 'N°', mono: true, width: 92 },
    {
      key: 'guardianName',
      header: 'Familia',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.guardianName} size="sm" color="var(--brown-400)" />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.childrenLabel}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Deuda',
      align: 'right',
      render: (v) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
          {formatPEN(toCents(v as string))}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (_v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{planLabel(r)}</span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
            {r.paidCount} de {r.itemsCount} pagadas
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Badge tone={STATUS_TONE[v as CommitmentStatus]} dot>
            {COMMITMENT_STATUS_LABELS[v as CommitmentStatus]}
          </Badge>
          {r.status === 'INCUMPLIDO' && r.breachedAt && (
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
              desde {fmtDate(r.breachedAt)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => <RowActions row={r} />,
    },
  ];

  function RowActions({ row }: { row: Commitment }) {
    const detailBtn = (
      <Tooltip content="Ver detalle">
        <IconButton label="Ver detalle" size="sm" onClick={() => setDetailTarget(row)}>
          <Icons.Eye />
        </IconButton>
      </Tooltip>
    );
    if (row.status === 'PROPUESTO') {
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {isAdmin && (
            <>
              <Button
                size="sm"
                variant="ghost"
                disabled={!canMutate}
                onClick={() => setRejectTarget(row)}
              >
                Rechazar
              </Button>
              <Button
                size="sm"
                variant="primary"
                iconLeft={<Icons.Check />}
                disabled={!canMutate}
                onClick={() => setApproveNow(row)}
              >
                Aprobar
              </Button>
            </>
          )}
          {detailBtn}
        </div>
      );
    }
    if (row.status === 'VIGENTE') {
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Button
            size="sm"
            variant="accent"
            iconLeft={<Icons.Cash />}
            disabled={!canMutate || !row.items.some((it) => !it.paid)}
            onClick={() => goCollect(row)}
          >
            Cobrar cuota
          </Button>
          {isAdmin && (
            <Button size="sm" variant="ghost" disabled={!canMutate} onClick={() => setCancelTarget(row)}>
              Anular
            </Button>
          )}
          {detailBtn}
        </div>
      );
    }
    return detailBtn;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16 }}>
      <Alert tone="info" title="Cómo funciona">
        Secretaría <b>propone</b> el plan y el Administrador lo <b>aprueba</b>. El compromiso reprograma cada cuota
        vencida a una nueva fecha; mientras esté al día, la <b>mora y los recordatorios se congelan</b>. Si incumple
        una cuota, se reactivan sobre la deuda original. Los montos no cambian y la mora ya aplicada se mantiene.
      </Alert>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <Select
          label="Estado"
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CommitmentStatusFilter)}
          containerStyle={{ width: 170 }}
        />
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            label="Buscar"
            placeholder="Familia, apoderado o N°…"
            iconLeft={<Icons.Search />}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>
        <Button
          variant="primary"
          iconLeft={<Icons.Plus />}
          disabled={!canMutate}
          onClick={() => setPropose(true)}
        >
          Proponer compromiso
        </Button>
      </div>

      {!isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<Icons.Cash />}
          title="Sin compromisos"
          description="No hay compromisos que coincidan con estos filtros. Propón uno para refinanciar deuda vencida."
        />
      ) : (
        <Card flush>
          <Table
            columns={cols}
            data={rows}
            rowKey="id"
            hover
            emptyText={isLoading ? 'Cargando compromisos…' : 'Sin compromisos.'}
          />
          {total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
              <Pagination page={page} pageCount={pageCount} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}

      <ProposeDialog open={propose} onClose={() => setPropose(false)} canMutate={canMutate} />
      <ReasonDialog
        target={rejectTarget}
        onClose={() => setRejectTarget(null)}
        kind="reject"
      />
      <ReasonDialog
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        kind="cancel"
      />
      <DetailDialog target={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  );
}

// ---- Diálogo Rechazar / Anular (justificación ≥ 10) ------------------------
function ReasonDialog({
  target,
  onClose,
  kind,
}: {
  target: Commitment | null;
  onClose: () => void;
  kind: 'reject' | 'cancel';
}) {
  const { toast } = useToast();
  const reject = useRejectCommitment();
  const cancel = useCancelCommitment();
  const mutation = kind === 'reject' ? reject : cancel;
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [target?.id]);

  const valid = reason.trim().length >= 10;
  const title = kind === 'reject' ? 'Rechazar compromiso' : 'Anular compromiso';

  const submit = () => {
    if (!target || !valid) return;
    mutation.mutate(
      { id: target.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast(
            'warning',
            kind === 'reject' ? 'Compromiso rechazado' : 'Compromiso anulado',
            kind === 'reject'
              ? `${target.code} — queda registrado con tu justificación.`
              : `${target.code} — las cuotas vuelven a su condición vencida original.`,
          );
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo completar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      icon={<Icons.Trash />}
      iconTone="warning"
      title={title}
      description={target ? `${target.code} · ${target.guardianName} · ${formatPEN(toCents(target.totalAmount))}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" disabled={!valid || mutation.isPending} onClick={submit}>
            {kind === 'reject' ? 'Rechazar con justificación' : 'Anular compromiso'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        {kind === 'cancel' && (
          <Alert tone="warning" title="Reactiva la deuda original">
            Al anular, las cuotas pendientes del plan vuelven a su condición vencida y se reactivan la mora congelada y
            los recordatorios. La acción queda auditada.
          </Alert>
        )}
        <Textarea
          label="Justificación"
          rows={2}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Mínimo 10 caracteres"
          hint={valid ? 'Listo' : `${Math.max(0, 10 - reason.trim().length)} caracteres más`}
        />
      </div>
    </Dialog>
  );
}

// ---- Diálogo Ver detalle ---------------------------------------------------
function DetailDialog({ target, onClose }: { target: Commitment | null; onClose: () => void }) {
  const meta: [string, string][] = [];
  if (target) {
    if (target.proposedByName) meta.push(['Propuesto por', target.proposedByName]);
    meta.push(['Creado', fmtDate(target.createdAt)]);
    if (target.approvedByName) meta.push(['Aprobado por', target.approvedByName]);
    if (target.approvedAt) meta.push(['Aprobado', fmtDate(target.approvedAt)]);
    if (target.fulfilledAt) meta.push(['Cumplido', fmtDate(target.fulfilledAt)]);
    if (target.breachedAt) meta.push(['Incumplido desde', fmtDate(target.breachedAt)]);
  }

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      size="lg"
      showClose
      icon={<Icons.Cash />}
      title={target ? `Compromiso ${target.code}` : 'Compromiso'}
      description={target ? `${target.guardianName} · ${target.childrenLabel}` : ''}
    >
      {target && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Badge tone={STATUS_TONE[target.status]} dot>
              {COMMITMENT_STATUS_LABELS[target.status]}
            </Badge>
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{planLabel(target)}</span>
            <span
              style={{
                marginLeft: 'auto',
                font: 'var(--type-label)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-strong)',
              }}
            >
              {formatPEN(toCents(target.totalAmount))}
            </span>
          </div>

          {target.status === 'INCUMPLIDO' && (
            <Alert tone="danger" title="Compromiso incumplido">
              Una cuota del plan venció sin pago. La deuda original volvió a incluirse en los recordatorios y la mora
              congelada se reactivó.
            </Alert>
          )}
          {target.rejectReason && (
            <Alert tone="warning" title="Motivo del rechazo">
              {target.rejectReason}
            </Alert>
          )}
          {target.cancelReason && (
            <Alert tone="warning" title="Motivo de la anulación">
              {target.cancelReason}
            </Alert>
          )}

          <Table
            columns={[
              { key: 'sequence', header: '#', mono: true, align: 'center', width: 44 },
              {
                key: 'concept',
                header: 'Concepto',
                render: (v, r) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--text-strong)' }}>{v}</span>
                    <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.childName}</span>
                  </div>
                ),
              },
              {
                key: 'originalDueDate',
                header: 'Fecha',
                align: 'center',
                mono: true,
                render: (v, r) => (
                  <span>
                    {fmtDayMonth(v as string)} <span style={{ color: 'var(--text-subtle)' }}>→</span>{' '}
                    <b style={{ color: 'var(--text-strong)' }}>{fmtDayMonth(r.newDueDate)}</b>
                  </span>
                ),
              },
              {
                key: 'amount',
                header: 'Monto',
                align: 'right',
                mono: true,
                render: (v) => formatPEN(toCents(v as string)),
              },
              {
                key: 'paid',
                header: 'Pagada',
                align: 'center',
                render: (v) =>
                  v ? (
                    <Badge tone="success" dot>
                      Pagada
                    </Badge>
                  ) : (
                    <Badge tone="warning" dot>
                      Pendiente
                    </Badge>
                  ),
              },
            ]}
            data={target.items}
            rowKey="installmentId"
            zebra
          />

          {meta.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8,
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 12,
              }}
            >
              {meta.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      font: 'var(--type-caption)',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--tracking-caps)',
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ font: 'var(--type-label)', color: 'var(--text-body)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

// ---- Diálogo Proponer compromiso -------------------------------------------
function ProposeDialog({
  open,
  onClose,
  canMutate,
}: {
  open: boolean;
  onClose: () => void;
  canMutate: boolean;
}) {
  const { toast } = useToast();
  const create = useCreateCommitment();

  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [guardian, setGuardian] = useState<{ id: string; name: string } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<CommitmentFrequency>('MENSUAL');
  const [firstDueDate, setFirstDueDate] = useState(tomorrowLocalISO());

  useEffect(() => {
    if (open) {
      setTerm('');
      setDebounced('');
      setGuardian(null);
      setSelected([]);
      setFrequency('MENSUAL');
      setFirstDueDate(tomorrowLocalISO());
    }
  }, [open]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  const search = useGuardianSearch(guardian ? '' : debounced);
  const hits = search.data?.items ?? [];

  const eligible = useEligibleInstallments(guardian?.id ?? null);
  const items = eligible.data?.items ?? [];

  // Cuotas seleccionadas ordenadas por fecha original (orden del plan).
  const selectedItems = useMemo(
    () =>
      items
        .filter((it) => selected.includes(it.id))
        .slice()
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [items, selected],
  );

  const previewDates = useMemo(
    () => commitmentDates(firstDueDate, frequency, selectedItems.length),
    [firstDueDate, frequency, selectedItems.length],
  );

  const totalCents = selectedItems.reduce((a, it) => a + toCents(it.totalWithFee), 0);
  const minDate = tomorrowLocalISO();
  const dateValid = firstDueDate >= minDate;
  const disabled = !canMutate || !guardian || selectedItems.length === 0 || !dateValid || create.isPending;

  const submit = () => {
    if (!guardian || disabled) return;
    create.mutate(
      {
        guardianId: guardian.id,
        installmentIds: selectedItems.map((it) => it.id),
        firstDueDate,
        frequency,
      },
      {
        onSuccess: (c) => {
          toast(
            'success',
            'Compromiso propuesto',
            `${c.code} · ${c.guardianName} — queda pendiente de aprobación del Administrador.`,
          );
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo proponer', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Cash />}
      title="Proponer compromiso de pago"
      description="Reprograma cuotas vencidas — requiere aprobación del Administrador"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={disabled} onClick={submit}>
            Proponer {selectedItems.length > 0 ? formatPEN(totalCents) : ''}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        {/* Paso 1: apoderado */}
        {!guardian ? (
          <div style={{ position: 'relative' }}>
            <Input
              label="Familia / apoderado"
              required
              placeholder="Buscar por nombre o DNI…"
              iconLeft={<Icons.Search />}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              hint="Se listará su deuda vencida elegible para refinanciar"
            />
            {debounced.trim().length >= 2 && (
              <div
                style={{
                  marginTop: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  maxHeight: 240,
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 6,
                  background: 'var(--surface-card)',
                }}
              >
                {search.isFetching ? (
                  <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>Buscando…</div>
                ) : hits.length === 0 ? (
                  <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                    Sin resultados.
                  </div>
                ) : (
                  hits.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setGuardian({ id: h.id, name: h.fullName });
                        setSelected([]);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      <Avatar name={h.fullName} size="sm" color="var(--brown-400)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{h.fullName}</div>
                        <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{h.dni}</span> · {h.childrenCount}{' '}
                          {h.childrenCount === 1 ? 'hijo' : 'hijos'}
                        </div>
                      </div>
                      {h.debtCents > 0 && (
                        <Badge tone="danger" dot>
                          {formatPEN(h.debtCents)}
                        </Badge>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-card)',
            }}
          >
            <Avatar name={guardian.name} color="var(--brown-400)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
                {guardian.name}
              </div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                {items.length} {items.length === 1 ? 'cuota vencida' : 'cuotas vencidas'} elegibles
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setGuardian(null)}>
              Cambiar
            </Button>
          </div>
        )}

        {/* Paso 2: checklist de cuotas elegibles */}
        {guardian && (
          <>
            {eligible.isLoading ? (
              <div style={{ padding: '8px 0', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
                Cargando cuotas…
              </div>
            ) : eligible.error ? (
              <Alert tone="warning" title="No se pueden cargar las cuotas">
                {eligible.error instanceof ApiError ? eligible.error.message : 'Inténtalo de nuevo.'}
              </Alert>
            ) : items.length === 0 ? (
              <Alert tone="info" title="Sin deuda vencida">
                Este apoderado no tiene cuotas vencidas elegibles para refinanciar.
              </Alert>
            ) : (
              <Card flush title="Cuotas vencidas" subtitle="Selecciona las que entran al compromiso">
                <div>
                  {items.map((q) => (
                    <EligibleRow
                      key={q.id}
                      item={q}
                      checked={selected.includes(q.id)}
                      onToggle={() =>
                        setSelected((s) => (s.includes(q.id) ? s.filter((x) => x !== q.id) : [...s, q.id]))
                      }
                    />
                  ))}
                </div>
              </Card>
            )}

            {/* Paso 3: frecuencia + primera fecha */}
            {items.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Select
                  label="Frecuencia"
                  options={FREQUENCY_OPTIONS}
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as CommitmentFrequency)}
                />
                <Input
                  label="Primera cuota"
                  type="date"
                  value={firstDueDate}
                  min={minDate}
                  onChange={(e) => setFirstDueDate(e.target.value)}
                  hint={dateValid ? undefined : 'La primera cuota debe ser desde mañana'}
                />
              </div>
            )}

            {/* Paso 4: preview de nuevas fechas */}
            {selectedItems.length > 0 && (
              <Card flush title="Nuevo plan" subtitle="Fechas estimadas — el Administrador las confirma al aprobar">
                <div>
                  {selectedItems.map((q, i) => (
                    <div
                      key={q.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 16px',
                        borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--surface-brand-soft)',
                          color: 'var(--brand)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          font: 'var(--type-2xs)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {i + 1}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{q.concept}</div>
                        <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{q.childName}</div>
                      </div>
                      <span
                        style={{
                          font: 'var(--type-caption)',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {fmtDayMonth(q.dueDate)} <span style={{ color: 'var(--text-subtle)' }}>→</span>{' '}
                        <b style={{ color: 'var(--text-strong)' }}>{fmtDayMonth(previewDates[i] ?? q.dueDate)}</b>
                      </span>
                      <span
                        style={{
                          minWidth: 88,
                          textAlign: 'right',
                          font: 'var(--type-label)',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-strong)',
                        }}
                      >
                        {formatPEN(toCents(q.totalWithFee))}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 16px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ font: 'var(--type-label)', fontWeight: 600 }}>Total a refinanciar</span>
                    <span style={{ font: 'var(--type-h3)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
                      {formatPEN(totalCents)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}

/** Fila de una cuota elegible en el checklist del diálogo Proponer. */
function EligibleRow({
  item,
  checked,
  onToggle,
}: {
  item: EligibleInstallment;
  checked: boolean;
  onToggle: () => void;
}) {
  const lateCents = item.lateFee ? toCents(item.lateFee) : 0;
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 16px',
        borderTop: '1px solid var(--border-subtle)',
        cursor: 'pointer',
        background: checked ? 'var(--surface-brand-soft)' : 'transparent',
      }}
    >
      <Checkbox checked={checked} onChange={onToggle} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{item.concept}</div>
        <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
          {item.childName} · vence {fmtDayMonth(item.dueDate)}
        </div>
      </div>
      <span
        style={{
          minWidth: 150,
          textAlign: 'right',
          font: 'var(--type-label)',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-strong)',
        }}
      >
        {formatPEN(toCents(item.totalWithFee))}
        {lateCents > 0 && (
          <span style={{ display: 'block', font: 'var(--type-2xs)', color: 'var(--danger)' }}>
            incl. mora {formatPEN(lateCents)}
          </span>
        )}
      </span>
    </label>
  );
}
