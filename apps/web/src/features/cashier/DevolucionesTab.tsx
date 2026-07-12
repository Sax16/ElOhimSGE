// Pestaña «Devoluciones» de Caja (R2 · Etapa 3). Dos pasos: Secretaría solicita
// (vinculada a un recibo) → Admin aprueba/rechaza → Caja ejecuta según la forma
// (efectivo, transferencia o aplicación exacta a una cuota). Comprobante imprimible.
// Spec: design/ui_kits/sge/CashierScreen.jsx (Devoluciones) con los reemplazos de
// la etapa 3 (alcance-funcional.md § «Compromisos y devoluciones — etapa 3»).
import { useEffect, useMemo, useState } from 'react';
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
  Table,
  Textarea,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { BadgeTone, TableColumn } from '@elohim/ui';
import {
  PAYMENT_METHOD_LABELS,
  REFUND_METHOD_LABELS,
  REFUND_STATUS_LABELS,
  formatPEN,
  toCents,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDate, fmtDayMonth } from '../structure/bits';
import { useInstitution } from '../settings/api';
import {
  useApproveRefund,
  useCollectibles,
  useCreateRefund,
  useExecuteRefund,
  useReceipt,
  useReceiptSearch,
  useRefunds,
  useRejectRefund,
} from './api';
import { fmtDateTime } from './bits';
import { printRefund } from './printRefund';
import type { Refund, RefundMethod, RefundStatus, RefundStatusFilter } from './types';

const PAGE_SIZE = 20;

const STATUS_TONE: Record<RefundStatus, BadgeTone> = {
  PENDIENTE_APROBACION: 'warning',
  APROBADA: 'info',
  DEVUELTA: 'success',
  RECHAZADA: 'neutral',
};

const STATUS_FILTERS: { value: RefundStatusFilter; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'PENDIENTE_APROBACION', label: 'Pendientes' },
  { value: 'APROBADA', label: 'Aprobadas' },
  { value: 'DEVUELTA', label: 'Devueltas' },
  { value: 'RECHAZADA', label: 'Rechazadas' },
];

const METHOD_OPTIONS: { value: RefundMethod; label: string }[] = [
  { value: 'EFECTIVO', label: REFUND_METHOD_LABELS.EFECTIVO },
  { value: 'TRANSFERENCIA', label: REFUND_METHOD_LABELS.TRANSFERENCIA },
  { value: 'APLICACION_CUOTA', label: REFUND_METHOD_LABELS.APLICACION_CUOTA },
];

/** Normaliza la entrada de dinero: solo dígitos y punto decimal. */
function sanitizeMoney(v: string): string {
  return v.replace(/[^0-9.]/g, '');
}
function inputCents(v: string): number {
  const trimmed = v.trim();
  if (!trimmed || trimmed === '.') return 0;
  try {
    return toCents(trimmed);
  } catch {
    return 0;
  }
}

