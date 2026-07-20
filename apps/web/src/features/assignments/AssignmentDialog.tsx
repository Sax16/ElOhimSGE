// Diálogo de alta / edición de asignación docente. En alta se eligen docente,
// grado, curso (filtrado por grado) y sección (filtrada por grado); en edición
// solo se cambia el docente (PATCH). Un 409 indica sección ya asignada.
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Dialog, Icons, Select, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useAssignmentOptions, useCreateAssignment, useUpdateAssignment } from './api';
import type { AssignmentOptions, AssignPrefill, CourseAssignment } from './types';

export interface AssignmentDialogProps {
  open: boolean;
  /** Asignación a editar; null = alta nueva. */
  editing: CourseAssignment | null;
  /** Contexto fijo (curso+sección) para "Asignar" desde Por sección. */
  prefill?: AssignPrefill | null;
  yearId: string | undefined;
  onClose: () => void;
}

const DUP_MESSAGE = 'Esa sección ya tiene docente asignado para este curso.';

export function AssignmentDialog({ open, editing, prefill, yearId, onClose }: AssignmentDialogProps) {
  const { toast } = useToast();
  const isEdit = !!editing;
  // Modo "Asignar" con curso+sección fijos: solo se elige el docente.
  const locked = !isEdit && !!prefill;
  // Sin selects de estructura (edición o modo bloqueado).
  const compact = isEdit || locked;

  const { data: options } = useAssignmentOptions(yearId, open);
  const create = useCreateAssignment();
  const update = useUpdateAssignment();

  const [teacherId, setTeacherId] = useState('');
  const [gradeLevelId, setGradeLevelId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [touched, setTouched] = useState(false);

  // Al abrir, precarga los valores (edición / prefill) o limpia (alta libre).
  useEffect(() => {
    if (!open) return;
    setTouched(false);
    if (editing) {
      setTeacherId(editing.teacherId);
      setGradeLevelId(editing.gradeLevelId);
      setCourseId(editing.courseId);
      setSectionId(editing.sectionId);
    } else if (prefill) {
      setTeacherId('');
      setGradeLevelId('');
      setCourseId(prefill.courseId);
      setSectionId(prefill.sectionId);
    } else {
      setTeacherId('');
      setGradeLevelId('');
      setCourseId('');
      setSectionId('');
    }
  }, [open, editing?.id, prefill?.courseId, prefill?.sectionId]);

  const grade = useMemo(
    () => options?.grades.find((g) => g.gradeLevelId === gradeLevelId) ?? null,
    [options, gradeLevelId],
  );

  // Al cambiar de grado en alta, reinicia curso y sección.
  const onGradeChange = (id: string) => {
    setGradeLevelId(id);
    setCourseId('');
    setSectionId('');
  };

  const pending = create.isPending || update.isPending;
  const complete = compact
    ? !!teacherId
    : !!teacherId && !!gradeLevelId && !!courseId && !!sectionId;

  const submit = () => {
    setTouched(true);
    if (!complete || pending) return;

    if (isEdit && editing) {
      update.mutate(
        { id: editing.id, body: { teacherId } },
        {
          onSuccess: () => {
            toast('success', 'Asignación actualizada', 'El portal del docente quedó sincronizado.');
            onClose();
          },
          onError: (err) => onError(err),
        },
      );
      return;
    }

    create.mutate(
      { courseId, sectionId, teacherId },
      {
        onSuccess: () => {
          toast('success', 'Asignación creada', 'El docente ya verá esta aula en su portal.');
          onClose();
        },
        onError: (err) => onError(err),
      },
    );
  };

  const onError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 409) {
      toast('danger', 'Sección ya asignada', DUP_MESSAGE);
      return;
    }
    toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Teacher />}
      title={isEdit ? 'Cambiar docente' : locked ? 'Asignar docente' : 'Nueva asignación'}
      description={
        isEdit
          ? `${editing?.courseName} · ${editing?.gradeLabel} · ${editing?.sectionLabel}`
          : locked
            ? `${prefill?.courseName} · ${prefill?.sectionLabel}`
            : undefined
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={pending} onClick={submit}>
            {isEdit ? 'Guardar cambios' : locked ? 'Asignar docente' : 'Crear asignación'}
          </Button>
        </>
      }
    >
      <FormBody
        options={options}
        isEdit={compact}
        teacherId={teacherId}
        gradeLevelId={gradeLevelId}
        courseId={courseId}
        sectionId={sectionId}
        touched={touched}
        gradeCourses={grade?.courses ?? []}
        gradeSections={grade?.sections ?? []}
        onTeacher={setTeacherId}
        onGrade={onGradeChange}
        onCourse={setCourseId}
        onSection={setSectionId}
      />
    </Dialog>
  );
}

function FormBody({
  options,
  isEdit,
  teacherId,
  gradeLevelId,
  courseId,
  sectionId,
  touched,
  gradeCourses,
  gradeSections,
  onTeacher,
  onGrade,
  onCourse,
  onSection,
}: {
  options: AssignmentOptions | undefined;
  isEdit: boolean;
  teacherId: string;
  gradeLevelId: string;
  courseId: string;
  sectionId: string;
  touched: boolean;
  gradeCourses: { id: string; name: string; weeklyHours: number }[];
  gradeSections: { id: string; label: string }[];
  onTeacher: (v: string) => void;
  onGrade: (v: string) => void;
  onCourse: (v: string) => void;
  onSection: (v: string) => void;
}) {
  const req = (v: string) => (touched && !v ? 'Obligatorio' : undefined);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
      <Select
        label="Docente"
        placeholder="Selecciona"
        required
        value={teacherId}
        error={req(teacherId)}
        onChange={(e) => onTeacher(e.target.value)}
        containerStyle={{ gridColumn: isEdit ? '1 / -1' : undefined }}
      >
        {(options?.teachers ?? []).map((t) => (
          <option key={t.id} value={t.id} disabled={t.status === 'LICENCIA'}>
            {t.fullName}
            {t.status === 'LICENCIA' ? ' · Licencia' : ''}
          </option>
        ))}
      </Select>
      {!isEdit && (
        <>
          <Select
            label="Grado"
            placeholder="Selecciona"
            required
            options={(options?.grades ?? []).map((g) => ({ value: g.gradeLevelId, label: g.label }))}
            value={gradeLevelId}
            error={req(gradeLevelId)}
            onChange={(e) => onGrade(e.target.value)}
          />
          <Select
            label="Curso"
            placeholder={gradeLevelId ? 'Selecciona' : 'Elige un grado primero'}
            required
            disabled={!gradeLevelId}
            options={gradeCourses.map((c) => ({
              value: c.id,
              label: `${c.name} · ${c.weeklyHours} h/sem`,
            }))}
            value={courseId}
            error={req(courseId)}
            onChange={(e) => onCourse(e.target.value)}
          />
          <Select
            label="Sección"
            placeholder={gradeLevelId ? 'Selecciona' : 'Elige un grado primero'}
            required
            disabled={!gradeLevelId}
            options={gradeSections.map((s) => ({ value: s.id, label: s.label }))}
            value={sectionId}
            error={req(sectionId)}
            onChange={(e) => onSection(e.target.value)}
            containerStyle={{ gridColumn: '1 / -1' }}
          />
        </>
      )}
      <Alert tone="info" style={{ gridColumn: '1 / -1' }}>
        La asignación alimenta el portal del docente: define qué aulas ve y dónde marca asistencia.
      </Alert>
    </div>
  );
}
