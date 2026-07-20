// Portal del apoderado — Inicio (/phome). Saludo + resumen del hijo seleccionado:
// pensiones, asistencia del mes, conducta, próximos eventos y últimos comunicados.
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Icons } from '@elohim/ui';
import { PortalShell } from './PortalShell';
import { usePortalChild } from './usePortalChild';
import { usePortalSummary } from './api';
import {
  dayMonthLong,
  eventTypeLabel,
  eventTypeTone,
  isPositive,
  money,
  monthLabel,
  secretariaWaUrl,
  shortDate,
} from './bits';
import type { PortalStudent } from './types';

export function PortalHomePage() {
  return (
    <PortalShell>
      {(child) => <HomeBody child={child} />}
    </PortalShell>
  );
}

function HomeBody({ child }: { child: PortalStudent }) {
  const navigate = useNavigate();
  const { guardianName, secretariaPhone } = usePortalChild();
  const { data: summary, isLoading } = usePortalSummary(child.enrollmentId);

  const waUrl = secretariaWaUrl({
    phone: secretariaPhone,
    guardianName,
    studentName: child.fullName,
    sectionLabel: child.sectionLabel,
  });

  const debt = summary?.debt;
  const att = summary?.attendanceMonth;
  const overdue = debt ? isPositive(debt.overdueTotal) : false;

  return (
    <>
      {/* Saludo */}
      <div>
        <div className="pt-hello__hi">Hola, {guardianName || '—'}</div>
        <div className="pt-hello__who">
          {child.fullName} · {child.sectionLabel} · {child.levelName}
        </div>
      </div>

      <div className="pt-grid">
        {/* Pensiones */}
        <Card title="Pensiones">
          {isLoading || !debt ? (
            <Muted>Cargando…</Muted>
          ) : overdue ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Badge tone="danger" dot>
                  Deuda vencida
                </Badge>
                <span className="pt-money" style={{ color: 'var(--danger)' }}>
                  {money(debt.overdueTotal)}
                </span>
              </div>
              <div className="pt-row__sub">
                {debt.overdueCount} {debt.overdueCount === 1 ? 'cuota vencida' : 'cuotas vencidas'}
              </div>
              {debt.nextDue && <NextDueLine due={debt.nextDue} />}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Badge tone="success" dot>
                Al día
              </Badge>
              {debt.nextDue ? (
                <NextDueLine due={debt.nextDue} />
              ) : (
                <div className="pt-row__sub">Sin cuotas pendientes.</div>
              )}
            </div>
          )}
        </Card>

        {/* Asistencia del mes */}
        <Card title={`Asistencia · ${att ? monthLabel(att.month) : ''}`}>
          {isLoading || !att ? (
            <Muted>Cargando…</Muted>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  font: 'var(--type-h2)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-strong)',
                }}
              >
                {att.pct == null ? '—' : `${att.pct}%`}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge tone="success">P {att.P}</Badge>
                <Badge tone="warning">T {att.T}</Badge>
                <Badge tone="danger">F {att.F}</Badge>
                <Badge tone="info">J {att.J}</Badge>
              </div>
            </div>
          )}
        </Card>

        {/* Conducta */}
        <Card title="Conducta">
          {isLoading || !summary ? (
            <Muted>Cargando…</Muted>
          ) : summary.conductOpen > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge tone="warning" dot>
                {summary.conductOpen}{' '}
                {summary.conductOpen === 1 ? 'incidencia abierta' : 'incidencias abiertas'}
              </Badge>
            </div>
          ) : (
            <Badge tone="success" dot>
              Sin incidencias
            </Badge>
          )}
        </Card>

        {/* Próximos eventos */}
        <Card title="Próximos eventos">
          {isLoading || !summary ? (
            <Muted>Cargando…</Muted>
          ) : summary.upcomingEvents.length === 0 ? (
            <Muted>Sin eventos próximos.</Muted>
          ) : (
            <div>
              {summary.upcomingEvents.slice(0, 4).map((ev, i) => (
                <div className="pt-row" key={`${ev.date}-${i}`}>
                  <div>
                    <div className="pt-row__label">{ev.name}</div>
                    <div className="pt-row__sub">{dayMonthLong(ev.date)}</div>
                  </div>
                  <Badge tone={eventTypeTone(ev.type)}>{eventTypeLabel(ev.type)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Últimos comunicados (ancho completo) */}
      <Card
        title="Últimos comunicados"
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate('/pavisos')}>
            Ver todos
          </Button>
        }
      >
        {isLoading || !summary ? (
          <Muted>Cargando…</Muted>
        ) : summary.lastAnnouncements.length === 0 ? (
          <Muted>Aún no hay comunicados.</Muted>
        ) : (
          <div>
            {summary.lastAnnouncements.map((a) => (
              <button
                key={a.id}
                type="button"
                className="pt-row"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderTop: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => navigate('/pavisos')}
              >
                <div>
                  <div className="pt-row__label">{a.title}</div>
                  <div className="pt-row__sub">{shortDate(a.sentAt)}</div>
                </div>
                <Icons.ChevronRight />
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Escribir a secretaría */}
      {waUrl && (
        <Button
          variant="secondary"
          block
          iconLeft={<Icons.Phone />}
          onClick={() => window.open(waUrl, '_blank', 'noopener')}
        >
          Escribir a secretaría
        </Button>
      )}
    </>
  );
}

function NextDueLine({ due }: { due: { label: string; dueDate: string; total: string } }) {
  return (
    <div className="pt-row" style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div>
        <div className="pt-row__label">Próxima cuota</div>
        <div className="pt-row__sub">
          {due.label} · vence {shortDate(due.dueDate)}
        </div>
      </div>
      <span className="pt-money">{money(due.total)}</span>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ font: 'var(--type-body)', color: 'var(--text-muted)' }}>{children}</div>;
}
