import type * as React from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

const CSS = `
@keyframes esge-toast-in{ from{ opacity:0; transform:translateY(8px) scale(.98); } to{ opacity:1; transform:none; } }
.esge-toaststack{ position:fixed; z-index:var(--z-toast); display:flex; flex-direction:column; gap:10px; pointer-events:none; padding:16px; }
.esge-toaststack--top-right{ top:0; right:0; align-items:flex-end; }
.esge-toaststack--bottom-right{ bottom:0; right:0; align-items:flex-end; }
.esge-toaststack--bottom-left{ bottom:0; left:0; align-items:flex-start; }
.esge-toaststack--top-center{ top:0; left:50%; transform:translateX(-50%); align-items:center; }
.esge-toast{
  pointer-events:auto; display:flex; gap:11px; align-items:flex-start; width:340px; max-width:88vw;
  background:var(--surface-raised); border:1px solid var(--border-subtle); border-radius:var(--radius-md);
  box-shadow:var(--shadow-lg); padding:13px 14px; animation:esge-toast-in var(--duration-normal) var(--ease-out);
}
.esge-toast__bar{ position:absolute; }
.esge-toast__accent{ width:3px; align-self:stretch; border-radius:3px; flex-shrink:0; }
.esge-toast__accent--info{ background:var(--info); }
.esge-toast__accent--success{ background:var(--success); }
.esge-toast__accent--warning{ background:var(--warning); }
.esge-toast__accent--danger{ background:var(--danger); }
.esge-toast__icon{ flex-shrink:0; width:20px; height:20px; margin-top:1px; }
.esge-toast__icon--info{ color:var(--info); }
.esge-toast__icon--success{ color:var(--success); }
.esge-toast__icon--warning{ color:var(--warning); }
.esge-toast__icon--danger{ color:var(--danger); }
.esge-toast__icon svg{ width:20px; height:20px; }
.esge-toast__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.esge-toast__title{ font:var(--type-label); font-weight:var(--weight-semibold); color:var(--text-strong); }
.esge-toast__msg{ font:var(--type-caption); color:var(--text-muted); }
.esge-toast__close{ background:transparent; border:none; cursor:pointer; color:var(--text-subtle); padding:2px; border-radius:var(--radius-xs); }
.esge-toast__close:hover{ color:var(--text-body); background:var(--surface-hover); }
.esge-toast__close svg{ width:15px; height:15px; }
`;

type ToastTone = 'info' | 'success' | 'warning' | 'danger';

const ICONS: Record<ToastTone, React.ReactNode> = {
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  success: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  danger: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
};

/** Single toast notification (presentational — manage lifecycle in your app). */
export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** @default "info" */
  tone?: ToastTone;
  title?: React.ReactNode;
  message?: React.ReactNode;
  onClose?: () => void;
}

/** Fixed corner container that stacks Toasts. */
export interface ToastStackProps {
  /** @default "bottom-right" */
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-center';
  className?: string;
  children?: React.ReactNode;
}

/** Single toast notification (presentational). */
export function Toast({ tone = 'info', title, message, onClose, className = '', ...rest }: ToastProps) {
  useStyleOnce('esge-toast-css', CSS);
  return (
    <div className={['esge-toast', className].filter(Boolean).join(' ')} role="status" {...rest}>
      <span className={`esge-toast__accent esge-toast__accent--${tone}`} />
      <span className={`esge-toast__icon esge-toast__icon--${tone}`} aria-hidden="true">{ICONS[tone]}</span>
      <div className="esge-toast__body">
        {title && <div className="esge-toast__title">{title}</div>}
        {message && <div className="esge-toast__msg">{message}</div>}
      </div>
      {onClose && (
        <button type="button" className="esge-toast__close" aria-label="Cerrar" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
      )}
    </div>
  );
}

/** Fixed container that stacks Toasts in a screen corner. */
export function ToastStack({ position = 'bottom-right', className = '', children }: ToastStackProps) {
  useStyleOnce('esge-toast-css', CSS);
  return (
    <div className={['esge-toaststack', `esge-toaststack--${position}`, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
