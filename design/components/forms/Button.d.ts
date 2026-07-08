import * as React from "react";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Primary action control. Blue `primary` for the main action on a view, gold
 * `accent` for a single hero/positive action, `secondary` for neutral actions,
 * `ghost` for low-emphasis, `danger` for destructive, `link` for inline text.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: ButtonVariant;
  /** Control height. @default "md" */
  size?: ButtonSize;
  /** Stretch to full container width. */
  block?: boolean;
  /** Icon node rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
}

export declare function Button(props: ButtonProps): React.JSX.Element;
