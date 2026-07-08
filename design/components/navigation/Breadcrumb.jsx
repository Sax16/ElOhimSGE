import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-crumbs{ display:flex; align-items:center; flex-wrap:wrap; gap:4px; font:var(--type-label); }
.esge-crumbs__item{ color:var(--text-muted); text-decoration:none; display:inline-flex; align-items:center; gap:5px; padding:2px 4px; border-radius:var(--radius-xs); transition:color var(--duration-fast); }
.esge-crumbs__item:hover{ color:var(--text-body); text-decoration:none; }
.esge-crumbs__item--current{ color:var(--text-strong); font-weight:var(--weight-semibold); pointer-events:none; }
.esge-crumbs__sep{ color:var(--text-subtle); display:inline-flex; }
.esge-crumbs__sep svg{ width:14px; height:14px; }
.esge-crumbs__item svg{ width:15px; height:15px; }
`;

const Chevron = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

/** Breadcrumb trail. `items`: [{ label, href?, icon? }]; last is current. */
export function Breadcrumb({ items = [], className = "", ...rest }) {
  useStyleOnce("esge-crumbs-css", CSS);
  return (
    <nav className={["esge-crumbs", className].filter(Boolean).join(" ")} aria-label="Ruta" {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {it.href && !last ? (
              <a href={it.href} className="esge-crumbs__item">{it.icon}{it.label}</a>
            ) : (
              <span className={["esge-crumbs__item", last ? "esge-crumbs__item--current" : ""].filter(Boolean).join(" ")} aria-current={last ? "page" : undefined}>{it.icon}{it.label}</span>
            )}
            {!last && <span className="esge-crumbs__sep" aria-hidden="true"><Chevron/></span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
