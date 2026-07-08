import type * as React from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

const CSS = `
.esge-empty{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; padding:40px 24px; }
.esge-empty__icon{
  width:56px; height:56px; border-radius:var(--radius-full); display:inline-flex; align-items:center; justify-content:center;
  background:var(--surface-sunken); color:var(--text-subtle); margin-bottom:6px;
}
.esge-empty__icon svg{ width:26px; height:26px; }
.esge-empty__title{ font:var(--type-h3); color:var(--text-strong); }
.esge-empty__desc{ font:var(--type-body); color:var(--text-muted); max-width:380px; }
.esge-empty__actions{ display:flex; gap:10px; margin-top:14px; }
.esge-empty--sm{ padding:26px 18px; }
.esge-empty--sm .esge-empty__icon{ width:44px; height:44px; }
.esge-empty--sm .esge-empty__icon svg{ width:21px; height:21px; }
`;

/** Placeholder for empty tables, no-results searches and unconfigured areas. */
export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Action buttons row. */
  actions?: React.ReactNode;
  /** @default "md" */
  size?: 'sm' | 'md';
}

/** Placeholder for empty lists, no search results, or unconfigured sections. */
export function EmptyState({ icon, title, description, actions, size = 'md', className = '', children, ...rest }: EmptyStateProps) {
  useStyleOnce('esge-empty-css', CSS);
  return (
    <div className={['esge-empty', size === 'sm' ? 'esge-empty--sm' : '', className].filter(Boolean).join(' ')} {...rest}>
      {icon && <span className="esge-empty__icon" aria-hidden="true">{icon}</span>}
      {title && <div className="esge-empty__title">{title}</div>}
      {description && <div className="esge-empty__desc">{description}</div>}
      {children}
      {actions && <div className="esge-empty__actions">{actions}</div>}
    </div>
  );
}
