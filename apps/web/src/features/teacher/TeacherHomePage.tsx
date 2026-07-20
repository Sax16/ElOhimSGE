// Portal del docente — "Mis clases" (R4 · Etapa 1). Home del rol DOCENTE:
// saludo, resumen de aulas y acceso directo a marcar asistencia por sección.
// Spec: design/ui_kits/sge/TeacherScreen.jsx (SGE_TeacherHome).
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Card, EmptyState, Icons, ProgressBar, StatCard } from '@elohim/ui';
import { useMe } from '../../lib/useMe';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useGradePeriods } from '../grades/api';
import { useMyCourses } from '../grades/api';
import { pct, progressTone } from '../grades/bits';
import { useMySections } from '../student-attendance/api';
import {
  SHIFT_LABELS,
  firstName,
  greeting,
  longDate,
  todayStr,
} from '../student-attendance/bits';
import type { MySection } from '../student-attendance/types';
import { MyWeekCard } from '../schedule/MyWeekCard';
import './teacher.css';

export function TeacherHomePage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const today = todayStr();

  const { data, isLoading } = useMySections(today);
  const sections = useMemo(() => data?.sections ?? [], [data]);

  const studentTotal = sections.reduce((sum, s) => sum + s.studentCount, 0);
  const takenCount = sections.filter((s) => s.taken).length;

  // Avance de notas del bimestre en curso (my-courses del periodo EN_CURSO).
  const { yearId } = useSelectedYear();
  const { data: periodsData } = useGradePeriods(yearId);
  const currentPeriod = useMemo(
    () => (periodsData ?? []).find((p) => p.status === 'EN_CURSO'),
    [periodsData],
  );
  const { data: coursesData } = useMyCourses(currentPeriod?.id);
  const gradeCourses = useMemo(() => coursesData?.courses ?? [], [coursesData]);
  const gradeFilled = gradeCourses.reduce((sum, c) => sum + c.filled, 0);
  const gradeTotal = gradeCourses.reduce((sum, c) => sum + c.total, 0);
  const gradePct = pct(gradeFilled, gradeTotal);

  const goMark = (sectionId: string) =>
    navigate('/tasist', { state: { sectionId } });

  const goGrades = (sectionId: string, courseId: string) =>
    navigate('/notas', { state: { sectionId, courseId } });

  const name = me ? firstName(me.fullName) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Encabezado */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={me?.fullName ?? 'Docente'} size="lg" color="var(--blue-500)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: 'var(--type-h3)', color: 'var(--text-strong)' }}>
              {greeting()}, Prof. {name}
            </div>
            <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              {longDate(today)} · {sections.length}{' '}
              {sections.length === 1 ? 'aula' : 'aulas'}
            </div>
          </div>
        </div>
      </Card>

      {/* StatCards */}
      <div className="esge-teacher-stats">
        <StatCard
          label="Mis estudiantes"
          value={isLoading ? '—' : studentTotal}
          icon={<Icons.Users />}
          caption={`${sections.length} ${sections.length === 1 ? 'sección' : 'secciones'}`}
        />
        <StatCard
          label="Asistencia tomada"
          value={isLoading ? '—' : `${takenCount}/${sections.length}`}
          iconTone="accent"
          icon={<Icons.Calendar />}
          caption="aulas de hoy"
        />
        <StatCard
          label="Notas del bimestre"
          value={gradeTotal === 0 ? '—' : `${gradePct}%`}
          iconTone="success"
          icon={<Icons.Book />}
          caption="registradas"
        />
      </div>

      {/* Mis aulas + Avance de notas: dos columnas en desktop, apiladas en móvil */}
      <div className="esge-teacher-cols">
      {!isLoading && sections.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Icons.Teacher />}
            title="Aún no tienes aulas asignadas"
            description="Pide a administración que registre tu asignación docente para ver tus secciones aquí."
          />
        </Card>
      ) : (
        <Card flush title="Mis aulas" subtitle="Marca la asistencia al iniciar la jornada">
          <div>
            {sections.map((s) => (
              <SectionRow key={s.sectionId} section={s} onMark={() => goMark(s.sectionId)} />
            ))}
            {isLoading && sections.length === 0 && (
              <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
                Cargando tus aulas…
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Avance de notas del bimestre en curso */}
      {currentPeriod && gradeCourses.length > 0 && (
        <Card flush title={`Avance de notas · ${currentPeriod.name}`} subtitle="Registra las notas por competencia de cada curso">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {gradeCourses.map((c) => {
              const p = pct(c.filled, c.total);
              return (
                <div
                  key={`${c.sectionId}-${c.courseId}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '13px 18px',
                    borderTop: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <ProgressBar
                      label={`${c.courseName} — ${c.sectionLabel}`}
                      value={c.filled}
                      max={Math.max(c.total, 1)}
                      showValue
                      size="sm"
                      tone={progressTone(p)}
                      valueFormat={() => `${p}%`}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    iconLeft={<Icons.Book />}
                    onClick={() => goGrades(c.sectionId, c.courseId)}
                  >
                    Ir al registro de notas
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      </div>

      {/* Mi horario (solo lectura) */}
      <MyWeekCard />
    </div>
  );
}

function SectionRow({ section, onMark }: { section: MySection; onMark: () => void }) {
  const coursesText =
    section.role === 'TUTOR' && section.courseNames.length === 0
      ? 'Tutor de aula'
      : section.courseNames.join(' · ') || 'Tutor de aula';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 18px',
        borderTop: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
            {section.label}
          </span>
          {section.role === 'TUTOR' && <Badge tone="brand">Tutor</Badge>}
          <Badge tone="neutral">{SHIFT_LABELS[section.shift]}</Badge>
        </div>
        <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', marginTop: 2 }}>
          {coursesText} · {section.studentCount}{' '}
          {section.studentCount === 1 ? 'estudiante' : 'estudiantes'}
        </div>
      </div>
      {section.taken ? (
        <Badge tone="success" dot>
          {section.counts
            ? `Asistencia tomada · ${section.counts.FALTA} ${
                section.counts.FALTA === 1 ? 'falta' : 'faltas'
              }`
            : 'Asistencia tomada'}
        </Badge>
      ) : (
        <Button size="sm" variant="primary" iconLeft={<Icons.Check />} onClick={onMark}>
          Marcar asistencia
        </Button>
      )}
    </div>
  );
}
