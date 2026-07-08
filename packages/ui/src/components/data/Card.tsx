import React from "react";
import { useStyleOnce } from "../../lib/useStyleOnce";

/** Surface container with optional header (title/subtitle/actions) and footer. */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Nodes shown on the right of the header (e.g. IconButtons). */
  actions?: React.ReactNode;
  /** Footer content rendered in a sunken bar. */
  footer?: React.ReactNode;
  /** Shadow level. @default "default" */
  elevation?: "flat" | "default" | "raised";
  /** Hover/press affordance for clickable cards. */
  interactive?: boolean;
  /** Remove body padding (for tables/media that bleed to the edge). */
  flush?: boolean;
}

const CSS = `
.esge-card{
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm);
  display:flex; flex-direction:column; overflow:hidden;
}
.esge-card--flat{ box-shadow:none; }
.esge-card--raised{ box-shadow:var(--shadow-md); }
.esge-card--interactive{ cursor:pointer; transition:box-shadow var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard); }
.esge-card--interactive:hover{ box-shadow:var(--shadow-md); border-color:var(--border-default); }
.esge-card--interactive:active{ transform:translateY(1px); }
.esge-card__header{ display:flex; align-items:center; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border-subtle); }
.esge-card__titles{ display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; }
.esge-card__title{ font:var(--type-h3); color:var(--text-strong); }
.esge-card__subtitle{ font:var(--type-caption); color:var(--text-muted); }
.esge-card__actions{ display:flex; align-items:center; gap:8px; flex-shrink:0; }
.esge-card__body{ padding:18px; }
.esge-card__body--flush{ padding:0; }
.esge-card__footer{ padding:14px 18px; border-top:1px solid var(--border-subtle); display:flex; align-items:center; gap:10px; background:var(--surface-sunken); }
`;

/** Surface container with optional header (title/subtitle/actions) and footer. */
export function Card({
  title, subtitle, actions, footer, elevation = "default",
  interactive = false, flush = false, className = "", children, ...rest
}: CardProps) {
  useStyleOnce("esge-card-css", CSS);
  const cls = [
    "esge-card",
    elevation === "flat" ? "esge-card--flat" : "",
    elevation === "raised" ? "esge-card--raised" : "",
    interactive ? "esge-card--interactive" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      {(title || actions) && (
        <div className="esge-card__header">
          <div className="esge-card__titles">
            {title && <div className="esge-card__title">{title}</div>}
            {subtitle && <div className="esge-card__subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="esge-card__actions">{actions}</div>}
        </div>
      )}
      <div className={["esge-card__body", flush ? "esge-card__body--flush" : ""].filter(Boolean).join(" ")}>
        {children}
      </div>
      {footer && <div className="esge-card__footer">{footer}</div>}
    </div>
  );
}
