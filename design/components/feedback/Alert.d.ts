import * as React from "react";

/** Inline contextual banner for page-level messages and form results. */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "info" */
  tone?: "info" | "success" | "warning" | "danger";
  title?: React.ReactNode;
  /** Override the default tone icon. */
  icon?: React.ReactNode;
  /** Show a close button; receives the click. */
  onClose?: () => void;
  /** Action buttons row below the message. */
  actions?: React.ReactNode;
}

export declare function Alert(props: AlertProps): React.JSX.Element;
