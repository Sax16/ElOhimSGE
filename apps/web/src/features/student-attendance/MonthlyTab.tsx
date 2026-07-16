// Vista Admin/secretaría — "Mensual": matriz día×estudiante con letras P/T/F/J
// coloreadas, totales y % de asistencia. Exportable a Excel.
// Referencia visual: features/staff/attendance (matriz de personal).
import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icons,
  Input,
  Select,
  useToast,
} from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCan } from '../../lib/useCan';
import { exportMonthly, useMonthly, useMySections } from './api';
import {
  LETTER_CELL,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_TONE,
  currentMonth,
  dayNum,
  isWeekend,
  todayStr,
} from './bits';
import type { StatusLetter } from './types';
import './attendance.css';

export function MonthlyTab() {
  const { toast } = useToast();
  const canExport = useCan('asistencia', 'ver');

  // Para el selector de secciones reutilizamos my-sections del día de hoy.
  const { data: sectionsData } = useMySections(todayStr());
  const sections = useMemo(() => sectionsData?.sections ?? [], [sectionsData]);

  const [sectionId, setSectionId] = useState('');
  const [month, setMonth] = useState(currentMonth());

  const { data, isLoading } = useMonthly(sectionId || undefined, month);
  const days = useMemo(() => data?.days ?? [], [data]);
  const students = useMemo(() => data?.students ?? [], [data]);

  const [exporting, setExporting] = useState(false);
  const onExport = async () => {
    if (!sectionId) return;
    setExporting(true);
    try {
      await exportMonthly(sectionId, month);
      toast('success', 'Asistencia exportada', `${month} · descargada en Excel.`);
    } catch (err) {
      toast('danger', 'No se pudo exportar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  const hasData = sectionId && students.length > 0 && days.length > 0;

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
          label="Mes"
          type="month"
          value={month}
          max={currentMonth()}
          onChange={(e) => setMonth(e.target.value)}
          containerStyle={{ width: 170 }}
        />
        <div style={{ flex: 1 }} />
        {canExport && (
          <Button
            variant="secondary"
            iconLeft={<Icons.Download />}
            disabled={exporting || !hasData}
            onClick={onExport}
          >
            Exportar Excel
          </Button>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {STATUS_ORDER.map((s) => (
          <Badge key={s} tone={STATUS_TONE[s]} dot>
            {STATUS_LABELS[s]}
          </Badge>
        ))}
      </div>

      {!isLoading && sectionId && !hasData ? (
        <Card>
          <EmptyState
            icon={<Icons.Calendar />}
            title="Sin registros este mes"
            description="No hay asistencia tomada para esta sección en el mes elegido."
          />
        </Card>
      ) : !sectionId ? (
        <Card>
          <EmptyState
            icon={<Icons.Calendar />}
            title="Elige una sección"
            description="Selecciona una sección y un mes para ver la matriz de asistencia."
          />
        </Card>
      ) : (
        <Card flush title={data?.section.label ?? 'Sección'} subtitle={`Matriz de asistencia · ${month}`}>
          <div className="esge-sa-matrix-wrap">
            <table className="esge-sa-matrix">
              <thead>
                <tr>
                  <th className="esge-sa-name">Estudiante</th>
                  {days.map((d) => (
                    <th key={d} className={`esge-sa-day${isWeekend(d) ? ' esge-sa-day--weekend' : ''}`}>
                      {dayNum(d)}
                    </th>
                  ))}
                  <th className="esge-sa-day" title="Presente">P</th>
                  <th className="esge-sa-day" title="Tardanza">T</th>
                  <th className="esge-sa-day" title="Falta">F</th>
                  <th className="esge-sa-day" title="Justificada">J</th>
                  <th className="esge-sa-day">% asist.</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => (
                  <tr key={st.studentCode}>
                    <td className="esge-sa-name">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{st.fullName}</span>
                        <span
                          style={{
                            font: 'var(--type-2xs)',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {st.studentCode}
                        </span>
                      </div>
                    </td>
                    {days.map((d) => {
                      const letter = st.byDate[d] as StatusLetter | undefined;
                      const cell = letter ? LETTER_CELL[letter] : null;
                      return (
                        <td
                          key={d}
                          className="esge-sa-cell"
                          style={cell ? { background: cell.bg, color: cell.fg } : undefined}
                        >
                          {letter ?? ''}
                        </td>
                      );
                    })}
                    <td className="esge-sa-total">{st.totals.PRESENTE}</td>
                    <td className="esge-sa-total">{st.totals.TARDANZA}</td>
                    <td className="esge-sa-total">{st.totals.FALTA}</td>
                    <td className="esge-sa-total">{st.totals.JUSTIFICADA}</td>
                    <td className="esge-sa-pct">
                      {st.pct == null ? '—' : `${st.pct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
