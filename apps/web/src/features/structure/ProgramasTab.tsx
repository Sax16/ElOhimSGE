// Programas complementarios (talleres, reforzamiento, academia) con tarifa propia,
// vigencia mensual e inscripción independiente de estudiantes.
import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
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
  formatPEN,
  type ProgramType,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import {
  useCancelProgramEnrollment,
  useCreateProgram,
  useDeleteProgram,
  useEnrollInProgram,
  useProgramEnrollPreview,
  useProgramRoster,
  usePrograms,
  useUpdateProgram,
} from './api';
import { VacBar, fmtDayMonth, monthLabel, vigenciaState, vigenciaText } from './bits';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import type { ApiProgram, ApiProgramEnrollment } from './types';
import { useStudents } from '../students/api';
import { avatarColor, fullName } from '../students/bits';

const TYPE_TONE: Record<ProgramType, BadgeTone> = {
  TALLER: 'accent',
  REFORZAMIENTO: 'info',
  ACADEMIA: 'brand',
};

const VIGENCIA_META: Record<
  NonNullable<ReturnType<typeof vigenciaState>>,
  { label: string; tone: BadgeTone }
> = {
  vigente: { label: 'Vigente', tone: 'success' },
  proximo: { label: 'Próximo', tone: 'info' },
  finalizado: { label: 'Finalizado', tone: 'neutral' },
};

/** Meses seleccionables (2=Feb..12=Dic). */
const MONTH_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const m = i + 2;
  return { value: String(m), label: monthLabel(m) };
});

export interface ProgramasTabProps {
  yearId: string;
  readOnly: boolean;
}

