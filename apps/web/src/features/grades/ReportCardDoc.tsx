// Render de la libreta en pantalla, fiel al prototipo GradesScreen (Libreta):
// encabezado institucional + tabla de cursos + aspectos formativos + evaluación
// del apoderado + pie con leyenda de escala y asistencia del bimestre.
import { Badge, Card, Table } from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { GRADE_LETTER_TONES } from './bits';
import type { GradeLetter, ReportCard } from './types';

/** Chip de letra (— si no hay nota en ese periodo). */
function NotaChip({ letter }: { letter: GradeLetter | null | undefined }) {
  if (!letter) return <span style={{ color: 'var(--text-subtle)' }}>—</span>;
  return (
    <Badge tone={GRADE_LETTER_TONES[letter]} solid={letter === 'AD'}>
      {letter}
    </Badge>
  );
}

interface DocRow {
  key: string;
  name: string;
  byPeriod: Record<string, GradeLetter | null | undefined>;
}

export interface ReportCardDocProps {
  reportCard: ReportCard;
  institutionName: string;
}

export function ReportCardDoc({ reportCard: rc, institutionName }: ReportCardDocProps) {
  const periods = [...rc.periods].sort((a, b) => a.order - b.order);
  const student = rc.student;

  const columns: TableColumn<DocRow>[] = [
    {
      key: 'name',
      header: 'Curso / criterio',
      render: (_v, r) => (
        <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.name}</span>
      ),
    },
    ...periods.map((p) => ({
      key: `p-${p.id}`,
      header: p.name,
      align: 'center' as const,
      render: (_v: unknown, r: DocRow) => <NotaChip letter={r.byPeriod[p.id]} />,
    })),
  ];

  const courseRows: DocRow[] = rc.courses.map((c) => ({
    key: c.courseId,
    name: c.courseName,
    byPeriod: Object.fromEntries(
      Object.entries(c.byPeriod).map(([pid, res]) => [pid, res?.letter ?? null]),
    ),
  }));
  const formativos: DocRow[] = rc.aspects
    .filter((a) => a.kind === 'FORMATIVO')
    .map((a) => ({ key: a.id, name: a.name, byPeriod: a.byPeriod }));
  const apoderado: DocRow[] = rc.aspects
    .filter((a) => a.kind === 'APODERADO')
    .map((a) => ({ key: a.id, name: a.name, byPeriod: a.byPeriod }));

  const subline = [student.code, student.gradeLabel, student.sectionLabel, student.tutorName ? `Tutor(a): ${student.tutorName}` : null]
    .filter(Boolean)
    .join(' · ');

  const att = rc.attendance;
  const attLine =
    att.pct == null
      ? 'Asistencia del bimestre: sin registro'
      : `Asistencia del bimestre: ${att.pct}% · ${att.tardanzas} ${att.tardanzas === 1 ? 'tardanza' : 'tardanzas'}` +
        (att.faltas ? ` · ${att.faltas} ${att.faltas === 1 ? 'falta' : 'faltas'}` : '');

  return (
    <Card flush className="esge-libreta">
      {/* Encabezado institucional */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
        <img src="/elohim-insignia.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: 'var(--type-label)', fontWeight: 700, color: 'var(--text-strong)' }}>
            {institutionName} — Libreta de calificaciones · {rc.year}
          </div>
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            {student.fullName} · {subline}
          </div>
        </div>
        <Badge tone="brand">{rc.period.name}</Badge>
      </div>

      {/* Cursos */}
      <Table columns={columns} data={courseRows} rowKey="key" compact />

      {/* Aspectos formativos */}
      {formativos.length > 0 && (
        <>
          <div className="esge-libreta__band">
            <span className="eyebrow">Aspectos formativos · califica el tutor · escala AD/A/B/C</span>
          </div>
          <Table columns={columns} data={formativos} rowKey="key" compact />
        </>
      )}

      {/* Evaluación del apoderado */}
      {apoderado.length > 0 && (
        <>
          <div className="esge-libreta__band">
            <span className="eyebrow">Evaluación del apoderado · registra el tutor · escala AD/A/B/C</span>
          </div>
          <Table columns={columns} data={apoderado} rowKey="key" compact />
        </>
      )}

      {/* Pie */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
        <span>AD Logro destacado · A Logrado · B En proceso · C En inicio</span>
        <span>{attLine}</span>
      </div>
    </Card>
  );
}
