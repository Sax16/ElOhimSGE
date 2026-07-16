// Pestaña Configuración → Planilla (R3 · Etapa 4, solo Admin): parámetros globales
// de planilla (EsSalud, día de pago, tasas futuras de gratificación/CTS) y edición
// del catálogo de régimen pensionario (AFP/ONP). Los cambios de tasas rigen para
// generaciones/refresh futuros; las filas ya generadas conservan su snapshot.
// Spec: alcance-funcional.md § "Integraciones — decisiones de la etapa 4".
import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Dialog,
  Icons,
  IconButton,
  Input,
  Switch,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import {
  usePayrollSettings,
  useUpdatePayrollSettings,
  useUpdatePensionScheme,
  type PayrollSettingsInput,
  type PensionScheme,
} from './api';

/** Aviso compartido: los cambios rigen a futuro, las filas generadas no cambian. */
const SCHEME_NOTICE = 'Rige para planillas futuras; las generadas conservan su snapshot.';

export function PayrollSettingsTab() {
  const { data, isLoading } = usePayrollSettings();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ParamsCard />
      <SchemesCard schemes={data?.pensionSchemes ?? []} isLoading={isLoading} />
    </div>
  );
}

// ---- Card: Parámetros de planilla ------------------------------------------
function ParamsCard() {
  const { toast } = useToast();
  const { data } = usePayrollSettings();
  const update = useUpdatePayrollSettings();

  const [essaludRatePct, setEssalud] = useState('');
  const [payDay, setPayDay] = useState('');
  const [gratiRatePct, setGrati] = useState('');
  const [gratiBonusPct, setGratiBonus] = useState('');
  const [ctsDaysPerYear, setCts] = useState('');

  // Carga los valores actuales cuando llegan de la API.
  const s = data?.settings;
  useEffect(() => {
    if (s) {
      setEssalud(s.essaludRatePct);
      setPayDay(s.payDayOfMonth == null ? '' : String(s.payDayOfMonth));
      setGrati(s.gratiRatePct);
      setGratiBonus(s.gratiBonusPct);
      setCts(String(s.ctsDaysPerYear));
    }
  }, [s]);

  const payDayNum = payDay.trim() === '' ? null : Number(payDay);
  const ctsNum = Number(ctsDaysPerYear);
  const payDayValid = payDayNum == null || (Number.isInteger(payDayNum) && payDayNum >= 1 && payDayNum <= 31);
  const ctsValid = Number.isFinite(ctsNum) && ctsNum >= 0;
  const ratesValid = [essaludRatePct, gratiRatePct, gratiBonusPct].every(
    (r) => r.trim() !== '' && Number.isFinite(Number(r)) && Number(r) >= 0,
  );
  const valid = payDayValid && ctsValid && ratesValid;

  const onSave = () => {
    if (!valid) return;
    const body: PayrollSettingsInput = {
      essaludRatePct: Number(essaludRatePct).toFixed(2),
      gratiRatePct: Number(gratiRatePct).toFixed(2),
      gratiBonusPct: Number(gratiBonusPct).toFixed(2),
      ctsDaysPerYear: ctsNum,
      payDayOfMonth: payDayNum,
    };
    update.mutate(body, {
      onSuccess: () => toast('success', 'Parámetros guardados', 'Los parámetros de planilla se actualizaron.'),
      onError: (err) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  return (
    <Card
      title="Parámetros de planilla"
      subtitle="Aportes del empleador y día de pago; los porcentajes futuros se usarán más adelante"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 520 }}>
        <Input
          label="EsSalud"
          suffix="%"
          inputMode="decimal"
          value={essaludRatePct}
          onChange={(e) => setEssalud(e.target.value)}
          hint="A cargo del colegio"
        />
        <Input
          label="Día de pago del mes"
          inputMode="numeric"
          value={payDay}
          onChange={(e) => setPayDay(e.target.value)}
          hint="Vacío = último día del mes"
          error={payDayValid ? undefined : 'Debe estar entre 1 y 31.'}
        />
      </div>

      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)', marginBottom: 4 }}>
          Para gratificaciones y CTS
        </div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginBottom: 14 }}>
          Se usarán en un release futuro.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, maxWidth: 520 }}>
          <Input
            label="Gratificación"
            suffix="%"
            inputMode="decimal"
            value={gratiRatePct}
            onChange={(e) => setGrati(e.target.value)}
          />
          <Input
            label="Bonificación extraordinaria"
            suffix="%"
            inputMode="decimal"
            value={gratiBonusPct}
            onChange={(e) => setGratiBonus(e.target.value)}
          />
          <Input
            label="Días de CTS por año"
            inputMode="numeric"
            value={ctsDaysPerYear}
            onChange={(e) => setCts(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <Button
          variant="primary"
          iconLeft={<Icons.Check />}
          disabled={!valid || update.isPending || !data}
          onClick={onSave}
        >
          Guardar cambios
        </Button>
      </div>
    </Card>
  );
}

