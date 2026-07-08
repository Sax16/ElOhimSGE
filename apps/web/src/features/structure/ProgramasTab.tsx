// Programas complementarios (talleres, reforzamiento, academia) con tarifa propia.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  EmptyState,
  Icons,
  IconButton,
  Input,
  Select,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { BadgeTone } from '@elohim/ui';
import {
  PROGRAM_STATUS_LABELS,
  PROGRAM_TYPE_LABELS,
  PROGRAM_TYPES,
  type ProgramType,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useCreateProgram, usePrograms, useUpdateProgram } from './api';
import { VacBar } from './bits';
import type { ApiProgram } from './types';

const TYPE_TONE: Record<ProgramType, BadgeTone> = {
  TALLER: 'accent',
  REFORZAMIENTO: 'info',
  ACADEMIA: 'brand',
};

export interface ProgramasTabProps {
  yearId: string;
  readOnly: boolean;
}

export function ProgramasTab({ yearId, readOnly }: ProgramasTabProps) {
  const navigate = useNavigate();
  const programsQuery = usePrograms(yearId);
  const programs = programsQuery.data ?? [];
  const [dlg, setDlg] = useState<{ program?: ApiProgram } | null>(null);
  const [ver, setVer] = useState<ApiProgram | null>(null);

  const columns = [
    {
      key: 'name',
      header: 'Programa',
      render: (v: string, r: ApiProgram) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.scheduleText}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      align: 'center' as const,
      render: (v: ProgramType) => <Badge tone={TYPE_TONE[v]}>{PROGRAM_TYPE_LABELS[v]}</Badge>,
    },
    {
      key: 'monthlyFee',
      header: 'Tarifa mensual',
      num: true,
      mono: true,
      render: (v: string) => (
        <span>
          S/ {v}
          <span style={{ color: 'var(--text-subtle)' }}>/mes</span>
        </span>
      ),
    },
    {
      key: 'enrolled',
      header: 'Matriculados',
      render: (_v: unknown, r: ApiProgram) => <VacBar enrolled={r.enrolled} capacity={r.capacity} />,
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center' as const,
      render: (v: ApiProgram['status']) => (
        <Badge tone={v === 'ACTIVO' ? 'success' : 'neutral'} dot>
          {PROGRAM_STATUS_LABELS[v]}
        </Badge>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right' as const,
      render: (_v: unknown, r: ApiProgram) => (
        <div style={{ display: 'inline-flex', gap: 2 }}>
          {!readOnly && (
            <Tooltip content="Editar">
              <IconButton label="Editar" size="sm" onClick={() => setDlg({ program: r })}>
                <Icons.Pencil />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip content="Ver matriculados">
            <IconButton label="Ver matriculados" size="sm" onClick={() => setVer(r)}>
              <Icons.Users />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info">
        Los programas usan la misma matrícula y cobranza que la enseñanza regular, con su propia tarifa. Un estudiante
        puede matricularse en varios programas.
      </Alert>
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setDlg({})}>
            Nuevo programa
          </Button>
        </div>
      )}
      <Card flush>
        <Table
          columns={columns}
          data={programs}
          rowKey="id"
          hover
          emptyText="Aún no hay programas complementarios."
        />
      </Card>

      <ProgramaDialog yearId={yearId} ctx={dlg} onClose={() => setDlg(null)} />
      {ver && (
        <Dialog
          open
          onClose={() => setVer(null)}
          size="lg"
          icon={<Icons.Users />}
          title={`Matriculados · ${ver.name}`}
          description={`${ver.enrolled} de ${ver.capacity} vacantes · ${ver.scheduleText} · S/ ${ver.monthlyFee} mensual`}
          footer={
            <Button
              variant="primary"
              iconLeft={<Icons.Plus />}
              onClick={() => {
                setVer(null);
                navigate('/matricula');
              }}
            >
              Matricular al programa
            </Button>
          }
        >
          <div style={{ paddingTop: 4 }}>
            <EmptyState
              size="sm"
              icon={<Icons.Users />}
              title="Aún no hay estudiantes matriculados en este programa"
              description="La matrícula a programas llega en la etapa correspondiente (R2)."
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}

function ProgramaDialog({
  yearId,
  ctx,
  onClose,
}: {
  yearId: string;
  ctx: { program?: ApiProgram } | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const createProgram = useCreateProgram(yearId);
  const updateProgram = useUpdateProgram(yearId);

  const edit = ctx?.program;
  const [name, setName] = useState('');
  const [type, setType] = useState<ProgramType>('TALLER');
  const [schedule, setSchedule] = useState('');
  const [fee, setFee] = useState('60.00');
  const [capacity, setCapacity] = useState('25');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!ctx) return;
    setName(edit?.name ?? '');
    setType(edit?.type ?? 'TALLER');
    setSchedule(edit?.scheduleText ?? '');
    setFee(edit?.monthlyFee ?? '60.00');
    setCapacity(edit ? String(edit.capacity) : '25');
    setActive(edit ? edit.status === 'ACTIVO' : true);
  }, [ctx]);

  const pending = createProgram.isPending || updateProgram.isPending;

  const submit = () => {
    const base = {
      name: name.trim(),
      type,
      scheduleText: schedule.trim() || 'Por definir',
      capacity: parseInt(capacity, 10) || 0,
      monthlyFee: fee || '0.00',
      enrollmentFee: edit?.enrollmentFee ?? '0.00',
      status: (active ? 'ACTIVO' : 'CERRADO') as ApiProgram['status'],
    };
    const opts = {
      onSuccess: () => {
        toast('success', edit ? 'Programa actualizado' : 'Programa creado', `${base.name} · S/ ${base.monthlyFee} mensual.`);
        onClose();
      },
      onError: (err: unknown) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    };
    if (edit) updateProgram.mutate({ id: edit.id, body: base }, opts);
    else createProgram.mutate({ academicYearId: yearId, ...base }, opts);
  };

  return (
    <Dialog
      open={!!ctx}
      onClose={onClose}
      title={edit ? `Editar · ${edit.name}` : 'Nuevo programa'}
      icon={<Icons.Clipboard />}
      description="Talleres, reforzamiento y academia — con matrícula y tarifa propia"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={!name.trim() || pending} onClick={submit}>
            {edit ? 'Guardar cambios' : 'Crear programa'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          <Input
            label="Nombre"
            placeholder="Ej. Taller de Ajedrez"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            label="Tipo"
            options={PROGRAM_TYPES.map((t) => ({ value: t, label: PROGRAM_TYPE_LABELS[t] }))}
            value={type}
            onChange={(e) => setType(e.target.value as ProgramType)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
          <Input
            label="Horario"
            placeholder="Ej. Sáb 9:00–11:00"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
          <Input
            label="Vacantes"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'end' }}>
          <Input
            label="Tarifa mensual"
            prefix="S/."
            value={fee}
            onChange={(e) => setFee(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode="decimal"
          />
          <div style={{ display: 'flex', alignItems: 'center', height: 38 }}>
            <Checkbox
              label="Programa activo"
              description="Visible al matricular"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
