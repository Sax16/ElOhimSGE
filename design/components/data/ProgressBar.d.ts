import * as React from "react";

/** Linear ratio/progress bar (asistencia %, avance de cobranza, carga de notas). */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  /** @default 100 */
  max?: number;
  label?: React.ReactNode;
  /** Show the computed value on the right of the label row. */
  showValue?: boolean;
  /** @default "brand" */
  tone?: "brand" | "success" | "warning" | "danger" | "accent";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  striped?: boolean;
  /** Custom formatter for the displayed value. */
  valueFormat?: (value: number, max: number) => React.ReactNode;
}

export declare function ProgressBar(props: ProgressBarProps): React.JSX.Element;
