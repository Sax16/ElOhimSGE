import * as React from "react";

export type IconButtonVariant = "ghost" | "outline" | "solid" | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

/** Square, label-less button wrapping a single icon. Always pass `label` for a11y. */
export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** @default "ghost" */
  variant?: IconButtonVariant;
  /** @default "md" */
  size?: IconButtonSize;
  /** Accessible label (also used as tooltip title). */
  label: string;
}

export declare function IconButton(props: IconButtonProps): React.JSX.Element;
