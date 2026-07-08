import { type ChangeEvent, type CSSProperties, type SelectHTMLAttributes, useId, useState } from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

export type SelectOption = string | { value: string; label: string };

/** Labeled native `<select>` with field scaffolding, placeholder and options. */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Disabled placeholder option shown first. */
  placeholder?: string;
  /** Options as strings or {value,label}. Or pass <option> children. */
  options?: SelectOption[];
  containerStyle?: CSSProperties;
}

const CSS = `
.esge-field{ display:flex; flex-direction:column; gap:6px; }
.esge-field__label{ font:var(--type-label); color:var(--text-strong); display:flex; gap:4px; align-items:center; }
.esge-field__req{ color:var(--danger); }
.esge-field__hint{ font:var(--type-caption); color:var(--text-muted); }
.esge-field__hint--error{ color:var(--danger); }

.esge-select{ position:relative; display:flex; align-items:center; }
.esge-select__control{
  --_h:38px;
  width:100%; height:var(--_h); padding:0 38px 0 12px; appearance:none;
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-md); color:var(--text-body);
  font-family:var(--font-sans); font-size:var(--text-base); cursor:pointer;
  transition:border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-select__control:hover{ border-color:var(--border-strong); }
.esge-select__control:focus{ outline:none; border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-select__control:disabled{ background:var(--surface-sunken); color:var(--text-subtle); cursor:not-allowed; }
.esge-select__control--placeholder{ color:var(--text-subtle); }
.esge-select--sm .esge-select__control{ --_h:32px; font-size:var(--text-sm); }
.esge-select--lg .esge-select__control{ --_h:46px; }
.esge-select--error .esge-select__control{ border-color:var(--danger); }
.esge-select__chevron{
  position:absolute; right:12px; pointer-events:none; color:var(--text-muted);
  display:inline-flex; width:16px; height:16px;
}
`;

const Chevron = () => (
  <svg className="esge-select__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
);

/** Labeled native select wrapped with the shared field scaffolding. */
export function Select({
  label, hint, error, required = false, size = 'md',
  placeholder, options = [], value, disabled = false,
  id, className = '', containerStyle, children, ...rest
}: SelectProps) {
  useStyleOnce('esge-select-css', CSS);
  const autoId = useId();
  const fieldId = id || autoId;
  const { defaultValue, onChange, ...restAttrs } = rest;
  const uncontrolled = value === undefined;
  // In uncontrolled mode, track the current value so the placeholder shows
  // initially (defaultValue "") and gray styling clears on real selection.
  const [innerValue, setInnerValue] = useState(defaultValue !== undefined ? defaultValue : (placeholder ? '' : undefined));
  const currentValue = uncontrolled ? innerValue : value;
  const isPlaceholder = (currentValue === '' || currentValue == null) && placeholder;
  const selectProps = uncontrolled
    ? { defaultValue: defaultValue !== undefined ? defaultValue : (placeholder ? '' : undefined),
        onChange: (e: ChangeEvent<HTMLSelectElement>) => { setInnerValue(e.target.value); if (onChange) onChange(e); } }
    : { value, onChange };
  return (
    <div className={['esge-field', className].filter(Boolean).join(' ')} style={containerStyle}>
      {label && (
        <label className="esge-field__label" htmlFor={fieldId}>
          {label}{required && <span className="esge-field__req" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={['esge-select', size !== 'md' ? `esge-select--${size}` : '', error ? 'esge-select--error' : ''].filter(Boolean).join(' ')}>
        <select id={fieldId} disabled={disabled} aria-invalid={!!error} {...selectProps}
          className={['esge-select__control', isPlaceholder ? 'esge-select__control--placeholder' : ''].filter(Boolean).join(' ')} {...restAttrs}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) =>
            typeof o === 'object'
              ? <option key={o.value} value={o.value}>{o.label}</option>
              : <option key={o} value={o}>{o}</option>
          )}
          {children}
        </select>
        <Chevron />
      </div>
      {(hint || error) && (
        <span className={['esge-field__hint', error ? 'esge-field__hint--error' : ''].filter(Boolean).join(' ')}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
