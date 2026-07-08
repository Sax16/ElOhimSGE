import * as React from 'react';
import { useStyleOnce } from '../../lib/useStyleOnce';

/** Controlled page navigation with optional "Mostrando X–Y de Z" summary. */
export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  /** Total record count — enables the range summary (with pageSize). */
  total?: number;
  pageSize?: number;
}

const CSS = `
.esge-pag{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; font:var(--type-label); color:var(--text-muted); }
.esge-pag__info{ font:var(--type-caption); color:var(--text-muted); }
.esge-pag__info b{ color:var(--text-body); font-weight:var(--weight-semibold); }
.esge-pag__list{ display:flex; align-items:center; gap:4px; }
.esge-pag__btn{
  min-width:34px; height:34px; padding:0 8px; display:inline-flex; align-items:center; justify-content:center;
  border:1px solid var(--border-default); background:var(--surface-card); color:var(--text-body);
  border-radius:var(--radius-md); cursor:pointer; font:var(--type-label); font-variant-numeric:tabular-nums;
  transition:background var(--duration-fast), border-color var(--duration-fast), color var(--duration-fast);
}
.esge-pag__btn:hover:not(:disabled){ background:var(--surface-hover); border-color:var(--border-strong); }
.esge-pag__btn:disabled{ opacity:.45; cursor:not-allowed; }
.esge-pag__btn--active{ background:var(--brand); border-color:var(--brand); color:var(--brand-fg); }
.esge-pag__btn--active:hover{ background:var(--brand-hover); }
.esge-pag__ellipsis{ min-width:24px; text-align:center; color:var(--text-subtle); }
.esge-pag__btn svg{ width:16px; height:16px; }
`;

function pageRange(page: number, total: number): (number | string)[] {
  const out: (number | string)[] = [];
  const add = (n: number | string) => out.push(n);
  if (total <= 7) { for (let i = 1; i <= total; i++) add(i); return out; }
  add(1);
  if (page > 3) add('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) add(i);
  if (page < total - 2) add('…');
  add(total);
  return out;
}

const Prev = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const Next = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

/** Page navigation with optional record-range summary. Controlled. */
export function Pagination({
  page = 1, pageCount = 1, onPageChange, total, pageSize, className = '', ...rest
}: PaginationProps): React.JSX.Element {
  useStyleOnce('esge-pag-css', CSS);
  const go = (p: number) => { if (p >= 1 && p <= pageCount && p !== page && onPageChange) onPageChange(p); };
  const from = total != null && pageSize ? (page - 1) * pageSize + 1 : null;
  const to = total != null && pageSize ? Math.min(total, page * pageSize) : null;
  return (
    <div className={['esge-pag', className].filter(Boolean).join(' ')} {...rest}>
      {total != null && pageSize && (
        <span className="esge-pag__info">Mostrando <b>{from}–{to}</b> de <b>{total}</b></span>
      )}
      <div className="esge-pag__list">
        <button className="esge-pag__btn" onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Anterior"><Prev/></button>
        {pageRange(page, pageCount).map((p, i) =>
          p === '…' ? <span key={'e'+i} className="esge-pag__ellipsis">…</span> :
          <button key={p} className={['esge-pag__btn', p === page ? 'esge-pag__btn--active' : ''].filter(Boolean).join(' ')}
            onClick={() => go(p as number)} aria-current={p === page ? 'page' : undefined}>{p}</button>
        )}
        <button className="esge-pag__btn" onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label="Siguiente"><Next/></button>
      </div>
    </div>
  );
}