export function DevolucionesTab({ canEdit, isAdmin }: { canEdit: boolean; isAdmin: boolean }) {
  const [statusFilter, setStatusFilter] = useState<RefundStatusFilter>('TODAS');
  const [page, setPage] = useState(1);
  const [nueva, setNueva] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Refund | null>(null);
  const [executeTarget, setExecuteTarget] = useState<Refund | null>(null);
  const [voucherTarget, setVoucherTarget] = useState<Refund | null>(null);

  const { toast } = useToast();
  const approve = useApproveRefund();

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data, isLoading } = useRefunds(statusFilter, page, PAGE_SIZE);
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const approveNow = (r: Refund) => {
    approve.mutate(r.id, {
      onSuccess: () =>
        toast(
          'success',
          'Devolución aprobada',
          `${r.code} · ${formatPEN(toCents(r.amount))} — Caja ya puede ejecutar la devolución.`,
        ),
      onError: (err) =>
        toast('danger', 'No se pudo aprobar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const cols: TableColumn<Refund>[] = [
    { key: 'code', header: 'N°', mono: true, width: 84 },
    {
      key: 'studentName',
      header: 'Estudiante / recibo',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.studentName} size="sm" color="var(--blue-500)" />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>
            <span style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {r.receiptCode}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Motivo',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{v}</span>
          {r.status === 'RECHAZADA' && r.rejectReason && (
            <span style={{ font: 'var(--type-2xs)', color: 'var(--warning)' }}>Rechazo: “{r.rejectReason}”</span>
          )}
        </div>
      ),
    },
    {
      key: 'method',
      header: 'Forma',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{REFUND_METHOD_LABELS[v as RefundMethod]}</span>
          {r.method === 'APLICACION_CUOTA' && r.targetConcept && (
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.targetConcept}</span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Monto',
      align: 'right',
      render: (v) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
          {formatPEN(toCents(v as string))}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v) => (
        <Badge tone={STATUS_TONE[v as RefundStatus]} dot>
          {REFUND_STATUS_LABELS[v as RefundStatus]}
        </Badge>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => {
        if (r.status === 'PENDIENTE_APROBACION') {
          return isAdmin ? (
            <div style={{ display: 'inline-flex', gap: 6 }}>
              <Button size="sm" variant="ghost" disabled={!canEdit} onClick={() => setRejectTarget(r)}>
                Rechazar
              </Button>
              <Button
                size="sm"
                variant="primary"
                iconLeft={<Icons.Check />}
                disabled={!canEdit}
                onClick={() => approveNow(r)}
              >
                Aprobar
              </Button>
            </div>
          ) : (
            <Badge tone="warning">Espera aprobación</Badge>
          );
        }
        if (r.status === 'APROBADA') {
          return (
            <Button
              size="sm"
              variant="accent"
              iconLeft={<Icons.Cash />}
              disabled={!canEdit}
              onClick={() => setExecuteTarget(r)}
            >
              Registrar devolución
            </Button>
          );
        }
        if (r.status === 'DEVUELTA') {
          return (
            <Tooltip content="Ver comprobante">
              <IconButton label="Ver comprobante" size="sm" onClick={() => setVoucherTarget(r)}>
                <Icons.Receipt />
              </IconButton>
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info" title="Flujo de devolución">
        Secretaría registra la solicitud (vinculada a un recibo) → el <b>Administrador aprueba</b> o rechaza con
        justificación → recién entonces Caja ejecuta la devolución en efectivo, por transferencia o aplicándola a una
        cuota. Nada se borra: todo queda en el historial.
      </Alert>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <Select
          label="Estado"
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RefundStatusFilter)}
          containerStyle={{ width: 180 }}
        />
        <div style={{ flex: 1 }} />
        <Button variant="primary" iconLeft={<Icons.Plus />} disabled={!canEdit} onClick={() => setNueva(true)}>
          Nueva solicitud
        </Button>
      </div>

      {!isLoading && rows.length === 0 ? (
        <EmptyState
          icon={<Icons.Cash />}
          title="Sin devoluciones"
          description="No hay solicitudes de devolución con estos filtros."
        />
      ) : (
        <Card flush>
          <Table
            columns={cols}
            data={rows}
            rowKey="id"
            hover
            emptyText={isLoading ? 'Cargando devoluciones…' : 'Sin devoluciones.'}
          />
          {total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
              <Pagination page={page} pageCount={pageCount} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}

      <NuevaSolicitudDialog open={nueva} onClose={() => setNueva(false)} canEdit={canEdit} />
      <RejectDialog target={rejectTarget} onClose={() => setRejectTarget(null)} />
      <ExecuteDialog target={executeTarget} onClose={() => setExecuteTarget(null)} />
      <VoucherDialog target={voucherTarget} onClose={() => setVoucherTarget(null)} />
    </div>
  );
}

// ---- Diálogo Rechazar (justificación ≥ 10, solo Admin) ---------------------
function RejectDialog({ target, onClose }: { target: Refund | null; onClose: () => void }) {
  const { toast } = useToast();
  const reject = useRejectRefund();
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [target?.id]);

  const valid = reason.trim().length >= 10;

  const submit = () => {
    if (!target || !valid) return;
    reject.mutate(
      { id: target.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast('warning', 'Solicitud rechazada', `${target.code} — queda registrada con tu justificación.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo rechazar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      icon={<Icons.Trash />}
      iconTone="warning"
      title="Rechazar solicitud"
      description={target ? `${target.code} · ${target.studentName} · ${formatPEN(toCents(target.amount))}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" disabled={!valid || reject.isPending} onClick={submit}>
            Rechazar con justificación
          </Button>
        </>
      }
    >
      <div style={{ paddingTop: 4 }}>
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

// ---- Diálogo Registrar devolución (ejecución según forma) -------------------
function ExecuteDialog({ target, onClose }: { target: Refund | null; onClose: () => void }) {
  const { toast } = useToast();
  const execute = useExecuteRefund();
  const [operationNumber, setOperationNumber] = useState('');

  useEffect(() => {
    setOperationNumber('');
  }, [target?.id]);

  const submit = () => {
    if (!target) return;
    execute.mutate(
      {
        id: target.id,
        body: {
          operationNumber:
            target.method === 'TRANSFERENCIA' && operationNumber.trim() ? operationNumber.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast(
            'success',
            'Devolución registrada',
            `${target.code} · ${formatPEN(toCents(target.amount))} — ${REFUND_METHOD_LABELS[target.method].toLowerCase()}.`,
          );
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      icon={<Icons.Cash />}
      iconTone="success"
      title="Registrar devolución"
      description={target ? `${target.code} · ${target.studentName} · ${formatPEN(toCents(target.amount))}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="accent" iconLeft={<Icons.Check />} disabled={execute.isPending} onClick={submit}>
            Confirmar devolución
          </Button>
        </>
      }
    >
      {target && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          {target.method === 'EFECTIVO' && (
            <Alert tone="warning" title="Sale del efectivo de la caja de hoy">
              El monto se descuenta del efectivo esperado en el arqueo de la caja del día. Requiere una caja abierta; si
              no hay, no se podrá registrar.
            </Alert>
          )}
          {target.method === 'TRANSFERENCIA' && (
            <>
              <Alert tone="info">
                La transferencia no toca el cajón. Registra el n° de operación si lo tienes para la trazabilidad.
              </Alert>
              <Input
                label="N° de operación"
                placeholder="Opcional — ej. 90412238"
                value={operationNumber}
                onChange={(e) => setOperationNumber(e.target.value)}
              />
            </>
          )}
          {target.method === 'APLICACION_CUOTA' && (
            <Alert tone="info" title="Se aplica a una cuota">
              El monto se aplica a la cuota{target.targetConcept ? ` «${target.targetConcept}»` : ''} del estudiante,
              que quedará <b>Pagada</b> con origen «Devolución {target.code}». No entra ni sale dinero del cajón.
            </Alert>
          )}
        </div>
      )}
    </Dialog>
  );
}

// ---- Diálogo comprobante (DEVUELTA) ----------------------------------------
function VoucherDialog({ target, onClose }: { target: Refund | null; onClose: () => void }) {
  const { data: institution } = useInstitution();
  const institutionName = institution?.name ?? 'I.E.P. Elohim';

  const rows: [string, string][] = [];
  if (target) {
    rows.push(['Recibo de origen', target.receiptCode]);
    rows.push(['Estudiante', target.studentName]);
    rows.push(['Forma', REFUND_METHOD_LABELS[target.method]]);
    if (target.method === 'APLICACION_CUOTA' && target.targetConcept) rows.push(['Aplicada a', target.targetConcept]);
    if (target.method === 'TRANSFERENCIA' && target.operationNumber)
      rows.push(['N° de operación', target.operationNumber]);
    if (target.executedByName) rows.push(['Ejecutó', target.executedByName]);
    rows.push(['Fecha', fmtDateTime(target.executedAt ?? target.createdAt)]);
  }

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      size="md"
      showClose
      title="Comprobante de devolución"
      description={target ? target.code : undefined}
      footer={
        target ? (
          <Button
            variant="primary"
            iconLeft={<Icons.Printer />}
            onClick={() =>
              printRefund(target, { name: institutionName, address: institution?.address, ruc: institution?.ruc })
            }
          >
            Imprimir comprobante
          </Button>
        ) : undefined
      }
    >
      {target && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            background: 'var(--surface-sunken)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/elohim-insignia.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
            <div>
              <div
                style={{
                  font: 'var(--type-label)',
                  fontWeight: 700,
                  color: 'var(--text-strong)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {institutionName}
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>Comprobante de devolución</div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px dashed var(--border-strong)',
              paddingTop: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              DEVOLUCIÓN <b style={{ color: 'var(--text-strong)' }}>{target.code}</b>
            </span>
            <span style={{ font: 'var(--type-h3)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
              {formatPEN(toCents(target.amount))}
            </span>
          </div>

          <div
            style={{
              borderTop: '1px dashed var(--border-strong)',
              paddingTop: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {rows.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ color: 'var(--text-strong)' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed var(--border-strong)', paddingTop: 10, fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Motivo: </span>
            <span style={{ color: 'var(--text-body)' }}>{target.reason}</span>
          </div>
        </div>
      )}
    </Dialog>
  );
}

// ---- Diálogo Nueva solicitud -----------------------------------------------
function NuevaSolicitudDialog({
  open,
  onClose,
  canEdit,
}: {
  open: boolean;
  onClose: () => void;
  canEdit: boolean;
}) {
  const { toast } = useToast();
  const create = useCreateRefund();

  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [hit, setHit] = useState<{ id: string; code: string; studentName: string; totalAmount: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<RefundMethod>('EFECTIVO');
  const [targetInstallmentId, setTargetInstallmentId] = useState<string>('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setTerm('');
      setDebounced('');
      setHit(null);
      setAmount('');
      setMethod('EFECTIVO');
      setTargetInstallmentId('');
      setReason('');
    }
  }, [open]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  const search = useReceiptSearch(hit ? '' : debounced);
  const hits = search.data ?? [];

  // El detalle del recibo da el id del estudiante para cargar sus cuotas (aplicación).
  const receipt = useReceipt(hit && method === 'APLICACION_CUOTA' ? hit.id : null);
  const studentId = receipt.data?.student.id ?? null;
  const collectibles = useCollectibles(method === 'APLICACION_CUOTA' ? studentId : null);

  const amountCents = inputCents(amount);
  const totalCents = hit ? toCents(hit.totalAmount) : 0;

  // Solo cuotas cuyo total (con mora) coincide EXACTO con el monto.
  const matching = useMemo(() => {
    if (method !== 'APLICACION_CUOTA' || amountCents === 0) return [];
    return (collectibles.data?.installments ?? []).filter((c) => toCents(c.totalWithFee) === amountCents);
  }, [method, amountCents, collectibles.data]);

  // Si cambia el monto/forma y la cuota elegida ya no calza, deselecciona.
  useEffect(() => {
    if (!matching.some((c) => c.id === targetInstallmentId)) setTargetInstallmentId('');
  }, [matching, targetInstallmentId]);

  const amountValid = amountCents > 0 && amountCents <= totalCents;
  const reasonValid = reason.trim().length >= 10;
  const applicationValid = method !== 'APLICACION_CUOTA' || !!targetInstallmentId;
  const disabled = !canEdit || !hit || !amountValid || !reasonValid || !applicationValid || create.isPending;

  const submit = () => {
    if (!hit || disabled) return;
    create.mutate(
      {
        receiptId: hit.id,
        amount: amount.trim(),
        method,
        targetInstallmentId: method === 'APLICACION_CUOTA' ? targetInstallmentId : undefined,
        reason: reason.trim(),
      },
      {
        onSuccess: (r) => {
          toast('success', 'Solicitud registrada', `${r.code} — queda pendiente de aprobación del Administrador.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Cash />}
      title="Solicitud de devolución"
      description="Debe estar vinculada a un recibo emitido"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={disabled} onClick={submit}>
            Registrar solicitud
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        {/* Paso 1: recibo */}
        {!hit ? (
          <div style={{ position: 'relative' }}>
            <Input
              label="Recibo"
              required
              placeholder="Buscar por N° de recibo o estudiante…"
              iconLeft={<Icons.Search />}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              hint="Solo recibos emitidos"
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
                      onClick={() =>
                        setHit({ id: h.id, code: h.code, studentName: h.studentName, totalAmount: h.totalAmount })
                      }
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
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{h.code}</span> · {h.studentName}
                        </div>
                        <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
                          {fmtDate(h.createdAt)} · {PAYMENT_METHOD_LABELS[h.method]}
                        </div>
                      </div>
                      <span
                        style={{ font: 'var(--type-label)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}
                      >
                        {formatPEN(toCents(h.totalAmount))}
                      </span>
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{hit.code}</span> · {hit.studentName}
              </div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                Total del recibo {formatPEN(totalCents)}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setHit(null)}>
              Cambiar
            </Button>
          </div>
        )}

        {/* Paso 2: monto + forma */}
        {hit && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input
                label="Monto a devolver"
                prefix="S/."
                required
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(sanitizeMoney(e.target.value))}
                placeholder="0.00"
                hint={
                  amount && !amountValid
                    ? `No puede superar el total (máx ${formatPEN(totalCents)})`
                    : `Máx ${formatPEN(totalCents)}`
                }
              />
              <Select
                label="Forma de devolución"
                options={METHOD_OPTIONS}
                value={method}
                onChange={(e) => setMethod(e.target.value as RefundMethod)}
              />
            </div>

            {method === 'APLICACION_CUOTA' && (
              <Card flush title="Cuota destino" subtitle="Debe coincidir exacto con el monto a devolver">
                {amountCents === 0 ? (
                  <div style={{ padding: '12px 16px', color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                    Ingresa el monto para ver las cuotas que coinciden.
                  </div>
                ) : collectibles.isLoading || receipt.isLoading ? (
                  <div style={{ padding: '12px 16px', color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                    Cargando cuotas…
                  </div>
                ) : matching.length === 0 ? (
                  <div style={{ padding: '12px 16px', color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                    Ninguna cuota pendiente coincide exactamente con el monto — usa efectivo o transferencia.
                  </div>
                ) : (
                  <div>
                    {matching.map((c) => {
                      const on = targetInstallmentId === c.id;
                      return (
                        <label
                          key={c.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '11px 16px',
                            borderTop: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            background: on ? 'var(--surface-brand-soft)' : 'transparent',
                          }}
                        >
                          <input
                            type="radio"
                            name="target-installment"
                            checked={on}
                            onChange={() => setTargetInstallmentId(c.id)}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{c.concept}</div>
                            <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
                              Vence {fmtDayMonth(c.dueDate)}
                            </div>
                          </div>
                          <span
                            style={{
                              font: 'var(--type-label)',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--text-strong)',
                            }}
                          >
                            {formatPEN(toCents(c.totalWithFee))}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            <Textarea
              label="Motivo"
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Obligatorio — ej. pago duplicado de pensión…"
              hint={reasonValid ? 'Listo' : `${Math.max(0, 10 - reason.trim().length)} caracteres más`}
            />
          </>
        )}
      </div>
    </Dialog>
  );
}
