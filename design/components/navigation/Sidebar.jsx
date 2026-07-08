import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-sidebar{
  display:flex; flex-direction:column; width:var(--sidebar-width); height:100%;
  background:var(--sidebar-bg); color:var(--sidebar-fg); border-right:1px solid var(--sidebar-border);
  transition:width var(--duration-normal) var(--ease-standard); overflow:hidden;
}
.esge-sidebar--collapsed{ width:var(--sidebar-width-collapsed); }
.esge-sidebar__brand{
  display:flex; align-items:center; gap:11px; height:var(--topbar-height); padding:0 16px; flex-shrink:0;
  border-bottom:1px solid var(--sidebar-border);
}
.esge-sidebar__logo{ width:34px; height:34px; border-radius:var(--radius-md); object-fit:contain; flex-shrink:0; background:rgba(255,255,255,.06); }
.esge-sidebar__brandtext{ display:flex; flex-direction:column; gap:1px; min-width:0; }
.esge-sidebar__brandname{ font:var(--type-label); font-weight:var(--weight-bold); color:#fff; letter-spacing:var(--tracking-wide); white-space:nowrap; }
.esge-sidebar__brandsub{ font:var(--type-2xs); color:var(--sidebar-muted); text-transform:uppercase; letter-spacing:var(--tracking-caps); white-space:nowrap; }
.esge-sidebar__nav{ flex:1; overflow-y:auto; overflow-x:hidden; padding:12px 10px; display:flex; flex-direction:column; gap:2px; }
.esge-sidebar__section{ font:var(--type-2xs); text-transform:uppercase; letter-spacing:var(--tracking-caps); font-weight:var(--weight-semibold); color:var(--sidebar-muted); padding:14px 12px 6px; white-space:nowrap; }
.esge-sidebar--collapsed .esge-sidebar__section{ opacity:0; height:10px; padding:6px; }
.esge-navitem{
  display:flex; align-items:center; gap:11px; padding:9px 12px; border-radius:var(--radius-md);
  color:var(--sidebar-fg); text-decoration:none; cursor:pointer; position:relative; white-space:nowrap;
  font:var(--type-label); transition:background var(--duration-fast), color var(--duration-fast);
}
.esge-navitem:hover{ background:var(--sidebar-item-hover); color:#fff; text-decoration:none; }
.esge-navitem--active{ background:var(--sidebar-item-active); color:#fff; }
.esge-navitem--active::before{ content:""; position:absolute; left:0; top:8px; bottom:8px; width:3px; border-radius:0 3px 3px 0; background:var(--sidebar-accent); }
.esge-navitem__icon{ display:inline-flex; flex-shrink:0; width:20px; height:20px; align-items:center; justify-content:center; }
.esge-navitem__icon svg{ width:19px; height:19px; }
.esge-navitem__label{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; }
.esge-navitem__badge{
  font:var(--type-2xs); font-weight:700; min-width:18px; height:18px; padding:0 5px; border-radius:var(--radius-pill);
  background:var(--gold-400); color:var(--brown-900); display:inline-flex; align-items:center; justify-content:center;
}
.esge-sidebar--collapsed .esge-navitem__label,
.esge-sidebar--collapsed .esge-navitem__badge,
.esge-sidebar--collapsed .esge-sidebar__brandtext{ opacity:0; width:0; pointer-events:none; }
.esge-sidebar--collapsed .esge-navitem{ justify-content:center; padding:9px; }
.esge-sidebar__foot{ padding:10px; border-top:1px solid var(--sidebar-border); flex-shrink:0; }
`;

/** Item: { id, label, icon, badge?, section? (renders a heading before it) }. */
export function Sidebar({
  brandName = "Elohim", brandSub = "SGE", logoSrc,
  items = [], activeId, onSelect, collapsed = false, footer,
  className = "", ...rest
}) {
  useStyleOnce("esge-sidebar-css", CSS);
  return (
    <aside className={["esge-sidebar", collapsed ? "esge-sidebar--collapsed" : "", className].filter(Boolean).join(" ")} {...rest}>
      <div className="esge-sidebar__brand">
        {logoSrc
          ? <img className="esge-sidebar__logo" src={logoSrc} alt="" />
          : <span className="esge-sidebar__logo" />}
        <span className="esge-sidebar__brandtext">
          <span className="esge-sidebar__brandname">{brandName}</span>
          <span className="esge-sidebar__brandsub">{brandSub}</span>
        </span>
      </div>
      <nav className="esge-sidebar__nav">
        {items.map((it, i) => (
          <React.Fragment key={it.id || i}>
            {it.section && <div className="esge-sidebar__section">{it.section}</div>}
            <a className={["esge-navitem", activeId === it.id ? "esge-navitem--active" : ""].filter(Boolean).join(" ")}
              href={it.href || "#"} title={it.label}
              onClick={(e) => { if (onSelect) { e.preventDefault(); onSelect(it.id); } }}>
              <span className="esge-navitem__icon">{it.icon}</span>
              <span className="esge-navitem__label">{it.label}</span>
              {it.badge != null && <span className="esge-navitem__badge">{it.badge}</span>}
            </a>
          </React.Fragment>
        ))}
      </nav>
      {footer && <div className="esge-sidebar__foot">{footer}</div>}
    </aside>
  );
}
