// Detalle de una rendición de caja chica: los gastos menores consolidados en un
// único gasto de Tesorería. Se abre desde la columna Origen de Gastos y desde la
// tarjeta «Rendiciones anteriores» de Caja chica.
import { Badge, Dialog, Icons, Table } from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { PETTY_RENDITION_SOURCE_LABELS, formatPEN, toCents } from '@elohim/shared';
import { fmtDate } from '../structure/bits';
import { fmtDateTime } from '../cashier/bits';
import { useRenditionDetail } from './api';
import type { PettyExpense } from './types';

export function RenditionDetailDialog({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useRenditionDetail(id);

  const cols: TableColumn<PettyExpense>[] = [
    { key: 'date', header: 'Fecha', mono: true, align: 'center', width: 84, render: (v) => fmtDate(v as string) },
    {
      key: 'concept',
      header: 'Concepto',
      render: (v) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>,
    },
    {
      key: 'voucherNumber',
      header: 'Comprobante',
      align: 'center',
      render: (v) =>
        v ? (
          <span style={{ fontFamily: 'var(--font-mono)' }}>{v as string}</span>
        ) : (
          <Badge tone="neutral" size="sm">
            Sin comprobante
          </Badge>
        ),
    },
    {
      key: 'amount',
      header: 'Monto',
      num: true,
      mono: true,
      render: (v) => <span style={{ color: 'var(--danger)' }}>− {formatPEN(toCents(v as string))}</span>,
    },
  ];

  return (
    <Dialog
      open={!!id}
      onClose={onClose}
      size="lg"
      showClose
      icon={<Icons.Receipt />}
      title={data ? `Rendición ${data.code}` : 'Rendición'}
      description={
        data
          ? `${data.expensesCount} ${data.expensesCount === 1 ? 'gasto menor' : 'gastos menores'} · ${fmtDateTime(
              data.createdAt,
            )} · reposición por ${PETTY_RENDITION_SOURCE_LABELS[data.source]}`
          : undefined
      }
    >
      {isLoading || !data ? (
        <div style={{ padding: '24px 4px', textAlign: 'center', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          {isLoading ? 'Cargando rendición…' : 'No se encontró la rendición.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'var(--surface-sunken)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              Gasto consolidado en Gastos: <b style={{ fontFamily: 'var(--font-mono)' }}>{data.movementCode}</b>
            </span>
            <span style={{ font: 'var(--type-h3)', fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>
              − {formatPEN(toCents(data.totalAmount))}
            </span>
          </div>
          <Table columns={cols} data={data.expenses} rowKey="id" hover zebra emptyText="Sin gastos." />
        </div>
      )}
    </Dialog>
  );
}
