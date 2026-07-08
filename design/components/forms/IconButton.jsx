import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-iconbtn{
  --_s:38px;
  display:inline-flex; align-items:center; justify-content:center;
  width:var(--_s); height:var(--_s); padding:0; cursor:pointer;
  border-radius:var(--radius-md); border:1px solid transparent;
  background:transparent; color:var(--text-muted);
  transition:background var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-iconbtn svg{ width:1.15em; height:1.15em; display:block; }
.esge-iconbtn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.esge-iconbtn[disabled]{ opacity:.45; cursor:not-allowed; }
.esge-iconbtn--sm{ --_s:32px; font-size:var(--text-sm); }
.esge-iconbtn--lg{ --_s:46px; font-size:var(--text-lg); }

.esge-iconbtn--ghost:hover{ background:var(--surface-hover); color:var(--text-body); }
.esge-iconbtn--ghost:active{ background:var(--surface-active); }

.esge-iconbtn--outline{ border-color:var(--border-default); color:var(--text-body); background:var(--surface-card); }
.esge-iconbtn--outline:hover{ background:var(--surface-hover); border-color:var(--border-strong); }

.esge-iconbtn--solid{ background:var(--brand); color:var(--brand-fg); }
.esge-iconbtn--solid:hover{ background:var(--brand-hover); }

.esge-iconbtn--danger:hover{ background:var(--danger-soft); color:var(--danger); }
`;

/** Square, label-less button wrapping a single icon. */
export function IconButton({
  variant = "ghost",
  size = "md",
  label,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-iconbtn-css", CSS);
  const cls = [
    "esge-iconbtn",
    `esge-iconbtn--${variant}`,
    size !== "md" ? `esge-iconbtn--${size}` : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} aria-label={label} title={label} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
