// Tab "Aspectos del aula" (tutor o admin): matriz estudiantes × aspectos activos,
// en dos grupos — formativos (califica el tutor) y evaluación del apoderado
// (la registra el tutor). Mismas reglas de periodo que el registro de notas.
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  EmptyState,
  Icons,
  Select,
  Table,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useMe } from '../../lib/useMe';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useGradePeriods } from '../grades/api';
import { useMySections } from '../student-attendance/api';
import { todayStr } from '../student-attendance/bits';
import { useAspectsSheet, useSaveAspects } from './api';
import { NotaSelect } from './NotaSelect';
import { ReasonDialog } from './ReasonDialog';
import type { AspectsSheetStudent, GradeLetter } from './types';

type Letters = Record<string, Record<string, GradeLetter | null>>; // enrollmentId → aspectId → letra

export function AspectsTab() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';

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

  // Secciones visibles al usuario: my-sections de asistencia (tutorías y
  // asignaciones; para admin, todas). Cubre al tutor sin cursos asignados.
  const { data: sectionsData } = useMySections(todayStr());
  const sections = useMemo(
    () =>
      (sectionsData?.sections ?? []).map((s) => ({
        id: s.sectionId,
        label: s.label,
        role: s.role,
      })),
    [sectionsData],
  );

  const [sectionId, setSectionId] = useState('');
  useEffect(() => {
    if (sections.length === 0) {
      setSectionId('');
      return;
    }
    // Por defecto, la primera sección donde el usuario es tutor (si la hay).
    setSectionId((cur) => {
      if (cur && sections.some((s) => s.id === cur)) return cur;
      const tutored = sections.find((s) => s.role === 'TUTOR');
      return (tutored ?? sections[0]!).id;
    });
  }, [sections]);

  const { data: sheet, isLoading } = useAspectsSheet(sectionId || undefined, periodId || undefined);
  const save = useSaveAspects();

  // El API ya devuelve solo aspectos activos (el DTO no trae `active`).
  const aspects = useMemo(() => sheet?.aspects ?? [], [sheet]);
  const formativos = aspects.filter((a) => a.kind === 'FORMATIVO');
  const apoderado = aspects.filter((a) => a.kind === 'APODERADO');
  const orderedAspects = [...formativos, ...apoderado];
  const students = useMemo(() => sheet?.students ?? [], [sheet]);

  const periodClosed = sheet?.period.status === 'CERRADO';
  const periodUpcoming = sheet?.period.status === 'PROXIMO';
  const canGrade = (sheet?.isTutor ?? false) || isAdmin;
  const editable = canGrade && ((sheet?.editable ?? false) || (isAdmin && !!periodClosed));
  const requireReason = editable && !!periodClosed;

  const [letters, setLetters] = useState<Letters>({});
  useEffect(() => {
    if (!sheet) return;
    const next: Letters = {};
    for (const s of sheet.students) next[s.enrollmentId] = { ...s.letters };
    setLetters(next);
  }, [sheet]);

  const setLetter = (enrollmentId: string, aspectId: string, letter: GradeLetter | null) =>
    setLetters((prev) => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], [aspectId]: letter },
    }));

  const [reasonOpen, setReasonOpen] = useState(false);
  const sectionLabel = sheet?.section.label ?? '';
  const contextLabel = `${sectionLabel} · ${sheet?.period.name ?? ''}`;

  const buildBody = (reason?: string) => ({
    sectionId,
    periodId,
    entries: students.flatMap((s) =>
      orderedAspects.map((a) => ({
        enrollmentId: s.enrollmentId,
        aspectId: a.id,
        letter: letters[s.enrollmentId]?.[a.id] ?? null,
      })),
    ),
    ...(reason ? { reason } : {}),
  });

  const doSave = (reason?: string) => {
    if (!sectionId || !periodId) return;
    save.mutate(buildBody(reason), {
      onSuccess: () => {
        setReasonOpen(false);
        toast('success', 'Aspectos guardados', `${contextLabel}: aspectos del aula actualizados.`);
      },
      onError: (err) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const onSaveClick = () => (requireReason ? setReasonOpen(true) : doSave());

  // Divisor entre grupos: la primera columna del grupo del apoderado.
  const firstApoderadoId = apoderado[0]?.id;
  const divider = (aspectId: string) =>
    aspectId === firstApoderadoId ? { borderLeft: '2px solid var(--border-default)' } : undefined;

  const columns: TableColumn<AspectsSheetStudent>[] = [
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
    ...orderedAspects.map((a) => ({
      key: `asp-${a.id}`,
      header: <span style={{ ...divider(a.id), display: 'block', padding: divider(a.id) ? '0 0 0 10px' : 0 }}>{a.name}</span>,
      align: 'center' as const,
      render: (_v: unknown, r: AspectsSheetStudent) => (
        <div style={{ ...divider(a.id), paddingLeft: divider(a.id) ? 10 : 0 }}>
          <NotaSelect
            value={letters[r.enrollmentId]?.[a.id] ?? null}
            disabled={!editable}
            ariaLabel={`${a.name} — ${r.fullName}`}
            onChange={(letter) => setLetter(r.enrollmentId, a.id, letter)}
          />
        </div>
      ),
    })),
  ];

  // El docente no es tutor de la sección elegida.
  if (sheet && !canGrade) {
    return (
      <Card>
        <EmptyState
          icon={<Icons.Clipboard />}
          title="Solo el tutor del aula califica estos aspectos"
          description="Los aspectos formativos y la evaluación del apoderado los registra el tutor de la sección."
        />
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Sección"
          placeholder={sections.length === 0 ? 'Sin secciones' : 'Elige una sección'}
          options={sections.map((s) => ({ value: s.id, label: s.label }))}
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          disabled={sections.length === 0}
          containerStyle={{ minWidth: 220 }}
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
          variant="primary"
          iconLeft={<Icons.Check />}
          disabled={!editable || save.isPending || students.length === 0}
          onClick={onSaveClick}
        >
          Guardar aspectos
        </Button>
      </div>

      {sheet && !editable && periodClosed && (
        <Alert tone="info" title="Bimestre cerrado">
          Este bimestre está cerrado. Solo administración corrige, con justificación.
        </Alert>
      )}
      {sheet && !editable && periodUpcoming && (
        <Alert tone="info" title="El bimestre aún no inicia">
          Podrás registrar los aspectos cuando el bimestre esté en curso.
        </Alert>
      )}
      {editable && periodClosed && (
        <Alert tone="warning" title="Editando un bimestre cerrado">
          Al guardar se te pedirá un motivo, que queda en la auditoría.
        </Alert>
      )}

      <Card flush>
        <div className="esge-aspect-group-head" style={{ borderTop: 'none' }}>
          <span className="eyebrow">
            Aspectos formativos · califica el tutor
            {apoderado.length > 0 ? '   ·   Evaluación del apoderado · registra el tutor' : ''}
          </span>
        </div>
        <Table
          columns={columns}
          data={students}
          rowKey="enrollmentId"
          hover
          emptyText={isLoading ? 'Cargando aula…' : 'No hay estudiantes en esta sección.'}
        />
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
          Escala literal AD/A/B/C. Los aspectos inactivos no aparecen en periodos nuevos.
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
