// Pantalla Estructura académica (Etapa 3): año activo, tabs y asistente de apertura.
import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Icons, Select, Tabs } from '@elohim/ui';
import { PERIOD_TYPE_LABELS, YEAR_STATUS_LABELS } from '@elohim/shared';
import { useYearStore } from '../../stores/year.store';
import { useLevelsTree, usePeriods, usePrograms, useYears } from './api';
import { fmtDate, yearNumberFrom } from './bits';
import { EstructuraTab } from './EstructuraTab';
import { PlanTab } from './PlanTab';
import { ProgramasTab } from './ProgramasTab';
import { PeriodosTab } from './PeriodosTab';
import { YearWizard } from './YearWizard';

type TabId = 'estructura' | 'plan' | 'prog' | 'per';

export function StructurePage() {
  const [tab, setTab] = useState<TabId>('estructura');
  const [wizardOpen, setWizardOpen] = useState(false);

  const selectedYearName = useYearStore((s) => s.selectedYearName);
  const setSelectedYear = useYearStore((s) => s.setSelectedYear);

  const yearsQuery = useYears();
  const years = yearsQuery.data ?? [];
  const activeYear = years.find((y) => y.status === 'ACTIVO') ?? null;
  const activeYearName = activeYear?.name ?? null;
  const currentYearName = selectedYearName ?? activeYearName ?? '';
  const selectedYear = years.find((y) => y.name === currentYearName) ?? activeYear ?? years[0] ?? null;

  const yearId = selectedYear?.id;
  const readOnly = selectedYear?.status === 'CERRADO';

  const levelsQuery = useLevelsTree(yearId);
  const periodsQuery = usePeriods(yearId);
  const programsQuery = usePrograms(yearId);

  const levels = levelsQuery.data ?? [];
  const periods = periodsQuery.data ?? [];
  const programs = programsQuery.data ?? [];

  const treeCounts = {
    levels: levels.length,
    grades: levels.reduce((a, l) => a + l.grades.length, 0),
    sections: levels.reduce((a, l) => a + l.grades.reduce((x, g) => x + g.sections.length, 0), 0),
  };

  // ---- Estados de carga / vacío ------------------------------------------
  if (yearsQuery.isLoading) {
    return (
      <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando año académico…</div>
    );
  }
  if (!selectedYear) {
    return (
      <Card>
        <EmptyState
          icon={<Icons.Calendar />}
          title="Sin año académico"
          description="Aún no hay un año académico configurado. Créalo para empezar a construir la estructura."
        />
      </Card>
    );
  }

  // ---- Cabecera del año ---------------------------------------------------
  const divisionLabel = (() => {
    const singular = PERIOD_TYPE_LABELS[selectedYear.periodType];
    const plural = `${singular.toLowerCase()}s`;
    return periods.length ? `${periods.length} ${plural}` : singular;
  })();
  const currentPeriod = periods.find((p) => p.status === 'EN_CURSO');
  const headerBits = [
    `${fmtDate(selectedYear.startDate)} — ${fmtDate(selectedYear.endDate)}`,
    divisionLabel,
    ...(currentPeriod ? [`${currentPeriod.name} en curso`] : []),
  ].join(' · ');

  // ---- Botón de iniciar año siguiente ------------------------------------
  const activeNumber = activeYear ? yearNumberFrom(activeYear.name, activeYear.startDate) : null;
  const nextYearNumber = activeNumber != null ? activeNumber + 1 : null;
  const nextYearExists =
    nextYearNumber != null &&
    years.some((y) => yearNumberFrom(y.name, y.startDate) === nextYearNumber);
  const canStartNextYear =
    !!activeYear && selectedYear.id === activeYear.id && nextYearNumber != null && !nextYearExists;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-brand-soft)',
              color: 'var(--brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 21,
            }}
          >
            <Icons.Calendar />
          </span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ font: 'var(--type-h3)', color: 'var(--text-strong)' }}>
                Año académico {selectedYear.name}
              </span>
              <Badge tone={selectedYear.status === 'ACTIVO' ? 'success' : 'neutral'} dot>
                {YEAR_STATUS_LABELS[selectedYear.status]}
              </Badge>
            </div>
            <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{headerBits}</div>
          </div>
          {years.length > 1 && (
            <Select
              options={years.map((y) => y.name)}
              value={currentYearName}
              aria-label="Año académico"
              onChange={(e) => setSelectedYear(e.target.value === activeYearName ? null : e.target.value)}
              containerStyle={{ width: 110 }}
            />
          )}
          {canStartNextYear && (
            <Button variant="accent" iconLeft={<Icons.Calendar />} onClick={() => setWizardOpen(true)}>
              Iniciar año {nextYearNumber}
            </Button>
          )}
        </div>
      </Card>

      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'estructura', label: 'Estructura', count: treeCounts.sections },
          { id: 'plan', label: 'Plan de estudios' },
          { id: 'prog', label: 'Programas', count: programs.length },
          { id: 'per', label: 'Periodos' },
        ]}
      />

      {tab === 'estructura' && yearId && (
        <EstructuraTab yearId={yearId} levels={levels} loading={levelsQuery.isLoading} readOnly={readOnly} />
      )}
      {tab === 'plan' && <PlanTab levels={levels} readOnly={readOnly} />}
      {tab === 'prog' && yearId && <ProgramasTab yearId={yearId} readOnly={readOnly} />}
      {tab === 'per' && yearId && <PeriodosTab yearId={yearId} periods={periods} readOnly={readOnly} />}

      {canStartNextYear && activeYear && nextYearNumber != null && (
        <YearWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          currentYear={activeYear}
          nextYearNumber={nextYearNumber}
          treeCounts={treeCounts}
        />
      )}
    </div>
  );
}
