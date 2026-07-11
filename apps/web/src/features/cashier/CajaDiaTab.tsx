// Pestaña «Caja del día»: apertura, totales, movimientos y cierre con arqueo.
import { useEffect, useState } from 'react';
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
  StatCard,
  Table,
  Textarea,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import {
  CASH_SESSION_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  RECEIPT_STATUS_LABELS,
  formatPEN,
  toCents,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDate } from '../structure/bits';
import { useCancelReceipt, useCashierDay, useReceipt } from './api';
import { fmtTime, methodTone, todayLocalISO } from './bits';
import { OpenSessionDialog, CloseSessionDialog } from './SessionDialogs';
import { ReceiptDialog } from './ReceiptDialog';
import type { Movement } from './types';

export function CajaDiaTab({ canEdit }: { canEdit: boolean }) {
  const { data: day, isLoading } = useCashierDay();
  const [openSession, setOpenSession] = useState(false);
  const [closeSession, setCloseSession] = useState(false);
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Movement | null>(null);

  const receiptQuery = useReceipt(viewReceiptId);

  if (isLoading) {
    return <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando caja…</div>;
  }

  const session = day?.session ?? null;
  const stats = day?.stats;
  const movements = day?.movements ?? [];

  if (!session) {
    return (
      <>
        <Card>
          <EmptyState
            icon={<Icons.Cash />}
            title="Sin caja abierta hoy"
            description="Abre la caja del día con el monto inicial en efectivo para empezar a registrar cobros."
            actions={
              canEdit ? (
                <Button variant="primary" iconLeft={<Icons.Cash />} onClick={() => setOpenSession(true)}>
                  Abrir caja
                </Button>
              ) : undefined
            }
          />
        </Card>
        <OpenSessionDialog open={openSession} onClose={() => setOpenSession(false)} />
      </>
    );
  }

  const isOpen = session.status === 'ABIERTA';

  const cols: TableColumn<Movement>[] = [
    { key: 'code', header: 'Recibo', mono: true, width: 130 },
    {
      key: 'createdAt',
      header: 'Hora',
      mono: true,
      align: 'center',
      width: 74,
      render: (v) => fmtTime(v as string),
    },
    {
      key: 'studentName',
      header: 'Estudiante',
      render: (v) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>,
    },
    { key: 'summary', header: 'Concepto' },
    {
      key: 'method',
      header: 'Método',
      align: 'center',
      render: (_v, r) => <Badge tone={methodTone(r.method)}>{PAYMENT_METHOD_LABELS[r.method]}</Badge>,
    },
    {
      key: 'totalAmount',
      header: 'Monto',
      num: true,
      mono: true,
      render: (v, r) =>
        r.status === 'ANULADO' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              {formatPEN(toCents(v as string))}
            </span>
            <Badge tone="neutral">{RECEIPT_STATUS_LABELS[r.status]}</Badge>
          </span>
        ) : (
          formatPEN(toCents(v as string))
        ),
    },
    {
      key: 'cashierName',
      header: 'Cobró',
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
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 2 }}>
          <Tooltip content="Ver recibo">
            <IconButton label="Ver recibo" size="sm" onClick={() => setViewReceiptId(r.id)}>
              <Icons.Receipt />
            </IconButton>
          </Tooltip>
          {canEdit && isOpen && r.status === 'EMITIDO' && (
            <Tooltip content="Anular">
              <IconButton label="Anular" size="sm" variant="danger" onClick={() => setCancelTarget(r)}>
                <Icons.Trash />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const pendingPrevious = isOpen && session.date !== todayLocalISO();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {pendingPrevious && (
        <Alert tone="warning" title={`Caja del ${fmtDate(session.date)} pendiente de cierre`}>
          Esta caja quedó abierta de un día anterior. Realiza el arqueo y ciérrala para poder abrir la caja de
          hoy; mientras tanto no se pueden registrar cobros nuevos.
        </Alert>
      )}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: isOpen ? 'var(--success-soft)' : 'var(--surface-sunken)',
              color: isOpen ? 'var(--success)' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.Cash />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: 'var(--type-h3)', color: 'var(--text-strong)' }}>Caja · {fmtDate(session.date)}</span>
              <Badge tone={isOpen ? 'success' : 'neutral'} dot>
                {CASH_SESSION_STATUS_LABELS[session.status]}
              </Badge>
            </div>
            <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              Abierta a las {fmtTime(session.openedAt)} por {session.openedByName} · Monto inicial{' '}
              {formatPEN(toCents(session.initialAmount))}
            </div>
            {!isOpen && session.closedAt && (
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                Cerrada a las {fmtTime(session.closedAt)}
                {session.closedByName ? ` por ${session.closedByName}` : ''}
                {session.difference != null ? ` · Diferencia ${formatPEN(toCents(session.difference))}` : ''}
              </div>
            )}
          </div>
          {isOpen && canEdit && (
            <Button variant="secondary" iconLeft={<Icons.Lock />} onClick={() => setCloseSession(true)}>
              Cerrar caja
            </Button>
          )}
        </div>
      </Card>

      {stats && (
        <div className="esge-cashier-stats">
          <StatCard
            label="Cobrado hoy"
            value={formatPEN(toCents(stats.totalAmount))}
            iconTone="success"
            icon={<Icons.Cash />}
            caption={`${stats.operationsCount} ${stats.operationsCount === 1 ? 'operación' : 'operaciones'}`}
          />
          <StatCard
            label="Efectivo"
            value={formatPEN(toCents(stats.cashAmount))}
            icon={<Icons.Cash />}
            caption={`${stats.cashCount} ${stats.cashCount === 1 ? 'operación' : 'operaciones'}`}
          />
          <StatCard
            label="Digital"
            value={formatPEN(toCents(stats.digitalAmount))}
            iconTone="brand"
            icon={<Icons.Phone />}
            caption="Yape / Plin · transferencias"
          />
          <StatCard
            label="Anulados"
            value={stats.canceledCount}
            iconTone="danger"
            icon={<Icons.Trash />}
            caption="hoy"
          />
        </div>
      )}

      <Card flush title="Movimientos del día">
        <Table
          columns={cols}
          data={movements}
          rowKey="id"
          hover
          zebra
          emptyText="Aún no hay movimientos hoy."
        />
      </Card>

      {stats && (
        <CloseSessionDialog
          open={closeSession}
          session={session}
          stats={stats}
          onClose={() => setCloseSession(false)}
        />
      )}
      <OpenSessionDialog open={openSession} onClose={() => setOpenSession(false)} />
      <ReceiptDialog
        open={!!viewReceiptId}
        receipt={receiptQuery.data ?? null}
        loading={receiptQuery.isLoading}
        onClose={() => setViewReceiptId(null)}
      />
      <CancelReceiptDialog target={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  );
}

