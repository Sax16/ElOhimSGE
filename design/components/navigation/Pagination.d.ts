import * as React from "react";

/** Controlled page navigation with optional "Mostrando X–Y de Z" summary. */
export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  /** Total record count — enables the range summary (with pageSize). */
  total?: number;
  pageSize?: number;
}

export declare function Pagination(props: PaginationProps): React.JSX.Element;
