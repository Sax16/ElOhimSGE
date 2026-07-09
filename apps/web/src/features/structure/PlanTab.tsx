// Plan de estudios: cursos por grado, con alta/edición y copia desde otro grado.
import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  EmptyState,
  Icons,
  IconButton,
  Input,
  Select,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import { ApiError } from '../../lib/api';
import {
  useCopyCourses,
  useCourses,
  useCreateCourse,
  useDeleteCourse,
  useTeachers,
  useUpdateCourse,
} from './api';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';
import type { ApiCourse, ApiGrade, ApiLevel } from './types';

export interface PlanTabProps {
  yearId: string;
  levels: ApiLevel[];
  readOnly: boolean;
}

export function PlanTab({ yearId, levels, readOnly }: PlanTabProps) {
  const { toast } = useToast();
  const [levelId, setLevelId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [cursoDlg, setCursoDlg] = useState<{ course?: ApiCourse } | null>(null);
  const [borrarCurso, setBorrarCurso] = useState<ApiCourse | null>(null);
  const [copiar, setCopiar] = useState(false);

  // Selección inicial: primer nivel con grados, su primer grado.
  useEffect(() => {
    if (levelId) return;
    const firstWithGrades = levels.find((l) => l.grades.length > 0) ?? levels[0];
    if (firstWithGrades) {
      setLevelId(firstWithGrades.id);
      setGradeId(firstWithGrades.grades[0]?.id ?? '');
    }
  }, [levels, levelId]);

  const level = levels.find((l) => l.id === levelId);
  const grades = level?.grades ?? [];
  const grade = grades.find((g) => g.id === gradeId) ?? grades[0];
  const effectiveGradeId = grade?.id;

  const coursesQuery = useCourses(effectiveGradeId);
  const courses = coursesQuery.data ?? [];
  const totalHours = courses.reduce((a, c) => a + c.weeklyHours, 0);

  const deleteCourse = useDeleteCourse(effectiveGradeId ?? '', yearId);

  const confirmDeleteCourse = () => {
    if (!borrarCurso) return;
    const curso = borrarCurso;
    deleteCourse.mutate(curso.id, {
      onSuccess: () => {
        toast('success', 'Curso eliminado', `${curso.name} se eliminó del plan.`);
        setBorrarCurso(null);
      },
      onError: (err) =>
        toast('danger', 'No se pudo eliminar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const columns = [
    {
      key: 'name',
      header: 'Curso / área',
      render: (v: string) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>,
    },
    { key: 'weeklyHours', header: 'Horas semanales', align: 'center' as const, mono: true },
    {
      key: 'teacher',
      header: 'Docente asignado',
      render: (_v: unknown, r: ApiCourse) =>
        r.teacher ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar name={r.teacher.fullName} size="xs" />
            <span>{r.teacher.fullName}</span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-subtle)' }}>Sin asignar</span>
        ),
    },
    ...(readOnly
      ? []
      : [
          {
            key: 'acc',
            header: '',
            align: 'right' as const,
            render: (_v: unknown, r: ApiCourse) => (
              <div style={{ display: 'inline-flex', gap: 2, justifyContent: 'flex-end' }}>
                <Tooltip content="Editar">
                  <IconButton label="Editar" size="sm" onClick={() => setCursoDlg({ course: r })}>
                    <Icons.Pencil />
                  </IconButton>
                </Tooltip>
                <Tooltip content="Eliminar curso">
                  <IconButton label="Eliminar curso" size="sm" variant="danger" onClick={() => setBorrarCurso(r)}>
                    <Icons.Trash />
                  </IconButton>
                </Tooltip>
              </div>
            ),
          },
        ]),
  ];

  const levelLabel = level?.name ?? '';
  const gradeLabel = grade?.name ?? '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Nivel"
          options={levels.map((l) => ({ value: l.id, label: l.name }))}
          value={levelId}
          onChange={(e) => {
            const nextLevel = levels.find((l) => l.id === e.target.value);
            setLevelId(e.target.value);
            setGradeId(nextLevel?.grades[0]?.id ?? '');
          }}
          containerStyle={{ width: 180 }}
        />
        <Select
          label="Grado"
          options={grades.map((g) => ({ value: g.id, label: g.name }))}
          value={grade?.id ?? ''}
          onChange={(e) => setGradeId(e.target.value)}
          containerStyle={{ width: 130 }}
        />
        <div style={{ flex: 1 }} />
        {!readOnly && effectiveGradeId && (
          <>
            <Button variant="secondary" iconLeft={<Icons.Copy />} onClick={() => setCopiar(true)}>
              Copiar de otro grado
            </Button>
            <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setCursoDlg({})}>
              Nuevo curso
            </Button>
          </>
        )}
      </div>

      {!effectiveGradeId ? (
        <Card>
          <EmptyState
            size="sm"
            icon={<Icons.Book />}
            title="Selecciona un grado"
            description="Elige un nivel y grado con secciones para ver o definir su plan de estudios."
          />
        </Card>
      ) : (
        <Card flush>
          <Table columns={columns} data={courses} rowKey="id" hover emptyText="Este grado aún no tiene cursos." />
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              font: 'var(--type-caption)',
              color: 'var(--text-muted)',
            }}
          >
            <span>
              {courses.length} {courses.length === 1 ? 'curso' : 'cursos'} · {levelLabel} {gradeLabel}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{totalHours} h semanales</span>
          </div>
        </Card>
      )}

      {effectiveGradeId && (
        <>
          <CursoDialog
            gradeLevelId={effectiveGradeId}
            gradeLabel={`${levelLabel} · ${gradeLabel}`}
            ctx={cursoDlg}
            onClose={() => setCursoDlg(null)}
          />
          <CopiarPlanDialog
            open={copiar}
            onClose={() => setCopiar(false)}
            levels={levels}
            targetGradeLevelId={effectiveGradeId}
            targetGradeId={effectiveGradeId}
          />
        </>
      )}

      <ConfirmDeleteDialog
        open={!!borrarCurso}
        onClose={() => setBorrarCurso(null)}
        onConfirm={confirmDeleteCourse}
        title="Eliminar curso"
        confirmLabel="Eliminar curso"
        description={
          borrarCurso ? (
            <>
              Se eliminará el curso <strong>{borrarCurso.name}</strong> del plan de {levelLabel} {gradeLabel}.
              Esta acción no se puede deshacer.
            </>
          ) : (
            ''
          )
        }
        loading={deleteCourse.isPending}
      />
    </div>
  );
}