// ---- Card: Régimen pensionario ---------------------------------------------
function SchemesCard({ schemes, isLoading }: { schemes: PensionScheme[]; isLoading: boolean }) {
  const { toast } = useToast();
  const update = useUpdatePensionScheme();
  const [editing, setEditing] = useState<PensionScheme | null>(null);

  const onToggleActive = (scheme: PensionScheme, active: boolean) => {
    update.mutate(
      { id: scheme.id, body: { active } },
      {
        onSuccess: () =>
          toast('success', active ? 'Régimen activado' : 'Régimen desactivado', SCHEME_NOTICE),
        onError: (err) =>
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const columns: TableColumn<PensionScheme>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (_v, r) => (
        <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>{r.name}</span>
      ),
    },
    {
      key: 'kind',
      header: 'Tipo',
      align: 'center',
      render: (_v, r) => <Badge tone={r.kind === 'AFP' ? 'brand' : 'neutral'}>{r.kind}</Badge>,
    },
    {
      key: 'rates',
      header: 'Tasas',
      render: (_v, r) => <SchemeRates scheme={r} />,
    },
    {
      key: 'staffCount',
      header: 'Empleados',
      align: 'center',
      mono: true,
      render: (_v, r) => r.staffCount,
    },
    {
      key: 'active',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => (
        <Switch
          size="sm"
          checked={r.active}
          disabled={update.isPending}
          onChange={(e) => onToggleActive(r, e.target.checked)}
          aria-label={r.active ? `Desactivar ${r.name}` : `Activar ${r.name}`}
        />
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <Tooltip content="Editar tasas">
          <IconButton label="Editar tasas" size="sm" onClick={() => setEditing(r)}>
            <Icons.Pencil />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Card flush title="Régimen pensionario" subtitle="Catálogo AFP/ONP · tasas de aporte, fondo, comisión y seguro">
      <Table
        columns={columns}
        data={schemes}
        rowKey="id"
        hover
        zebra
        emptyText={isLoading ? 'Cargando catálogo…' : 'Sin regímenes registrados.'}
      />
      <div style={{ padding: '12px 16px', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
        {SCHEME_NOTICE} Una AFP inactiva no se ofrece para fichas nuevas, pero se conserva en las existentes.
      </div>
      <SchemeDialog scheme={editing} onClose={() => setEditing(null)} />
    </Card>
  );
}

/** Muestra las tasas del régimen (mono): ONP su aporte, AFP fondo/comisión/seguro. */
function SchemeRates({ scheme }: { scheme: PensionScheme }) {
  const style = { fontFamily: 'var(--font-mono)', color: 'var(--text-body)', font: 'var(--type-caption)' };
  if (scheme.kind === 'ONP') {
    return <span style={style}>Aporte {scheme.onpRatePct ?? '—'}%</span>;
  }
  return (
    <span style={style}>
      Fondo {scheme.fundRatePct ?? '—'}% · Com. {scheme.commissionRatePct ?? '—'}% · Seg. {scheme.insuranceRatePct ?? '—'}%
    </span>
  );
}

// ---- Diálogo: editar tasas del régimen -------------------------------------
function SchemeDialog({ scheme, onClose }: { scheme: PensionScheme | null; onClose: () => void }) {
  const { toast } = useToast();
  const update = useUpdatePensionScheme();

  const [onp, setOnp] = useState('');
  const [fund, setFund] = useState('');
  const [commission, setCommission] = useState('');
  const [insurance, setInsurance] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (scheme) {
      setOnp(scheme.onpRatePct ?? '');
      setFund(scheme.fundRatePct ?? '');
      setCommission(scheme.commissionRatePct ?? '');
      setInsurance(scheme.insuranceRatePct ?? '');
      setActive(scheme.active);
    }
  }, [scheme]);

  const isOnp = scheme?.kind === 'ONP';
  const rate = (v: string) => v.trim() !== '' && Number.isFinite(Number(v)) && Number(v) >= 0;
  const valid = isOnp ? rate(onp) : rate(fund) && rate(commission) && rate(insurance);

  const submit = () => {
    if (!scheme || !valid) return;
    const body = isOnp
      ? { onpRatePct: Number(onp).toFixed(2), active }
      : {
          fundRatePct: Number(fund).toFixed(2),
          commissionRatePct: Number(commission).toFixed(2),
          insuranceRatePct: Number(insurance).toFixed(2),
          active,
        };
    update.mutate(
      { id: scheme.id, body },
      {
        onSuccess: () => {
          toast('success', 'Régimen actualizado', SCHEME_NOTICE);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!scheme}
      onClose={onClose}
      icon={<Icons.Pencil />}
      title="Editar régimen pensionario"
      description={scheme ? `${scheme.name} · ${scheme.kind}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={!valid || update.isPending} onClick={submit}>
            Guardar
          </Button>
        </>
      }
    >
      {scheme && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          {isOnp ? (
            <Input
              label="Aporte ONP"
              suffix="%"
              inputMode="decimal"
              value={onp}
              onChange={(e) => setOnp(e.target.value)}
              autoFocus
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <Input label="Fondo" suffix="%" inputMode="decimal" value={fund} onChange={(e) => setFund(e.target.value)} autoFocus />
              <Input label="Comisión" suffix="%" inputMode="decimal" value={commission} onChange={(e) => setCommission(e.target.value)} />
              <Input label="Seguro" suffix="%" inputMode="decimal" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
            </div>
          )}
          <Switch checked={active} onChange={(e) => setActive(e.target.checked)} label="Activa" />
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{SCHEME_NOTICE}</span>
        </div>
      )}
    </Dialog>
  );
}
