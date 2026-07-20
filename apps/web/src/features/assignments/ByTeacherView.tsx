// Vista "Por docente" de Asignación docente. Revisión de carga: un bloque por
// docente con ≥1 asignación, su total de horas, badge de carga y sus aulas
// agrupadas de forma compacta. Solo lectura (la edición vive en Por sección).
import { useMemo } from 'react';
import { Avatar, Badge, Card } from '@elohim/ui';
import type { AssignmentOptions, CourseAssignment } from './types';
import { HIGH_LOAD, sectionDisplay, teacherIndex } from './helpers';
import './assignments.css';

interface ByTeacherViewProps {
  assignments: CourseAssignment[];
  options: AssignmentOptions | undefined;
}

interface TeacherGroup {
  teacherId: string;
  teacherName: string;
  code: string;
  onLeave: boolean;
  rows: CourseAssignment[];
  totalHours: number;
  sectionCount: number;
}

export function ByTeacherView({ assignments, options }: ByTeacherViewProps) {
  const teachers = useMemo(() => teacherIndex(options), [options]);

  const groups = useMemo<TeacherGroup[]>(() => {
    const map = new Map<string, CourseAssignment[]>();
    for (const a of assignments) {
      const arr = map.get(a.teacherId) ?? [];
      arr.push(a);
      map.set(a.teacherId, arr);
    }
    const out: TeacherGroup[] = [];
    for (const [teacherId, rows] of map) {
      const first = rows[0];
      if (!first) continue;
      const info = teachers.get(teacherId);
      const totalHours = rows.reduce((sum, r) => sum + r.weeklyHours, 0);
      const sectionCount = new Set(rows.map((r) => r.sectionId)).size;
      out.push({
        teacherId,
        teacherName: first.teacherName,
        code: info?.code ?? '—',
        onLeave: info?.status === 'LICENCIA',
        rows: [...rows].sort((a, b) => a.courseName.localeCompare(b.courseName, 'es')),
        totalHours,
        sectionCount,
      });
    }
    return out.sort((a, b) => a.teacherName.localeCompare(b.teacherName, 'es'));
  }, [assignments, teachers]);

  if (groups.length === 0) {
    return (
      <Card>
        <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          Aún no hay docentes con asignaciones. Asígnalos desde la vista Por sección.
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map((g) => {
        const high = g.totalHours >= HIGH_LOAD;
        return (
          <Card key={g.teacherId}>
            <div className="esge-asg-teacher-head">
              <Avatar name={g.teacherName} size="md" />
              <div className="esge-asg-teacher-id">
                <span className="esge-asg-teacher-id__name">
                  {g.teacherName}
                  {g.onLeave && (
                    <Badge tone="warning" style={{ marginLeft: 6 }}>
                      Licencia
                    </Badge>
                  )}
                </span>
                <span className="esge-asg-teacher-id__meta">
                  {g.code} · {g.sectionCount} {g.sectionCount === 1 ? 'aula' : 'aulas'}
                </span>
              </div>
              <div className="esge-asg-teacher-load">
                <span className="esge-asg-teacher-load__hours">{g.totalHours} h/sem</span>
                <Badge tone={high ? 'warning' : 'success'} dot>
                  {high ? 'Carga alta' : 'Carga normal'}
                </Badge>
              </div>
            </div>

            <ul className="esge-asg-chips">
              {g.rows.map((r) => (
                <li key={r.id} className="esge-asg-chip">
                  <span className="esge-asg-chip__course">{r.courseName}</span>
                  <span className="esge-asg-chip__sep">—</span>
                  <span className="esge-asg-chip__section">
                    {sectionDisplay(r.gradeLabel, r.sectionLabel)}
                  </span>
                  <span className="esge-asg-chip__hours">{r.weeklyHours} h</span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
    </div>
  );
}