function CursoDialog({
  gradeLevelId,
  gradeLabel,
  ctx,
  onClose,
}: {
  gradeLevelId: string;
  gradeLabel: string;
  ctx: { course?: ApiCourse } | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const teachersQuery = useTeachers();
  const teachers = teachersQuery.data ?? [];
  const createCourse = useCreateCourse(gradeLevelId);
  const updateCourse = useUpdateCourse(gradeLevelId);

  const edit = ctx?.course;
  const [name, setName] = useState('');
  const [hours, setHours] = useState('2');
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    if (!ctx) return;
    setName(edit?.name ?? '');
    setHours(edit ? String(edit.weeklyHours) : '2');
    setTeacherId(edit?.teacher?.id ?? '');
  }, [ctx]);

  const hoursNum = parseInt(hours, 10);
  const pending = createCourse.isPending || updateCourse.isPending;

  const submit = () => {
    const base = { name: name.trim(), weeklyHours: hoursNum, teacherId: teacherId || null };
    const opts = {
      onSuccess: () => {
        toast('success', edit ? 'Curso actualizado' : 'Curso agregado', `${base.name} · ${base.weeklyHours} h semanales.`);
        onClose();
      },
      onError: (err: unknown) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    };
    if (edit) updateCourse.mutate({ id: edit.id, body: base }, opts);
    else createCourse.mutate({ gradeLevelId, ...base }, opts);
  };

  const teacherOptions = [
    { value: '', label: '— Sin asignar —' },
    ...teachers.map((t) => ({ value: t.id, label: t.fullName })),
  ];

  return (
    <Dialog
      open={!!ctx}
      onClose={onClose}
      title={edit ? `Editar curso · ${edit.name}` : 'Agregar curso'}
      icon={<Icons.Book />}
      description={gradeLabel}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={!name.trim() || !(hoursNum > 0) || pending}
            onClick={submit}
          >
            {edit ? 'Guardar cambios' : 'Agregar curso'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Input
          label="Nombre del curso / área"
          placeholder="Ej. Computación"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14 }}>
          <Input
            label="Horas semanales"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            suffix="h"
          />
          <Select
            label="Docente asignado"
            options={teacherOptions}
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />
        </div>
      </div>
    </Dialog>
  );
}

