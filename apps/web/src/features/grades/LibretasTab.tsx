// Tab "Libretas": elige sección → estudiante (con búsqueda) → periodo, ve la
// libreta en pantalla y la imprime/guarda como PDF (patrón printReportCard).
// Las secciones salen de my-sections de asistencia (tutorías y asignaciones;
// admin ve todas) y el roster con enrollmentId de grades/aspects-sheet — ambas
// fuentes cubren al tutor sin cursos asignados.
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, EmptyState, Icons, Input, Select, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useGradePeriods } from '../grades/api';
import { useInstitution } from '../settings/api';
import { useMySections } from '../student-attendance/api';
import { todayStr } from '../student-attendance/bits';
import { useAspectsSheet, useReportCard } from './api';
import { ReportCardDoc } from './ReportCardDoc';
import { printReportCard } from './printReportCard';

export function LibretasTab() {
  const { toast } = useToast();
  const { yearId } = useSelectedYear();
  const { data: institution } = useInstitution();
  const institutionName = institution?.name ?? 'I.E.P. Elohim';

  const { data: periodsData } = useGradePeriods(yearId);
  const periods = useMemo(() => periodsData ?? [], [periodsData]);

  // Vista de periodo: un bimestre concreto (solo su columna) o "General"
  // (las columnas de los 4 bimestres, sin la línea de asistencia).
  const [periodView, setPeriodView] = useState('');
  useEffect(() => {
    if (periods.length === 0) return;
    setPeriodView((cur) => {
      if (cur === 'general' || (cur && periods.some((p) => p.id === cur))) return cur;
      const current = periods.find((p) => p.status === 'EN_CURSO');
      return (current ?? periods[0]!).id;
    });
  }, [periods]);

  // El API siempre necesita un periodId concreto (asistencia del pie y roster):
  // en la vista General se usa el bimestre en curso.
  const periodId = useMemo(() => {
    if (periodView !== 'general') return periodView;
    const current = periods.find((p) => p.status === 'EN_CURSO');
    return (current ?? periods[0])?.id ?? '';
  }, [periodView, periods]);

  // Secciones visibles: my-sections de asistencia (tutorías y asignaciones;
  // admin ve todas).
  const { data: sectionsData } = useMySections(todayStr());
  const sections = useMemo(
    () => (sectionsData?.sections ?? []).map((s) => ({ id: s.sectionId, label: s.label })),
    [sectionsData],
  );

  const [sectionId, setSectionId] = useState('');
  useEffect(() => {
    if (sections.length === 0) {
      setSectionId('');
      return;
    }
    setSectionId((cur) => (cur && sections.some((s) => s.id === cur) ? cur : sections[0]!.id));
  }, [sections]);

  // Roster con enrollmentId: aspects-sheet de la sección (visible también para
  // docentes no tutores, con editable=false).
  const { data: sheet } = useAspectsSheet(sectionId || undefined, periodId || undefined);
  const roster = useMemo(() => sheet?.students ?? [], [sheet]);

  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (r) => r.fullName.toLowerCase().includes(q) || r.studentCode.toLowerCase().includes(q),
    );
  }, [roster, search]);

  const [enrollmentId, setEnrollmentId] = useState('');
  useEffect(() => {
    if (filtered.length === 0) {
      setEnrollmentId('');
      return;
    }
    setEnrollmentId((cur) => (cur && filtered.some((r) => r.enrollmentId === cur) ? cur : filtered[0]!.enrollmentId));
  }, [filtered]);

  const { data: reportCard, isLoading, isError } = useReportCard(
    enrollmentId || undefined,
    periodId || undefined,
  );

  const onPrint = () => {
    if (!reportCard) return;
    try {
      printReportCard(reportCard, { institutionName, periodView });
    } catch (err) {
      toast('danger', 'No se pudo imprimir', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    }
  };

  const hasSections = sections.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Sección"
          placeholder={hasSections ? 'Elige una sección' : 'Sin secciones'}
          options={sections.map((s) => ({ value: s.id, label: s.label }))}
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          disabled={!hasSections}
          containerStyle={{ minWidth: 200 }}
        />
        <Input
          label="Buscar estudiante"
          placeholder="Nombre o código"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerStyle={{ width: 200 }}
        />
        <Select
          label="Estudiante"
          placeholder={filtered.length === 0 ? 'Sin estudiantes' : 'Elige un estudiante'}
          options={filtered.map((r) => ({ value: r.enrollmentId, label: `${r.studentCode} · ${r.fullName}` }))}
          value={enrollmentId}
          onChange={(e) => setEnrollmentId(e.target.value)}
          disabled={filtered.length === 0}
          containerStyle={{ minWidth: 260 }}
        />
        <Select
          label="Periodo"
          placeholder={periods.length === 0 ? 'Sin periodos' : 'Elige un periodo'}
          options={[
            ...periods.map((p) => ({ value: p.id, label: p.name })),
            { value: 'general', label: 'General (4 bimestres)' },
          ]}
          value={periodView}
          onChange={(e) => setPeriodView(e.target.value)}
          disabled={periods.length === 0}
          containerStyle={{ minWidth: 180 }}
        />
        <div style={{ flex: 1 }} />
        <Button variant="primary" iconLeft={<Icons.Printer />} disabled={!reportCard} onClick={onPrint}>
          Imprimir / PDF
        </Button>
      </div>

      {isError && (
        <Alert tone="danger" title="No se pudo cargar la libreta">
          Inténtalo de nuevo o elige otro estudiante.
        </Alert>
      )}

      {reportCard ? (
        <ReportCardDoc reportCard={reportCard} institutionName={institutionName} periodView={periodView} />
      ) : (
        <Card>
          <EmptyState
            icon={<Icons.Book />}
            title={isLoading ? 'Cargando libreta…' : 'Elige un estudiante'}
            description={
              isLoading
                ? undefined
                : 'Selecciona la sección, el estudiante y el periodo para ver su libreta.'
            }
          />
        </Card>
      )}
    </div>
  );
}
