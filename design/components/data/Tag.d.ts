import * as React from "react";

/** Chip for filters, keywords and tokens. Pass `onRemove` to show an ✕. */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Selected (filter active) styling. */
  selected?: boolean;
  /** Show a remove button; receives the click event. */
  onRemove?: (e: React.MouseEvent) => void;
  /** Dot color when `leadingDot` is set. */
  color?: string;
  /** Show a leading color dot. */
  leadingDot?: boolean;
}

export declare function Tag(props: TagProps): React.JSX.Element;
