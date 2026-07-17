// Selectores compactos de nota literal para la tabla de registro:
//  - NotaSelect: AD/A/B/C/— con borde y fondo por letra (competencias y aspectos).
//  - LogroSelect: además la opción "Auto" (logro automático), con punto distintivo
//    cuando el valor viene calculado y no ajustado a mano.
import { GRADE_LETTERS, GRADE_LETTER_COLOR } from './bits';
import type { GradeLetter } from './types';

const EMPTY = '—';

/** Convierte el value del <select> a letra o null. */
function parse(value: string): GradeLetter | null {
  return value === EMPTY || value === '' ? null : (value as GradeLetter);
}

export interface NotaSelectProps {
  value: GradeLetter | null;
  onChange: (value: GradeLetter | null) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

/** Select AD/A/B/C con "—" para sin nota; el borde toma el color de la letra. */
export function NotaSelect({ value, onChange, disabled = false, ariaLabel }: NotaSelectProps) {
  const border = value ? GRADE_LETTER_COLOR[value] : 'var(--border-default)';
  return (
    <select
      className="esge-nota-select"
      value={value ?? EMPTY}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(parse(e.target.value))}
      style={{ borderColor: border, color: value ? 'var(--text-strong)' : 'var(--text-subtle)' }}
    >
      <option value={EMPTY}>{EMPTY}</option>
      {GRADE_LETTERS.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  );
}

export interface LogroSelectProps {
  /** Ajuste manual del docente; null = automático. */
  manual: GradeLetter | null;
  /** Logro calculado en vivo desde las competencias. */
  autoLetter: GradeLetter | null;
  onChange: (manual: GradeLetter | null) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const AUTO = '__auto__';

/**
 * Logro del bimestre como select. En automático muestra el punto azul y el value
 * "Auto"; al elegir una letra pasa a ajustado. "Auto · {letra}" vuelve al cálculo.
 */
export function LogroSelect({ manual, autoLetter, onChange, disabled = false, ariaLabel }: LogroSelectProps) {
  const isAuto = manual == null;
  const effective = manual ?? autoLetter;
  const border = effective ? GRADE_LETTER_COLOR[effective] : 'var(--border-default)';

  return (
    <span className="esge-logro">
      <span
        className="esge-logro__dot"
        data-auto={isAuto ? 'true' : 'false'}
        title={isAuto ? 'Automático' : 'Ajustado a mano'}
        aria-hidden="true"
      />
      <select
        className="esge-nota-select esge-logro__select"
        value={isAuto ? AUTO : (manual as string)}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value === AUTO ? null : (e.target.value as GradeLetter))}
        style={{ borderColor: border, color: effective ? 'var(--text-strong)' : 'var(--text-subtle)' }}
      >
        <option value={AUTO}>{autoLetter ? `Auto · ${autoLetter}` : 'Auto · —'}</option>
        {GRADE_LETTERS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </span>
  );
}
