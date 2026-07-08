import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-stat{
  position:relative; background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); padding:18px 20px; box-shadow:var(--shadow-sm);
  display:flex; flex-direction:column; gap:10px; min-width:0;
}
.esge-stat__top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.esge-stat__label{ font:var(--type-caption); text-transform:uppercase; letter-spacing:var(--tracking-caps); font-weight:var(--weight-semibold); color:var(--text-muted); }
.esge-stat__icon{
  display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px;
  border-radius:var(--radius-md); background:var(--surface-brand-soft); color:var(--brand); flex-shrink:0;
}
.esge-stat__icon svg{ width:20px; height:20px; }
.esge-stat__icon--accent{ background:var(--surface-accent-soft); color:var(--gold-600); }
.esge-stat__icon--success{ background:var(--success-soft); color:var(--success); }
.esge-stat__icon--danger{ background:var(--danger-soft); color:var(--danger); }
.esge-stat__value{ font-family:var(--font-sans); font-weight:var(--weight-bold); font-size:var(--text-3xl); color:var(--text-strong); line-height:1; letter-spacing:var(--tracking-tight); font-variant-numeric:tabular-nums; }
.esge-stat__foot{ display:flex; align-items:center; gap:8px; font:var(--type-caption); color:var(--text-muted); }
.esge-stat__delta{ display:inline-flex; align-items:center; gap:3px; font-weight:var(--weight-semibold); }
.esge-stat__delta--up{ color:var(--success); }
.esge-stat__delta--down{ color:var(--danger); }
.esge-stat__delta svg{ width:13px; height:13px; }
`;

const ArrowUp = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>;
const ArrowDown = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;

/** Dashboard KPI tile: label, big figure, optional trend delta and icon. */
export function StatCard({
  label, value, icon, iconTone = "brand", delta, deltaDirection, caption,
  className = "", ...rest
}) {
  useStyleOnce("esge-stat-css", CSS);
  const dir = deltaDirection || (typeof delta === "number" ? (delta >= 0 ? "up" : "down") : null);
  return (
    <div className={["esge-stat", className].filter(Boolean).join(" ")} {...rest}>
      <div className="esge-stat__top">
        <span className="esge-stat__label">{label}</span>
        {icon && <span className={`esge-stat__icon esge-stat__icon--${iconTone}`}>{icon}</span>}
      </div>
      <div className="esge-stat__value">{value}</div>
      {(delta != null || caption) && (
        <div className="esge-stat__foot">
          {delta != null && (
            <span className={`esge-stat__delta esge-stat__delta--${dir}`}>
              {dir === "up" ? <ArrowUp/> : <ArrowDown/>}
              {typeof delta === "number" ? `${Math.abs(delta)}%` : delta}
            </span>
          )}
          {caption && <span>{caption}</span>}
        </div>
      )}
    </div>
  );
}
