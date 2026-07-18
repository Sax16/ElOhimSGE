// Calendario académico (R4 · Etapa 4). Grilla mensual (md+) o agenda (sm) con
// feriados, exámenes, actividades y los vencimientos de pensión derivados del
// cronograma. Crear/editar/eliminar requiere permiso estructura.editar.
// Referencia visual: design/ui_kits/sge/CalendarScreen.jsx.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Card, IconButton, Icons } from '@elohim/ui';
import { useCan } from '../../lib/useCan';
import { useCalendarMonth } from './api';
import {
  EVENT_TYPE_META,
  PENSION_META,
  WEEKDAY_SHORT,
  addMonths,
  agendaDayLabel,
  coversDate,
  currentMonth,
  monthGrid,
  monthLabel,
  todayStr,
} from './bits';
import { EventDialog } from './EventDialog';
import { EventDetailDialog } from './EventDetailDialog';
import type { CalendarEvent, PensionMark } from './types';
import './calendar.css';

interface DayContent {
  events: CalendarEvent[];
  pensions: PensionMark[];
  holiday: boolean;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const canEdit = useCan('estructura', 'editar');

  const [month, setMonth] = useState(currentMonth);
  const { data } = useCalendarMonth(month);

  const [dialog, setDialog] = useState<{ open: boolean; event: CalendarEvent | null }>({
    open: false,
    event: null,
  });
  const [detail, setDetail] = useState<CalendarEvent | null>(null);

  const events = useMemo(() => data?.events ?? [], [data]);
  const pension = useMemo(() => data?.pension ?? [], [data]);

  // Mapa fecha → contenido, para no recorrer todos los eventos por celda.
  const byDate = useMemo(() => {
    const map = new Map<string, DayContent>();
    const ensure = (date: string): DayContent => {
      let c = map.get(date);
      if (!c) {
        c = { events: [], pensions: [], holiday: false };
        map.set(date, c);
      }
      return c;
    };
    const grid = monthGrid(month);
    for (const cell of grid) {
      if (!cell.date) continue;
      const c = ensure(cell.date);
      for (const ev of events) {
        if (coversDate(ev, cell.date)) {
          c.events.push(ev);
          if (ev.type === 'FERIADO') c.holiday = true;
        }
      }
      for (const p of pension) {
        if (p.date === cell.date) c.pensions.push(p);
      }
    }
    return map;
  }, [events, pension, month]);

  const cells = useMemo(() => monthGrid(month), [month]);
  const today = todayStr();

  const agendaDays = useMemo(
    () =>
      cells
        .filter((cell) => {
          if (!cell.date) return false;
          const c = byDate.get(cell.date);
          return !!c && (c.events.length > 0 || c.pensions.length > 0);
        })
        .map((cell) => cell.date as string),
    [cells, byDate],
  );

  const openNew = () => setDialog({ open: true, event: null });
  const openEdit = (ev: CalendarEvent) => {
    setDetail(null);
    setDialog({ open: true, event: ev });
  };
  const goToPensions = () => navigate('/pagos');

