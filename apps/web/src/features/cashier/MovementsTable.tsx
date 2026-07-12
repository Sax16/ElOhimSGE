// Tabla de «Movimientos del día», compartida por la caja del día (con acciones)
// y por el detalle del historial (solo lectura). Cada fila es un COBRO (recibo) o
// una DEVOLUCION (egreso D-xxxx, monto en rojo, sin anulación). E3.
import { Avatar, Badge, IconButton, Icons, Table, Tooltip } from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { PAYMENT_METHOD_LABELS, RECEIPT_STATUS_LABELS, formatPEN, toCents } from '@elohim/shared';
import { fmtTime, methodTone } from './bits';
import type { Movement } from './types';

export interface MovementsTableProps {
  movements: Movement[];
  /** Muestra la acción de anular en los cobros emitidos (caja abierta + permiso). */
  canCancel?: boolean;
  onViewReceipt: (id: string) => void;
  onCancel?: (movement: Movement) => void;
}

export function MovementsTable({ movements, canCancel = false, onViewReceipt, onCancel }: MovementsTableProps) {
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
      render: (v, r) => {
        const cents = toCents(v as string);
        if (r.status === 'ANULADO') {
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
              <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{formatPEN(cents)}</span>
              <Badge tone="neutral">{RECEIPT_STATUS_LABELS.ANULADO}</Badge>
            </span>
          );
        }
        // Egresos del cajón (devolución o reposición de caja chica) en rojo con −.
        if (r.kind === 'DEVOLUCION' || r.kind === 'CAJA_CHICA') {
          return <span style={{ color: 'var(--danger)', fontWeight: 600 }}>− {formatPEN(cents)}</span>;
        }
        // Otros ingresos en efectivo (Tesorería) en verde con +.
        if (r.kind === 'INGRESO') {
          return <span style={{ color: 'var(--success)', fontWeight: 600 }}>+ {formatPEN(cents)}</span>;
        }
        return formatPEN(cents);
      },
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
      render: (_v, r) =>
        // Solo los cobros tienen recibo/acciones; devoluciones, otros ingresos y
        // reposiciones de caja chica se gestionan en su propio módulo.
        r.kind !== 'COBRO' ? null : (
          <div style={{ display: 'inline-flex', gap: 2 }}>
            <Tooltip content="Ver recibo">
              <IconButton label="Ver recibo" size="sm" onClick={() => onViewReceipt(r.id)}>
                <Icons.Receipt />
              </IconButton>
            </Tooltip>
            {canCancel && r.status === 'EMITIDO' && onCancel && (
              <Tooltip content="Anular">
                <IconButton label="Anular" size="sm" variant="danger" onClick={() => onCancel(r)}>
                  <Icons.Trash />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ),
    },
  ];

  return <Table columns={cols} data={movements} rowKey="id" hover zebra emptyText="Aún no hay movimientos." />;
}
