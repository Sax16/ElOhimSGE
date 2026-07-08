import * as React from "react";

/** On/off toggle for instant-apply settings. */
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  size?: "sm" | "md";
}

export declare function Switch(props: SwitchProps): React.JSX.Element;
