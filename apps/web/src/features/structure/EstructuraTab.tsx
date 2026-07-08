// Árbol Nivel → Grado → Sección + diálogos (nivel, grado, sección, nómina).
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Icons,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Select,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import { SHIFT_LABELS, STUDENT_STATUS_LABELS, type Shift } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import {
  useCreateGrade,
  useCreateLevel,
  useCreateSection,
  useRoster,
  useTeachers,
  useUpdateLevel,
  useUpdateSection,
} from './api';
import { isInicial, VacBar } from './bits';
import type { ApiGrade, ApiLevel, ApiSection } from './types';

// Paleta de acentos por nivel (según orden en el árbol) — fiel al prototipo.
const PALETTE = [
  { color: 'var(--blue-500)', soft: 'var(--surface-brand-soft)' },
  { color: 'var(--gold-500)', soft: 'var(--surface-accent-soft)' },
  { color: 'var(--green-500)', soft: 'var(--success-soft)' },
  { color: 'var(--brown-400)', soft: 'var(--surface-sunken)' },
];

interface SeccionCtx {
  level: ApiLevel;
  grade: ApiGrade;
  section?: ApiSection;
}
interface RosterCtx {
  level: ApiLevel;
  grade: ApiGrade;
  section: ApiSection;
}
interface GradoCtx {
  level: ApiLevel;
}
interface NivelCtx {
  level?: ApiLevel;
}

export interface EstructuraTabProps {
  yearId: string;
  levels: ApiLevel[];
  loading: boolean;
  readOnly: boolean;
}

export function EstructuraTab({ yearId, levels, loading, readOnly }: EstructuraTabProps) {
  const [nivelDlg, setNivelDlg] = useState<NivelCtx | null>(null);
  const [gradoDlg, setGradoDlg] = useState<GradoCtx | null>(null);
  const [seccionDlg, setSeccionDlg] = useState<SeccionCtx | null>(null);
  const [rosterDlg, setRosterDlg] = useState<RosterCtx | null>(null);

  if (!loading && levels.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!readOnly && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="secondary" iconLeft={<Icons.Plus />} onClick={() => setNivelDlg({})}>
              Nuevo nivel
            </Button>
          </div>
        )}
        <Card>
          <EmptyState
            icon={<Icons.Layers />}
            title="Sin niveles todavía"
            description="Crea el primer nivel académico (Inicial, Primaria, Secundaria) para empezar a construir la estructura."
          />
        </Card>
        <NivelDialog yearId={yearId} ctx={nivelDlg} onClose={() => setNivelDlg(null)} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" iconLeft={<Icons.Plus />} onClick={() => setNivelDlg({})}>
            Nuevo nivel
          </Button>
        </div>
      )}

      {levels.map((level, i) => (
        <NivelCard
          key={level.id}
          level={level}
          accent={PALETTE[i % PALETTE.length]!}
          readOnly={readOnly}
          onEditLevel={() => setNivelDlg({ level })}
          onAddGrado={() => setGradoDlg({ level })}
          onAddSeccion={(grade) => setSeccionDlg({ level, grade })}
          onEditSeccion={(grade, section) => setSeccionDlg({ level, grade, section })}
          onViewSeccion={(grade, section) => setRosterDlg({ level, grade, section })}
        />
      ))}

      <NivelDialog yearId={yearId} ctx={nivelDlg} onClose={() => setNivelDlg(null)} />
      <GradoDialog yearId={yearId} ctx={gradoDlg} onClose={() => setGradoDlg(null)} />
      <SeccionDialog yearId={yearId} ctx={seccionDlg} onClose={() => setSeccionDlg(null)} />
      <RosterDialog ctx={rosterDlg} onClose={() => setRosterDlg(null)} />
    </div>
  );
}

