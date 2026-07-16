// Toma diaria de asistencia por sección (R4 · Etapa 1). La usa el docente (solo
// hoy, sus secciones) y también Admin (cualquier día hasta hoy). Pensada para
// celular: fila compacta con botones circulares P/T/F/J grandes para el pulgar.
// Spec: design/ui_kits/sge/TeacherScreen.jsx (SGE_TeacherAttendance).
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Icons,
  Input,
  Select,
  Tooltip,
  useToast,
} from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useMe } from '../../lib/useMe';
import { useMySections, useRoster, useSaveAttendance } from './api';
import { STATUS_LABELS, STATUS_ORDER, STATUS_TONE, dayTitle, todayStr } from './bits';
import { MarkButtons } from './MarkButtons';
import { AbsenceNoticeDialog } from './AbsenceNoticeDialog';
import type { RosterEntry, StudentAttendanceStatus } from './types';
import './attendance.css';

type Marks = Record<string, StudentAttendanceStatus>;

export function TakeAttendancePage() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isDocente = me?.role === 'DOCENTE';

  const today = todayStr();
  const location = useLocation();

  // Preselección de sección: state del router o ?section= (viene de "Mis clases").
  const preSection = useMemo(() => {
    const fromState = (location.state as { sectionId?: string } | null)?.sectionId;
    if (fromState) return fromState;
    return new URLSearchParams(location.search).get('section') ?? '';
  }, [location.key]);

  const [date, setDate] = useState(today);
  // El docente solo marca hoy; para Admin la fecha es editable (máx. hoy).
  const effectiveDate = isDocente ? today : date;

  const { data: sectionsData } = useMySections(effectiveDate);
  const sections = useMemo(() => sectionsData?.sections ?? [], [sectionsData]);

  const [sectionId, setSectionId] = useState('');
  // Cuando llegan las secciones, fija la preseleccionada o la primera.
  useEffect(() => {
    if (sections.length === 0) return;
    setSectionId((cur) => {
      if (cur && sections.some((s) => s.sectionId === cur)) return cur;
      if (preSection && sections.some((s) => s.sectionId === preSection)) return preSection;
      return sections[0]!.sectionId;
    });
  }, [sections, preSection]);

  const { data: roster, isLoading } = useRoster(sectionId || undefined, effectiveDate);
  const save = useSaveAttendance();

  const entries = useMemo(() => roster?.entries ?? [], [roster]);
  const editable = roster?.editable ?? false;

  // Estado local de marcas. Se resetea al cambiar de sección/fecha o recargar.
  const [marks, setMarks] = useState<Marks>({});
  useEffect(() => {
    if (!roster) return;
    const next: Marks = {};
    for (const e of roster.entries) next[e.enrollmentId] = e.status ?? 'PRESENTE';
    setMarks(next);
  }, [roster]);

  const [notice, setNotice] = useState<{ absences: RosterEntry[]; date: string } | null>(null);

  const counts = useMemo(() => {
    const c: Record<StudentAttendanceStatus, number> = {
      PRESENTE: 0,
      TARDANZA: 0,
      FALTA: 0,
      JUSTIFICADA: 0,
    };
    for (const e of entries) {
      const s = marks[e.enrollmentId] ?? 'PRESENTE';
      c[s] += 1;
    }
    return c;
  }, [entries, marks]);

  const setMark = (enrollmentId: string, status: StudentAttendanceStatus) =>
    setMarks((m) => ({ ...m, [enrollmentId]: status }));

  const allPresent = () =>
    setMarks(Object.fromEntries(entries.map((e) => [e.enrollmentId, 'PRESENTE' as const])));

  const onSave = () => {
    if (!sectionId) return;
    save.mutate(
      {
        sectionId,
        date: effectiveDate,
        entries: entries.map((e) => ({
          enrollmentId: e.enrollmentId,
          status: marks[e.enrollmentId] ?? 'PRESENTE',
        })),
      },
      {
        onSuccess: (res) => {
          toast(
            'success',
            'Asistencia guardada',
            `${res.counts.PRESENTE} presentes, ${res.counts.TARDANZA} tardanzas, ` +
              `${res.counts.FALTA} faltas, ${res.counts.JUSTIFICADA} justificadas.`,
          );
          if (res.skippedCorrected > 0) {
            toast(
              'info',
              'Correcciones respetadas',
              `${res.skippedCorrected} ${
                res.skippedCorrected === 1 ? 'entrada corregida se mantuvo' : 'entradas corregidas se mantuvieron'
              } sin cambios.`,
            );
          }
          // Ofrecer avisar las faltas al apoderado.
          const absences = entries.filter((e) => marks[e.enrollmentId] === 'FALTA');
          if (absences.length > 0) setNotice({ absences, date: effectiveDate });
        },
        onError: (err) =>
          toast(
            'danger',
            'No se pudo guardar',
            err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
          ),
      },
    );
  };

  const sectionOptions = sections.map((s) => ({
    value: s.sectionId,
    label: s.label,
  }));

  const currentSection = sections.find((s) => s.sectionId === sectionId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Sección"
          placeholder={sections.length === 0 ? 'Sin aulas' : 'Elige una sección'}
          options={sectionOptions}
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          disabled={sections.length === 0}
          containerStyle={{ minWidth: 220 }}
        />
        <Input
          label="Fecha"
          type="date"
          value={effectiveDate}
          max={today}
          disabled={isDocente}
          onChange={(e) => setDate(e.target.value)}
          containerStyle={{ width: 170 }}
        />
        <div style={{ flex: 1 }} />
        {editable && (
          <>
            <Button variant="secondary" iconLeft={<Icons.Check />} onClick={allPresent}>
              Todos presentes
            </Button>
            <Button
              variant="primary"
              iconLeft={<Icons.Check />}
              disabled={save.isPending || entries.length === 0}
              onClick={onSave}
            >
              Guardar asistencia
            </Button>
          </>
        )}
      </div>

      {/* Contadores en vivo */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {STATUS_ORDER.map((s) => (
          <Badge key={s} tone={STATUS_TONE[s]} dot>
            {STATUS_LABELS[s]}: {counts[s]}
          </Badge>
        ))}
      </div>

      {/* Aviso de solo lectura */}
      {roster && !editable && (
        <Alert tone="info" title="Solo lectura">
          Solo administración corrige días pasados. Puedes revisar la asistencia, pero no editarla
          desde aquí.
        </Alert>
      )}

      {/* Lista de alumnos */}
      <Card
        flush
        title={currentSection ? currentSection.label : 'Sección'}
        subtitle={dayTitle(effectiveDate)}
      >
        {entries.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
            {isLoading ? 'Cargando estudiantes…' : 'No hay estudiantes en esta sección.'}
          </div>
        ) : (
          <div>
            {entries.map((e, i) => (
              <StudentRow
                key={e.enrollmentId}
                entry={e}
                index={i}
                value={marks[e.enrollmentId] ?? 'PRESENTE'}
                editable={editable}
                onChange={(s) => setMark(e.enrollmentId, s)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Aviso de faltas al pie */}
      <Alert tone="info">
        {isDocente ? 'Solo puedes marcar la asistencia del día de hoy. ' : ''}
        El aviso por falta se envía por WhatsApp al contacto principal desde el botón al guardar.
      </Alert>

      <AbsenceNoticeDialog
        open={!!notice}
        absences={notice?.absences ?? []}
        date={notice?.date ?? effectiveDate}
        onClose={() => setNotice(null)}
      />
    </div>
  );
}

function StudentRow({
  entry,
  index,
  value,
  editable,
  onChange,
}: {
  entry: RosterEntry;
  index: number;
  value: StudentAttendanceStatus;
  editable: boolean;
  onChange: (status: StudentAttendanceStatus) => void;
}) {
  return (
    <div className="esge-sa-row">
      <span className="esge-sa-row__idx">{index + 1}</span>
      <Avatar name={entry.fullName} size="sm" />
      <span className="esge-sa-row__name">
        {entry.fullName}
        {entry.corrected && (
          <Tooltip content="Corregida por administración">
            <Icons.Pencil
              style={{ width: 12, height: 12, color: 'var(--text-muted)', marginLeft: 6 }}
            />
          </Tooltip>
        )}
      </span>
      <MarkButtons value={value} editable={editable} onChange={onChange} labelFor={entry.fullName} />
    </div>
  );
}
