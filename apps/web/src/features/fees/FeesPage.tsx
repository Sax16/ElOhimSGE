// Pantalla Tarifario y becas (Etapa 5): tarifas por nivel + parámetros de mora,
// y catálogo de descuentos/becas. Spec: design/ui_kits/sge/FeesScreen.jsx.
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  IconButton,
  Icons,
  Input,
  Select,
  Switch,
  Table,
  Tabs,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { BadgeTone, TableColumn } from '@elohim/ui';
import {
  ACTIVE_STATUS_LABELS,
  DISCOUNT_APPLICATIONS,
  DISCOUNT_APPLICATION_LABELS,
  PROGRAM_STATUS_LABELS,
  formatPEN,
  toCents,
  type ActiveStatus,
  type DiscountApplication,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { vigenciaText } from '../structure/bits';
import {
  useCreateDiscount,
  useFees,
  useUpdateBillingSettings,
  useUpdateDiscount,
  useUpdateLevelFee,
} from './api';
import type { BillingSettings, Discount, FeeLevel } from './types';

/** "10 (mar–dic)" / "11 (feb–dic)" según el número de cuotas. */
function cuotasLabel(n: number): string {
  return n >= 11 ? '11 (feb–dic)' : '10 (mar–dic)';
}

/** Total anual = matrícula única + pensión × cuotas (en centavos). */
function annualTotal(level: FeeLevel): string {
  return formatPEN(toCents(level.enrollmentFee) + toCents(level.monthlyFee) * level.installmentsCount);
}

export function FeesPage() {
  const [tab, setTab] = useState<'tarifas' | 'becas'>('tarifas');
  const { yearId, yearName, readOnly } = useSelectedYear();
  const { data, isLoading } = useFees(yearId);

  const discountsCount = data?.discounts.length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as 'tarifas' | 'becas')}
        items={[
          { id: 'tarifas', label: `Tarifario ${yearName}`.trim() },
          { id: 'becas', label: 'Descuentos y becas', count: discountsCount },
        ]}
      />
      {tab === 'tarifas' ? (
        <TarifasTab data={data} isLoading={isLoading} readOnly={readOnly} yearName={yearName} />
      ) : (
        <BecasTab data={data} isLoading={isLoading} readOnly={readOnly} />
      )}
    </div>
  );
}

// ============================== Tarifas =====================================
function TarifasTab({
  data,
  isLoading,
  readOnly,
  yearName,
}: {
  data: ReturnType<typeof useFees>['data'];
  isLoading: boolean;
  readOnly: boolean;
  yearName: string;
}) {
  const [editLevel, setEditLevel] = useState<FeeLevel | null>(null);

  const levelCols: TableColumn<FeeLevel>[] = [
    {
      key: 'levelName',
      header: 'Nivel',
      render: (v) => (
        <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>{v}</span>
      ),
    },
    { key: 'enrollmentFee', header: 'Matrícula (única)', num: true, mono: true, render: (v) => formatPEN(toCents(v as string)) },
    { key: 'monthlyFee', header: 'Pensión mensual', num: true, mono: true, render: (v) => formatPEN(toCents(v as string)) },
    {
      key: 'installmentsCount',
      header: 'Cuotas al año',
      align: 'center',
      mono: true,
      render: (v) => cuotasLabel(v as number),
    },
    {
      key: 'total',
      header: 'Total anual',
      num: true,
      mono: true,
      render: (_v, r) => (
        <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{annualTotal(r)}</span>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) =>
        readOnly ? null : (
          <IconButton label="Editar tarifa" size="sm" onClick={() => setEditLevel(r)}>
            <Icons.Pencil />
          </IconButton>
        ),
    },
  ];

  const programCols: TableColumn<NonNullable<typeof data>['programs'][number]>[] = [
    {
      key: 'name',
      header: 'Programa',
      render: (v) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>,
    },
    {
      key: 'vigencia',
      header: 'Vigencia',
      mono: true,
      render: (_v, r) => vigenciaText(r.startMonth, r.endMonth),
    },
    {
      key: 'enrollmentFee',
      header: 'Matrícula',
      num: true,
      mono: true,
      render: (v) => (toCents(v as string) === 0 ? 'Sin pago' : formatPEN(toCents(v as string))),
    },
    { key: 'monthlyFee', header: 'Mensualidad', num: true, mono: true, render: (v) => formatPEN(toCents(v as string)) },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v) => (
        <Badge tone={v === 'ACTIVO' ? 'success' : 'neutral'} dot>
          {PROGRAM_STATUS_LABELS[v as keyof typeof PROGRAM_STATUS_LABELS]}
        </Badge>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info">
        Estos montos alimentan la <b>generación automática del cronograma</b> en cada matrícula. Cambiarlos no
        altera cronogramas ya generados.
      </Alert>

      <Card flush title={`Enseñanza regular · ${yearName}`.trim()}>
        <Table
          columns={levelCols}
          data={data?.levels ?? []}
          rowKey="levelId"
          emptyText={isLoading ? 'Cargando tarifas…' : 'Aún no hay tarifas por nivel.'}
        />
      </Card>

      <Card
        flush
        title="Programas complementarios"
        subtitle="Se editan en Estructura académica → Programas"
      >
        <Table
          columns={programCols}
          data={data?.programs ?? []}
          rowKey="id"
          emptyText={isLoading ? 'Cargando programas…' : 'No hay programas registrados.'}
        />
      </Card>

      {data && <MoraCard settings={data.settings} readOnly={readOnly} />}

      <LevelFeeDialog level={editLevel} onClose={() => setEditLevel(null)} readOnly={readOnly} />
    </div>
  );
}

