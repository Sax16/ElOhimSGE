import * as React from "react";

export type InputSize = "sm" | "md" | "lg";

/**
 * Labeled text input with hint, error, icon and prefix/suffix affixes.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> {
  /** Field label rendered above the control. */
  label?: string;
  /** Helper text shown below when there is no error. */
  hint?: string;
  /** Error message; turns the control red and overrides hint. */
  error?: string;
  /** Mark the field as required (shows a red asterisk). */
  required?: boolean;
  /** @default "md" */
  size?: InputSize;
  /** Icon node rendered inside, before the text. */
  iconLeft?: React.ReactNode;
  /** Static text prefix (e.g. "S/."). */
  prefix?: React.ReactNode;
  /** Static text suffix (e.g. "kg", "%"). */
  suffix?: React.ReactNode;
  /** Style applied to the outer field wrapper. */
  containerStyle?: React.CSSProperties;
}

export declare function Input(props: InputProps): React.JSX.Element;
