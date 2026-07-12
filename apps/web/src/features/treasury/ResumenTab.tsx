// Pestaña «Resumen del mes» de Tesorería: 4 StatCards + rubros y desgloses por
// categoría. La StatCard «Caja disponible» del prototipo se reemplaza por
// «Resultado acumulado del año» (alcance-funcional.md § etapa 4).
import { Card, Icons, ProgressBar, StatCard } from '@elohim/ui';
import { formatPEN } from '@elohim/shared';
import { MonthYearSelect, monthName, signedCents } from './bits';
import { useTreasurySummary } from './api';
import type { CategoryAmount } from './types';

/** "S/ X" con signo explícito (+/−) según el monto. */
function signedPEN(v: string): string {
  const { neg, cents } = signedCents(v);
  if (cents === 0) return formatPEN(0);
  return `${neg ? '−' : '+'} ${formatPEN(cents)}`;
}

export function ResumenTab({
  month,
  year,
  onMonth,
  onYear,
}: {
  month: number;
  year: number;
  onMonth: (m: number) => void;
  onYear: (y: number) => void;
}) {
  const { data: summary, isLoading } = useTreasurySummary(month, year);
  const mName = monthName(month);

  const net = summary ? signedCents(summary.net) : null;
  const yearNet = summary ? signedCents(summary.yearNet) : null;
  const expenseCents = summary ? signedCents(summary.expenseTotal).cents : 0;
  const incomeCents = summary ? signedCents(summary.incomeTotal).cents : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <MonthYearSelect month={month} year={year} onMonth={onMonth} onYear={onYear} />
      </div>

      <div className="esge-treasury-stats">
        <StatCard
          label={`Ingresos · ${mName}`}
          value={summary ? formatPEN(incomeCents) : '—'}
          iconTone="success"
          icon={<Icons.Cash />}
          caption="cobros en caja + varios"
        />
        <StatCard
          label={`Egresos · ${mName}`}
          value={summary ? formatPEN(expenseCents) : '—'}
          iconTone="danger"
          icon={<Icons.Chart />}
          caption="gastos operativos"
        />
        <StatCard
          label="Resultado neto"
          value={net ? `${net.neg ? '− ' : ''}${formatPEN(net.cents)}` : '—'}
          iconTone={net && net.neg ? 'danger' : 'success'}
          icon={<Icons.Check />}
          caption="del mes en curso"
        />
        <StatCard
          label="Resultado acumulado del año"
          value={yearNet ? `${yearNet.neg ? '− ' : ''}${formatPEN(yearNet.cents)}` : '—'}
          iconTone={yearNet && yearNet.neg ? 'danger' : 'accent'}
          icon={<Icons.Chart />}
          caption={`ingresos − egresos ${year}`}
        />
      </div>

      <div className="esge-treasury-resumen-grid">
        <Card flush title="Ingresos vs egresos por rubro" subtitle={`${mName} ${year}`}>
          <div>
            {(summary?.rubros ?? []).map((r) => {
              const { neg, cents } = signedCents(r.amount);
              return (
                <div
                  key={r.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 18px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 99,
                      background: neg ? 'var(--danger)' : 'var(--success)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.label}</span>
                  <span
                    style={{
                      font: 'var(--type-label)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: neg ? 'var(--danger)' : 'var(--success)',
                    }}
                  >
                    {cents === 0 ? formatPEN(0) : `${neg ? '−' : '+'} ${formatPEN(cents)}`}
                  </span>
                </div>
              );
            })}
            {!isLoading && (summary?.rubros.length ?? 0) === 0 && (
              <div style={{ padding: '18px', font: 'var(--type-body)', color: 'var(--text-muted)' }}>
                Sin movimientos este mes.
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--surface-sunken)',
              }}
            >
              <span style={{ font: 'var(--type-label)', fontWeight: 600 }}>Resultado del mes</span>
              <span
                style={{
                  font: 'var(--type-h3)',
                  fontFamily: 'var(--font-mono)',
                  color: net && net.neg ? 'var(--danger)' : 'var(--success)',
                }}
              >
                {net ? signedPEN(summary!.net) : '—'}
              </span>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CategoryBreakdown
            title="Gastos por categoría"
            subtitle={`${mName} ${year} · ${formatPEN(expenseCents)}`}
            items={summary?.expensesByCategory ?? []}
            tone="danger"
          />
          {(summary?.incomesByCategory.length ?? 0) > 0 && (
            <CategoryBreakdown
              title="Ingresos por categoría"
              subtitle={`${mName} ${year} · ${formatPEN(incomeCents)}`}
              items={summary?.incomesByCategory ?? []}
              tone="success"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryBreakdown({
  title,
  subtitle,
  items,
  tone,
}: {
  title: string;
  subtitle: string;
  items: CategoryAmount[];
  tone: 'danger' | 'success';
}) {
  const rows = items.map((c) => ({ name: c.name, cents: signedCents(c.amount).cents }));
  const max = Math.max(1, ...rows.map((r) => r.cents));
  return (
    <Card title={title} subtitle={subtitle}>
      {rows.length === 0 ? (
        <div style={{ font: 'var(--type-body)', color: 'var(--text-muted)' }}>Sin datos este mes.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map((r) => (
            <ProgressBar
              key={r.name}
              label={r.name}
              value={r.cents}
              max={max}
              showValue
              size="sm"
              tone={tone}
              valueFormat={() => formatPEN(r.cents)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
