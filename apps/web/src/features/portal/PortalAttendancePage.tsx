// Portal del apoderado — Asistencia (/pasist). Resumen mensual (chips de día),
// horario de la semana de su sección y calendario del mes. Solo lectura.
import { useMemo, useState } from 'react';
import { Badge, Card, EmptyState, Icons, Input } from '@elohim/ui';
import { PortalShell } from './PortalShell';
import { usePortalAttendance, usePortalCalendar, usePortalSchedule } from './api';
import { DAYS, DAY_LABELS_LONG } from '../schedule/bits';
import {
  ATTENDANCE_LETTER_CELL,
  ATTENDANCE_LETTER_LABELS,
  currentMonth,
  dayMonthLong,
  dayNum,
  eventTypeLabel,
  eventTypeTone,
  monthLabel,
  shortDate,
} from './bits';
import type { AttendanceLetter, PortalScheduleBlock, PortalStudent } from './types';

export function PortalAttendancePage() {
  return <PortalShell>{(child) => <AttendanceBody child={child} />}</PortalShell>;
}

/** dayOfWeek de hoy en base lunes (1..7). */
function todayDow(): number {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

function AttendanceBody({ child }: { child: PortalStudent }) {
  const [month, setMonth] = useState(currentMonth());
  const { data: att, isLoading } = usePortalAttendance(child.enrollmentId, month);
  const days = useMemo(() => att?.days ?? [], [att]);

  return (
    <>
      {/* Asistencia mensual */}
      <Card
        title={`Asistencia · ${monthLabel(month)}`}
        actions={
          <Input
            type="month"
            aria-label="Mes"
            value={month}
            max={currentMonth()}
            onChange={(e) => setMonth(e.target.value)}
            containerStyle={{ width: 150 }}
          />
        }
      >
        {isLoading && days.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span
                style={{
                  font: 'var(--type-h2)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-strong)',
                }}
              >
                {att?.pct == null ? '—' : `${att.pct}%`}
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge tone="success">P {att?.totals.P ?? 0}</Badge>
                <Badge tone="warning">T {att?.totals.T ?? 0}</Badge>
                <Badge tone="danger">F {att?.totals.F ?? 0}</Badge>
                <Badge tone="info">J {att?.totals.J ?? 0}</Badge>
              </div>
            </div>

            {days.length === 0 ? (
              <EmptyState
                size="sm"
                icon={<Icons.Calendar />}
                title="Sin registros este mes"
                description="No hay asistencia tomada para este mes."
              />
            ) : (
              <div className="pt-days">
                {days.map((d) => {
                  const cell = ATTENDANCE_LETTER_CELL[d.status as AttendanceLetter];
                  return (
                    <div className="pt-day" key={d.date} title={ATTENDANCE_LETTER_LABELS[d.status]}>
                      <span className="pt-day__num">{dayNum(d.date)}</span>
                      <span
                        className="pt-day__letter"
                        style={cell ? { background: cell.bg, color: cell.fg } : undefined}
                      >
                        {d.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Horario de la semana */}
      <WeekScheduleCard child={child} />

      {/* Calendario del mes */}
      <MonthCalendarCard month={month} />
    </>
  );
}

function WeekScheduleCard({ child }: { child: PortalStudent }) {
  const { data, isLoading } = usePortalSchedule(child.enrollmentId);
  const today = todayDow();

  const blocks = useMemo(
    () => [...(data?.blocks ?? [])].sort((a, b) => a.order - b.order),
    [data],
  );
  // slot por "blockId|dayOfWeek".
  const slotAt = useMemo(() => {
    const map = new Map<string, { courseName: string; teacherName: string | null }>();
    for (const s of data?.slots ?? []) map.set(`${s.blockId}|${s.dayOfWeek}`, s);
    return map;
  }, [data]);

  const hasSlots = (data?.slots.length ?? 0) > 0;

  return (
    <Card flush title="Horario de la semana" subtitle={child.sectionLabel}>
      <div style={{ padding: 16 }}>
        {isLoading && blocks.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
        ) : blocks.length === 0 || !hasSlots ? (
          <EmptyState
            size="sm"
            icon={<Icons.Clock />}
            title="Sin horario"
            description="Aún no hay un horario programado para esta sección."
          />
        ) : (
          <div className="pt-week">
            {DAYS.map((day) => {
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`pt-week__day${isToday ? ' pt-week__day--today' : ''}`}
                >
                  <div className="pt-week__head">{DAY_LABELS_LONG[day - 1]}</div>
                  <DaySlots blocks={blocks} day={day} slotAt={slotAt} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function DaySlots({
  blocks,
  day,
  slotAt,
}: {
  blocks: PortalScheduleBlock[];
  day: number;
  slotAt: Map<string, { courseName: string; teacherName: string | null }>;
}) {
  const rows = blocks
    .map((b) => {
      if (b.isBreak) {
        return (
          <div key={b.id} className="pt-week__slot pt-week__slot--break">
            {b.label || 'Recreo'}
          </div>
        );
      }
      const slot = slotAt.get(`${b.id}|${day}`);
      if (!slot) return null;
      return (
        <div key={b.id} className="pt-week__slot">
          <span className="pt-week__time">
            {b.startTime}–{b.endTime}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pt-week__course">{slot.courseName}</div>
            {slot.teacherName && <div className="pt-week__teacher">{slot.teacherName}</div>}
          </div>
        </div>
      );
    })
    .filter(Boolean);

  if (rows.length === 0) return <div className="pt-week__empty">Sin clases</div>;
  return <>{rows}</>;
}

function MonthCalendarCard({ month }: { month: string }) {
  const { data, isLoading } = usePortalCalendar(month);
  const events = useMemo(
    () =>
      [...(data?.events ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [data],
  );

  return (
    <Card title={`Calendario · ${monthLabel(month)}`}>
      {isLoading && events.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando…</div>
      ) : events.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<Icons.Calendar />}
          title="Sin eventos"
          description="No hay eventos registrados para este mes."
        />
      ) : (
        <div>
          {events.map((ev, i) => (
            <div className="pt-row" key={`${ev.startDate}-${i}`}>
              <div>
                <div className="pt-row__label">{ev.name}</div>
                <div className="pt-row__sub">
                  {ev.startDate === ev.endDate
                    ? dayMonthLong(ev.startDate)
                    : `${shortDate(ev.startDate)} – ${shortDate(ev.endDate)}`}
                </div>
              </div>
              <Badge tone={eventTypeTone(ev.type)}>{eventTypeLabel(ev.type)}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
