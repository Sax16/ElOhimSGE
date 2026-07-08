import * as React from "react";

export interface TopbarUser {
  name: React.ReactNode;
  role?: React.ReactNode;
  /** Avatar node (use the Avatar component). */
  avatar?: React.ReactNode;
  onClick?: () => void;
}

/** Application header bar: lead/title, global search, actions and user block. */
export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  title?: React.ReactNode;
  /** Slot above the title (e.g. a Breadcrumb). */
  lead?: React.ReactNode;
  /** Hamburger button node (shown at the far left). */
  menuButton?: React.ReactNode;
  onMenuClick?: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  /** Right-side action nodes (IconButtons, etc). */
  actions?: React.ReactNode;
  user?: TopbarUser;
}

export declare function Topbar(props: TopbarProps): React.JSX.Element;
