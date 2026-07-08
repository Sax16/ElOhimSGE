import * as React from "react";

/** Single radio option; render inside RadioGroup. */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

/** Groups Radios, supplies shared `name` and handles layout + selection. */
export interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Lay options horizontally. */
  row?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export declare function Radio(props: RadioProps): React.JSX.Element;
export declare function RadioGroup(props: RadioGroupProps): React.JSX.Element;