// ---- Árbol ------------------------------------------------------------------
function NivelCard({
  level,
  accent,
  readOnly,
  onEditLevel,
  onAddGrado,
  onAddSeccion,
  onEditSeccion,
  onViewSeccion,
}: {
  level: ApiLevel;
  accent: { color: string; soft: string };
  readOnly: boolean;
  onEditLevel: () => void;
  onAddGrado: () => void;
  onAddSeccion: (grade: ApiGrade) => void;
  onEditSeccion: (grade: ApiGrade, section: ApiSection) => void;
  onViewSeccion: (grade: ApiGrade, section: ApiSection) => void;
}) {
  const [open, setOpen] = useState(true);
  const totalEnrolled = level.grades.reduce(
    (a, g) => a + g.sections.reduce((x, s) => x + s.enrolled, 0),
    0,
  );
  const totalSecc = level.grades.reduce((a, g) => a + g.sections.length, 0);
  const inicial = isInicial(level.name);

  return (
    <Card flush>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: accent.soft,
            color: accent.color,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          <Icons.Layers />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ font: 'var(--type-h3)', color: 'var(--text-strong)' }}>
            {level.name}{' '}
            {level.description && (
              <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', fontWeight: 400 }}>
                · {level.description}
              </span>
            )}
          </div>
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            {level.grades.length} grados · {totalSecc} secciones · {totalEnrolled} estudiantes
          </div>
        </div>
        {!readOnly && (
          <>
            <Tooltip content="Editar nivel">
              <IconButton label="Editar nivel" size="sm" onClick={(e) => { e.stopPropagation(); onEditLevel(); }}>
                <Icons.Pencil />
              </IconButton>
            </Tooltip>
            <Button size="sm" variant="secondary" iconLeft={<Icons.Plus />} onClick={(e) => { e.stopPropagation(); onAddGrado(); }}>
              Grado
            </Button>
          </>
        )}
        <span
          style={{
            display: 'inline-flex',
            color: 'var(--text-muted)',
            transition: 'transform var(--duration-fast)',
            transform: open ? 'rotate(180deg)' : 'none',
          }}
        >
          <Icons.ChevronDown />
        </span>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {level.grades.length === 0 && (
            <div style={{ padding: '18px 16px' }}>
              <EmptyState
                size="sm"
                icon={<Icons.Layers />}
                title="Nivel sin grados"
                description="Crea el primer grado con el botón “+ Grado”."
              />
            </div>
          )}
          {level.grades.map((grade) => (
            <GradoBlock
              key={grade.id}
              grade={grade}
              inicial={inicial}
              readOnly={readOnly}
              onAddSeccion={() => onAddSeccion(grade)}
              onEditSeccion={(section) => onEditSeccion(grade, section)}
              onViewSeccion={(section) => onViewSeccion(grade, section)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function GradoBlock({
  grade,
  inicial,
  readOnly,
  onAddSeccion,
  onEditSeccion,
  onViewSeccion,
}: {
  grade: ApiGrade;
  inicial: boolean;
  readOnly: boolean;
  onAddSeccion: () => void;
  onEditSeccion: (section: ApiSection) => void;
  onViewSeccion: (section: ApiSection) => void;
}) {
  const [open, setOpen] = useState(true);
  const enrolled = grade.sections.reduce((a, s) => a + s.enrolled, 0);
  const capacity = grade.sections.reduce((a, s) => a + s.capacity, 0);

  return (
    <div>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', userSelect: 'none' }}
      >
        <span
          style={{
            display: 'inline-flex',
            color: 'var(--text-muted)',
            transition: 'transform var(--duration-fast)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        >
          <Icons.ChevronDown />
        </span>
        <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)', width: 70 }}>
          {grade.name}
        </span>
        <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          {grade.sections.length
            ? `${grade.sections.length} ${grade.sections.length === 1 ? 'sección' : 'secciones'} · ${enrolled}/${capacity} estudiantes`
            : 'Sin secciones aún'}
        </span>
        <span style={{ flex: 1 }} />
        {!readOnly && (
          <Button size="sm" variant="ghost" iconLeft={<Icons.Plus />} onClick={(e) => { e.stopPropagation(); onAddSeccion(); }}>
            Sección
          </Button>
        )}
      </div>
      {open &&
        grade.sections.map((section) => (
          <SeccionRow
            key={section.id}
            section={section}
            inicial={inicial}
            readOnly={readOnly}
            onEdit={() => onEditSeccion(section)}
            onView={() => onViewSeccion(section)}
          />
        ))}
    </div>
  );
}

function SeccionRow({
  section,
  inicial,
  readOnly,
  onEdit,
  onView,
}: {
  section: ApiSection;
  inicial: boolean;
  readOnly: boolean;
  onEdit: () => void;
  onView: () => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(150px,1.2fr) 90px 1.4fr minmax(180px,1fr) 76px',
        alignItems: 'center',
        gap: 14,
        padding: '9px 16px 9px 46px',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--border-strong)', flexShrink: 0 }} />
        <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>
          {inicial ? section.name : `Sección ${section.name}`}
        </span>
      </div>
      <Badge tone={section.shift === 'MANANA' ? 'info' : 'accent'}>{SHIFT_LABELS[section.shift]}</Badge>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {section.tutor ? (
          <>
            <Avatar name={section.tutor.fullName} size="xs" />
            <span
              style={{
                font: 'var(--type-caption)',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {section.tutor.fullName}
            </span>
          </>
        ) : (
          <Badge tone="warning" size="sm">
            Sin tutor
          </Badge>
        )}
        {section.assistantName && (
          <Tooltip content={`Auxiliar: ${section.assistantName}`}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                padding: '1px 8px 1px 2px',
                flexShrink: 0,
              }}
            >
              <Avatar name={section.assistantName} size={16} />
              <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>Aux.</span>
            </span>
          </Tooltip>
        )}
      </div>
      <VacBar enrolled={section.enrolled} capacity={section.capacity} />
      <div style={{ display: 'inline-flex', gap: 2, justifyContent: 'flex-end' }}>
        {!readOnly && (
          <Tooltip content="Editar sección">
            <IconButton label="Editar" size="sm" onClick={onEdit}>
              <Icons.Pencil />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip content="Ver nómina">
          <IconButton label="Ver nómina" size="sm" onClick={onView}>
            <Icons.Users />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

// ---- Diálogos ---------------------------------------------------------------
function NivelDialog({
  yearId,
  ctx,
  onClose,
}: {
  yearId: string;
  ctx: NivelCtx | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const edit = ctx?.level;
  const createLevel = useCreateLevel(yearId);
  const updateLevel = useUpdateLevel(yearId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!ctx) return;
    setName(ctx.level?.name ?? '');
    setDescription(ctx.level?.description ?? '');
  }, [ctx]);

  const pending = createLevel.isPending || updateLevel.isPending;

  const submit = () => {
    const payload = { name: name.trim(), description: description.trim() || undefined };
    const opts = {
      onSuccess: () => {
        toast('success', edit ? 'Nivel actualizado' : 'Nivel creado', `${payload.name} guardado correctamente.`);
        onClose();
      },
      onError: (err: unknown) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    };
    if (edit) updateLevel.mutate({ id: edit.id, body: payload }, opts);
    else createLevel.mutate({ academicYearId: yearId, ...payload }, opts);
  };

  return (
    <Dialog
      open={!!ctx}
      onClose={onClose}
      title={edit ? `Editar nivel · ${edit.name}` : 'Nuevo nivel académico'}
      icon={<Icons.Layers />}
      description="Ej. Academia, CEBA, Talleres de verano"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={!name.trim() || pending} onClick={submit}>
            {edit ? 'Guardar cambios' : 'Crear nivel'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Input
          label="Nombre del nivel"
          placeholder="Ej. Academia Pre"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Rango o descripción"
          placeholder="Ej. 1° – 5° / 12–16 años"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          hint="Se muestra junto al nombre del nivel"
        />
      </div>
    </Dialog>
  );
}

function GradoDialog({ yearId, ctx, onClose }: { yearId: string; ctx: GradoCtx | null; onClose: () => void }) {
  const { toast } = useToast();
  const createGrade = useCreateGrade(yearId);
  const [name, setName] = useState('');
  const inicial = ctx ? isInicial(ctx.level.name) : false;

  useEffect(() => {
    if (ctx) setName('');
  }, [ctx]);

  const submit = () => {
    if (!ctx) return;
    createGrade.mutate(
      { levelId: ctx.level.id, name: name.trim() },
      {
        onSuccess: () => {
          toast('success', 'Grado creado', `${name.trim()} · ${ctx.level.name} — agrégale secciones.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo crear', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!ctx}
      onClose={onClose}
      title={`Nuevo grado · ${ctx ? ctx.level.name : ''}`}
      icon={<Icons.Layers />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createGrade.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={!name.trim() || createGrade.isPending}
            onClick={submit}
          >
            Crear grado
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Input
          label="Nombre del grado"
          placeholder={inicial ? 'Ej. 4 años' : 'Ej. 4°'}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Alert tone="info">
          El grado se crea sin secciones — agrégalas desde el árbol. El plan de estudios se define en su pestaña.
        </Alert>
      </div>
    </Dialog>
  );
}

function SeccionDialog({ yearId, ctx, onClose }: { yearId: string; ctx: SeccionCtx | null; onClose: () => void }) {
  const { toast } = useToast();
  const teachersQuery = useTeachers();
  const teachers = teachersQuery.data ?? [];
  const createSection = useCreateSection(yearId);
  const updateSection = useUpdateSection(yearId);

  const edit = ctx?.section;
  const inicial = ctx ? isInicial(ctx.level.name) : false;

  const [name, setName] = useState('');
  const [shift, setShift] = useState<Shift>('MANANA');
  const [capacity, setCapacity] = useState('30');
  const [tutorId, setTutorId] = useState('');
  const [assistant, setAssistant] = useState('');

  useEffect(() => {
    if (!ctx) return;
    setName(edit?.name ?? '');
    setShift(edit?.shift ?? 'MANANA');
    setCapacity(edit ? String(edit.capacity) : '30');
    setTutorId(edit?.tutor?.id ?? '');
    setAssistant(edit?.assistantName ?? '');
  }, [ctx]);

  const capNum = parseInt(capacity, 10);
  const pending = createSection.isPending || updateSection.isPending;
  const belowEnrolled = !!edit && Number.isFinite(capNum) && capNum < edit.enrolled;

  const submit = () => {
    if (!ctx) return;
    const base = {
      name: name.trim(),
      shift,
      capacity: capNum,
      tutorId: tutorId || null,
      assistantName: assistant.trim() || null,
    };
    const opts = {
      onSuccess: () => {
        toast(
          'success',
          edit ? 'Sección actualizada' : 'Sección creada',
          `${ctx.grade.name} ${base.name} · ${SHIFT_LABELS[shift]} · ${base.capacity} vacantes.`,
        );
        onClose();
      },
      onError: (err: unknown) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    };
    if (edit) updateSection.mutate({ id: edit.id, body: base }, opts);
    else createSection.mutate({ gradeLevelId: ctx.grade.id, ...base }, opts);
  };

  const tutorOptions = [
    { value: '', label: '— Sin asignar —' },
    ...teachers.map((t) => ({ value: t.id, label: t.fullName })),
  ];

  return (
    <Dialog
      open={!!ctx}
      onClose={onClose}
      title={
        edit
          ? `Editar sección · ${ctx?.grade.name} ${edit.name}`
          : `Nueva sección · ${ctx ? `${ctx.level.name} ${ctx.grade.name}` : ''}`
      }
      icon={<Icons.Users />}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={!name.trim() || !(capNum > 0) || pending}
            onClick={submit}
          >
            {edit ? 'Guardar cambios' : 'Crear sección'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label={inicial ? 'Nombre de la sección' : 'Letra de la sección'}
            placeholder={inicial ? 'Ej. Los Girasoles' : 'Ej. C'}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            hint={inicial ? 'En Inicial las secciones llevan nombre' : 'En Primaria/Secundaria se usan letras'}
          />
          <Input
            label="Vacantes (capacidad)"
            type="number"
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            suffix="est."
          />
        </div>
        <div>
          <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)', marginBottom: 8 }}>Turno</div>
          <RadioGroup name="turno-sec" value={shift} onChange={(e) => setShift(e.target.value as Shift)} row>
            <Radio value="MANANA" label="Mañana" />
            <Radio value="TARDE" label="Tarde" />
          </RadioGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Select
            label="Tutor de aula"
            options={tutorOptions}
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
            hint="Docente responsable del aula"
          />
          <Input
            label="Auxiliar de aula"
            placeholder="— Sin auxiliar —"
            value={assistant}
            onChange={(e) => setAssistant(e.target.value)}
            hint="Opcional — apoyo al tutor (usual en Inicial)"
          />
        </div>
        {belowEnrolled && (
          <Alert tone="warning" title="Capacidad menor que los matriculados">
            Hay {edit?.enrolled} estudiantes; no puedes reducir por debajo de eso.
          </Alert>
        )}
      </div>
    </Dialog>
  );
}

function RosterDialog({ ctx, onClose }: { ctx: RosterCtx | null; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const rosterQuery = useRoster(ctx?.section.id);
  const roster = rosterQuery.data ?? [];

  useEffect(() => {
    if (ctx) setQ('');
  }, [ctx]);

  if (!ctx) return null;
  const { level, grade, section } = ctx;
  const inicial = isInicial(level.name);
  const titulo = `${grade.name} ${inicial ? `“${section.name}”` : section.name} ${level.name}`;

  const rows = roster
    .map((r) => ({
      id: r.id,
      fullName: `${r.student.lastNames}, ${r.student.firstNames}`,
      code: r.student.code,
      status: r.student.status,
    }))
    .filter((r) => r.fullName.toLowerCase().includes(q.toLowerCase()));

  const columns = [
    { key: 'i', header: 'N°', width: 44, align: 'center' as const, mono: true, render: (_v: unknown, _r: unknown, i: number) => i + 1 },
    {
      key: 'fullName',
      header: 'Estudiante',
      render: (v: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={v} size="xs" />
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center' as const,
      render: (v: keyof typeof STUDENT_STATUS_LABELS) => (
        <Badge tone="success" dot>
          {STUDENT_STATUS_LABELS[v]}
        </Badge>
      ),
    },
  ];

  const matricular = () => {
    onClose();
    navigate('/matricula');
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      icon={<Icons.Users />}
      title={`Nómina · ${titulo}`}
      description={`${section.enrolled} matriculados de ${section.capacity} vacantes${
        section.tutor ? ` · Tutor: ${section.tutor.fullName}` : ''
      }${section.assistantName ? ` · Auxiliar: ${section.assistantName}` : ''}`}
      footer={
        <Button variant="primary" iconLeft={<Icons.Plus />} onClick={matricular}>
          Matricular en esta sección
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        {roster.length > 0 && (
          <Input
            placeholder="Buscar estudiante…"
            iconLeft={<Icons.Search />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
        <div
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {rosterQuery.isLoading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
              Cargando nómina…
            </div>
          ) : rows.length ? (
            <Table columns={columns} data={rows} rowKey="id" compact />
          ) : q ? (
            <EmptyState size="sm" icon={<Icons.Search />} title="Sin resultados" description={`Nadie coincide con “${q}”.`} />
          ) : (
            <EmptyState
              size="sm"
              icon={<Icons.Users />}
              title="Aún no hay estudiantes matriculados en esta sección"
              description="La matrícula de estudiantes llega en la etapa correspondiente (R2)."
              actions={
                <Button variant="primary" size="sm" iconLeft={<Icons.Plus />} onClick={matricular}>
                  Matricular en esta sección
                </Button>
              }
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}
