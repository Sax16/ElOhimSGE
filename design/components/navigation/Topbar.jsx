import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-topbar{
  display:flex; align-items:center; gap:16px; height:var(--topbar-height); padding:0 20px; flex-shrink:0;
  background:var(--surface-card); border-bottom:1px solid var(--border-subtle);
}
.esge-topbar__menu{ display:inline-flex; }
.esge-topbar__lead{ display:flex; flex-direction:column; gap:1px; min-width:0; }
.esge-topbar__title{ font:var(--type-h3); color:var(--text-strong); white-space:nowrap; }
.esge-topbar__spacer{ flex:1; }
.esge-topbar__search{
  display:flex; align-items:center; gap:8px; height:38px; padding:0 12px; min-width:200px; max-width:340px; flex:1;
  background:var(--surface-sunken); border:1px solid transparent; border-radius:var(--radius-md);
  color:var(--text-muted); transition:border-color var(--duration-fast), background var(--duration-fast);
}
.esge-topbar__search:focus-within{ background:var(--surface-card); border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-topbar__search svg{ width:18px; height:18px; flex-shrink:0; }
.esge-topbar__search input{ flex:1; min-width:0; border:none; outline:none; background:transparent; font:var(--type-body); color:var(--text-body); }
.esge-topbar__search input::placeholder{ color:var(--text-subtle); }
.esge-topbar__search kbd{ font:var(--type-2xs); font-family:var(--font-mono); padding:2px 6px; border-radius:var(--radius-xs); background:var(--surface-card); border:1px solid var(--border-subtle); color:var(--text-muted); }
.esge-topbar__actions{ display:flex; align-items:center; gap:6px; }
.esge-topbar__user{ display:flex; align-items:center; gap:10px; padding:4px 6px 4px 8px; border-radius:var(--radius-md); cursor:pointer; transition:background var(--duration-fast); }
.esge-topbar__user:hover{ background:var(--surface-hover); }
.esge-topbar__userinfo{ display:flex; flex-direction:column; line-height:1.2; }
.esge-topbar__username{ font:var(--type-label); color:var(--text-strong); white-space:nowrap; }
.esge-topbar__userrole{ font:var(--type-2xs); color:var(--text-muted); white-space:nowrap; }
.esge-topbar__divider{ width:1px; height:28px; background:var(--border-subtle); }
`;

const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

/** Application header: optional menu/lead, search, action slot and user block. */
export function Topbar({
  title, lead, onMenuClick, menuButton,
  searchPlaceholder = "Buscar…", showSearch = true, onSearch, searchValue,
  actions, user, className = "", ...rest
}) {
  useStyleOnce("esge-topbar-css", CSS);
  return (
    <header className={["esge-topbar", className].filter(Boolean).join(" ")} {...rest}>
      {menuButton && <span className="esge-topbar__menu" onClick={onMenuClick}>{menuButton}</span>}
      {(title || lead) && (
        <div className="esge-topbar__lead">
          {lead}
          {title && <div className="esge-topbar__title">{title}</div>}
        </div>
      )}
      {showSearch && (
        <label className="esge-topbar__search">
          <SearchIcon/>
          <input type="search" placeholder={searchPlaceholder} value={searchValue}
            onChange={(e) => onSearch && onSearch(e.target.value)} />
          <kbd>Ctrl K</kbd>
        </label>
      )}
      <div className="esge-topbar__spacer" />
      {actions && <div className="esge-topbar__actions">{actions}</div>}
      {actions && user && <span className="esge-topbar__divider" />}
      {user && (
        <div className="esge-topbar__user" onClick={user.onClick}>
          {user.avatar}
          <div className="esge-topbar__userinfo">
            <span className="esge-topbar__username">{user.name}</span>
            {user.role && <span className="esge-topbar__userrole">{user.role}</span>}
          </div>
        </div>
      )}
    </header>
  );
}
