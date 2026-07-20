// Vista "Por sección" de Asignación docente. Tarea operativa: completar el plan
// de un aula. Un select de sección + una fila por curso del grado con su docente
// (o "Sin docente"). "Asignar/Cambiar" abre el dialog con curso+sección fijos.
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, ProgressBar, Select } from '@elohim/ui';
import type { AssignmentOptions, AssignPrefill, CourseAssignment } from './types';
import { buildSectionEntries, teacherIndex } from './helpers';
import './assignments.css';

interface BySectionViewProps {
  assignments: CourseAssignment[];
  options: AssignmentOptions | undefined;
  canMutate: boolean;
  /** Sección preseleccionada (deep-link por location.state). */
  initialSectionId?: string;
  onAssign: (prefill: AssignPrefill) => void;
  onChange: (assignment: CourseAssignment) => void;
  onRemove: (assignment: CourseAssignment) => void;
}

export function BySectionView({
  assignments,
  options,
  canMutate,
  initialSectionId,
  onAssign,
  onChange,
  onRemove,
}: BySectionViewProps) {
  const sections = useMemo(() => buildSectionEntries(options), [options]);
  const teachers = useMemo(() => teacherIndex(options), [options]);

  const [sectionId, setSectionId] = useState(initialSectionId ?? '');
  // Al llegar las secciones (o el deep-link), fija una selección válida.
  useEffect(() => {
    const first = sections[0];
    if (!first) return;
    if (!sections.some((s) => s.sectionId === sectionId)) {
      setSectionId(
        initialSectionId && sections.some((s) => s.sectionId === initialSectionId)
          ? initialSectionId
          : first.sectionId,
      );
    }
  }, [sections, initialSectionId]);

  const active = sections.find((s) => s.sectionId === sectionId) ?? sections[0] ?? null;

  // Asignación de la sección activa indexada por curso.
  const assignedByCourse = useMemo(() => {
    const map = new Map<string, CourseAssignment>();
    if (!active) return map;
    for (const a of assignments) {
      if (a.sectionId === active.sectionId) map.set(a.courseId, a);
    }
    return map;
  }, [assignments, active]);

  if (!active) {
    return (
      <Card>
        <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          Aún no hay secciones en el año seleccionado.
        </div>
      </Card>
    );
  }

  const total = active.courses.length;
  const done = active.courses.filter((c) => assignedByCourse.has(c.id)).length;
  const complete = total > 0 && done === total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Sección"
          options={sections.map((s) => ({ value: s.sectionId, label: s.display }))}
          value={active.sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          containerStyle={{ minWidth: 240 }}
        />
      </div>

      <Card
        title={active.display}
        subtitle={active.gradeLabel}
        actions={
          <Badge tone={complete ? 'success' : 'warning'} dot>
            {done} de {total} con docente
          </Badge>
        }
      >
        <ProgressBar
          value={done}
          max={Math.max(total, 1)}
          tone={complete ? 'success' : 'warning'}
          label={`${done} de ${total} cursos con docente`}
          showValue
          valueFormat={(v, m) => `${v}/${m}`}
          style={{ marginBottom: 14 }}
        />

        <ul className="esge-asg-rows">
          {active.courses.map((course) => {
            const a = assignedByCourse.get(course.id);
            const teacher = a ? teachers.get(a.teacherId) : undefined;
            const onLeave = teacher?.status === 'LICENCIA';
            return (
              <li key={course.id} className="esge-asg-row">
                <div className="esge-asg-course">
                  <span className="esge-asg-course__name">{course.name}</span>
                  <span className="esge-asg-course__hours">{course.weeklyHours} h/sem</span>
                </div>

                <div className="esge-asg-teacher">
                  {a ? (
                    <>
                      <span className="esge-asg-teacher__name">
                        {a.teacherName}
                        {onLeave && (
                          <Badge tone="warning" style={{ marginLeft: 6 }}>
                            Licencia
                          </Badge>
                        )}
                      </span>
                      <span className="esge-asg-teacher__code">{teacher?.code ?? '—'}</span>
                    </>
                  ) : (
                    <Badge tone="warning" dot>
                      Sin docente
                    </Badge>
                  )}
                </div>

                {canMutate && (
                  <div className="esge-asg-actions">
                    {a ? (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => onChange(a)}>
                          Cambiar
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => onRemove(a)}>
                          Quitar
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          onAssign({
                            courseId: course.id,
                            courseName: course.name,
                            sectionId: active.sectionId,
                            sectionLabel: active.display,
                          })
                        }
                      >
                        Asignar
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
