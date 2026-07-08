import * as React from "react";

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
}

/** Breadcrumb trail; the last item renders as the current page. */
export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export declare function Breadcrumb(props: BreadcrumbProps): React.JSX.Element;
