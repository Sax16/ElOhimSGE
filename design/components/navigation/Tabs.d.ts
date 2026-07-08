import * as React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  /** Optional count chip. */
  count?: number;
  disabled?: boolean;
}

/** Controlled tab navigation. `line` (underline) or `pill` (segmented). */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabItem[];
  value: string;
  onChange?: (id: string) => void;
  /** @default "line" */
  variant?: "line" | "pill";
}

export declare function Tabs(props: TabsProps): React.JSX.Element;
