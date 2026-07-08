import * as React from "react";

export type SelectOption = string | { value: string; label: string };

/** Labeled native `<select>` with field scaffolding, placeholder and options. */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  /** Disabled placeholder option shown first. */
  placeholder?: string;
  /** Options as strings or {value,label}. Or pass <option> children. */
  options?: SelectOption[];
  containerStyle?: React.CSSProperties;
}

export declare function Select(props: SelectProps): React.JSX.Element;
