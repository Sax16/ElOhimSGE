import React from "react";
import { useStyleOnce } from "../../lib/useStyleOnce";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "accent";

/** Compact status label for states like Activo, Pendiente, Pagado, Retirado. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color/semantic tone. @default "neutral" */
  tone?: BadgeTone;
  /** Filled instead of soft-tinted. */
  solid?: boolean;
  /** Fully rounded shape. */
  pill?: boolean;
  /** @default "md" */
  size?: "sm" | "md";
  /** Leading status dot. */
  dot?: boolean;
}

const CSS = `
.esge-badge{
  display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 8px;
  font:var(--type-caption); font-weight:var(--weight-semibold); line-height:1;
  border-radius:var(--radius-sm); border:1px solid transparent; white-space:nowrap;
}
.esge-badge--pill{ border-radius:var(--radius-pill); }
.esge-badge--sm{ height:18px; padding:0 6px; font-size:var(--text-2xs); }
.esge-badge__dot{ width:6px; height:6px; border-radius:var(--radius-full); background:currentColor; flex-shrink:0; }

.esge-badge--neutral{ background:var(--surface-sunken); color:var(--text-muted); border-color:var(--border-subtle); }
.esge-badge--brand{ background:var(--surface-brand-soft); color:var(--info-soft-fg); }
.esge-badge--success{ background:var(--success-soft); color:var(--success-soft-fg); }
.esge-badge--warning{ background:var(--warning-soft); color:var(--warning-soft-fg); }
.esge-badge--danger{ background:var(--danger-soft); color:var(--danger-soft-fg); }
.esge-badge--info{ background:var(--info-soft); color:var(--info-soft-fg); }
.esge-badge--accent{ background:var(--surface-accent-soft); color:var(--gold-700); }

.esge-badge--solid.esge-badge--brand{ background:var(--brand); color:var(--brand-fg); }
.esge-badge--solid.esge-badge--success{ background:var(--success); color:var(--success-fg); }
.esge-badge--solid.esge-badge--warning{ background:var(--warning); color:var(--warning-fg); }
.esge-badge--solid.esge-badge--danger{ background:var(--danger); color:var(--danger-fg); }
.esge-badge--solid.esge-badge--info{ background:var(--info); color:var(--info-fg); }
.esge-badge--solid.esge-badge--accent{ background:var(--accent); color:var(--accent-fg); }
.esge-badge--solid.esge-badge--neutral{ background:var(--neutral-600); color:#fff; }
`;

/** Compact status label. Use `dot` for status indicators (e.g. Activo/Retirado). */
export function Badge({
  tone = "neutral", solid = false, pill = false, size = "md", dot = false,
  className = "", children, ...rest
}: BadgeProps) {
  useStyleOnce("esge-badge-css", CSS);
  const cls = [
    "esge-badge", `esge-badge--${tone}`,
    solid ? "esge-badge--solid" : "",
    pill ? "esge-badge--pill" : "",
    size === "sm" ? "esge-badge--sm" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {dot && <span className="esge-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
