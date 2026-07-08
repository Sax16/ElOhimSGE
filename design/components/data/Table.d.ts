import * as React from "react";

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

export declare function Table<T = any>(props: TableProps<T>): React.JSX.Element;
