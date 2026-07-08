import * as React from "react";

/** Dashboard KPI tile: label, big tabular figure, optional trend + icon. */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Upper-case metric label. */
  label: React.ReactNode;
  /** The headline figure (pre-formatted string or number). */
  value: React.ReactNode;
  /** Icon node shown top-right. */
  icon?: React.ReactNode;
  /** Tint for the icon chip. @default "brand" */
  iconTone?: "brand" | "accent" | "success" | "danger";
  /** Trend value; number renders as ±N% with arrow. */
  delta?: number | string;
  /** Force arrow direction (otherwise inferred from numeric delta sign). */
  deltaDirection?: "up" | "down";
  /** Muted text after the delta (e.g. "vs. mes anterior"). */
  caption?: React.ReactNode;
}

export declare function StatCard(props: StatCardProps): React.JSX.Element;
