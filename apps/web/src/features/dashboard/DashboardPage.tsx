// Dashboard económico (R2 · Etapa 5). Reemplaza el dashboard mínimo de R1 con
// datos reales de dinero: KPIs, pagos recientes, avance de cobranza del mes por
// nivel, últimos gastos de Tesorería y principales deudores con recordatorio.
// Spec: design/ui_kits/sge/DashboardScreen.jsx con los reemplazos de la etapa 5
// (alcance-funcional.md § «Dashboard y reportes — decisiones de la etapa 5»).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Icons,
  ProgressBar,
  StatCard,
  Table,
} from '@elohim/ui';
import type { BadgeTone, TableColumn } from '@elohim/ui';
import { PAYMENT_METHOD_LABELS, formatPEN, toCents } from '@elohim/shared';
import { useCan } from '../../lib/useCan';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { fmtDayMonth } from '../structure/bits';
import { fmtTime, methodTone } from '../cashier/bits';
import { ReminderDialog } from '../payments/ReminderDialog';
import { useDashboardSummary } from './api';
import type { RecentReceipt, TopDebtor, UpcomingPayroll } from './types';
import './dashboard.css';

const MONTH_NAMES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Tono del ProgressBar por % de cobranza: success ≥90, brand ≥82, warning si no. */
function collectionTone(pct: number): 'success' | 'brand' | 'warning' {
  return pct >= 90 ? 'success' : pct >= 82 ? 'brand' : 'warning';
}

