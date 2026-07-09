// Pantalla Estudiantes (Etapa 4): listado con filtros, ficha y alta.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  IconButton,
  Icons,
  Input,
  Pagination,
  Select,
  Table,
  Tag,
  Tooltip,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import {
  SHIFT_LABELS,
  STUDENT_STATUSES,
  STUDENT_STATUS_LABELS,
  formatPEN,
  type StudentStatus,
} from '@elohim/shared';
import { useYearStore } from '../../stores/year.store';
import { useLevelsTree, useYears } from '../structure/api';
import type { ApiLevel } from '../structure/types';
import { useStudents } from './api';
import { STUDENT_STATUS_TONE, avatarColor, fullName } from './bits';
import { StudentDialog } from './StudentDialog';
import { StudentFormDialog } from './StudentFormDialog';
import type { StudentListItem, StudentsFilters } from './types';

const PAGE_SIZE = 20;

interface FilterState {
  search: string;
  levelId: string;
  gradeLevelId: string;
  sectionId: string;
  status: string;
}

const EMPTY_FILTERS: FilterState = { search: '', levelId: '', gradeLevelId: '', sectionId: '', status: '' };

export function StudentsPage() {
  const navigate = useNavigate();

  // Año seleccionado (para el árbol de niveles/grados/secciones de los filtros).
  const selectedYearName = useYearStore((s) => s.selectedYearName);
  const years = useYears().data ?? [];
  const activeYear = years.find((y) => y.status === 'ACTIVO') ?? null;
  const currentName = selectedYearName ?? activeYear?.name ?? '';
  const selectedYear = years.find((y) => y.name === currentName) ?? activeYear ?? years[0] ?? null;
  const yearId = selectedYear?.id;
  const readOnly = selectedYear?.status === 'CERRADO';
  const levels = useLevelsTree(yearId).data ?? [];

  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [fichaId, setFichaId] = useState<{ id: string; debtCents: number } | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const query: StudentsFilters = { ...filters, page, pageSize: PAGE_SIZE };
  const { data, isLoading } = useStudents(query);
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const grades = useMemo(
    () => levels.find((l) => l.id === filters.levelId)?.grades ?? [],
    [levels, filters.levelId],
  );

  // Cambiar filtros siempre vuelve a la página 1; niveles/grados resetean dependientes.
  const patch = (p: Partial<FilterState>) => {
    setFilters((f) => ({ ...f, ...p }));
    setPage(1);
  };
  const setLevel = (levelId: string) => patch({ levelId, gradeLevelId: '', sectionId: '' });
  const setGrade = (gradeLevelId: string) => patch({ gradeLevelId, sectionId: '' });

  // ---- Chips de filtros activos ------------------------------------------
  const chips: { key: string; label: string; clear: () => void }[] = [];
  const levelName = levels.find((l) => l.id === filters.levelId)?.name;
  if (levelName) chips.push({ key: 'level', label: levelName, clear: () => setLevel('') });
  const gradeName = grades.find((g) => g.id === filters.gradeLevelId)?.name;
  if (gradeName) chips.push({ key: 'grade', label: gradeName, clear: () => setGrade('') });
  const sectionName = grades
    .find((g) => g.id === filters.gradeLevelId)
    ?.sections.find((s) => s.id === filters.sectionId)?.name;
  if (sectionName) chips.push({ key: 'section', label: `Sección ${sectionName}`, clear: () => patch({ sectionId: '' }) });
  if (filters.status)
    chips.push({
      key: 'status',
      label: STUDENT_STATUS_LABELS[filters.status as StudentStatus],
      clear: () => patch({ status: '' }),
    });

  const columns: TableColumn<StudentListItem>[] = [
    {
      key: 'nombre',
      header: 'Estudiante',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Avatar name={fullName(r)} src={r.photoUrl ?? undefined} size="sm" color={avatarColor(r.code)} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{fullName(r)}</span>
            <span style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              {r.code}
            </span>
          </div>
        </div>
      ),
    },
    { key: 'dni', header: 'DNI', mono: true },
    {
      key: 'grado',
      header: 'Grado y sección',
      render: (_v, r) =>
        r.placement ? (
          <span>
            {r.placement.gradeName} {r.placement.sectionName}
            <span style={{ color: 'var(--text-subtle)' }}> · {r.placement.levelName}</span>
          </span>
        ) : (
          <span style={{ color: 'var(--text-subtle)' }}>Sin matrícula</span>
        ),
    },
    {
      key: 'turno',
      header: 'Turno',
      align: 'center',
      render: (_v, r) =>
        r.shift ? (
          <Badge tone={r.shift === 'MANANA' ? 'info' : 'accent'}>{SHIFT_LABELS[r.shift]}</Badge>
        ) : (
          <span style={{ color: 'var(--text-subtle)' }}>—</span>
        ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => (
        <Badge tone={STUDENT_STATUS_TONE[r.status]} dot>
          {STUDENT_STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
    {
      key: 'deuda',
      header: 'Deuda',
      num: true,
      mono: true,
      render: (_v, r) =>
        r.debtCents > 0 ? (
          <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatPEN(r.debtCents)}</span>
        ) : (
          <Badge tone="success" dot>
            Al día
          </Badge>
        ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <Tooltip content="Ver ficha">
          <IconButton label="Ver ficha" size="sm" onClick={() => setFichaId({ id: r.id, debtCents: r.debtCents })}>
            <Icons.Eye />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            placeholder="Buscar por nombre, código o DNI…"
            iconLeft={<Icons.Search />}
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
          />
        </div>
        <Select
          aria-label="Nivel"
          placeholder="Nivel"
          options={levels.map((l) => ({ value: l.id, label: l.name }))}
          value={filters.levelId}
          onChange={(e) => setLevel(e.target.value)}
          containerStyle={{ width: 160 }}
        />
        <Select
          aria-label="Grado"
          placeholder="Grado"
          options={grades.map((g) => ({ value: g.id, label: g.name }))}
          value={filters.gradeLevelId}
          onChange={(e) => setGrade(e.target.value)}
          containerStyle={{ width: 150 }}
          disabled={!filters.levelId}
        />
        <Button variant="secondary" iconLeft={<Icons.Filter />} onClick={() => setAdvancedOpen(true)}>
          Filtros
        </Button>
        {!readOnly && (
          <Button variant="secondary" iconLeft={<Icons.Plus />} onClick={() => setFormOpen(true)}>
            Nuevo estudiante
          </Button>
        )}
        <Button variant="primary" iconLeft={<Icons.Clipboard />} onClick={() => navigate('/matricula')}>
          Matricular
        </Button>
      </div>

      {/* Filtros activos */}
      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Filtros:</span>
          {chips.map((c) => (
            <Tag key={c.key} onRemove={c.clear}>
              {c.label}
            </Tag>
          ))}
          <Button variant="ghost" size="sm" onClick={() => patch(EMPTY_FILTERS)}>
            Limpiar
          </Button>
        </div>
      )}

      {/* Tabla */}
      <Card flush>
        <Table
          columns={columns}
          data={rows}
          rowKey="id"
          hover
          zebra
          emptyText={isLoading ? 'Cargando estudiantes…' : 'No hay estudiantes que coincidan.'}
        />
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      </Card>

      <AdvancedFilters
        open={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        levels={levels}
        current={filters}
        onApply={(next) => {
          setFilters(next);
          setPage(1);
          setAdvancedOpen(false);
        }}
        onClear={() => {
          setFilters(EMPTY_FILTERS);
          setPage(1);
          setAdvancedOpen(false);
        }}
      />

      <StudentDialog
        studentId={fichaId?.id ?? null}
        fallbackDebtCents={fichaId?.debtCents ?? 0}
        readOnly={readOnly}
        onClose={() => setFichaId(null)}
      />

      <StudentFormDialog open={formOpen} readOnly={readOnly} onClose={() => setFormOpen(false)} />
    </div>
  );
}

// ---- Diálogo de filtros avanzados ------------------------------------------
function AdvancedFilters({
  open,
  onClose,
  levels,
  current,
  onApply,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  levels: ApiLevel[];
  current: FilterState;
  onApply: (next: FilterState) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState<FilterState>(current);

  // Sincroniza el borrador con los filtros vigentes cada vez que se abre.
  useEffect(() => {
    if (open) setDraft(current);
  }, [open]);

  const grades = levels.find((l) => l.id === draft.levelId)?.grades ?? [];
  const sections = grades.find((g) => g.id === draft.gradeLevelId)?.sections ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Filter />}
      title="Filtros avanzados"
      footer={
        <>
          <Button variant="ghost" onClick={onClear}>
            Limpiar todo
          </Button>
          <span style={{ flex: 1 }} />
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} onClick={() => onApply(draft)}>
            Aplicar filtros
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Select
          label="Nivel"
          placeholder="Todos"
          options={levels.map((l) => ({ value: l.id, label: l.name }))}
          value={draft.levelId}
          onChange={(e) => setDraft((d) => ({ ...d, levelId: e.target.value, gradeLevelId: '', sectionId: '' }))}
        />
        <Select
          label="Grado"
          placeholder="Todos"
          options={grades.map((g) => ({ value: g.id, label: g.name }))}
          value={draft.gradeLevelId}
          onChange={(e) => setDraft((d) => ({ ...d, gradeLevelId: e.target.value, sectionId: '' }))}
          disabled={!draft.levelId}
        />
        <Select
          label="Sección"
          placeholder="Todas"
          options={sections.map((s) => ({ value: s.id, label: s.name }))}
          value={draft.sectionId}
          onChange={(e) => setDraft((d) => ({ ...d, sectionId: e.target.value }))}
          disabled={!draft.gradeLevelId}
        />
        <Select
          label="Estado"
          placeholder="Todos"
          options={STUDENT_STATUSES.map((s) => ({ value: s, label: STUDENT_STATUS_LABELS[s] }))}
          value={draft.status}
          onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
        />
      </div>
    </Dialog>
  );
}
