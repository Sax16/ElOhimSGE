// Pestaña Planilla (R3 · Etapa 3): selector de periodo, StatCards, tabla con
// sueldo editable (por horas), régimen, descuentos, aportes, neto y estado, y las
// acciones de pago (solo ADMIN). Spec: design/ui_kits/sge/StaffScreen.jsx
// (función Planilla) · alcance-funcional.md § "Planilla — decisiones de la etapa 3".
import { useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Icons,
  Select,
  StatCard,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { PAYMENT_METHOD_LABELS } from '@elohim/shared';
import { ApiError } from '../../../lib/api';
import { useCan } from '../../../lib/useCan';
import { useMe } from '../../../lib/useMe';
import { avatarColor } from '../bits';
import { exportPayroll, usePayroll, useRefreshPayroll } from './api';
import {
  fmtDateTime,
  isPositive,
  monthName,
  parsePeriod,
  pen,
  periodLabel,
  periodOptions,
  schemeTone,
} from './bits';
import { BoletaDialog } from './BoletaDialog';
import { DescuentosDialog } from './DescuentosDialog';
import { GrossEditDialog } from './GrossEditDialog';
import { CancelPaymentDialog, PayAllDialog, PayDialog } from './PayDialogs';
import type { PayrollEntryDto } from './types';
import './payroll.css';

const PERIODS = periodOptions();
const DEFAULT_PERIOD = PERIODS[0]?.value ?? '';

export function PayrollTab() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const canEdit = useCan('personal', 'editar');
  const canExport = useCan('personal', 'ver');

  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const { year, month } = parsePeriod(period);

  const { data, isLoading } = usePayroll(year, month);
  const refresh = useRefreshPayroll();

  const [descId, setDescId] = useState<string | null>(null);
  const [boletaId, setBoletaId] = useState<string | null>(null);
  const [grossId, setGrossId] = useState<string | null>(null);
  const [payId, setPayId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [payAllOpen, setPayAllOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const entries = useMemo(() => data?.entries ?? [], [data]);
  const stats = data?.stats;
  const period_ = data?.period;
  const essaludRatePct = data?.essaludRatePct ?? '9.00';

  const findEntry = (id: string | null): PayrollEntryDto | null =>
    id ? entries.find((e) => e.id === id) ?? null : null;

  const onRefresh = () => {
    if (!period_) return;
    refresh.mutate(period_.id, {
      onSuccess: () => toast('success', 'Planilla actualizada', 'Sueldos y empleados nuevos sincronizados.'),
      onError: (err) =>
        toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const onExport = async () => {
    setExporting(true);
    try {
      await exportPayroll(year, month);
      toast('success', 'Planilla exportada', `${periodLabel(year, month)} · descargada en Excel.`);
    } catch (err) {
      toast('danger', 'No se pudo exportar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  const columns: TableColumn<PayrollEntryDto>[] = [
    {
      key: 'staffName',
      header: 'Empleado',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.staffName} size="sm" color={avatarColor(r.staffCode)} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.staffName}</span>
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.position}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Sueldo',
      num: true,
      mono: true,
      render: (_v, r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{pen(r.grossAmount)}</span>
          {r.grossEdited && (
            <Tooltip content="Monto editado para este mes">
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--brand)',
                  display: 'inline-block',
                }}
              />
            </Tooltip>
          )}
          {r.grossEditable && r.status === 'PENDIENTE' && canEdit && (
            <Tooltip content="Editar monto del mes">
              <IconButton label="Editar monto" size="sm" onClick={() => setGrossId(r.id)}>
                <Icons.Pencil />
              </IconButton>
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      key: 'schemeName',
      header: 'Régimen',
      align: 'center',
      render: (_v, r) => <Badge tone={schemeTone(r.schemeKind)}>{r.schemeName}</Badge>,
    },
    {
      key: 'discountTotal',
      header: 'Descuentos',
      num: true,
      mono: true,
      render: (_v, r) => {
        const has = isPositive(r.discountTotal);
        return (
          <Button
            variant="link"
            size="sm"
            onClick={() => setDescId(r.id)}
            title="Ver / gestionar descuentos"
            style={{
              fontFamily: 'var(--font-mono)',
              color: has ? 'var(--danger)' : 'var(--text-muted)',
            }}
          >
            {has ? `− ${pen(r.discountTotal)}` : '—'}
          </Button>
        );
      },
    },
    {
      key: 'contribTotal',
      header: 'Aportes',
      num: true,
      mono: true,
      render: (_v, r) => (
        <Button
          variant="link"
          size="sm"
          onClick={() => setBoletaId(r.id)}
          title="Ver desglose de boleta"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          − {pen(r.contribTotal)}
        </Button>
      ),
    },
    {
      key: 'netAmount',
      header: 'Neto a pagar',
      num: true,
      mono: true,
      render: (_v, r) => (
        <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{pen(r.netAmount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => <StatusCell entry={r} />,
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
          <Tooltip content="Descuentos">
            <IconButton label="Descuentos" size="sm" onClick={() => setDescId(r.id)}>
              <Icons.Chart />
            </IconButton>
          </Tooltip>
          {r.status === 'PAGADO' ? (
            <>
              <Tooltip content="Ver boleta">
                <IconButton label="Ver boleta" size="sm" onClick={() => setBoletaId(r.id)}>
                  <Icons.Receipt />
                </IconButton>
              </Tooltip>
              {isAdmin && (
                <Tooltip content="Anular pago">
                  <IconButton label="Anular pago" size="sm" variant="danger" onClick={() => setCancelId(r.id)}>
                    <Icons.Trash />
                  </IconButton>
                </Tooltip>
              )}
            </>
          ) : (
            isAdmin && (
              <Button size="sm" variant="primary" onClick={() => setPayId(r.id)}>
                Pagar
              </Button>
            )
          )}
        </div>
      ),
    },
  ];

  const pendingCount = stats?.pendingCount ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* StatCards */}
      <div className="esge-payroll-stats">
        <StatCard
          label={`Planilla · ${monthName(month)}`}
          value={stats ? pen(stats.totalNet) : '—'}
          icon={<Icons.Building />}
          caption={stats ? `${stats.employeeCount} empleados` : undefined}
        />
        <StatCard
          label="Pagado"
          value={stats ? pen(stats.paidNet) : '—'}
          iconTone="success"
          icon={<Icons.Check />}
          caption={stats ? `${stats.paidCount} empleados` : undefined}
        />
        <StatCard
          label="Por pagar"
          value={stats ? pen(stats.pendingNet) : '—'}
          iconTone="accent"
          icon={<Icons.Clock />}
          caption={stats ? `${stats.pendingCount} pendientes` : undefined}
        />
        <StatCard
          label="Descuentos del mes"
          value={stats ? pen(stats.discountsTotal) : '—'}
          iconTone="danger"
          icon={<Icons.Chart />}
          caption="tardanzas y manuales"
        />
      </div>

      {/* Controles: periodo + acciones */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Periodo"
          options={PERIODS}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          containerStyle={{ width: 180 }}
        />
        <div style={{ flex: 1 }} />
        {canEdit && (
          <Tooltip content="Trae sueldos y empleados nuevos; no toca filas pagadas">
            <Button
              variant="secondary"
              iconLeft={<Icons.ArrowRight />}
              disabled={refresh.isPending || !period_}
              onClick={onRefresh}
            >
              Actualizar
            </Button>
          </Tooltip>
        )}
        {canExport && (
          <Button variant="secondary" iconLeft={<Icons.Download />} disabled={exporting} onClick={onExport}>
            Exportar planilla
          </Button>
        )}
        {isAdmin && (
          <Button
            variant="accent"
            iconLeft={<Icons.Cash />}
            disabled={pendingCount === 0}
            onClick={() => setPayAllOpen(true)}
          >
            Pagar todos los pendientes
          </Button>
        )}
      </div>

      {/* Tabla */}
      {!isLoading && entries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Icons.Building />}
            title="Sin planilla este mes"
            description="No hay empleados activos para generar la planilla del periodo."
          />
        </Card>
      ) : (
        <Card
          flush
          title={`Planilla · ${periodLabel(year, month)}`}
          subtitle={`AFP u ONP según la ficha de cada empleado · EsSalud ${essaludRatePct}% a cargo del colegio · clic en aportes para ver la boleta`}
        >
          <Table
            columns={columns}
            data={entries}
            rowKey="id"
            hover
            zebra
            emptyText={isLoading ? 'Cargando planilla…' : 'Sin empleados este mes.'}
          />
        </Card>
      )}

      {/* Diálogos */}
      <DescuentosDialog
        entry={findEntry(descId)}
        year={year}
        month={month}
        canEdit={canEdit}
        onClose={() => setDescId(null)}
      />
      <BoletaDialog
        entry={findEntry(boletaId)}
        year={year}
        month={month}
        essaludRatePct={essaludRatePct}
        onClose={() => setBoletaId(null)}
      />
      {canEdit && <GrossEditDialog entry={findEntry(grossId)} onClose={() => setGrossId(null)} />}
      {isAdmin && (
        <>
          <PayDialog entry={findEntry(payId)} year={year} month={month} onClose={() => setPayId(null)} />
          <CancelPaymentDialog entry={findEntry(cancelId)} onClose={() => setCancelId(null)} />
          {period_ && (
            <PayAllDialog
              open={payAllOpen}
              periodId={period_.id}
              year={year}
              month={month}
              pendingCount={pendingCount}
              pendingNet={stats?.pendingNet ?? '0.00'}
              onClose={() => setPayAllOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Badge de estado con tooltip (método + fecha + batch en Pagado). */
function StatusCell({ entry }: { entry: PayrollEntryDto }) {
  if (entry.status === 'PAGADO') {
    const method = entry.paymentMethod ? PAYMENT_METHOD_LABELS[entry.paymentMethod] : '';
    const parts = [method, fmtDateTime(entry.paidAt)].filter(Boolean);
    if (entry.batchCode) parts.push(entry.batchCode);
    const tip = parts.join(' · ');
    const badge = (
      <Badge tone="success" dot>
        Pagado
      </Badge>
    );
    return tip ? <Tooltip content={tip}>{badge}</Tooltip> : badge;
  }
  return (
    <Badge tone="warning" dot>
      Pendiente
    </Badge>
  );
}
