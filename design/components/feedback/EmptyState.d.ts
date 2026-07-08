import * as React from "react";

/** Placeholder for empty tables, no-results searches and unconfigured areas. */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Action buttons row. */
  actions?: React.ReactNode;
  /** @default "md" */
  size?: "sm" | "md";
}

export declare function EmptyState(props: EmptyStateProps): React.JSX.Element;
