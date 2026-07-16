// Grupo de botones circulares P/T/F/J para marcar el estado de un alumno.
// Compartido por la toma diaria (portal docente) y la tabla de la vista Admin.
import { STATUS_COLOR, STATUS_LABELS, STATUS_LETTER, STATUS_ORDER } from './bits';
import type { StudentAttendanceStatus } from './types';

export interface MarkButtonsProps {
  value: StudentAttendanceStatus;
  editable: boolean;
  onChange: (status: StudentAttendanceStatus) => void;
  /** Etiqueta descriptiva para accesibilidad (nombre del alumno). */
  labelFor?: string;
}

export function MarkButtons({ value, editable, onChange, labelFor }: MarkButtonsProps) {
  return (
    <div className="esge-sa-marks">
      {STATUS_ORDER.map((s) => {
        const on = value === s;
        return (
          <button
            key={s}
            type="button"
            className="esge-sa-mark"
            title={STATUS_LABELS[s]}
            aria-label={labelFor ? `${STATUS_LABELS[s]} — ${labelFor}` : STATUS_LABELS[s]}
            aria-pressed={on}
            disabled={!editable}
            onClick={() => editable && onChange(s)}
            style={
              on
                ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s], color: '#fff' }
                : undefined
            }
          >
            {STATUS_LETTER[s]}
          </button>
        );
      })}
    </div>
  );
}
