import { type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

/** On/off toggle for instant-apply settings. */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: ReactNode;
  size?: 'sm' | 'md';
}

const CSS = `
.esge-switch{ display:inline-flex; align-items:center; gap:10px; cursor:pointer; font:var(--type-body); color:var(--text-body); }
.esge-switch--disabled{ cursor:not-allowed; opacity:.55; }
.esge-switch__track{
  position:relative; flex-shrink:0; width:40px; height:22px; border-radius:var(--radius-pill);
  background:var(--neutral-300); transition:background var(--duration-normal) var(--ease-standard);
}
[data-theme="dark"] .esge-switch__track{ background:var(--neutral-700); }
.esge-switch__native{ position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:inherit; }
.esge-switch__thumb{
  position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:var(--radius-full);
  background:#fff; box-shadow:var(--shadow-sm); transition:transform var(--duration-normal) var(--ease-out);
}
.esge-switch__native:checked + .esge-switch__track{ background:var(--brand); }
.esge-switch__native:checked + .esge-switch__track .esge-switch__thumb{ transform:translateX(18px); }
.esge-switch__native:focus-visible + .esge-switch__track{ box-shadow:var(--shadow-focus); }
.esge-switch--sm .esge-switch__track{ width:34px; height:19px; }
.esge-switch--sm .esge-switch__thumb{ width:13px; height:13px; }
.esge-switch--sm .esge-switch__native:checked + .esge-switch__track .esge-switch__thumb{ transform:translateX(15px); }
`;

/** On/off toggle for settings and instant-apply preferences. */
export function Switch({ label, size = 'md', disabled = false, id, className = '', children, ...rest }: SwitchProps) {
  useStyleOnce('esge-switch-css', CSS);
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <label className={['esge-switch', size === 'sm' ? 'esge-switch--sm' : '', disabled ? 'esge-switch--disabled' : '', className].filter(Boolean).join(' ')} htmlFor={fieldId}>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <input id={fieldId} type="checkbox" role="switch" className="esge-switch__native" disabled={disabled} {...rest} />
        <span className="esge-switch__track"><span className="esge-switch__thumb" /></span>
      </span>
      {(label || children) && <span>{label || children}</span>}
    </label>
  );
}
