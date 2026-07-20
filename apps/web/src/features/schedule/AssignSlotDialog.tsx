// Diálogo "Asignar bloque": elige el curso del grado para una celda día×bloque.
// El docente NO se elige aquí — sale de la Asignación docente automáticamente;
// si el curso no la tiene, se avisa "Sin docente asignado" (no bloquea). Un 409
// del API = choque de docente; 422 = recreo o curso ajeno: se muestran tal cual.
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Dialog, Icons, Select, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useSaveSlot } from './api';
import { dayLabelLong } from './bits';
import type { CourseHours, ScheduleBlock, ScheduleSection, ScheduleSlot } from './types';

export interface AssignSlotDialogProps {
  open: boolean;
  section: ScheduleSection;
  day: number;
  block: ScheduleBlock;
  currentSlot: ScheduleSlot | null;
  /** Cursos del plan del grado (con horas programadas/semanales). */
  courses: CourseHours[];
  /** Docente por curso, tomado de la Asignación docente de la sección. */
  teacherByCourse: Map<string, string | null>;
  onClose: () => void;
}

export function AssignSlotDialog({
  open,
  section,
  day,
  block,
  currentSlot,
  courses,
  teacherByCourse,
  onClose,
}: AssignSlotDialogProps) {
  const { toast } = useToast();
  const save = useSaveSlot();
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    if (!open) return;
    setCourseId(currentSlot?.courseId ?? '');
  }, [open, currentSlot?.courseId, day, block.id]);

  const teacherName = courseId ? (teacherByCourse.get(courseId) ?? null) : null;
  const hasCourse = !!courseId;

  const onError = (err: unknown) => {
    // 409 (choque de docente) y 422 (recreo/curso ajeno) llegan con message del API.
    toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
  };

  const persist = (nextCourseId: string | null) => {
    if (save.isPending) return;
    save.mutate(
      { sectionId: section.id, dayOfWeek: day, blockId: block.id, courseId: nextCourseId },
      {
        onSuccess: () => {
          toast(
            'success',
            nextCourseId ? 'Bloque asignado' : 'Bloque vaciado',
            `${dayLabelLong(day)} · ${block.startTime}–${block.endTime}.`,
          );
          onClose();
        },
        onError,
      },
    );
  };

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        value: c.courseId,
        label: `${c.courseName} · ${c.scheduled}/${c.weeklyHours} h`,
      })),
    [courses],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Calendar />}
      title="Asignar bloque"
      description={`${dayLabelLong(day)} · ${block.startTime}–${block.endTime} · ${section.label}`}
      footer={
        <>
          {currentSlot && (
            <Button
              variant="secondary"
              iconLeft={<Icons.Trash />}
              disabled={save.isPending}
              onClick={() => persist(null)}
              style={{ marginRight: 'auto' }}
            >
              Vaciar bloque
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={save.isPending || !hasCourse}
            onClick={() => persist(courseId)}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Select
          label="Curso"
          placeholder={courseOptions.length ? 'Selecciona un curso' : 'El grado no tiene cursos en su plan'}
          required
          disabled={!courseOptions.length}
          options={courseOptions}
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        />

        {hasCourse &&
          (teacherName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
              <Icons.Teacher />
              <span>
                Docente: <strong style={{ color: 'var(--text-body)' }}>{teacherName}</strong>
              </span>
            </div>
          ) : (
            <Alert tone="warning">
              Sin docente asignado para este curso. Se programará igual; asígnalo en la pestaña
              Asignación docente para que aparezca en la grilla y en el portal del docente.
            </Alert>
          ))}

        <Alert tone="info">
          El docente se toma de la Asignación docente. Si ya tiene otra clase a esta hora, el
          sistema avisará del choque.
        </Alert>
      </div>
    </Dialog>
  );
}
