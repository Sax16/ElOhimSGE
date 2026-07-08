import * as React from "react";

/** Single toast notification (presentational — manage lifecycle in your app). */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @default "info" */
  tone?: "info" | "success" | "warning" | "danger";
  title?: React.ReactNode;
  message?: React.ReactNode;
  onClose?: () => void;
}

/** Fixed corner container that stacks Toasts. */
export interface ToastStackProps {
  /** @default "bottom-right" */
  position?: "top-right" | "bottom-right" | "bottom-left" | "top-center";
  className?: string;
  children?: React.ReactNode;
}

export declare function Toast(props: ToastProps): React.JSX.Element;
export declare function ToastStack(props: ToastStackProps): React.JSX.Element;
