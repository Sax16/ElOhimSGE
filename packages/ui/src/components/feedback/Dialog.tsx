import * as React from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

const CSS = `
@keyframes esge-overlay-in{ from{ opacity:0; } to{ opacity:1; } }
@keyframes esge-dialog-in{ from{ opacity:0; transform:translateY(12px) scale(.98); } to{ opacity:1; transform:none; } }
.esge-overlay{
  position:fixed; inset:0; z-index:var(--z-modal); display:flex; align-items:center; justify-content:center;
  padding:24px; background:rgba(15,34,52,0.55); backdrop-filter:blur(2px);
  animation:esge-overlay-in var(--duration-fast) var(--ease-standard);
}
.esge-dialog{
  background:var(--surface-raised); border:1px solid var(--border-subtle); border-radius:var(--radius-xl);
  box-shadow:var(--shadow-xl); width:100%; max-width:480px; max-height:calc(100vh - 48px);
  display:flex; flex-direction:column; overflow:hidden; animation:esge-dialog-in var(--duration-normal) var(--ease-out);
}
.esge-dialog--sm{ max-width:380px; }
.esge-dialog--lg{ max-width:640px; }
.esge-dialog--xl{ max-width:840px; }
.esge-dialog__header{ display:flex; align-items:flex-start; gap:12px; padding:18px 20px 14px; }
.esge-dialog__icon{ flex-shrink:0; width:38px; height:38px; border-radius:var(--radius-md); display:inline-flex; align-items:center; justify-content:center; background:var(--surface-brand-soft); color:var(--brand); }
.esge-dialog__icon--danger{ background:var(--danger-soft); color:var(--danger); }
.esge-dialog__icon--warning{ background:var(--warning-soft); color:var(--warning); }
.esge-dialog__icon--success{ background:var(--success-soft); color:var(--success); }
.esge-dialog__icon svg{ width:20px; height:20px; }
.esge-dialog__titles{ flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.esge-dialog__title{ font:var(--type-h3); color:var(--text-strong); }
.esge-dialog__desc{ font:var(--type-caption); color:var(--text-muted); }
.esge-dialog__close{ flex-shrink:0; background:transparent; border:none; cursor:pointer; color:var(--text-muted); padding:4px; border-radius:var(--radius-sm); margin:-2px -4px 0 0; }
.esge-dialog__close:hover{ color:var(--text-body); background:var(--surface-hover); }
.esge-dialog__close svg{ width:18px; height:18px; }
.esge-dialog__body{ padding:0 20px 16px; overflow-y:auto; font:var(--type-body); color:var(--text-body); }
.esge-dialog__body--padtop{ padding-top:4px; }
.esge-dialog__footer{ display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:14px 20px; border-top:1px solid var(--border-subtle); background:var(--surface-sunken); }
`;

/** Modal dialog with optional icon, header, scrollable body and footer actions. */
export interface DialogProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Icon chip shown left of the title. */
  icon?: React.ReactNode;
  iconTone?: 'brand' | 'danger' | 'warning' | 'success';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Footer node — usually the action Buttons. */
  footer?: React.ReactNode;
  /** Close when the backdrop is clicked. @default true */
  closeOnOverlay?: boolean;
  showClose?: boolean;
}

/** Modal dialog. Controlled via `open`; close on overlay click / Esc / ✕. */
export function Dialog({
  open, onClose, title, description, icon, iconTone = 'brand',
  size = 'md', footer, closeOnOverlay = true, showClose = true,
  className = '', children, ...rest
}: DialogProps) {
  useStyleOnce('esge-dialog-css', CSS);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="esge-overlay" onMouseDown={(e) => { if (closeOnOverlay && e.target === e.currentTarget && onClose) onClose(); }}>
      <div role="dialog" aria-modal="true" className={['esge-dialog', `esge-dialog--${size}`, className].filter(Boolean).join(' ')} {...rest}>
        {(title || icon || showClose) && (
          <div className="esge-dialog__header">
            {icon && <span className={`esge-dialog__icon esge-dialog__icon--${iconTone}`}>{icon}</span>}
            <div className="esge-dialog__titles">
              {title && <div className="esge-dialog__title">{title}</div>}
              {description && <div className="esge-dialog__desc">{description}</div>}
            </div>
            {showClose && onClose && (
              <button type="button" className="esge-dialog__close" aria-label="Cerrar" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </button>
            )}
          </div>
        )}
        {children && <div className={['esge-dialog__body', !(title||icon) ? 'esge-dialog__body--padtop' : ''].filter(Boolean).join(' ')}>{children}</div>}
        {footer && <div className="esge-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}
