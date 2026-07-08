/* eslint-disable @typescript-eslint/no-explicit-any -- contrato del .d.ts del design system:
   acceso dinámico por col.key sobre el genérico T (port fiel del prototipo). */
import React from "react";
import { useStyleOnce } from "../../lib/useStyleOnce";

export interface TableColumn<T = any> {
  /** Property key on the row, also the column id. */
  key: string;
  /** Header label. */
  header: React.ReactNode;
  /** Text alignment. @default "left" */
  align?: "left" | "center" | "right";
  /** Shorthand for right-aligned tabular numbers. */
  num?: boolean;
  /** Render cell value with the monospace figure font. */
  mono?: boolean;
  /** Fixed column width (CSS value). */
  width?: string | number;
  /** Mark sortable (header becomes a sort toggle; needs onSort). */
  sortable?: boolean;
  /** Custom cell renderer. */
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface TableSort { key: string; dir: "asc" | "desc"; }

/**
 * Config-driven data table for student lists, payments, grades, attendance.
 * Sorting is controlled: caller sorts `data` in response to `onSort`.
 */
export interface TableProps<T = any> extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn<T>[];
  data: T[];
  /** Row identity: property name or function. @default "id" */
  rowKey?: string | ((row: T, index: number) => React.Key);
  hover?: boolean;
  zebra?: boolean;
  compact?: boolean;
  sort?: TableSort;
  onSort?: (key: string, dir: "asc" | "desc") => void;
  onRowClick?: (row: T, index: number) => void;
  /** Selected row keys (highlights rows). */
  selectedKeys?: Set<React.Key> | React.Key[];
  emptyText?: React.ReactNode;
}

const CSS = `
.esge-table-wrap{ width:100%; overflow-x:auto; }
.esge-table{ width:100%; border-collapse:separate; border-spacing:0; font:var(--type-body); }
.esge-table th, .esge-table td{ text-align:left; padding:11px 16px; vertical-align:middle; }
.esge-table thead th{
  font:var(--type-caption); text-transform:uppercase; letter-spacing:var(--tracking-caps);
  font-weight:var(--weight-semibold); color:var(--text-muted); background:var(--surface-sunken);
  border-bottom:1px solid var(--border-subtle); white-space:nowrap; position:sticky; top:0;
}
.esge-table thead th:first-child{ border-top-left-radius:var(--radius-md); }
.esge-table thead th:last-child{ border-top-right-radius:var(--radius-md); }
.esge-table tbody td{ border-bottom:1px solid var(--border-subtle); color:var(--text-body); }
.esge-table tbody tr:last-child td{ border-bottom:none; }
.esge-table--hover tbody tr{ transition:background var(--duration-fast); }
.esge-table--hover tbody tr:hover{ background:var(--surface-hover); }
.esge-table--zebra tbody tr:nth-child(even){ background:var(--surface-sunken); }
.esge-table--zebra.esge-table--hover tbody tr:hover{ background:var(--surface-hover); }
.esge-table tbody tr[data-selected="true"]{ background:var(--surface-brand-soft); }
.esge-table--compact th, .esge-table--compact td{ padding:7px 12px; }
.esge-table th.esge-num, .esge-table td.esge-num{ text-align:right; font-variant-numeric:tabular-nums; }
.esge-table th.esge-center, .esge-table td.esge-center{ text-align:center; }
.esge-table__sort{ display:inline-flex; align-items:center; gap:5px; cursor:pointer; user-select:none; }
.esge-table__sort:hover{ color:var(--text-body); }
.esge-table__sort svg{ width:13px; height:13px; opacity:.5; }
.esge-table__sort--active svg{ opacity:1; color:var(--brand); }
.esge-table__cellmuted{ color:var(--text-muted); }
.esge-mono{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; }
`;

const SortIcon = ({ dir }: { dir: "asc" | "desc" | null }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    {dir === "asc" ? <polyline points="18 15 12 9 6 15"/> :
     dir === "desc" ? <polyline points="6 9 12 15 18 9"/> :
     <g><polyline points="8 9 12 5 16 9"/><polyline points="16 15 12 19 8 15"/></g>}
  </svg>
);

/**
 * Config-driven data table. Columns: { key, header, align, width, mono, render }.
 * Sorting is presentation-only (caller sorts data and passes sort/onSort).
 */
export function Table<T = any>({
  columns = [], data = [], rowKey = "id",
  hover = true, zebra = false, compact = false,
  sort, onSort, onRowClick, selectedKeys, emptyText = "Sin registros",
  className = "", ...rest
}: TableProps<T>) {
  useStyleOnce("esge-table-css", CSS);
  const getKey = (row: T, i: number): React.Key =>
    (typeof rowKey === "function" ? rowKey(row, i) : (row as any)[rowKey] ?? i);
  const sel = selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys || []);
  const cls = [
    "esge-table",
    hover ? "esge-table--hover" : "",
    zebra ? "esge-table--zebra" : "",
    compact ? "esge-table--compact" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="esge-table-wrap" {...rest}>
      <table className={cls}>
        <thead>
          <tr>
            {columns.map((col) => {
              const alignCls = col.align === "right" || col.num ? "esge-num" : col.align === "center" ? "esge-center" : "";
              const active = sort && sort.key === col.key;
              return (
                <th key={col.key} className={alignCls} style={col.width ? { width: col.width } : undefined}>
                  {col.sortable && onSort ? (
                    <span className={["esge-table__sort", active ? "esge-table__sort--active" : ""].filter(Boolean).join(" ")}
                      onClick={() => onSort(col.key, active && sort!.dir === "asc" ? "desc" : "asc")}>
                      {col.header}<SortIcon dir={active ? sort!.dir : null} />
                    </span>
                  ) : col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px 16px" }}>{emptyText}</td></tr>
          ) : data.map((row, i) => {
            const k = getKey(row, i);
            return (
              <tr key={k} data-selected={sel.has(k) || undefined}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}>
                {columns.map((col) => {
                  const alignCls = col.align === "right" || col.num ? "esge-num" : col.align === "center" ? "esge-center" : "";
                  const monoCls = col.mono ? "esge-mono" : "";
                  const content = col.render ? col.render((row as any)[col.key], row, i) : (row as any)[col.key];
                  return <td key={col.key} className={[alignCls, monoCls].filter(Boolean).join(" ")}>{content}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
