// Periodos del año (bimestres/trimestres): fechas, estado y avance.
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  Icons,
  IconButton,
  Input,
  ProgressBar,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { BadgeTone } from '@elohim/ui';
import { PERIOD_STATUS_LABELS, type PeriodStatus } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useUpdatePeriod } from './api';
import { fmtDate, periodProgress, toDateInput } from './bits';
import type { ApiPeriod } from './types';

const STATUS_TONE: Record<PeriodStatus, BadgeTone> = {
  EN_CURSO: 'success',
  CERRADO: 'neutral',
  PROXIMO: 'info',
};

export interface PeriodosTabProps {
  yearId: string;
  periods: ApiPeriod[];
  readOnly: boolean;
}

export function PeriodosTab({ yearId, periods, readOnly }: PeriodosTabProps) {
  const [edit, setEdit] = useState<ApiPeriod | null>(null);

  const columns = [
    {
      key: 'name',
      header: 'Periodo',
      render: (v: string) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>,
    },
    { key: 'startDate', header: 'Inicio', mono: true, render: (v: string) => fmtDate(v) },
    { key: 'endDate', header: 'Fin', mono: true, render: (v: string) => fmtDate(v) },
    {
      key: 'status',
      header: 'Estado',
      align: 'center' as const,
      render: (v: PeriodStatus) => (
        <Badge tone={STATUS_TONE[v]} dot>
          {PERIOD_STATUS_LABELS[v]}
        </Badge>
      ),
    },
    {
      key: 'avance',
      header: 'Avance',
      render: (_v: unknown, r: ApiPeriod) => (
        <div style={{ minWidth: 140 }}>
          <ProgressBar
            value={periodProgress(r.startDate, r.endDate)}
            showValue
            size="sm"
            tone={r.status === 'CERRADO' ? 'success' : 'brand'}
          />
        </div>
      ),
    },
    ...(readOnly
      ? []
      : [
          {
            key: 'acc',
            header: '',
            align: 'right' as const,
            render: (_v: unknown, r: ApiPeriod) => (
              <Tooltip content="Editar fechas">
                <IconButton label="Editar fechas" size="sm" onClick={() => setEdit(r)}>
                  <Icons.Pencil />
                </IconButton>
              </Tooltip>
            ),
          },
        ]),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card flush>
        <Table columns={columns} data={periods} rowKey="id" hover emptyText="Este año aún no tiene periodos." />
      </Card>
      <PeriodoDialog yearId={yearId} period={edit} onClose={() => setEdit(null)} />
    </div>
  );
}

function PeriodoDialog({
  yearId,
  period,
  onClose,
}: {
  yearId: string;
  period: ApiPeriod | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updatePeriod = useUpdatePeriod(yearId);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (!period) return;
    setStart(toDateInput(period.startDate));
    setEnd(toDateInput(period.endDate));
  }, [period]);

  if (!period) return null;

  const submit = () => {
    updatePeriod.mutate(
      { id: period.id, body: { startDate: start, endDate: end } },
      {
        onSuccess: () => {
          toast('success', 'Periodo actualizado', `${period.name} guardado.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Editar · ${period.name}`}
      icon={<Icons.Calendar />}
      description="Las fechas definen qué periodo está en curso"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={updatePeriod.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={updatePeriod.isPending} onClick={submit}>
            Guardar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input label="Inicio" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input label="Fin" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        {period.status === 'CERRADO' && (
          <Alert tone="warning" title="Periodo cerrado">
            Modificar un periodo cerrado no reabre sus notas ni asistencias.
          </Alert>
        )}
      </div>
    </Dialog>
  );
}
