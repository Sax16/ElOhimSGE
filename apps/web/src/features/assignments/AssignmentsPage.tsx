// Asignación docente (post-R4, pestaña de Horarios). Dos sub-vistas conmutadas
// por un control segmentado (Tabs pill): "Por sección" (tarea operativa: completar
// el plan de un aula, curso por curso) y "Por docente" (revisión de carga).
// Reemplaza la antigua tabla plana de ~192 filas. La grilla de bloques y la
// configuración viven en otras pestañas.
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Button, Icons, Tabs, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCan } from '../../lib/useCan';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { ConfirmDeleteDialog } from '../structure/ConfirmDeleteDialog';
import { useAssignmentOptions, useAssignments, useDeleteAssignment } from './api';
import { AssignmentDialog } from './AssignmentDialog';
import { BySectionView } from './BySectionView';
import { ByTeacherView } from './ByTeacherView';
import type { AssignPrefill, CourseAssignment } from './types';

type View = 'seccion' | 'docente';

interface DialogState {
  open: boolean;
  editing: CourseAssignment | null;
  prefill: AssignPrefill | null;
}

const CLOSED: DialogState = { open: false, editing: null, prefill: null };

export function AssignmentsPage() {
  const { toast } = useToast();
  const canEdit = useCan('estructura', 'editar');
  const { yearId, yearName, readOnly } = useSelectedYear();
  const location = useLocation();
  const initialSectionId = (location.state as { sectionId?: string } | null)?.sectionId;

  const { data, isLoading } = useAssignments(yearId);
  const { data: options } = useAssignmentOptions(yearId);
  const del = useDeleteAssignment();

  const assignments = useMemo(() => data?.assignments ?? [], [data]);
  const canMutate = canEdit && !readOnly;

  const [view, setView] = useState<View>('seccion');
  const [dialog, setDialog] = useState<DialogState>(CLOSED);
  const [removing, setRemoving] = useState<CourseAssignment | null>(null);

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

      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <Tabs
          variant="pill"
          value={view}
          onChange={(id) => setView(id as View)}
          items={[
            { id: 'seccion', label: 'Por sección' },
            { id: 'docente', label: 'Por docente' },
          ]}
        />
        {canMutate && (
          <Button
            variant="secondary"
            iconLeft={<Icons.Plus />}
            disabled={!yearId}
            onClick={() => setDialog({ open: true, editing: null, prefill: null })}
          >
            Nueva asignación
          </Button>
        )}
      </div>

      {isLoading ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          Cargando asignaciones…
        </div>
      ) : view === 'seccion' ? (
        <BySectionView
          assignments={assignments}
          options={options}
          canMutate={canMutate}
          initialSectionId={initialSectionId}
          onAssign={(prefill) => setDialog({ open: true, editing: null, prefill })}
          onChange={(a) => setDialog({ open: true, editing: a, prefill: null })}
          onRemove={(a) => setRemoving(a)}
        />
      ) : (
        <ByTeacherView assignments={assignments} options={options} />
      )}

      <AssignmentDialog
        open={dialog.open}
        editing={dialog.editing}
        prefill={dialog.prefill}
        yearId={yearId}
        onClose={() => setDialog(CLOSED)}
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
