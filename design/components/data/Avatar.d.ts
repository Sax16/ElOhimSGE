import * as React from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;
export type AvatarStatus = "online" | "busy" | "away" | "offline";

/** User/student avatar: photo or initials fallback, optional status dot. */
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Full name — used for initials and tooltip. */
  name?: string;
  /** Image URL; falls back to initials if absent. */
  src?: string;
  /** @default "md" */
  size?: AvatarSize;
  /** Rounded-square instead of circle. */
  square?: boolean;
  /** Presence dot. */
  status?: AvatarStatus;
  /** Override the initials background color. */
  color?: string;
}

/** Overlapping stack of Avatars with a +N overflow chip. */
export interface AvatarGroupProps {
  size?: AvatarSize;
  /** Max avatars before collapsing into +N. @default 4 */
  max?: number;
  className?: string;
  children?: React.ReactNode;
}

export declare function Avatar(props: AvatarProps): React.JSX.Element;
export declare function AvatarGroup(props: AvatarGroupProps): React.JSX.Element;
