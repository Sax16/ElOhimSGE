// Asignación docente (R4 · Etapa 1) — antes "Horarios". Tabla de asignaciones
// curso×sección con carga semanal por docente; alta, cambio de docente y quita.
// La grilla de horarios por bloques no entra en esta etapa.
// Spec: design/ui_kits/sge/ScheduleScreen.jsx (pestaña "Asignación docente").
import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Icons,
  IconButton,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCan } from '../../lib/useCan';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { ConfirmDeleteDialog } from '../structure/ConfirmDeleteDialog';
import { useAssignments, useDeleteAssignment } from './api';
import { AssignmentDialog } from './AssignmentDialog';
import type { CourseAssignment } from './types';

/** Umbral de carga alta (horas semanales por docente). */
const HIGH_LOAD = 16;

export function AssignmentsPage() {
  const { toast } = useToast();
  const canEdit = useCan('estructura', 'editar');
  const { yearId, yearName, readOnly } = useSelectedYear();

  const { data, isLoading } = useAssignments(yearId);
  const del = useDeleteAssignment();

  const assignments = useMemo(() => data?.assignments ?? [], [data]);

  // Suma de horas semanales por docente (para el badge de carga).
  const weeklyByTeacher = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of assignments) {
      map.set(a.teacherId, (map.get(a.teacherId) ?? 0) + a.weeklyHours);
    }
    return map;
  }, [assignments]);

  const [dialog, setDialog] = useState<{ open: boolean; editing: CourseAssignment | null }>({
    open: false,
    editing: null,
  });
  const [removing, setRemoving] = useState<CourseAssignment | null>(null);

  const canMutate = canEdit && !readOnly;

  const onRemove = () => {
    if (!removing) return;
    del.mutate(removing.id, {
      onSuccess: () => {
        toast('success', 'Asignación quitada', `${removing.teacherName} · ${removing.courseName}.`);
        setRemoving(null);
      },
      onError: (err) =>
        toast('danger', 'No se pudo quitar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const columns: TableColumn<CourseAssignment>[] = [
    {
      key: 'teacherName',
      header: 'Docente',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.teacherName} size="sm" />
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.teacherName}</span>
        </div>
      ),
    },
    {
      key: 'courseName',
      header: 'Curso',
      render: (_v, r) => <Badge tone="brand">{r.courseName}</Badge>,
    },
    { key: 'gradeLabel', header: 'Grado' },
    { key: 'sectionLabel', header: 'Sección' },
    {
      key: 'weeklyHours',
      header: 'Horas/sem',
      align: 'center',
      mono: true,
      render: (_v, r) => r.weeklyHours,
    },
    {
      key: 'carga',
      header: 'Carga',
      align: 'center',
      render: (_v, r) => {
        const total = weeklyByTeacher.get(r.teacherId) ?? 0;
        const high = total >= HIGH_LOAD;
        return (
          <Tooltip content={`${total} h/sem en total`}>
            <Badge tone={high ? 'warning' : 'success'} dot>
              {high ? 'Alta' : 'Normal'}
            </Badge>
          </Tooltip>
        );
      },
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) =>
        canMutate ? (
          <div style={{ display: 'inline-flex', gap: 2 }}>
            <Tooltip content="Cambiar docente">
              <IconButton label="Editar" size="sm" onClick={() => setDialog({ open: true, editing: r })}>
                <Icons.Pencil />
              </IconButton>
            </Tooltip>
            <Tooltip content="Quitar asignación">
              <IconButton label="Quitar" size="sm" variant="danger" onClick={() => setRemoving(r)}>
                <Icons.Trash />
              </IconButton>
            </Tooltip>
          </div>
        ) : null,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info">
        La asignación define qué aulas ve cada docente y dónde marca asistencia en su portal.
      </Alert>

      {readOnly && (
        <Alert tone="warning" title="Año cerrado">
          {yearName} está cerrado: la asignación docente es de solo lectura.
        </Alert>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {canMutate && (
          <Button
            variant="primary"
            iconLeft={<Icons.Plus />}
            disabled={!yearId}
            onClick={() => setDialog({ open: true, editing: null })}
          >
            Nueva asignación
          </Button>
        )}
      </div>

      <Card flush>
        <Table
          columns={columns}
          data={assignments}
          rowKey="id"
          hover
          zebra
          emptyText={isLoading ? 'Cargando asignaciones…' : 'Aún no hay asignaciones registradas.'}
        />
      </Card>

      <AssignmentDialog
        open={dialog.open}
        editing={dialog.editing}
        yearId={yearId}
        onClose={() => setDialog({ open: false, editing: null })}
      />

      <ConfirmDeleteDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={onRemove}
        title="Quitar asignación"
        confirmLabel="Quitar"
        loading={del.isPending}
        description={
          removing ? (
            <>
              Se quitará a <strong>{removing.teacherName}</strong> de {removing.courseName} ·{' '}
              {removing.gradeLabel} · {removing.sectionLabel}.
            </>
          ) : (
            ''
          )
        }
      />
    </div>
  );
}
