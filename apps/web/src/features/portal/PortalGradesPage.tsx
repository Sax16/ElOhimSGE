// Portal del apoderado — Notas (/pnotas). Solo bimestres cerrados (el API los
// filtra). Selector de bimestre + tabla curso → letra y aspectos (formativos y
// evaluación del apoderado). Sin descargas: la libreta se entrega en el colegio.
import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, EmptyState, Icons, Select } from '@elohim/ui';
import { GRADE_LETTER_TONES } from '@elohim/shared';
import type { GradeLetter } from '@elohim/shared';
import { PortalShell } from './PortalShell';
import { usePortalGrades } from './api';
import type { PortalGradeAspect, PortalStudent } from './types';

export function PortalGradesPage() {
  return <PortalShell>{(child) => <GradesBody child={child} />}</PortalShell>;
}

function LetterBadge({ letter }: { letter: GradeLetter | null }) {
  if (!letter) return <span style={{ color: 'var(--text-subtle)' }}>—</span>;
  return (
    <Badge tone={GRADE_LETTER_TONES[letter]} solid={letter === 'AD'}>
      {letter}
    </Badge>
  );
}

function GradesBody({ child }: { child: PortalStudent }) {
  const { data, isLoading } = usePortalGrades(child.enrollmentId);
  const periods = useMemo(
    () => [...(data?.periods ?? [])].sort((a, b) => a.order - b.order),
    [data],
  );
  const [periodId, setPeriodId] = useState('');

  // Default: el último bimestre cerrado (mayor orden).
  useEffect(() => {
    if (periods.length === 0) {
      setPeriodId('');
      return;
    }
    const last = periods[periods.length - 1];
    setPeriodId((cur) => (cur && periods.some((p) => p.id === cur) ? cur : last ? last.id : ''));
  }, [periods]);

  if (isLoading && periods.length === 0) {
    return (
      <Card>
        <div style={{ color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando notas…</div>
      </Card>
    );
  }

  if (periods.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Icons.Book />}
          title="Aún no hay notas"
          description="Las notas aparecerán cuando cierre el primer bimestre."
        />
      </Card>
    );
  }

  const courses = data?.courses ?? [];
  const formativos = (data?.aspects ?? []).filter((a) => a.kind === 'FORMATIVO');
  const apoderado = (data?.aspects ?? []).filter((a) => a.kind === 'APODERADO');

  return (
    <>
      <Card
        flush
        title="Notas por bimestre"
        subtitle={`${child.fullName} · ${child.sectionLabel}`}
        actions={
          <Select
            aria-label="Bimestre"
            options={periods.map((p) => ({ value: p.id, label: p.name }))}
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            size="sm"
            containerStyle={{ minWidth: 150 }}
          />
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="pt-grades">
            <thead>
              <tr>
                <th>Curso</th>
                <th style={{ textAlign: 'center' }}>Logro</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ color: 'var(--text-muted)' }}>
                    Sin cursos registrados.
                  </td>
                </tr>
              ) : (
                courses.map((c) => (
                  <tr key={c.courseName}>
                    <td className="pt-grades__course">{c.courseName}</td>
                    <td className="pt-grades__cell">
                      <LetterBadge letter={c.byPeriod[periodId] ?? null} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {formativos.length > 0 && (
        <AspectCard title="Aspectos formativos" aspects={formativos} periodId={periodId} />
      )}
      {apoderado.length > 0 && (
        <AspectCard title="Evaluación del apoderado" aspects={apoderado} periodId={periodId} />
      )}

      <Alert tone="info" title="La libreta oficial se entrega en el colegio">
        Esta es una vista de consulta. El documento oficial de calificaciones se entrega de forma
        presencial.
      </Alert>
    </>
  );
}

function AspectCard({
  title,
  aspects,
  periodId,
}: {
  title: string;
  aspects: PortalGradeAspect[];
  periodId: string;
}) {
  return (
    <Card flush title={title}>
      <div style={{ overflowX: 'auto' }}>
        <table className="pt-grades">
          <tbody>
            {aspects.map((a) => (
              <tr key={a.name}>
                <td className="pt-grades__course">{a.name}</td>
                <td className="pt-grades__cell">
                  <LetterBadge letter={a.byPeriod[periodId] ?? null} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