const CASH_STATUS = {
  ABIERTA: { label: 'Abierta', tone: 'success' as BadgeTone },
  CERRADA: { label: 'Cerrada', tone: 'neutral' as BadgeTone },
  SINABRIR: { label: 'Sin abrir', tone: 'warning' as BadgeTone },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { yearId } = useSelectedYear();
  const { data, isLoading } = useDashboardSummary(yearId);
  const canRemind = useCan('pensiones', 'editar');

  const [reminderGuardian, setReminderGuardian] = useState<{ id: string; name: string } | null>(null);

  const monthName = data ? MONTH_NAMES[data.monthCollected.month] ?? '' : '';
  const cash = data?.todayCash.sessionStatus
    ? CASH_STATUS[data.todayCash.sessionStatus]
    : CASH_STATUS.SINABRIR;

  const receiptCols: TableColumn<RecentReceipt>[] = [
    {
      key: 'studentName',
      header: 'Estudiante',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.studentName} size="sm" color="var(--blue-500)" />
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v as string}</span>
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.gradeSection}</span>
          </div>
        </div>
      ),
    },
    { key: 'summary', header: 'Concepto' },
    {
      key: 'createdAt',
      header: 'Fecha',
      align: 'center',
      render: (v) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>{fmtTime(v as string)}</span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {fmtDayMonth(v as string)}
          </span>
        </div>
      ),
    },
    {
      key: 'method',
      header: 'Método',
      align: 'center',
      render: (v) => <Badge tone={methodTone(v as RecentReceipt['method'])}>{PAYMENT_METHOD_LABELS[v as RecentReceipt['method']]}</Badge>,
    },
    {
      key: 'totalAmount',
      header: 'Monto',
      align: 'right',
      render: (v, r) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: r.status === 'ANULADO' ? 'var(--text-muted)' : 'var(--text-strong)',
            textDecoration: r.status === 'ANULADO' ? 'line-through' : undefined,
          }}
        >
          {formatPEN(toCents(v as string))}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v) => (
        <Badge tone={v === 'ANULADO' ? 'neutral' : 'success'} dot>
          {v === 'ANULADO' ? 'Anulado' : 'Emitido'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="esge-dash">
      {/* KPIs */}
      <div className="esge-dash-stats">
        <StatCard
          label="Estudiantes"
          value={data ? String(data.students.active) : '—'}
          icon={<Icons.Users />}
          delta={data && data.students.deltaPct != null ? data.students.deltaPct : undefined}
          caption={data && data.students.deltaPct != null ? 'vs. año anterior' : 'con matrícula vigente'}
        />
        <StatCard
          label={`Cobrado · ${monthName || 'mes'}`}
          value={data ? formatPEN(toCents(data.monthCollected.amount)) : '—'}
          iconTone="success"
          icon={<Icons.Cash />}
          caption={
            data ? `${data.monthCollected.count} ${data.monthCollected.count === 1 ? 'cuota' : 'cuotas'}` : 'del mes'
          }
        />
        <StatCard
          label="Morosidad"
          value={data ? `${data.overdue.rate}%` : '—'}
          iconTone="danger"
          icon={<Icons.Chart />}
          caption={
            data
              ? `${data.overdue.count} ${data.overdue.count === 1 ? 'cuota' : 'cuotas'} · ${formatPEN(toCents(data.overdue.amount))}`
              : 'cuotas vencidas'
          }
        />
        <StatCard
          className="esge-dash-clickable"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/caja')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') navigate('/caja');
          }}
          label="Caja de hoy"
          value={data ? formatPEN(toCents(data.todayCash.collectedToday)) : '—'}
          iconTone="accent"
          icon={<Icons.Receipt />}
          caption={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Badge tone={cash.tone} dot>
                {cash.label}
              </Badge>
              {data ? `${data.todayCash.operationsCount} ${data.todayCash.operationsCount === 1 ? 'operación' : 'operaciones'}` : ''}
            </span>
          }
        />
      </div>

      {/* Pagos recientes + Cobranza del mes */}
      <div className="esge-dash-main">
        <Card
          flush
          title="Pagos recientes"
          subtitle="Últimos recibos emitidos en caja"
          actions={
            <Button variant="ghost" size="sm" iconRight={<Icons.ChevronRight />} onClick={() => navigate('/caja')}>
              Ver todos
            </Button>
          }
        >
          {data && data.recentReceipts.length === 0 ? (
            <EmptyState
              icon={<Icons.Receipt />}
              title="Sin pagos aún"
              description="Los recibos que emitas en caja aparecerán aquí."
            />
          ) : (
            <Table
              columns={receiptCols}
              data={data?.recentReceipts ?? []}
              rowKey="id"
              hover
              emptyText={isLoading ? 'Cargando pagos…' : 'Sin pagos.'}
            />
          )}
        </Card>

        <Card title={`Cobranza de ${monthName || 'mes'}`} subtitle={data ? `Meta mensual ${formatPEN(toCents(data.collectionGoal.expected))}` : 'Meta mensual derivada'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ font: 'var(--type-h1)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
                  {data ? formatPEN(toCents(data.collectionGoal.collected)) : '—'}
                </span>
                <span style={{ font: 'var(--type-label)', color: 'var(--success)' }}>
                  {data ? `${data.collectionGoal.pct}%` : ''}
                </span>
              </div>
              <ProgressBar value={data?.collectionGoal.pct ?? 0} tone="success" />
            </div>
            {data && data.collectionByLevel.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span className="eyebrow">Cobranza por nivel</span>
                {data.collectionByLevel.map((lvl) => (
                  <ProgressBar
                    key={lvl.label}
                    label={lvl.label}
                    value={lvl.pct}
                    showValue
                    size="sm"
                    tone={collectionTone(lvl.pct)}
                    valueFormat={() => `${lvl.pct}%`}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Últimos gastos + Principales deudores */}
      <div className="esge-dash-eco">
        <Card
          flush
          title="Próximos egresos"
          subtitle="Planilla del mes y últimos movimientos de Tesorería"
          actions={
            <Button variant="ghost" size="sm" iconRight={<Icons.ChevronRight />} onClick={() => navigate('/tesoreria')}>
              Ver todos
            </Button>
          }
        >
          {data && (
            <PayrollDue
              payroll={data.upcomingPayroll}
              onGoToPayroll={() => navigate('/docentes', { state: { tab: 'planilla' } })}
            />
          )}
          <div className="esge-dash-subhead">Últimos gastos registrados</div>
          {data && data.recentExpenses.length === 0 ? (
            <EmptyState
              icon={<Icons.Chart />}
              title="Sin gastos aún"
              description="Los gastos que registres en Tesorería aparecerán aquí."
            />
          ) : (
            <div>
              {(data?.recentExpenses ?? []).map((e) => (
                <div key={e.id} className="esge-dash-row">
                  <span className="esge-dash-row__icon">
                    <Icons.ArrowRight />
                  </span>
                  <div className="esge-dash-row__main">
                    <div className="esge-dash-row__title">{e.description}</div>
                    <div className="esge-dash-row__sub">
                      {e.categoryName} · {fmtDayMonth(e.date)}
                    </div>
                  </div>
                  <span className="esge-dash-row__amount" style={{ color: 'var(--text-strong)' }}>
                    {formatPEN(toCents(e.amount))}
                  </span>
                </div>
              ))}
              {isLoading && !data && (
                <div style={{ padding: '18px', color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
              )}
            </div>
          )}
        </Card>

        <Card
          flush
          title="Principales deudores"
          subtitle={data ? `Familias con cuotas vencidas — ${formatPEN(toCents(data.overdue.amount))} en total` : 'Familias con cuotas vencidas'}
          actions={
            <Button variant="ghost" size="sm" iconRight={<Icons.ChevronRight />} onClick={() => navigate('/pagos')}>
              Ver morosidad
            </Button>
          }
        >
          {data && data.topDebtors.length === 0 ? (
            <EmptyState
              icon={<Icons.Users />}
              title="Sin deudores"
              description="No hay familias con cuotas vencidas. ¡Cobranza al día!"
            />
          ) : (
            <div>
              {(data?.topDebtors ?? []).map((d) => (
                <DebtorRow
                  key={d.guardianId}
                  debtor={d}
                  canRemind={canRemind}
                  onRemind={() => setReminderGuardian({ id: d.guardianId, name: d.guardianName })}
                />
              ))}
              {isLoading && !data && (
                <div style={{ padding: '18px', color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
              )}
            </div>
          )}
        </Card>
      </div>

      <ReminderDialog
        guardianId={reminderGuardian?.id ?? null}
        guardianName={reminderGuardian?.name}
        open={!!reminderGuardian}
        canMutate={canRemind}
        onClose={() => setReminderGuardian(null)}
      />
    </div>
  );
}

/** Bloque superior de «Próximos egresos»: la planilla del mes como cuenta por pagar. */
function PayrollDue({ payroll, onGoToPayroll }: { payroll: UpcomingPayroll; onGoToPayroll: () => void }) {
  const month = MONTH_NAMES[payroll.month] ?? '';

  // No generada: aún no es una cuenta por pagar firme; se muestra el estimado.
  if (!payroll.generated) {
    return (
      <div className="esge-dash-payroll esge-dash-payroll--info">
        <span className="esge-dash-payroll__icon">
          <Icons.Building />
        </span>
        <div className="esge-dash-payroll__main">
          <div className="esge-dash-payroll__title">Planilla {month} aún no generada</div>
          <div className="esge-dash-payroll__sub">
            {payroll.estimatedNet != null
              ? `Estimado ${formatPEN(toCents(payroll.estimatedNet))}`
              : 'Se genera al abrir la pestaña Planilla del mes en curso.'}
          </div>
        </div>
      </div>
    );
  }

  // Generada con pendientes: cuenta por pagar real, clic para ir a pagar.
  if (payroll.pendingCount > 0) {
    return (
      <button type="button" className="esge-dash-payroll esge-dash-payroll--due" onClick={onGoToPayroll}>
        <span className="esge-dash-payroll__icon">
          <Icons.Clock />
        </span>
        <div className="esge-dash-payroll__main">
          <div className="esge-dash-payroll__title">
            Planilla {month} · {formatPEN(toCents(payroll.pendingNet))}
          </div>
          <div className="esge-dash-payroll__sub">
            {payroll.pendingCount} por pagar · vence {fmtDayMonth(payroll.dueDate)}
          </div>
        </div>
        <Icons.ChevronRight />
      </button>
    );
  }

  // Generada y al día.
  return (
    <div className="esge-dash-payroll esge-dash-payroll--paid">
      <span className="esge-dash-payroll__icon">
        <Icons.Check />
      </span>
      <div className="esge-dash-payroll__main">
        <div className="esge-dash-payroll__title">Planilla {month} al día</div>
        <div className="esge-dash-payroll__sub">Todos los empleados están pagados.</div>
      </div>
    </div>
  );
}

function DebtorRow({
  debtor,
  canRemind,
  onRemind,
}: {
  debtor: TopDebtor;
  canRemind: boolean;
  onRemind: () => void;
}) {
  return (
    <div className="esge-dash-row">
      <Avatar name={debtor.guardianName} size="sm" color="var(--brown-400)" />
      <div className="esge-dash-row__main">
        <div className="esge-dash-row__title">{debtor.guardianName}</div>
        <div className="esge-dash-row__sub">
          {debtor.childrenLabel} · {debtor.overdueCount} {debtor.overdueCount === 1 ? 'cuota' : 'cuotas'}
        </div>
      </div>
      <span className="esge-dash-row__amount" style={{ color: 'var(--danger)' }}>
        {formatPEN(toCents(debtor.amount))}
      </span>
      <Button
        size="sm"
        variant="ghost"
        iconLeft={<Icons.Send />}
        disabled={!canRemind || !debtor.guardianId}
        onClick={onRemind}
      >
        Recordar
      </Button>
    </div>
  );
}
