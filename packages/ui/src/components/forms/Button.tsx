import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Primary action control. Blue `primary` for the main action on a view, gold
 * `accent` for a single hero/positive action, `secondary` for neutral actions,
 * `ghost` for low-emphasis, `danger` for destructive, `link` for inline text.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: ButtonVariant;
  /** Control height. @default "md" */
  size?: ButtonSize;
  /** Stretch to full container width. */
  block?: boolean;
  /** Icon node rendered before the label. */
  iconLeft?: ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: ReactNode;
}

const CSS = `
.esge-btn{
  --_h:38px; --_px:16px; --_fs:var(--text-base); --_gap:8px;
  display:inline-flex; align-items:center; justify-content:center; gap:var(--_gap);
  height:var(--_h); padding:0 var(--_px); font-family:var(--font-sans);
  font-size:var(--_fs); font-weight:var(--weight-semibold); line-height:1;
  border-radius:var(--radius-md); border:1px solid transparent; cursor:pointer;
  white-space:nowrap; user-select:none; text-decoration:none;
  transition:background var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}
.esge-btn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.esge-btn:active{ transform:translateY(0.5px); }
.esge-btn[disabled],.esge-btn[aria-disabled="true"]{ opacity:.5; cursor:not-allowed; transform:none; }
.esge-btn--block{ width:100%; }

/* sizes */
.esge-btn--sm{ --_h:32px; --_px:12px; --_fs:var(--text-sm); --_gap:6px; }
.esge-btn--lg{ --_h:46px; --_px:22px; --_fs:var(--text-md); --_gap:10px; }

/* variants */
.esge-btn--primary{ background:var(--brand); color:var(--brand-fg); box-shadow:var(--shadow-xs); }
.esge-btn--primary:hover{ background:var(--brand-hover); }
.esge-btn--primary:active{ background:var(--brand-active); }

.esge-btn--accent{ background:var(--accent); color:var(--accent-fg); box-shadow:var(--shadow-xs); }
.esge-btn--accent:hover{ background:var(--accent-hover); }
.esge-btn--accent:active{ background:var(--accent-active); }

.esge-btn--secondary{ background:var(--surface-card); color:var(--text-body); border-color:var(--border-default); box-shadow:var(--shadow-xs); }
.esge-btn--secondary:hover{ background:var(--surface-hover); border-color:var(--border-strong); }
.esge-btn--secondary:active{ background:var(--surface-active); }

.esge-btn--ghost{ background:transparent; color:var(--text-body); }
.esge-btn--ghost:hover{ background:var(--surface-hover); }
.esge-btn--ghost:active{ background:var(--surface-active); }

.esge-btn--danger{ background:var(--danger); color:var(--danger-fg); box-shadow:var(--shadow-xs); }
.esge-btn--danger:hover{ filter:brightness(0.94); }

.esge-btn--link{ background:transparent; color:var(--text-link); height:auto; padding:0; border-radius:var(--radius-xs); }
.esge-btn--link:hover{ text-decoration:underline; }
`;

/**
 * Primary action control for Elohim SGE.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  iconLeft = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  useStyleOnce('esge-button-css', CSS);
  const cls = [
    'esge-btn',
    `esge-btn--${variant}`,
    size !== 'md' ? `esge-btn--${size}` : '',
    block ? 'esge-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {iconLeft && <span className="esge-btn__icon" aria-hidden="true" style={{ display: 'inline-flex' }}>{iconLeft}</span>}
      {children && <span>{children}</span>}
      {iconRight && <span className="esge-btn__icon" aria-hidden="true" style={{ display: 'inline-flex' }}>{iconRight}</span>}
    </button>
  );
}
