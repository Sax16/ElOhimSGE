import * as React from "react";

/** Surface container with optional header (title/subtitle/actions) and footer. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
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

export declare function Card(props: CardProps): React.JSX.Element;
