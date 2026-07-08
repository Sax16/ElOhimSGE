import * as React from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Optional count chip. */
  count?: number;
  disabled?: boolean;
}

/** Controlled tab navigation. `line` (underline) or `pill` (segmented). */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  value: string;
  onChange?: (id: string) => void;
  /** @default "line" */
  variant?: 'line' | 'pill';
}

const CSS = `
.esge-tabs{ display:flex; flex-direction:column; }
.esge-tablist{ display:flex; align-items:center; gap:2px; position:relative; }
.esge-tablist--line{ border-bottom:1px solid var(--border-subtle); gap:4px; }
.esge-tablist--pill{ background:var(--surface-sunken); padding:4px; border-radius:var(--radius-md); gap:2px; display:inline-flex; }
.esge-tab{
  appearance:none; border:none; background:transparent; cursor:pointer;
  font:var(--type-label); font-weight:var(--weight-medium); color:var(--text-muted);
  display:inline-flex; align-items:center; gap:7px; white-space:nowrap;
  transition:color var(--duration-fast), background var(--duration-fast);
}
.esge-tab__icon{ display:inline-flex; }
.esge-tab__icon svg{ width:16px; height:16px; }
.esge-tab:disabled{ opacity:.45; cursor:not-allowed; }

.esge-tablist--line .esge-tab{ padding:11px 12px; position:relative; }
.esge-tablist--line .esge-tab::after{ content:""; position:absolute; left:8px; right:8px; bottom:-1px; height:2px; border-radius:2px 2px 0 0; background:transparent; transition:background var(--duration-fast); }
.esge-tablist--line .esge-tab:hover{ color:var(--text-body); }
.esge-tablist--line .esge-tab[aria-selected="true"]{ color:var(--brand); }
.esge-tablist--line .esge-tab[aria-selected="true"]::after{ background:var(--brand); }

.esge-tablist--pill .esge-tab{ padding:7px 14px; border-radius:var(--radius-sm); }
.esge-tablist--pill .esge-tab:hover{ color:var(--text-body); }
.esge-tablist--pill .esge-tab[aria-selected="true"]{ color:var(--text-strong); background:var(--surface-card); box-shadow:var(--shadow-xs); }

.esge-tab__count{ font:var(--type-2xs); font-weight:600; padding:1px 6px; border-radius:var(--radius-pill); background:var(--surface-active); color:var(--text-muted); }
.esge-tab[aria-selected="true"] .esge-tab__count{ background:var(--surface-brand-soft); color:var(--brand); }
`;

/** Tab navigation. `items`: [{ id, label, icon?, count?, disabled? }]. Controlled. */
export function Tabs({ items = [], value, onChange, variant = 'line', className = '', ...rest }: TabsProps): React.JSX.Element {
  useStyleOnce('esge-tabs-css', CSS);
  return (
    <div className={['esge-tabs', className].filter(Boolean).join(' ')} {...rest}>
      <div className={`esge-tablist esge-tablist--${variant}`} role="tablist">
        {items.map((it) => (
          <button key={it.id} role="tab" type="button" className="esge-tab"
            aria-selected={value === it.id} disabled={it.disabled}
            onClick={() => !it.disabled && onChange && onChange(it.id)}>
            {it.icon && <span className="esge-tab__icon">{it.icon}</span>}
            {it.label}
            {it.count != null && <span className="esge-tab__count">{it.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