  const renderEventChips = (content: DayContent | undefined, agenda = false) => {
    if (!content) return null;
    return (
      <>
        {content.events.map((ev) => {
          const meta = EVENT_TYPE_META[ev.type];
          return (
            <button
              key={ev.id}
              type="button"
              className={`esge-cal-chip${agenda ? ' esge-cal-agenda__chip' : ''}`}
              style={
                {
                  '--chip-color': meta.color,
                  '--chip-soft': meta.soft,
                  '--chip-fg': meta.fg,
                } as React.CSSProperties
              }
              title={ev.name}
              onClick={() => setDetail(ev)}
            >
              {ev.name}
            </button>
          );
        })}
        {content.pensions.map((p) => (
          <button
            key={`${p.date}-${p.label}`}
            type="button"
            className={`esge-cal-chip${agenda ? ' esge-cal-agenda__chip' : ''}`}
            style={
              {
                '--chip-color': PENSION_META.color,
                '--chip-soft': PENSION_META.soft,
                '--chip-fg': PENSION_META.fg,
              } as React.CSSProperties
            }
            title={`${p.label} (${p.count})`}
            onClick={goToPensions}
          >
            {p.label}
          </button>
        ))}
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Encabezado: navegación + leyenda + acción */}
      <div className="esge-cal-header">
        <div className="esge-cal-nav">
          <IconButton
            label="Mes anterior"
            variant="outline"
            size="sm"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            <Icons.ChevronRight style={{ transform: 'rotate(180deg)' }} />
          </IconButton>
          <span className="esge-cal-nav__label">{monthLabel(month)}</span>
          <IconButton
            label="Mes siguiente"
            variant="outline"
            size="sm"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <Icons.ChevronRight />
          </IconButton>
        </div>

        <div className="esge-cal-legend">
          {(['FERIADO', 'EXAMEN', 'ACTIVIDAD'] as const).map((t) => (
            <span key={t} className="esge-cal-legend__item">
              <span className="esge-cal-legend__dot" style={{ background: EVENT_TYPE_META[t].color }} />
              {EVENT_TYPE_META[t].label}
            </span>
          ))}
          <span className="esge-cal-legend__item">
            <span className="esge-cal-legend__dot" style={{ background: PENSION_META.color }} />
            {PENSION_META.label}
          </span>
        </div>

        {canEdit && (
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={openNew}>
            Nuevo evento
          </Button>
        )}
      </div>

      {/* Grilla mensual (md+) */}
      <Card flush>
        <div className="esge-cal-grid">
          {WEEKDAY_SHORT.map((d, i) => (
            <div
              key={d}
              className={`esge-cal-grid__head${i >= 5 ? ' esge-cal-grid__head--weekend' : ''}`}
            >
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            const content = cell.date ? byDate.get(cell.date) : undefined;
            const isToday = cell.date === today;
            const holiday = content?.holiday ?? false;
            const cellClass = [
              'esge-cal-cell',
              cell.date == null ? 'esge-cal-cell--blank' : '',
              holiday ? 'esge-cal-cell--holiday' : cell.weekend ? 'esge-cal-cell--weekend' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div key={i} className={cellClass}>
                {cell.day != null && (
                  <span
                    className={`esge-cal-cell__day${
                      !isToday && (cell.weekend || holiday) ? ' esge-cal-cell__day--muted' : ''
                    }`}
                  >
                    {isToday ? <span className="esge-cal-cell__today">{cell.day}</span> : cell.day}
                  </span>
                )}
                {renderEventChips(content)}
              </div>
            );
          })}
        </div>

        {/* Agenda (sm) */}
        <div className="esge-cal-agenda">
          {agendaDays.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
              Sin eventos este mes.
            </div>
          ) : (
            agendaDays.map((date) => {
              const content = byDate.get(date);
              return (
                <div key={date} className="esge-cal-agenda__day">
                  <span
                    className={`esge-cal-agenda__date${
                      content?.holiday ? ' esge-cal-agenda__date--holiday' : ''
                    }`}
                  >
                    {agendaDayLabel(date)}
                  </span>
                  <div className="esge-cal-agenda__events">{renderEventChips(content, true)}</div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Alert tone="info" title="Efectos del calendario">
        Los días <b>feriados / no lectivos</b> bloquean la asistencia de estudiantes y no computan
        faltas del personal. Los <b>vencimientos de pensiones</b> se derivan del cronograma y enlazan
        con Pensiones.
      </Alert>

      <EventDialog
        open={dialog.open}
        event={dialog.event}
        defaultDate={today}
        onClose={() => setDialog({ open: false, event: null })}
      />
      <EventDetailDialog
        event={detail}
        canEdit={canEdit}
        onClose={() => setDetail(null)}
        onEdit={openEdit}
      />
    </div>
  );
}