// ---- Card de mora / parámetros de facturación ------------------------------
function MoraCard({ settings, readOnly }: { settings: BillingSettings; readOnly: boolean }) {
  const { toast } = useToast();
  const update = useUpdateBillingSettings();

  const [lateFee, setLateFee] = useState(settings.lateFeeAmount);
  const [graceDays, setGraceDays] = useState(String(settings.graceDays));
  const [cutoffDay, setCutoffDay] = useState(String(settings.transferCutoffDay));
  const [autoLateFee, setAutoLateFee] = useState(settings.autoLateFee);
  const [dueDay, setDueDay] = useState<string>(settings.dueDayOfMonth == null ? '' : String(settings.dueDayOfMonth));

  useEffect(() => {
    setLateFee(settings.lateFeeAmount);
    setGraceDays(String(settings.graceDays));
    setCutoffDay(String(settings.transferCutoffDay));
    setAutoLateFee(settings.autoLateFee);
    setDueDay(settings.dueDayOfMonth == null ? '' : String(settings.dueDayOfMonth));
  }, [settings]);

  const save = () => {
    if (readOnly) return;
    update.mutate(
      {
        lateFeeAmount: lateFee.trim() || '0.00',
        graceDays: Number(graceDays) || 0,
        transferCutoffDay: Number(cutoffDay) || 1,
        autoLateFee,
        dueDayOfMonth: dueDay === '' ? null : Number(dueDay),
      },
      {
        onSuccess: () =>
          toast(
            'success',
            'Mora actualizada',
            `${formatPEN(toCents(lateFee.trim() || '0'))} tras ${graceDays} días de gracia · aplicación ${
              autoLateFee ? 'automática' : 'manual'
            }.`,
          ),
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const dueDayOptions = [
    { value: '', label: 'Último día del mes' },
    ...Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: `Día ${i + 1}` })),
  ];

  return (
    <Card title="Mora por atraso">
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Input
          label="Mora fija"
          prefix="S/."
          value={lateFee}
          onChange={(e) => setLateFee(e.target.value)}
          inputMode="decimal"
          disabled={readOnly}
          containerStyle={{ width: 140 }}
        />
        <Input
          label="Días de gracia"
          value={graceDays}
          onChange={(e) => setGraceDays(e.target.value.replace(/\D/g, ''))}
          suffix="días"
          inputMode="numeric"
          disabled={readOnly}
          containerStyle={{ width: 150 }}
        />
        <Input
          label="Día de corte · ingresos"
          value={cutoffDay}
          onChange={(e) => setCutoffDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
          suffix="del mes"
          inputMode="numeric"
          disabled={readOnly}
          containerStyle={{ width: 190 }}
        />
        <Select
          label="Vencimiento de pensiones"
          options={dueDayOptions}
          value={dueDay}
          onChange={(e) => setDueDay(e.target.value)}
          disabled={readOnly}
          containerStyle={{ width: 190 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', height: 38 }}>
          <Switch
            label="Aplicar mora automáticamente"
            checked={autoLateFee}
            onChange={(e) => setAutoLateFee(e.target.checked)}
            disabled={readOnly}
          />
        </div>
        <div style={{ flex: 1 }} />
        {!readOnly && (
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={update.isPending} onClick={save}>
            Guardar
          </Button>
        )}
      </div>
      <p style={{ margin: '10px 0 0', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
        Día de corte: quien ingresa hasta ese día paga el mes completo; después, ese mes no se
        cobra. Aplica a todo ingreso a mitad de año (traslados incluidos).
      </p>
    </Card>
  );
}

// ---- Diálogo editar tarifa de nivel ----------------------------------------
function LevelFeeDialog({
  level,
  onClose,
  readOnly,
}: {
  level: FeeLevel | null;
  onClose: () => void;
  readOnly: boolean;
}) {
  const { toast } = useToast();
  const update = useUpdateLevelFee();

  const [enrollmentFee, setEnrollmentFee] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [installments, setInstallments] = useState('10');

  useEffect(() => {
    if (!level) return;
    setEnrollmentFee(level.enrollmentFee);
    setMonthlyFee(level.monthlyFee);
    setInstallments(String(level.installmentsCount));
  }, [level]);

  const save = () => {
    if (!level || readOnly) return;
    update.mutate(
      {
        levelId: level.levelId,
        body: {
          enrollmentFee: enrollmentFee.trim() || '0.00',
          monthlyFee: monthlyFee.trim() || '0.00',
          installmentsCount: Number(installments),
        },
      },
      {
        onSuccess: () => {
          toast('success', 'Tarifa actualizada', `${level.levelName} · guardada.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!level}
      onClose={onClose}
      icon={<Icons.Cash />}
      title={level ? `Tarifa · ${level.levelName}` : ''}
      description="Rige para las matrículas nuevas; no altera cronogramas ya generados"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={readOnly || update.isPending} onClick={save}>
            Guardar
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Input
          label="Matrícula (pago único)"
          prefix="S/."
          value={enrollmentFee}
          onChange={(e) => setEnrollmentFee(e.target.value)}
          inputMode="decimal"
        />
        <Input
          label="Pensión mensual"
          prefix="S/."
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          inputMode="decimal"
        />
        <Select
          label="Cuotas al año"
          options={[
            { value: '10', label: '10 (mar–dic)' },
            { value: '11', label: '11 (feb–dic)' },
          ]}
          value={installments}
          onChange={(e) => setInstallments(e.target.value)}
          containerStyle={{ gridColumn: '1 / -1' }}
        />
      </div>
    </Dialog>
  );
}

// ============================== Becas =======================================
const APPLICATION_TONE: Record<DiscountApplication, BadgeTone> = {
  AUTOMATICO: 'brand',
  MANUAL: 'neutral',
};

function BecasTab({
  data,
  isLoading,
  readOnly,
}: {
  data: ReturnType<typeof useFees>['data'];
  isLoading: boolean;
  readOnly: boolean;
}) {
  const { toast } = useToast();
  const updateDiscount = useUpdateDiscount();
  const [dialog, setDialog] = useState<{ discount: Discount | null } | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Discount | null>(null);

  const toggleStatus = (d: Discount) => {
    const next: ActiveStatus = d.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    updateDiscount.mutate(
      { id: d.id, body: { status: next } },
      {
        onSuccess: () =>
          toast('success', 'Estado actualizado', `${d.name} · ${ACTIVE_STATUS_LABELS[next].toLowerCase()}.`),
        onError: (err) =>
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const cols: TableColumn<Discount>[] = [
    {
      key: 'name',
      header: 'Descuento / beca',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>{v}</span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.condition}</span>
        </div>
      ),
    },
    {
      key: 'percent',
      header: 'Efecto',
      align: 'center',
      render: (v) => <Badge tone="accent">−{Number(v)}% pensión</Badge>,
    },
    {
      key: 'application',
      header: 'Aplicación',
      align: 'center',
      render: (v) => (
        <Badge tone={APPLICATION_TONE[v as DiscountApplication]}>
          {DISCOUNT_APPLICATION_LABELS[v as DiscountApplication]}
        </Badge>
      ),
    },
    { key: 'beneficiaries', header: 'Beneficiarios', align: 'center', mono: true },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v) => (
        <Badge tone={v === 'ACTIVO' ? 'success' : 'neutral'} dot>
          {ACTIVE_STATUS_LABELS[v as ActiveStatus]}
        </Badge>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 2 }}>
          <Tooltip content="Ver beneficiarios">
            <IconButton label="Beneficiarios" size="sm" onClick={() => setBeneficiaries(r)}>
              <Icons.Users />
            </IconButton>
          </Tooltip>
          {!readOnly && (
            <>
              <Tooltip content="Editar">
                <IconButton label="Editar" size="sm" onClick={() => setDialog({ discount: r })}>
                  <Icons.Pencil />
                </IconButton>
              </Tooltip>
              <Tooltip content={r.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}>
                <IconButton
                  label={r.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                  size="sm"
                  onClick={() => toggleStatus(r)}
                >
                  {r.status === 'ACTIVO' ? <Icons.Lock /> : <Icons.Check />}
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info">
        Los descuentos se eligen en el paso «Tarifa y cronograma» de la matrícula; los automáticos se proponen
        solos.
      </Alert>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!readOnly && (
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setDialog({ discount: null })}>
            Nuevo descuento
          </Button>
        )}
      </div>
      <Card flush>
        <Table
          columns={cols}
          data={data?.discounts ?? []}
          rowKey="id"
          hover
          emptyText={isLoading ? 'Cargando descuentos…' : 'Aún no hay descuentos ni becas.'}
        />
      </Card>

      {dialog && <DiscountDialog discount={dialog.discount} onClose={() => setDialog(null)} readOnly={readOnly} />}
      <BeneficiariesDialog discount={beneficiaries} onClose={() => setBeneficiaries(null)} />
    </div>
  );
}

// ---- Diálogo nuevo / editar descuento --------------------------------------
function DiscountDialog({
  discount,
  onClose,
  readOnly,
}: {
  discount: Discount | null;
  onClose: () => void;
  readOnly: boolean;
}) {
  const { toast } = useToast();
  const create = useCreateDiscount();
  const update = useUpdateDiscount();
  const edit = discount ?? null;

  const [name, setName] = useState('');
  const [percent, setPercent] = useState('');
  const [application, setApplication] = useState<DiscountApplication>('MANUAL');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState<ActiveStatus>('ACTIVO');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(edit?.name ?? '');
    setPercent(edit ? String(Number(edit.percent)) : '');
    setApplication(edit?.application ?? 'MANUAL');
    setCondition(edit?.condition ?? '');
    setStatus(edit?.status ?? 'ACTIVO');
    setErrors({});
  }, [edit?.id]);

  const pending = create.isPending || update.isPending;

  const submit = () => {
    if (readOnly) return;
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Ingresa un nombre.';
    const pct = Number(percent);
    if (!percent.trim() || Number.isNaN(pct) || pct <= 0 || pct > 100) e.percent = 'Ingresa un % entre 1 y 100.';
    setErrors(e);
    if (Object.keys(e).length) return;

    const body = {
      name: name.trim(),
      percent: pct.toFixed(2),
      application,
      condition: condition.trim(),
      status,
    };
    const onError = (err: unknown) => {
      if (err instanceof ApiError && err.errors?.length) {
        setErrors(Object.fromEntries(err.errors.map((f) => [f.path, f.message])));
      }
      toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    };

    if (edit) {
      update.mutate(
        { id: edit.id, body },
        {
          onSuccess: () => {
            toast('success', 'Descuento actualizado', 'Disponible en el paso de tarifa de la matrícula.');
            onClose();
          },
          onError,
        },
      );
    } else {
      create.mutate(body, {
        onSuccess: () => {
          toast('success', 'Descuento creado', 'Disponible en el paso de tarifa de la matrícula.');
          onClose();
        },
        onError,
      });
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      icon={<Icons.Clipboard />}
      title={edit ? `Editar · ${edit.name}` : 'Nuevo descuento o beca'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={readOnly || pending} onClick={submit}>
            {edit ? 'Guardar cambios' : 'Crear'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Input
          label="Nombre"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Ej. Beca deportiva"
          containerStyle={{ gridColumn: '1 / -1' }}
        />
        <Input
          label="Descuento sobre la pensión"
          suffix="%"
          value={percent}
          onChange={(e) => setPercent(e.target.value.replace(/[^\d.]/g, ''))}
          error={errors.percent}
          inputMode="numeric"
          placeholder="10"
        />
        <Select
          label="Aplicación"
          options={DISCOUNT_APPLICATIONS.map((a) => ({ value: a, label: DISCOUNT_APPLICATION_LABELS[a] }))}
          value={application}
          onChange={(e) => setApplication(e.target.value as DiscountApplication)}
          hint="Automático se propone solo al matricular"
        />
        <Input
          label="Condición"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          placeholder="Ej. desde el 2° hijo matriculado"
          containerStyle={{ gridColumn: '1 / -1' }}
        />
        <Select
          label="Estado"
          options={(['ACTIVO', 'INACTIVO'] as ActiveStatus[]).map((s) => ({ value: s, label: ACTIVE_STATUS_LABELS[s] }))}
          value={status}
          onChange={(e) => setStatus(e.target.value as ActiveStatus)}
        />
      </div>
    </Dialog>
  );
}

// ---- Diálogo beneficiarios (solo conteo en R1; la lista llega con R2) -------
function BeneficiariesDialog({ discount, onClose }: { discount: Discount | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!discount}
      onClose={onClose}
      size="lg"
      icon={<Icons.Users />}
      title={discount ? `Beneficiarios · ${discount.name}` : ''}
      description={discount ? `−${Number(discount.percent)}% pensión` : ''}
      footer={
        <Button variant="primary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {discount && discount.beneficiaries > 0 ? (
        <div style={{ paddingTop: 4 }}>
          <Alert tone="info">
            <b>{discount.beneficiaries}</b>{' '}
            {discount.beneficiaries === 1 ? 'estudiante tiene' : 'estudiantes tienen'} este descuento aplicado. El
            detalle por familia llega con el módulo de cobranza (R2).
          </Alert>
        </div>
      ) : (
        <EmptyState
          icon={<Icons.Users />}
          title="Sin beneficiarios"
          description="Este descuento aún no tiene beneficiarios asignados."
        />
      )}
    </Dialog>
  );
}
