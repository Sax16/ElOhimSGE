// Vista Admin/secretaría — "Por día": roster en tabla. Si el día es editable
// (hoy o día sin toma) permite marcar y guardar; si es un día pasado ya tomado,
// solo Admin corrige entrada por entrada. Incluye el panel "Avisos del día".
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Icons,
  Input,
  Select,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCan } from '../../lib/useCan';
import { useMe } from '../../lib/useMe';
import { useMySections, useRoster, useSaveAttendance } from './api';
import {
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_TONE,
  dayTitle,
  todayStr,
} from './bits';
import { MarkButtons } from './MarkButtons';
import { AbsenceList } from './AbsenceNoticeDialog';
import { CorrectDialog } from './CorrectDialog';
import type { RosterEntry, StudentAttendanceStatus } from './types';
import './attendance.css';

type Marks = Record<string, StudentAttendanceStatus>;

export function DayTab() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const canEdit = useCan('asistencia', 'editar');

  const today = todayStr();
  const [date, setDate] = useState(today);
  const { data: sectionsData } = useMySections(date);
  const sections = useMemo(() => sectionsData?.sections ?? [], [sectionsData]);

  const [sectionId, setSectionId] = useState('');
  useEffect(() => {
    if (sections.length === 0) return;
    setSectionId((cur) => (cur && sections.some((s) => s.sectionId === cur) ? cur : sections[0]!.sectionId));
  }, [sections]);

  const { data: roster, isLoading } = useRoster(sectionId || undefined, date);
  const save = useSaveAttendance();

  const entries = useMemo(() => roster?.entries ?? [], [roster]);
  const editable = (roster?.editable ?? false) && canEdit;

  const [marks, setMarks] = useState<Marks>({});
  useEffect(() => {
    if (!roster) return;
    const next: Marks = {};
    for (const e of roster.entries) next[e.enrollmentId] = e.status ?? 'PRESENTE';
    setMarks(next);
  }, [roster]);

  const [correcting, setCorrecting] = useState<RosterEntry | null>(null);

  const setMark = (enrollmentId: string, status: StudentAttendanceStatus) =>
    setMarks((m) => ({ ...m, [enrollmentId]: status }));

  const allPresent = () =>
    setMarks(Object.fromEntries(entries.map((e) => [e.enrollmentId, 'PRESENTE' as const])));

  const onSave = () => {
    if (!sectionId) return;
    save.mutate(
      {
        sectionId,
        date,
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
        },
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const absences = useMemo(() => entries.filter((e) => e.status === 'FALTA'), [entries]);

  const columns: TableColumn<RosterEntry>[] = [
    {
      key: 'idx',
      header: '#',
      width: 44,
      mono: true,
      render: (_v, _r, i) => i + 1,
    },
    { key: 'studentCode', header: 'Código', mono: true, width: 90 },
    {
      key: 'fullName',
      header: 'Estudiante',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.fullName} size="sm" />
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</span>
          {r.corrected && (
            <Tooltip content="Corregida por administración">
              <Icons.Pencil style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => {
        const s = r.status;
        if (!s) return <Badge tone="neutral">Sin registro</Badge>;
        return (
          <Badge tone={STATUS_TONE[s]} dot>
            {STATUS_LABELS[s]}
          </Badge>
        );
      },
    },
    {
      key: 'acc',
      header: editable ? 'Marcar' : '',
      align: 'right',
      render: (_v, r) =>
        editable ? (
          <div style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
            <MarkButtons
              value={marks[r.enrollmentId] ?? 'PRESENTE'}
              editable
              onChange={(s) => setMark(r.enrollmentId, s)}
              labelFor={r.fullName}
            />
          </div>
        ) : isAdmin && r.id ? (
          <Button size="sm" variant="secondary" iconLeft={<Icons.Pencil />} onClick={() => setCorrecting(r)}>
            Corregir
          </Button>
        ) : null,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Sección"
          placeholder={sections.length === 0 ? 'Sin secciones' : 'Elige una sección'}
          options={sections.map((s) => ({ value: s.sectionId, label: s.label }))}
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          disabled={sections.length === 0}
          containerStyle={{ minWidth: 220 }}
        />
        <Input
          label="Fecha"
          type="date"
          value={date}
          max={today}
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

      {/* Contadores en vivo (solo al marcar) o estado del día */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {STATUS_ORDER.map((s) => {
          const n = editable
            ? entries.filter((e) => (marks[e.enrollmentId] ?? 'PRESENTE') === s).length
            : entries.filter((e) => e.status === s).length;
          return (
            <Badge key={s} tone={STATUS_TONE[s]} dot>
              {STATUS_LABELS[s]}: {n}
            </Badge>
          );
        })}
      </div>

      {roster && !roster.editable &&
        (date === today ? (
          <Alert tone="warning" title="Día no lectivo">
            Hoy es un día no lectivo (feriado): no se toma asistencia.
          </Alert>
        ) : (
          <Alert tone="info" title="Día ya registrado">
            Este día ya tiene asistencia tomada. Solo administración puede corregir entrada por
            entrada, con justificación.
          </Alert>
        ))}

      <div className="esge-sa-day-grid">
        <Card flush title={roster?.section.label ?? 'Sección'} subtitle={dayTitle(date)}>
          <Table
            columns={columns}
            data={entries}
            rowKey="enrollmentId"
            hover
            zebra
            emptyText={isLoading ? 'Cargando roster…' : 'No hay estudiantes en esta sección.'}
          />
        </Card>

        <Card title="Avisos del día" subtitle="Faltas — avisa por WhatsApp al contacto principal">
          <AbsenceList absences={absences} date={date} />
        </Card>
      </div>

      {isAdmin && <CorrectDialog entry={correcting} onClose={() => setCorrecting(null)} />}
    </div>
  );
}
