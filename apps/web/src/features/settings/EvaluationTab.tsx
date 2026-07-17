// Configuración → Evaluación (R4 · Etapa 2, solo Admin): competencias por curso
// (arman el registro de notas) y aspectos de la libreta (formativos + evaluación
// del apoderado). Todo va a tablas — nada hard-codeado.
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Icons,
  IconButton,
  Input,
  Select,
  Switch,
  Tooltip,
  useToast,
} from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useLevelsTree } from '../structure/api';
import { ConfirmDeleteDialog } from '../structure/ConfirmDeleteDialog';
import {
  useCreateAspect,
  useCreateCompetency,
  useDeleteCompetency,
  useEvalAspects,
  useEvalCompetencies,
  useUpdateAspect,
  useUpdateCompetency,
} from '../grades/api';
import type { Aspect, AspectKind, Competency, CourseCompetencies } from '../grades/types';

export function EvaluationTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <CompetenciesCard />
      <AspectsCard />
    </div>
  );
}

// ---- Diálogo de nombre (crear / renombrar) ---------------------------------
interface NameDialogState {
  open: boolean;
  title: string;
  label: string;
  initial: string;
  onConfirm: (name: string) => void;
}

function NameDialog({
  state,
  pending,
  onClose,
}: {
  state: NameDialogState;
  pending: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  useEffect(() => {
    if (state.open) setName(state.initial);
  }, [state.open, state.initial]);

  const valid = name.trim().length >= 2;

  return (
    <Dialog
      open={state.open}
      onClose={onClose}
      icon={<Icons.Pencil />}
      title={state.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={!valid || pending}
            onClick={() => valid && state.onConfirm(name.trim())}
          >
            Guardar
          </Button>
        </>
      }
    >
      <div style={{ paddingTop: 4 }}>
        <Input
          label={state.label}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid && !pending) state.onConfirm(name.trim());
          }}
        />
      </div>
    </Dialog>
  );
}

const CLOSED_DIALOG: NameDialogState = {
  open: false,
  title: '',
  label: '',
  initial: '',
  onConfirm: () => {},
};

