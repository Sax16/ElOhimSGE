import * as React from "react";

export interface SidebarItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  /** Count chip on the right (e.g. pending payments). */
  badge?: React.ReactNode;
  /** Section heading rendered ABOVE this item. */
  section?: string;
}

/**
 * Institutional dark-blue navigation rail for the SGE shell. Collapsible to an
 * icon-only strip. Group items with `section` headings.
 */
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  brandName?: string;
  brandSub?: string;
  /** Logo image URL (the Elohim insignia). */
  logoSrc?: string;
  items: SidebarItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  collapsed?: boolean;
  /** Pinned footer (e.g. user mini-profile or settings link). */
  footer?: React.ReactNode;
}

export declare function Sidebar(props: SidebarProps): React.JSX.Element;
