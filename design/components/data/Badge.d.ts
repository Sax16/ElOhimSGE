import * as React from "react";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "accent";

/** Compact status label for states like Activo, Pendiente, Pagado, Retirado. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color/semantic tone. @default "neutral" */
  tone?: BadgeTone;
  /** Filled instead of soft-tinted. */
  solid?: boolean;
  /** Fully rounded shape. */
  pill?: boolean;
  /** @default "md" */
  size?: "sm" | "md";
  /** Leading status dot. */
  dot?: boolean;
}

export declare function Badge(props: BadgeProps): React.JSX.Element;
