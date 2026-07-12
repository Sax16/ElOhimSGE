// Pestaña «Historial» de Caja (R2 · Etapa 3): cajas cerradas/abiertas con quién
// abrió/cerró, cobrado, esperado vs. contado, diferencia y observaciones; «Ver día»
// abre el resumen y los movimientos (solo lectura, con Ver recibo).
import { useState } from 'react';
import { Badge, Button, Card, Dialog, EmptyState, Icons, Pagination, StatCard, Table } from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { CASH_SESSION_STATUS_LABELS, formatPEN, toCents } from '@elohim/shared';
import { fmtDate } from '../structure/bits';
import { useCashierSession, useCashierSessions, useReceipt } from './api';
import { fmtTime } from './bits';
import { MovementsTable } from './MovementsTable';
import { ReceiptDialog } from './ReceiptDialog';
import type { CashierSessionSummary } from './types';

const PAGE_SIZE = 20;

/** Diferencia coloreada: verde cuadrado, rojo faltante, ámbar sobrante, «—» sin arqueo. */
function DifferenceCell({ difference }: { difference: string | null }) {
  if (difference == null) {
    return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  }
  const neg = difference.trim().startsWith('-');
  const cents = toCents(difference.replace('-', '').trim());
  if (cents === 0) {
    return <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{formatPEN(0)}</span>;
  }
  return (
    <span style={{ fontFamily: 'var(--font-mono)', color: neg ? 'var(--danger)' : 'var(--warning)' }}>
      {neg ? `− ${formatPEN(cents)} faltante` : `+ ${formatPEN(cents)} sobrante`}
    </span>
  );
}

export function HistorialTab() {
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useCashierSessions(page, PAGE_SIZE);
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const cols: TableColumn<CashierSessionSummary>[] = [
    {
      key: 'date',
      header: 'Fecha',
      mono: true,
      render: (v) => fmtDate(v as string),
    },
    {
      key: 'openedByName',
      header: 'Abrió / cerró',
      render: (_v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>
            {r.openedByName}
            {r.closedByName && r.closedByName !== r.openedByName ? ` · ${r.closedByName}` : ''}
          </span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
            {fmtTime(r.openedAt)}
            {r.closedAt ? ` – ${fmtTime(r.closedAt)}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Cobrado',
      align: 'right',
      render: (v) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
          {formatPEN(toCents(v as string))}
        </span>
      ),
    },
    {
      key: 'expectedCash',
      header: 'Esperado / contado',
      align: 'right',
      render: (_v, r) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
          {r.expectedCash != null ? formatPEN(toCents(r.expectedCash)) : '—'}
          {' / '}
          {r.countedCash != null ? formatPEN(toCents(r.countedCash)) : '—'}
        </span>
      ),
    },
    {
      key: 'difference',
      header: 'Diferencia',
      align: 'right',
      render: (_v, r) => <DifferenceCell difference={r.difference} />,
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v) => (
        <Badge tone={v === 'ABIERTA' ? 'success' : 'neutral'} dot>
          {CASH_SESSION_STATUS_LABELS[v as CashierSessionSummary['status']]}
        </Badge>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <Button size="sm" variant="secondary" iconLeft={<Icons.Eye />} onClick={() => setDetailId(r.id)}>
          Ver día
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!isLoading && rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Icons.Calendar />}
            title="Sin cajas en el historial"
            description="Aquí aparecerán las cajas cerradas con su arqueo una vez que empieces a cerrarlas."
          />
        </Card>
      ) : (
        <Card flush title="Historial de cajas">
          <Table
            columns={cols}
            data={rows}
            rowKey="id"
            hover
            zebra
            emptyText={isLoading ? 'Cargando historial…' : 'Sin cajas.'}
          />
          {total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
              <Pagination page={page} pageCount={pageCount} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}

      <SessionDetailDialog sessionId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}

// ---- Diálogo Ver día -------------------------------------------------------
function SessionDetailDialog({ sessionId, onClose }: { sessionId: string | null; onClose: () => void }) {
  const { data, isLoading } = useCashierSession(sessionId);
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);
  const receiptQuery = useReceipt(viewReceiptId);

  const session = data?.session ?? null;
  const stats = data?.stats ?? null;
  const movements = data?.movements ?? [];
  const hasRefunds = !!stats && stats.refundsCount > 0;

  return (
    <>
      <Dialog
        open={!!sessionId}
        onClose={onClose}
        size="lg"
        showClose
        icon={<Icons.Cash />}
        title={session ? `Caja · ${fmtDate(session.date)}` : 'Caja'}
        description={
          session
            ? `Abierta por ${session.openedByName}${
                session.closedByName ? ` · Cerrada por ${session.closedByName}` : ''
              }`
            : undefined
        }
      >
        {isLoading || !session || !stats ? (
          <div style={{ padding: '24px 4px', textAlign: 'center', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
            {isLoading ? 'Cargando día…' : 'No se encontró la caja.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
            <div className="esge-cashier-stats" data-refunds={hasRefunds ? 'on' : undefined}>
              <StatCard
                label="Cobrado"
                value={formatPEN(toCents(stats.totalAmount))}
                iconTone="success"
                icon={<Icons.Cash />}
                caption={`${stats.operationsCount} ${stats.operationsCount === 1 ? 'operación' : 'operaciones'}`}
              />
              <StatCard
                label="Efectivo"
                value={formatPEN(toCents(stats.cashAmount))}
                icon={<Icons.Cash />}
                caption={`inicial ${formatPEN(toCents(session.initialAmount))}`}
              />
              <StatCard
                label="Digital"
                value={formatPEN(toCents(stats.digitalAmount))}
                iconTone="brand"
                icon={<Icons.Phone />}
                caption="Yape / Plin · transferencias"
              />
              {hasRefunds && (
                <StatCard
                  label="Devuelto"
                  value={formatPEN(toCents(stats.refundsCashAmount))}
                  iconTone="danger"
                  icon={<Icons.ArrowRight />}
                  caption={`${stats.refundsCount} en efectivo`}
                />
              )}
              <StatCard
                label="Diferencia"
                value={session.difference != null ? formatPEN(toCents(session.difference.replace('-', '').trim())) : '—'}
                iconTone={
                  session.difference == null || toCents(session.difference.replace('-', '').trim()) === 0
                    ? 'success'
                    : session.difference.trim().startsWith('-')
                      ? 'danger'
                      : 'accent'
                }
                icon={<Icons.Chart />}
                caption={
                  session.expectedCash != null && session.countedCash != null
                    ? `esperado ${formatPEN(toCents(session.expectedCash))} · contado ${formatPEN(toCents(session.countedCash))}`
                    : 'sin arqueo'
                }
              />
            </div>

            {session.closeNotes && (
              <div
                style={{
                  background: 'var(--surface-sunken)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  font: 'var(--type-caption)',
                  color: 'var(--text-body)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Observaciones del cierre: </span>
                {session.closeNotes}
              </div>
            )}

            <Card flush title="Movimientos del día">
              <MovementsTable movements={movements} onViewReceipt={setViewReceiptId} />
            </Card>
          </div>
        )}
      </Dialog>

      <ReceiptDialog
        open={!!viewReceiptId}
        receipt={receiptQuery.data ?? null}
        loading={receiptQuery.isLoading}
        onClose={() => setViewReceiptId(null)}
      />
    </>
  );
}
