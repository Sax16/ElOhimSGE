// Pantalla Reportes (R2 · Etapa 5). Seis tarjetas: 4 activas con exportación a
// Excel (.xlsx real generado en el API) y 2 futuras deshabilitadas (R4/R3). Al
// seleccionar una tarjeta cambian los filtros y la vista previa; «Exportar vista»
// descarga el reporte activo con los filtros aplicados.
// Spec: design/ui_kits/sge/ReportsScreen.jsx con los reemplazos de la etapa 5
// (alcance-funcional.md § «Dashboard y reportes — decisiones de la etapa 5»).
import { useMemo, useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icons,
  Input,
  Pagination,
  ProgressBar,
  Select,
  Table,
  useToast,
} from '@elohim/ui';
import type { BadgeTone, TableColumn } from '@elohim/ui';
import { PAYMENT_METHOD_LABELS, STUDENT_STATUS_LABELS, formatPEN, toCents } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { fmtDate, yearNumberFrom } from '../structure/bits';
import { fmtTime, methodTone } from '../cashier/bits';
import { useLevelsTree } from '../structure/api';
import type { CashierSessionSummary } from '../cashier/types';
import {
  exportReport,
  useCashReport,
  useDelinquencyReport,
  useIncomeReport,
  useRosterReport,
  useStudentAttendanceReport,
  type CashFilters,
  type DelinquencyFilters,
  type IncomeFilters,
  type PayrollAnnualFilters,
  type RosterFilters,
  type StudentAttendanceFilters,
} from './api';
import type {
  CashReport,
  DelinquencyReport,
  IncomeReport,
  ReportKey,
  RosterReport,
  StudentAttendanceReport,
} from './types';
import './reports.css';

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

const TONE_BG: Record<string, string> = {
  danger: 'var(--danger-soft)',
  success: 'var(--success-soft)',
  brand: 'var(--surface-brand-soft)',
  accent: 'var(--surface-accent-soft)',
};
const TONE_FG: Record<string, string> = {
  danger: 'var(--danger)',
  success: 'var(--success)',
  brand: 'var(--brand)',
  accent: 'var(--gold-600)',
};

type IconKey = 'Chart' | 'Cash' | 'Users' | 'Calendar' | 'Building' | 'Receipt';

interface ReportCardDef {
  key: ReportKey | null;
  title: string;
  desc: string;
  icon: IconKey;
  tone: keyof typeof TONE_BG;
  /** Etiqueta de release para las tarjetas deshabilitadas. */
  soon?: string;
}

// Orden verbatim del prototipo; Asistencia (R4) queda deshabilitada.
const CARDS: ReportCardDef[] = [
  { key: 'delinquency', title: 'Morosidad por grado', desc: 'Cuotas vencidas y deuda acumulada por nivel y grado', icon: 'Chart', tone: 'danger' },
  { key: 'income', title: 'Ingresos por concepto', desc: 'Pensiones, matrículas, programas y otros ingresos por periodo', icon: 'Cash', tone: 'success' },
  { key: 'roster', title: 'Padrón de estudiantes', desc: 'Lista completa con apoderado principal, contacto y estado', icon: 'Users', tone: 'brand' },
  { key: 'studentAttendance', title: 'Asistencia mensual', desc: 'Asistencia de estudiantes: presentes, tardanzas, faltas y justificadas por sección', icon: 'Calendar', tone: 'accent' },
  { key: 'payrollAnnual', title: 'Planilla anual', desc: 'Sueldos, descuentos y aportes por empleado, mes a mes', icon: 'Building', tone: 'brand' },
  { key: 'cash', title: 'Caja diaria', desc: 'Cobros por método y cobrador, arqueos y anulaciones', icon: 'Receipt', tone: 'success' },
];

const REPORT_TITLE: Record<ReportKey, string> = {
  delinquency: 'Morosidad por grado',
  income: 'Ingresos por concepto',
  cash: 'Caja diaria',
  roster: 'Padrón de estudiantes',
  payrollAnnual: 'Planilla anual',
  studentAttendance: 'Asistencia mensual',
};

