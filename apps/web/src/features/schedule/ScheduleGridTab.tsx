// Pestaña "Horario por sección": grilla bloques × L–V de una sección. La celda
// asigna solo el curso (el docente sale de la Asignación docente); el pie muestra
// los chips de horas programadas/semanales por curso. Toolbar: copiar de otra
// sección e imprimir.
import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, EmptyState, Icons, Select } from '@elohim/ui';
import { useCan } from '../../lib/useCan';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useLevelsTree } from '../structure/api';
import { useInstitution } from '../settings/api';
import { useAssignments } from '../assignments/api';
import { useSchedule } from './api';
import { DAYS, courseColor, hoursTone, timeRange } from './bits';
import { AssignSlotDialog } from './AssignSlotDialog';
import { CopyScheduleDialog } from './CopyScheduleDialog';
import { printSchedule } from './printSchedule';
import type { ScheduleBlock, ScheduleSlot } from './types';
import './schedule.css';

interface SectionOption {
  id: string;
  label: string;
  levelId: string;
  shift: string;
}

export function ScheduleGridTab() {
  const { yearId, yearName, readOnly } = useSelectedYear();
  const canEdit = useCan('estructura', 'editar') && !readOnly;
  const { data: institution } = useInstitution();

  const { data: tree } = useLevelsTree(yearId);
  const { data: assignmentsData } = useAssignments(yearId);

  // Lista plana de secciones del año para el selector y los candidatos a copiar.
  const sections = useMemo<SectionOption[]>(() => {
    const out: SectionOption[] = [];
    for (const level of tree ?? []) {
      for (const grade of level.grades) {
        for (const section of grade.sections) {
          out.push({
            id: section.id,
            label: `${grade.name} ${section.name} · ${level.name}`,
            levelId: level.id,
            shift: section.shift,
          });
        }
      }
    }
    return out;
  }, [tree]);

  const [sectionId, setSectionId] = useState('');
  const activeSectionId = sectionId || sections[0]?.id || '';
  const activeSectionOpt = sections.find((s) => s.id === activeSectionId) ?? null;

  const { data: schedule, isLoading } = useSchedule(activeSectionId || undefined);

  // Docente por curso, tomado de la Asignación docente de la sección actual.
  const teacherByCourse = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const a of assignmentsData?.assignments ?? []) {
      if (a.sectionId === activeSectionId) map.set(a.courseId, a.teacherName);
    }
    return map;
  }, [assignmentsData, activeSectionId]);

  const blocks = useMemo(
    () => [...(schedule?.blocks ?? [])].sort((a, b) => a.order - b.order),
    [schedule],
  );

  // Índice de slot por "blockId|dayOfWeek".
  const slotAt = useMemo(() => {
    const map = new Map<string, ScheduleSlot>();
    for (const s of schedule?.slots ?? []) map.set(`${s.blockId}|${s.dayOfWeek}`, s);
    return map;
  }, [schedule]);

  const [assigning, setAssigning] = useState<{ day: number; block: ScheduleBlock } | null>(null);
  const [copying, setCopying] = useState(false);

  const copyCandidates = useMemo(
    () =>
      activeSectionOpt
        ? sections.filter(
            (s) =>
              s.id !== activeSectionOpt.id &&
              s.levelId === activeSectionOpt.levelId &&
              s.shift === activeSectionOpt.shift,
          )
        : [],
    [sections, activeSectionOpt],
  );

  const onPrint = () => {
    if (!schedule) return;
    printSchedule(schedule, {
      institutionName: institution?.name ?? 'I.E.P. Elohim',
      sectionLabel: schedule.section.label,
      year: yearName,
    });
  };

  const openCell = (day: number, block: ScheduleBlock) => {
    if (!canEdit || block.isBreak) return;
    setAssigning({ day, block });
  };

  if (sections.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<Icons.Layers />}
          title="Aún no hay secciones"
          description="Crea niveles, grados y secciones en Estructura académica para armar horarios."
        />
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {readOnly && (
        <Alert tone="warning" title="Año cerrado">
          {yearName} está cerrado: el horario es de solo lectura.
        </Alert>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Sección"
          options={sections.map((s) => ({ value: s.id, label: s.label }))}
          value={activeSectionId}
          onChange={(e) => setSectionId(e.target.value)}
          containerStyle={{ minWidth: 220 }}
        />
        <div style={{ flex: 1 }} />
        {canEdit && (
          <Button
            variant="secondary"
            iconLeft={<Icons.Copy />}
            disabled={!schedule || copyCandidates.length === 0}
            onClick={() => setCopying(true)}
          >
            Copiar de otra sección
          </Button>
        )}
        <Button variant="secondary" iconLeft={<Icons.Printer />} disabled={!schedule} onClick={onPrint}>
          Imprimir
        </Button>
      </div>

      <Card
        flush
        title={schedule?.section.label ?? activeSectionOpt?.label ?? 'Horario'}
        subtitle={
          canEdit ? 'Haz clic en una celda para asignar el curso del bloque' : 'Horario semanal'
        }
        footer={
          schedule && schedule.hours.length > 0 ? (
            <div className="esge-sched-hours">
              {schedule.hours.map((h) => (
                <Badge key={h.courseId} tone={hoursTone(h.scheduled, h.weeklyHours)} dot>
                  {h.courseName}: {h.scheduled}/{h.weeklyHours} h
                </Badge>
              ))}
            </div>
          ) : undefined
        }
      >
        {isLoading && !schedule ? (
          <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
            Cargando horario…
          </div>
        ) : blocks.length === 0 ? (
          <div style={{ padding: 18 }}>
            <EmptyState
              icon={<Icons.Clock />}
              title="Sin bloques definidos"
              description="Configura los bloques del nivel y turno en la pestaña Bloques horarios para armar la grilla."
            />
          </div>
        ) : (
          <div className="esge-sched-scroll">
            <div className="esge-sched-grid">
              <div className="esge-sched-corner" />
              {DAYS.map((d) => (
                <div key={d} className="esge-sched-dayhead">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'][d - 1]}
                </div>
              ))}

              {blocks.map((block) =>
                block.isBreak ? (
                  <div key={block.id} style={{ display: 'contents' }}>
                    <div className="esge-sched-timecol esge-sched-timecol--break">
                      {timeRange(block.startTime, block.endTime)}
                    </div>
                    <div className="esge-sched-break">{block.label || 'Recreo'}</div>
                  </div>
                ) : (
                  <div key={block.id} style={{ display: 'contents' }}>
                    <div className="esge-sched-timecol">{timeRange(block.startTime, block.endTime)}</div>
                    {DAYS.map((day) => {
                      const slot = slotAt.get(`${block.id}|${day}`);
                      return (
                        <div
                          key={day}
                          className={`esge-sched-cell${canEdit ? ' esge-sched-cell--clickable' : ''}`}
                          onClick={() => openCell(day, block)}
                          role={canEdit ? 'button' : undefined}
                          tabIndex={canEdit ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (canEdit && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              openCell(day, block);
                            }
                          }}
                        >
                          {slot ? (
                            <div className="esge-sched-cell__inner">
                              <span
                                className="esge-sched-bar"
                                style={{ background: courseColor(slot.courseId) }}
                              />
                              <div style={{ minWidth: 0 }}>
                                <div className="esge-sched-course">{slot.courseName}</div>
                                <div
                                  className={`esge-sched-teacher${
                                    slot.teacherName ? '' : ' esge-sched-teacher--warn'
                                  }`}
                                >
                                  {slot.teacherName ?? 'Sin docente asignado'}
                                </div>
                              </div>
                            </div>
                          ) : canEdit ? (
                            <div className="esge-sched-add">
                              <Icons.Plus />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </Card>

      {assigning && schedule && (
        <AssignSlotDialog
          open
          section={schedule.section}
          day={assigning.day}
          block={assigning.block}
          currentSlot={slotAt.get(`${assigning.block.id}|${assigning.day}`) ?? null}
          courses={schedule.hours}
          teacherByCourse={teacherByCourse}
          onClose={() => setAssigning(null)}
        />
      )}

      {copying && schedule && (
        <CopyScheduleDialog
          open
          toSection={schedule.section}
          candidates={copyCandidates.map((c) => ({ id: c.id, label: c.label }))}
          onClose={() => setCopying(false)}
        />
      )}
    </div>
  );
}
