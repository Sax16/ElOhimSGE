import React from "react";
import { useStyleOnce } from "../../lib/useStyleOnce";

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

const CSS = `
.esge-avatar{
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  border-radius:var(--radius-full); background:var(--blue-100); color:var(--blue-700);
  font-family:var(--font-sans); font-weight:var(--weight-semibold); overflow:visible; flex-shrink:0;
  user-select:none;
}
[data-theme="dark"] .esge-avatar{ background:var(--blue-800); color:var(--blue-100); }
.esge-avatar--square{ border-radius:var(--radius-md); }
.esge-avatar__img{ width:100%; height:100%; object-fit:cover; border-radius:inherit; display:block; }
.esge-avatar__status{
  position:absolute; right:-1px; bottom:-1px; border-radius:var(--radius-full);
  border:2px solid var(--surface-card); width:30%; height:30%; min-width:8px; min-height:8px;
}
.esge-avatar__status--online{ background:var(--success); }
.esge-avatar__status--busy{ background:var(--danger); }
.esge-avatar__status--away{ background:var(--warning); }
.esge-avatar__status--offline{ background:var(--neutral-400); }

.esge-avatargroup{ display:inline-flex; }
.esge-avatargroup .esge-avatar{ box-shadow:0 0 0 2px var(--surface-card); }
.esge-avatargroup .esge-avatar + .esge-avatar{ margin-left:-10px; }
.esge-avatargroup__more{
  display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-full);
  background:var(--surface-sunken); color:var(--text-muted); font-weight:var(--weight-semibold);
  box-shadow:0 0 0 2px var(--surface-card); margin-left:-10px;
}
`;

const SIZES: Record<"xs" | "sm" | "md" | "lg" | "xl", number> = { xs: 24, sm: 32, md: 40, lg: 52, xl: 64 };

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

/** User/student avatar — photo, or initials fallback, with optional status. */
export function Avatar({
  name, src, size = "md", square = false, status, color, className = "", style, ...rest
}: AvatarProps) {
  useStyleOnce("esge-avatar-css", CSS);
  const px = typeof size === "number" ? size : SIZES[size] || 40;
  const cls = ["esge-avatar", square ? "esge-avatar--square" : "", className].filter(Boolean).join(" ");
  return (
    <span className={cls} style={{ width: px, height: px, fontSize: px * 0.4, ...(color ? { background: color, color: "#fff" } : {}), ...style }}
      title={name} {...rest}>
      {src ? <img className="esge-avatar__img" src={src} alt={name || ""} /> : initials(name)}
      {status && <span className={`esge-avatar__status esge-avatar__status--${status}`} />}
    </span>
  );
}

/** Overlapping stack of Avatars with a "+N" overflow chip. */
export function AvatarGroup({ size = "md", max = 4, className = "", children }: AvatarGroupProps) {
  useStyleOnce("esge-avatar-css", CSS);
  const px = typeof size === "number" ? size : SIZES[size] || 40;
  const items = React.Children.toArray(children);
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <span className={["esge-avatargroup", className].filter(Boolean).join(" ")}>
      {shown.map((c, i) => React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<{ size?: AvatarSize }>, { size, key: i }) : c)}
      {extra > 0 && (
        <span className="esge-avatargroup__more" style={{ width: px, height: px, fontSize: px * 0.36 }}>+{extra}</span>
      )}
    </span>
  );
}