/** Mes en curso como 'YYYY-MM' (fecha civil local). */
function currentMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Rango del mes en curso ({ from: 1° del mes, to: hoy }) en fecha civil local. */
function currentMonthRange(): { from: string; to: string } {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${day}` };
}

export function ReportsPage() {
  const { toast } = useToast();
  const { yearId, yearName } = useSelectedYear();

  const [active, setActive] = useState<ReportKey>('delinquency');

  // Filtros de Ingresos.
  const baseYear = yearNumberFrom(yearName) ?? new Date().getFullYear();
  const [incomeMonth, setIncomeMonth] = useState<number | null>(Math.max(1, Math.min(12, new Date().getMonth() + 1)));
  const [incomeYear, setIncomeYear] = useState<number>(baseYear);

  // Filtros de Caja.
  const [range, setRange] = useState(currentMonthRange);

  // Filtros de Padrón.
  const [levelId, setLevelId] = useState<string | null>(null);

  // Filtro de Planilla anual.
  const [annualYear, setAnnualYear] = useState<number>(baseYear);

  // Filtro de Asistencia mensual.
  const [attendanceMonth, setAttendanceMonth] = useState<string>(currentMonthStr);

  const [exporting, setExporting] = useState(false);

  const delinquencyFilters: DelinquencyFilters = { yearId };
  const incomeFilters: IncomeFilters = { year: incomeYear, month: incomeMonth };
  const cashFilters: CashFilters = { from: range.from, to: range.to };
  const rosterFilters: RosterFilters = { yearId, levelId };
  const payrollAnnualFilters: PayrollAnnualFilters = { year: annualYear };
  const studentAttendanceFilters: StudentAttendanceFilters = { yearId, month: attendanceMonth };

  const activeFilters =
    active === 'delinquency'
      ? delinquencyFilters
      : active === 'income'
        ? incomeFilters
        : active === 'cash'
          ? cashFilters
          : active === 'payrollAnnual'
            ? payrollAnnualFilters
            : active === 'studentAttendance'
              ? studentAttendanceFilters
              : rosterFilters;

  const onExport = async () => {
    setExporting(true);
    try {
      await exportReport(active, activeFilters);
      toast('success', 'Reporte descargado', `${REPORT_TITLE[active]} · Excel.`);
    } catch (err) {
      toast('danger', 'No se pudo exportar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="esge-reports">
      {/* Tarjetas de reporte */}
      <div className="esge-reports-grid">
        {CARDS.map((c) => {
          const selected = c.key != null && c.key === active;
          const disabled = c.key == null;
          return (
            <Card
              key={c.title}
              interactive={!disabled}
              className={disabled ? 'esge-report-card--disabled' : undefined}
              onClick={disabled ? undefined : () => c.key && setActive(c.key)}
              style={
                selected
                  ? { borderColor: 'var(--brand)', background: 'var(--surface-brand-soft)' }
                  : undefined
              }
            >
              <div className="esge-report-card">
                <span className="esge-report-card__icon" style={{ background: TONE_BG[c.tone], color: TONE_FG[c.tone] }}>
                  <ReportIcon icon={c.icon} />
                </span>
                <div className="esge-report-card__body">
                  <div className="esge-report-card__title">
                    {c.title}
                    {c.soon && <Badge tone="neutral">{`Llega con ${c.soon}`}</Badge>}
                  </div>
                  <div className="esge-report-card__desc">{c.desc}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filtros del reporte activo + exportar */}
      <div className="esge-reports-filters">
        {active === 'delinquency' && (
          <Select label="Año lectivo" options={[{ value: yearName, label: yearName || '—' }]} value={yearName} disabled containerStyle={{ width: 170 }} />
        )}
        {active === 'income' && (
          <>
            <Select
              label="Mes"
              options={[
                { value: '', label: 'Todo el año' },
                ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: MONTH_NAMES[i + 1] ?? '' })),
              ]}
              value={incomeMonth == null ? '' : String(incomeMonth)}
              onChange={(e) => setIncomeMonth(e.target.value === '' ? null : Number(e.target.value))}
              containerStyle={{ width: 170 }}
            />
            <Select
              label="Año"
              options={Array.from({ length: 4 }, (_, i) => baseYear + 1 - i).map((y) => ({ value: String(y), label: String(y) }))}
              value={String(incomeYear)}
              onChange={(e) => setIncomeYear(Number(e.target.value))}
              containerStyle={{ width: 120 }}
            />
          </>
        )}
        {active === 'cash' && (
          <>
            <Input
              label="Desde"
              type="date"
              value={range.from}
              max={range.to}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              containerStyle={{ width: 180 }}
            />
            <Input
              label="Hasta"
              type="date"
              value={range.to}
              min={range.from}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              containerStyle={{ width: 180 }}
            />
          </>
        )}
        {active === 'roster' && <LevelFilter yearId={yearId} levelId={levelId} onChange={setLevelId} />}
        {active === 'payrollAnnual' && (
          <Select
            label="Año"
            options={Array.from({ length: 4 }, (_, i) => baseYear + 1 - i).map((y) => ({ value: String(y), label: String(y) }))}
            value={String(annualYear)}
            onChange={(e) => setAnnualYear(Number(e.target.value))}
            containerStyle={{ width: 120 }}
          />
        )}
        {active === 'studentAttendance' && (
          <Input
            label="Mes"
            type="month"
            value={attendanceMonth}
            onChange={(e) => setAttendanceMonth(e.target.value)}
            containerStyle={{ width: 180 }}
          />
        )}

        <div className="esge-reports-filters__spacer" />
        <Button variant="secondary" iconLeft={<Icons.Download />} disabled={exporting} onClick={onExport}>
          Exportar vista
        </Button>
      </div>

      {/* Vista previa del reporte activo */}
      {active === 'delinquency' && <DelinquencyPreview filters={delinquencyFilters} />}
      {active === 'income' && <IncomePreview filters={incomeFilters} monthLabel={incomeMonth == null ? 'Todo el año' : MONTH_NAMES[incomeMonth] ?? ''} />}
      {active === 'cash' && <CashPreview filters={cashFilters} />}
      {active === 'roster' && <RosterPreview filters={rosterFilters} />}
      {active === 'payrollAnnual' && <PayrollAnnualPreview year={annualYear} />}
      {active === 'studentAttendance' && (
        <StudentAttendancePreview filters={studentAttendanceFilters} month={attendanceMonth} />
      )}
    </div>
  );
}

function ReportIcon({ icon }: { icon: IconKey }) {
  const map = {
    Chart: <Icons.Chart />,
    Cash: <Icons.Cash />,
    Users: <Icons.Users />,
    Calendar: <Icons.Calendar />,
    Building: <Icons.Building />,
    Receipt: <Icons.Receipt />,
  };
  return map[icon];
}

// ---- Filtro de nivel (Padrón) ----------------------------------------------
function LevelFilter({
  yearId,
  levelId,
  onChange,
}: {
  yearId: string | undefined;
  levelId: string | null;
  onChange: (id: string | null) => void;
}) {
  const { data: levels } = useLevelsTree(yearId);
  return (
    <Select
      label="Nivel"
      options={[{ value: '', label: 'Todos' }, ...(levels ?? []).map((l) => ({ value: l.id, label: l.name }))]}
      value={levelId ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      containerStyle={{ width: 180 }}
    />
  );
}

// ---- Vista previa: Morosidad por grado -------------------------------------
function DelinquencyPreview({ filters }: { filters: DelinquencyFilters }) {
  const { data, isLoading } = useDelinquencyReport(filters, true);
  const subtitle = data
    ? `${data.totalCount} ${data.totalCount === 1 ? 'cuota vencida' : 'cuotas vencidas'} · ${formatPEN(toCents(data.totalAmount))} en ${data.totalDebtors} ${data.totalDebtors === 1 ? 'familia' : 'familias'}`
    : 'Cuotas vencidas por grado';

  const cols: TableColumn<DelinquencyReport['groups'][number]>[] = [
    {
      key: 'groupLabel',
      header: 'Nivel / grado',
      render: (v) => <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>{v as string}</span>,
    },
    { key: 'studentsCount', header: 'Estudiantes', align: 'center', mono: true },
    {
      key: 'debtorsCount',
      header: 'Con deuda',
      align: 'center',
      render: (v, r) => (
        <Badge tone={r.rate > 8 ? 'danger' : 'warning'} dot>
          {v as number}
        </Badge>
      ),
    },
    {
      key: 'rate',
      header: '% morosidad',
      render: (v) => (
        <div style={{ minWidth: 140 }}>
          <ProgressBar value={v as number} max={15} size="sm" tone="danger" showValue valueFormat={() => `${(v as number).toFixed(1)}%`} />
        </div>
      ),
    },
    {
      key: 'overdueAmount',
      header: 'Deuda',
      align: 'right',
      render: (v) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--danger)' }}>{formatPEN(toCents(v as string))}</span>
      ),
    },
  ];

  return (
    <PreviewCard title="Morosidad por grado" subtitle={subtitle} empty={!!data && data.groups.length === 0}>
      <Table columns={cols} data={data?.groups ?? []} rowKey="groupLabel" hover emptyText={isLoading ? 'Cargando…' : 'Sin morosidad.'} />
      {data && data.groups.length > 0 && (
        <div className="esge-reports-total">
          <span>Total</span>
          <span className="esge-reports-total__spacer" />
          <span style={{ color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
            {data.totalDebtors} {data.totalDebtors === 1 ? 'familia' : 'familias'} · {data.totalCount} {data.totalCount === 1 ? 'cuota' : 'cuotas'}
          </span>
          <span className="esge-reports-total__amount" style={{ color: 'var(--danger)' }}>{formatPEN(toCents(data.totalAmount))}</span>
        </div>
      )}
    </PreviewCard>
  );
}

// ---- Vista previa: Ingresos por concepto -----------------------------------
function IncomePreview({ filters, monthLabel }: { filters: IncomeFilters; monthLabel: string }) {
  const { data, isLoading } = useIncomeReport(filters, true);
  const subtitle = data ? `${monthLabel} ${filters.year} · ${formatPEN(toCents(data.total))} en total` : `${monthLabel} ${filters.year}`;

  const conceptCols: TableColumn<IncomeReport['byConcept'][number]>[] = [
    { key: 'concept', header: 'Concepto', render: (v) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v as string}</span> },
    { key: 'count', header: 'Operaciones', align: 'center', mono: true },
    {
      key: 'amount',
      header: 'Monto',
      align: 'right',
      render: (v) => {
        const neg = (v as string).trim().startsWith('-');
        return (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: neg ? 'var(--danger)' : 'var(--text-strong)' }}>
            {formatPEN(toCents(v as string))}
          </span>
        );
      },
    },
  ];
  const methodCols: TableColumn<IncomeReport['byMethod'][number]>[] = [
    { key: 'method', header: 'Método', render: (v) => <Badge tone={methodTone(v as IncomeReport['byMethod'][number]['method'])}>{PAYMENT_METHOD_LABELS[v as IncomeReport['byMethod'][number]['method']]}</Badge> },
    { key: 'count', header: 'Operaciones', align: 'center', mono: true },
    {
      key: 'amount',
      header: 'Monto',
      align: 'right',
      render: (v) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-strong)' }}>{formatPEN(toCents(v as string))}</span>,
    },
  ];

  const empty = !!data && data.byConcept.length === 0 && data.byMethod.length === 0;

  return (
    <PreviewCard title="Ingresos por concepto" subtitle={subtitle} empty={empty}>
      <div className="esge-reports-income">
        <div>
          <div style={{ padding: '10px 16px', font: 'var(--type-caption)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', fontWeight: 600 }}>
            Por concepto
          </div>
          <Table columns={conceptCols} data={data?.byConcept ?? []} rowKey="concept" hover emptyText={isLoading ? 'Cargando…' : 'Sin ingresos.'} />
        </div>
        <div>
          <div style={{ padding: '10px 16px', font: 'var(--type-caption)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)', fontWeight: 600 }}>
            Por método
          </div>
          <Table columns={methodCols} data={data?.byMethod ?? []} rowKey="method" hover emptyText={isLoading ? 'Cargando…' : 'Sin ingresos.'} />
        </div>
      </div>
      {data && !empty && (
        <div className="esge-reports-total">
          <span>Total general</span>
          <span className="esge-reports-total__spacer" />
          <span className="esge-reports-total__amount" style={{ color: 'var(--text-strong)' }}>{formatPEN(toCents(data.total))}</span>
        </div>
      )}
    </PreviewCard>
  );
}

// ---- Vista previa: Caja diaria ---------------------------------------------
function DifferenceCell({ difference }: { difference: string | null }) {
  if (difference == null) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const neg = difference.trim().startsWith('-');
  const cents = toCents(difference.replace('-', '').trim());
  if (cents === 0) return <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{formatPEN(0)}</span>;
  return (
    <span style={{ fontFamily: 'var(--font-mono)', color: neg ? 'var(--danger)' : 'var(--warning)' }}>
      {neg ? `− ${formatPEN(cents)}` : `+ ${formatPEN(cents)}`}
    </span>
  );
}

function CashPreview({ filters }: { filters: CashFilters }) {
  const { data, isLoading } = useCashReport(filters, true);
  const subtitle = data
    ? `${fmtDate(filters.from)} – ${fmtDate(filters.to)} · ${formatPEN(toCents(data.totals.collected))} cobrado`
    : `${fmtDate(filters.from)} – ${fmtDate(filters.to)}`;

  const cols: TableColumn<CashReport['sessions'][number]>[] = [
    { key: 'date', header: 'Fecha', mono: true, render: (v) => fmtDate(v as string) },
    {
      key: 'openedByName',
      header: 'Abrió / cerró',
      render: (_v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>
            {r.openedByName}
            {r.closedByName && r.closedByName !== r.openedByName ? ` · ${r.closedByName}` : ''}
          </span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
            {fmtTime(r.openedAt)}
            {r.closedAt ? ` – ${fmtTime(r.closedAt)}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Cobrado',
      align: 'right',
      render: (v) => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{formatPEN(toCents(v as string))}</span>,
    },
    {
      key: 'expectedCash',
      header: 'Esperado / contado',
      align: 'right',
      render: (_v, r) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
          {r.expectedCash != null ? formatPEN(toCents(r.expectedCash)) : '—'}
          {' / '}
          {r.countedCash != null ? formatPEN(toCents(r.countedCash)) : '—'}
        </span>
      ),
    },
    { key: 'difference', header: 'Diferencia', align: 'right', render: (_v, r) => <DifferenceCell difference={r.difference} /> },
  ];

  const totals = data?.totals;
  const diffCents = totals ? toCents(totals.differencesTotal.replace('-', '').trim()) : 0;
  const diffNeg = totals ? totals.differencesTotal.trim().startsWith('-') : false;

  return (
    <PreviewCard title="Caja diaria" subtitle={subtitle} empty={!!data && data.sessions.length === 0}>
      <Table
        columns={cols}
        data={data?.sessions ?? []}
        rowKey={(r: CashierSessionSummary) => r.id}
        hover
        zebra
        emptyText={isLoading ? 'Cargando…' : 'Sin cajas en el rango.'}
      />
      {data && data.sessions.length > 0 && totals && (
        <div className="esge-reports-total">
          <span>Total</span>
          <span className="esge-reports-total__spacer" />
          <span style={{ color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
            Efectivo {formatPEN(toCents(totals.cash))} · Digital {formatPEN(toCents(totals.digital))}
          </span>
          <span className="esge-reports-total__amount" style={{ color: 'var(--text-strong)' }}>{formatPEN(toCents(totals.collected))}</span>
          <span className="esge-reports-total__amount" style={{ color: diffCents === 0 ? 'var(--success)' : diffNeg ? 'var(--danger)' : 'var(--warning)' }}>
            {diffCents === 0 ? formatPEN(0) : `${diffNeg ? '−' : '+'} ${formatPEN(diffCents)}`}
          </span>
        </div>
      )}
    </PreviewCard>
  );
}

// ---- Vista previa: Padrón de estudiantes -----------------------------------
const ROSTER_PAGE_SIZE = 25;
const STATUS_TONE: Partial<Record<RosterReport['rows'][number]['status'], BadgeTone>> = {
  ACTIVO: 'success',
  BECADO: 'brand',
  RETIRADO: 'neutral',
  TRASLADADO: 'neutral',
  EGRESADO: 'info',
  RESERVADO: 'warning',
};

function RosterPreview({ filters }: { filters: RosterFilters }) {
  const { data, isLoading } = useRosterReport(filters, true);
  const [page, setPage] = useState(1);

  const rows = data?.rows ?? [];
  const total = data?.total ?? rows.length;
  const pageCount = Math.max(1, Math.ceil(rows.length / ROSTER_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * ROSTER_PAGE_SIZE, safePage * ROSTER_PAGE_SIZE),
    [rows, safePage],
  );

  const subtitle = data ? `${total} ${total === 1 ? 'estudiante' : 'estudiantes'}` : 'Padrón de estudiantes';

  const cols: TableColumn<RosterReport['rows'][number]>[] = [
    { key: 'code', header: 'Código', mono: true },
    {
      key: 'fullName',
      header: 'Estudiante',
      render: (v) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v as string}</span>,
    },
    { key: 'dni', header: 'DNI', mono: true },
    { key: 'gradeSection', header: 'Grado / sección' },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (v) => (
        <Badge tone={STATUS_TONE[v as RosterReport['rows'][number]['status']] ?? 'neutral'} dot>
          {STUDENT_STATUS_LABELS[v as RosterReport['rows'][number]['status']]}
        </Badge>
      ),
    },
    {
      key: 'guardianName',
      header: 'Apoderado',
      render: (v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v as string}</span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
            {[r.guardianPhone, r.guardianEmail].filter(Boolean).join(' · ') || '—'}
          </span>
        </div>
      ),
    },
  ];

  return (
    <PreviewCard
      title="Padrón de estudiantes"
      subtitle={subtitle}
      empty={!!data && rows.length === 0}
      emptyDescription="No hay estudiantes que coincidan con el filtro."
    >
      <Table columns={cols} data={pageRows} rowKey="code" hover zebra emptyText={isLoading ? 'Cargando…' : 'Sin estudiantes.'} />
      {rows.length > ROSTER_PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
          <Pagination page={safePage} pageCount={pageCount} total={rows.length} pageSize={ROSTER_PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}
    </PreviewCard>
  );
}