function CopiarPlanDialog({
  open,
  onClose,
  levels,
  targetGradeLevelId,
  targetGradeId,
}: {
  open: boolean;
  onClose: () => void;
  levels: ApiLevel[];
  targetGradeLevelId: string;
  targetGradeId: string;
}) {
  const { toast } = useToast();
  const copyCourses = useCopyCourses(targetGradeLevelId);

  // Origen: cualquier grado distinto del destino.
  const gradeOptions = useMemo(() => {
    const opts: { value: string; label: string; levelId: string }[] = [];
    for (const l of levels) {
      for (const g of l.grades) {
        if (g.id === targetGradeId) continue;
        opts.push({ value: g.id, label: `${l.name} · ${g.name}`, levelId: l.id });
      }
    }
    return opts;
  }, [levels, targetGradeId]);

  const [fromLevelId, setFromLevelId] = useState('');
  const [fromGradeId, setFromGradeId] = useState('');

  useEffect(() => {
    if (!open) return;
    const first = levels.find((l) => l.grades.some((g) => g.id !== targetGradeId));
    setFromLevelId(first?.id ?? '');
    const firstGrade = (first?.grades ?? []).find((g) => g.id !== targetGradeId);
    setFromGradeId(firstGrade?.id ?? '');
  }, [open, levels, targetGradeId]);

  const fromLevel = levels.find((l) => l.id === fromLevelId);
  const fromGrades: ApiGrade[] = (fromLevel?.grades ?? []).filter((g) => g.id !== targetGradeId);

  const submit = () => {
    if (!fromGradeId) return;
    copyCourses.mutate(
      { fromGradeLevelId: fromGradeId, toGradeLevelIds: [targetGradeLevelId] },
      {
        onSuccess: (res) => {
          toast(
            'success',
            'Plan copiado',
            `${res.copied} ${res.copied === 1 ? 'curso copiado' : 'cursos copiados'}${
              res.skipped ? ` (${res.skipped} omitidos por duplicado)` : ''
            } — revisa los docentes.`,
          );
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo copiar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Copiar plan de otro grado"
      icon={<Icons.Copy />}
      description="Trae los cursos y horas; los docentes se reasignan después"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={copyCourses.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Copy />}
            disabled={!fromGradeId || copyCourses.isPending}
            onClick={submit}
          >
            Copiar plan
          </Button>
        </>
      }
    >
      {gradeOptions.length === 0 ? (
        <div style={{ paddingTop: 4 }}>
          <EmptyState
            size="sm"
            icon={<Icons.Copy />}
            title="No hay otro grado de origen"
            description="Necesitas al menos otro grado con plan de estudios para copiar."
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
          <Select
            label="Nivel de origen"
            options={levels
              .filter((l) => l.grades.some((g) => g.id !== targetGradeId))
              .map((l) => ({ value: l.id, label: l.name }))}
            value={fromLevelId}
            onChange={(e) => {
              const nextLevel = levels.find((l) => l.id === e.target.value);
              setFromLevelId(e.target.value);
              setFromGradeId((nextLevel?.grades ?? []).find((g) => g.id !== targetGradeId)?.id ?? '');
            }}
          />
          <Select
            label="Grado de origen"
            options={fromGrades.map((g) => ({ value: g.id, label: g.name }))}
            value={fromGradeId}
            onChange={(e) => setFromGradeId(e.target.value)}
          />
        </div>
      )}
    </Dialog>
  );
}
