import { type CSSProperties, type TextareaHTMLAttributes, useId } from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

/** Multi-line text field sharing Input's label/hint/error scaffolding. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  containerStyle?: CSSProperties;
}

const CSS = `
.esge-field{ display:flex; flex-direction:column; gap:6px; }
.esge-field__label{ font:var(--type-label); color:var(--text-strong); display:flex; gap:4px; align-items:center; }
.esge-field__req{ color:var(--danger); }
.esge-field__hint{ font:var(--type-caption); color:var(--text-muted); }
.esge-field__hint--error{ color:var(--danger); }
.esge-ta__control{
  width:100%; min-height:96px; resize:vertical; padding:10px 12px;
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-md); color:var(--text-body);
  font-family:var(--font-sans); font-size:var(--text-base); line-height:var(--leading-normal);
  transition:border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-ta__control::placeholder{ color:var(--text-subtle); }
.esge-ta__control:hover{ border-color:var(--border-strong); }
.esge-ta__control:focus{ outline:none; border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-ta__control:disabled{ background:var(--surface-sunken); color:var(--text-subtle); cursor:not-allowed; }
.esge-ta__control--error{ border-color:var(--danger); }
.esge-ta__control--error:focus{ box-shadow:0 0 0 3px var(--danger-soft); }
`;

/** Multi-line text field with the same label/hint/error scaffolding as Input. */
export function Textarea({
  label, hint, error, required = false, rows = 4,
  disabled = false, id, className = '', containerStyle, ...rest
}: TextareaProps) {
  useStyleOnce('esge-textarea-css', CSS);
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={['esge-field', className].filter(Boolean).join(' ')} style={containerStyle}>
      {label && (
        <label className="esge-field__label" htmlFor={fieldId}>
          {label}{required && <span className="esge-field__req" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea id={fieldId} rows={rows} disabled={disabled} aria-invalid={!!error}
        className={['esge-ta__control', error ? 'esge-ta__control--error' : ''].filter(Boolean).join(' ')} {...rest} />
      {(hint || error) && (
        <span className={['esge-field__hint', error ? 'esge-field__hint--error' : ''].filter(Boolean).join(' ')}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
