// "Mi horario" del portal docente (post-R4): vista de solo lectura de las clases
// de la semana (GET /schedule/my-week), agrupadas por día L–V y resaltando hoy.
import { useMemo } from 'react';
import { Card, EmptyState, Icons } from '@elohim/ui';
import { useMyWeek } from './api';
import { DAYS, DAY_LABELS_LONG, timeRange } from './bits';
import type { MyWeekItem } from './types';
import './schedule.css';

/** dayOfWeek de hoy en base lunes (1..7); 0 fuera de rango escolar. */
function todayDow(): number {
  const d = new Date().getDay(); // 0=Dom..6=Sáb
  return d === 0 ? 7 : d;
}

export function MyWeekCard() {
  const { data, isLoading } = useMyWeek();
  const items = useMemo(() => data?.items ?? [], [data]);

  const byDay = useMemo(() => {
    const map = new Map<number, MyWeekItem[]>();
    for (const d of DAYS) map.set(d, []);
    for (const it of items) map.get(it.dayOfWeek)?.push(it);
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [items]);

  const today = todayDow();

  if (!isLoading && items.length === 0) {
    return (
      <Card flush title="Mi horario" subtitle="Tus clases de la semana">
        <div style={{ padding: 18 }}>
          <EmptyState
            icon={<Icons.Clock />}
            title="Aún no tienes horario"
            description="Administración aún no programa tu horario. Aparecerá aquí en cuanto lo haga."
          />
        </div>
      </Card>
    );
  }

  return (
    <Card flush title="Mi horario" subtitle="Tus clases de la semana · el día de hoy va resaltado">
      <div style={{ padding: 16 }}>
        <div className="esge-myweek">
          {DAYS.map((day) => {
            const list = byDay.get(day) ?? [];
            const isToday = day === today;
            return (
              <div
                key={day}
                className={`esge-myweek__day${isToday ? ' esge-myweek__day--today' : ''}`}
              >
                <div className="esge-myweek__dayhead">{DAY_LABELS_LONG[day - 1]}</div>
                {list.length === 0 ? (
                  <div className="esge-myweek__empty">Sin clases</div>
                ) : (
                  list.map((it, i) => (
                    <div key={`${it.startTime}-${i}`} className="esge-myweek__item">
                      <div className="esge-myweek__time">{timeRange(it.startTime, it.endTime)}</div>
                      <div className="esge-myweek__course">{it.courseName}</div>
                      <div className="esge-myweek__section">{it.sectionLabel}</div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
