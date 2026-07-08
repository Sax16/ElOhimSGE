import { type CSSProperties, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

export type InputSize = 'sm' | 'md' | 'lg';

/**
 * Labeled text input with hint, error, icon and prefix/suffix affixes.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  /** Field label rendered above the control. */
  label?: string;
  /** Helper text shown below when there is no error. */
  hint?: string;
  /** Error message; turns the control red and overrides hint. */
  error?: string;
  /** Mark the field as required (shows a red asterisk). */
  required?: boolean;
  /** @default "md" */
  size?: InputSize;
  /** Icon node rendered inside, before the text. */
  iconLeft?: ReactNode;
  /** Static text prefix (e.g. "S/."). */
  prefix?: ReactNode;
  /** Static text suffix (e.g. "kg", "%"). */
  suffix?: ReactNode;
  /** Style applied to the outer field wrapper. */
  containerStyle?: CSSProperties;
}

const CSS = `
.esge-field{ display:flex; flex-direction:column; gap:6px; }
.esge-field__label{ font:var(--type-label); color:var(--text-strong); display:flex; gap:4px; align-items:center; }
.esge-field__req{ color:var(--danger); }
.esge-field__hint{ font:var(--type-caption); color:var(--text-muted); }
.esge-field__hint--error{ color:var(--danger); }

.esge-input{
  --_h:38px;
  display:flex; align-items:center; gap:8px;
  height:var(--_h); padding:0 12px; background:var(--surface-card);
  border:1px solid var(--border-default); border-radius:var(--radius-md);
  color:var(--text-body); transition:border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard);
}
.esge-input:hover{ border-color:var(--border-strong); }
.esge-input:focus-within{ border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-input--sm{ --_h:32px; padding:0 10px; font-size:var(--text-sm); }
.esge-input--lg{ --_h:46px; padding:0 14px; }
.esge-input--error{ border-color:var(--danger); }
.esge-input--error:focus-within{ box-shadow:0 0 0 3px var(--danger-soft); }
.esge-input--disabled{ background:var(--surface-sunken); color:var(--text-subtle); cursor:not-allowed; }

.esge-input__control{
  flex:1; min-width:0; border:none; outline:none; background:transparent;
  font-family:var(--font-sans); font-size:var(--text-base); color:inherit; height:100%;
}
.esge-input__control::placeholder{ color:var(--text-subtle); }
.esge-input__control:disabled{ cursor:not-allowed; }
.esge-input__affix{ display:inline-flex; align-items:center; color:var(--text-muted); flex-shrink:0; }
.esge-input__affix svg{ width:18px; height:18px; display:block; }
.esge-input__affix--text{ font:var(--type-mono); color:var(--text-muted); }
`;

/** Labeled text input with optional icon/prefix, hint and error states. */
export function Input({
  label, hint, error, required = false,
  size = 'md', iconLeft = null, prefix = null, suffix = null,
  disabled = false, id, className = '', containerStyle, ...rest
}: InputProps) {
  useStyleOnce('esge-input-css', CSS);
  const autoId = useId();
  const fieldId = id || autoId;
  const wrapCls = [
    'esge-input',
    size !== 'md' ? `esge-input--${size}` : '',
    error ? 'esge-input--error' : '',
    disabled ? 'esge-input--disabled' : '',
  ].filter(Boolean).join(' ');
  return (
    <div className={['esge-field', className].filter(Boolean).join(' ')} style={containerStyle}>
      {label && (
        <label className="esge-field__label" htmlFor={fieldId}>
          {label}{required && <span className="esge-field__req" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={wrapCls}>
        {iconLeft && <span className="esge-input__affix" aria-hidden="true">{iconLeft}</span>}
        {prefix && <span className="esge-input__affix esge-input__affix--text">{prefix}</span>}
        <input id={fieldId} className="esge-input__control" disabled={disabled}
          aria-invalid={!!error} {...rest} />
        {suffix && <span className="esge-input__affix esge-input__affix--text">{suffix}</span>}
      </div>
      {(hint || error) && (
        <span className={['esge-field__hint', error ? 'esge-field__hint--error' : ''].filter(Boolean).join(' ')}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