// ---- Card: Competencias por curso ------------------------------------------
function CompetenciesCard() {
  const { toast } = useToast();
  const { yearId } = useSelectedYear();
  const { data: levels } = useLevelsTree(yearId);

  // Opciones de grado (Nivel · Grado).
  const gradeOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [];
    for (const level of levels ?? []) {
      for (const grade of level.grades) {
        opts.push({ value: grade.id, label: `${level.name} · ${grade.name}` });
      }
    }
    return opts;
  }, [levels]);

  const [gradeLevelId, setGradeLevelId] = useState('');
  useEffect(() => {
    if (gradeOptions.length === 0) {
      setGradeLevelId('');
      return;
    }
    setGradeLevelId((cur) => (cur && gradeOptions.some((o) => o.value === cur) ? cur : gradeOptions[0]!.value));
  }, [gradeOptions]);

  const { data, isLoading } = useEvalCompetencies(gradeLevelId || undefined);
  const create = useCreateCompetency(gradeLevelId);
  const update = useUpdateCompetency(gradeLevelId);
  const remove = useDeleteCompetency(gradeLevelId);

  const [dialog, setDialog] = useState<NameDialogState>(CLOSED_DIALOG);
  const [deleting, setDeleting] = useState<Competency | null>(null);
  const closeDialog = () => setDialog(CLOSED_DIALOG);

  const openAdd = (course: CourseCompetencies) =>
    setDialog({
      open: true,
      title: `Añadir competencia · ${course.courseName}`,
      label: 'Nombre de la competencia',
      initial: '',
      onConfirm: (name) =>
        create.mutate(
          { courseId: course.courseId, name },
          {
            onSuccess: () => {
              toast('success', 'Competencia añadida', `${name} · ${course.courseName}.`);
              closeDialog();
            },
            onError: (err) =>
              toast('danger', 'No se pudo añadir', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
          },
        ),
    });

  const openRename = (comp: Competency) =>
    setDialog({
      open: true,
      title: 'Renombrar competencia',
      label: 'Nombre de la competencia',
      initial: comp.name,
      onConfirm: (name) =>
        update.mutate(
          { id: comp.id, body: { name } },
          {
            onSuccess: () => {
              toast('success', 'Competencia actualizada', name);
              closeDialog();
            },
            onError: (err) =>
              toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
          },
        ),
    });

  const confirmDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast('success', 'Competencia eliminada', deleting.name);
        setDeleting(null);
      },
      onError: (err) => {
        // 409 si la competencia ya tiene notas: se muestra el mensaje del backend.
        toast('danger', 'No se pudo eliminar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
        setDeleting(null);
      },
    });
  };

  const courses = data?.courses ?? [];

  return (
    <Card
      title="Competencias por curso"
      subtitle="Arman las columnas del registro de notas; cada curso califica por competencias"
    >
      <div style={{ maxWidth: 340, marginBottom: 8 }}>
        <Select
          label="Grado"
          placeholder={gradeOptions.length === 0 ? 'Sin grados' : 'Elige un grado'}
          options={gradeOptions}
          value={gradeLevelId}
          onChange={(e) => setGradeLevelId(e.target.value)}
          disabled={gradeOptions.length === 0}
        />
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<Icons.Book />}
          title={isLoading ? 'Cargando cursos…' : 'Sin cursos en este grado'}
          description={
            isLoading ? undefined : 'Agrega cursos al plan de estudios del grado en Estructura académica.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          {courses.map((course) => (
            <div
              key={course.courseId}
              style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '11px 16px',
                  background: 'var(--surface-sunken)',
                }}
              >
                <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
                  {course.courseName}
                </span>
                <Button size="sm" variant="secondary" iconLeft={<Icons.Plus />} onClick={() => openAdd(course)}>
                  Añadir competencia
                </Button>
              </div>
              {course.competencies.length === 0 ? (
                <div style={{ padding: '12px 16px', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                  Sin competencias. Añade al menos una para poder registrar notas.
                </div>
              ) : (
                course.competencies.map((comp, i) => (
                  <div key={comp.id} className="esge-eval-row">
                    <span className="esge-eval-row__order">C{i + 1}</span>
                    <span className="esge-eval-row__name">{comp.name}</span>
                    <Tooltip content="Renombrar">
                      <IconButton label="Renombrar competencia" size="sm" onClick={() => openRename(comp)}>
                        <Icons.Pencil />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Quitar">
                      <IconButton label="Quitar competencia" size="sm" onClick={() => setDeleting(comp)}>
                        <Icons.Trash />
                      </IconButton>
                    </Tooltip>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      <NameDialog state={dialog} pending={create.isPending || update.isPending} onClose={closeDialog} />
      <ConfirmDeleteDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Quitar competencia"
        description={
          deleting ? (
            <>
              Se quitará <b>{deleting.name}</b>. Si ya tiene notas registradas no podrá eliminarse.
            </>
          ) : null
        }
        confirmLabel="Quitar"
        loading={remove.isPending}
      />
    </Card>
  );
}

// ---- Card: Aspectos de la libreta ------------------------------------------
function AspectsCard() {
  const { toast } = useToast();
  const { data } = useEvalAspects();
  const create = useCreateAspect();
  const update = useUpdateAspect();

  const aspects = data?.aspects ?? [];
  const byKind = (kind: AspectKind) =>
    aspects.filter((a) => a.kind === kind).sort((a, b) => a.order - b.order);

  const [dialog, setDialog] = useState<NameDialogState>(CLOSED_DIALOG);
  const closeDialog = () => setDialog(CLOSED_DIALOG);

  const openAdd = (kind: AspectKind) =>
    setDialog({
      open: true,
      title: kind === 'FORMATIVO' ? 'Añadir aspecto formativo' : 'Añadir criterio del apoderado',
      label: 'Nombre',
      initial: '',
      onConfirm: (name) =>
        create.mutate(
          { kind, name },
          {
            onSuccess: () => {
              toast('success', 'Aspecto añadido', name);
              closeDialog();
            },
            onError: (err) =>
              toast('danger', 'No se pudo añadir', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
          },
        ),
    });

  const openRename = (aspect: Aspect) =>
    setDialog({
      open: true,
      title: 'Renombrar aspecto',
      label: 'Nombre',
      initial: aspect.name,
      onConfirm: (name) =>
        update.mutate(
          { id: aspect.id, body: { name } },
          {
            onSuccess: () => {
              toast('success', 'Aspecto actualizado', name);
              closeDialog();
            },
            onError: (err) =>
              toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
          },
        ),
    });

  const toggleActive = (aspect: Aspect, active: boolean) =>
    update.mutate(
      { id: aspect.id, body: { active } },
      {
        onSuccess: () =>
          toast('success', active ? 'Aspecto activado' : 'Aspecto desactivado', aspect.name),
        onError: (err) =>
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );

  return (
    <Card flush title="Aspectos de la libreta" subtitle="Formativos (califica el tutor) y evaluación del apoderado (la registra el tutor)">
      <div style={{ padding: '0 16px', paddingTop: 14 }}>
        <Alert tone="info">
          Estos aspectos arman la libreta; los inactivos dejan de aparecer en periodos nuevos.
        </Alert>
      </div>

      <div className="esge-eval-aspects" style={{ display: 'grid', gap: 0 }}>
        <AspectList
          title="Aspectos formativos"
          items={byKind('FORMATIVO')}
          pending={update.isPending}
          onAdd={() => openAdd('FORMATIVO')}
          onRename={openRename}
          onToggle={toggleActive}
        />
        <AspectList
          title="Evaluación del apoderado"
          items={byKind('APODERADO')}
          pending={update.isPending}
          onAdd={() => openAdd('APODERADO')}
          onRename={openRename}
          onToggle={toggleActive}
        />
      </div>

      <NameDialog state={dialog} pending={create.isPending || update.isPending} onClose={closeDialog} />
    </Card>
  );
}

function AspectList({
  title,
  items,
  pending,
  onAdd,
  onRename,
  onToggle,
}: {
  title: string;
  items: Aspect[];
  pending: boolean;
  onAdd: () => void;
  onRename: (aspect: Aspect) => void;
  onToggle: (aspect: Aspect, active: boolean) => void;
}) {
  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
        }}
      >
        <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>{title}</span>
        <Button size="sm" variant="secondary" iconLeft={<Icons.Plus />} onClick={onAdd}>
          Añadir
        </Button>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '0 16px 14px', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          Sin aspectos todavía.
        </div>
      ) : (
        items.map((a) => (
          <div key={a.id} className="esge-eval-row">
            <span className="esge-eval-row__name">{a.name}</span>
            {!a.active && <Badge tone="neutral">Inactivo</Badge>}
            <Tooltip content="Renombrar">
              <IconButton label="Renombrar aspecto" size="sm" onClick={() => onRename(a)}>
                <Icons.Pencil />
              </IconButton>
            </Tooltip>
            <Switch
              size="sm"
              checked={a.active}
              disabled={pending}
              onChange={(e) => onToggle(a, e.target.checked)}
              aria-label={a.active ? `Desactivar ${a.name}` : `Activar ${a.name}`}
            />
          </div>
        ))
      )}
    </div>
  );
}
