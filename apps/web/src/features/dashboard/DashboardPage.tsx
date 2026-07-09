// Dashboard mínimo R1 (decidido): KPIs de matrícula, avance por nivel y accesos
// rápidos. Los indicadores económicos llegan con el módulo de dinero (R2).
// Layout de StatCards inspirado en design/ui_kits/sge/DashboardScreen.jsx.
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Icons, ProgressBar, StatCard } from '@elohim/ui';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useDashboardSummary } from './api';

export function DashboardPage() {
  const navigate = useNavigate();
  const { yearId } = useSelectedYear();
  const { data, isLoading } = useDashboardSummary(yearId);

  const dash = (v: number | undefined) => (v == null ? '—' : String(v));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard
          label="Matriculados"
          value={dash(data?.enrollments.total)}
          icon={<Icons.Clipboard />}
          caption={data ? `de ${data.vacancies.capacity} vacantes` : 'del año'}
        />
        <StatCard
          label="Estudiantes activos"
          value={dash(data?.students.active)}
          iconTone="brand"
          icon={<Icons.Users />}
          caption="con matrícula vigente"
        />
        <StatCard
          label="Matrículas de hoy"
          value={dash(data?.enrollments.today)}
          iconTone="success"
          icon={<Icons.Check />}
          caption={data ? `${data.enrollments.week} esta semana` : 'esta semana'}
        />
        <StatCard
          label="Vacantes libres"
          value={dash(data?.vacancies.free)}
          iconTone="accent"
          icon={<Icons.Layers />}
          caption={data ? `${data.vacancies.enrolled} ocupadas` : 'disponibles'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Matrícula por nivel */}
        <Card title="Matrícula por nivel" subtitle="Ocupación de vacantes por nivel">
          {data && data.byLevel.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.byLevel.map((lvl) => {
                const pct = lvl.capacity > 0 ? (lvl.enrolled / lvl.capacity) * 100 : 0;
                return (
                  <ProgressBar
                    key={lvl.levelName}
                    label={lvl.levelName}
                    value={lvl.enrolled}
                    max={Math.max(lvl.capacity, 1)}
                    showValue
                    valueFormat={(v, m) => `${v}/${m}`}
                    tone={pct >= 95 ? 'danger' : pct >= 80 ? 'warning' : 'brand'}
                  />
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '18px 0', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
              {isLoading ? 'Cargando…' : 'Aún no hay matrículas registradas este año.'}
            </div>
          )}
        </Card>

        {/* Accesos rápidos */}
        <Card title="Accesos rápidos" subtitle="Tareas frecuentes de secretaría">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => navigate('/matricula')}>
              Nueva matrícula
            </Button>
            <Button variant="secondary" iconLeft={<Icons.User />} onClick={() => navigate('/est')}>
              Nuevo estudiante
            </Button>
            <Button variant="secondary" iconLeft={<Icons.Layers />} onClick={() => navigate('/estructura')}>
              Estructura académica
            </Button>
          </div>
        </Card>
      </div>

      {/* Indicadores económicos — placeholder R2 */}
      <Card flush>
        <EmptyState
          icon={<Icons.Chart />}
          title="Indicadores económicos"
          description="La cobranza, morosidad y caja llegan con el módulo de dinero (R2)."
        />
      </Card>
    </div>
  );
}
