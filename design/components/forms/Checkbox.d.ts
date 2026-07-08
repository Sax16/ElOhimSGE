import * as React from "react";

/** Checkbox with label, optional description and indeterminate state. */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  indeterminate?: boolean;
}

export declare function Checkbox(props: CheckboxProps): React.JSX.Element;
