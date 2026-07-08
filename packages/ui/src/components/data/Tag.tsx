import React from "react";
import { useStyleOnce } from "../../lib/useStyleOnce";

/** Chip for filters, keywords and tokens. Pass `onRemove` to show an ✕. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Selected (filter active) styling. */
  selected?: boolean;
  /** Show a remove button; receives the click event. */
  onRemove?: (e: React.MouseEvent) => void;
  /** Dot color when `leadingDot` is set. */
  color?: string;
  /** Show a leading color dot. */
  leadingDot?: boolean;
}

const CSS = `
.esge-tag{
  display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 10px;
  font:var(--type-label); border-radius:var(--radius-md);
  background:var(--surface-sunken); color:var(--text-body); border:1px solid var(--border-subtle);
  white-space:nowrap;
}
.esge-tag--clickable{ cursor:pointer; transition:background var(--duration-fast), border-color var(--duration-fast); }
.esge-tag--clickable:hover{ background:var(--surface-hover); border-color:var(--border-default); }
.esge-tag--selected{ background:var(--surface-brand-soft); border-color:var(--border-brand); color:var(--info-soft-fg); }
.esge-tag__remove{
  display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px;
  border:none; background:transparent; color:inherit; cursor:pointer; opacity:.65; border-radius:var(--radius-full);
  margin-right:-3px;
}
.esge-tag__remove:hover{ opacity:1; background:rgba(0,0,0,0.08); }
.esge-tag__remove svg{ width:11px; height:11px; }
.esge-tag__dot{ width:8px; height:8px; border-radius:var(--radius-full); flex-shrink:0; }
`;

/** Chip for filters, keywords and multi-select tokens; optionally removable. */
export function Tag({
  selected = false, onRemove, color, leadingDot = false,
  className = "", children, onClick, ...rest
}: TagProps) {
  useStyleOnce("esge-tag-css", CSS);
  const clickable = !!onClick;
  const cls = [
    "esge-tag",
    clickable ? "esge-tag--clickable" : "",
    selected ? "esge-tag--selected" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <span className={cls} onClick={onClick} {...rest}>
      {leadingDot && <span className="esge-tag__dot" style={{ background: color || "var(--brand)" }} aria-hidden="true" />}
      {children}
      {onRemove && (
        <button type="button" className="esge-tag__remove" aria-label="Quitar"
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
      )}
    </span>
  );
}
