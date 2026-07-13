// Pantalla Matrícula (Etapa 5): listado con KPIs + asistente de 5 pasos.
// Spec: design/ui_kits/sge/EnrollmentScreen.jsx.
import { useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  IconButton,
  Icons,
  Input,
  Pagination,
  Select,
  StatCard,
  Table,
  Textarea,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import {
  ENROLLMENT_STATUSES,
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_TYPES,
  ENROLLMENT_TYPE_LABELS,
  INSTALLMENT_STATUS_LABELS,
  formatPEN,
  toCents,
  type EnrollmentStatus,
  type EnrollmentType,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { avatarColor, fullName } from '../students/bits';
import { useCancelEnrollment, useEnrollment, useEnrollments, useEnrollmentStats } from './api';
import { ENROLLMENT_STATUS_TONE, ENROLLMENT_TYPE_TONE, installmentTone, shortDate } from './bits';
import { EnrollmentWizard } from './EnrollmentWizard';
import type { EnrollmentListItem, EnrollmentsFilters } from './types';

const PAGE_SIZE = 20;

export function EnrollmentPage() {
  const [mode, setMode] = useState<'list' | 'wizard'>('list');
  const { yearId, yearName, readOnly } = useSelectedYear();

  if (mode === 'wizard') {
    return <EnrollmentWizard yearId={yearId} yearName={yearName} onExit={() => setMode('list')} />;
  }
  return (
    <EnrollmentList yearId={yearId} readOnly={readOnly} onNew={() => setMode('wizard')} />
  );
}

// ============================== Listado =====================================
function EnrollmentList({
  yearId,
  readOnly,
  onNew,
}: {
  yearId: string | undefined;
  readOnly: boolean;
  onNew: () => void;
}) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filters: EnrollmentsFilters = {
    yearId: yearId ?? '',
    search,
    status,
    type,
    page,
    pageSize: PAGE_SIZE,
  };
  const { data, isLoading } = useEnrollments(filters);
  const { data: stats } = useEnrollmentStats(yearId);

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const patch = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const columns: TableColumn<EnrollmentListItem>[] = [
    { key: 'code', header: 'N° Matrícula', mono: true, width: 130 },
    {
      key: 'student',
      header: 'Estudiante',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={fullName(r.student)} size="sm" color={avatarColor(r.student.code)} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{fullName(r.student)}</span>
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
              {r.placement.gradeName} {r.placement.sectionName} · {r.placement.levelName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      align: 'center',
      render: (v) => <Badge tone={ENROLLMENT_TYPE_TONE[v as EnrollmentType]}>{ENROLLMENT_TYPE_LABELS[v as EnrollmentType]}</Badge>,
    },
    { key: 'enrolledAt', header: 'Fecha', mono: true, align: 'center', render: (v) => shortDate(v as string) },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v, r) =>
        r.canceled ? (
          <Badge tone="neutral">Anulada</Badge>
        ) : (
          <Badge tone={ENROLLMENT_STATUS_TONE[v as EnrollmentStatus]} dot>
            {ENROLLMENT_STATUS_LABELS[v as EnrollmentStatus]}
          </Badge>
        ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <Tooltip content="Ver ficha">
          <IconButton label="Ver" size="sm" onClick={() => setDetailId(r.id)}>
            <Icons.Eye />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard
          label="Matriculados"
          value={stats ? String(stats.total) : '—'}
          icon={<Icons.Users />}
          caption={stats ? `de ${stats.vacancies.capacity} vacantes` : 'del año'}
        />
        <StatCard
          label="Nuevos"
          value={stats ? String(stats.byType.NUEVA) : '—'}
          iconTone="brand"
          icon={<Icons.Plus />}
          caption="ingresantes"
        />
        <StatCard
          label="Ratificaciones"
          value={stats ? String(stats.byType.RATIFICADA) : '—'}
          iconTone="success"
          icon={<Icons.Check />}
          caption="renovaciones del año"
        />
        <StatCard
          label="Vacantes libres"
          value={stats ? String(stats.vacancies.free) : '—'}
          iconTone="accent"
          icon={<Icons.Clipboard />}
          caption="disponibles"
        />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            placeholder="Buscar por estudiante, N° de matrícula o DNI…"
            iconLeft={<Icons.Search />}
            value={search}
            onChange={(e) => patch(() => setSearch(e.target.value))}
          />
        </div>
        <Select
          aria-label="Tipo"
          placeholder="Tipo"
          // TRASLADO ya no se genera (la fecha de ingreso cubre ese caso); solo queda en histórico.
          options={ENROLLMENT_TYPES.filter((t) => t !== 'TRASLADO').map((t) => ({
            value: t,
            label: ENROLLMENT_TYPE_LABELS[t],
          }))}
          value={type}
          onChange={(e) => patch(() => setType(e.target.value))}
          containerStyle={{ width: 150 }}
        />
        <Select
          aria-label="Estado"
          placeholder="Estado"
          options={ENROLLMENT_STATUSES.map((s) => ({ value: s, label: ENROLLMENT_STATUS_LABELS[s] }))}
          value={status}
          onChange={(e) => patch(() => setStatus(e.target.value))}
          containerStyle={{ width: 180 }}
        />
        {!readOnly && (
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={onNew}>
            Nueva matrícula
          </Button>
        )}
      </div>

      {/* Tabla */}
      <Card flush>
        <Table
          columns={columns}
          data={rows}
          rowKey="id"
          hover
          zebra
          emptyText={isLoading ? 'Cargando matrículas…' : 'No hay matrículas que coincidan.'}
        />
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      </Card>

      <DetailDialog enrollmentId={detailId} readOnly={readOnly} onClose={() => setDetailId(null)} />
    </div>
  );
}

// ============================== Detalle =====================================
function DetailDialog({
  enrollmentId,
  readOnly,
  onClose,
}: {
  enrollmentId: string | null;
  readOnly: boolean;
  onClose: () => void;
}) {
  const { data } = useEnrollment(enrollmentId ?? undefined);
  const [cancelOpen, setCancelOpen] = useState(false);

  const scheduleCols: TableColumn<NonNullable<typeof data>['installments'][number]>[] = [
    { key: 'concept', header: 'Concepto' },
    { key: 'dueDate', header: 'Vence', mono: true, align: 'center', width: 110, render: (v) => shortDate(v as string) },
    { key: 'amount', header: 'Monto', num: true, mono: true, render: (v) => formatPEN(toCents(v as string)) },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v, r) =>
        v ? (
          <Badge tone={installmentTone(v as never, r.dueDate)} dot>
            {INSTALLMENT_STATUS_LABELS[v as keyof typeof INSTALLMENT_STATUS_LABELS]}
          </Badge>
        ) : (
          <span style={{ color: 'var(--text-subtle)' }}>—</span>
        ),
    },
  ];

  const pensiones = data ? data.installments.filter((i) => i.type === 'PENSION').length : 0;

  return (
    <>
      <Dialog
        open={!!enrollmentId && !cancelOpen}
        onClose={onClose}
        size="lg"
        icon={<Icons.Clipboard />}
        title={data ? fullName(data.student) : 'Matrícula'}
        description={data ? `${data.code} · ${data.placement.gradeName} ${data.placement.sectionName} · ${data.placement.levelName}` : ''}
        footer={
          <>
            {data && !data.canceled && !readOnly && (
              <Button variant="danger" iconLeft={<Icons.Trash />} onClick={() => setCancelOpen(true)}>
                Anular matrícula
              </Button>
            )}
            <span style={{ flex: 1 }} />
            <Button variant="primary" onClick={onClose}>
              Cerrar
            </Button>
          </>
        }
      >
        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {(
                [
                  ['Tipo', ENROLLMENT_TYPE_LABELS[data.type]],
                  ['Fecha', shortDate(data.enrolledAt)],
                  ['Estado', data.canceled ? 'Anulada' : ENROLLMENT_STATUS_LABELS[data.status]],
                  ['Apoderado firmante', data.signingGuardian?.fullName ?? '—'],
                  ['Cronograma', `1 matrícula + ${pensiones} pensiones`],
                  ...(data.registeredBy ? [['Registrado por', data.registeredBy]] : []),
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k}>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>
                    {k}
                  </div>
                  <div style={{ font: 'var(--type-body-md)', color: 'var(--text-body)' }}>{v}</div>
                </div>
              ))}
            </div>
            <Card flush title="Cronograma de pagos">
              <Table
                columns={scheduleCols}
                data={data.installments}
                rowKey={(_r, i) => i}
                compact
                emptyText="Sin cuotas registradas."
              />
            </Card>
          </div>
        )}
      </Dialog>

      {data && (
        <CancelDialog
          open={cancelOpen}
          enrollmentId={data.id}
          code={data.code}
          onClose={() => setCancelOpen(false)}
          onDone={() => {
            setCancelOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

// ---- Diálogo anular --------------------------------------------------------
function CancelDialog({
  open,
  enrollmentId,
  code,
  onClose,
  onDone,
}: {
  open: boolean;
  enrollmentId: string;
  code: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const cancel = useCancelEnrollment();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (reason.trim().length < 10) {
      setError('La justificación debe tener al menos 10 caracteres.');
      return;
    }
    cancel.mutate(
      { id: enrollmentId, reason: reason.trim() },
      {
        onSuccess: (res) => {
          const detail =
            res.paidCount > 0
              ? `${code} · deuda en cero. ${res.paidCount} cuota(s) pagada(s) conservan su recibo — corrígelas por Devoluciones.`
              : `${code} · queda en el historial con su justificación. Deuda en cero.`;
          toast('success', 'Matrícula anulada', detail);
          setReason('');
          onDone();
        },
        onError: (err) =>
          toast('danger', 'No se pudo anular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Trash />}
      iconTone="danger"
      title="Anular matrícula"
      description={`${code} · la anulación queda registrada en el historial`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Volver
          </Button>
          <Button variant="danger" iconLeft={<Icons.Check />} disabled={cancel.isPending} onClick={submit}>
            Anular
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Alert tone="warning" title="Anular corrige un error de registro">
          Anula TODO el cronograma no pagado, incluidas las cuotas vencidas: la deuda queda en cero.
          Si el estudiante se retira del colegio, usa Retirar o trasladar en su ficha — así la deuda
          vencida se conserva.
        </Alert>
        <Textarea
          label="Motivo de la anulación"
          required
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError('');
          }}
          error={error}
          hint="Mínimo 10 caracteres. Nada se borra: la matrícula queda en el historial."
          rows={3}
          placeholder="Ej. el apoderado desistió de la matrícula antes de firmar la ficha."
        />
      </div>
    </Dialog>
  );
}
