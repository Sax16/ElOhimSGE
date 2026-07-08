import * as React from "react";

/** Hover/focus tooltip wrapping a single trigger (icon button, truncated text). */
export interface TooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  content: React.ReactNode;
  /** @default "top" */
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export declare function Tooltip(props: TooltipProps): React.JSX.Element;
