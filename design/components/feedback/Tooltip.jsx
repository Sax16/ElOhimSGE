import React from "react";

function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }, [id, css]);
}

const CSS = `
.esge-tip-wrap{ position:relative; display:inline-flex; }
.esge-tip{
  position:absolute; z-index:var(--z-tooltip); pointer-events:none;
  background:var(--surface-inverse); color:var(--text-inverse);
  font:var(--type-caption); font-weight:var(--weight-medium); padding:6px 9px; border-radius:var(--radius-sm);
  box-shadow:var(--shadow-md); max-width:240px; white-space:normal; width:max-content;
  display:none; /* fuera del layout: no genera scroll fantasma en contenedores overflow:auto */
}
[data-theme="dark"] .esge-tip{ color:var(--neutral-900); }
@keyframes esge-tip-in{ from{ opacity:0; transform:scale(.96); } to{ opacity:1; transform:none; } }
.esge-tip-wrap:hover .esge-tip, .esge-tip-wrap:focus-within .esge-tip{ display:block; animation:esge-tip-in var(--duration-fast) var(--ease-standard) both; }
.esge-tip::after{ content:""; position:absolute; width:7px; height:7px; background:inherit; transform:rotate(45deg); }
.esge-tip--top{ bottom:calc(100% + 8px); left:50%; transform-origin:bottom center; translate:-50% 0; }
.esge-tip--top::after{ bottom:-3px; left:50%; margin-left:-3px; }
.esge-tip--bottom{ top:calc(100% + 8px); left:50%; transform-origin:top center; translate:-50% 0; }
.esge-tip--bottom::after{ top:-3px; left:50%; margin-left:-3px; }
.esge-tip--left{ right:calc(100% + 8px); top:50%; transform-origin:right center; translate:0 -50%; }
.esge-tip--left::after{ right:-3px; top:50%; margin-top:-3px; }
.esge-tip--right{ left:calc(100% + 8px); top:50%; transform-origin:left center; translate:0 -50%; }
.esge-tip--right::after{ left:-3px; top:50%; margin-top:-3px; }
`;

/** Hover/focus tooltip wrapping a single trigger element. */
export function Tooltip({ content, side = "top", className = "", children, ...rest }) {
  useStyleOnce("esge-tooltip-css", CSS);
  return (
    <span className={["esge-tip-wrap", className].filter(Boolean).join(" ")} {...rest}>
      {children}
      <span role="tooltip" className={`esge-tip esge-tip--${side}`}>{content}</span>
    </span>
  );
}
