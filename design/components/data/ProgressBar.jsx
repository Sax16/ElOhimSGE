import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-progress{ display:flex; flex-direction:column; gap:6px; width:100%; }
.esge-progress__head{ display:flex; justify-content:space-between; align-items:center; font:var(--type-caption); color:var(--text-muted); }
.esge-progress__value{ font-family:var(--font-mono); font-weight:var(--weight-medium); color:var(--text-body); }
.esge-progress__track{
  position:relative; width:100%; height:8px; border-radius:var(--radius-pill);
  background:var(--surface-sunken); overflow:hidden;
}
.esge-progress--sm .esge-progress__track{ height:5px; }
.esge-progress--lg .esge-progress__track{ height:12px; }
.esge-progress__fill{
  position:absolute; left:0; top:0; bottom:0; border-radius:inherit;
  background:var(--brand); transition:width var(--duration-slow) var(--ease-out);
}
.esge-progress__fill--success{ background:var(--success); }
.esge-progress__fill--warning{ background:var(--warning); }
.esge-progress__fill--danger{ background:var(--danger); }
.esge-progress__fill--accent{ background:var(--accent); }
.esge-progress__fill--striped{
  background-image:linear-gradient(45deg, rgba(255,255,255,.22) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.22) 50%, rgba(255,255,255,.22) 75%, transparent 75%);
  background-size:16px 16px;
}
`;

/** Linear progress / ratio bar (asistencia, cobranza, avance de notas). */
export function ProgressBar({
  value = 0, max = 100, label, showValue = false, tone = "brand",
  size = "md", striped = false, valueFormat, className = "", ...rest
}) {
  useStyleOnce("esge-progress-css", CSS);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const display = valueFormat ? valueFormat(value, max) : `${Math.round(pct)}%`;
  return (
    <div className={["esge-progress", `esge-progress--${size}`, className].filter(Boolean).join(" ")} {...rest}>
      {(label || showValue) && (
        <div className="esge-progress__head">
          <span>{label}</span>
          {showValue && <span className="esge-progress__value">{display}</span>}
        </div>
      )}
      <div className="esge-progress__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <span className={["esge-progress__fill", `esge-progress__fill--${tone}`, striped ? "esge-progress__fill--striped" : ""].filter(Boolean).join(" ")} style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}