// ---- Diálogo de anulación --------------------------------------------------
function CancelReceiptDialog({ target, onClose }: { target: Movement | null; onClose: () => void }) {
  const { toast } = useToast();
  const cancel = useCancelReceipt();
  const [reason, setReason] = useState('');

  // Reinicia el motivo al abrir el diálogo con un nuevo recibo.
  useEffect(() => {
    setReason('');
  }, [target?.id]);

  const valid = reason.trim().length >= 10;

  const submit = () => {
    if (!target || !valid) return;
    cancel.mutate(
      { id: target.id, body: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast('warning', 'Recibo anulado', `${target.code} anulado — la cuota vuelve a estado Pendiente.`);
          setReason('');
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo anular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!target}
      onClose={() => {
        setReason('');
        onClose();
      }}
      icon={<Icons.Trash />}
      iconTone="danger"
      title="Anular recibo"
      description={target ? `${target.code} · ${target.studentName} · ${formatPEN(toCents(target.totalAmount))}` : ''}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => {
              setReason('');
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            iconLeft={<Icons.Trash />}
            disabled={!valid || cancel.isPending}
            onClick={submit}
          >
            Anular recibo
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <Alert tone="warning" title="Esta acción queda registrada">
          El recibo se marca como anulado (no se borra) y la cuota vuelve a Pendiente. Requiere motivo.
        </Alert>
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
