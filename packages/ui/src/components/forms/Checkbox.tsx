import { type InputHTMLAttributes, type ReactNode, useEffect, useId, useRef } from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

/** Checkbox with label, optional description and indeterminate state. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  indeterminate?: boolean;
}

const CSS = `
.esge-check{ display:inline-flex; align-items:flex-start; gap:10px; cursor:pointer; font:var(--type-body); color:var(--text-body); }
.esge-check--disabled{ cursor:not-allowed; opacity:.55; }
.esge-check__box{
  position:relative; flex-shrink:0; width:18px; height:18px; margin-top:1px;
  border:1.5px solid var(--border-strong); border-radius:var(--radius-xs);
  background:var(--surface-card); display:inline-flex; align-items:center; justify-content:center;
  transition:background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-check__native{ position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:inherit; }
.esge-check__tick{ width:12px; height:12px; color:#fff; opacity:0; transform:scale(.6); transition:opacity var(--duration-fast), transform var(--duration-fast) var(--ease-out); }
.esge-check__native:checked ~ .esge-check__tick:not(.esge-check__tick--dash){ opacity:1; transform:scale(1); }
.esge-check__native:indeterminate ~ .esge-check__tick--dash{ opacity:1; transform:scale(1); }
.esge-check__box:has(.esge-check__native:checked),
.esge-check__box:has(.esge-check__native:indeterminate){ background:var(--brand); border-color:var(--brand); }
.esge-check__box:has(.esge-check__native:focus-visible){ box-shadow:var(--shadow-focus); }
.esge-check:hover .esge-check__box:has(.esge-check__native:not(:disabled)){ border-color:var(--brand); }
.esge-check__body{ display:flex; flex-direction:column; gap:2px; }
.esge-check__desc{ font:var(--type-caption); color:var(--text-muted); }
`;

/** Checkbox with label and optional description; supports indeterminate. */
export function Checkbox({
  label, description, checked, indeterminate = false, disabled = false,
  id, className = '', children, ...rest
}: CheckboxProps) {
  useStyleOnce('esge-checkbox-css', CSS);
  const ref = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const fieldId = id || autoId;
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <label className={['esge-check', disabled ? 'esge-check--disabled' : '', className].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <span className="esge-check__box">
        <input ref={ref} id={fieldId} type="checkbox" className="esge-check__native"
          checked={checked} disabled={disabled} {...rest} />
        <svg className="esge-check__tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
        <svg className="esge-check__tick esge-check__tick--dash" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true" style={{position:'absolute'}}><line x1="6" y1="12" x2="18" y2="12" /></svg>
      </span>
      {(label || description || children) && (
        <span className="esge-check__body">
          {(label || children) && <span>{label || children}</span>}
          {description && <span className="esge-check__desc">{description}</span>}
        </span>
      )}
    </label>
  );
}