// ---- Vista previa: Planilla anual ------------------------------------------
// No hay endpoint de datos para la vista previa (solo exportación .xlsx); se
// muestra una tarjeta informativa con el detalle del Excel a descargar.
function PayrollAnnualPreview({ year }: { year: number }) {
  return (
    <Card flush title="Vista previa · Planilla anual" subtitle={`Planilla ${year}`}>
      <EmptyState
        icon={<Icons.Building />}
        title={`Planilla anual ${year}`}
        description="El Excel trae una hoja resumen por mes (bruto, descuentos, aportes, neto, pagado vs pendiente, EsSalud) y una hoja de detalle por empleado y mes. Usa «Exportar vista» para descargarlo."
      />
    </Card>
  );
}

// ---- Vista previa: Asistencia mensual (estudiantes) ------------------------
function StudentAttendancePreview({
  filters,
  month,
}: {
  filters: StudentAttendanceFilters;
  month: string;
}) {
  const { data, isLoading } = useStudentAttendanceReport(filters, true);
  const [y, m] = month.split('-').map(Number);
  const monthLabel = `${MONTH_NAMES[m ?? 0] ?? ''} ${y ?? ''}`.trim();
  const sections = data?.sections ?? [];
  const subtitle = data
    ? `${monthLabel} · ${sections.length} ${sections.length === 1 ? 'sección' : 'secciones'}`
    : monthLabel;

  const cols: TableColumn<StudentAttendanceReport['sections'][number]>[] = [
    {
      key: 'label',
      header: 'Sección',
      render: (v) => (
        <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
          {v as string}
        </span>
      ),
    },
    { key: 'students', header: 'Estudiantes', align: 'center', mono: true },
    { key: 'P', header: 'P', align: 'center', mono: true },
    { key: 'T', header: 'T', align: 'center', mono: true },
    { key: 'F', header: 'F', align: 'center', mono: true },
    { key: 'J', header: 'J', align: 'center', mono: true },
    {
      key: 'pct',
      header: '% asistencia',
      align: 'right',
      render: (v) =>
        v == null ? (
          <span style={{ color: 'var(--text-subtle)' }}>—</span>
        ) : (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-strong)' }}>
            {(v as number).toFixed(1)}%
          </span>
        ),
    },
  ];

  return (
    <PreviewCard
      title="Asistencia mensual"
      subtitle={subtitle}
      empty={!!data && sections.length === 0}
      emptyDescription="No hay asistencia registrada para el mes seleccionado."
    >
      <Table
        columns={cols}
        data={sections}
        rowKey="sectionId"
        hover
        zebra
        emptyText={isLoading ? 'Cargando…' : 'Sin datos.'}
      />
    </PreviewCard>
  );
}

// ---- Envoltura común de la vista previa -------------------------------------
function PreviewCard({
  title,
  subtitle,
  empty,
  emptyDescription,
  children,
}: {
  title: string;
  subtitle: string;
  empty: boolean;
  emptyDescription?: string;
  children: ReactNode;
}) {
  return (
    <Card flush title={`Vista previa · ${title}`} subtitle={subtitle}>
      {empty ? (
        <EmptyState
          icon={<Icons.Search />}
          title="Sin datos para mostrar"
          description={emptyDescription ?? 'No hay datos para los filtros seleccionados.'}
        />
      ) : (
        children
      )}
    </Card>
  );
}
