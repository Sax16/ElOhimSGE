import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-alert{
  display:flex; gap:12px; padding:14px 16px; border-radius:var(--radius-md);
  border:1px solid transparent; background:var(--surface-card); position:relative;
}
.esge-alert__icon{ flex-shrink:0; width:20px; height:20px; margin-top:1px; }
.esge-alert__icon svg{ width:20px; height:20px; }
.esge-alert__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.esge-alert__title{ font:var(--type-label); font-weight:var(--weight-semibold); color:var(--text-strong); }
.esge-alert__msg{ font:var(--type-body); color:var(--text-body); }
.esge-alert__msg p{ margin:0; }
.esge-alert__actions{ display:flex; gap:8px; margin-top:8px; }
.esge-alert__close{ flex-shrink:0; background:transparent; border:none; cursor:pointer; color:var(--text-muted); padding:2px; border-radius:var(--radius-xs); display:inline-flex; height:fit-content; }
.esge-alert__close:hover{ color:var(--text-body); background:var(--surface-hover); }
.esge-alert__close svg{ width:16px; height:16px; }

.esge-alert--info{ background:var(--info-soft); border-color:color-mix(in srgb, var(--info) 28%, transparent); }
.esge-alert--info .esge-alert__icon{ color:var(--info); }
.esge-alert--success{ background:var(--success-soft); border-color:color-mix(in srgb, var(--success) 28%, transparent); }
.esge-alert--success .esge-alert__icon{ color:var(--success); }
.esge-alert--warning{ background:var(--warning-soft); border-color:color-mix(in srgb, var(--warning) 32%, transparent); }
.esge-alert--warning .esge-alert__icon{ color:var(--warning); }
.esge-alert--danger{ background:var(--danger-soft); border-color:color-mix(in srgb, var(--danger) 28%, transparent); }
.esge-alert--danger .esge-alert__icon{ color:var(--danger); }
`;

const ICONS = {
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  success: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  warning: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  danger: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
};

/** Inline contextual message banner. */
export function Alert({ tone = "info", title, icon, onClose, actions, className = "", children, ...rest }) {
  useStyleOnce("esge-alert-css", CSS);
  return (
    <div role="alert" className={["esge-alert", `esge-alert--${tone}`, className].filter(Boolean).join(" ")} {...rest}>
      <span className="esge-alert__icon" aria-hidden="true">{icon || ICONS[tone]}</span>
      <div className="esge-alert__body">
        {title && <div className="esge-alert__title">{title}</div>}
        {children && <div className="esge-alert__msg">{children}</div>}
        {actions && <div className="esge-alert__actions">{actions}</div>}
      </div>
      {onClose && (
        <button type="button" className="esge-alert__close" aria-label="Cerrar" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
      )}
    </div>
  );
}
