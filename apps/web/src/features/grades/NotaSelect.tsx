// Selector compacto de nota literal para la tabla de registro:
//  - NotaSelect: AD/A/B/C/— con borde y fondo por letra (competencias y aspectos).
// El "Logro del bimestre" no tiene selector: es siempre automático (regla de
// negocio, jul 2026) y se muestra como Badge de solo lectura.
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