export function ProgramasTab({ yearId, readOnly }: ProgramasTabProps) {
  const { toast } = useToast();
  const programsQuery = usePrograms(yearId);
  const programs = programsQuery.data ?? [];
  const [dlg, setDlg] = useState<{ program?: ApiProgram } | null>(null);
  const [ver, setVer] = useState<ApiProgram | null>(null);
  const [borrar, setBorrar] = useState<ApiProgram | null>(null);

  const deleteProgram = useDeleteProgram(yearId);

  const confirmDelete = () => {
    if (!borrar) return;
    const prog = borrar;
    deleteProgram.mutate(prog.id, {
      onSuccess: () => {
        toast('success', 'Programa eliminado', `${prog.name} se eliminó correctamente.`);
        setBorrar(null);
      },
      onError: (err) =>
        toast('danger', 'No se pudo eliminar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

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
      key: 'vigencia',
      header: 'Vigencia',
      render: (_v: unknown, r: ApiProgram) => {
        const st = vigenciaState(r.startMonth, r.endMonth);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ font: 'var(--type-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-body)' }}>
              {vigenciaText(r.startMonth, r.endMonth)}
            </span>
            {st && (
              <Badge tone={VIGENCIA_META[st].tone} size="sm">
                {VIGENCIA_META[st].label}
              </Badge>
            )}
          </div>
        );
      },
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
          {!readOnly && (
            <Tooltip
              content={
                r.enrolled > 0
                  ? `Tiene ${r.enrolled} ${r.enrolled === 1 ? 'matriculado' : 'matriculados'}`
                  : 'Eliminar programa'
              }
            >
              <IconButton
                label="Eliminar programa"
                size="sm"
                variant="danger"
                disabled={r.enrolled > 0}
                onClick={() => setBorrar(r)}
              >
                <Icons.Trash />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip content="Ver inscritos">
            <IconButton label="Ver inscritos" size="sm" onClick={() => setVer(r)}>
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
        Los programas usan la misma matrícula y cobranza que la enseñanza regular, con su propia tarifa y vigencia. Un
        estudiante puede matricularse en varios programas.
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
      <ConfirmDeleteDialog
        open={!!borrar}
        onClose={() => setBorrar(null)}
        onConfirm={confirmDelete}
        title="Eliminar programa"
        confirmLabel="Eliminar programa"
        description={
          borrar ? (
            <>
              Se eliminará el programa <strong>{borrar.name}</strong> y su tarifa. Esta acción no se
              puede deshacer.
            </>
          ) : (
            ''
          )
        }
        loading={deleteProgram.isPending}
      />
      {ver && (
        <ProgramRosterDialog program={ver} yearId={yearId} readOnly={readOnly} onClose={() => setVer(null)} />
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
  const [startMonth, setStartMonth] = useState('3');
  const [endMonth, setEndMonth] = useState('12');
  const [rangeError, setRangeError] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!ctx) return;
    setName(edit?.name ?? '');
    setType(edit?.type ?? 'TALLER');
    setSchedule(edit?.scheduleText ?? '');
    setFee(edit?.monthlyFee ?? '60.00');
    setCapacity(edit ? String(edit.capacity) : '25');
    setActive(edit ? edit.status === 'ACTIVO' : true);
    setStartMonth(String(edit?.startMonth ?? 3));
    setEndMonth(String(edit?.endMonth ?? 12));
    setRangeError('');
    setApiError('');
  }, [ctx]);

  const pending = createProgram.isPending || updateProgram.isPending;

  const submit = () => {
    const start = parseInt(startMonth, 10);
    const end = parseInt(endMonth, 10);
    if (end < start) {
      setRangeError('El mes de fin no puede ser anterior al de inicio.');
      return;
    }
    setRangeError('');
    setApiError('');
    const base = {
      name: name.trim(),
      type,
      scheduleText: schedule.trim() || 'Por definir',
      capacity: parseInt(capacity, 10) || 0,
      monthlyFee: fee || '0.00',
      enrollmentFee: edit?.enrollmentFee ?? '0.00',
      status: (active ? 'ACTIVO' : 'CERRADO') as ApiProgram['status'],
      startMonth: start,
      endMonth: end,
    };
    const opts = {
      onSuccess: () => {
        toast('success', edit ? 'Programa actualizado' : 'Programa creado', `${base.name} · S/ ${base.monthlyFee} mensual.`);
        onClose();
      },
      onError: (err: unknown) => {
        const msg = err instanceof ApiError ? err.message : 'Inténtalo de nuevo.';
        setApiError(msg);
        toast('danger', 'No se pudo guardar', msg);
      },
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
      description="Talleres, reforzamiento y academia — con matrícula, tarifa y vigencia propia"
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
        {apiError && <Alert tone="danger">{apiError}</Alert>}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Select
            label="Mes de inicio"
            options={MONTH_OPTIONS}
            value={startMonth}
            onChange={(e) => {
              setStartMonth(e.target.value);
              setRangeError('');
            }}
          />
          <Select
            label="Mes de fin"
            options={MONTH_OPTIONS}
            value={endMonth}
            onChange={(e) => {
              setEndMonth(e.target.value);
              setRangeError('');
            }}
            error={rangeError}
          />
        </div>
        <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          Las cuotas mensuales se derivan de la vigencia. Para reabrir un programa crea una nueva edición.
        </span>
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

// ============================== Roster real =================================
function ProgramRosterDialog({
  program,
  yearId,
  readOnly,
  onClose,
}: {
  program: ApiProgram;
  yearId: string;
  readOnly: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const rosterQuery = useProgramRoster(program.id);
  const roster = rosterQuery.data ?? [];
  const cancel = useCancelProgramEnrollment(program.id, yearId);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ApiProgramEnrollment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const st = vigenciaState(program.startMonth, program.endMonth);

  const confirmCancel = () => {
    if (!cancelTarget || cancelReason.trim().length < 10) return;
    const target = cancelTarget;
    cancel.mutate(
      { id: target.id, reason: cancelReason.trim() },
      {
        onSuccess: () => {
          toast('success', 'Inscripción anulada', `${fullName(target.student)} salió del programa.`);
          setCancelTarget(null);
        },
        onError: (err) =>
          toast('danger', 'No se pudo anular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const cols = [
    {
      key: 'student',
      header: 'Estudiante',
      render: (_v: unknown, r: ApiProgramEnrollment) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={fullName(r.student)} size="sm" color={avatarColor(r.student.code)} />
          <div style={{ minWidth: 0 }}>
            <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{fullName(r.student)}</div>
            <div style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {r.student.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'enrolledAt',
      header: 'Inscrito',
      align: 'center' as const,
      mono: true,
      render: (_v: unknown, r: ApiProgramEnrollment) => fmtDayMonth(r.enrolledAt),
    },
    {
      key: 'avance',
      header: 'Avance',
      align: 'center' as const,
      mono: true,
      render: (_v: unknown, r: ApiProgramEnrollment) => `${r.paidCount}/${r.totalCount} cuotas`,
    },
    {
      key: 'debt',
      header: 'Deuda',
      num: true,
      mono: true,
      render: (_v: unknown, r: ApiProgramEnrollment) =>
        r.debtCents > 0 ? (
          <span style={{ color: 'var(--danger)' }}>{formatPEN(r.debtCents)}</span>
        ) : (
          <span style={{ color: 'var(--text-subtle)' }}>—</span>
        ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right' as const,
      render: (_v: unknown, r: ApiProgramEnrollment) =>
        r.canceledAt ? (
          <Badge tone="neutral">Anulada</Badge>
        ) : (
          !readOnly && (
            <Tooltip content="Anular inscripción">
              <IconButton
                label="Anular inscripción"
                size="sm"
                variant="danger"
                onClick={() => {
                  setCancelReason('');
                  setCancelTarget(r);
                }}
              >
                <Icons.Trash />
              </IconButton>
            </Tooltip>
          )
        ),
    },
  ];

  return (
    <>
      <Dialog
        open={!cancelTarget && !enrollOpen}
        onClose={onClose}
        size="lg"
        icon={<Icons.Users />}
        title={`Inscritos · ${program.name}`}
        description={`${program.enrolled} de ${program.capacity} vacantes · ${vigenciaText(
          program.startMonth,
          program.endMonth,
        )} · S/ ${program.monthlyFee} mensual`}
        footer={
          !readOnly ? (
            <Tooltip
              content={
                st === 'finalizado'
                  ? 'El programa ya finalizó'
                  : program.status !== 'ACTIVO'
                    ? 'El programa está cerrado'
                    : 'Inscribir estudiante'
              }
            >
              <span>
                <Button
                  variant="primary"
                  iconLeft={<Icons.Plus />}
                  disabled={st === 'finalizado' || program.status !== 'ACTIVO' || program.enrolled >= program.capacity}
                  onClick={() => setEnrollOpen(true)}
                >
                  Inscribir estudiante
                </Button>
              </span>
            </Tooltip>
          ) : undefined
        }
      >
        <div style={{ paddingTop: 4 }}>
          {roster.length === 0 ? (
            <EmptyState
              size="sm"
              icon={<Icons.Users />}
              title="Aún no hay estudiantes inscritos en este programa"
              description={
                readOnly
                  ? 'El año está cerrado: solo lectura.'
                  : 'Usa «Inscribir estudiante» para agregar al primero.'
              }
            />
          ) : (
            <Table
              columns={cols}
              data={roster}
              rowKey="id"
              compact
              emptyText={rosterQuery.isLoading ? 'Cargando inscritos…' : 'Sin inscritos.'}
            />
          )}
        </div>
      </Dialog>

      {enrollOpen && (
        <ProgramEnrollDialog program={program} yearId={yearId} onClose={() => setEnrollOpen(false)} />
      )}

      <Dialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        icon={<Icons.Trash />}
        iconTone="danger"
        title="Anular inscripción"
        description={cancelTarget ? fullName(cancelTarget.student) : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelTarget(null)} disabled={cancel.isPending}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              iconLeft={<Icons.Check />}
              disabled={cancel.isPending || cancelReason.trim().length < 10}
              onClick={confirmCancel}
            >
              Anular inscripción
            </Button>
          </>
        }
      >
        <div style={{ paddingTop: 4 }}>
          <Alert tone="warning" title="Anulación con motivo">
            La inscripción no se borra: queda anulada con su historial. Escribe el motivo (mín. 10 caracteres).
          </Alert>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Motivo de la anulación"
              placeholder="Ej. El apoderado solicitó el retiro del taller"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              hint={`${cancelReason.trim().length}/10 caracteres mínimos`}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}

// ============================== Inscribir estudiante ========================
function ProgramEnrollDialog({
  program,
  yearId,
  onClose,
}: {
  program: ApiProgram;
  yearId: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [term, setTerm] = useState('');
  const [studentId, setStudentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const preview = useProgramEnrollPreview(program.id);
  const enroll = useEnrollInProgram(program.id, yearId);

  const { data, isFetching } = useStudents({
    search: term,
    levelId: '',
    gradeLevelId: '',
    sectionId: '',
    status: '',
    page: 1,
    pageSize: 10,
  });
  // Solo estudiantes con matrícula activa (placement) pueden inscribirse a un programa.
  const items = (data?.items ?? []).filter((i) => i.placement);
  const selected = items.find((i) => i.id === studentId) ?? null;

  const runPreview = (id: string) => {
    setStudentId(id);
    setErrorMsg('');
    preview.mutate(id, {
      onError: (err) => setErrorMsg(err instanceof ApiError ? err.message : 'No se pudo calcular el cronograma.'),
    });
  };

  const confirm = () => {
    if (!studentId) return;
    setErrorMsg('');
    enroll.mutate(studentId, {
      onSuccess: () => {
        toast('success', 'Estudiante inscrito', `${selected ? fullName(selected) : 'El estudiante'} entró a ${program.name}.`);
        onClose();
      },
      onError: (err) => {
        const msg = err instanceof ApiError ? err.message : 'No se pudo inscribir.';
        setErrorMsg(msg);
        toast('danger', 'No se pudo inscribir', msg);
      },
    });
  };

  const previewData = preview.data;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      icon={<Icons.Plus />}
      title={`Inscribir a ${program.name}`}
      description={`${vigenciaText(program.startMonth, program.endMonth)} · S/ ${program.monthlyFee} mensual`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={enroll.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={!studentId || preview.isPending || enroll.isPending}
            onClick={confirm}
          >
            Inscribir
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        {errorMsg && <Alert tone="danger">{errorMsg}</Alert>}
        <Input
          placeholder="Buscar por nombre, código o DNI…"
          iconLeft={<Icons.Search />}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setStudentId(null);
          }}
        />
        {selected ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 16px',
              border: '1.5px solid var(--border-brand)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-brand-soft)',
            }}
          >
            <Avatar name={fullName(selected)} color={avatarColor(selected.code)} />
            <div style={{ flex: 1 }}>
              <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
                {fullName(selected)}
              </div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                {selected.code} · DNI {selected.dni}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStudentId(null)}>
              Cambiar
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 6,
            }}
          >
            {term.trim().length < 2 ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                Escribe al menos 2 caracteres. Solo aparecen estudiantes con matrícula activa.
              </div>
            ) : isFetching ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>Buscando…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                Sin estudiantes con matrícula activa para ese criterio.
              </div>
            ) : (
              items.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => runPreview(r.id)}
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
                  <Avatar name={fullName(r)} size="sm" color={avatarColor(r.code)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{fullName(r)}</div>
                    <div style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {r.code} · DNI {r.dni}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {studentId && (
          <Card flush title="Cronograma del programa" subtitle={preview.isPending ? 'Calculando…' : undefined}>
            <Table
              columns={[
                { key: 'concept', header: 'Concepto' },
                {
                  key: 'dueDate',
                  header: 'Vence',
                  mono: true,
                  align: 'center' as const,
                  width: 110,
                  render: (v: unknown) => fmtDayMonth(v as string),
                },
                {
                  key: 'totalCents',
                  header: 'Monto',
                  num: true,
                  mono: true,
                  render: (v: unknown) => formatPEN(v as number),
                },
              ]}
              data={previewData?.items ?? []}
              rowKey={(_r, i) => i}
              compact
              emptyText={preview.isPending ? 'Calculando…' : 'Sin cuotas.'}
            />
            {previewData && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderTop: '1px solid var(--border-subtle)',
                  font: 'var(--type-label)',
                  color: 'var(--text-strong)',
                }}
              >
                <span>Total del programa</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPEN(previewData.totalCents)}</span>
              </div>
            )}
          </Card>
        )}
      </div>
    </Dialog>
  );
}
