import * as React from "react";

/** Modal dialog with optional icon, header, scrollable body and footer actions. */
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Icon chip shown left of the title. */
  icon?: React.ReactNode;
  iconTone?: "brand" | "danger" | "warning" | "success";
  /** @default "md" */
  size?: "sm" | "md" | "lg" | "xl";
  /** Footer node — usually the action Buttons. */
  footer?: React.ReactNode;
  /** Close when the backdrop is clicked. @default true */
  closeOnOverlay?: boolean;
  showClose?: boolean;
}

export declare function Dialog(props: DialogProps): React.JSX.Element;
