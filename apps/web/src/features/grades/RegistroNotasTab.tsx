// Tab "Registro de notas": toolbar (curso·sección + periodo) y tabla de notas
// por competencia con logro (auto/ajustable) y condición en vivo. En bimestre
// cerrado solo Admin edita, pidiendo motivo al guardar.
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Icons,
  ProgressBar,
  Select,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useMe } from '../../lib/useMe';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useGradePeriods } from '../grades/api';
import { exportGradeSheet, useGradeSheet, useMyCourses, useSaveGradeSheet } from './api';
import {
  GRADE_LETTERS,
  GRADE_LETTER_LABELS,
  computeCourseResult,
  courseCondition,
  shortCompetency,
} from './bits';
import { LogroSelect, NotaSelect } from './NotaSelect';
import { ReasonDialog } from './ReasonDialog';
import type { GradeLetter, SheetStudent } from './types';

type Letters = Record<string, Record<string, GradeLetter | null>>; // enrollmentId → competencyId → letra
type Manual = Record<string, GradeLetter>; // enrollmentId → logro ajustado (ausente = automático)

const composite = (sectionId: string, courseId: string) => `${sectionId}|${courseId}`;

export function RegistroNotasTab() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const location = useLocation();
  const preset = location.state as { sectionId?: string; courseId?: string } | null;

  const { yearId } = useSelectedYear();
  const { data: periodsData } = useGradePeriods(yearId);
  const periods = useMemo(() => periodsData ?? [], [periodsData]);

  const [periodId, setPeriodId] = useState('');
  useEffect(() => {
    if (periods.length === 0) return;
    setPeriodId((cur) => {
      if (cur && periods.some((p) => p.id === cur)) return cur;
      const current = periods.find((p) => p.status === 'EN_CURSO');
      return (current ?? periods[0]!).id;
    });
  }, [periods]);

  const { data: coursesData } = useMyCourses(periodId || undefined);
  const courses = useMemo(() => coursesData?.courses ?? [], [coursesData]);

  const [sel, setSel] = useState(''); // "sectionId|courseId"
  useEffect(() => {
    if (courses.length === 0) {
      setSel('');
      return;
    }
    setSel((cur) => {
      if (cur && courses.some((c) => composite(c.sectionId, c.courseId) === cur)) return cur;
      // Preselección desde el portal docente (location.state).
      if (preset?.sectionId && preset.courseId) {
        const match = courses.find(
          (c) => c.sectionId === preset.sectionId && c.courseId === preset.courseId,
        );
        if (match) return composite(match.sectionId, match.courseId);
      }
      const first = courses[0]!;
      return composite(first.sectionId, first.courseId);
    });
  }, [courses, preset]);

  const [sectionId, courseId] = sel ? sel.split('|') : [undefined, undefined];
  const { data: sheet, isLoading } = useGradeSheet(sectionId, courseId, periodId || undefined);
  const save = useSaveGradeSheet();

  const competencies = useMemo(() => sheet?.competencies ?? [], [sheet]);
  const students = useMemo(() => sheet?.students ?? [], [sheet]);

  const periodClosed = sheet?.period.status === 'CERRADO';
  const periodUpcoming = sheet?.period.status === 'PROXIMO';
  const editable = (sheet?.editable ?? false) || (isAdmin && !!periodClosed);
  const requireReason = editable && !!periodClosed;

  // Estado editable: notas por competencia y ajustes de logro.
  const [letters, setLetters] = useState<Letters>({});
  const [manual, setManual] = useState<Manual>({});
  useEffect(() => {
    if (!sheet) return;
    const nextLetters: Letters = {};
    const nextManual: Manual = {};
    for (const s of sheet.students) {
      nextLetters[s.enrollmentId] = { ...s.letters };
      if (s.result && !s.result.auto) nextManual[s.enrollmentId] = s.result.letter;
    }
    setLetters(nextLetters);
    setManual(nextManual);
  }, [sheet]);

  const setLetter = (enrollmentId: string, competencyId: string, letter: GradeLetter | null) =>
    setLetters((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [competencyId]: letter },
    }));

  const setManualResult = (enrollmentId: string, letter: GradeLetter | null) =>
    setManual((prev) => {
      const next = { ...prev };
      if (letter == null) delete next[enrollmentId];
      else next[enrollmentId] = letter;
      return next;
    });

  const autoLetterOf = (enrollmentId: string): GradeLetter | null =>
    computeCourseResult(competencies.map((c) => letters[enrollmentId]?.[c.id] ?? null));

  const effectiveLetterOf = (enrollmentId: string): GradeLetter | null =>
    manual[enrollmentId] ?? autoLetterOf(enrollmentId);

  // Avance en vivo: notas de competencia registradas / total esperado.
  const filled = useMemo(
    () =>
      students.reduce(
        (sum, s) => sum + competencies.filter((c) => !!letters[s.enrollmentId]?.[c.id]).length,
        0,
      ),
    [students, competencies, letters],
  );
  const total = students.length * competencies.length;

  const buildBody = (reason?: string) => ({
    sectionId: sectionId!,
    courseId: courseId!,
    periodId,
    entries: students.flatMap((s) =>
      competencies.map((c) => ({
        enrollmentId: s.enrollmentId,
        competencyId: c.id,
        letter: letters[s.enrollmentId]?.[c.id] ?? null,
      })),
    ),
    results: students.map((s) => ({
      enrollmentId: s.enrollmentId,
      letter: manual[s.enrollmentId] ?? null,
    })),
    ...(reason ? { reason } : {}),
  });

  const [reasonOpen, setReasonOpen] = useState(false);

  const selectedCourse = courses.find((c) => composite(c.sectionId, c.courseId) === sel);
  const contextLabel = selectedCourse
    ? `${selectedCourse.courseName} — ${selectedCourse.sectionLabel} · ${sheet?.period.name ?? ''}`
    : '';

  const doSave = (reason?: string) => {
    if (!sectionId || !courseId) return;
    save.mutate(buildBody(reason), {
      onSuccess: (res) => {
        setReasonOpen(false);
        toast(
          'success',
          'Notas guardadas',
          `${contextLabel}: ${res.results.length} ${
            res.results.length === 1 ? 'estudiante actualizado' : 'estudiantes actualizados'
          }.`,
        );
      },
      onError: (err) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const onSaveClick = () => {
    if (requireReason) setReasonOpen(true);
    else doSave();
  };

  const onExport = () => {
    if (!sectionId || !courseId || !periodId) return;
    exportGradeSheet(sectionId, courseId, periodId).catch((err) =>
      toast('danger', 'No se pudo exportar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    );
  };

  // ---- Columnas ------------------------------------------------------------
  const columns: TableColumn<SheetStudent>[] = [
    { key: 'idx', header: 'N°', width: 44, mono: true, align: 'center', render: (_v, _r, i) => i + 1 },
    {
      key: 'fullName',
      header: 'Estudiante',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.fullName} size="sm" />
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</span>
        </div>
      ),
    },
    ...competencies.map((c, i) => ({
      key: `comp-${c.id}`,
      header: (
        <Tooltip content={c.name}>
          <span>{shortCompetency(i)}</span>
        </Tooltip>
      ),
      align: 'center' as const,
      render: (_v: unknown, r: SheetStudent) => (
        <NotaSelect
          value={letters[r.enrollmentId]?.[c.id] ?? null}
          disabled={!editable}
          ariaLabel={`${c.name} — ${r.fullName}`}
          onChange={(letter) => setLetter(r.enrollmentId, c.id, letter)}
        />
      ),
    })),
    {
      key: 'logro',
      header: 'Logro del bimestre',
      align: 'center',
      render: (_v, r) => (
        <LogroSelect
          manual={manual[r.enrollmentId] ?? null}
          autoLetter={autoLetterOf(r.enrollmentId)}
          disabled={!editable}
          ariaLabel={`Logro — ${r.fullName}`}
          onChange={(letter) => setManualResult(r.enrollmentId, letter)}
        />
      ),
    },
    {
      key: 'cond',
      header: 'Condición',
      align: 'center',
      render: (_v, r) => {
        const cond = courseCondition(effectiveLetterOf(r.enrollmentId));
        if (!cond) return <span style={{ color: 'var(--text-subtle)' }}>—</span>;
        return <span style={{ font: 'var(--type-label)', color: cond.color }}>{cond.label}</span>;
      },
    },
  ];

  const hasCourses = courses.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Curso y sección"
          placeholder={hasCourses ? 'Elige un curso' : 'Sin cursos asignados'}
          options={courses.map((c) => ({
            value: composite(c.sectionId, c.courseId),
            label: `${c.courseName} — ${c.sectionLabel}`,
          }))}
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          disabled={!hasCourses}
          containerStyle={{ minWidth: 280 }}
        />
        <Select
          label="Periodo"
          placeholder={periods.length === 0 ? 'Sin periodos' : 'Elige un periodo'}
          options={periods.map((p) => ({ value: p.id, label: p.name }))}
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          disabled={periods.length === 0}
          containerStyle={{ minWidth: 170 }}
        />
        <div style={{ flex: 1 }} />
        <Button
          variant="secondary"
          iconLeft={<Icons.Download />}
          disabled={!sel || !periodId}
          onClick={onExport}
        >
          Exportar acta
        </Button>
        <Button
          variant="primary"
          iconLeft={<Icons.Check />}
          disabled={!editable || save.isPending || students.length === 0}
          onClick={onSaveClick}
        >
          Guardar notas
        </Button>
      </div>

      {sheet && !editable && periodClosed && (
        <Alert tone="info" title="Bimestre cerrado">
          Este bimestre está cerrado. Solo administración corrige las notas, con justificación.
        </Alert>
      )}
      {sheet && !editable && periodUpcoming && (
        <Alert tone="info" title="El bimestre aún no inicia">
          Podrás registrar notas cuando el bimestre esté en curso.
        </Alert>
      )}
      {editable && periodClosed && (
        <Alert tone="warning" title="Editando un bimestre cerrado">
          Al guardar se te pedirá un motivo, que queda en la auditoría.
        </Alert>
      )}

      <Card flush>
        <Table
          columns={columns}
          data={students}
          rowKey="enrollmentId"
          hover
          emptyText={
            isLoading
              ? 'Cargando notas…'
              : !hasCourses
                ? 'No tienes cursos asignados en este periodo.'
                : 'No hay estudiantes en esta sección.'
          }
        />
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            Escala literal ·{' '}
            {GRADE_LETTERS.map((l) => `${l} ${GRADE_LETTER_LABELS[l]}`).join(' · ')}
          </span>
          <div style={{ width: 220 }}>
            <ProgressBar
              label="Notas registradas"
              value={filled}
              max={Math.max(total, 1)}
              showValue
              size="sm"
              tone="brand"
              valueFormat={() => `${filled}/${total}`}
            />
          </div>
        </div>
      </Card>

      <ReasonDialog
        open={reasonOpen}
        description={contextLabel}
        pending={save.isPending}
        onClose={() => setReasonOpen(false)}
        onConfirm={(reason) => doSave(reason)}
      />
    </div>
  );
}
