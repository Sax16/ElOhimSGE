/* @ds-bundle: {"format":4,"namespace":"ElohimSGEDesignSystem_956020","components":[{"name":"Avatar","sourcePath":"components/data/Avatar.jsx"},{"name":"AvatarGroup","sourcePath":"components/data/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data/Badge.jsx"},{"name":"Card","sourcePath":"components/data/Card.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"StatCard","sourcePath":"components/data/StatCard.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"Tag","sourcePath":"components/data/Tag.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"ToastStack","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Pagination.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Topbar","sourcePath":"components/navigation/Topbar.jsx"}],"sourceHashes":{"components/data/Avatar.jsx":"52cb8c2934c9","components/data/Badge.jsx":"32b9e6be122f","components/data/Card.jsx":"d2282c9339ef","components/data/ProgressBar.jsx":"e42e72921cc2","components/data/StatCard.jsx":"352f21eaac55","components/data/Table.jsx":"9ae3f7068132","components/data/Tag.jsx":"29e137557838","components/feedback/Alert.jsx":"56d35883b44f","components/feedback/Dialog.jsx":"fb43146d2386","components/feedback/EmptyState.jsx":"ce91f77779a3","components/feedback/Toast.jsx":"98353bd306a9","components/feedback/Tooltip.jsx":"f667d2c20c27","components/forms/Button.jsx":"389555e607f6","components/forms/Checkbox.jsx":"7bd7a1622b4f","components/forms/IconButton.jsx":"5b050dcd7e4d","components/forms/Input.jsx":"bf1aab57683b","components/forms/Radio.jsx":"b843af7550ec","components/forms/Select.jsx":"deb5946068e4","components/forms/Switch.jsx":"c94b871259d5","components/forms/Textarea.jsx":"6b9d226615c0","components/navigation/Breadcrumb.jsx":"9d460fa7e0d1","components/navigation/Pagination.jsx":"58f9b10f7dfc","components/navigation/Sidebar.jsx":"780cc7b55e0e","components/navigation/Tabs.jsx":"9ebdef64198a","components/navigation/Topbar.jsx":"663608c5c402","ui_kits/sge/AcademicStructureScreen.jsx":"ffc377832a4c","ui_kits/sge/AnnouncementsScreen.jsx":"5655dd97930b","ui_kits/sge/CalendarScreen.jsx":"42e53e62bd26","ui_kits/sge/CashierScreen.jsx":"cdd80379d487","ui_kits/sge/ConductScreen.jsx":"4e9262b53b02","ui_kits/sge/DashboardScreen.jsx":"5e05069d4ede","ui_kits/sge/EnrollmentScreen.jsx":"4304b1972bea","ui_kits/sge/FeesScreen.jsx":"acfde7da0e9a","ui_kits/sge/GradesScreen.jsx":"448a05682638","ui_kits/sge/GuardiansScreen.jsx":"8ef9cb875e02","ui_kits/sge/InventoryScreen.jsx":"c78f2f773129","ui_kits/sge/LoginScreen.jsx":"716bf5bc34a0","ui_kits/sge/PaymentsScreen.jsx":"c287a97fad81","ui_kits/sge/ReportsScreen.jsx":"45b59cbb27aa","ui_kits/sge/ScheduleScreen.jsx":"0f4518223b1f","ui_kits/sge/SettingsScreen.jsx":"8e0521ee81a6","ui_kits/sge/StaffScreen.jsx":"7e759c785078","ui_kits/sge/StudentsScreen.jsx":"7ca342f2bf31","ui_kits/sge/TeacherScreen.jsx":"5a24a7abb432","ui_kits/sge/TreasuryScreen.jsx":"8392ac956438","ui_kits/sge/icons.jsx":"e32a3fce8afc"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ElohimSGEDesignSystem_956020 = window.ElohimSGEDesignSystem_956020 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
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
const SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
  xl: 64
};
function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/** User/student avatar — photo, or initials fallback, with optional status. */
function Avatar({
  name,
  src,
  size = "md",
  square = false,
  status,
  color,
  className = "",
  style,
  ...rest
}) {
  useStyleOnce("esge-avatar-css", CSS);
  const px = typeof size === "number" ? size : SIZES[size] || 40;
  const cls = ["esge-avatar", square ? "esge-avatar--square" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    style: {
      width: px,
      height: px,
      fontSize: px * 0.4,
      ...(color ? {
        background: color,
        color: "#fff"
      } : {}),
      ...style
    },
    title: name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    className: "esge-avatar__img",
    src: src,
    alt: name || ""
  }) : initials(name), status && /*#__PURE__*/React.createElement("span", {
    className: `esge-avatar__status esge-avatar__status--${status}`
  }));
}

/** Overlapping stack of Avatars with a "+N" overflow chip. */
function AvatarGroup({
  size = "md",
  max = 4,
  className = "",
  children
}) {
  useStyleOnce("esge-avatar-css", CSS);
  const px = typeof size === "number" ? size : SIZES[size] || 40;
  const items = React.Children.toArray(children);
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return /*#__PURE__*/React.createElement("span", {
    className: ["esge-avatargroup", className].filter(Boolean).join(" ")
  }, shown.map((c, i) => React.isValidElement(c) ? React.cloneElement(c, {
    size,
    key: i
  }) : c), extra > 0 && /*#__PURE__*/React.createElement("span", {
    className: "esge-avatargroup__more",
    style: {
      width: px,
      height: px,
      fontSize: px * 0.36
    }
  }, "+", extra));
}
Object.assign(__ds_scope, { Avatar, AvatarGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-badge{
  display:inline-flex; align-items:center; gap:5px; height:22px; padding:0 8px;
  font:var(--type-caption); font-weight:var(--weight-semibold); line-height:1;
  border-radius:var(--radius-sm); border:1px solid transparent; white-space:nowrap;
}
.esge-badge--pill{ border-radius:var(--radius-pill); }
.esge-badge--sm{ height:18px; padding:0 6px; font-size:var(--text-2xs); }
.esge-badge__dot{ width:6px; height:6px; border-radius:var(--radius-full); background:currentColor; flex-shrink:0; }

.esge-badge--neutral{ background:var(--surface-sunken); color:var(--text-muted); border-color:var(--border-subtle); }
.esge-badge--brand{ background:var(--surface-brand-soft); color:var(--info-soft-fg); }
.esge-badge--success{ background:var(--success-soft); color:var(--success-soft-fg); }
.esge-badge--warning{ background:var(--warning-soft); color:var(--warning-soft-fg); }
.esge-badge--danger{ background:var(--danger-soft); color:var(--danger-soft-fg); }
.esge-badge--info{ background:var(--info-soft); color:var(--info-soft-fg); }
.esge-badge--accent{ background:var(--surface-accent-soft); color:var(--gold-700); }

.esge-badge--solid.esge-badge--brand{ background:var(--brand); color:var(--brand-fg); }
.esge-badge--solid.esge-badge--success{ background:var(--success); color:var(--success-fg); }
.esge-badge--solid.esge-badge--warning{ background:var(--warning); color:var(--warning-fg); }
.esge-badge--solid.esge-badge--danger{ background:var(--danger); color:var(--danger-fg); }
.esge-badge--solid.esge-badge--info{ background:var(--info); color:var(--info-fg); }
.esge-badge--solid.esge-badge--accent{ background:var(--accent); color:var(--accent-fg); }
.esge-badge--solid.esge-badge--neutral{ background:var(--neutral-600); color:#fff; }
`;

/** Compact status label. Use `dot` for status indicators (e.g. Activo/Retirado). */
function Badge({
  tone = "neutral",
  solid = false,
  pill = false,
  size = "md",
  dot = false,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-badge-css", CSS);
  const cls = ["esge-badge", `esge-badge--${tone}`, solid ? "esge-badge--solid" : "", pill ? "esge-badge--pill" : "", size === "sm" ? "esge-badge--sm" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    className: "esge-badge__dot",
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-card{
  background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); box-shadow:var(--shadow-sm);
  display:flex; flex-direction:column; overflow:hidden;
}
.esge-card--flat{ box-shadow:none; }
.esge-card--raised{ box-shadow:var(--shadow-md); }
.esge-card--interactive{ cursor:pointer; transition:box-shadow var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard); }
.esge-card--interactive:hover{ box-shadow:var(--shadow-md); border-color:var(--border-default); }
.esge-card--interactive:active{ transform:translateY(1px); }
.esge-card__header{ display:flex; align-items:center; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border-subtle); }
.esge-card__titles{ display:flex; flex-direction:column; gap:2px; min-width:0; flex:1; }
.esge-card__title{ font:var(--type-h3); color:var(--text-strong); }
.esge-card__subtitle{ font:var(--type-caption); color:var(--text-muted); }
.esge-card__actions{ display:flex; align-items:center; gap:8px; flex-shrink:0; }
.esge-card__body{ padding:18px; }
.esge-card__body--flush{ padding:0; }
.esge-card__footer{ padding:14px 18px; border-top:1px solid var(--border-subtle); display:flex; align-items:center; gap:10px; background:var(--surface-sunken); }
`;

/** Surface container with optional header (title/subtitle/actions) and footer. */
function Card({
  title,
  subtitle,
  actions,
  footer,
  elevation = "default",
  interactive = false,
  flush = false,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-card-css", CSS);
  const cls = ["esge-card", elevation === "flat" ? "esge-card--flat" : "", elevation === "raised" ? "esge-card--raised" : "", interactive ? "esge-card--interactive" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), (title || actions) && /*#__PURE__*/React.createElement("div", {
    className: "esge-card__header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "esge-card__titles"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "esge-card__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "esge-card__subtitle"
  }, subtitle)), actions && /*#__PURE__*/React.createElement("div", {
    className: "esge-card__actions"
  }, actions)), /*#__PURE__*/React.createElement("div", {
    className: ["esge-card__body", flush ? "esge-card__body--flush" : ""].filter(Boolean).join(" ")
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "esge-card__footer"
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Card.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-progress{ display:flex; flex-direction:column; gap:6px; width:100%; }
.esge-progress__head{ display:flex; justify-content:space-between; align-items:center; font:var(--type-caption); color:var(--text-muted); }
.esge-progress__value{ font-family:var(--font-mono); font-weight:var(--weight-medium); color:var(--text-body); }
.esge-progress__track{
  position:relative; width:100%; height:8px; border-radius:var(--radius-pill);
  background:var(--surface-sunken); overflow:hidden;
}
.esge-progress--sm .esge-progress__track{ height:5px; }
.esge-progress--lg .esge-progress__track{ height:12px; }
.esge-progress__fill{
  position:absolute; left:0; top:0; bottom:0; border-radius:inherit;
  background:var(--brand); transition:width var(--duration-slow) var(--ease-out);
}
.esge-progress__fill--success{ background:var(--success); }
.esge-progress__fill--warning{ background:var(--warning); }
.esge-progress__fill--danger{ background:var(--danger); }
.esge-progress__fill--accent{ background:var(--accent); }
.esge-progress__fill--striped{
  background-image:linear-gradient(45deg, rgba(255,255,255,.22) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.22) 50%, rgba(255,255,255,.22) 75%, transparent 75%);
  background-size:16px 16px;
}
`;

/** Linear progress / ratio bar (asistencia, cobranza, avance de notas). */
function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  tone = "brand",
  size = "md",
  striped = false,
  valueFormat,
  className = "",
  ...rest
}) {
  useStyleOnce("esge-progress-css", CSS);
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const display = valueFormat ? valueFormat(value, max) : `${Math.round(pct)}%`;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["esge-progress", `esge-progress--${size}`, className].filter(Boolean).join(" ")
  }, rest), (label || showValue) && /*#__PURE__*/React.createElement("div", {
    className: "esge-progress__head"
  }, /*#__PURE__*/React.createElement("span", null, label), showValue && /*#__PURE__*/React.createElement("span", {
    className: "esge-progress__value"
  }, display)), /*#__PURE__*/React.createElement("div", {
    className: "esge-progress__track",
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max
  }, /*#__PURE__*/React.createElement("span", {
    className: ["esge-progress__fill", `esge-progress__fill--${tone}`, striped ? "esge-progress__fill--striped" : ""].filter(Boolean).join(" "),
    style: {
      width: pct + "%"
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-stat{
  position:relative; background:var(--surface-card); border:1px solid var(--border-subtle);
  border-radius:var(--radius-lg); padding:18px 20px; box-shadow:var(--shadow-sm);
  display:flex; flex-direction:column; gap:10px; min-width:0;
}
.esge-stat__top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.esge-stat__label{ font:var(--type-caption); text-transform:uppercase; letter-spacing:var(--tracking-caps); font-weight:var(--weight-semibold); color:var(--text-muted); }
.esge-stat__icon{
  display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px;
  border-radius:var(--radius-md); background:var(--surface-brand-soft); color:var(--brand); flex-shrink:0;
}
.esge-stat__icon svg{ width:20px; height:20px; }
.esge-stat__icon--accent{ background:var(--surface-accent-soft); color:var(--gold-600); }
.esge-stat__icon--success{ background:var(--success-soft); color:var(--success); }
.esge-stat__icon--danger{ background:var(--danger-soft); color:var(--danger); }
.esge-stat__value{ font-family:var(--font-sans); font-weight:var(--weight-bold); font-size:var(--text-3xl); color:var(--text-strong); line-height:1; letter-spacing:var(--tracking-tight); font-variant-numeric:tabular-nums; }
.esge-stat__foot{ display:flex; align-items:center; gap:8px; font:var(--type-caption); color:var(--text-muted); }
.esge-stat__delta{ display:inline-flex; align-items:center; gap:3px; font-weight:var(--weight-semibold); }
.esge-stat__delta--up{ color:var(--success); }
.esge-stat__delta--down{ color:var(--danger); }
.esge-stat__delta svg{ width:13px; height:13px; }
`;
const ArrowUp = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "19",
  x2: "12",
  y2: "5"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "5 12 12 5 19 12"
}));
const ArrowDown = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.5",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "5",
  x2: "12",
  y2: "19"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "19 12 12 19 5 12"
}));

/** Dashboard KPI tile: label, big figure, optional trend delta and icon. */
function StatCard({
  label,
  value,
  icon,
  iconTone = "brand",
  delta,
  deltaDirection,
  caption,
  className = "",
  ...rest
}) {
  useStyleOnce("esge-stat-css", CSS);
  const dir = deltaDirection || (typeof delta === "number" ? delta >= 0 ? "up" : "down" : null);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["esge-stat", className].filter(Boolean).join(" ")
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "esge-stat__top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "esge-stat__label"
  }, label), icon && /*#__PURE__*/React.createElement("span", {
    className: `esge-stat__icon esge-stat__icon--${iconTone}`
  }, icon)), /*#__PURE__*/React.createElement("div", {
    className: "esge-stat__value"
  }, value), (delta != null || caption) && /*#__PURE__*/React.createElement("div", {
    className: "esge-stat__foot"
  }, delta != null && /*#__PURE__*/React.createElement("span", {
    className: `esge-stat__delta esge-stat__delta--${dir}`
  }, dir === "up" ? /*#__PURE__*/React.createElement(ArrowUp, null) : /*#__PURE__*/React.createElement(ArrowDown, null), typeof delta === "number" ? `${Math.abs(delta)}%` : delta), caption && /*#__PURE__*/React.createElement("span", null, caption)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-table-wrap{ width:100%; overflow-x:auto; }
.esge-table{ width:100%; border-collapse:separate; border-spacing:0; font:var(--type-body); }
.esge-table th, .esge-table td{ text-align:left; padding:11px 16px; vertical-align:middle; }
.esge-table thead th{
  font:var(--type-caption); text-transform:uppercase; letter-spacing:var(--tracking-caps);
  font-weight:var(--weight-semibold); color:var(--text-muted); background:var(--surface-sunken);
  border-bottom:1px solid var(--border-subtle); white-space:nowrap; position:sticky; top:0;
}
.esge-table thead th:first-child{ border-top-left-radius:var(--radius-md); }
.esge-table thead th:last-child{ border-top-right-radius:var(--radius-md); }
.esge-table tbody td{ border-bottom:1px solid var(--border-subtle); color:var(--text-body); }
.esge-table tbody tr:last-child td{ border-bottom:none; }
.esge-table--hover tbody tr{ transition:background var(--duration-fast); }
.esge-table--hover tbody tr:hover{ background:var(--surface-hover); }
.esge-table--zebra tbody tr:nth-child(even){ background:var(--surface-sunken); }
.esge-table--zebra.esge-table--hover tbody tr:hover{ background:var(--surface-hover); }
.esge-table tbody tr[data-selected="true"]{ background:var(--surface-brand-soft); }
.esge-table--compact th, .esge-table--compact td{ padding:7px 12px; }
.esge-table th.esge-num, .esge-table td.esge-num{ text-align:right; font-variant-numeric:tabular-nums; }
.esge-table th.esge-center, .esge-table td.esge-center{ text-align:center; }
.esge-table__sort{ display:inline-flex; align-items:center; gap:5px; cursor:pointer; user-select:none; }
.esge-table__sort:hover{ color:var(--text-body); }
.esge-table__sort svg{ width:13px; height:13px; opacity:.5; }
.esge-table__sort--active svg{ opacity:1; color:var(--brand); }
.esge-table__cellmuted{ color:var(--text-muted); }
.esge-mono{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; }
`;
const SortIcon = ({
  dir
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2.4",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, dir === "asc" ? /*#__PURE__*/React.createElement("polyline", {
  points: "18 15 12 9 6 15"
}) : dir === "desc" ? /*#__PURE__*/React.createElement("polyline", {
  points: "6 9 12 15 18 9"
}) : /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("polyline", {
  points: "8 9 12 5 16 9"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "16 15 12 19 8 15"
})));

/**
 * Config-driven data table. Columns: { key, header, align, width, mono, render }.
 * Sorting is presentation-only (caller sorts data and passes sort/onSort).
 */
function Table({
  columns = [],
  data = [],
  rowKey = "id",
  hover = true,
  zebra = false,
  compact = false,
  sort,
  onSort,
  onRowClick,
  selectedKeys,
  emptyText = "Sin registros",
  className = "",
  ...rest
}) {
  useStyleOnce("esge-table-css", CSS);
  const getKey = (row, i) => typeof rowKey === "function" ? rowKey(row, i) : row[rowKey] ?? i;
  const sel = selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys || []);
  const cls = ["esge-table", hover ? "esge-table--hover" : "", zebra ? "esge-table--zebra" : "", compact ? "esge-table--compact" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "esge-table-wrap"
  }, rest), /*#__PURE__*/React.createElement("table", {
    className: cls
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(col => {
    const alignCls = col.align === "right" || col.num ? "esge-num" : col.align === "center" ? "esge-center" : "";
    const active = sort && sort.key === col.key;
    return /*#__PURE__*/React.createElement("th", {
      key: col.key,
      className: alignCls,
      style: col.width ? {
        width: col.width
      } : undefined
    }, col.sortable && onSort ? /*#__PURE__*/React.createElement("span", {
      className: ["esge-table__sort", active ? "esge-table__sort--active" : ""].filter(Boolean).join(" "),
      onClick: () => onSort(col.key, active && sort.dir === "asc" ? "desc" : "asc")
    }, col.header, /*#__PURE__*/React.createElement(SortIcon, {
      dir: active ? sort.dir : null
    })) : col.header);
  }))), /*#__PURE__*/React.createElement("tbody", null, data.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      textAlign: "center",
      color: "var(--text-muted)",
      padding: "32px 16px"
    }
  }, emptyText)) : data.map((row, i) => {
    const k = getKey(row, i);
    return /*#__PURE__*/React.createElement("tr", {
      key: k,
      "data-selected": sel.has(k) || undefined,
      onClick: onRowClick ? () => onRowClick(row, i) : undefined,
      style: onRowClick ? {
        cursor: "pointer"
      } : undefined
    }, columns.map(col => {
      const alignCls = col.align === "right" || col.num ? "esge-num" : col.align === "center" ? "esge-center" : "";
      const monoCls = col.mono ? "esge-mono" : "";
      const content = col.render ? col.render(row[col.key], row, i) : row[col.key];
      return /*#__PURE__*/React.createElement("td", {
        key: col.key,
        className: [alignCls, monoCls].filter(Boolean).join(" ")
      }, content);
    }));
  }))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/data/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-tag{
  display:inline-flex; align-items:center; gap:6px; height:26px; padding:0 10px;
  font:var(--type-label); border-radius:var(--radius-md);
  background:var(--surface-sunken); color:var(--text-body); border:1px solid var(--border-subtle);
  white-space:nowrap;
}
.esge-tag--clickable{ cursor:pointer; transition:background var(--duration-fast), border-color var(--duration-fast); }
.esge-tag--clickable:hover{ background:var(--surface-hover); border-color:var(--border-default); }
.esge-tag--selected{ background:var(--surface-brand-soft); border-color:var(--border-brand); color:var(--info-soft-fg); }
.esge-tag__remove{
  display:inline-flex; align-items:center; justify-content:center; width:16px; height:16px;
  border:none; background:transparent; color:inherit; cursor:pointer; opacity:.65; border-radius:var(--radius-full);
  margin-right:-3px;
}
.esge-tag__remove:hover{ opacity:1; background:rgba(0,0,0,0.08); }
.esge-tag__remove svg{ width:11px; height:11px; }
.esge-tag__dot{ width:8px; height:8px; border-radius:var(--radius-full); flex-shrink:0; }
`;

/** Chip for filters, keywords and multi-select tokens; optionally removable. */
function Tag({
  selected = false,
  onRemove,
  color,
  leadingDot = false,
  className = "",
  children,
  onClick,
  ...rest
}) {
  useStyleOnce("esge-tag-css", CSS);
  const clickable = !!onClick;
  const cls = ["esge-tag", clickable ? "esge-tag--clickable" : "", selected ? "esge-tag--selected" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    onClick: onClick
  }, rest), leadingDot && /*#__PURE__*/React.createElement("span", {
    className: "esge-tag__dot",
    style: {
      background: color || "var(--brand)"
    },
    "aria-hidden": "true"
  }), children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "esge-tag__remove",
    "aria-label": "Quitar",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-alert{
  display:flex; gap:12px; padding:14px 16px; border-radius:var(--radius-md);
  border:1px solid transparent; background:var(--surface-card); position:relative;
}
.esge-alert__icon{ flex-shrink:0; width:20px; height:20px; margin-top:1px; }
.esge-alert__icon svg{ width:20px; height:20px; }
.esge-alert__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.esge-alert__title{ font:var(--type-label); font-weight:var(--weight-semibold); color:var(--text-strong); }
.esge-alert__msg{ font:var(--type-body); color:var(--text-body); }
.esge-alert__msg p{ margin:0; }
.esge-alert__actions{ display:flex; gap:8px; margin-top:8px; }
.esge-alert__close{ flex-shrink:0; background:transparent; border:none; cursor:pointer; color:var(--text-muted); padding:2px; border-radius:var(--radius-xs); display:inline-flex; height:fit-content; }
.esge-alert__close:hover{ color:var(--text-body); background:var(--surface-hover); }
.esge-alert__close svg{ width:16px; height:16px; }

.esge-alert--info{ background:var(--info-soft); border-color:color-mix(in srgb, var(--info) 28%, transparent); }
.esge-alert--info .esge-alert__icon{ color:var(--info); }
.esge-alert--success{ background:var(--success-soft); border-color:color-mix(in srgb, var(--success) 28%, transparent); }
.esge-alert--success .esge-alert__icon{ color:var(--success); }
.esge-alert--warning{ background:var(--warning-soft); border-color:color-mix(in srgb, var(--warning) 32%, transparent); }
.esge-alert--warning .esge-alert__icon{ color:var(--warning); }
.esge-alert--danger{ background:var(--danger-soft); border-color:color-mix(in srgb, var(--danger) 28%, transparent); }
.esge-alert--danger .esge-alert__icon{ color:var(--danger); }
`;
const ICONS = {
  info: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "16",
    x2: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "8",
    x2: "12.01",
    y2: "8"
  })),
  success: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22 4 12 14.01 9 11.01"
  })),
  warning: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "9",
    x2: "12",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17"
  })),
  danger: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15",
    y1: "9",
    x2: "9",
    y2: "15"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "9",
    x2: "15",
    y2: "15"
  }))
};

/** Inline contextual message banner. */
function Alert({
  tone = "info",
  title,
  icon,
  onClose,
  actions,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-alert-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "alert",
    className: ["esge-alert", `esge-alert--${tone}`, className].filter(Boolean).join(" ")
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "esge-alert__icon",
    "aria-hidden": "true"
  }, icon || ICONS[tone]), /*#__PURE__*/React.createElement("div", {
    className: "esge-alert__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "esge-alert__title"
  }, title), children && /*#__PURE__*/React.createElement("div", {
    className: "esge-alert__msg"
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    className: "esge-alert__actions"
  }, actions)), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "esge-alert__close",
    "aria-label": "Cerrar",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }))));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
@keyframes esge-overlay-in{ from{ opacity:0; } to{ opacity:1; } }
@keyframes esge-dialog-in{ from{ opacity:0; transform:translateY(12px) scale(.98); } to{ opacity:1; transform:none; } }
.esge-overlay{
  position:fixed; inset:0; z-index:var(--z-modal); display:flex; align-items:center; justify-content:center;
  padding:24px; background:rgba(15,34,52,0.55); backdrop-filter:blur(2px);
  animation:esge-overlay-in var(--duration-fast) var(--ease-standard);
}
.esge-dialog{
  background:var(--surface-raised); border:1px solid var(--border-subtle); border-radius:var(--radius-xl);
  box-shadow:var(--shadow-xl); width:100%; max-width:480px; max-height:calc(100vh - 48px);
  display:flex; flex-direction:column; overflow:hidden; animation:esge-dialog-in var(--duration-normal) var(--ease-out);
}
.esge-dialog--sm{ max-width:380px; }
.esge-dialog--lg{ max-width:640px; }
.esge-dialog--xl{ max-width:840px; }
.esge-dialog__header{ display:flex; align-items:flex-start; gap:12px; padding:18px 20px 14px; }
.esge-dialog__icon{ flex-shrink:0; width:38px; height:38px; border-radius:var(--radius-md); display:inline-flex; align-items:center; justify-content:center; background:var(--surface-brand-soft); color:var(--brand); }
.esge-dialog__icon--danger{ background:var(--danger-soft); color:var(--danger); }
.esge-dialog__icon--warning{ background:var(--warning-soft); color:var(--warning); }
.esge-dialog__icon--success{ background:var(--success-soft); color:var(--success); }
.esge-dialog__icon svg{ width:20px; height:20px; }
.esge-dialog__titles{ flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
.esge-dialog__title{ font:var(--type-h3); color:var(--text-strong); }
.esge-dialog__desc{ font:var(--type-caption); color:var(--text-muted); }
.esge-dialog__close{ flex-shrink:0; background:transparent; border:none; cursor:pointer; color:var(--text-muted); padding:4px; border-radius:var(--radius-sm); margin:-2px -4px 0 0; }
.esge-dialog__close:hover{ color:var(--text-body); background:var(--surface-hover); }
.esge-dialog__close svg{ width:18px; height:18px; }
.esge-dialog__body{ padding:0 20px 16px; overflow-y:auto; font:var(--type-body); color:var(--text-body); }
.esge-dialog__body--padtop{ padding-top:4px; }
.esge-dialog__footer{ display:flex; align-items:center; justify-content:flex-end; gap:10px; padding:14px 20px; border-top:1px solid var(--border-subtle); background:var(--surface-sunken); }
`;

/** Modal dialog. Controlled via `open`; close on overlay click / Esc / ✕. */
function Dialog({
  open,
  onClose,
  title,
  description,
  icon,
  iconTone = "brand",
  size = "md",
  footer,
  closeOnOverlay = true,
  showClose = true,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-dialog-css", CSS);
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "esge-overlay",
    onMouseDown: e => {
      if (closeOnOverlay && e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    className: ["esge-dialog", `esge-dialog--${size}`, className].filter(Boolean).join(" ")
  }, rest), (title || icon || showClose) && /*#__PURE__*/React.createElement("div", {
    className: "esge-dialog__header"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: `esge-dialog__icon esge-dialog__icon--${iconTone}`
  }, icon), /*#__PURE__*/React.createElement("div", {
    className: "esge-dialog__titles"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "esge-dialog__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "esge-dialog__desc"
  }, description)), showClose && onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "esge-dialog__close",
    "aria-label": "Cerrar",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  })))), children && /*#__PURE__*/React.createElement("div", {
    className: ["esge-dialog__body", !(title || icon) ? "esge-dialog__body--padtop" : ""].filter(Boolean).join(" ")
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "esge-dialog__footer"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-empty{ display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; padding:40px 24px; }
.esge-empty__icon{
  width:56px; height:56px; border-radius:var(--radius-full); display:inline-flex; align-items:center; justify-content:center;
  background:var(--surface-sunken); color:var(--text-subtle); margin-bottom:6px;
}
.esge-empty__icon svg{ width:26px; height:26px; }
.esge-empty__title{ font:var(--type-h3); color:var(--text-strong); }
.esge-empty__desc{ font:var(--type-body); color:var(--text-muted); max-width:380px; }
.esge-empty__actions{ display:flex; gap:10px; margin-top:14px; }
.esge-empty--sm{ padding:26px 18px; }
.esge-empty--sm .esge-empty__icon{ width:44px; height:44px; }
.esge-empty--sm .esge-empty__icon svg{ width:21px; height:21px; }
`;

/** Placeholder for empty lists, no search results, or unconfigured sections. */
function EmptyState({
  icon,
  title,
  description,
  actions,
  size = "md",
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-empty-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["esge-empty", size === "sm" ? "esge-empty--sm" : "", className].filter(Boolean).join(" ")
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    className: "esge-empty__icon",
    "aria-hidden": "true"
  }, icon), title && /*#__PURE__*/React.createElement("div", {
    className: "esge-empty__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "esge-empty__desc"
  }, description), children, actions && /*#__PURE__*/React.createElement("div", {
    className: "esge-empty__actions"
  }, actions));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
@keyframes esge-toast-in{ from{ opacity:0; transform:translateY(8px) scale(.98); } to{ opacity:1; transform:none; } }
.esge-toaststack{ position:fixed; z-index:var(--z-toast); display:flex; flex-direction:column; gap:10px; pointer-events:none; padding:16px; }
.esge-toaststack--top-right{ top:0; right:0; align-items:flex-end; }
.esge-toaststack--bottom-right{ bottom:0; right:0; align-items:flex-end; }
.esge-toaststack--bottom-left{ bottom:0; left:0; align-items:flex-start; }
.esge-toaststack--top-center{ top:0; left:50%; transform:translateX(-50%); align-items:center; }
.esge-toast{
  pointer-events:auto; display:flex; gap:11px; align-items:flex-start; width:340px; max-width:88vw;
  background:var(--surface-raised); border:1px solid var(--border-subtle); border-radius:var(--radius-md);
  box-shadow:var(--shadow-lg); padding:13px 14px; animation:esge-toast-in var(--duration-normal) var(--ease-out);
}
.esge-toast__bar{ position:absolute; }
.esge-toast__accent{ width:3px; align-self:stretch; border-radius:3px; flex-shrink:0; }
.esge-toast__accent--info{ background:var(--info); }
.esge-toast__accent--success{ background:var(--success); }
.esge-toast__accent--warning{ background:var(--warning); }
.esge-toast__accent--danger{ background:var(--danger); }
.esge-toast__icon{ flex-shrink:0; width:20px; height:20px; margin-top:1px; }
.esge-toast__icon--info{ color:var(--info); }
.esge-toast__icon--success{ color:var(--success); }
.esge-toast__icon--warning{ color:var(--warning); }
.esge-toast__icon--danger{ color:var(--danger); }
.esge-toast__icon svg{ width:20px; height:20px; }
.esge-toast__body{ flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.esge-toast__title{ font:var(--type-label); font-weight:var(--weight-semibold); color:var(--text-strong); }
.esge-toast__msg{ font:var(--type-caption); color:var(--text-muted); }
.esge-toast__close{ background:transparent; border:none; cursor:pointer; color:var(--text-subtle); padding:2px; border-radius:var(--radius-xs); }
.esge-toast__close:hover{ color:var(--text-body); background:var(--surface-hover); }
.esge-toast__close svg{ width:15px; height:15px; }
`;
const ICONS = {
  info: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "16",
    x2: "12",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "8",
    x2: "12.01",
    y2: "8"
  })),
  success: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22 4 12 14.01 9 11.01"
  })),
  warning: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "9",
    x2: "12",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "17",
    x2: "12.01",
    y2: "17"
  })),
  danger: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15",
    y1: "9",
    x2: "9",
    y2: "15"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "9",
    y1: "9",
    x2: "15",
    y2: "15"
  }))
};

/** Single toast notification (presentational). */
function Toast({
  tone = "info",
  title,
  message,
  onClose,
  className = "",
  ...rest
}) {
  useStyleOnce("esge-toast-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["esge-toast", className].filter(Boolean).join(" "),
    role: "status"
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: `esge-toast__accent esge-toast__accent--${tone}`
  }), /*#__PURE__*/React.createElement("span", {
    className: `esge-toast__icon esge-toast__icon--${tone}`,
    "aria-hidden": "true"
  }, ICONS[tone]), /*#__PURE__*/React.createElement("div", {
    className: "esge-toast__body"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "esge-toast__title"
  }, title), message && /*#__PURE__*/React.createElement("div", {
    className: "esge-toast__msg"
  }, message)), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "esge-toast__close",
    "aria-label": "Cerrar",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }))));
}

/** Fixed container that stacks Toasts in a screen corner. */
function ToastStack({
  position = "bottom-right",
  className = "",
  children
}) {
  useStyleOnce("esge-toast-css", CSS);
  return /*#__PURE__*/React.createElement("div", {
    className: ["esge-toaststack", `esge-toaststack--${position}`, className].filter(Boolean).join(" ")
  }, children);
}
Object.assign(__ds_scope, { Toast, ToastStack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-tip-wrap{ position:relative; display:inline-flex; }
.esge-tip{
  position:absolute; z-index:var(--z-tooltip); pointer-events:none;
  background:var(--surface-inverse); color:var(--text-inverse);
  font:var(--type-caption); font-weight:var(--weight-medium); padding:6px 9px; border-radius:var(--radius-sm);
  box-shadow:var(--shadow-md); max-width:240px; white-space:normal; width:max-content;
  display:none; /* fuera del layout: no genera scroll fantasma en contenedores overflow:auto */
}
[data-theme="dark"] .esge-tip{ color:var(--neutral-900); }
@keyframes esge-tip-in{ from{ opacity:0; transform:scale(.96); } to{ opacity:1; transform:none; } }
.esge-tip-wrap:hover .esge-tip, .esge-tip-wrap:focus-within .esge-tip{ display:block; animation:esge-tip-in var(--duration-fast) var(--ease-standard) both; }
.esge-tip::after{ content:""; position:absolute; width:7px; height:7px; background:inherit; transform:rotate(45deg); }
.esge-tip--top{ bottom:calc(100% + 8px); left:50%; transform-origin:bottom center; translate:-50% 0; }
.esge-tip--top::after{ bottom:-3px; left:50%; margin-left:-3px; }
.esge-tip--bottom{ top:calc(100% + 8px); left:50%; transform-origin:top center; translate:-50% 0; }
.esge-tip--bottom::after{ top:-3px; left:50%; margin-left:-3px; }
.esge-tip--left{ right:calc(100% + 8px); top:50%; transform-origin:right center; translate:0 -50%; }
.esge-tip--left::after{ right:-3px; top:50%; margin-top:-3px; }
.esge-tip--right{ left:calc(100% + 8px); top:50%; transform-origin:left center; translate:0 -50%; }
.esge-tip--right::after{ left:-3px; top:50%; margin-top:-3px; }
`;

/** Hover/focus tooltip wrapping a single trigger element. */
function Tooltip({
  content,
  side = "top",
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-tooltip-css", CSS);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ["esge-tip-wrap", className].filter(Boolean).join(" ")
  }, rest), children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    className: `esge-tip esge-tip--${side}`
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Injects a component's CSS once per document. */
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-btn{
  --_h:38px; --_px:16px; --_fs:var(--text-base); --_gap:8px;
  display:inline-flex; align-items:center; justify-content:center; gap:var(--_gap);
  height:var(--_h); padding:0 var(--_px); font-family:var(--font-sans);
  font-size:var(--_fs); font-weight:var(--weight-semibold); line-height:1;
  border-radius:var(--radius-md); border:1px solid transparent; cursor:pointer;
  white-space:nowrap; user-select:none; text-decoration:none;
  transition:background var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}
.esge-btn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.esge-btn:active{ transform:translateY(0.5px); }
.esge-btn[disabled],.esge-btn[aria-disabled="true"]{ opacity:.5; cursor:not-allowed; transform:none; }
.esge-btn--block{ width:100%; }

/* sizes */
.esge-btn--sm{ --_h:32px; --_px:12px; --_fs:var(--text-sm); --_gap:6px; }
.esge-btn--lg{ --_h:46px; --_px:22px; --_fs:var(--text-md); --_gap:10px; }

/* variants */
.esge-btn--primary{ background:var(--brand); color:var(--brand-fg); box-shadow:var(--shadow-xs); }
.esge-btn--primary:hover{ background:var(--brand-hover); }
.esge-btn--primary:active{ background:var(--brand-active); }

.esge-btn--accent{ background:var(--accent); color:var(--accent-fg); box-shadow:var(--shadow-xs); }
.esge-btn--accent:hover{ background:var(--accent-hover); }
.esge-btn--accent:active{ background:var(--accent-active); }

.esge-btn--secondary{ background:var(--surface-card); color:var(--text-body); border-color:var(--border-default); box-shadow:var(--shadow-xs); }
.esge-btn--secondary:hover{ background:var(--surface-hover); border-color:var(--border-strong); }
.esge-btn--secondary:active{ background:var(--surface-active); }

.esge-btn--ghost{ background:transparent; color:var(--text-body); }
.esge-btn--ghost:hover{ background:var(--surface-hover); }
.esge-btn--ghost:active{ background:var(--surface-active); }

.esge-btn--danger{ background:var(--danger); color:var(--danger-fg); box-shadow:var(--shadow-xs); }
.esge-btn--danger:hover{ filter:brightness(0.94); }

.esge-btn--link{ background:transparent; color:var(--text-link); height:auto; padding:0; border-radius:var(--radius-xs); }
.esge-btn--link:hover{ text-decoration:underline; }
`;

/**
 * Primary action control for Elohim SGE.
 */
function Button({
  variant = "primary",
  size = "md",
  block = false,
  iconLeft = null,
  iconRight = null,
  disabled = false,
  type = "button",
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-button-css", CSS);
  const cls = ["esge-btn", `esge-btn--${variant}`, size !== "md" ? `esge-btn--${size}` : "", block ? "esge-btn--block" : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled
  }, rest), iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "esge-btn__icon",
    "aria-hidden": "true",
    style: {
      display: "inline-flex"
    }
  }, iconLeft), children && /*#__PURE__*/React.createElement("span", null, children), iconRight && /*#__PURE__*/React.createElement("span", {
    className: "esge-btn__icon",
    "aria-hidden": "true",
    style: {
      display: "inline-flex"
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-check{ display:inline-flex; align-items:flex-start; gap:10px; cursor:pointer; font:var(--type-body); color:var(--text-body); }
.esge-check--disabled{ cursor:not-allowed; opacity:.55; }
.esge-check__box{
  position:relative; flex-shrink:0; width:18px; height:18px; margin-top:1px;
  border:1.5px solid var(--border-strong); border-radius:var(--radius-xs);
  background:var(--surface-card); display:inline-flex; align-items:center; justify-content:center;
  transition:background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-check__native{ position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:inherit; }
.esge-check__tick{ width:12px; height:12px; color:#fff; opacity:0; transform:scale(.6); transition:opacity var(--duration-fast), transform var(--duration-fast) var(--ease-out); }
.esge-check__native:checked ~ .esge-check__tick:not(.esge-check__tick--dash){ opacity:1; transform:scale(1); }
.esge-check__native:indeterminate ~ .esge-check__tick--dash{ opacity:1; transform:scale(1); }
.esge-check__box:has(.esge-check__native:checked),
.esge-check__box:has(.esge-check__native:indeterminate){ background:var(--brand); border-color:var(--brand); }
.esge-check__box:has(.esge-check__native:focus-visible){ box-shadow:var(--shadow-focus); }
.esge-check:hover .esge-check__box:has(.esge-check__native:not(:disabled)){ border-color:var(--brand); }
.esge-check__body{ display:flex; flex-direction:column; gap:2px; }
.esge-check__desc{ font:var(--type-caption); color:var(--text-muted); }
`;

/** Checkbox with label and optional description; supports indeterminate. */
function Checkbox({
  label,
  description,
  checked,
  indeterminate = false,
  disabled = false,
  id,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-checkbox-css", CSS);
  const ref = React.useRef(null);
  const autoId = React.useId();
  const fieldId = id || autoId;
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return /*#__PURE__*/React.createElement("label", {
    className: ["esge-check", disabled ? "esge-check--disabled" : "", className].filter(Boolean).join(" "),
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("span", {
    className: "esge-check__box"
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    id: fieldId,
    type: "checkbox",
    className: "esge-check__native",
    checked: checked,
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("svg", {
    className: "esge-check__tick",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  })), /*#__PURE__*/React.createElement("svg", {
    className: "esge-check__tick esge-check__tick--dash",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    "aria-hidden": "true",
    style: {
      position: "absolute"
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "12",
    x2: "18",
    y2: "12"
  }))), (label || description || children) && /*#__PURE__*/React.createElement("span", {
    className: "esge-check__body"
  }, (label || children) && /*#__PURE__*/React.createElement("span", null, label || children), description && /*#__PURE__*/React.createElement("span", {
    className: "esge-check__desc"
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-iconbtn{
  --_s:38px;
  display:inline-flex; align-items:center; justify-content:center;
  width:var(--_s); height:var(--_s); padding:0; cursor:pointer;
  border-radius:var(--radius-md); border:1px solid transparent;
  background:transparent; color:var(--text-muted);
  transition:background var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-iconbtn svg{ width:1.15em; height:1.15em; display:block; }
.esge-iconbtn:focus-visible{ outline:none; box-shadow:var(--shadow-focus); }
.esge-iconbtn[disabled]{ opacity:.45; cursor:not-allowed; }
.esge-iconbtn--sm{ --_s:32px; font-size:var(--text-sm); }
.esge-iconbtn--lg{ --_s:46px; font-size:var(--text-lg); }

.esge-iconbtn--ghost:hover{ background:var(--surface-hover); color:var(--text-body); }
.esge-iconbtn--ghost:active{ background:var(--surface-active); }

.esge-iconbtn--outline{ border-color:var(--border-default); color:var(--text-body); background:var(--surface-card); }
.esge-iconbtn--outline:hover{ background:var(--surface-hover); border-color:var(--border-strong); }

.esge-iconbtn--solid{ background:var(--brand); color:var(--brand-fg); }
.esge-iconbtn--solid:hover{ background:var(--brand-hover); }

.esge-iconbtn--danger:hover{ background:var(--danger-soft); color:var(--danger); }
`;

/** Square, label-less button wrapping a single icon. */
function IconButton({
  variant = "ghost",
  size = "md",
  label,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-iconbtn-css", CSS);
  const cls = ["esge-iconbtn", `esge-iconbtn--${variant}`, size !== "md" ? `esge-iconbtn--${size}` : "", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-label": label,
    title: label,
    disabled: disabled
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-field{ display:flex; flex-direction:column; gap:6px; }
.esge-field__label{ font:var(--type-label); color:var(--text-strong); display:flex; gap:4px; align-items:center; }
.esge-field__req{ color:var(--danger); }
.esge-field__hint{ font:var(--type-caption); color:var(--text-muted); }
.esge-field__hint--error{ color:var(--danger); }

.esge-input{
  --_h:38px;
  display:flex; align-items:center; gap:8px;
  height:var(--_h); padding:0 12px; background:var(--surface-card);
  border:1px solid var(--border-default); border-radius:var(--radius-md);
  color:var(--text-body); transition:border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard);
}
.esge-input:hover{ border-color:var(--border-strong); }
.esge-input:focus-within{ border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-input--sm{ --_h:32px; padding:0 10px; font-size:var(--text-sm); }
.esge-input--lg{ --_h:46px; padding:0 14px; }
.esge-input--error{ border-color:var(--danger); }
.esge-input--error:focus-within{ box-shadow:0 0 0 3px var(--danger-soft); }
.esge-input--disabled{ background:var(--surface-sunken); color:var(--text-subtle); cursor:not-allowed; }

.esge-input__control{
  flex:1; min-width:0; border:none; outline:none; background:transparent;
  font-family:var(--font-sans); font-size:var(--text-base); color:inherit; height:100%;
}
.esge-input__control::placeholder{ color:var(--text-subtle); }
.esge-input__control:disabled{ cursor:not-allowed; }
.esge-input__affix{ display:inline-flex; align-items:center; color:var(--text-muted); flex-shrink:0; }
.esge-input__affix svg{ width:18px; height:18px; display:block; }
.esge-input__affix--text{ font:var(--type-mono); color:var(--text-muted); }
`;

/** Labeled text input with optional icon/prefix, hint and error states. */
function Input({
  label,
  hint,
  error,
  required = false,
  size = "md",
  iconLeft = null,
  prefix = null,
  suffix = null,
  disabled = false,
  id,
  className = "",
  containerStyle,
  ...rest
}) {
  useStyleOnce("esge-input-css", CSS);
  const autoId = React.useId();
  const fieldId = id || autoId;
  const wrapCls = ["esge-input", size !== "md" ? `esge-input--${size}` : "", error ? "esge-input--error" : "", disabled ? "esge-input--disabled" : ""].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", {
    className: ["esge-field", className].filter(Boolean).join(" "),
    style: containerStyle
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "esge-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "esge-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: wrapCls
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    className: "esge-input__affix",
    "aria-hidden": "true"
  }, iconLeft), prefix && /*#__PURE__*/React.createElement("span", {
    className: "esge-input__affix esge-input__affix--text"
  }, prefix), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: "esge-input__control",
    disabled: disabled,
    "aria-invalid": !!error
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    className: "esge-input__affix esge-input__affix--text"
  }, suffix)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    className: ["esge-field__hint", error ? "esge-field__hint--error" : ""].filter(Boolean).join(" ")
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-radiogroup{ display:flex; flex-direction:column; gap:10px; }
.esge-radiogroup--row{ flex-direction:row; flex-wrap:wrap; gap:16px; }
.esge-radio{ display:inline-flex; align-items:flex-start; gap:10px; cursor:pointer; font:var(--type-body); color:var(--text-body); }
.esge-radio--disabled{ cursor:not-allowed; opacity:.55; }
.esge-radio__dot{
  position:relative; flex-shrink:0; width:18px; height:18px; margin-top:1px;
  border:1.5px solid var(--border-strong); border-radius:var(--radius-full);
  background:var(--surface-card); display:inline-flex; align-items:center; justify-content:center;
  transition:border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-radio__native{ position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:inherit; }
.esge-radio__dot::after{ content:""; width:8px; height:8px; border-radius:var(--radius-full); background:var(--brand); transform:scale(0); transition:transform var(--duration-fast) var(--ease-out); }
.esge-radio__dot:has(.esge-radio__native:checked){ border-color:var(--brand); }
.esge-radio__dot:has(.esge-radio__native:checked)::after{ transform:scale(1); }
.esge-radio__dot:has(.esge-radio__native:focus-visible){ box-shadow:var(--shadow-focus); }
.esge-radio:hover .esge-radio__dot:has(.esge-radio__native:not(:disabled)){ border-color:var(--brand); }
.esge-radio__body{ display:flex; flex-direction:column; gap:2px; }
.esge-radio__desc{ font:var(--type-caption); color:var(--text-muted); }
`;

/** Single radio option. Usually rendered inside <RadioGroup>. */
function Radio({
  label,
  description,
  disabled = false,
  id,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-radio-css", CSS);
  const autoId = React.useId();
  const fieldId = id || autoId;
  return /*#__PURE__*/React.createElement("label", {
    className: ["esge-radio", disabled ? "esge-radio--disabled" : "", className].filter(Boolean).join(" "),
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("span", {
    className: "esge-radio__dot"
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "radio",
    className: "esge-radio__native",
    disabled: disabled
  }, rest))), (label || description || children) && /*#__PURE__*/React.createElement("span", {
    className: "esge-radio__body"
  }, (label || children) && /*#__PURE__*/React.createElement("span", null, label || children), description && /*#__PURE__*/React.createElement("span", {
    className: "esge-radio__desc"
  }, description)));
}

/** Groups Radios, manages name + layout direction. */
function RadioGroup({
  name,
  value,
  onChange,
  row = false,
  className = "",
  children
}) {
  useStyleOnce("esge-radio-css", CSS);
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    className: ["esge-radiogroup", row ? "esge-radiogroup--row" : "", className].filter(Boolean).join(" ")
  }, React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child, {
    name,
    checked: value !== undefined ? child.props.value === value : child.props.checked,
    onChange
  }) : child));
}
Object.assign(__ds_scope, { Radio, RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-field{ display:flex; flex-direction:column; gap:6px; }
.esge-field__label{ font:var(--type-label); color:var(--text-strong); display:flex; gap:4px; align-items:center; }
.esge-field__req{ color:var(--danger); }
.esge-field__hint{ font:var(--type-caption); color:var(--text-muted); }
.esge-field__hint--error{ color:var(--danger); }

.esge-select{ position:relative; display:flex; align-items:center; }
.esge-select__control{
  --_h:38px;
  width:100%; height:var(--_h); padding:0 38px 0 12px; appearance:none;
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-md); color:var(--text-body);
  font-family:var(--font-sans); font-size:var(--text-base); cursor:pointer;
  transition:border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-select__control:hover{ border-color:var(--border-strong); }
.esge-select__control:focus{ outline:none; border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-select__control:disabled{ background:var(--surface-sunken); color:var(--text-subtle); cursor:not-allowed; }
.esge-select__control--placeholder{ color:var(--text-subtle); }
.esge-select--sm .esge-select__control{ --_h:32px; font-size:var(--text-sm); }
.esge-select--lg .esge-select__control{ --_h:46px; }
.esge-select--error .esge-select__control{ border-color:var(--danger); }
.esge-select__chevron{
  position:absolute; right:12px; pointer-events:none; color:var(--text-muted);
  display:inline-flex; width:16px; height:16px;
}
`;
const Chevron = () => /*#__PURE__*/React.createElement("svg", {
  className: "esge-select__chevron",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "6 9 12 15 18 9"
}));

/** Labeled native select wrapped with the shared field scaffolding. */
function Select({
  label,
  hint,
  error,
  required = false,
  size = "md",
  placeholder,
  options = [],
  value,
  disabled = false,
  id,
  className = "",
  containerStyle,
  children,
  ...rest
}) {
  useStyleOnce("esge-select-css", CSS);
  const autoId = React.useId();
  const fieldId = id || autoId;
  const {
    defaultValue,
    onChange,
    ...restAttrs
  } = rest;
  const uncontrolled = value === undefined;
  // In uncontrolled mode, track the current value so the placeholder shows
  // initially (defaultValue "") and gray styling clears on real selection.
  const [innerValue, setInnerValue] = React.useState(defaultValue !== undefined ? defaultValue : placeholder ? "" : undefined);
  const currentValue = uncontrolled ? innerValue : value;
  const isPlaceholder = (currentValue === "" || currentValue == null) && placeholder;
  const selectProps = uncontrolled ? {
    defaultValue: defaultValue !== undefined ? defaultValue : placeholder ? "" : undefined,
    onChange: e => {
      setInnerValue(e.target.value);
      if (onChange) onChange(e);
    }
  } : {
    value,
    onChange
  };
  return /*#__PURE__*/React.createElement("div", {
    className: ["esge-field", className].filter(Boolean).join(" "),
    style: containerStyle
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "esge-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "esge-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: ["esge-select", size !== "md" ? `esge-select--${size}` : "", error ? "esge-select--error" : ""].filter(Boolean).join(" ")
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    disabled: disabled,
    "aria-invalid": !!error
  }, selectProps, {
    className: ["esge-select__control", isPlaceholder ? "esge-select__control--placeholder" : ""].filter(Boolean).join(" ")
  }, restAttrs), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => typeof o === "object" ? /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label) : /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o)), children), /*#__PURE__*/React.createElement(Chevron, null)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    className: ["esge-field__hint", error ? "esge-field__hint--error" : ""].filter(Boolean).join(" ")
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-switch{ display:inline-flex; align-items:center; gap:10px; cursor:pointer; font:var(--type-body); color:var(--text-body); }
.esge-switch--disabled{ cursor:not-allowed; opacity:.55; }
.esge-switch__track{
  position:relative; flex-shrink:0; width:40px; height:22px; border-radius:var(--radius-pill);
  background:var(--neutral-300); transition:background var(--duration-normal) var(--ease-standard);
}
[data-theme="dark"] .esge-switch__track{ background:var(--neutral-700); }
.esge-switch__native{ position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:inherit; }
.esge-switch__thumb{
  position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:var(--radius-full);
  background:#fff; box-shadow:var(--shadow-sm); transition:transform var(--duration-normal) var(--ease-out);
}
.esge-switch__native:checked + .esge-switch__track{ background:var(--brand); }
.esge-switch__native:checked + .esge-switch__track .esge-switch__thumb{ transform:translateX(18px); }
.esge-switch__native:focus-visible + .esge-switch__track{ box-shadow:var(--shadow-focus); }
.esge-switch--sm .esge-switch__track{ width:34px; height:19px; }
.esge-switch--sm .esge-switch__thumb{ width:13px; height:13px; }
.esge-switch--sm .esge-switch__native:checked + .esge-switch__track .esge-switch__thumb{ transform:translateX(15px); }
`;

/** On/off toggle for settings and instant-apply preferences. */
function Switch({
  label,
  size = "md",
  disabled = false,
  id,
  className = "",
  children,
  ...rest
}) {
  useStyleOnce("esge-switch-css", CSS);
  const autoId = React.useId();
  const fieldId = id || autoId;
  return /*#__PURE__*/React.createElement("label", {
    className: ["esge-switch", size === "sm" ? "esge-switch--sm" : "", disabled ? "esge-switch--disabled" : "", className].filter(Boolean).join(" "),
    htmlFor: fieldId
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex"
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: "checkbox",
    role: "switch",
    className: "esge-switch__native",
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "esge-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "esge-switch__thumb"
  }))), (label || children) && /*#__PURE__*/React.createElement("span", null, label || children));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-field{ display:flex; flex-direction:column; gap:6px; }
.esge-field__label{ font:var(--type-label); color:var(--text-strong); display:flex; gap:4px; align-items:center; }
.esge-field__req{ color:var(--danger); }
.esge-field__hint{ font:var(--type-caption); color:var(--text-muted); }
.esge-field__hint--error{ color:var(--danger); }
.esge-ta__control{
  width:100%; min-height:96px; resize:vertical; padding:10px 12px;
  background:var(--surface-card); border:1px solid var(--border-default);
  border-radius:var(--radius-md); color:var(--text-body);
  font-family:var(--font-sans); font-size:var(--text-base); line-height:var(--leading-normal);
  transition:border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard);
}
.esge-ta__control::placeholder{ color:var(--text-subtle); }
.esge-ta__control:hover{ border-color:var(--border-strong); }
.esge-ta__control:focus{ outline:none; border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-ta__control:disabled{ background:var(--surface-sunken); color:var(--text-subtle); cursor:not-allowed; }
.esge-ta__control--error{ border-color:var(--danger); }
.esge-ta__control--error:focus{ box-shadow:0 0 0 3px var(--danger-soft); }
`;

/** Multi-line text field with the same label/hint/error scaffolding as Input. */
function Textarea({
  label,
  hint,
  error,
  required = false,
  rows = 4,
  disabled = false,
  id,
  className = "",
  containerStyle,
  ...rest
}) {
  useStyleOnce("esge-textarea-css", CSS);
  const autoId = React.useId();
  const fieldId = id || autoId;
  return /*#__PURE__*/React.createElement("div", {
    className: ["esge-field", className].filter(Boolean).join(" "),
    style: containerStyle
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "esge-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "esge-field__req",
    "aria-hidden": "true"
  }, "*")), /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    rows: rows,
    disabled: disabled,
    "aria-invalid": !!error,
    className: ["esge-ta__control", error ? "esge-ta__control--error" : ""].filter(Boolean).join(" ")
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    className: ["esge-field__hint", error ? "esge-field__hint--error" : ""].filter(Boolean).join(" ")
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-crumbs{ display:flex; align-items:center; flex-wrap:wrap; gap:4px; font:var(--type-label); }
.esge-crumbs__item{ color:var(--text-muted); text-decoration:none; display:inline-flex; align-items:center; gap:5px; padding:2px 4px; border-radius:var(--radius-xs); transition:color var(--duration-fast); }
.esge-crumbs__item:hover{ color:var(--text-body); text-decoration:none; }
.esge-crumbs__item--current{ color:var(--text-strong); font-weight:var(--weight-semibold); pointer-events:none; }
.esge-crumbs__sep{ color:var(--text-subtle); display:inline-flex; }
.esge-crumbs__sep svg{ width:14px; height:14px; }
.esge-crumbs__item svg{ width:15px; height:15px; }
`;
const Chevron = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "9 18 15 12 9 6"
}));

/** Breadcrumb trail. `items`: [{ label, href?, icon? }]; last is current. */
function Breadcrumb({
  items = [],
  className = "",
  ...rest
}) {
  useStyleOnce("esge-crumbs-css", CSS);
  return /*#__PURE__*/React.createElement("nav", _extends({
    className: ["esge-crumbs", className].filter(Boolean).join(" "),
    "aria-label": "Ruta"
  }, rest), items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, it.href && !last ? /*#__PURE__*/React.createElement("a", {
      href: it.href,
      className: "esge-crumbs__item"
    }, it.icon, it.label) : /*#__PURE__*/React.createElement("span", {
      className: ["esge-crumbs__item", last ? "esge-crumbs__item--current" : ""].filter(Boolean).join(" "),
      "aria-current": last ? "page" : undefined
    }, it.icon, it.label), !last && /*#__PURE__*/React.createElement("span", {
      className: "esge-crumbs__sep",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement(Chevron, null)));
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Pagination.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-pag{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; font:var(--type-label); color:var(--text-muted); }
.esge-pag__info{ font:var(--type-caption); color:var(--text-muted); }
.esge-pag__info b{ color:var(--text-body); font-weight:var(--weight-semibold); }
.esge-pag__list{ display:flex; align-items:center; gap:4px; }
.esge-pag__btn{
  min-width:34px; height:34px; padding:0 8px; display:inline-flex; align-items:center; justify-content:center;
  border:1px solid var(--border-default); background:var(--surface-card); color:var(--text-body);
  border-radius:var(--radius-md); cursor:pointer; font:var(--type-label); font-variant-numeric:tabular-nums;
  transition:background var(--duration-fast), border-color var(--duration-fast), color var(--duration-fast);
}
.esge-pag__btn:hover:not(:disabled){ background:var(--surface-hover); border-color:var(--border-strong); }
.esge-pag__btn:disabled{ opacity:.45; cursor:not-allowed; }
.esge-pag__btn--active{ background:var(--brand); border-color:var(--brand); color:var(--brand-fg); }
.esge-pag__btn--active:hover{ background:var(--brand-hover); }
.esge-pag__ellipsis{ min-width:24px; text-align:center; color:var(--text-subtle); }
.esge-pag__btn svg{ width:16px; height:16px; }
`;
function pageRange(page, total) {
  const out = [];
  const add = n => out.push(n);
  if (total <= 7) {
    for (let i = 1; i <= total; i++) add(i);
    return out;
  }
  add(1);
  if (page > 3) add("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) add(i);
  if (page < total - 2) add("…");
  add(total);
  return out;
}
const Prev = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "15 18 9 12 15 6"
}));
const Next = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("polyline", {
  points: "9 18 15 12 9 6"
}));

/** Page navigation with optional record-range summary. Controlled. */
function Pagination({
  page = 1,
  pageCount = 1,
  onPageChange,
  total,
  pageSize,
  className = "",
  ...rest
}) {
  useStyleOnce("esge-pag-css", CSS);
  const go = p => {
    if (p >= 1 && p <= pageCount && p !== page && onPageChange) onPageChange(p);
  };
  const from = total != null && pageSize ? (page - 1) * pageSize + 1 : null;
  const to = total != null && pageSize ? Math.min(total, page * pageSize) : null;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["esge-pag", className].filter(Boolean).join(" ")
  }, rest), total != null && pageSize && /*#__PURE__*/React.createElement("span", {
    className: "esge-pag__info"
  }, "Mostrando ", /*#__PURE__*/React.createElement("b", null, from, "\u2013", to), " de ", /*#__PURE__*/React.createElement("b", null, total)), /*#__PURE__*/React.createElement("div", {
    className: "esge-pag__list"
  }, /*#__PURE__*/React.createElement("button", {
    className: "esge-pag__btn",
    onClick: () => go(page - 1),
    disabled: page <= 1,
    "aria-label": "Anterior"
  }, /*#__PURE__*/React.createElement(Prev, null)), pageRange(page, pageCount).map((p, i) => p === "…" ? /*#__PURE__*/React.createElement("span", {
    key: "e" + i,
    className: "esge-pag__ellipsis"
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    key: p,
    className: ["esge-pag__btn", p === page ? "esge-pag__btn--active" : ""].filter(Boolean).join(" "),
    onClick: () => go(p),
    "aria-current": p === page ? "page" : undefined
  }, p)), /*#__PURE__*/React.createElement("button", {
    className: "esge-pag__btn",
    onClick: () => go(page + 1),
    disabled: page >= pageCount,
    "aria-label": "Siguiente"
  }, /*#__PURE__*/React.createElement(Next, null))));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-sidebar{
  display:flex; flex-direction:column; width:var(--sidebar-width); height:100%;
  background:var(--sidebar-bg); color:var(--sidebar-fg); border-right:1px solid var(--sidebar-border);
  transition:width var(--duration-normal) var(--ease-standard); overflow:hidden;
}
.esge-sidebar--collapsed{ width:var(--sidebar-width-collapsed); }
.esge-sidebar__brand{
  display:flex; align-items:center; gap:11px; height:var(--topbar-height); padding:0 16px; flex-shrink:0;
  border-bottom:1px solid var(--sidebar-border);
}
.esge-sidebar__logo{ width:34px; height:34px; border-radius:var(--radius-md); object-fit:contain; flex-shrink:0; background:rgba(255,255,255,.06); }
.esge-sidebar__brandtext{ display:flex; flex-direction:column; gap:1px; min-width:0; }
.esge-sidebar__brandname{ font:var(--type-label); font-weight:var(--weight-bold); color:#fff; letter-spacing:var(--tracking-wide); white-space:nowrap; }
.esge-sidebar__brandsub{ font:var(--type-2xs); color:var(--sidebar-muted); text-transform:uppercase; letter-spacing:var(--tracking-caps); white-space:nowrap; }
.esge-sidebar__nav{ flex:1; overflow-y:auto; overflow-x:hidden; padding:12px 10px; display:flex; flex-direction:column; gap:2px; }
.esge-sidebar__section{ font:var(--type-2xs); text-transform:uppercase; letter-spacing:var(--tracking-caps); font-weight:var(--weight-semibold); color:var(--sidebar-muted); padding:14px 12px 6px; white-space:nowrap; }
.esge-sidebar--collapsed .esge-sidebar__section{ opacity:0; height:10px; padding:6px; }
.esge-navitem{
  display:flex; align-items:center; gap:11px; padding:9px 12px; border-radius:var(--radius-md);
  color:var(--sidebar-fg); text-decoration:none; cursor:pointer; position:relative; white-space:nowrap;
  font:var(--type-label); transition:background var(--duration-fast), color var(--duration-fast);
}
.esge-navitem:hover{ background:var(--sidebar-item-hover); color:#fff; text-decoration:none; }
.esge-navitem--active{ background:var(--sidebar-item-active); color:#fff; }
.esge-navitem--active::before{ content:""; position:absolute; left:0; top:8px; bottom:8px; width:3px; border-radius:0 3px 3px 0; background:var(--sidebar-accent); }
.esge-navitem__icon{ display:inline-flex; flex-shrink:0; width:20px; height:20px; align-items:center; justify-content:center; }
.esge-navitem__icon svg{ width:19px; height:19px; }
.esge-navitem__label{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; }
.esge-navitem__badge{
  font:var(--type-2xs); font-weight:700; min-width:18px; height:18px; padding:0 5px; border-radius:var(--radius-pill);
  background:var(--gold-400); color:var(--brown-900); display:inline-flex; align-items:center; justify-content:center;
}
.esge-sidebar--collapsed .esge-navitem__label,
.esge-sidebar--collapsed .esge-navitem__badge,
.esge-sidebar--collapsed .esge-sidebar__brandtext{ opacity:0; width:0; pointer-events:none; }
.esge-sidebar--collapsed .esge-navitem{ justify-content:center; padding:9px; }
.esge-sidebar__foot{ padding:10px; border-top:1px solid var(--sidebar-border); flex-shrink:0; }
`;

/** Item: { id, label, icon, badge?, section? (renders a heading before it) }. */
function Sidebar({
  brandName = "Elohim",
  brandSub = "SGE",
  logoSrc,
  items = [],
  activeId,
  onSelect,
  collapsed = false,
  footer,
  className = "",
  ...rest
}) {
  useStyleOnce("esge-sidebar-css", CSS);
  return /*#__PURE__*/React.createElement("aside", _extends({
    className: ["esge-sidebar", collapsed ? "esge-sidebar--collapsed" : "", className].filter(Boolean).join(" ")
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "esge-sidebar__brand"
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    className: "esge-sidebar__logo",
    src: logoSrc,
    alt: ""
  }) : /*#__PURE__*/React.createElement("span", {
    className: "esge-sidebar__logo"
  }), /*#__PURE__*/React.createElement("span", {
    className: "esge-sidebar__brandtext"
  }, /*#__PURE__*/React.createElement("span", {
    className: "esge-sidebar__brandname"
  }, brandName), /*#__PURE__*/React.createElement("span", {
    className: "esge-sidebar__brandsub"
  }, brandSub))), /*#__PURE__*/React.createElement("nav", {
    className: "esge-sidebar__nav"
  }, items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: it.id || i
  }, it.section && /*#__PURE__*/React.createElement("div", {
    className: "esge-sidebar__section"
  }, it.section), /*#__PURE__*/React.createElement("a", {
    className: ["esge-navitem", activeId === it.id ? "esge-navitem--active" : ""].filter(Boolean).join(" "),
    href: it.href || "#",
    title: it.label,
    onClick: e => {
      if (onSelect) {
        e.preventDefault();
        onSelect(it.id);
      }
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "esge-navitem__icon"
  }, it.icon), /*#__PURE__*/React.createElement("span", {
    className: "esge-navitem__label"
  }, it.label), it.badge != null && /*#__PURE__*/React.createElement("span", {
    className: "esge-navitem__badge"
  }, it.badge))))), footer && /*#__PURE__*/React.createElement("div", {
    className: "esge-sidebar__foot"
  }, footer));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-tabs{ display:flex; flex-direction:column; }
.esge-tablist{ display:flex; align-items:center; gap:2px; position:relative; }
.esge-tablist--line{ border-bottom:1px solid var(--border-subtle); gap:4px; }
.esge-tablist--pill{ background:var(--surface-sunken); padding:4px; border-radius:var(--radius-md); gap:2px; display:inline-flex; }
.esge-tab{
  appearance:none; border:none; background:transparent; cursor:pointer;
  font:var(--type-label); font-weight:var(--weight-medium); color:var(--text-muted);
  display:inline-flex; align-items:center; gap:7px; white-space:nowrap;
  transition:color var(--duration-fast), background var(--duration-fast);
}
.esge-tab__icon{ display:inline-flex; }
.esge-tab__icon svg{ width:16px; height:16px; }
.esge-tab:disabled{ opacity:.45; cursor:not-allowed; }

.esge-tablist--line .esge-tab{ padding:11px 12px; position:relative; }
.esge-tablist--line .esge-tab::after{ content:""; position:absolute; left:8px; right:8px; bottom:-1px; height:2px; border-radius:2px 2px 0 0; background:transparent; transition:background var(--duration-fast); }
.esge-tablist--line .esge-tab:hover{ color:var(--text-body); }
.esge-tablist--line .esge-tab[aria-selected="true"]{ color:var(--brand); }
.esge-tablist--line .esge-tab[aria-selected="true"]::after{ background:var(--brand); }

.esge-tablist--pill .esge-tab{ padding:7px 14px; border-radius:var(--radius-sm); }
.esge-tablist--pill .esge-tab:hover{ color:var(--text-body); }
.esge-tablist--pill .esge-tab[aria-selected="true"]{ color:var(--text-strong); background:var(--surface-card); box-shadow:var(--shadow-xs); }

.esge-tab__count{ font:var(--type-2xs); font-weight:600; padding:1px 6px; border-radius:var(--radius-pill); background:var(--surface-active); color:var(--text-muted); }
.esge-tab[aria-selected="true"] .esge-tab__count{ background:var(--surface-brand-soft); color:var(--brand); }
`;

/** Tab navigation. `items`: [{ id, label, icon?, count?, disabled? }]. Controlled. */
function Tabs({
  items = [],
  value,
  onChange,
  variant = "line",
  className = "",
  ...rest
}) {
  useStyleOnce("esge-tabs-css", CSS);
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["esge-tabs", className].filter(Boolean).join(" ")
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: `esge-tablist esge-tablist--${variant}`,
    role: "tablist"
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    role: "tab",
    type: "button",
    className: "esge-tab",
    "aria-selected": value === it.id,
    disabled: it.disabled,
    onClick: () => !it.disabled && onChange && onChange(it.id)
  }, it.icon && /*#__PURE__*/React.createElement("span", {
    className: "esge-tab__icon"
  }, it.icon), it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
    className: "esge-tab__count"
  }, it.count)))));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Topbar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function useStyleOnce(id, css) {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
const CSS = `
.esge-topbar{
  display:flex; align-items:center; gap:16px; height:var(--topbar-height); padding:0 20px; flex-shrink:0;
  background:var(--surface-card); border-bottom:1px solid var(--border-subtle);
}
.esge-topbar__menu{ display:inline-flex; }
.esge-topbar__lead{ display:flex; flex-direction:column; gap:1px; min-width:0; }
.esge-topbar__title{ font:var(--type-h3); color:var(--text-strong); white-space:nowrap; }
.esge-topbar__spacer{ flex:1; }
.esge-topbar__search{
  display:flex; align-items:center; gap:8px; height:38px; padding:0 12px; min-width:200px; max-width:340px; flex:1;
  background:var(--surface-sunken); border:1px solid transparent; border-radius:var(--radius-md);
  color:var(--text-muted); transition:border-color var(--duration-fast), background var(--duration-fast);
}
.esge-topbar__search:focus-within{ background:var(--surface-card); border-color:var(--border-brand); box-shadow:var(--shadow-focus); }
.esge-topbar__search svg{ width:18px; height:18px; flex-shrink:0; }
.esge-topbar__search input{ flex:1; min-width:0; border:none; outline:none; background:transparent; font:var(--type-body); color:var(--text-body); }
.esge-topbar__search input::placeholder{ color:var(--text-subtle); }
.esge-topbar__search kbd{ font:var(--type-2xs); font-family:var(--font-mono); padding:2px 6px; border-radius:var(--radius-xs); background:var(--surface-card); border:1px solid var(--border-subtle); color:var(--text-muted); }
.esge-topbar__actions{ display:flex; align-items:center; gap:6px; }
.esge-topbar__user{ display:flex; align-items:center; gap:10px; padding:4px 6px 4px 8px; border-radius:var(--radius-md); cursor:pointer; transition:background var(--duration-fast); }
.esge-topbar__user:hover{ background:var(--surface-hover); }
.esge-topbar__userinfo{ display:flex; flex-direction:column; line-height:1.2; }
.esge-topbar__username{ font:var(--type-label); color:var(--text-strong); white-space:nowrap; }
.esge-topbar__userrole{ font:var(--type-2xs); color:var(--text-muted); white-space:nowrap; }
.esge-topbar__divider{ width:1px; height:28px; background:var(--border-subtle); }
`;
const SearchIcon = () => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round"
}, /*#__PURE__*/React.createElement("circle", {
  cx: "11",
  cy: "11",
  r: "7"
}), /*#__PURE__*/React.createElement("line", {
  x1: "21",
  y1: "21",
  x2: "16.65",
  y2: "16.65"
}));

/** Application header: optional menu/lead, search, action slot and user block. */
function Topbar({
  title,
  lead,
  onMenuClick,
  menuButton,
  searchPlaceholder = "Buscar…",
  showSearch = true,
  onSearch,
  searchValue,
  actions,
  user,
  className = "",
  ...rest
}) {
  useStyleOnce("esge-topbar-css", CSS);
  return /*#__PURE__*/React.createElement("header", _extends({
    className: ["esge-topbar", className].filter(Boolean).join(" ")
  }, rest), menuButton && /*#__PURE__*/React.createElement("span", {
    className: "esge-topbar__menu",
    onClick: onMenuClick
  }, menuButton), (title || lead) && /*#__PURE__*/React.createElement("div", {
    className: "esge-topbar__lead"
  }, lead, title && /*#__PURE__*/React.createElement("div", {
    className: "esge-topbar__title"
  }, title)), showSearch && /*#__PURE__*/React.createElement("label", {
    className: "esge-topbar__search"
  }, /*#__PURE__*/React.createElement(SearchIcon, null), /*#__PURE__*/React.createElement("input", {
    type: "search",
    placeholder: searchPlaceholder,
    value: searchValue,
    onChange: e => onSearch && onSearch(e.target.value)
  }), /*#__PURE__*/React.createElement("kbd", null, "Ctrl K")), /*#__PURE__*/React.createElement("div", {
    className: "esge-topbar__spacer"
  }), actions && /*#__PURE__*/React.createElement("div", {
    className: "esge-topbar__actions"
  }, actions), actions && user && /*#__PURE__*/React.createElement("span", {
    className: "esge-topbar__divider"
  }), user && /*#__PURE__*/React.createElement("div", {
    className: "esge-topbar__user",
    onClick: user.onClick
  }, user.avatar, /*#__PURE__*/React.createElement("div", {
    className: "esge-topbar__userinfo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "esge-topbar__username"
  }, user.name), user.role && /*#__PURE__*/React.createElement("span", {
    className: "esge-topbar__userrole"
  }, user.role))));
}
Object.assign(__ds_scope, { Topbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Topbar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/AcademicStructureScreen.jsx
try { (() => {
/* Elohim SGE — Estructura académica. Registers window.SGE_Structure.
   Tabs: Estructura (árbol Nivel→Grado→Sección) · Plan de estudios · Programas · Periodos.
   Todas las acciones (nuevo nivel/grado/sección, editar, ver estudiantes, cursos,
   programas) abren formularios funcionales que mutan el estado del prototipo. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Select,
    Input,
    Tabs,
    ProgressBar,
    Dialog,
    Alert,
    Tooltip,
    Checkbox,
    RadioGroup,
    Radio,
    EmptyState
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;

  /* ------------------------------ sample data ------------------------------ */
  const NIVELES_INIT = [{
    id: "ini",
    nombre: "Inicial",
    rango: "3–5 años",
    color: "var(--gold-500)",
    soft: "var(--surface-accent-soft)",
    grados: [{
      nombre: "3 años",
      secciones: [{
        n: "Los Pollitos",
        turno: "M",
        cap: 20,
        mat: 17,
        tutor: "Rosa Lima",
        aux: "Betty Salazar"
      }]
    }, {
      nombre: "4 años",
      secciones: [{
        n: "Los Girasoles",
        turno: "M",
        cap: 22,
        mat: 21,
        tutor: "Carmen Ríos",
        aux: "Delia Poma"
      }]
    }, {
      nombre: "5 años",
      secciones: [{
        n: "Las Estrellitas",
        turno: "M",
        cap: 24,
        mat: 24,
        tutor: "Julia Vega",
        aux: "Betty Salazar"
      }, {
        n: "Los Delfines",
        turno: "M",
        cap: 24,
        mat: 15,
        tutor: "Nora Paz",
        aux: null
      }]
    }]
  }, {
    id: "pri",
    nombre: "Primaria",
    rango: "1° – 6°",
    color: "var(--blue-500)",
    soft: "var(--surface-brand-soft)",
    grados: [{
      nombre: "1°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 30,
        mat: 28,
        tutor: "Elsa Campos",
        aux: "Marta Quispe"
      }, {
        n: "B",
        turno: "T",
        cap: 30,
        mat: 19,
        tutor: "Iván Rojas",
        aux: null
      }]
    }, {
      nombre: "2°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 30,
        mat: 27,
        tutor: "María Salas"
      }]
    }, {
      nombre: "3°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 30,
        mat: 30,
        tutor: "Pedro Gómez"
      }, {
        n: "B",
        turno: "M",
        cap: 30,
        mat: 22,
        tutor: "Lucía Díaz"
      }]
    }, {
      nombre: "4°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 32,
        mat: 26,
        tutor: "Raúl Meza"
      }]
    }, {
      nombre: "5°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 32,
        mat: 29,
        tutor: "Ana Torres"
      }]
    }, {
      nombre: "6°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 32,
        mat: 31,
        tutor: "Jorge Luna"
      }]
    }]
  }, {
    id: "sec",
    nombre: "Secundaria",
    rango: "1° – 5°",
    color: "var(--green-500)",
    soft: "var(--success-soft)",
    grados: [{
      nombre: "1°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 35,
        mat: 33,
        tutor: "Iris Quinto"
      }]
    }, {
      nombre: "2°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 35,
        mat: 30,
        tutor: "Saúl Ramos"
      }]
    }, {
      nombre: "3°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 35,
        mat: 34,
        tutor: "Delia Cano"
      }]
    }, {
      nombre: "4°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 35,
        mat: 27,
        tutor: "Mario Silva"
      }]
    }, {
      nombre: "5°",
      secciones: [{
        n: "A",
        turno: "M",
        cap: 35,
        mat: 25,
        tutor: "Rita Flores"
      }]
    }]
  }];
  const TUTORES = ["Rosa Lima", "Carmen Ríos", "Julia Vega", "Nora Paz", "Elsa Campos", "Iván Rojas", "María Salas", "Pedro Gómez", "Lucía Díaz", "Raúl Meza", "Ana Torres", "Jorge Luna", "Iris Quinto", "Saúl Ramos", "Delia Cano", "Mario Silva", "Rita Flores", "— Sin asignar —"];
  const DOCENTES = TUTORES.slice(0, -1);
  const AUXILIARES = ["— Sin auxiliar —", "Betty Salazar", "Delia Poma", "Marta Quispe", "Sofía Rivas"];
  const CURSOS_INIT = [{
    curso: "Matemática",
    horas: 6,
    doc: "Pedro Gómez"
  }, {
    curso: "Comunicación",
    horas: 6,
    doc: "Lucía Díaz"
  }, {
    curso: "Ciencia y Tecnología",
    horas: 4,
    doc: "Raúl Meza"
  }, {
    curso: "Personal Social",
    horas: 3,
    doc: "Ana Torres"
  }, {
    curso: "Inglés",
    horas: 3,
    doc: "Iris Quinto"
  }, {
    curso: "Educación Física",
    horas: 2,
    doc: "Saúl Ramos"
  }, {
    curso: "Arte y Cultura",
    horas: 2,
    doc: "Nora Paz"
  }, {
    curso: "Educación Religiosa",
    horas: 2,
    doc: "Delia Cano"
  }];
  const PROGRAMAS_INIT = [{
    nombre: "Taller de Danza",
    tipo: "Taller",
    dia: "Sáb 9:00–11:00",
    tarifa: "60.00",
    cap: 25,
    mat: 21,
    estado: "Activo"
  }, {
    nombre: "Taller de Música",
    tipo: "Taller",
    dia: "Vie 15:30–17:00",
    tarifa: "70.00",
    cap: 20,
    mat: 14,
    estado: "Activo"
  }, {
    nombre: "Reforzamiento · Matemática",
    tipo: "Reforzamiento",
    dia: "Lun y Mié 15:30–17:00",
    tarifa: "80.00",
    cap: 30,
    mat: 26,
    estado: "Activo"
  }, {
    nombre: "Academia Pre (verano)",
    tipo: "Academia",
    dia: "Ene–Feb · L a V",
    tarifa: "150.00",
    cap: 40,
    mat: 0,
    estado: "Cerrado"
  }];
  const PERIODOS = [{
    n: "Bimestre I",
    ini: "09/03",
    fin: "15/05",
    estado: "Cerrado",
    avance: 100
  }, {
    n: "Bimestre II",
    ini: "18/05",
    fin: "24/07",
    estado: "En curso",
    avance: 78
  }, {
    n: "Bimestre III",
    ini: "10/08",
    fin: "16/10",
    estado: "Próximo",
    avance: 0
  }, {
    n: "Bimestre IV",
    ini: "19/10",
    fin: "18/12",
    estado: "Próximo",
    avance: 0
  }];
  const ALUMNOS = ["Quispe Roca, María", "Ramos Lía, José", "Flores Mendoza, Ana", "Paz Cárdenas, Luis", "Lima Vega, Rosa", "Vela Soto, Hugo", "Ríos Paz, Carmen", "Ñahui Cruz, Diego", "Salas Cruz, Piero", "Núñez Ríos, Carla", "Torres Vila, Sara", "Campos Luna, Iván"];
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);

  /* ------------------------------ shared bits ------------------------------ */
  function VacBar({
    mat,
    cap
  }) {
    const pct = mat / cap * 100;
    const tone = pct >= 100 ? "danger" : pct >= 85 ? "warning" : "success";
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 170
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: mat,
      max: cap,
      tone: tone,
      size: "sm"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-mono)",
        fontSize: "var(--text-xs)",
        color: pct >= 100 ? "var(--danger)" : "var(--text-muted)",
        whiteSpace: "nowrap"
      }
    }, mat, "/", cap));
  }

  /* ------------------------------ dialogs ------------------------------ */
  function NivelDialog({
    open,
    onClose,
    onSave
  }) {
    const [nombre, setNombre] = React.useState("");
    const [rango, setRango] = React.useState("");
    React.useEffect(() => {
      if (open) {
        setNombre("");
        setRango("");
      }
    }, [open]);
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      title: "Nuevo nivel acad\xE9mico",
      icon: /*#__PURE__*/React.createElement(Ic.Layers, null),
      description: "Ej. Academia, CEBA, Talleres de verano",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        disabled: !nombre.trim(),
        onClick: () => {
          onSave({
            nombre: nombre.trim(),
            rango: rango.trim() || "—"
          });
          onClose();
        }
      }, "Crear nivel"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre del nivel",
      placeholder: "Ej. Academia Pre",
      required: true,
      value: nombre,
      onChange: e => setNombre(e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Rango o descripci\xF3n",
      placeholder: "Ej. 1\xB0 \u2013 5\xB0 / 12\u201316 a\xF1os",
      value: rango,
      onChange: e => setRango(e.target.value),
      hint: "Se muestra junto al nombre del nivel"
    })));
  }
  function GradoDialog({
    ctx,
    onClose,
    onSave
  }) {
    const [nombre, setNombre] = React.useState("");
    React.useEffect(() => {
      if (ctx) setNombre("");
    }, [ctx]);
    return /*#__PURE__*/React.createElement(Dialog, {
      open: !!ctx,
      onClose: onClose,
      title: `Nuevo grado · ${ctx ? ctx.nivel.nombre : ""}`,
      icon: /*#__PURE__*/React.createElement(Ic.Layers, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        disabled: !nombre.trim(),
        onClick: () => {
          onSave(nombre.trim());
          onClose();
        }
      }, "Crear grado"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre del grado",
      placeholder: ctx && ctx.nivel.id === "ini" ? "Ej. 4 años" : "Ej. 4°",
      required: true,
      value: nombre,
      onChange: e => setNombre(e.target.value)
    }), /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "El grado se crea sin secciones \u2014 agr\xE9galas desde el \xE1rbol. El plan de estudios se define en su pesta\xF1a.")));
  }
  function SeccionDialog({
    ctx,
    onClose,
    onSave
  }) {
    // ctx: { nivel, grado, seccion? (edit), idx? }
    const edit = ctx && ctx.seccion;
    const inicial = ctx && ctx.nivel.id === "ini";
    const [n, setN] = React.useState("");
    const [turno, setTurno] = React.useState("M");
    const [cap, setCap] = React.useState("30");
    const [tutor, setTutor] = React.useState("— Sin asignar —");
    const [aux, setAux] = React.useState("— Sin auxiliar —");
    React.useEffect(() => {
      if (!ctx) return;
      setN(edit ? ctx.seccion.n : "");
      setTurno(edit ? ctx.seccion.turno : "M");
      setCap(edit ? String(ctx.seccion.cap) : "30");
      setTutor(edit ? ctx.seccion.tutor : "— Sin asignar —");
      setAux(edit ? ctx.seccion.aux || "— Sin auxiliar —" : "— Sin auxiliar —");
    }, [ctx]);
    return /*#__PURE__*/React.createElement(Dialog, {
      open: !!ctx,
      onClose: onClose,
      title: edit ? `Editar sección · ${ctx.grado.nombre} ${ctx.seccion.n}` : `Nueva sección · ${ctx ? `${ctx.nivel.nombre} ${ctx.grado.nombre}` : ""}`,
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        disabled: !n.trim() || !(parseInt(cap, 10) > 0),
        onClick: () => {
          onSave({
            n: n.trim(),
            turno,
            cap: parseInt(cap, 10),
            tutor,
            aux: aux === "— Sin auxiliar —" ? null : aux
          });
          onClose();
        }
      }, edit ? "Guardar cambios" : "Crear sección"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: inicial ? "Nombre de la sección" : "Letra de la sección",
      placeholder: inicial ? "Ej. Los Girasoles" : "Ej. C",
      required: true,
      value: n,
      onChange: e => setN(e.target.value),
      hint: inicial ? "En Inicial las secciones llevan nombre" : "En Primaria/Secundaria se usan letras"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Vacantes (capacidad)",
      type: "number",
      required: true,
      value: cap,
      onChange: e => setCap(e.target.value),
      suffix: "est."
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Turno"), /*#__PURE__*/React.createElement(RadioGroup, {
      name: "turno-sec",
      value: turno,
      onChange: e => setTurno(e.target.value),
      row: true
    }, /*#__PURE__*/React.createElement(Radio, {
      value: "M",
      label: "Ma\xF1ana"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "T",
      label: "Tarde"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Tutor de aula",
      options: TUTORES,
      value: tutor,
      onChange: e => setTutor(e.target.value),
      hint: "Docente responsable del aula"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Auxiliar de aula",
      options: AUXILIARES,
      value: aux,
      onChange: e => setAux(e.target.value),
      hint: "Opcional \u2014 apoyo al tutor (usual en Inicial)"
    })), edit && ctx.seccion.mat > parseInt(cap || 0, 10) && /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "Capacidad menor que los matriculados"
    }, "Hay ", ctx.seccion.mat, " estudiantes; no puedes reducir por debajo de eso.")));
  }
  function EstudiantesDialog({
    ctx,
    onClose
  }) {
    // ctx: { nivel, grado, seccion } — con drill-in a la ficha del estudiante
    const [q, setQ] = React.useState("");
    const [ficha, setFicha] = React.useState(null);
    React.useEffect(() => {
      if (ctx) {
        setQ("");
        setFicha(null);
      }
    }, [ctx]);
    if (!ctx) return null;
    const list = ALUMNOS.slice(0, Math.min(ctx.seccion.mat, ALUMNOS.length)).filter(a => a.toLowerCase().includes(q.toLowerCase()));
    const cols = [{
      key: "i",
      header: "N°",
      width: 44,
      align: "center",
      mono: true,
      render: (_, __, i) => i + 1
    }, {
      key: "nombre",
      header: "Estudiante",
      render: v => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "xs"
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: () => /*#__PURE__*/React.createElement(Badge, {
        tone: "success",
        dot: true
      }, "Activo")
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver ficha"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver ficha",
        size: "sm",
        onClick: () => setFicha(r.nombre)
      }, /*#__PURE__*/React.createElement(Ic.Eye, null)))
    }];
    const titulo = `${ctx.grado.nombre} ${ctx.nivel.id === "ini" ? `“${ctx.seccion.n}”` : ctx.seccion.n} ${ctx.nivel.nombre}`;
    if (ficha) {
      return /*#__PURE__*/React.createElement(Dialog, {
        open: true,
        onClose: onClose,
        size: "lg",
        icon: /*#__PURE__*/React.createElement(Ic.User, null),
        title: ficha,
        description: `Estudiante de ${titulo}`,
        footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
          variant: "secondary",
          onClick: () => setFicha(null)
        }, "\u2190 Volver a la n\xF3mina"), /*#__PURE__*/React.createElement(Button, {
          variant: "primary",
          iconLeft: /*#__PURE__*/React.createElement(Ic.Eye, null),
          onClick: () => {
            onClose();
            goTo("est");
            notify("info", "Ficha completa", `Abriendo el módulo Estudiantes con ${ficha}.`);
          }
        }, "Ficha completa en Estudiantes"))
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          paddingTop: 6
        }
      }, [["DNI", "70 481 559"], ["Código", "E-1042"], ["Apoderado principal", "Juana Roca Pérez (Madre)"], ["Teléfono", "964 221 880"], ["Estado", "Activo · Matrícula ratificada"], ["Estado de cuenta", "Al día"], ["Programas", "Taller de Danza"], ["Asistencia del bimestre", "96% · 1 tardanza"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
        key: k
      }, /*#__PURE__*/React.createElement("div", {
        className: "eyebrow",
        style: {
          marginBottom: 2
        }
      }, k), /*#__PURE__*/React.createElement("div", {
        style: {
          font: "var(--type-body-md)",
          color: "var(--text-body)"
        }
      }, v)))));
    }
    return /*#__PURE__*/React.createElement(Dialog, {
      open: true,
      onClose: onClose,
      size: "lg",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      title: `Estudiantes · ${titulo}`,
      description: `${ctx.seccion.mat} matriculados de ${ctx.seccion.cap} vacantes · Tutor: ${ctx.seccion.tutor}${ctx.seccion.aux ? ` · Auxiliar: ${ctx.seccion.aux}` : ""}`,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
        onClick: () => notify("success", "Nómina exportada", `Nómina de ${titulo} descargada en Excel.`)
      }, "Exportar n\xF3mina"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
        onClick: () => {
          onClose();
          goTo("matricula");
          notify("info", "Nueva matrícula", `Asistente abierto con ${titulo} preseleccionado.`);
        }
      }, "Matricular en esta secci\xF3n"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar estudiante\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null),
      value: q,
      onChange: e => setQ(e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        maxHeight: 320,
        overflowY: "auto"
      }
    }, list.length ? /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: list.map(nombre => ({
        nombre
      })),
      compact: true
    }) : /*#__PURE__*/React.createElement(EmptyState, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Ic.Search, null),
      title: "Sin resultados",
      description: `Nadie coincide con “${q}”.`
    })), ctx.seccion.mat > ALUMNOS.length && /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-subtle)"
      }
    }, "Mostrando ", ALUMNOS.length, " de ", ctx.seccion.mat, " (datos de ejemplo).")));
  }
  function CursoDialog({
    ctx,
    onClose,
    onSave
  }) {
    // ctx: { curso? } — new or edit
    const edit = ctx && ctx.curso;
    const [curso, setCurso] = React.useState("");
    const [horas, setHoras] = React.useState("2");
    const [doc, setDoc] = React.useState(DOCENTES[0]);
    React.useEffect(() => {
      if (!ctx) return;
      setCurso(edit ? ctx.curso.curso : "");
      setHoras(edit ? String(ctx.curso.horas) : "2");
      setDoc(edit ? ctx.curso.doc : DOCENTES[0]);
    }, [ctx]);
    return /*#__PURE__*/React.createElement(Dialog, {
      open: !!ctx,
      onClose: onClose,
      title: edit ? `Editar curso · ${ctx.curso.curso}` : "Agregar curso",
      icon: /*#__PURE__*/React.createElement(Ic.Book, null),
      description: "Primaria \xB7 3\xB0",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        disabled: !curso.trim() || !(parseInt(horas, 10) > 0),
        onClick: () => {
          onSave({
            curso: curso.trim(),
            horas: parseInt(horas, 10),
            doc
          });
          onClose();
        }
      }, edit ? "Guardar cambios" : "Agregar curso"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre del curso / \xE1rea",
      placeholder: "Ej. Computaci\xF3n",
      required: true,
      value: curso,
      onChange: e => setCurso(e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Horas semanales",
      type: "number",
      value: horas,
      onChange: e => setHoras(e.target.value),
      suffix: "h"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Docente asignado",
      options: DOCENTES,
      value: doc,
      onChange: e => setDoc(e.target.value)
    }))));
  }
  function CopiarPlanDialog({
    open,
    onClose,
    onCopy
  }) {
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      title: "Copiar plan de otro grado",
      icon: /*#__PURE__*/React.createElement(Ic.Copy, null),
      description: "Trae los cursos y horas; los docentes se reasignan despu\xE9s",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Copy, null),
        onClick: () => {
          onCopy();
          onClose();
        }
      }, "Copiar plan"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Nivel de origen",
      options: ["Inicial", "Primaria", "Secundaria"],
      defaultValue: "Primaria"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Grado de origen",
      options: ["1°", "2°", "4°", "5°", "6°"],
      defaultValue: "4\xB0"
    })));
  }
  function ProgramaDialog({
    ctx,
    onClose,
    onSave
  }) {
    // ctx: { prog?, idx? }
    const edit = ctx && ctx.prog;
    const [nombre, setNombre] = React.useState("");
    const [tipo, setTipo] = React.useState("Taller");
    const [dia, setDia] = React.useState("");
    const [tarifa, setTarifa] = React.useState("60.00");
    const [cap, setCap] = React.useState("25");
    const [activo, setActivo] = React.useState(true);
    React.useEffect(() => {
      if (!ctx) return;
      setNombre(edit ? ctx.prog.nombre : "");
      setTipo(edit ? ctx.prog.tipo : "Taller");
      setDia(edit ? ctx.prog.dia : "");
      setTarifa(edit ? ctx.prog.tarifa : "60.00");
      setCap(edit ? String(ctx.prog.cap) : "25");
      setActivo(edit ? ctx.prog.estado === "Activo" : true);
    }, [ctx]);
    return /*#__PURE__*/React.createElement(Dialog, {
      open: !!ctx,
      onClose: onClose,
      title: edit ? `Editar · ${ctx.prog.nombre}` : "Nuevo programa",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      description: "Talleres, reforzamiento y academia \u2014 con matr\xEDcula y tarifa propia",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        disabled: !nombre.trim(),
        onClick: () => {
          onSave({
            nombre: nombre.trim(),
            tipo,
            dia: dia.trim() || "Por definir",
            tarifa,
            cap: parseInt(cap, 10) || 0,
            mat: edit ? ctx.prog.mat : 0,
            estado: activo ? "Activo" : "Cerrado"
          });
          onClose();
        }
      }, edit ? "Guardar cambios" : "Crear programa"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre",
      placeholder: "Ej. Taller de Ajedrez",
      required: true,
      value: nombre,
      onChange: e => setNombre(e.target.value)
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Tipo",
      options: ["Taller", "Reforzamiento", "Academia"],
      value: tipo,
      onChange: e => setTipo(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Horario",
      placeholder: "Ej. S\xE1b 9:00\u201311:00",
      value: dia,
      onChange: e => setDia(e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Vacantes",
      type: "number",
      value: cap,
      onChange: e => setCap(e.target.value)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        alignItems: "end"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Tarifa mensual",
      prefix: "S/.",
      value: tarifa,
      onChange: e => setTarifa(e.target.value.replace(/[^0-9.]/g, "")),
      inputMode: "decimal"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        height: 38
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: "Programa activo",
      description: "Visible al matricular",
      checked: activo,
      onChange: e => setActivo(e.target.checked)
    })))));
  }

  /* ------------------------------ tree ------------------------------ */
  function SeccionRow({
    s,
    inicial,
    onEdit,
    onView
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "minmax(150px,1.2fr) 90px 1.4fr minmax(180px,1fr) 76px",
        alignItems: "center",
        gap: 14,
        padding: "9px 16px 9px 46px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 99,
        background: "var(--border-strong)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, inicial ? s.n : `Sección ${s.n}`)), /*#__PURE__*/React.createElement(Badge, {
      tone: s.turno === "M" ? "info" : "accent"
    }, s.turno === "M" ? "Mañana" : "Tarde"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 0
      }
    }, s.tutor !== "— Sin asignar —" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Avatar, {
      name: s.tutor,
      size: "xs"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, s.tutor)) : /*#__PURE__*/React.createElement(Badge, {
      tone: "warning",
      size: "sm"
    }, "Sin tutor"), s.aux && /*#__PURE__*/React.createElement(Tooltip, {
      content: `Auxiliar: ${s.aux}`
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-pill)",
        padding: "1px 8px 1px 2px",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: s.aux,
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-muted)"
      }
    }, "Aux.")))), /*#__PURE__*/React.createElement(VacBar, {
      mat: s.mat,
      cap: s.cap
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "inline-flex",
        gap: 2,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Tooltip, {
      content: "Editar secci\xF3n"
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Editar",
      size: "sm",
      onClick: onEdit
    }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), /*#__PURE__*/React.createElement(Tooltip, {
      content: "Ver estudiantes"
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Ver",
      size: "sm",
      onClick: onView
    }, /*#__PURE__*/React.createElement(Ic.Users, null)))));
  }
  function GradoBlock({
    g,
    inicial,
    onAddSeccion,
    onEditSeccion,
    onViewSeccion
  }) {
    const [open, setOpen] = React.useState(true);
    const tot = g.secciones.reduce((a, s) => a + s.mat, 0);
    const cap = g.secciones.reduce((a, s) => a + s.cap, 0);
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpen(o => !o),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        cursor: "pointer",
        userSelect: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        color: "var(--text-muted)",
        transition: "transform var(--duration-fast)",
        transform: open ? "rotate(0deg)" : "rotate(-90deg)"
      }
    }, /*#__PURE__*/React.createElement(Ic.ChevronDown, null)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)",
        width: 70
      }
    }, g.nombre), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, g.secciones.length ? `${g.secciones.length} ${g.secciones.length === 1 ? "sección" : "secciones"} · ${tot}/${cap} estudiantes` : "Sin secciones aún"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: e => {
        e.stopPropagation();
        onAddSeccion();
      }
    }, "Secci\xF3n")), open && g.secciones.map((s, i) => /*#__PURE__*/React.createElement(SeccionRow, {
      key: s.n + i,
      s: s,
      inicial: inicial,
      onEdit: () => onEditSeccion(s, i),
      onView: () => onViewSeccion(s)
    })));
  }
  function NivelCard({
    nv,
    onAddGrado,
    onAddSeccion,
    onEditSeccion,
    onViewSeccion
  }) {
    const [open, setOpen] = React.useState(true);
    const tot = nv.grados.reduce((a, g) => a + g.secciones.reduce((x, s) => x + s.mat, 0), 0);
    const secc = nv.grados.reduce((a, g) => a + g.secciones.length, 0);
    return /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpen(o => !o),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        cursor: "pointer",
        userSelect: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        borderRadius: "var(--radius-md)",
        background: nv.soft,
        color: nv.color,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18
      }
    }, /*#__PURE__*/React.createElement(Ic.Layers, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-h3)",
        color: "var(--text-strong)"
      }
    }, nv.nombre, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)",
        fontWeight: 400
      }
    }, "\xB7 ", nv.rango)), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, nv.grados.length, " grados \xB7 ", secc, " secciones \xB7 ", tot, " estudiantes")), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: e => {
        e.stopPropagation();
        onAddGrado();
      }
    }, "Grado"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        color: "var(--text-muted)",
        transition: "transform var(--duration-fast)",
        transform: open ? "rotate(180deg)" : "none"
      }
    }, /*#__PURE__*/React.createElement(Ic.ChevronDown, null))), open && /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border-subtle)"
      }
    }, nv.grados.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "18px 16px"
      }
    }, /*#__PURE__*/React.createElement(EmptyState, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Ic.Layers, null),
      title: "Nivel sin grados",
      description: "Crea el primer grado con el bot\xF3n \u201C+ Grado\u201D."
    })), nv.grados.map(g => /*#__PURE__*/React.createElement(GradoBlock, {
      key: g.nombre,
      g: g,
      inicial: nv.id === "ini",
      onAddSeccion: () => onAddSeccion(nv, g),
      onEditSeccion: (s, i) => onEditSeccion(nv, g, s, i),
      onViewSeccion: s => onViewSeccion(nv, g, s)
    }))));
  }

  /* ------------------------------ wizard (iniciar año) ------------------------------ */
  function YearWizard({
    open,
    onClose
  }) {
    const [step, setStep] = React.useState(0);
    const STEPS = ["Datos del año", "Estructura", "Promoción", "Confirmar"];
    React.useEffect(() => {
      if (open) setStep(0);
    }, [open]);
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      size: "lg",
      title: "Iniciar a\xF1o acad\xE9mico 2027",
      description: "Asistente de apertura \u2014 nada se aplica hasta el paso final.",
      icon: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: step === 0 ? onClose : () => setStep(s => s - 1)
      }, step === 0 ? "Cancelar" : "Atrás"), step < 3 ? /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconRight: /*#__PURE__*/React.createElement(Ic.ArrowRight, null),
        onClick: () => setStep(s => s + 1)
      }, "Siguiente") : /*#__PURE__*/React.createElement(Button, {
        variant: "accent",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          onClose();
          notify("success", "Año académico 2027 iniciado", "Estructura copiada y 448 pre-matrículas generadas (simulación).");
        }
      }, "Iniciar a\xF1o 2027"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, STEPS.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: s,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        borderRadius: 99,
        background: i <= step ? "var(--brand)" : "var(--surface-sunken)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        fontWeight: i === step ? 600 : 400,
        color: i === step ? "var(--brand)" : "var(--text-muted)"
      }
    }, i + 1, ". ", s)))), step === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre",
      defaultValue: "A\xF1o acad\xE9mico 2027",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Inicio de clases",
      type: "date",
      defaultValue: "2027-03-08"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fin de clases",
      type: "date",
      defaultValue: "2027-12-17"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Divisi\xF3n del a\xF1o",
      options: ["4 bimestres", "3 trimestres", "2 semestres"],
      defaultValue: "4 bimestres"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Inicio de matr\xEDcula",
      type: "date",
      defaultValue: "2027-01-11"
    })), step === 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      icon: /*#__PURE__*/React.createElement(Ic.Copy, null)
    }, "Se copiar\xE1 la estructura del a\xF1o 2026: 3 niveles, 14 grados, 17 secciones y su plan de estudios."), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Copiar niveles, grados y secciones",
      description: "Con sus turnos y l\xEDmites de vacantes",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Copiar plan de estudios",
      description: "Cursos y horas por grado",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Copiar tutores y auxiliares asignados",
      description: "Podr\xE1s reasignarlos despu\xE9s"
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Copiar programas complementarios",
      description: "Talleres y reforzamientos con sus tarifas",
      defaultChecked: true
    })), step === 2 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "Promoci\xF3n de estudiantes"
    }, "Cada estudiante activo ser\xE1 propuesto en el grado siguiente. Revisa los casos de repitencia antes de confirmar la matr\xEDcula \u2014 la promoci\xF3n genera ", /*#__PURE__*/React.createElement("b", null, "pre-matr\xEDculas"), ", no matr\xEDculas definitivas."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12
      }
    }, [["448", "Promovidos al grado siguiente"], ["31", "Egresan (5° Secundaria)"], ["3", "Posible repitencia — revisar"]].map(([n, l]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "12px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-h2)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, l))))), step === 3 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "success",
      title: "Todo listo"
    }, "Se crear\xE1 el ", /*#__PURE__*/React.createElement("b", null, "A\xF1o acad\xE9mico 2027"), " (4 bimestres, del 08/03 al 17/12) con la estructura copiada de 2026 y 448 pre-matr\xEDculas por ratificar. El a\xF1o 2026 pasar\xE1 a estado ", /*#__PURE__*/React.createElement("b", null, "Cerrado"), " al finalizar sus periodos."), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Entiendo que esta acci\xF3n abre el nuevo a\xF1o acad\xE9mico"
    }))));
  }

  /* ------------------------------ Plan de estudios tab ------------------------------ */
  function PlanEstudios() {
    const [cursos, setCursos] = React.useState(CURSOS_INIT);
    const [dlg, setDlg] = React.useState(null); // {curso?, idx?}
    const [copiar, setCopiar] = React.useState(false);
    const cols = [{
      key: "curso",
      header: "Curso / área",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "horas",
      header: "Horas semanales",
      align: "center",
      mono: true
    }, {
      key: "doc",
      header: "Docente asignado",
      render: v => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "xs"
      }), /*#__PURE__*/React.createElement("span", null, v))
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r, i) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setDlg({
          curso: r,
          idx: i
        })
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Quitar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Quitar",
        size: "sm",
        variant: "danger",
        onClick: () => {
          setCursos(cs => cs.filter((_, x) => x !== i));
          notify("info", "Curso quitado", `${r.curso} eliminado del plan de 3°.`);
        }
      }, /*#__PURE__*/React.createElement(Ic.Trash, null))))
    }];
    const totalH = cursos.reduce((a, r) => a + r.horas, 0);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Nivel",
      options: ["Inicial", "Primaria", "Secundaria"],
      defaultValue: "Primaria",
      containerStyle: {
        width: 160
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Grado",
      options: ["1°", "2°", "3°", "4°", "5°", "6°"],
      defaultValue: "3\xB0",
      containerStyle: {
        width: 110
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Copy, null),
      onClick: () => setCopiar(true)
    }, "Copiar de otro grado"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setDlg({})
    }, "Agregar curso")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: cursos,
      hover: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 16px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", null, cursos.length, " cursos \xB7 Primaria 3\xB0"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)"
      }
    }, totalH, " h semanales"))), /*#__PURE__*/React.createElement(CursoDialog, {
      ctx: dlg,
      onClose: () => setDlg(null),
      onSave: data => {
        setCursos(cs => dlg.curso ? cs.map((c, i) => i === dlg.idx ? data : c) : [...cs, data]);
        notify("success", dlg.curso ? "Curso actualizado" : "Curso agregado", `${data.curso} · ${data.horas} h semanales · ${data.doc}.`);
      }
    }), /*#__PURE__*/React.createElement(CopiarPlanDialog, {
      open: copiar,
      onClose: () => setCopiar(false),
      onCopy: () => {
        setCursos(cs => [...cs, {
          curso: "Computación",
          horas: 2,
          doc: "Mario Silva"
        }]);
        notify("success", "Plan copiado", "Cursos de Primaria 4° traídos a 3° — revisa los docentes.");
      }
    }));
  }

  /* ------------------------------ Programas tab ------------------------------ */
  function ProgMatriculadosDialog({
    prog,
    onClose
  }) {
    if (!prog) return null;
    const list = ALUMNOS.slice(0, Math.min(prog.mat, ALUMNOS.length));
    const cols = [{
      key: "i",
      header: "N°",
      width: 44,
      align: "center",
      mono: true,
      render: (_, __, i) => i + 1
    }, {
      key: "nombre",
      header: "Estudiante",
      render: v => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "xs"
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "pago",
      header: "Mensualidad",
      align: "center",
      render: (_, __, i) => /*#__PURE__*/React.createElement(Badge, {
        tone: i % 4 === 2 ? "warning" : "success",
        dot: true
      }, i % 4 === 2 ? "Pendiente" : "Pagado")
    }];
    return /*#__PURE__*/React.createElement(Dialog, {
      open: true,
      onClose: onClose,
      size: "lg",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      title: `Matriculados · ${prog.nombre}`,
      description: `${prog.mat} de ${prog.cap} vacantes · ${prog.dia} · S/ ${prog.tarifa} mensual`,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
        onClick: () => notify("success", "Nómina exportada", `Matriculados de ${prog.nombre} descargados en Excel.`)
      }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
        onClick: () => {
          onClose();
          goTo("matricula");
          notify("info", "Nueva matrícula", `Asistente abierto con ${prog.nombre} preseleccionado.`);
        }
      }, "Matricular al programa"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        maxHeight: 320,
        overflowY: "auto",
        marginTop: 4
      }
    }, list.length ? /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: list.map(nombre => ({
        nombre
      })),
      compact: true
    }) : /*#__PURE__*/React.createElement(EmptyState, {
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      title: "Sin matriculados",
      description: "Este programa a\xFAn no tiene estudiantes."
    })));
  }
  function Programas() {
    const [progs, setProgs] = React.useState(PROGRAMAS_INIT);
    const [dlg, setDlg] = React.useState(null); // {prog?, idx?}
    const [ver, setVer] = React.useState(null);
    const cols = [{
      key: "nombre",
      header: "Programa",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.dia))
    }, {
      key: "tipo",
      header: "Tipo",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Taller" ? "accent" : v === "Reforzamiento" ? "info" : "brand"
      }, v)
    }, {
      key: "tarifa",
      header: "Tarifa mensual",
      num: true,
      mono: true,
      render: v => `S/ ${v}`
    }, {
      key: "vac",
      header: "Matriculados",
      render: (_, r) => /*#__PURE__*/React.createElement(VacBar, {
        mat: r.mat,
        cap: r.cap
      })
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Activo" ? "success" : "neutral",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r, i) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setDlg({
          prog: r,
          idx: i
        })
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver matriculados"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => setVer(r)
      }, /*#__PURE__*/React.createElement(Ic.Users, null))))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "Los programas usan la misma matr\xEDcula y cobranza que la ense\xF1anza regular, con su propia tarifa. Un estudiante puede matricularse en varios programas."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setDlg({})
    }, "Nuevo programa")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: progs,
      hover: true
    })), /*#__PURE__*/React.createElement(ProgramaDialog, {
      ctx: dlg,
      onClose: () => setDlg(null),
      onSave: data => {
        setProgs(ps => dlg.prog ? ps.map((p, i) => i === dlg.idx ? data : p) : [...ps, data]);
        notify("success", dlg.prog ? "Programa actualizado" : "Programa creado", `${data.nombre} · S/ ${data.tarifa} mensual.`);
      }
    }), /*#__PURE__*/React.createElement(ProgMatriculadosDialog, {
      prog: ver,
      onClose: () => setVer(null)
    }));
  }

  /* ------------------------------ Periodos tab ------------------------------ */
  function PeriodoDialog({
    ctx,
    onClose
  }) {
    if (!ctx) return null;
    const toDate = s => `2026-${s.split("/")[1]}-${s.split("/")[0]}`;
    return /*#__PURE__*/React.createElement(Dialog, {
      open: true,
      onClose: onClose,
      title: `Editar · ${ctx.n}`,
      icon: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      description: "Las fechas definen qu\xE9 periodo est\xE1 en curso",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          onClose();
          notify("success", "Periodo actualizado", `${ctx.n} guardado.`);
        }
      }, "Guardar"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Inicio",
      type: "date",
      defaultValue: toDate(ctx.ini)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fin",
      type: "date",
      defaultValue: toDate(ctx.fin)
    })), ctx.estado === "Cerrado" && /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "Periodo cerrado",
      style: {
        marginTop: 12
      }
    }, "Modificar un periodo cerrado no reabre sus notas ni asistencias."));
  }
  function Periodos() {
    const [edit, setEdit] = React.useState(null);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 14
      }
    }, PERIODOS.map(p => /*#__PURE__*/React.createElement(Card, {
      key: p.n,
      title: p.n,
      subtitle: `${p.ini} — ${p.fin}`,
      actions: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 4
        }
      }, /*#__PURE__*/React.createElement(Badge, {
        tone: p.estado === "En curso" ? "success" : p.estado === "Cerrado" ? "neutral" : "info",
        dot: true
      }, p.estado), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar fechas"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setEdit(p)
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))))
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: p.avance,
      showValue: true,
      size: "sm",
      tone: p.estado === "Cerrado" ? "success" : "brand",
      label: "Avance"
    }))), /*#__PURE__*/React.createElement(PeriodoDialog, {
      ctx: edit,
      onClose: () => setEdit(null)
    }));
  }

  /* ------------------------------ screen ------------------------------ */
  const PALETA = [{
    color: "var(--blue-500)",
    soft: "var(--surface-brand-soft)"
  }, {
    color: "var(--gold-500)",
    soft: "var(--surface-accent-soft)"
  }, {
    color: "var(--green-500)",
    soft: "var(--success-soft)"
  }, {
    color: "var(--brown-400)",
    soft: "var(--surface-sunken)"
  }];
  window.SGE_Structure = function Structure() {
    const [tab, setTab] = React.useState("estructura");
    const [wizard, setWizard] = React.useState(false);
    const [niveles, setNiveles] = React.useState(NIVELES_INIT);
    const [nivelDlg, setNivelDlg] = React.useState(false);
    const [gradoDlg, setGradoDlg] = React.useState(null); // { nivel }
    const [seccionDlg, setSeccionDlg] = React.useState(null); // { nivel, grado, seccion?, idx? }
    const [verDlg, setVerDlg] = React.useState(null); // { nivel, grado, seccion }

    const totalSecc = niveles.reduce((a, nv) => a + nv.grados.reduce((x, g) => x + g.secciones.length, 0), 0);
    const mutate = (nivelId, gradoNombre, fn) => setNiveles(nvs => nvs.map(nv => nv.id !== nivelId ? nv : {
      ...nv,
      grados: nv.grados.map(g => g.nombre !== gradoNombre ? g : fn(g))
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: "var(--radius-md)",
        background: "var(--surface-brand-soft)",
        color: "var(--brand)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 21
      }
    }, /*#__PURE__*/React.createElement(Ic.Calendar, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h3)",
        color: "var(--text-strong)"
      }
    }, "A\xF1o acad\xE9mico 2026"), /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      dot: true
    }, "Activo")), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "09/03/2026 \u2014 18/12/2026 \xB7 4 bimestres \xB7 Bimestre II en curso")), /*#__PURE__*/React.createElement(Select, {
      options: ["2026", "2025", "2024"],
      defaultValue: "2026",
      containerStyle: {
        width: 110
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      onClick: () => setWizard(true)
    }, "Iniciar a\xF1o 2027"))), /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "estructura",
        label: "Estructura",
        count: totalSecc
      }, {
        id: "plan",
        label: "Plan de estudios"
      }, {
        id: "prog",
        label: "Programas",
        count: 4
      }, {
        id: "per",
        label: "Periodos"
      }]
    }), tab === "estructura" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNivelDlg(true)
    }, "Nuevo nivel")), niveles.map(nv => /*#__PURE__*/React.createElement(NivelCard, {
      key: nv.id,
      nv: nv,
      onAddGrado: () => setGradoDlg({
        nivel: nv
      }),
      onAddSeccion: (nivel, g) => setSeccionDlg({
        nivel,
        grado: g
      }),
      onEditSeccion: (nivel, g, s, i) => setSeccionDlg({
        nivel,
        grado: g,
        seccion: s,
        idx: i
      }),
      onViewSeccion: (nivel, g, s) => setVerDlg({
        nivel,
        grado: g,
        seccion: s
      })
    }))), tab === "plan" && /*#__PURE__*/React.createElement(PlanEstudios, null), tab === "prog" && /*#__PURE__*/React.createElement(Programas, null), tab === "per" && /*#__PURE__*/React.createElement(Periodos, null), /*#__PURE__*/React.createElement(YearWizard, {
      open: wizard,
      onClose: () => setWizard(false)
    }), /*#__PURE__*/React.createElement(NivelDialog, {
      open: nivelDlg,
      onClose: () => setNivelDlg(false),
      onSave: ({
        nombre,
        rango
      }) => {
        const pal = PALETA[niveles.length % PALETA.length];
        setNiveles(nvs => [...nvs, {
          id: "nv" + Date.now(),
          nombre,
          rango,
          color: pal.color,
          soft: pal.soft,
          grados: []
        }]);
        notify("success", "Nivel creado", `${nombre} agregado — crea sus grados desde el árbol.`);
      }
    }), /*#__PURE__*/React.createElement(GradoDialog, {
      ctx: gradoDlg,
      onClose: () => setGradoDlg(null),
      onSave: nombre => {
        setNiveles(nvs => nvs.map(nv => nv.id !== gradoDlg.nivel.id ? nv : {
          ...nv,
          grados: [...nv.grados, {
            nombre,
            secciones: []
          }]
        }));
        notify("success", "Grado creado", `${nombre} · ${gradoDlg.nivel.nombre} — agrégale secciones.`);
      }
    }), /*#__PURE__*/React.createElement(SeccionDialog, {
      ctx: seccionDlg,
      onClose: () => setSeccionDlg(null),
      onSave: data => {
        const {
          nivel,
          grado,
          seccion,
          idx
        } = seccionDlg;
        mutate(nivel.id, grado.nombre, g => seccion ? {
          ...g,
          secciones: g.secciones.map((s, i) => i === idx ? {
            ...s,
            ...data
          } : s)
        } : {
          ...g,
          secciones: [...g.secciones, {
            ...data,
            mat: 0
          }]
        });
        notify("success", seccion ? "Sección actualizada" : "Sección creada", `${grado.nombre} ${data.n} · ${data.turno === "M" ? "Mañana" : "Tarde"} · ${data.cap} vacantes.`);
      }
    }), /*#__PURE__*/React.createElement(EstudiantesDialog, {
      ctx: verDlg,
      onClose: () => setVerDlg(null)
    }));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/AcademicStructureScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/AnnouncementsScreen.jsx
try { (() => {
/* Elohim SGE — Comunicados. Registers window.SGE_Announcements. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Button,
    IconButton,
    Input,
    Select,
    Textarea,
    Tooltip,
    Dialog,
    Checkbox,
    StatCard
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const DATA = [["C-0087", "Suspensión de clases · aniversario de Satipo", "Todo el colegio", "WhatsApp + correo", "06/07", "Enviado", 356], ["C-0086", "Reunión de apoderados · 3° Primaria", "3° A y 3° B Primaria", "WhatsApp", "04/07", "Enviado", 52], ["C-0085", "Cronograma de exámenes · Bimestre II", "Primaria y Secundaria", "WhatsApp + correo", "02/07", "Enviado", 310], ["C-0088", "Campaña de vacunación (citación)", "Inicial", "WhatsApp", "09/07", "Programado", 62], ["C-0089", "Olimpiadas Elohim 2026", "Todo el colegio", "—", "—", "Borrador", 0]];
  window.SGE_Announcements = function Announcements() {
    const [dlg, setDlg] = React.useState(null); // {} nuevo · {c} ver/editar
    const cols = [{
      key: "cod",
      header: "N°",
      mono: true,
      width: 80
    }, {
      key: "titulo",
      header: "Comunicado",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "alcance",
      header: "Alcance",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: "brand"
      }, v)
    }, {
      key: "canal",
      header: "Canal",
      align: "center",
      render: v => v === "—" ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-subtle)"
        }
      }, "\u2014") : /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral"
      }, v)
    }, {
      key: "fecha",
      header: "Envío",
      mono: true,
      align: "center"
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Enviado" ? "success" : v === "Programado" ? "info" : "neutral",
        dot: true
      }, v)
    }, {
      key: "dest",
      header: "Destinatarios",
      align: "center",
      mono: true,
      render: v => v || "—"
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: r.estado === "Borrador" ? "Editar" : "Ver / reenviar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => setDlg({
          c: r
        })
      }, r.estado === "Borrador" ? /*#__PURE__*/React.createElement(Ic.Pencil, null) : /*#__PURE__*/React.createElement(Ic.Eye, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Duplicar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Duplicar",
        size: "sm",
        onClick: () => notify("info", "Comunicado duplicado", `Copia de "${r.titulo}" creada como borrador.`)
      }, /*#__PURE__*/React.createElement(Ic.Copy, null))))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Enviados \xB7 Julio",
      value: "12",
      icon: /*#__PURE__*/React.createElement(Ic.Send, null),
      caption: "3 esta semana"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Tasa de lectura",
      value: "87%",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Check, null),
      caption: "WhatsApp \xFAltimos 30 d\xEDas"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Programados",
      value: "1",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Clock, null),
      caption: "para esta semana"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar comunicado\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Estado",
      options: ["Enviado", "Programado", "Borrador"],
      containerStyle: {
        width: 150
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Megaphone, null),
      onClick: () => setDlg({})
    }, "Nuevo comunicado")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: DATA.map(d => ({
        cod: d[0],
        titulo: d[1],
        alcance: d[2],
        canal: d[3],
        fecha: d[4],
        estado: d[5],
        dest: d[6]
      })),
      hover: true,
      zebra: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: !!dlg,
      onClose: () => setDlg(null),
      size: "lg",
      icon: /*#__PURE__*/React.createElement(Ic.Megaphone, null),
      title: dlg && dlg.c ? dlg.c.titulo : "Nuevo comunicado",
      description: dlg && dlg.c ? `${dlg.c.cod} · ${dlg.c.estado}` : "Llega al contacto principal de cada familia del alcance",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => {
          notify("info", "Borrador guardado", "Lo encuentras en la lista con estado Borrador.");
          setDlg(null);
        }
      }, "Guardar borrador"), /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setDlg(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Send, null),
        onClick: () => {
          notify("success", "Comunicado enviado", "356 familias lo recibirán por WhatsApp y correo.");
          setDlg(null);
        }
      }, "Enviar ahora"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "T\xEDtulo",
      required: true,
      defaultValue: dlg && dlg.c ? dlg.c.titulo : "",
      placeholder: "Ej. Reuni\xF3n de apoderados"
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "Mensaje",
      rows: 4,
      required: true,
      placeholder: "Estimadas familias\u2026",
      defaultValue: dlg && dlg.c ? "Estimadas familias: …" : ""
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Alcance",
      options: ["Todo el colegio", "Inicial", "Primaria", "Secundaria", "Una sección…"],
      defaultValue: dlg && dlg.c ? undefined : "Todo el colegio"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Canal",
      options: ["WhatsApp + correo", "Solo WhatsApp", "Solo correo"],
      defaultValue: "WhatsApp + correo"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Programar env\xEDo",
      type: "date",
      hint: "Vac\xEDo = inmediato"
    })), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Solicitar confirmaci\xF3n de lectura",
      description: "El apoderado responde 'Recibido' desde WhatsApp",
      defaultChecked: true
    }))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/AnnouncementsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/CalendarScreen.jsx
try { (() => {
/* Elohim SGE — Calendario académico. Registers window.SGE_Calendar.
   Tipos de evento: feriado/no lectivo (bloquea asistencia y marcación), exámenes,
   actividad institucional (enlaza a comunicados) y vencimiento de pensiones. */
(function () {
  const {
    Card,
    Badge,
    Button,
    IconButton,
    Input,
    Select,
    Textarea,
    Dialog,
    Alert,
    Tooltip,
    Checkbox
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);
  const TIPOS = {
    feriado: {
      label: "Feriado / no lectivo",
      color: "var(--danger)",
      soft: "var(--danger-soft)",
      fg: "var(--danger-soft-fg)"
    },
    examen: {
      label: "Exámenes",
      color: "var(--brand)",
      soft: "var(--surface-brand-soft)",
      fg: "var(--info-soft-fg)"
    },
    actividad: {
      label: "Actividad",
      color: "var(--gold-500)",
      soft: "var(--surface-accent-soft)",
      fg: "var(--gold-700)"
    },
    pension: {
      label: "Vencimiento pensiones",
      color: "var(--success)",
      soft: "var(--success-soft)",
      fg: "var(--success-soft-fg)"
    }
  };
  // Julio 2026 — 1 = miércoles
  const EVENTOS = {
    6: [{
      t: "actividad",
      n: "Día del Maestro · actuación"
    }],
    13: [{
      t: "examen",
      n: "Exámenes Bim. II · Com."
    }],
    14: [{
      t: "examen",
      n: "Exámenes Bim. II · Mat."
    }],
    15: [{
      t: "examen",
      n: "Exámenes Bim. II · CyT"
    }],
    16: [{
      t: "examen",
      n: "Exámenes Bim. II · PS/Ing."
    }],
    17: [{
      t: "examen",
      n: "Exámenes Bim. II · Arte/Rel."
    }],
    24: [{
      t: "actividad",
      n: "Festival folclórico · aniversario Satipo"
    }],
    27: [{
      t: "feriado",
      n: "Día no lectivo (puente)"
    }],
    28: [{
      t: "feriado",
      n: "Fiestas Patrias"
    }],
    29: [{
      t: "feriado",
      n: "Fiestas Patrias"
    }],
    31: [{
      t: "pension",
      n: "Vence pensión de Julio"
    }]
  };
  window.SGE_Calendar = function Calendar() {
    const [nuevo, setNuevo] = React.useState(false);
    const [tipo, setTipo] = React.useState("feriado");
    const primerDia = 3; // 1 jul 2026 = miércoles (0=lunes)
    const dias = 31;
    const celdas = [];
    for (let i = 0; i < primerDia; i++) celdas.push(null);
    for (let d = 1; d <= dias; d++) celdas.push(d);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Mes anterior",
      variant: "outline",
      size: "sm",
      onClick: () => notify("info", "Junio 2026", "Navegación entre meses (demo en Julio).")
    }, /*#__PURE__*/React.createElement(Ic.ChevronRight, {
      style: {
        transform: "rotate(180deg)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h3)",
        minWidth: 130,
        textAlign: "center"
      }
    }, "Julio 2026"), /*#__PURE__*/React.createElement(IconButton, {
      label: "Mes siguiente",
      variant: "outline",
      size: "sm",
      onClick: () => notify("info", "Agosto 2026", "Navegación entre meses (demo en Julio).")
    }, /*#__PURE__*/React.createElement(Ic.ChevronRight, null))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        flex: 1
      }
    }, Object.entries(TIPOS).map(([k, t]) => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 99,
        background: t.color
      }
    }), t.label))), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNuevo(true)
    }, "Nuevo evento")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)"
      }
    }, ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        padding: "9px 10px",
        font: "var(--type-caption)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-caps)",
        color: i >= 5 ? "var(--text-subtle)" : "var(--text-muted)",
        textAlign: "center",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, d)), celdas.map((d, i) => {
      const col = i % 7;
      const finde = col >= 5;
      const evs = d ? EVENTOS[d] || [] : [];
      const feriado = evs.some(e => e.t === "feriado");
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          minHeight: 86,
          padding: "6px 8px",
          borderBottom: "1px solid var(--border-subtle)",
          borderLeft: col > 0 ? "1px solid var(--border-subtle)" : "none",
          background: d == null ? "var(--surface-sunken)" : feriado ? "var(--danger-soft)" : finde ? "var(--surface-sunken)" : "var(--surface-card)",
          display: "flex",
          flexDirection: "column",
          gap: 4
        }
      }, d && /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-caption)",
          fontWeight: 600,
          color: d === 7 ? "var(--brand)" : finde || feriado ? "var(--text-subtle)" : "var(--text-body)"
        }
      }, d, d === 7 && /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          fontWeight: 400
        }
      }, " \xB7 hoy")), evs.map(e => /*#__PURE__*/React.createElement("span", {
        key: e.n,
        title: e.n,
        onClick: () => e.t === "actividad" ? notify("info", e.n, "Actividad institucional — puedes crear su comunicado desde aquí.") : e.t === "pension" ? (goTo("pagos"), notify("info", "Pensiones", "Abriendo las cuotas que vencen el 31/07.")) : notify("info", e.n, e.t === "feriado" ? "Día no lectivo: la asistencia queda bloqueada y no se computan tardanzas." : "Visible para los docentes en su portal."),
        style: {
          font: "var(--type-2xs)",
          fontWeight: 600,
          color: TIPOS[e.t].fg,
          background: TIPOS[e.t].soft,
          borderLeft: `3px solid ${TIPOS[e.t].color}`,
          borderRadius: "var(--radius-xs)",
          padding: "3px 6px",
          cursor: "pointer",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, e.n)));
    }))), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Efectos del calendario"
    }, "Los d\xEDas ", /*#__PURE__*/React.createElement("b", null, "feriados/no lectivos"), " bloquean la asistencia de estudiantes y la marcaci\xF3n de personal (sin tardanzas). Las fechas de ", /*#__PURE__*/React.createElement("b", null, "ex\xE1menes"), " se muestran al docente en su portal; las ", /*#__PURE__*/React.createElement("b", null, "actividades"), " pueden generar un comunicado; los ", /*#__PURE__*/React.createElement("b", null, "vencimientos"), " se enlazan con Pensiones."), /*#__PURE__*/React.createElement(Dialog, {
      open: nuevo,
      onClose: () => setNuevo(false),
      size: "lg",
      title: "Nuevo evento",
      icon: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNuevo(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setNuevo(false);
          notify("success", "Evento creado", tipo === "feriado" ? "Día marcado como no lectivo: asistencia y marcación bloqueadas." : "Evento agregado al calendario.");
        }
      }, "Crear evento"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre",
      required: true,
      placeholder: "Ej. Simulacro de sismo",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Tipo",
      options: [{
        value: "feriado",
        label: "Feriado / no lectivo"
      }, {
        value: "examen",
        label: "Exámenes"
      }, {
        value: "actividad",
        label: "Actividad institucional"
      }, {
        value: "pension",
        label: "Vencimiento de pensiones"
      }],
      value: tipo,
      onChange: e => setTipo(e.target.value)
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Desde",
      type: "date",
      defaultValue: "2026-07-20"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Hasta",
      type: "date",
      defaultValue: "2026-07-20",
      hint: "Igual = un solo d\xEDa"
    })), tipo === "feriado" && /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      style: {
        gridColumn: "1 / -1"
      }
    }, "Ese d\xEDa se bloquear\xE1 la asistencia de estudiantes y la marcaci\xF3n de personal \u2014 no se computar\xE1n tardanzas ni faltas."), tipo === "actividad" && /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: "Crear comunicado a las familias",
      description: "Se abrir\xE1 como borrador en Comunicados",
      defaultChecked: true
    })), /*#__PURE__*/React.createElement(Textarea, {
      label: "Descripci\xF3n",
      rows: 2,
      placeholder: "Opcional\u2026",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/CalendarScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/CashierScreen.jsx
try { (() => {
/* Elohim SGE — Caja y cobros. Registers window.SGE_Cashier.
   Tabs: Cobrar (buscar estudiante → seleccionar cuotas/conceptos → método → recibo)
   y Caja del día (apertura, movimientos, cierre con arqueo). */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Tabs,
    Alert,
    Tooltip,
    Checkbox,
    Radio,
    RadioGroup,
    StatCard,
    Dialog,
    Textarea
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const fmt = n => `S/ ${Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: 2
  })}`;

  /* ------------------------------ recibo ------------------------------ */
  function ReceiptDialog({
    open,
    onClose,
    items,
    total,
    metodo
  }) {
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      size: "md",
      showClose: true,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Send, null),
        onClick: () => notify("success", "Recibo enviado", "Juana Roca Pérez lo recibirá por WhatsApp y correo.")
      }, "Enviar al apoderado"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Printer, null),
        onClick: () => notify("info", "Imprimiendo", "Recibo R-2026-04313 enviado a la impresora de Secretaría.")
      }, "Imprimir recibo"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/elohim-insignia.png",
      alt: "",
      style: {
        width: 44,
        height: 44,
        objectFit: "contain"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 700,
        color: "var(--text-strong)",
        fontFamily: "var(--font-sans)"
      }
    }, "I.E.P. ELOHIM \u2014 Colegio Cristoc\xE9ntrico"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-2xs)",
        color: "var(--text-muted)"
      }
    }, "Satipo, Jun\xEDn \xB7 RUC 20601234567"))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px dashed var(--border-strong)",
        paddingTop: 10,
        display: "flex",
        justifyContent: "space-between",
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "RECIBO ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--text-strong)"
      }
    }, "R-2026-04313")), /*#__PURE__*/React.createElement("span", null, "03/07/2026 \xB7 10:24 a.m.")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, "Estudiante: ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--text-strong)"
      }
    }, "Mar\xEDa Quispe Roca"), " \xB7 3\xB0 B Primaria", /*#__PURE__*/React.createElement("br", null), "Apoderada: Juana Roca P\xE9rez"), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px dashed var(--border-strong)",
        paddingTop: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, items.map(it => /*#__PURE__*/React.createElement("div", {
      key: it.c,
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "var(--text-xs)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-body)"
      }
    }, it.c), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-strong)"
      }
    }, fmt(it.m))))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px dashed var(--border-strong)",
        paddingTop: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-muted)"
      }
    }, "M\xE9todo: ", metodo), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h3)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, "TOTAL ", fmt(total))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        fontSize: "var(--text-2xs)",
        color: "var(--text-subtle)"
      }
    }, "Cobr\xF3: Secretar\xEDa (L. Campos) \xB7 \xA1Gracias por su puntualidad!")));
  }

  /* ------------------------------ cobrar ------------------------------ */
  const CUOTAS = [{
    id: "jun",
    c: "Pensión Junio",
    vence: "30/06",
    m: 252.0,
    estado: "Vencido",
    mora: 5.0
  }, {
    id: "jul",
    c: "Pensión Julio",
    vence: "31/07",
    m: 252.0,
    estado: "Pendiente",
    mora: 0
  }, {
    id: "dan",
    c: "Taller de Danza · Julio",
    vence: "31/07",
    m: 60.0,
    estado: "Pendiente",
    mora: 0
  }];
  const OTROS = [{
    value: "",
    label: "Agregar concepto…"
  }, {
    value: "lib",
    label: "Libros 3° Primaria — S/ 120.00"
  }, {
    value: "uni",
    label: "Uniforme diario — S/ 85.00"
  }, {
    value: "buzo",
    label: "Buzo institucional — S/ 95.00"
  }];
  const OTROS_M = {
    lib: {
      c: "Libros 3° Primaria",
      m: 120
    },
    uni: {
      c: "Uniforme diario",
      m: 85
    },
    buzo: {
      c: "Buzo institucional",
      m: 95
    }
  };
  function Cobrar() {
    const [sel, setSel] = React.useState(["jun"]);
    const [extras, setExtras] = React.useState([]);
    const [metodo, setMetodo] = React.useState("efe");
    const [recibido, setRecibido] = React.useState("300");
    const [recibo, setRecibo] = React.useState(false);
    const items = [...CUOTAS.filter(q => sel.includes(q.id)).map(q => ({
      c: q.c + (q.mora ? " (+mora)" : ""),
      m: q.m + q.mora
    })), ...extras.map(e => OTROS_M[e])];
    const total = items.reduce((a, i) => a + i.m, 0);
    const vuelto = Math.max(0, parseFloat(recibido || 0) - total);
    const METODOS = {
      efe: "Efectivo",
      yape: "Yape / Plin",
      trans: "Transferencia",
      tarj: "Tarjeta"
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: 18,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar estudiante por nombre, c\xF3digo o DNI\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null),
      defaultValue: "Mar\xEDa Quispe"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Mar\xEDa Quispe Roca",
      color: "var(--blue-500)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, "Mar\xEDa Quispe Roca"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "E-1042 \xB7 3\xB0 B Primaria \xB7 Apoderada: Juana Roca P\xE9rez")), /*#__PURE__*/React.createElement(Badge, {
      tone: "danger",
      dot: true
    }, "Deuda S/ 257.00")), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Cuotas pendientes",
      subtitle: "Selecciona las que se cobrar\xE1n"
    }, /*#__PURE__*/React.createElement("div", null, CUOTAS.map(q => {
      const on = sel.includes(q.id);
      return /*#__PURE__*/React.createElement("label", {
        key: q.id,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 16px",
          borderTop: "1px solid var(--border-subtle)",
          cursor: "pointer",
          background: on ? "var(--surface-brand-soft)" : "transparent"
        }
      }, /*#__PURE__*/React.createElement(Checkbox, {
        checked: on,
        onChange: () => setSel(s => on ? s.filter(x => x !== q.id) : [...s, q.id])
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, q.c), /*#__PURE__*/React.createElement("div", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, "Vence ", q.vence, q.mora ? ` · mora ${fmt(q.mora)}` : "")), /*#__PURE__*/React.createElement(Badge, {
        tone: q.estado === "Vencido" ? "danger" : "warning",
        dot: true
      }, q.estado), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          fontFamily: "var(--font-mono)",
          color: "var(--text-strong)",
          minWidth: 82,
          textAlign: "right"
        }
      }, fmt(q.m + q.mora)));
    }))), /*#__PURE__*/React.createElement(Card, {
      title: "Otros conceptos",
      subtitle: "Libros, uniformes y ventas \u2014 descuentan stock del Almac\xE9n (Inventario)"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Select, {
      options: OTROS,
      value: "",
      onChange: e => {
        const v = e.target.value;
        if (v && !extras.includes(v)) setExtras(x => [...x, v]);
      }
    }), extras.map(e => /*#__PURE__*/React.createElement("div", {
      key: e,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: "var(--type-label)",
        color: "var(--text-body)"
      }
    }, OTROS_M[e].c), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, fmt(OTROS_M[e].m)), /*#__PURE__*/React.createElement(IconButton, {
      label: "Quitar",
      size: "sm",
      variant: "danger",
      onClick: () => setExtras(x => x.filter(y => y !== e))
    }, /*#__PURE__*/React.createElement(Ic.Trash, null))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "sticky",
        top: 0
      }
    }, /*#__PURE__*/React.createElement(Card, {
      title: "Resumen del cobro"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, items.length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Sin conceptos seleccionados."), items.map(it => /*#__PURE__*/React.createElement("div", {
      key: it.c,
      style: {
        display: "flex",
        justifyContent: "space-between",
        font: "var(--type-body)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, it.c), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, fmt(it.m)))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600
      }
    }, "Total"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h2)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, fmt(total))))), /*#__PURE__*/React.createElement(Card, {
      title: "M\xE9todo de pago"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(RadioGroup, {
      name: "metodo",
      value: metodo,
      onChange: e => setMetodo(e.target.value)
    }, /*#__PURE__*/React.createElement(Radio, {
      value: "efe",
      label: "Efectivo"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "yape",
      label: "Yape / Plin"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "trans",
      label: "Transferencia"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "tarj",
      label: "Tarjeta"
    })), metodo === "efe" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Recibido",
      prefix: "S/.",
      value: recibido,
      onChange: e => setRecibido(e.target.value.replace(/[^0-9.]/g, "")),
      inputMode: "decimal"
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 6
      }
    }, "Vuelto"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 38,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-mono)",
        color: vuelto > 0 ? "var(--success)" : "var(--text-muted)",
        fontWeight: 600
      }
    }, fmt(vuelto)))), (metodo === "yape" || metodo === "trans") && /*#__PURE__*/React.createElement(Input, {
      label: "N\xB0 de operaci\xF3n",
      placeholder: "Ej. 90412238"
    }))), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "lg",
      block: true,
      iconLeft: /*#__PURE__*/React.createElement(Ic.Receipt, null),
      disabled: total === 0,
      onClick: () => {
        setRecibo(true);
        notify("success", "Pago registrado", `R-2026-04313 · ${fmt(total)} · ${METODOS[metodo]}.`);
      }
    }, "Cobrar ", fmt(total), " y emitir recibo")), /*#__PURE__*/React.createElement(ReceiptDialog, {
      open: recibo,
      onClose: () => setRecibo(false),
      items: items,
      total: total,
      metodo: METODOS[metodo]
    }));
  }

  /* ------------------------------ caja del día ------------------------------ */
  const MOVS = [["R-2026-04312", "10:02", "José Ramos Lía", "Pensión Junio", "Yape / Plin", "280.00", "L. Campos"], ["R-2026-04311", "09:47", "Carla Núñez Ríos", "Matrícula 2026 + libros", "Efectivo", "370.00", "L. Campos"], ["R-2026-04310", "09:31", "Hugo Vela Soto", "Pensión Abril + Mayo (+mora)", "Efectivo", "570.00", "L. Campos"], ["R-2026-04309", "08:55", "Rosa Lima Vega", "Pensión Junio (Beca 50%)", "Transferencia", "140.00", "D. Pérez"], ["R-2026-04308", "08:12", "Ana Flores Mendoza", "Uniforme diario", "Efectivo", "85.00", "L. Campos"]];
  function CierreDialog({
    open,
    onClose
  }) {
    const esperado = 1225.0; // inicial 200 + efectivo del día 1025
    const [contado, setContado] = React.useState("1225.00");
    const dif = parseFloat(contado || 0) - esperado;
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      title: "Cerrar caja \xB7 Arqueo",
      description: "03/07/2026 \xB7 Turno ma\xF1ana \xB7 Abierta por L. Campos a las 7:45",
      icon: /*#__PURE__*/React.createElement(Ic.Lock, null),
      iconTone: "warning",
      size: "md",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Lock, null),
        onClick: () => {
          onClose();
          notify("success", "Caja cerrada", "Arqueo registrado · S/ 1,445 cobrados · 5 operaciones.");
        }
      }, "Cerrar caja"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, [["Monto inicial", "S/ 200.00"], ["Cobros en efectivo", "S/ 1,025.00"], ["Cobros digitales", "S/ 420.00"], ["Efectivo esperado", fmt(esperado)]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-h3)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, v)))), /*#__PURE__*/React.createElement(Input, {
      label: "Efectivo contado",
      prefix: "S/.",
      value: contado,
      onChange: e => setContado(e.target.value.replace(/[^0-9.]/g, "")),
      inputMode: "decimal"
    }), Math.abs(dif) < 0.005 ? /*#__PURE__*/React.createElement(Alert, {
      tone: "success",
      title: "Arqueo cuadrado"
    }, "El efectivo contado coincide con el esperado.") : /*#__PURE__*/React.createElement(Alert, {
      tone: dif < 0 ? "danger" : "warning",
      title: dif < 0 ? `Faltante de ${fmt(Math.abs(dif))}` : `Sobrante de ${fmt(dif)}`
    }, "La diferencia quedar\xE1 registrada en el cierre con tu observaci\xF3n."), /*#__PURE__*/React.createElement(Textarea, {
      label: "Observaciones",
      rows: 2,
      placeholder: "Opcional\u2026"
    })));
  }
  function CajaDia() {
    const [cierre, setCierre] = React.useState(false);
    const [anular, setAnular] = React.useState(null);
    const cols = [{
      key: "rec",
      header: "Recibo",
      mono: true,
      width: 130
    }, {
      key: "hora",
      header: "Hora",
      mono: true,
      align: "center",
      width: 70
    }, {
      key: "est",
      header: "Estudiante",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "concepto",
      header: "Concepto"
    }, {
      key: "met",
      header: "Método",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Efectivo" ? "success" : v === "Yape / Plin" ? "brand" : "info"
      }, v)
    }, {
      key: "monto",
      header: "Monto",
      num: true,
      mono: true,
      render: v => `S/ ${v}`
    }, {
      key: "cobrador",
      header: "Cobró",
      render: v => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 7
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "xs"
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-caption)"
        }
      }, v))
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver recibo"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Recibo",
        size: "sm",
        onClick: () => notify("info", "Recibo", `${r.rec} · ${r.est} · S/ ${r.monto} — abierto para reimpresión.`)
      }, /*#__PURE__*/React.createElement(Ic.Receipt, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Anular"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Anular",
        size: "sm",
        variant: "danger",
        onClick: () => setAnular(r)
      }, /*#__PURE__*/React.createElement(Ic.Trash, null))))
    }];
    const rows = MOVS.map(m => ({
      rec: m[0],
      hora: m[1],
      est: m[2],
      concepto: m[3],
      met: m[4],
      monto: m[5],
      cobrador: m[6]
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 44,
        height: 44,
        borderRadius: "var(--radius-md)",
        background: "var(--success-soft)",
        color: "var(--success)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 21
      }
    }, /*#__PURE__*/React.createElement(Ic.Cash, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h3)",
        color: "var(--text-strong)"
      }
    }, "Caja \xB7 03/07/2026"), /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      dot: true
    }, "Abierta")), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Abierta a las 7:45 a.m. por L. Campos (Secretar\xEDa) \xB7 Monto inicial S/ 200.00")), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Lock, null),
      onClick: () => setCierre(true)
    }, "Cerrar caja"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Cobrado hoy",
      value: "S/ 1,445",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      caption: "5 operaciones"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Efectivo",
      value: "S/ 1,025",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      caption: "3 operaciones"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Digital",
      value: "S/ 420",
      iconTone: "brand",
      icon: /*#__PURE__*/React.createElement(Ic.Phone, null),
      caption: "Yape/Plin \xB7 transferencias"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Anulados",
      value: "0",
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Trash, null),
      caption: "hoy"
    })), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Movimientos del d\xEDa"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true,
      zebra: true
    })), /*#__PURE__*/React.createElement(CierreDialog, {
      open: cierre,
      onClose: () => setCierre(false)
    }), /*#__PURE__*/React.createElement(Dialog, {
      open: !!anular,
      onClose: () => setAnular(null),
      title: "Anular recibo",
      icon: /*#__PURE__*/React.createElement(Ic.Trash, null),
      iconTone: "danger",
      description: anular ? `${anular.rec} · ${anular.est} · S/ ${anular.monto}` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setAnular(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Trash, null),
        onClick: () => {
          notify("warning", "Recibo anulado", `${anular.rec} anulado — la cuota vuelve a estado Pendiente.`);
          setAnular(null);
        }
      }, "Anular recibo"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "Esta acci\xF3n queda registrada"
    }, "El recibo se marca como anulado (no se borra) y la cuota vuelve a Pendiente. Requiere motivo."), /*#__PURE__*/React.createElement(Textarea, {
      label: "Motivo de anulaci\xF3n",
      rows: 2,
      placeholder: "Ej. monto err\xF3neo, duplicado\u2026",
      required: true
    }))));
  }

  /* ------------------------------ Devoluciones ------------------------------ */
  function Devoluciones() {
    const fmtS = n => `S/ ${Number(n).toFixed(2)}`;
    const [rows, setRows] = React.useState([{
      id: "D-0013",
      est: "José Ramos Lía",
      rec: "R-2026-04298",
      motivo: "Pago duplicado de pensión Junio",
      monto: 280,
      estado: "Pendiente de aprobación",
      just: null
    }, {
      id: "D-0012",
      est: "Diego Ñahui Cruz",
      rec: "R-2026-04102",
      motivo: "Retiro con matrícula pagada (prorrateo)",
      monto: 100,
      estado: "Aprobada",
      just: null
    }, {
      id: "D-0011",
      est: "Rosa Lima Vega",
      rec: "R-2026-03987",
      motivo: "Cobro en exceso por error de digitación",
      monto: 40,
      estado: "Devuelta",
      just: null
    }]);
    const [nueva, setNueva] = React.useState(false);
    const [rechazo, setRechazo] = React.useState(null);
    const [justif, setJustif] = React.useState("");
    const setEstado = (id, estado, extra) => setRows(rs => rs.map(x => x.id === id ? {
      ...x,
      estado,
      ...extra
    } : x));
    const tone = e => e === "Devuelta" ? "success" : e === "Aprobada" ? "info" : e === "Rechazada" ? "neutral" : "warning";
    const cols = [{
      key: "id",
      header: "N°",
      mono: true,
      width: 76
    }, {
      key: "est",
      header: "Estudiante / recibo",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)"
        }
      }, r.rec))
    }, {
      key: "motivo",
      header: "Motivo",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", null, v), r.just && /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--warning-soft-fg)"
        }
      }, "Rechazo: \u201C", r.just, "\u201D"))
    }, {
      key: "monto",
      header: "Monto",
      num: true,
      mono: true,
      render: v => fmtS(v)
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: tone(v),
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => r.estado === "Pendiente de aprobación" ? /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "ghost",
        onClick: () => {
          setRechazo(r);
          setJustif("");
        }
      }, "Rechazar"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setEstado(r.id, "Aprobada");
          notify("success", "Devolución aprobada", `${r.id} · ${fmtS(r.monto)} — Caja ya puede devolver el dinero.`);
        }
      }, "Aprobar")) : r.estado === "Aprobada" ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "accent",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Cash, null),
        onClick: () => {
          setEstado(r.id, "Devuelta");
          notify("success", "Devolución registrada", `${fmtS(r.monto)} entregados · egreso en la caja del día · comprobante generado.`);
        }
      }, "Registrar devoluci\xF3n") : r.estado === "Devuelta" ? /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver comprobante"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Comprobante",
        size: "sm",
        onClick: () => notify("info", "Comprobante", `${r.id} · ${fmtS(r.monto)} · firmado por el apoderado.`)
      }, /*#__PURE__*/React.createElement(Ic.Receipt, null))) : null
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Flujo de devoluci\xF3n"
    }, "Secretar\xEDa registra la solicitud \u2192 el ", /*#__PURE__*/React.createElement("b", null, "Administrador aprueba"), " (o rechaza con justificaci\xF3n) \u2192 reci\xE9n entonces Caja entrega el dinero y se genera el egreso del d\xEDa. Nada se borra: todo queda en el historial."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNueva(true)
    }, "Nueva solicitud")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: nueva,
      onClose: () => setNueva(false),
      size: "lg",
      title: "Solicitud de devoluci\xF3n",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      description: "Debe estar vinculada a un recibo emitido",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNueva(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setNueva(false);
          notify("success", "Solicitud registrada", "Quedará pendiente de aprobación del Administrador.");
        }
      }, "Registrar solicitud"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Recibo",
      required: true,
      placeholder: "R-2026-____",
      containerStyle: {
        gridColumn: "1 / -1"
      },
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null),
      hint: "Busca por n\xFAmero o estudiante"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Monto a devolver",
      prefix: "S/.",
      required: true,
      inputMode: "decimal",
      placeholder: "0.00",
      hint: "Total o parcial del recibo"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Forma de devoluci\xF3n",
      options: ["Efectivo en caja", "Transferencia", "Crédito a cuota futura"],
      defaultValue: "Efectivo en caja"
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "Motivo",
      rows: 2,
      required: true,
      placeholder: "Obligatorio \u2014 ej. pago duplicado\u2026",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!rechazo,
      onClose: () => setRechazo(null),
      title: "Rechazar solicitud",
      icon: /*#__PURE__*/React.createElement(Ic.Trash, null),
      iconTone: "warning",
      description: rechazo ? `${rechazo.id} · ${rechazo.est} · ${fmtS(rechazo.monto)}` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setRechazo(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        disabled: justif.trim().length < 10,
        onClick: () => {
          setEstado(rechazo.id, "Rechazada", {
            just: justif.trim()
          });
          notify("warning", "Solicitud rechazada", `${rechazo.id} — queda registrada con tu justificación.`);
          setRechazo(null);
        }
      }, "Rechazar con justificaci\xF3n"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      label: "Justificaci\xF3n",
      rows: 2,
      required: true,
      value: justif,
      onChange: e => setJustif(e.target.value),
      placeholder: "M\xEDnimo 10 caracteres",
      hint: justif.trim().length < 10 ? `${Math.max(0, 10 - justif.trim().length)} caracteres más` : "Listo"
    }))));
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_Cashier = function Cashier() {
    const [tab, setTab] = React.useState("cobrar");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "cobrar",
        label: "Cobrar"
      }, {
        id: "dia",
        label: "Caja del día",
        count: 5
      }, {
        id: "dev",
        label: "Devoluciones",
        count: 1
      }]
    }), tab === "cobrar" && /*#__PURE__*/React.createElement(Cobrar, null), tab === "dia" && /*#__PURE__*/React.createElement(CajaDia, null), tab === "dev" && /*#__PURE__*/React.createElement(Devoluciones, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/CashierScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/ConductScreen.jsx
try { (() => {
/* Elohim SGE — Conducta e incidencias. Registers window.SGE_Conduct.
   Registran: tutor y auxiliar del aula + administración. Gravedad Leve/Moderada/Grave;
   grave notifica al apoderado y programa citación. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Textarea,
    Dialog,
    Alert,
    Tooltip,
    StatCard
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const GRAV = {
    Leve: "info",
    Moderada: "warning",
    Grave: "danger"
  };
  const INIT = [{
    id: "I-0032",
    fecha: "07/07",
    est: "Hugo Vela Soto",
    ubic: "6° A Primaria",
    tipo: "Agresión verbal a compañero",
    grav: "Grave",
    por: "L. Díaz (tutora)",
    estado: "Citación programada",
    medida: "Citación al apoderado · 10/07 8:00",
    color: "var(--blue-600)"
  }, {
    id: "I-0031",
    fecha: "06/07",
    est: "José Ramos Lía",
    ubic: "5° B Primaria",
    tipo: "No presenta tareas (3ª vez)",
    grav: "Moderada",
    por: "P. Gómez (tutor)",
    estado: "Apoderado notificado",
    medida: "Compromiso de acompañamiento en casa",
    color: "var(--gold-500)"
  }, {
    id: "I-0030",
    fecha: "03/07",
    est: "Luis Paz Cárdenas",
    ubic: "4° A Primaria",
    tipo: "Tardanza reiterada al aula",
    grav: "Leve",
    por: "M. Quispe (auxiliar)",
    estado: "Registrada",
    medida: "Llamada de atención verbal",
    color: "var(--brown-400)"
  }, {
    id: "I-0029",
    fecha: "01/07",
    est: "Diego Ñahui Cruz",
    ubic: "3° A Secundaria",
    tipo: "Uso de celular en examen",
    grav: "Grave",
    por: "Dirección",
    estado: "Cerrada",
    medida: "Suspensión 1 día + citación (realizada)",
    color: "var(--neutral-500)"
  }];
  window.SGE_Conduct = function Conduct() {
    const [rows, setRows] = React.useState(INIT);
    const [nueva, setNueva] = React.useState(false);
    const [grav, setGrav] = React.useState("Leve");
    const [ver, setVer] = React.useState(null);
    const cerrar = id => {
      setRows(rs => rs.map(x => x.id === id ? {
        ...x,
        estado: "Cerrada"
      } : x));
      notify("success", "Incidencia cerrada", `${id} — queda en el historial del estudiante.`);
    };
    const cols = [{
      key: "id",
      header: "N°",
      mono: true,
      width: 70
    }, {
      key: "fecha",
      header: "Fecha",
      mono: true,
      align: "center",
      width: 64
    }, {
      key: "est",
      header: "Estudiante",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.ubic)))
    }, {
      key: "tipo",
      header: "Incidencia",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", null, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, "Registr\xF3: ", r.por))
    }, {
      key: "grav",
      header: "Gravedad",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: GRAV[v],
        dot: true
      }, v)
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Cerrada" ? "neutral" : v === "Citación programada" ? "danger" : v === "Apoderado notificado" ? "warning" : "info"
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver detalle y medida"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => setVer(r)
      }, /*#__PURE__*/React.createElement(Ic.Eye, null))), r.estado !== "Cerrada" && /*#__PURE__*/React.createElement(Tooltip, {
        content: "Cerrar incidencia"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Cerrar",
        size: "sm",
        onClick: () => cerrar(r.id)
      }, /*#__PURE__*/React.createElement(Ic.Check, null))))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Incidencias \xB7 Julio",
      value: "4",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      caption: "en toda la instituci\xF3n"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Graves",
      value: "2",
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Bell, null),
      caption: "con citaci\xF3n al apoderado"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Abiertas",
      value: "3",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Clock, null),
      caption: "pendientes de cierre"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Citaciones esta semana",
      value: "1",
      icon: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      caption: "viernes 10/07 \xB7 8:00"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 200
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por estudiante o tipo\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Gravedad",
      options: ["Leve", "Moderada", "Grave"],
      containerStyle: {
        width: 130
      }
    }), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Estado",
      options: ["Registrada", "Apoderado notificado", "Citación programada", "Cerrada"],
      containerStyle: {
        width: 180
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => {
        setGrav("Leve");
        setNueva(true);
      }
    }, "Registrar incidencia")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true,
      zebra: true
    })), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Qui\xE9n registra y qui\xE9n se entera"
    }, "Registran el ", /*#__PURE__*/React.createElement("b", null, "tutor"), " y el ", /*#__PURE__*/React.createElement("b", null, "auxiliar"), " del aula, adem\xE1s de administraci\xF3n. Las ", /*#__PURE__*/React.createElement("b", null, "moderadas"), " notifican al apoderado por WhatsApp; las ", /*#__PURE__*/React.createElement("b", null, "graves"), " adem\xE1s programan una citaci\xF3n presencial. Todo queda en el historial de conducta del estudiante y lo ve el tutor en su portal."), /*#__PURE__*/React.createElement(Dialog, {
      open: nueva,
      onClose: () => setNueva(false),
      size: "lg",
      title: "Registrar incidencia",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNueva(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setNueva(false);
          notify(grav === "Leve" ? "success" : "warning", "Incidencia registrada", grav === "Grave" ? "Se notificó al apoderado y quedó propuesta la citación." : grav === "Moderada" ? "El apoderado fue notificado por WhatsApp." : "Registrada en el historial del estudiante.");
        }
      }, "Registrar"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Estudiante",
      required: true,
      placeholder: "Buscar por nombre o c\xF3digo\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null),
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Gravedad",
      options: ["Leve", "Moderada", "Grave"],
      value: grav,
      onChange: e => setGrav(e.target.value),
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha y hora",
      type: "datetime-local",
      defaultValue: "2026-07-08T09:30"
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "Descripci\xF3n de los hechos",
      rows: 3,
      required: true,
      placeholder: "Qu\xE9 ocurri\xF3, d\xF3nde, testigos\u2026",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Medida aplicada",
      placeholder: "Ej. llamada de atenci\xF3n, compromiso\u2026",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), grav !== "Leve" && /*#__PURE__*/React.createElement(Alert, {
      tone: grav === "Grave" ? "danger" : "warning",
      title: grav === "Grave" ? "Se notificará y citará al apoderado" : "Se notificará al apoderado",
      style: {
        gridColumn: "1 / -1"
      }
    }, grav === "Grave" ? "Aviso inmediato por WhatsApp + propuesta de citación presencial (elige fecha al registrar)." : "Aviso por WhatsApp con el detalle de la incidencia."), grav === "Grave" && /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de citaci\xF3n",
      type: "datetime-local",
      defaultValue: "2026-07-10T08:00",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!ver,
      onClose: () => setVer(null),
      title: ver ? `${ver.id} · ${ver.tipo}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      description: ver ? `${ver.est} · ${ver.ubic} · ${ver.fecha}` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, ver && ver.grav !== "Leve" && /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Send, null),
        onClick: () => notify("success", "Reenviado", "El apoderado recibió nuevamente el aviso.")
      }, "Reenviar aviso"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        onClick: () => setVer(null)
      }, "Cerrar"))
    }, ver && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: GRAV[ver.grav],
      dot: true
    }, ver.grav), /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral"
    }, ver.estado)), [["Registrado por", ver.por], ["Medida", ver.medida]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body)"
      }
    }, v))))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/ConductScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/DashboardScreen.jsx
try { (() => {
/* Elohim SGE — Dashboard. Registers window.SGE_Dashboard. */
(function () {
  const {
    StatCard,
    Card,
    Table,
    Badge,
    ProgressBar,
    Avatar,
    Button,
    Tag
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);
  const payCols = [{
    key: "est",
    header: "Estudiante",
    render: (v, r) => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: v,
      size: "sm",
      color: r.color
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, v), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-muted)"
      }
    }, r.grado)))
  }, {
    key: "concepto",
    header: "Concepto"
  }, {
    key: "fecha",
    header: "Fecha",
    mono: true,
    align: "center"
  }, {
    key: "monto",
    header: "Monto",
    num: true,
    mono: true,
    render: v => `S/ ${v}`
  }, {
    key: "estado",
    header: "Estado",
    align: "center",
    render: v => /*#__PURE__*/React.createElement(Badge, {
      tone: v === "Pagado" ? "success" : v === "Pendiente" ? "warning" : "danger",
      dot: true
    }, v)
  }];
  const payRows = [{
    est: "María Quispe Roca",
    grado: "3° Primaria",
    concepto: "Pensión Junio",
    fecha: "28/06",
    monto: "280.00",
    estado: "Pagado",
    color: "var(--blue-500)"
  }, {
    est: "José Ramos Lía",
    grado: "5° Primaria",
    concepto: "Pensión Junio",
    fecha: "27/06",
    monto: "280.00",
    estado: "Pendiente",
    color: "var(--gold-500)"
  }, {
    est: "Ana Flores Mendoza",
    grado: "1° Secundaria",
    concepto: "Pensión Mayo",
    fecha: "15/05",
    monto: "310.00",
    estado: "Vencido",
    color: "var(--green-500)"
  }, {
    est: "Luis Paz Cárdenas",
    grado: "4° Primaria",
    concepto: "Matrícula 2026",
    fecha: "26/06",
    monto: "150.00",
    estado: "Pagado",
    color: "var(--brown-400)"
  }];
  const grados = [{
    g: "Inicial",
    val: 96
  }, {
    g: "1° Prim",
    val: 88
  }, {
    g: "2° Prim",
    val: 92
  }, {
    g: "3° Prim",
    val: 85
  }, {
    g: "4° Prim",
    val: 79
  }, {
    g: "5° Prim",
    val: 90
  }];
  const DEUDORES = [{
    fam: "Fam. Vela Soto",
    det: "2 cuotas · Hugo (6° A)",
    monto: 560,
    color: "var(--blue-400)"
  }, {
    fam: "Fam. Flores Mendoza",
    det: "2 cuotas · Ana (1° Sec)",
    monto: 620,
    color: "var(--green-500)"
  }, {
    fam: "Fam. Ramos Lía",
    det: "1 cuota · José (5° B)",
    monto: 280,
    color: "var(--gold-500)"
  }, {
    fam: "Fam. Ñahui Cruz",
    det: "3 cuotas · Diego (3° Sec)",
    monto: 930,
    color: "var(--brown-400)"
  }];
  const EGRESOS = [{
    c: "Planilla · Julio",
    d: "Vence 05/07 · 21 empleados",
    m: "S/ 25,174",
    urg: true
  }, {
    c: "Servicios (luz, agua, internet)",
    d: "Vence 10/07",
    m: "S/ 1,180",
    urg: false
  }, {
    c: "Editorial · libros 2° lote",
    d: "Vence 15/07",
    m: "S/ 4,600",
    urg: false
  }];
  window.SGE_Dashboard = function Dashboard() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Estudiantes",
      value: "482",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      delta: 4.2,
      caption: "vs. 2025"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Cobrado \xB7 Junio",
      value: "S/ 84,320",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      delta: 6.1,
      caption: "del mes"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Morosidad",
      value: "12.4%",
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Chart, null),
      delta: 1.3,
      deltaDirection: "up",
      caption: "60 cuotas"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Asistencia hoy",
      value: "93.8%",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      delta: 0.7,
      caption: "452 presentes"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 20,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Pagos recientes",
      subtitle: "\xDAltimos movimientos de pensiones y matr\xEDculas",
      actions: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        iconRight: /*#__PURE__*/React.createElement(Ic.ChevronRight, null),
        onClick: () => goTo("pagos")
      }, "Ver todos")
    }, /*#__PURE__*/React.createElement(Table, {
      columns: payCols,
      data: payRows,
      hover: true
    })), /*#__PURE__*/React.createElement(Card, {
      title: "Cobranza de Junio",
      subtitle: "Meta mensual S/ 96,000"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h1)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, "S/ 84,320"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        color: "var(--success)"
      }
    }, "87.8%")), /*#__PURE__*/React.createElement(ProgressBar, {
      value: 87.8,
      tone: "success"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow"
    }, "Asistencia por nivel"), grados.map(x => /*#__PURE__*/React.createElement(ProgressBar, {
      key: x.g,
      label: x.g,
      value: x.val,
      showValue: true,
      size: "sm",
      tone: x.val >= 90 ? "success" : x.val >= 82 ? "brand" : "warning"
    })))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Pr\xF3ximos egresos",
      subtitle: "Lo que el colegio debe pagar pronto",
      actions: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        iconRight: /*#__PURE__*/React.createElement(Ic.ChevronRight, null),
        onClick: () => goTo("docentes")
      }, "Ver planilla")
    }, /*#__PURE__*/React.createElement("div", null, EGRESOS.map(e => /*#__PURE__*/React.createElement("div", {
      key: e.c,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 34,
        height: 34,
        borderRadius: "var(--radius-md)",
        background: e.urg ? "var(--warning-soft)" : "var(--surface-sunken)",
        color: e.urg ? "var(--warning)" : "var(--text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Ic.Clock, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, e.c), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-muted)"
      }
    }, e.d)), e.urg && /*#__PURE__*/React.createElement(Badge, {
      tone: "warning",
      dot: true
    }, "Pr\xF3ximo"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, e.m))))), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Principales deudores",
      subtitle: "Familias con cuotas vencidas \u2014 S/ 6,420 en total",
      actions: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "sm",
        iconRight: /*#__PURE__*/React.createElement(Ic.ChevronRight, null),
        onClick: () => goTo("pagos")
      }, "Ver morosidad")
    }, /*#__PURE__*/React.createElement("div", null, DEUDORES.map(d => /*#__PURE__*/React.createElement("div", {
      key: d.fam,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 18px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: d.fam.replace("Fam. ", ""),
      size: "sm",
      color: d.color
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, d.fam), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-muted)"
      }
    }, d.det)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        color: "var(--danger)"
      }
    }, "S/ ", d.monto.toFixed(2)), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => notify("success", "Recordatorio enviado", `${d.fam} · WhatsApp y correo al apoderado principal.`)
    }, "Recordar")))))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/EnrollmentScreen.jsx
try { (() => {
/* Elohim SGE — Matrícula. Registers window.SGE_Enrollment.
   Listado del proceso + asistente de 5 pasos que termina generando el cronograma de pagos. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Tabs,
    ProgressBar,
    Alert,
    Tooltip,
    Checkbox,
    Radio,
    RadioGroup,
    StatCard,
    Tag,
    Pagination,
    Dialog
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);

  /* ------------------------------ list view ------------------------------ */
  const RECENT = [["M-2026-0482", "Carla Núñez Ríos", "Inicial · 4 años · Los Girasoles", "Nueva", "28/06", "Pendiente de pago", "var(--gold-500)"], ["M-2026-0481", "José Ramos Lía", "5° B Primaria", "Ratificada", "27/06", "Completa", "var(--blue-500)"], ["M-2026-0480", "Piero Salas Cruz", "2° A Secundaria", "Traslado", "27/06", "Observada", "var(--green-500)"], ["M-2026-0479", "Rosa Lima Vega", "2° B Primaria", "Ratificada", "26/06", "Completa", "var(--brown-400)"], ["M-2026-0478", "Hugo Vela Soto", "6° A Primaria", "Ratificada", "26/06", "Completa", "var(--blue-400)"]];
  function EnrollList({
    onNew
  }) {
    const [ver, setVer] = React.useState(null);
    const cols = [{
      key: "cod",
      header: "N° Matrícula",
      mono: true,
      width: 130
    }, {
      key: "est",
      header: "Estudiante",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.ubic)))
    }, {
      key: "tipo",
      header: "Tipo",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Nueva" ? "brand" : v === "Ratificada" ? "success" : "accent"
      }, v)
    }, {
      key: "fecha",
      header: "Fecha",
      mono: true,
      align: "center"
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Completa" ? "success" : v === "Pendiente de pago" ? "warning" : "danger",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver ficha"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => setVer(r)
      }, /*#__PURE__*/React.createElement(Ic.Eye, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Imprimir ficha"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Imprimir",
        size: "sm",
        onClick: () => notify("info", "Imprimiendo", `Ficha única de matrícula ${r.cod} enviada a la impresora.`)
      }, /*#__PURE__*/React.createElement(Ic.Download, null))))
    }];
    const rows = RECENT.map(r => ({
      cod: r[0],
      est: r[1],
      ubic: r[2],
      tipo: r[3],
      fecha: r[4],
      estado: r[5],
      color: r[6]
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Matriculados 2026",
      value: "482",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      caption: "de 556 vacantes"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Nuevos",
      value: "96",
      iconTone: "brand",
      icon: /*#__PURE__*/React.createElement(Ic.Plus, null),
      caption: "ingresantes 2026"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Ratificaciones",
      value: "371",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Check, null),
      caption: "+ 15 traslados"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Vacantes libres",
      value: "74",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      caption: "3 secciones llenas"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 220
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por estudiante, N\xB0 de matr\xEDcula o DNI\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Tipo",
      options: ["Nueva", "Ratificada", "Traslado"],
      containerStyle: {
        width: 140
      }
    }), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Nivel",
      options: ["Inicial", "Primaria", "Secundaria"],
      containerStyle: {
        width: 150
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: onNew
    }, "Nueva matr\xEDcula")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true,
      zebra: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(Pagination, {
      page: 1,
      pageCount: 25,
      onPageChange: () => {},
      total: 482,
      pageSize: 20
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!ver,
      onClose: () => setVer(null),
      size: "lg",
      title: ver ? ver.est : "",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      description: ver ? `${ver.cod} · ${ver.ubic}` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
        onClick: () => notify("info", "Imprimiendo", `Ficha ${ver.cod} enviada a la impresora.`)
      }, "Imprimir ficha"), ver && ver.estado === "Pendiente de pago" ? /*#__PURE__*/React.createElement(Button, {
        variant: "accent",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Cash, null),
        onClick: () => {
          setVer(null);
          goTo("caja");
          notify("info", "Caja", `Cobro de matrícula de ${ver.est} preparado.`);
        }
      }, "Cobrar matr\xEDcula") : /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Eye, null),
        onClick: () => {
          setVer(null);
          goTo("est");
          notify("info", "Estudiantes", "Abriendo la ficha del estudiante.");
        }
      }, "Ver estudiante"))
    }, ver && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, [["Tipo", ver.tipo], ["Fecha", ver.fecha + "/2026"], ["Estado", ver.estado], ["Apoderado firmante", "Juana Roca Pérez"], ["Cronograma", "1 matrícula + 10 pensiones"], ["Registrado por", "L. Campos (Secretaría)"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body-md)",
        color: "var(--text-body)"
      }
    }, v))), ver.estado === "Observada" && /*#__PURE__*/React.createElement(Alert, {
      tone: "danger",
      title: "Observada",
      style: {
        gridColumn: "1 / -1"
      }
    }, "Falta el certificado de estudios del colegio de procedencia."))));
  }
  const STEPS = ["Estudiante", "Apoderados", "Ubicación", "Tarifa y cronograma", "Confirmación"];
  function Stepper({
    step
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "18px 22px",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, STEPS.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: s
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 28,
        height: 28,
        borderRadius: 99,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        font: "var(--type-label)",
        fontWeight: 600,
        fontSize: 16,
        background: i < step ? "var(--success)" : i === step ? "var(--brand)" : "var(--surface-sunken)",
        color: i <= step ? "#fff" : "var(--text-muted)",
        border: i === step ? "none" : "1px solid var(--border-subtle)"
      }
    }, i < step ? /*#__PURE__*/React.createElement(Ic.Check, null) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, i + 1)), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontWeight: i === step ? 600 : 400,
        color: i === step ? "var(--text-strong)" : "var(--text-muted)",
        whiteSpace: "nowrap"
      }
    }, s)), i < STEPS.length - 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: i < step ? "var(--success)" : "var(--border-subtle)",
        margin: "0 14px",
        minWidth: 18
      }
    }))));
  }
  function FieldPair({
    k,
    v,
    strong
  }) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: strong ? "var(--type-h3)" : "var(--type-body-md)",
        color: "var(--text-body)"
      }
    }, v));
  }

  /* Paso 1 — Estudiante */
  function StepStudent({
    tipo,
    setTipo
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(RadioGroup, {
      name: "tipoest",
      value: tipo,
      onChange: e => setTipo(e.target.value),
      row: true
    }, /*#__PURE__*/React.createElement(Radio, {
      value: "nuevo",
      label: "Estudiante nuevo",
      description: "Primera vez en la instituci\xF3n"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "exist",
      label: "Estudiante existente",
      description: "Ratificaci\xF3n o pre-matr\xEDcula 2026"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "traslado",
      label: "Traslado entrante",
      description: "Viene de otro colegio a mitad de a\xF1o"
    })), tipo === "traslado" && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Primero el SIAGIE"
    }, "El traslado se aprueba primero en el SIAGIE. Aqu\xED lo registras para el control interno: pensiones solo por los meses restantes y notas de origen del colegio anterior."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Apellido paterno",
      placeholder: "Torres",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Apellido materno",
      placeholder: "Inga",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Nombres",
      placeholder: "Bruno",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "DNI",
      placeholder: "00000000",
      required: true,
      hint: "8 d\xEDgitos"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Colegio de origen",
      placeholder: "I.E. 30001 Satipo",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "C\xF3digo de estudiante SIAGIE",
      placeholder: "00000000000000",
      required: true,
      hint: "14 d\xEDgitos"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de ingreso",
      type: "date",
      defaultValue: "2026-08-17",
      required: true,
      hint: "Define desde cu\xE1ndo se cobran pensiones"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Se incorpora en",
      options: ["Bimestre III (ago–oct)", "Bimestre II (may–jul)", "Bimestre IV (oct–dic)"],
      defaultValue: "Bimestre III (ago\u2013oct)",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "\xDAltima libreta tra\xEDda",
      options: ["Sí — con notas de Bim. I y II", "Aún no la entrega"],
      defaultValue: "S\xED \u2014 con notas de Bim. I y II",
      hint: "Se digitan como notas de origen"
    }))), tipo === "nuevo" ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Apellido paterno",
      placeholder: "N\xFA\xF1ez",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Apellido materno",
      placeholder: "R\xEDos",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Nombres",
      placeholder: "Carla",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "DNI",
      placeholder: "00000000",
      required: true,
      hint: "8 d\xEDgitos"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de nacimiento",
      type: "date",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Sexo",
      placeholder: "Seleccione",
      options: ["Femenino", "Masculino"],
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Direcci\xF3n",
      placeholder: "Jr. Los Cedros 245, Satipo",
      containerStyle: {
        gridColumn: "span 2"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Colegio de procedencia",
      placeholder: "Opcional",
      options: ["I.E. 30001 Satipo", "I.E.P. San Juan", "Otro…"]
    })) : tipo === "traslado" ? null : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por nombre, c\xF3digo o DNI\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null),
      defaultValue: "Mar\xEDa Quispe"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        border: "1.5px solid var(--border-brand)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-brand-soft)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Mar\xEDa Quispe Roca",
      color: "var(--blue-500)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, "Mar\xEDa Quispe Roca"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "E-1042 \xB7 DNI 70 481 559 \xB7 2025: 2\xB0 A Primaria \xB7 Promovida a 3\xB0")), /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      dot: true
    }, "Sin deuda"), /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "Pre-matr\xEDcula"))));
  }

  /* Paso 2 — Apoderados */
  function StepGuardians() {
    const [nuevo, setNuevo] = React.useState(false);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "Un estudiante puede tener varios apoderados, y un apoderado varios hijos matriculados. El ", /*#__PURE__*/React.createElement("b", null, "contacto principal"), " recibe las notificaciones de pago."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Juana Roca P\xE9rez",
      color: "var(--gold-500)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, "Juana Roca P\xE9rez"), /*#__PURE__*/React.createElement(Badge, {
      tone: "accent",
      size: "sm"
    }, "Contacto principal")), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Madre \xB7 DNI 41 220 876 \xB7 964 221 880 \xB7 2 hijos en la instituci\xF3n")), /*#__PURE__*/React.createElement(Tooltip, {
      content: "Editar"
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Editar",
      size: "sm",
      onClick: () => notify("info", "Editar apoderado", "Los datos del apoderado se editan en su módulo; aquí solo la relación.")
    }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), /*#__PURE__*/React.createElement(Tooltip, {
      content: "Quitar"
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Quitar",
      size: "sm",
      variant: "danger",
      onClick: () => notify("warning", "Apoderado desvinculado", "Juana Roca Pérez ya no está vinculada a esta matrícula.")
    }, /*#__PURE__*/React.createElement(Ic.Trash, null)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr auto",
        gap: 12,
        alignItems: "flex-end",
        padding: "14px 16px",
        border: "1px dashed var(--border-default)",
        borderRadius: "var(--radius-lg)"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Vincular apoderado existente",
      placeholder: "Buscar por DNI o nombre\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Relaci\xF3n",
      placeholder: "Seleccione",
      options: ["Madre", "Padre", "Abuelo/a", "Tío/a", "Tutor legal"]
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => notify("success", "Apoderado vinculado", "Óscar Ramos Díaz (Padre) vinculado a la matrícula.")
    }, "Vincular")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      style: {
        alignSelf: "flex-start"
      },
      onClick: () => setNuevo(true)
    }, "Registrar apoderado nuevo"), /*#__PURE__*/React.createElement(Dialog, {
      open: nuevo,
      onClose: () => setNuevo(false),
      title: "Registrar apoderado nuevo",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      description: "Quedar\xE1 vinculado a esta matr\xEDcula",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNuevo(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setNuevo(false);
          notify("success", "Apoderado registrado", "Vinculado a la matrícula como contacto secundario.");
        }
      }, "Registrar y vincular"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombres y apellidos",
      required: true,
      placeholder: "Ej. \xD3scar Ramos D\xEDaz",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "DNI",
      required: true,
      placeholder: "00000000"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Relaci\xF3n",
      options: ["Madre", "Padre", "Abuelo/a", "Tío/a", "Tutor legal"],
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Tel\xE9fono (WhatsApp)",
      required: true,
      placeholder: "9__ ___ ___"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Correo",
      type: "email",
      placeholder: "opcional"
    }))));
  }

  /* Paso 3 — Ubicación */
  function StepPlacement({
    seccion,
    setSeccion
  }) {
    const SECC = [{
      id: "A",
      tutor: "Pedro Gómez",
      turno: "Mañana",
      mat: 30,
      cap: 30
    }, {
      id: "B",
      tutor: "Lucía Díaz",
      turno: "Mañana",
      mat: 22,
      cap: 30
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Nivel",
      options: ["Inicial", "Primaria", "Secundaria"],
      defaultValue: "Primaria"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Grado",
      options: ["1°", "2°", "3°", "4°", "5°", "6°"],
      defaultValue: "3\xB0"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "A\xF1o acad\xE9mico",
      options: ["2026"],
      defaultValue: "2026",
      disabled: true
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Secci\xF3n ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--danger)"
      }
    }, "*")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, SECC.map(s => {
      const full = s.mat >= s.cap;
      const sel = seccion === s.id;
      return /*#__PURE__*/React.createElement("div", {
        key: s.id,
        onClick: () => !full && setSeccion(s.id),
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "14px 16px",
          borderRadius: "var(--radius-lg)",
          cursor: full ? "not-allowed" : "pointer",
          border: sel ? "1.5px solid var(--border-brand)" : "1px solid var(--border-default)",
          background: sel ? "var(--surface-brand-soft)" : "var(--surface-card)",
          opacity: full ? 0.55 : 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-h3)",
          color: "var(--text-strong)"
        }
      }, "Secci\xF3n ", s.id), /*#__PURE__*/React.createElement(Badge, {
        tone: "info"
      }, s.turno), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }), full ? /*#__PURE__*/React.createElement(Badge, {
        tone: "danger",
        dot: true
      }, "Llena") : sel ? /*#__PURE__*/React.createElement(Badge, {
        tone: "brand",
        dot: true
      }, "Seleccionada") : /*#__PURE__*/React.createElement(Badge, {
        tone: "success",
        dot: true
      }, s.cap - s.mat, " vacantes")), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          font: "var(--type-caption)",
          color: "var(--text-muted)"
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: s.tutor,
        size: "xs"
      }), " Tutor: ", s.tutor), /*#__PURE__*/React.createElement(ProgressBar, {
        value: s.mat,
        max: s.cap,
        size: "sm",
        tone: full ? "danger" : "brand",
        showValue: true,
        valueFormat: (v, m) => `${v}/${m}`
      }));
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Programas complementarios ", /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)",
        fontWeight: 400
      }
    }, "(opcional, con tarifa propia)")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: "Taller de Danza \u2014 S/ 60.00 /mes",
      description: "S\xE1bados 9:00\u201311:00 \xB7 4 vacantes",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Reforzamiento de Matem\xE1tica \u2014 S/ 80.00 /mes",
      description: "Lun y Mi\xE9 15:30\u201317:00"
    }))));
  }

  /* Paso 4 — Tarifa y cronograma */
  function StepFees({
    desc,
    setDesc,
    tipo
  }) {
    const traslado = tipo === "traslado";
    const cuotas = [];
    const MESES = traslado ? ["Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] : ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const base = 280,
      taller = 60;
    const factor = desc === "herm" ? 0.9 : desc === "beca50" ? 0.5 : 1;
    MESES.forEach((m, i) => cuotas.push({
      concepto: `Pensión ${m}`,
      vence: traslado ? `30/${String(i + 8).padStart(2, "0")}` : `${String(31 - i % 2).padStart(2, "0")}/${String(i + 3).padStart(2, "0")}`,
      monto: (base * factor + taller).toFixed(2)
    }));
    const cols = [{
      key: "concepto",
      header: "Concepto"
    }, {
      key: "vence",
      header: "Vence",
      mono: true,
      align: "center",
      width: 110
    }, {
      key: "monto",
      header: "Monto",
      num: true,
      mono: true,
      render: v => `S/ ${v}`
    }];
    const total = (250 + cuotas.reduce((a, c) => a + parseFloat(c.monto), 0)).toFixed(2);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1.3fr",
        gap: 18,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, traslado && /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "Cronograma de traslado \xB7 ingresa 17/08"
    }, "Solo se generan las pensiones de ", /*#__PURE__*/React.createElement("b", null, "Agosto a Diciembre"), " (5 cuotas). Agosto se cobra completo porque el ingreso (17/08) es antes del d\xEDa de corte (", /*#__PURE__*/React.createElement("b", null, "d\xEDa 20"), " \u2014 configurable en Tarifario y becas). La matr\xEDcula se cobra completa."), /*#__PURE__*/React.createElement(Card, {
      title: traslado ? "Tarifa · Primaria 2026 (traslado)" : "Tarifa · Primaria 2026"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, [["Matrícula (pago único)", "S/ 250.00"], [`Pensión mensual (×${MESES.length})`, "S/ 280.00"], [`Taller de Danza (×${MESES.length})`, "S/ 60.00"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "flex",
        justifyContent: "space-between",
        font: "var(--type-body)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)"
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        color: "var(--text-strong)"
      }
    }, v))))), /*#__PURE__*/React.createElement(Select, {
      label: "Descuento o beca",
      value: desc,
      onChange: e => setDesc(e.target.value),
      options: [{
        value: "no",
        label: "Ninguno"
      }, {
        value: "herm",
        label: "Descuento hermanos · −10% pensión"
      }, {
        value: "beca50",
        label: "Beca parcial · −50% pensión"
      }]
    }), desc !== "no" && /*#__PURE__*/React.createElement(Alert, {
      tone: "success",
      title: desc === "herm" ? "Descuento hermanos aplicado" : "Beca parcial aplicada"
    }, "Se aplica a las ", MESES.length, " pensiones, no a la matr\xEDcula ni a los programas."), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-inverse)",
        color: "var(--text-inverse)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)"
      }
    }, "Total anual"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h2)",
        fontFamily: "var(--font-mono)"
      }
    }, "S/ ", Number(total).toLocaleString("es-PE", {
      minimumFractionDigits: 2
    })))), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Cronograma de pagos",
      subtitle: traslado ? "Solo los meses restantes del año — 1 matrícula + 5 pensiones" : "Se genera automáticamente al matricular — 1 matrícula + 10 pensiones"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      compact: true,
      data: [{
        concepto: "Matrícula 2026",
        vence: "al matricular",
        monto: "250.00"
      }, ...cuotas]
    })));
  }

  /* Paso 5 — Confirmación */
  function StepConfirm({
    desc
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(FieldPair, {
      k: "Estudiante",
      v: "Mar\xEDa Quispe Roca",
      strong: true
    }), /*#__PURE__*/React.createElement(FieldPair, {
      k: "Ubicaci\xF3n",
      v: "3\xB0 B \xB7 Primaria \xB7 Ma\xF1ana",
      strong: true
    }), /*#__PURE__*/React.createElement(FieldPair, {
      k: "Tipo de matr\xEDcula",
      v: "Ratificaci\xF3n",
      strong: true
    }), /*#__PURE__*/React.createElement(FieldPair, {
      k: "Apoderado principal",
      v: "Juana Roca P\xE9rez (Madre)"
    }), /*#__PURE__*/React.createElement(FieldPair, {
      k: "Programas",
      v: "Taller de Danza"
    }), /*#__PURE__*/React.createElement(FieldPair, {
      k: "Descuento",
      v: desc === "herm" ? "Hermanos −10%" : desc === "beca50" ? "Beca parcial −50%" : "Ninguno"
    })), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Al confirmar se generar\xE1:"
    }, "N\xB0 de matr\xEDcula ", /*#__PURE__*/React.createElement("b", null, "M-2026-0483"), " \xB7 cronograma de 11 pagos (S/ 250.00 de matr\xEDcula + 10 pensiones) \xB7 la ficha \xFAnica de matr\xEDcula lista para imprimir \xB7 notificaci\xF3n al apoderado principal."), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Declaro que los datos consignados son correctos",
      description: "El apoderado firmar\xE1 la ficha impresa"
    }));
  }

  /* Success */
  function Success({
    onExit,
    onAgain
  }) {
    return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        padding: "34px 20px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 62,
        height: 62,
        borderRadius: 99,
        background: "var(--success-soft)",
        color: "var(--success)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30
      }
    }, /*#__PURE__*/React.createElement(Ic.Check, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-h2)",
        color: "var(--text-strong)",
        marginTop: 6
      }
    }, "Matr\xEDcula M-2026-0483 registrada"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body-md)",
        color: "var(--text-muted)",
        maxWidth: 460
      }
    }, "Mar\xEDa Quispe Roca qued\xF3 matriculada en 3\xB0 B Primaria. El cronograma de 11 pagos fue generado y se notific\xF3 a Juana Roca P\xE9rez."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("info", "Imprimiendo", "Ficha única de matrícula M-2026-0483 enviada a la impresora.")
    }, "Imprimir ficha"), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Cash, null),
      onClick: () => {
        goTo("caja");
        notify("info", "Caja", "Cobro de matrícula de María Quispe Roca preparado (S/ 250.00).");
      }
    }, "Cobrar matr\xEDcula ahora"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: onAgain
    }, "Nueva matr\xEDcula")), /*#__PURE__*/React.createElement(Button, {
      variant: "link",
      onClick: onExit,
      style: {
        marginTop: 8
      }
    }, "Volver al listado")));
  }

  /* ------------------------------ wizard shell ------------------------------ */
  function Wizard({
    onExit
  }) {
    const [step, setStep] = React.useState(0);
    const [tipo, setTipo] = React.useState("exist");
    const [seccion, setSeccion] = React.useState("B");
    const [desc, setDesc] = React.useState("herm");
    const [done, setDone] = React.useState(false);
    if (done) return /*#__PURE__*/React.createElement(Success, {
      onExit: onExit,
      onAgain: () => {
        setDone(false);
        setStep(0);
      }
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      onClick: onExit
    }, "\u2190 Volver al listado"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Nueva matr\xEDcula \xB7 A\xF1o acad\xE9mico 2026")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Stepper, {
      step: step
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22
      }
    }, step === 0 && /*#__PURE__*/React.createElement(StepStudent, {
      tipo: tipo,
      setTipo: setTipo
    }), step === 1 && /*#__PURE__*/React.createElement(StepGuardians, null), step === 2 && /*#__PURE__*/React.createElement(StepPlacement, {
      seccion: seccion,
      setSeccion: setSeccion
    }), step === 3 && /*#__PURE__*/React.createElement(StepFees, {
      desc: desc,
      setDesc: setDesc,
      tipo: tipo
    }), step === 4 && /*#__PURE__*/React.createElement(StepConfirm, {
      desc: desc
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 22px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: step === 0 ? onExit : () => setStep(s => s - 1)
    }, step === 0 ? "Cancelar" : "Atrás"), step < 4 ? /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconRight: /*#__PURE__*/React.createElement(Ic.ArrowRight, null),
      onClick: () => setStep(s => s + 1)
    }, "Siguiente") : /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => setDone(true)
    }, "Matricular y generar cronograma"))));
  }
  window.SGE_Enrollment = function Enrollment() {
    const [mode, setMode] = React.useState("list");
    return mode === "list" ? /*#__PURE__*/React.createElement(EnrollList, {
      onNew: () => setMode("wizard")
    }) : /*#__PURE__*/React.createElement(Wizard, {
      onExit: () => setMode("list")
    });
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/EnrollmentScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/FeesScreen.jsx
try { (() => {
/* Elohim SGE — Tarifario y becas. Registers window.SGE_Fees. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Button,
    IconButton,
    Input,
    Select,
    Tabs,
    Tooltip,
    Alert,
    Avatar,
    Switch,
    Dialog
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const fmt = n => `S/ ${Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: 2
  })}`;
  const TARIFAS = [["Inicial", 200, 250, 10], ["Primaria", 250, 280, 10], ["Secundaria", 280, 310, 10]];
  const PROGRAMAS = [["Taller de Danza", 0, 60], ["Taller de Música", 0, 70], ["Reforzamiento · Matemática", 0, 80], ["Academia Pre (verano)", 100, 150]];
  const DESCUENTOS = [["Descuento hermanos", "−10% pensión", "Desde el 2° hijo matriculado", "Automático", 38, "Activo"], ["Beca parcial", "−50% pensión", "Evaluación socioeconómica anual", "Manual", 11, "Activo"], ["Beca completa", "−100% pensión", "Aprobación de dirección", "Manual", 3, "Activo"], ["Pronto pago", "−5% pensión", "Pago antes del día 5 del mes", "Automático", 0, "Inactivo"]];
  function Tarifas() {
    const [editNivel, setEditNivel] = React.useState(null);
    const [editProg, setEditProg] = React.useState(null);
    const cols = [{
      key: "nivel",
      header: "Nivel",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "mat",
      header: "Matrícula (única)",
      num: true,
      mono: true,
      render: v => fmt(v)
    }, {
      key: "pen",
      header: "Pensión mensual",
      num: true,
      mono: true,
      render: v => fmt(v)
    }, {
      key: "n",
      header: "Cuotas al año",
      align: "center",
      mono: true,
      render: v => `${v} (mar–dic)`
    }, {
      key: "anual",
      header: "Total anual",
      num: true,
      mono: true,
      render: (_, r) => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, fmt(r.mat + r.pen * r.n))
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setEditNivel(r)
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))
    }];
    const pcols = [{
      key: "prog",
      header: "Programa",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "mat",
      header: "Matrícula",
      num: true,
      mono: true,
      render: v => v ? fmt(v) : "—"
    }, {
      key: "pen",
      header: "Mensualidad",
      num: true,
      mono: true,
      render: v => fmt(v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setEditProg(r)
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "Estos montos alimentan la ", /*#__PURE__*/React.createElement("b", null, "generaci\xF3n autom\xE1tica del cronograma"), " en cada matr\xEDcula. Cambiarlos no altera cronogramas ya generados."), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Ense\xF1anza regular \xB7 2026",
      actions: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Copy, null),
        onClick: () => notify("success", "Tarifario copiado a 2027", "Edítalo desde el selector de año antes de abrir la matrícula 2027.")
      }, "Copiar a 2027")
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: TARIFAS.map(t => ({
        nivel: t[0],
        mat: t[1],
        pen: t[2],
        n: t[3]
      }))
    })), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Programas complementarios"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: pcols,
      data: PROGRAMAS.map(p => ({
        prog: p[0],
        mat: p[1],
        pen: p[2]
      }))
    })), /*#__PURE__*/React.createElement(Card, {
      title: "Mora por atraso"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 14,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Mora fija",
      prefix: "S/.",
      defaultValue: "5.00",
      containerStyle: {
        width: 140
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "D\xEDas de gracia",
      defaultValue: "3",
      suffix: "d\xEDas",
      containerStyle: {
        width: 150
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "D\xEDa de corte \xB7 traslados",
      defaultValue: "20",
      suffix: "del mes",
      containerStyle: {
        width: 170
      },
      hint: "Ingresa antes: paga el mes; despu\xE9s: gratis"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        height: 38
      }
    }, /*#__PURE__*/React.createElement(Switch, {
      label: "Aplicar mora autom\xE1ticamente",
      defaultChecked: true
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => notify("success", "Mora actualizada", "S/ 5.00 tras 3 días de gracia · aplicación automática.")
    }, "Guardar"))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!editNivel,
      onClose: () => setEditNivel(null),
      title: editNivel ? `Tarifa · ${editNivel.nivel}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      description: "Rige para las matr\xEDculas nuevas; no altera cronogramas ya generados",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setEditNivel(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Tarifa actualizada", `${editNivel.nivel} · guardada para el año 2026.`);
          setEditNivel(null);
        }
      }, "Guardar"))
    }, editNivel && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Matr\xEDcula (pago \xFAnico)",
      prefix: "S/.",
      defaultValue: editNivel.mat.toFixed(2),
      inputMode: "decimal"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Pensi\xF3n mensual",
      prefix: "S/.",
      defaultValue: editNivel.pen.toFixed(2),
      inputMode: "decimal"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Cuotas al a\xF1o",
      options: ["10 (mar–dic)", "11 (feb–dic)"],
      defaultValue: "10 (mar\u2013dic)",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!editProg,
      onClose: () => setEditProg(null),
      title: editProg ? `Tarifa · ${editProg.prog}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setEditProg(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Tarifa actualizada", `${editProg.prog} · guardada.`);
          setEditProg(null);
        }
      }, "Guardar"))
    }, editProg && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Matr\xEDcula",
      prefix: "S/.",
      defaultValue: editProg.mat ? editProg.mat.toFixed(2) : "0.00",
      inputMode: "decimal",
      hint: "0 = sin pago de matr\xEDcula"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Mensualidad",
      prefix: "S/.",
      defaultValue: editProg.pen.toFixed(2),
      inputMode: "decimal"
    }))));
  }
  function Becas() {
    const [dlg, setDlg] = React.useState(null); // {d?} nuevo o editar
    const [ben, setBen] = React.useState(null);
    const cols = [{
      key: "nombre",
      header: "Descuento / beca",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.cond))
    }, {
      key: "efecto",
      header: "Efecto",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: "accent"
      }, v)
    }, {
      key: "tipo",
      header: "Aplicación",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Automático" ? "brand" : "neutral"
      }, v)
    }, {
      key: "ben",
      header: "Beneficiarios",
      align: "center",
      mono: true
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Activo" ? "success" : "neutral",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setDlg({
          d: r
        })
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver beneficiarios"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Beneficiarios",
        size: "sm",
        onClick: () => setBen(r)
      }, /*#__PURE__*/React.createElement(Ic.Users, null))))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Los descuentos se eligen en el paso \"Tarifa y cronograma\" de la matr\xEDcula; los autom\xE1ticos se proponen solos."), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setDlg({})
    }, "Nuevo descuento")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: DESCUENTOS.map(d => ({
        nombre: d[0],
        efecto: d[1],
        cond: d[2],
        tipo: d[3],
        ben: d[4],
        estado: d[5]
      })),
      hover: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: !!dlg,
      onClose: () => setDlg(null),
      size: "lg",
      title: dlg && dlg.d ? `Editar · ${dlg.d.nombre}` : "Nuevo descuento o beca",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setDlg(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", dlg.d ? "Descuento actualizado" : "Descuento creado", "Disponible en el paso de tarifa de la matrícula.");
          setDlg(null);
        }
      }, dlg && dlg.d ? "Guardar cambios" : "Crear"))
    }, dlg && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre",
      required: true,
      defaultValue: dlg.d ? dlg.d.nombre : "",
      placeholder: "Ej. Beca deportiva",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Descuento sobre la pensi\xF3n",
      suffix: "%",
      defaultValue: dlg.d ? dlg.d.efecto.replace(/[^0-9]/g, "") : "",
      placeholder: "10",
      inputMode: "numeric"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Aplicaci\xF3n",
      options: ["Automático", "Manual"],
      defaultValue: dlg.d ? dlg.d.tipo : "Manual",
      hint: "Autom\xE1tico se propone solo al matricular"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Condici\xF3n",
      defaultValue: dlg.d ? dlg.d.cond : "",
      placeholder: "Ej. promedio \u2265 18",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Estado",
      options: ["Activo", "Inactivo"],
      defaultValue: dlg.d ? dlg.d.estado : "Activo"
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!ben,
      onClose: () => setBen(null),
      size: "lg",
      title: ben ? `Beneficiarios · ${ben.nombre}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      description: ben ? `${ben.ben} estudiantes · ${ben.efecto}` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
        onClick: () => notify("success", "Exportado", `Beneficiarios de ${ben.nombre} descargados.`)
      }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
        onClick: () => {
          notify("info", "Asignar beneficiario", "Busca al estudiante y asígnale el descuento desde su ficha.");
          setBen(null);
        }
      }, "Asignar estudiante"))
    }, ben && (ben.ben > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingTop: 4
      }
    }, ["Lima Vega, Rosa · 2° B Primaria", "Quispe Roca, Pedro · Inicial 5 años", "Vela Soto, Iris · 2° A Secundaria"].slice(0, Math.min(3, ben.ben)).map(e => /*#__PURE__*/React.createElement("div", {
      key: e,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: e,
      size: "xs"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: "var(--type-label)",
        color: "var(--text-body)"
      }
    }, e), /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, ben.efecto))), ben.ben > 3 && /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-subtle)"
      }
    }, "Mostrando 3 de ", ben.ben, " (datos de ejemplo).")) : /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      style: {
        marginTop: 4
      }
    }, "Este descuento a\xFAn no tiene beneficiarios asignados."))));
  }
  window.SGE_Fees = function Fees() {
    const [tab, setTab] = React.useState("tarifas");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "tarifas",
        label: "Tarifario 2026"
      }, {
        id: "becas",
        label: "Descuentos y becas",
        count: 4
      }]
    }), tab === "tarifas" ? /*#__PURE__*/React.createElement(Tarifas, null) : /*#__PURE__*/React.createElement(Becas, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/FeesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/GradesScreen.jsx
try { (() => {
/* Elohim SGE — Notas / Calificaciones. Registers window.SGE_Grades. */
(function () {
  const {
    Card,
    Table,
    Avatar,
    Badge,
    Button,
    Select,
    Input,
    Tabs,
    ProgressBar,
    Tooltip,
    IconButton,
    Alert
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const STUDENTS = [["María Quispe Roca", "AD", "A", "AD", "var(--blue-500)"], ["José Ramos Lía", "A", "B", "A", "var(--gold-500)"], ["Ana Flores Mendoza", "A", "AD", "A", "var(--green-500)"], ["Luis Paz Cárdenas", "B", "B", "C", "var(--brown-400)"], ["Rosa Lima Vega", "AD", "AD", "AD", "var(--blue-400)"], ["Hugo Vela Soto", "B", "A", "B", "var(--blue-600)"]];
  const LETRAS = ["AD", "A", "B", "C"];
  const VAL = {
    AD: 4,
    A: 3,
    B: 2,
    C: 1
  };
  const letraColor = v => v === "AD" ? "var(--success)" : v === "A" ? "var(--brand)" : v === "B" ? "var(--gold-500)" : "var(--danger)";
  function NotaInput({
    value
  }) {
    const [v, setV] = React.useState(value);
    return /*#__PURE__*/React.createElement("select", {
      value: v,
      onChange: e => setV(e.target.value),
      style: {
        width: 58,
        height: 34,
        textAlign: "center",
        border: `1.5px solid ${letraColor(v)}`,
        borderRadius: "var(--radius-md)",
        font: "var(--type-mono)",
        fontWeight: 600,
        color: "var(--text-strong)",
        background: "var(--surface-card)",
        outline: "none",
        cursor: "pointer"
      }
    }, LETRAS.map(l => /*#__PURE__*/React.createElement("option", {
      key: l,
      value: l
    }, l)));
  }
  function RegistroNotas() {
    const [curso, setCurso] = React.useState("mat");
    const cols = [{
      key: "n",
      header: "N°",
      align: "center",
      width: 44,
      mono: true,
      render: (_, __, i) => i + 1
    }, {
      key: "est",
      header: "Estudiante",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "c1",
      header: "C1",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(NotaInput, {
        value: v
      })
    }, {
      key: "c2",
      header: "C2",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(NotaInput, {
        value: v
      })
    }, {
      key: "c3",
      header: "C3",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(NotaInput, {
        value: v
      })
    }, {
      key: "prom",
      header: "Logro del bimestre",
      align: "center",
      render: (_, r) => {
        const p = Math.round((VAL[r.c1] + VAL[r.c2] + VAL[r.c3]) / 3);
        const letra = ["C", "B", "A", "AD"][p - 1] || "C";
        return /*#__PURE__*/React.createElement(Badge, {
          tone: letra === "AD" ? "success" : letra === "A" ? "brand" : letra === "B" ? "warning" : "danger",
          solid: letra === "AD"
        }, letra);
      }
    }, {
      key: "estado",
      header: "Condición",
      align: "center",
      render: (_, r) => {
        const p = (VAL[r.c1] + VAL[r.c2] + VAL[r.c3]) / 3;
        return /*#__PURE__*/React.createElement("span", {
          style: {
            font: "var(--type-label)",
            color: p >= 2.5 ? "var(--success)" : p >= 1.5 ? "var(--warning-soft-fg)" : "var(--danger)"
          }
        }, p >= 2.5 ? "Logrado" : p >= 1.5 ? "En proceso" : "En inicio");
      }
    }];
    const rows = STUDENTS.map(s => ({
      est: s[0],
      c1: s[1],
      c2: s[2],
      c3: s[3],
      color: s[4]
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Grado y secci\xF3n",
      options: ["3° A Primaria", "3° B Primaria", "4° A Primaria"],
      containerStyle: {
        width: 200
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Periodo",
      options: ["Bimestre I", "Bimestre II", "Bimestre III", "Bimestre IV"],
      defaultValue: "Bimestre II",
      containerStyle: {
        width: 170
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("success", "Acta exportada", "Acta de Matemática · 3° A · Bimestre II descargada en Excel.")
    }, "Exportar acta"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => notify("success", "Notas guardadas", "Matemática · 3° A · Bimestre II — 6 estudiantes actualizados.")
    }, "Guardar notas")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 16px",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: curso,
      onChange: setCurso,
      items: [{
        id: "mat",
        label: "Matemática"
      }, {
        id: "com",
        label: "Comunicación"
      }, {
        id: "cyt",
        label: "Ciencia y Tecnología"
      }, {
        id: "per",
        label: "Personal Social"
      }, {
        id: "rel",
        label: "Educación Religiosa"
      }]
    })), /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Escala literal \xB7 AD Logro destacado \xB7 A Logrado \xB7 B En proceso \xB7 C En inicio"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 220
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      label: "Notas registradas",
      value: 6,
      max: 32,
      showValue: true,
      size: "sm",
      tone: "brand",
      valueFormat: (v, m) => `${v}/${m}`
    })))));
  }
  ;
  /* ------------------------------ Libreta ------------------------------ */
  const LIBRETA_EST = {
    prim: {
      nombre: "María Quispe Roca",
      ubic: "3° B Primaria",
      cod: "E-1042",
      nivel: "Primaria",
      tutor: "Lucía Díaz",
      cursos: [["Matemática", "A", "AD"], ["Comunicación", "AD", "AD"], ["Ciencia y Tecnología", "A", "A"], ["Personal Social", "A", "A"], ["Inglés", "B", "A"], ["Educación Física", "AD", "AD"], ["Arte y Cultura", "A", "A"], ["Educación Religiosa", "AD", "AD"]]
    },
    sec: {
      nombre: "Ana Flores Mendoza",
      ubic: "1° A Secundaria",
      cod: "E-1051",
      nivel: "Secundaria",
      tutor: "Iris Quinto",
      cursos: [["Matemática", "A", "A"], ["Comunicación", "A", "A"], ["Ciencia y Tecnología", "A", "AD"], ["Ciencias Sociales", "B", "A"], ["DPCC", "A", "A"], ["Inglés", "B", "B"], ["Educación Física", "AD", "AD"], ["Arte y Cultura", "A", "A"], ["Educación Religiosa", "AD", "AD"], ["Educación para el Trabajo", "B", "A"]]
    }
  };
  const FORMATIVOS = [["Comportamiento", "A", "AD"], ["Uniformidad", "A", "A"], ["Puntualidad", "B", "A"]];
  const APODERADO_CRIT = [["Asiste a reuniones", "AD", "AD"], ["Acompañamiento en casa", "A", "A"], ["Comunicación con el tutor", "B", "A"]];
  function NotaChip({
    v
  }) {
    const tone = v === "AD" ? "success" : v === "A" ? "brand" : v === "B" ? "warning" : "danger";
    return /*#__PURE__*/React.createElement(Badge, {
      tone: tone,
      solid: v === "AD"
    }, v);
  }
  function Libreta() {
    const [who, setWho] = React.useState("prim");
    const e = LIBRETA_EST[who];
    const notaCols = [{
      key: "n",
      header: "Curso / criterio",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "b1",
      header: "Bim. I",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(NotaChip, {
        v: v
      })
    }, {
      key: "b2",
      header: "Bim. II",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(NotaChip, {
        v: v
      })
    }, {
      key: "b3",
      header: "Bim. III",
      align: "center",
      render: () => /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-subtle)"
        }
      }, "\u2014")
    }, {
      key: "b4",
      header: "Bim. IV",
      align: "center",
      render: () => /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-subtle)"
        }
      }, "\u2014")
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Estudiante",
      options: [{
        value: "prim",
        label: "María Quispe Roca · 3° B Primaria"
      }, {
        value: "sec",
        label: "Ana Flores Mendoza · 1° A Secundaria"
      }],
      value: who,
      onChange: ev => setWho(ev.target.value),
      containerStyle: {
        width: 300
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Periodo",
      options: ["Bimestre II · 2026", "Bimestre I · 2026"],
      defaultValue: "Bimestre II \xB7 2026",
      containerStyle: {
        width: 180
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("success", "Libreta exportada", `${e.nombre} · Bimestre II en PDF, lista para imprimir.`)
    }, "Imprimir / PDF"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Mail, null),
      onClick: () => notify("success", "Libreta enviada", "El apoderado la recibirá por WhatsApp y correo.")
    }, "Enviar al apoderado")), /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "La libreta se arma sola: ", /*#__PURE__*/React.createElement("b", null, "cursos"), " desde el plan de estudios del grado, ", /*#__PURE__*/React.createElement("b", null, "aspectos formativos"), " y ", /*#__PURE__*/React.createElement("b", null, "evaluaci\xF3n del apoderado"), " desde Configuraci\xF3n \u2192 Evaluaci\xF3n. Toda la calificaci\xF3n es en ", /*#__PURE__*/React.createElement("b", null, "escala literal AD/A/B/C"), ", en todos los niveles."), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/elohim-insignia.png",
      alt: "",
      style: {
        width: 44,
        height: 44,
        objectFit: "contain"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, "I.E.P. Elohim \u2014 Libreta de calificaciones \xB7 2026"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, e.nombre, " \xB7 ", e.cod, " \xB7 ", e.ubic, " \xB7 Tutor(a): ", e.tutor)), /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "Bimestre II")), /*#__PURE__*/React.createElement(Table, {
      columns: notaCols,
      data: e.cursos.map(c => ({
        n: c[0],
        b1: c[1],
        b2: c[2]
      })),
      compact: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 18px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow"
    }, "Aspectos formativos \xB7 califica el tutor \xB7 escala AD/A/B/C")), /*#__PURE__*/React.createElement(Table, {
      columns: notaCols,
      data: FORMATIVOS.map(c => ({
        n: c[0],
        b1: c[1],
        b2: c[2]
      })),
      compact: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 18px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "eyebrow"
    }, "Evaluaci\xF3n del apoderado \xB7 registra el tutor \xB7 escala AD/A/B/C")), /*#__PURE__*/React.createElement(Table, {
      columns: notaCols,
      data: APODERADO_CRIT.map(c => ({
        n: c[0],
        b1: c[1],
        b2: c[2]
      })),
      compact: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 18px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "AD Logro destacado \xB7 A Logrado \xB7 B En proceso \xB7 C En inicio"), /*#__PURE__*/React.createElement("span", null, "Asistencia del bimestre: 96% \xB7 2 tardanzas"))));
  }
  window.SGE_Grades = function Grades() {
    const [vista, setVista] = React.useState("registro");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: vista,
      onChange: setVista,
      items: [{
        id: "registro",
        label: "Registro de notas"
      }, {
        id: "libretas",
        label: "Libretas"
      }]
    }), vista === "registro" ? /*#__PURE__*/React.createElement(RegistroNotas, null) : /*#__PURE__*/React.createElement(Libreta, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/GradesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/GuardiansScreen.jsx
try { (() => {
/* Elohim SGE — Apoderados. Registers window.SGE_Guardians.
   Listado + ficha con hijos vinculados (relación N:M) y estado de cuenta consolidado. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Tooltip,
    Dialog,
    Pagination,
    Alert
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);
  const fmt = n => `S/ ${Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: 2
  })}`;
  const DATA = [["A-0211", "Juana Roca Pérez", "Madre", "964 221 880", 2, 0, "var(--gold-500)", [["María Quispe Roca", "3° B Primaria", 0], ["Pedro Quispe Roca", "Inicial · 5 años", 0]]], ["A-0212", "Óscar Ramos Díaz", "Padre", "989 410 227", 1, 280, "var(--blue-500)", [["José Ramos Lía", "5° B Primaria", 280]]], ["A-0230", "Silvia Mendoza Cruz", "Madre", "913 552 090", 1, 620, "var(--green-500)", [["Ana Flores Mendoza", "1° A Secundaria", 620]]], ["A-0242", "Elena Vega Torres", "Abuela", "942 118 306", 1, 0, "var(--brown-400)", [["Rosa Lima Vega", "2° B Primaria", 0]]], ["A-0251", "Marcos Vela Ruiz", "Padre", "955 023 481", 2, 560, "var(--blue-400)", [["Hugo Vela Soto", "6° A Primaria", 560], ["Iris Vela Soto", "2° A Secundaria", 0]]]];
  function Ficha({
    g,
    onClose,
    onEdit
  }) {
    const cols = [{
      key: "hijo",
      header: "Estudiante",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm"
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.ubic)))
    }, {
      key: "deuda",
      header: "Deuda",
      num: true,
      mono: true,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: v > 0 ? "var(--danger)" : "var(--text-muted)"
        }
      }, v > 0 ? fmt(v) : "Al día")
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver ficha del estudiante"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => {
          onClose();
          goTo("est");
          notify("info", "Estudiantes", "Abriendo el módulo con la ficha del estudiante.");
        }
      }, /*#__PURE__*/React.createElement(Ic.Eye, null)))
    }];
    return /*#__PURE__*/React.createElement(Dialog, {
      open: !!g,
      onClose: onClose,
      size: "lg",
      title: g.nombre,
      description: `${g.cod} · ${g.rel} · ${g.tel}`,
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Send, null),
        onClick: () => notify("success", "Recordatorio enviado", `${g.nombre} recibirá el estado de cuenta por WhatsApp.`)
      }, "Enviar recordatorio de pago"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Pencil, null),
        onClick: onEdit
      }, "Editar"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, g.deuda > 0 ? /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: `Deuda familiar: ${fmt(g.deuda)}`
    }, "Consolidada entre sus ", g.hijos.length > 1 ? `${g.hijos.length} hijos` : "hijo", ".") : /*#__PURE__*/React.createElement(Alert, {
      tone: "success",
      title: "Familia al d\xEDa"
    }, "Sin cuotas pendientes ni vencidas."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, [["DNI", "41 220 876"], ["Correo", "familia@gmail.com"], ["Dirección", "Jr. Los Cedros 245, Satipo"], ["Notificaciones", "WhatsApp + correo"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body)",
        color: "var(--text-body)"
      }
    }, v)))), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: `Hijos en la institución (${g.hijos.length})`
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: g.hijos.map(h => ({
        hijo: h[0],
        ubic: h[1],
        deuda: h[2]
      })),
      compact: true
    }))));
  }
  window.SGE_Guardians = function Guardians() {
    const [ficha, setFicha] = React.useState(null);
    const [form, setForm] = React.useState(null); // {g?} nuevo o editar
    const cols = [{
      key: "cod",
      header: "Código",
      mono: true,
      width: 84
    }, {
      key: "nombre",
      header: "Apoderado",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "rel",
      header: "Relación",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral"
      }, v)
    }, {
      key: "tel",
      header: "Teléfono",
      mono: true
    }, {
      key: "nh",
      header: "Hijos",
      align: "center",
      mono: true
    }, {
      key: "deuda",
      header: "Deuda familiar",
      num: true,
      mono: true,
      render: v => v > 0 ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--danger)",
          fontWeight: 600
        }
      }, fmt(v)) : /*#__PURE__*/React.createElement(Badge, {
        tone: "success",
        dot: true
      }, "Al d\xEDa")
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver ficha"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => setFicha(r)
      }, /*#__PURE__*/React.createElement(Ic.Eye, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Enviar recordatorio"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Recordatorio",
        size: "sm",
        onClick: () => notify("success", "Recordatorio enviado", `${r.nombre} · ${r.deuda > 0 ? `deuda de ${fmt(r.deuda)}` : "sin deuda"} · vía WhatsApp.`)
      }, /*#__PURE__*/React.createElement(Ic.Send, null))))
    }];
    const rows = DATA.map(d => ({
      cod: d[0],
      nombre: d[1],
      rel: d[2],
      tel: d[3],
      nh: d[4],
      deuda: d[5],
      color: d[6],
      hijos: d[7]
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 220
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por nombre, DNI o tel\xE9fono\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Estado de cuenta",
      options: ["Al día", "Con deuda"],
      containerStyle: {
        width: 170
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setForm({})
    }, "Registrar apoderado")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true,
      zebra: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(Pagination, {
      page: 1,
      pageCount: 18,
      onPageChange: () => {},
      total: 356,
      pageSize: 20
    }))), ficha && /*#__PURE__*/React.createElement(Ficha, {
      g: ficha,
      onClose: () => setFicha(null),
      onEdit: () => {
        const g = ficha;
        setFicha(null);
        setForm({
          g
        });
      }
    }), /*#__PURE__*/React.createElement(Dialog, {
      open: !!form,
      onClose: () => setForm(null),
      size: "lg",
      title: form && form.g ? `Editar · ${form.g.nombre}` : "Registrar apoderado",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      description: "El apoderado podr\xE1 vincularse a uno o m\xE1s estudiantes",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setForm(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", form.g ? "Apoderado actualizado" : "Apoderado registrado", form.g ? `${form.g.nombre} guardado.` : "Ya puedes vincularlo desde la matrícula o la ficha del estudiante.");
          setForm(null);
        }
      }, form && form.g ? "Guardar cambios" : "Registrar"))
    }, form && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombres y apellidos",
      required: true,
      defaultValue: form.g ? form.g.nombre : "",
      placeholder: "Ej. Juana Roca P\xE9rez",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "DNI",
      required: true,
      defaultValue: form.g ? "41 220 876" : "",
      placeholder: "00000000"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Relaci\xF3n",
      options: ["Madre", "Padre", "Abuelo/a", "Tío/a", "Tutor legal"],
      defaultValue: form.g ? form.g.rel : undefined,
      placeholder: "Seleccione"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Tel\xE9fono (WhatsApp)",
      required: true,
      defaultValue: form.g ? form.g.tel : "",
      placeholder: "9__ ___ ___"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Correo",
      type: "email",
      defaultValue: form.g ? "familia@gmail.com" : "",
      placeholder: "opcional"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Direcci\xF3n",
      placeholder: "Jr. \u2026, Satipo",
      containerStyle: {
        gridColumn: "1 / -1"
      },
      defaultValue: form.g ? "Jr. Los Cedros 245, Satipo" : ""
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Canal de notificaciones",
      options: ["WhatsApp + correo", "Solo WhatsApp", "Solo correo", "Ninguno"],
      defaultValue: "WhatsApp + correo"
    }))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/GuardiansScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/InventoryScreen.jsx
try { (() => {
/* Elohim SGE — Inventario y activos. Registers window.SGE_Inventory.
   Tabs: Almacén (stock venta+suministros) · Compras (→ gasto en Tesorería) ·
   Activos (equipos por ubicación, incl. laboratorios) · Biblioteca (catálogo + préstamos).
   Integraciones: venta en Caja descuenta stock; compra crea gasto; avería genera gasto vinculado. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Tabs,
    Alert,
    Tooltip,
    StatCard,
    Dialog,
    Textarea,
    Checkbox
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);
  const fmt = n => `S/ ${Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: 2
  })}`;

  /* ------------------------------ data ------------------------------ */
  const ALMACEN = [["AL-001", "Libro Matemática 3° · Santillana", "Venta", 34, 10, 120.0], ["AL-002", "Uniforme diario (tallas 8–12)", "Venta", 18, 15, 85.0], ["AL-003", "Buzo institucional (tallas 8–12)", "Venta", 6, 10, 95.0], ["AL-004", "Folder institucional", "Venta", 52, 20, 8.0], ["AL-005", "Papel bond A4 (millar)", "Suministro", 4, 6, null], ["AL-006", "Tóner HP 85A", "Suministro", 0, 2, null], ["AL-007", "Kit de materiales de limpieza", "Suministro", 9, 4, null]];
  const COMPRAS = [["OC-0044", "06/07", "Compulaser Satipo", "Tóner HP 85A ×3", 255.0, "Pendiente", null], ["OC-0043", "03/07", "Librería San Marcos", "Papel bond A4 ×10 millares", 260.0, "Recibido", "G-0217"], ["OC-0042", "28/06", "Distribuidora Andina", "Uniformes ×20 · Buzos ×10", 2650.0, "Recibido", "G-0209"]];
  const ACTIVOS = [["AC-018", "Computadoras de cómputo (×15)", "Laboratorio de cómputo", "I. Quinto", "Operativo", 22500], ["AC-012", "Proyector Epson X49", "Laboratorio de cómputo", "P. Gómez", "Operativo", 1850], ["AC-021", "Microscopios (×6)", "Laboratorio de ciencias", "R. Meza", "Operativo", 4200], ["AC-007", "Impresora HP LaserJet", "Secretaría", "L. Campos", "En reparación", 950], ["AC-003", "Fotocopiadora Canon", "Dirección", "L. Campos", "Operativo", 3800], ["AC-015", "Carpetas unipersonales (×120)", "Aulas", "—", "Operativo", 14400]];
  const LIBROS = [["B-101", "Matemática 3° · Santillana", 12, 9], ["B-214", "María · Jorge Isaacs", 8, 6], ["B-330", "Atlas del Perú", 5, 4], ["B-118", "Comunicación 5° · Norma", 10, 10]];
  const PRESTAMOS = [["Hugo Vela Soto · 6° A", "Matemática 3° · Santillana", "01/07", "Atrasado"], ["María Quispe Roca · 3° B", "María · Jorge Isaacs", "10/07", "Prestado"], ["Prof. R. Meza", "Atlas del Perú", "08/07", "Prestado"]];
  const stockTone = (s, min) => s === 0 ? "danger" : s < min ? "warning" : "success";
  const stockLabel = (s, min) => s === 0 ? "Agotado" : s < min ? "Stock bajo" : "OK";

  /* ------------------------------ Almacén ------------------------------ */
  function Almacen() {
    const [ajuste, setAjuste] = React.useState(null);
    const [nuevo, setNuevo] = React.useState(false);
    const data = ALMACEN.map(a => ({
      cod: a[0],
      item: a[1],
      cat: a[2],
      stock: a[3],
      min: a[4],
      precio: a[5]
    }));
    const bajos = data.filter(d => d.stock < d.min).length;
    const cols = [{
      key: "cod",
      header: "Código",
      mono: true,
      width: 84
    }, {
      key: "item",
      header: "Artículo",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "cat",
      header: "Tipo",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Venta" ? "accent" : "info"
      }, v)
    }, {
      key: "stock",
      header: "Stock",
      align: "center",
      mono: true,
      render: (v, r) => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: v === 0 ? "var(--danger)" : v < r.min ? "var(--warning)" : "var(--text-strong)"
        }
      }, v)
    }, {
      key: "min",
      header: "Mínimo",
      align: "center",
      mono: true,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-muted)"
        }
      }, v)
    }, {
      key: "precio",
      header: "Precio venta",
      num: true,
      mono: true,
      render: v => v ? fmt(v) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-subtle)"
        }
      }, "\u2014")
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: (_, r) => /*#__PURE__*/React.createElement(Badge, {
        tone: stockTone(r.stock, r.min),
        dot: true
      }, stockLabel(r.stock, r.min))
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ajustar stock"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ajustar",
        size: "sm",
        onClick: () => setAjuste(r)
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), r.stock < r.min && /*#__PURE__*/React.createElement(Tooltip, {
        content: "Generar orden de compra"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Comprar",
        size: "sm",
        onClick: () => notify("info", "Orden de compra", `Borrador de compra de "${r.item}" creado en la pestaña Compras.`)
      }, /*#__PURE__*/React.createElement(Ic.Plus, null))))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Art\xEDculos",
      value: "7",
      icon: /*#__PURE__*/React.createElement(Ic.Box, null),
      caption: "4 de venta \xB7 3 suministros"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Stock bajo / agotado",
      value: String(bajos),
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Chart, null),
      caption: "requieren compra"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Valor en stock (venta)",
      value: "S/ 6,494",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      caption: "a precio de venta"
    })), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Integrado con Caja"
    }, "Las ventas de ", /*#__PURE__*/React.createElement("b", null, "Caja y cobros \u2192 Otros conceptos"), " descuentan stock autom\xE1ticamente; las compras recibidas lo reponen. Los art\xEDculos agotados dejan de ofrecerse en Caja."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar art\xEDculo\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Tipo",
      options: ["Venta", "Suministro"],
      containerStyle: {
        width: 140
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNuevo(true)
    }, "Nuevo art\xEDculo")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: data,
      hover: true,
      zebra: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: !!ajuste,
      onClose: () => setAjuste(null),
      title: ajuste ? `Ajustar stock · ${ajuste.item}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Box, null),
      description: ajuste ? `Stock actual: ${ajuste.stock} · mínimo: ${ajuste.min}` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setAjuste(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Stock ajustado", `${ajuste.item} — el movimiento queda en el historial con motivo.`);
          setAjuste(null);
        }
      }, "Guardar ajuste"))
    }, ajuste && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Tipo de movimiento",
      options: ["Entrada (compra directa)", "Salida (consumo interno)", "Merma / deterioro", "Corrección de conteo"],
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Cantidad",
      inputMode: "numeric",
      placeholder: "0",
      required: true
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "Motivo",
      rows: 2,
      required: true,
      placeholder: "Obligatorio \u2014 queda en el historial",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: nuevo,
      onClose: () => setNuevo(false),
      title: "Nuevo art\xEDculo",
      icon: /*#__PURE__*/React.createElement(Ic.Box, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNuevo(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Artículo creado", "Si es de venta, ya aparece en Caja → Otros conceptos.");
          setNuevo(false);
        }
      }, "Crear"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre",
      required: true,
      placeholder: "Ej. Agenda escolar 2026",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Tipo",
      options: ["Venta", "Suministro"],
      placeholder: "Seleccione",
      required: true,
      hint: "Venta se ofrece en Caja"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Stock m\xEDnimo",
      inputMode: "numeric",
      placeholder: "0"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Precio de venta",
      prefix: "S/.",
      inputMode: "decimal",
      placeholder: "Solo si es de venta"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Stock inicial",
      inputMode: "numeric",
      placeholder: "0"
    }))));
  }

  /* ------------------------------ Compras ------------------------------ */
  function Compras() {
    const [nueva, setNueva] = React.useState(false);
    const data = COMPRAS.map(c => ({
      cod: c[0],
      fecha: c[1],
      prov: c[2],
      items: c[3],
      total: c[4],
      estado: c[5],
      gasto: c[6]
    }));
    const cols = [{
      key: "cod",
      header: "Orden",
      mono: true,
      width: 90
    }, {
      key: "fecha",
      header: "Fecha",
      mono: true,
      align: "center",
      width: 70
    }, {
      key: "prov",
      header: "Proveedor",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.items))
    }, {
      key: "total",
      header: "Total",
      num: true,
      mono: true,
      render: v => fmt(v)
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Recibido" ? "success" : "warning",
        dot: true
      }, v)
    }, {
      key: "gasto",
      header: "Gasto vinculado",
      align: "center",
      render: v => v ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "link",
        onClick: () => {
          goTo("tesoreria");
          notify("info", "Tesorería", `Abriendo el gasto ${v} en Gastos e ingresos.`);
        }
      }, v) : /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-caption)",
          color: "var(--text-subtle)"
        }
      }, "al recibir")
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => r.estado === "Pendiente" ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => notify("success", "Compra recibida", `${r.cod} · stock actualizado · gasto G-0219 creado en Tesorería (Materiales y útiles).`)
      }, "Recibir") : /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver detalle"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => notify("info", "Orden de compra", `${r.cod} · ${r.prov} · ${fmt(r.total)} · comprobante adjunto.`)
      }, /*#__PURE__*/React.createElement(Ic.Eye, null)))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Un solo registro, dos efectos"
    }, "Al marcar una compra como ", /*#__PURE__*/React.createElement("b", null, "recibida"), ", el stock del Almac\xE9n sube y el gasto se crea solo en ", /*#__PURE__*/React.createElement("b", null, "Gastos e ingresos"), " \u2014 nunca se digita dos veces."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por orden o proveedor\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Estado",
      options: ["Recibido", "Pendiente"],
      containerStyle: {
        width: 140
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNueva(true)
    }, "Nueva compra")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: data,
      hover: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: nueva,
      onClose: () => setNueva(false),
      size: "lg",
      title: "Nueva compra",
      icon: /*#__PURE__*/React.createElement(Ic.Box, null),
      description: "Orden de compra a proveedor \u2014 repone stock y genera el gasto",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNueva(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Compra OC-0045 registrada", "Al recibirla se actualizará el stock y se creará el gasto en Tesorería.");
          setNueva(false);
        }
      }, "Registrar compra"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Proveedor",
      required: true,
      placeholder: "Ej. Librer\xEDa San Marcos"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha",
      type: "date",
      defaultValue: "2026-07-07"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Art\xEDculo",
      options: ALMACEN.map(a => a[1]),
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Cantidad",
      inputMode: "numeric",
      placeholder: "0",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Costo unit.",
      prefix: "S/.",
      inputMode: "decimal",
      required: true
    })), /*#__PURE__*/React.createElement(Select, {
      label: "M\xE9todo de pago",
      options: ["Efectivo", "Transferencia", "Yape / Plin", "Crédito del proveedor"],
      defaultValue: "Transferencia"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "N\xB0 de comprobante",
      placeholder: "Factura / boleta"
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      style: {
        alignSelf: "flex-start"
      },
      onClick: () => notify("info", "Ítem agregado", "Puedes añadir varios artículos a la misma orden.")
    }, "Agregar otro art\xEDculo"), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Generar gasto en Tesorer\xEDa al recibir",
      description: "Categor\xEDa: Materiales y \xFAtiles \u2014 editable",
      defaultChecked: true,
      disabled: true
    }))));
  }

  /* ------------------------------ Activos ------------------------------ */
  function Activos() {
    const [ubic, setUbic] = React.useState("Todas");
    const [hist, setHist] = React.useState(null);
    const [averia, setAveria] = React.useState(null);
    const [alta, setAlta] = React.useState(false);
    const UBICS = ["Todas", "Laboratorio de cómputo", "Laboratorio de ciencias", "Aulas", "Secretaría", "Dirección"];
    const data = ACTIVOS.map(a => ({
      cod: a[0],
      activo: a[1],
      ubic: a[2],
      resp: a[3],
      estado: a[4],
      valor: a[5]
    })).filter(a => ubic === "Todas" || a.ubic === ubic);
    const cols = [{
      key: "cod",
      header: "Código",
      mono: true,
      width: 84
    }, {
      key: "activo",
      header: "Activo",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "ubic",
      header: "Ubicación",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v.startsWith("Laboratorio") ? "brand" : "neutral"
      }, v)
    }, {
      key: "resp",
      header: "Responsable",
      render: v => v === "—" ? /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-subtle)"
        }
      }, "\u2014") : /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 7
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "xs"
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-caption)"
        }
      }, v))
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Operativo" ? "success" : v === "En reparación" ? "warning" : "neutral",
        dot: true
      }, v)
    }, {
      key: "valor",
      header: "Valor",
      num: true,
      mono: true,
      render: v => fmt(v).replace(".00", "")
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Historial de mantenimiento"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Historial",
        size: "sm",
        onClick: () => setHist(r)
      }, /*#__PURE__*/React.createElement(Ic.Clock, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Reportar aver\xEDa"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Aver\xEDa",
        size: "sm",
        variant: "danger",
        onClick: () => setAveria(r)
      }, /*#__PURE__*/React.createElement(Ic.Settings, null))))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Activos registrados",
      value: "6",
      icon: /*#__PURE__*/React.createElement(Ic.Building, null),
      caption: "en 5 ubicaciones"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "En reparaci\xF3n",
      value: "1",
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Settings, null),
      caption: "impresora de Secretar\xEDa"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Valor total",
      value: "S/ 47,700",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      caption: "a valor de adquisici\xF3n"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Ubicaci\xF3n",
      options: UBICS,
      value: ubic,
      onChange: e => setUbic(e.target.value),
      containerStyle: {
        width: 220
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar activo\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("success", "Exportado", "Inventario de activos descargado en Excel.")
    }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setAlta(true)
    }, "Registrar activo")), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: ubic === "Todas" ? "Todos los activos" : ubic,
      subtitle: "Los laboratorios son vistas por ubicaci\xF3n de este mismo inventario"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: data,
      hover: true,
      zebra: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: alta,
      onClose: () => setAlta(false),
      size: "lg",
      title: "Registrar activo",
      icon: /*#__PURE__*/React.createElement(Ic.Building, null),
      description: "Equipos y mobiliario durable de la instituci\xF3n",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setAlta(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Activo registrado", "Ya aparece en el inventario de su ubicación con historial vacío.");
          setAlta(false);
        }
      }, "Registrar"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre del activo",
      required: true,
      placeholder: "Ej. Proyector Epson X49",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Ubicaci\xF3n",
      options: UBICS.filter(u => u !== "Todas"),
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Responsable",
      options: ["P. Gómez", "L. Díaz", "I. Quinto", "R. Meza", "L. Campos", "Sin asignar"],
      placeholder: "Seleccione"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Cantidad",
      inputMode: "numeric",
      defaultValue: "1",
      hint: "Para lotes (ej. 15 computadoras)"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Valor de adquisici\xF3n",
      prefix: "S/.",
      inputMode: "decimal",
      placeholder: "0.00",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de adquisici\xF3n",
      type: "date",
      defaultValue: "2026-07-07"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Origen",
      options: ["Compra (vincular orden)", "Donación", "Ya existía (inventario inicial)"],
      defaultValue: "Ya exist\xEDa (inventario inicial)",
      hint: "Si es compra, se enlaza a su gasto"
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "Descripci\xF3n / n\xFAmero de serie",
      rows: 2,
      placeholder: "Opcional",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!hist,
      onClose: () => setHist(null),
      size: "lg",
      title: hist ? `Historial · ${hist.activo}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Clock, null),
      description: hist ? `${hist.cod} · ${hist.ubic} · Responsable: ${hist.resp}` : "",
      footer: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setHist(null)
      }, "Cerrar")
    }, hist && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 4
      }
    }, (hist.cod === "AC-007" ? [["04/07/2026", "Reparación de rodillo de arrastre", "G-0218 · S/ 120.00"], ["12/03/2026", "Mantenimiento preventivo", "G-0141 · S/ 80.00"], ["15/08/2025", "Cambio de tóner y limpieza", "—"]] : [["10/02/2026", "Revisión de inicio de año — operativo", "—"]]).map(([f, d, g]) => /*#__PURE__*/React.createElement("div", {
      key: f + d,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 12px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-muted)",
        width: 78
      }
    }, f), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: "var(--type-label)",
        color: "var(--text-body)"
      }
    }, d), g !== "—" ? /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "link",
      onClick: () => {
        setHist(null);
        goTo("tesoreria");
        notify("info", "Tesorería", "Abriendo el gasto vinculado.");
      }
    }, g) : /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-subtle)"
      }
    }, "sin costo"))))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!averia,
      onClose: () => setAveria(null),
      title: averia ? `Reportar avería · ${averia.activo}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Settings, null),
      iconTone: "warning",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setAveria(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("warning", "Avería registrada", `${averia.activo} pasa a "En reparación"; el costo se vinculará como gasto de Mantenimiento.`);
          setAveria(null);
        }
      }, "Registrar"))
    }, averia && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Textarea, {
      label: "Descripci\xF3n de la aver\xEDa",
      rows: 2,
      required: true,
      placeholder: "Ej. no enciende, atasco recurrente\u2026"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Costo estimado",
      prefix: "S/.",
      inputMode: "decimal",
      placeholder: "Opcional"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Proveedor / t\xE9cnico",
      placeholder: "Opcional"
    })), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Generar gasto en Tesorer\xEDa al pagar la reparaci\xF3n",
      description: "Categor\xEDa: Mantenimiento y reparaciones \u2014 quedar\xE1 vinculado a este activo",
      defaultChecked: true
    }))));
  }

  /* ------------------------------ Biblioteca ------------------------------ */
  function Biblioteca() {
    const [prestar, setPrestar] = React.useState(false);
    const [nuevoTitulo, setNuevoTitulo] = React.useState(false);
    const catCols = [{
      key: "cod",
      header: "Código",
      mono: true,
      width: 80
    }, {
      key: "titulo",
      header: "Título",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "ej",
      header: "Ejemplares",
      align: "center",
      mono: true
    }, {
      key: "disp",
      header: "Disponibles",
      align: "center",
      render: (v, r) => /*#__PURE__*/React.createElement(Badge, {
        tone: v === 0 ? "danger" : v < r.ej ? "warning" : "success"
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        disabled: r.disp === 0,
        onClick: () => setPrestar(true)
      }, "Prestar")
    }];
    const preCols = [{
      key: "quien",
      header: "Prestatario",
      render: v => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "xs"
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "libro",
      header: "Libro"
    }, {
      key: "vence",
      header: "Devolución",
      mono: true,
      align: "center"
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Atrasado" ? "danger" : "info",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 6
        }
      }, r.estado === "Atrasado" && /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "ghost",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Send, null),
        onClick: () => notify("success", "Recordatorio enviado", `Aviso de devolución de "${r.libro}" enviado al apoderado por WhatsApp.`)
      }, "Recordar"), /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => notify("success", "Devolución registrada", `"${r.libro}" vuelve a estar disponible.`)
      }, "Devolver"))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por t\xEDtulo, autor o c\xF3digo\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNuevoTitulo(true)
    }, "Nuevo t\xEDtulo"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Book, null),
      onClick: () => setPrestar(true)
    }, "Registrar pr\xE9stamo")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Cat\xE1logo",
      subtitle: "35 ejemplares \xB7 4 t\xEDtulos"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: catCols,
      data: LIBROS.map(l => ({
        cod: l[0],
        titulo: l[1],
        ej: l[2],
        disp: l[3]
      })),
      hover: true
    })), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Pr\xE9stamos activos",
      subtitle: "1 atrasado \u2014 notifica al apoderado"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: preCols,
      data: PRESTAMOS.map(p => ({
        quien: p[0],
        libro: p[1],
        vence: p[2],
        estado: p[3]
      })),
      hover: true
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: prestar,
      onClose: () => setPrestar(false),
      title: "Registrar pr\xE9stamo",
      icon: /*#__PURE__*/React.createElement(Ic.Book, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setPrestar(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Préstamo registrado", "El ejemplar queda descontado de los disponibles.");
          setPrestar(false);
        }
      }, "Prestar"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Libro",
      options: LIBROS.filter(l => l[3] > 0).map(l => l[1]),
      placeholder: "Seleccione",
      required: true,
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Estudiante o docente",
      placeholder: "Buscar por nombre o c\xF3digo\u2026",
      required: true,
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de devoluci\xF3n",
      type: "date",
      defaultValue: "2026-07-14"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Duraci\xF3n",
      options: ["7 días", "14 días", "Fin del bimestre"],
      defaultValue: "7 d\xEDas"
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: nuevoTitulo,
      onClose: () => setNuevoTitulo(false),
      title: "Nuevo t\xEDtulo",
      icon: /*#__PURE__*/React.createElement(Ic.Book, null),
      description: "Alta de libro en el cat\xE1logo de la biblioteca",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNuevoTitulo(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Título agregado", "Ya está disponible para préstamos.");
          setNuevoTitulo(false);
        }
      }, "Agregar al cat\xE1logo"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "T\xEDtulo",
      required: true,
      placeholder: "Ej. Historia del Per\xFA \xB7 4\xB0",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Autor / editorial",
      placeholder: "Ej. Santillana"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "C\xF3digo",
      placeholder: "B-___",
      hint: "Se sugiere autom\xE1ticamente"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "N\xB0 de ejemplares",
      inputMode: "numeric",
      defaultValue: "1",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Categor\xEDa",
      options: ["Texto escolar", "Literatura", "Consulta / referencia", "Religión"],
      placeholder: "Seleccione"
    }))));
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_Inventory = function Inventory() {
    const [tab, setTab] = React.useState("almacen");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "almacen",
        label: "Almacén",
        count: 3
      }, {
        id: "compras",
        label: "Compras de almacén",
        count: 1
      }, {
        id: "activos",
        label: "Activos y laboratorios"
      }, {
        id: "biblioteca",
        label: "Biblioteca",
        count: 3
      }]
    }), tab === "almacen" && /*#__PURE__*/React.createElement(Almacen, null), tab === "compras" && /*#__PURE__*/React.createElement(Compras, null), tab === "activos" && /*#__PURE__*/React.createElement(Activos, null), tab === "biblioteca" && /*#__PURE__*/React.createElement(Biblioteca, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/InventoryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/LoginScreen.jsx
try { (() => {
/* Elohim SGE — Login screen. Registers window.SGE_Login. */
(function () {
  const {
    Input,
    Button,
    Checkbox,
    Alert,
    Dialog,
    Radio,
    RadioGroup
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  window.SGE_Login = function Login({
    onLogin
  }) {
    const [user, setUser] = React.useState("director");
    const [pass, setPass] = React.useState("••••••••");
    const [err, setErr] = React.useState(false);
    const [forgot, setForgot] = React.useState(false);
    const [sent, setSent] = React.useState(false);
    const [rol, setRol] = React.useState("admin");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100%",
        display: "grid",
        gridTemplateColumns: "1.1fr 1fr",
        background: "var(--surface-app)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 52px",
        color: "#fff",
        overflow: "hidden",
        background: "linear-gradient(155deg, var(--blue-700), var(--blue-900) 70%)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        opacity: 0.12,
        backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
        backgroundSize: "22px 22px"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/elohim-insignia.png",
      alt: "",
      style: {
        width: 56,
        height: 56,
        objectFit: "contain"
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-h3)",
        color: "#fff",
        letterSpacing: ".02em"
      }
    }, "Elohim SGE"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--blue-200)"
      }
    }, "Sistema de Gesti\xF3n Escolar"))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-display)",
        fontSize: "2.4rem",
        lineHeight: 1.15,
        color: "#fff",
        maxWidth: 420
      }
    }, "Educaci\xF3n cristoc\xE9ntrica, gesti\xF3n moderna."), /*#__PURE__*/React.createElement("p", {
      style: {
        font: "var(--type-body-md)",
        color: "var(--blue-100)",
        marginTop: 16,
        maxWidth: 400
      }
    }, "Matr\xEDcula, notas, asistencia y pensiones de la I.E.P. Elohim en un solo lugar.")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        font: "var(--type-caption)",
        color: "var(--blue-300)"
      }
    }, "Satipo, Jun\xEDn \xB7 A\xF1o acad\xE9mico 2026")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 360,
        display: "flex",
        flexDirection: "column",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 6
      }
    }, "Bienvenido de nuevo"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: "var(--type-h1)"
      }
    }, "Iniciar sesi\xF3n"), /*#__PURE__*/React.createElement("p", {
      style: {
        font: "var(--type-body)",
        color: "var(--text-muted)",
        marginTop: 6
      }
    }, "Ingresa tus credenciales para acceder al panel.")), err && /*#__PURE__*/React.createElement(Alert, {
      tone: "danger",
      title: "Credenciales inv\xE1lidas"
    }, "Verifica tu usuario y contrase\xF1a."), /*#__PURE__*/React.createElement("form", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      },
      onSubmit: e => {
        e.preventDefault();
        onLogin(rol);
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Usuario o correo",
      value: user,
      onChange: e => setUser(e.target.value),
      iconLeft: /*#__PURE__*/React.createElement(Ic.User, null),
      placeholder: "usuario"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Contrase\xF1a",
      type: "password",
      value: pass,
      onChange: e => setPass(e.target.value),
      iconLeft: /*#__PURE__*/React.createElement(Ic.Lock, null),
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: "Recordarme",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement("a", {
      href: "#",
      style: {
        font: "var(--type-label)"
      },
      onClick: e => {
        e.preventDefault();
        setSent(false);
        setForgot(true);
      }
    }, "\xBFOlvidaste tu contrase\xF1a?")), /*#__PURE__*/React.createElement("div", {
      style: {
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 8
      }
    }, "Demo \xB7 ingresar como"), /*#__PURE__*/React.createElement(RadioGroup, {
      name: "rol",
      value: rol,
      onChange: e => setRol(e.target.value),
      row: true
    }, /*#__PURE__*/React.createElement(Radio, {
      value: "admin",
      label: "Administrador"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "docente",
      label: "Docente"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "porteria",
      label: "Porter\xEDa"
    }))), /*#__PURE__*/React.createElement(Button, {
      type: "submit",
      variant: "primary",
      size: "lg",
      block: true
    }, "Entrar al sistema")), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-subtle)",
        textAlign: "center"
      }
    }, "\xBFProblemas para ingresar? Contacta a Secretar\xEDa \xB7 (064) 545-210"))), /*#__PURE__*/React.createElement(Dialog, {
      open: forgot,
      onClose: () => setForgot(false),
      title: "Recuperar contrase\xF1a",
      icon: /*#__PURE__*/React.createElement(Ic.Lock, null),
      description: "Te enviaremos un enlace para restablecerla",
      footer: sent ? /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        onClick: () => setForgot(false)
      }, "Entendido") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setForgot(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Mail, null),
        onClick: () => setSent(true)
      }, "Enviar enlace"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, sent ? /*#__PURE__*/React.createElement(Alert, {
      tone: "success",
      title: "Enlace enviado"
    }, "Revisa tu correo institucional. El enlace vence en 30 minutos.") : /*#__PURE__*/React.createElement(Input, {
      label: "Correo o usuario",
      placeholder: "usuario@elohim.edu.pe",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Mail, null),
      autoFocus: true
    }))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/PaymentsScreen.jsx
try { (() => {
/* Elohim SGE — Pensiones / Pagos. Registers window.SGE_Payments. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    StatCard,
    Tabs,
    Tag,
    Dialog,
    Input,
    Select,
    Alert,
    Tooltip
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const ROWS = [["María Quispe Roca", "3° A", "Pensión Junio", "30/06", "280.00", "Pagado", "var(--blue-500)"], ["José Ramos Lía", "5° B", "Pensión Junio", "30/06", "280.00", "Pendiente", "var(--gold-500)"], ["Ana Flores Mendoza", "1° A Sec", "Pensión Mayo", "30/05", "310.00", "Vencido", "var(--green-500)"], ["Luis Paz Cárdenas", "4° A", "Pensión Junio", "30/06", "280.00", "Pagado", "var(--brown-400)"], ["Rosa Lima Vega", "2° B", "Pensión Junio (Beca 50%)", "30/06", "140.00", "Pagado", "var(--blue-400)"], ["Hugo Vela Soto", "6° A", "Pensión Abril+Mayo", "30/05", "560.00", "Vencido", "var(--blue-600)"]];
  const COMPROMISOS = [{
    id: "CP-007",
    fam: "Fam. Vela Soto",
    deuda: 560,
    cuotas: "2 de S/ 280 · 15/07 y 15/08",
    avance: 0,
    estado: "Vigente",
    color: "var(--blue-600)"
  }, {
    id: "CP-006",
    fam: "Fam. Ñahui Cruz",
    deuda: 930,
    cuotas: "3 de S/ 310 · jul–sep",
    avance: 1,
    estado: "Propuesto",
    color: "var(--brown-400)"
  }, {
    id: "CP-005",
    fam: "Fam. Flores Mendoza",
    deuda: 620,
    cuotas: "2 de S/ 310 · may–jun",
    avance: 2,
    estado: "Cumplido",
    color: "var(--green-500)"
  }, {
    id: "CP-004",
    fam: "Fam. Torres Inga",
    deuda: 840,
    cuotas: "3 de S/ 280 · abr–jun",
    avance: 1,
    estado: "Incumplido",
    color: "var(--gold-600)"
  }];
  function Compromisos() {
    const [rows, setRows] = React.useState(COMPROMISOS);
    const [nuevo, setNuevo] = React.useState(false);
    const upd = (id, estado) => setRows(rs => rs.map(x => x.id === id ? {
      ...x,
      estado
    } : x));
    const tone = e => e === "Cumplido" ? "success" : e === "Vigente" ? "info" : e === "Propuesto" ? "warning" : "danger";
    const cols = [{
      key: "id",
      header: "N°",
      mono: true,
      width: 76
    }, {
      key: "fam",
      header: "Familia",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v.replace("Fam. ", ""),
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "deuda",
      header: "Deuda refinanciada",
      num: true,
      mono: true,
      render: v => `S/ ${v.toFixed(2)}`
    }, {
      key: "cuotas",
      header: "Plan",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", null, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.avance, " cuota(s) pagada(s)"))
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: tone(v),
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => r.estado === "Propuesto" ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          upd(r.id, "Vigente");
          notify("success", "Compromiso aprobado", `${r.id} · ${r.fam} — mora y recordatorios congelados mientras cumpla.`);
        }
      }, "Aprobar") : r.estado === "Vigente" ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "accent",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Cash, null),
        onClick: () => notify("success", "Cuota del compromiso cobrada", `${r.fam} — se registró en Caja y avanza el plan.`)
      }, "Cobrar cuota") : r.estado === "Incumplido" ? /*#__PURE__*/React.createElement(Tooltip, {
        content: "Mora y recordatorios reactivados"
      }, /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "ghost",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Send, null),
        onClick: () => notify("warning", "Recordatorio enviado", `${r.fam} — compromiso incumplido; la deuda original sigue vigente con mora.`)
      }, "Recordar")) : /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver historial"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => notify("info", r.id, `${r.fam} · plan completado · deuda saldada.`)
      }, /*#__PURE__*/React.createElement(Ic.Eye, null)))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: 16
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "C\xF3mo funciona"
    }, "Secretar\xEDa ", /*#__PURE__*/React.createElement("b", null, "propone"), " el plan y el Administrador lo ", /*#__PURE__*/React.createElement("b", null, "aprueba"), ". Mientras el compromiso est\xE9 al d\xEDa, la ", /*#__PURE__*/React.createElement("b", null, "mora y los recordatorios se congelan"), "; si incumple una cuota, se reactivan sobre la deuda original."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNuevo(true)
    }, "Proponer compromiso")), /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true
    }), /*#__PURE__*/React.createElement(Dialog, {
      open: nuevo,
      onClose: () => setNuevo(false),
      size: "lg",
      title: "Proponer compromiso de pago",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      description: "Refinancia deuda vencida en cuotas \u2014 requiere aprobaci\xF3n del Administrador",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNuevo(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setNuevo(false);
          notify("success", "Compromiso propuesto", "Quedará pendiente de aprobación del Administrador.");
        }
      }, "Proponer"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Familia / apoderado",
      required: true,
      placeholder: "Buscar\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null),
      containerStyle: {
        gridColumn: "1 / -1"
      },
      hint: "Se listar\xE1 su deuda vencida consolidada"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Deuda a refinanciar",
      prefix: "S/.",
      defaultValue: "560.00",
      hint: "Total o parcial"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "N\xB0 de cuotas",
      options: ["2", "3", "4", "6"],
      defaultValue: "2"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Primera cuota",
      type: "date",
      defaultValue: "2026-07-15"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Frecuencia",
      options: ["Mensual", "Quincenal"],
      defaultValue: "Mensual"
    }), /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      style: {
        gridColumn: "1 / -1"
      }
    }, "Mientras est\xE9 vigente y al d\xEDa: sin mora nueva ni recordatorios de la deuda original. El incumplimiento de una cuota lo marca ", /*#__PURE__*/React.createElement("b", null, "Incumplido"), " y reactiva todo."))));
  }
  window.SGE_Payments = function Payments() {
    const [tab, setTab] = React.useState("todos");
    const [open, setOpen] = React.useState(false);
    const [target, setTarget] = React.useState(null);
    const [gen, setGen] = React.useState(false);
    const cols = [{
      key: "est",
      header: "Estudiante",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.grado)))
    }, {
      key: "concepto",
      header: "Concepto"
    }, {
      key: "venc",
      header: "Vence",
      mono: true,
      align: "center"
    }, {
      key: "monto",
      header: "Monto",
      num: true,
      mono: true,
      render: v => `S/ ${v}`
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Pagado" ? "success" : v === "Pendiente" ? "warning" : "danger",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => r.estado === "Pagado" ? /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver recibo"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Recibo",
        size: "sm",
        onClick: () => notify("info", "Recibo descargado", `${r.est} · ${r.concepto} · S/ ${r.monto}.`)
      }, /*#__PURE__*/React.createElement(Ic.Download, null))) : /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "primary",
        onClick: () => {
          setTarget(r);
          setOpen(true);
        }
      }, "Registrar pago")
    }];
    const rows = ROWS.map(r => ({
      est: r[0],
      grado: r[1],
      concepto: r[2],
      venc: r[3],
      monto: r[4],
      estado: r[5],
      color: r[6]
    })).filter(r => tab === "todos" || tab === "pend" && r.estado !== "Pagado" || tab === "pag" && r.estado === "Pagado");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Cobrado \xB7 Junio",
      value: "S/ 84,320",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      delta: 6.1,
      caption: "del mes"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Por cobrar",
      value: "S/ 11,680",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Clock, null),
      caption: "42 cuotas"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Vencido",
      value: "S/ 6,420",
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Chart, null),
      delta: 1.3,
      deltaDirection: "up",
      caption: "18 cuotas"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Pago en l\xEDnea",
      value: "61%",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      delta: 9.0,
      caption: "de los pagos"
    })), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Pensiones \xB7 Junio 2026",
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        size: "sm",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
        onClick: () => notify("success", "Exportado", "Pensiones de Junio 2026 descargadas en Excel.")
      }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        size: "sm",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
        onClick: () => setGen(true)
      }, "Generar cuotas"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 16px",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "todos",
        label: "Todas",
        count: 6
      }, {
        id: "pend",
        label: "Pendientes",
        count: 3
      }, {
        id: "pag",
        label: "Pagadas",
        count: 3
      }, {
        id: "comp",
        label: "Compromisos",
        count: 2
      }]
    })), tab === "comp" ? /*#__PURE__*/React.createElement(Compromisos, null) : /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: () => setOpen(false),
      title: "Registrar pago de pensi\xF3n",
      description: target ? `${target.est} · ${target.concepto}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      iconTone: "success",
      size: "md",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setOpen(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setOpen(false);
          notify("success", "Pago registrado", target ? `${target.est} · S/ ${target.monto} · recibo enviado al apoderado.` : "");
        }
      }, "Confirmar pago"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "El recibo se enviar\xE1 al apoderado por correo y WhatsApp."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Monto",
      prefix: "S/.",
      defaultValue: target ? target.monto : ""
    }), /*#__PURE__*/React.createElement(Select, {
      label: "M\xE9todo",
      options: ["Efectivo", "Yape / Plin", "Transferencia", "Tarjeta"],
      defaultValue: "Yape / Plin"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de pago",
      type: "date",
      defaultValue: "2026-06-30"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "N\xB0 de operaci\xF3n",
      placeholder: "Opcional"
    })))), /*#__PURE__*/React.createElement(Dialog, {
      open: gen,
      onClose: () => setGen(false),
      title: "Generar cuotas del mes",
      icon: /*#__PURE__*/React.createElement(Ic.Plus, null),
      description: "Crea la cuota de pensi\xF3n de cada estudiante activo seg\xFAn el tarifario",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setGen(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setGen(false);
          notify("success", "Cuotas generadas", "482 cuotas de Julio 2026 creadas · vencen el 31/07.");
        }
      }, "Generar 482 cuotas"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Mes",
      options: ["Julio 2026", "Agosto 2026"],
      defaultValue: "Julio 2026"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de vencimiento",
      type: "date",
      defaultValue: "2026-07-31"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Alcance",
      options: ["Todos los niveles", "Solo Inicial", "Solo Primaria", "Solo Secundaria"],
      defaultValue: "Todos los niveles",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    })), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Se generar\xE1n 482 cuotas"
    }, "Con el tarifario vigente y los descuentos/becas de cada estudiante ya aplicados. Los programas complementarios generan su cuota aparte."))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/PaymentsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/ReportsScreen.jsx
try { (() => {
/* Elohim SGE — Reportes. Registers window.SGE_Reports. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Button,
    Select,
    Input,
    ProgressBar
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const REPORTES = [{
    t: "Morosidad por grado",
    d: "Cuotas vencidas y deuda acumulada por nivel, grado y sección",
    icon: "Chart",
    tone: "danger"
  }, {
    t: "Ingresos por concepto",
    d: "Pensiones, matrículas, programas y otros ingresos por periodo",
    icon: "Cash",
    tone: "success"
  }, {
    t: "Padrón de estudiantes",
    d: "Lista completa con apoderados, contacto y estado de matrícula",
    icon: "Users",
    tone: "brand"
  }, {
    t: "Asistencia mensual",
    d: "Estudiantes y personal: faltas, tardanzas y justificaciones",
    icon: "Calendar",
    tone: "accent"
  }, {
    t: "Planilla anual",
    d: "Sueldos, descuentos y aportes por empleado, mes a mes",
    icon: "Building",
    tone: "brand"
  }, {
    t: "Caja diaria",
    d: "Cobros por método y cobrador, arqueos y anulaciones",
    icon: "Receipt",
    tone: "success"
  }];
  const TONE_BG = {
    danger: "var(--danger-soft)",
    success: "var(--success-soft)",
    brand: "var(--surface-brand-soft)",
    accent: "var(--surface-accent-soft)"
  };
  const TONE_FG = {
    danger: "var(--danger)",
    success: "var(--success)",
    brand: "var(--brand)",
    accent: "var(--gold-600)"
  };
  const MOROSIDAD = [["Inicial", 62, 4, 640.0], ["1°–2° Primaria", 96, 7, 1420.0], ["3°–4° Primaria", 108, 9, 2130.0], ["5°–6° Primaria", 87, 6, 1300.0], ["Secundaria", 129, 11, 3050.0]];
  window.SGE_Reports = function Reports() {
    const cols = [{
      key: "grupo",
      header: "Nivel / grado",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "est",
      header: "Estudiantes",
      align: "center",
      mono: true
    }, {
      key: "deudores",
      header: "Con deuda",
      align: "center",
      render: (v, r) => /*#__PURE__*/React.createElement(Badge, {
        tone: v / r.est > 0.08 ? "danger" : "warning",
        dot: true
      }, v)
    }, {
      key: "pct",
      header: "% morosidad",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 140
        }
      }, /*#__PURE__*/React.createElement(ProgressBar, {
        value: r.deudores / r.est * 100,
        max: 15,
        size: "sm",
        tone: "danger",
        showValue: true,
        valueFormat: () => `${(r.deudores / r.est * 100).toFixed(1)}%`
      }))
    }, {
      key: "monto",
      header: "Deuda",
      num: true,
      mono: true,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: "var(--danger)"
        }
      }, "S/ ", v.toLocaleString("es-PE", {
        minimumFractionDigits: 2
      }))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14
      }
    }, REPORTES.map(r => /*#__PURE__*/React.createElement(Card, {
      key: r.t,
      interactive: true,
      onClick: () => notify("success", "Reporte generado", `"${r.t}" descargado en Excel.`)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        borderRadius: "var(--radius-md)",
        background: TONE_BG[r.tone],
        color: TONE_FG[r.tone],
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        flexShrink: 0
      }
    }, React.createElement(Ic[r.icon])), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, r.t), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, r.d)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Periodo",
      options: ["Julio 2026", "Junio 2026", "Bimestre II", "Año 2026"],
      defaultValue: "Julio 2026",
      containerStyle: {
        width: 170
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("success", "Exportado", "Morosidad por grado · Julio 2026 · Excel.")
    }, "Exportar vista")), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Vista previa \xB7 Morosidad por grado",
      subtitle: "Julio 2026 \xB7 S/ 8,540 en 37 cuotas vencidas"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: MOROSIDAD.map(m => ({
        grupo: m[0],
        est: m[1],
        deudores: m[2],
        monto: m[3]
      })),
      hover: true
    })));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/ReportsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/ScheduleScreen.jsx
try { (() => {
/* Elohim SGE — Horarios y asignación docente. Registers window.SGE_Schedule. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Select,
    Tabs,
    Tooltip,
    Dialog,
    Alert
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const BLOQUES = ["7:45–8:30", "8:30–9:15", "9:15–10:00", "Recreo", "10:20–11:05", "11:05–11:50", "11:50–12:35"];
  const CURSO_COLOR = {
    "Matemática": "var(--chart-1)",
    "Comunicación": "var(--chart-2)",
    "C. y T.": "var(--chart-3)",
    "P. Social": "var(--chart-4)",
    "Inglés": "var(--chart-5)",
    "Ed. Física": "var(--chart-6)",
    "Arte": "var(--gold-600)",
    "Religión": "var(--brown-500)"
  };
  // horario de 3° A — [curso, docente] por [bloque][día]
  const H = [[["Matemática", "P. Gómez"], ["Matemática", "P. Gómez"], ["Comunicación", "L. Díaz"], ["Matemática", "P. Gómez"], ["Ed. Física", "S. Ramos"]], [["Matemática", "P. Gómez"], ["Comunicación", "L. Díaz"], ["Comunicación", "L. Díaz"], ["Matemática", "P. Gómez"], ["Ed. Física", "S. Ramos"]], [["Comunicación", "L. Díaz"], ["C. y T.", "R. Meza"], ["Inglés", "I. Quinto"], ["P. Social", "A. Torres"], ["Arte", "N. Paz"]], null, [["Inglés", "I. Quinto"], ["C. y T.", "R. Meza"], ["Matemática", "P. Gómez"], ["Religión", "D. Cano"], ["Arte", "N. Paz"]], [["P. Social", "A. Torres"], ["Religión", "D. Cano"], ["C. y T.", "R. Meza"], ["Comunicación", "L. Díaz"], ["P. Social", "A. Torres"]], [["Comunicación", "L. Díaz"], ["Matemática", "P. Gómez"], ["Ed. Física", "S. Ramos"], ["Inglés", "I. Quinto"], ["Matemática", "P. Gómez"]]];
  function Horario() {
    const [cell, setCell] = React.useState(null); // {dia, bloque, curso, doc}
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Secci\xF3n",
      options: ["3° A Primaria", "3° B Primaria", "4° A Primaria"],
      defaultValue: "3\xB0 A Primaria",
      containerStyle: {
        width: 190
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Copy, null),
      onClick: () => notify("success", "Horario copiado", "3° A → 3° B · ajusta los cambios y guarda.")
    }, "Copiar de otra secci\xF3n"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Printer, null),
      onClick: () => notify("info", "Imprimiendo", "Horario de 3° A Primaria enviado a la impresora.")
    }, "Imprimir")), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "3\xB0 A Primaria \xB7 Turno ma\xF1ana",
      subtitle: "Haz clic en una celda para reasignar curso o docente"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "92px repeat(5, 1fr)",
        minWidth: 720
      }
    }, /*#__PURE__*/React.createElement("div", null), DIAS.map(d => /*#__PURE__*/React.createElement("div", {
      key: d,
      style: {
        padding: "9px 10px",
        font: "var(--type-caption)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-caps)",
        color: "var(--text-muted)",
        textAlign: "center",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, d)), BLOQUES.map((b, bi) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: b
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 10px",
        font: "var(--type-2xs)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-muted)",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center"
      }
    }, b), b === "Recreo" ? /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "span 5",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-sunken)",
        textAlign: "center",
        padding: "7px",
        font: "var(--type-2xs)",
        color: "var(--text-subtle)",
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-caps)"
      }
    }, "Recreo") : DIAS.map((d, di) => {
      const c = H[bi][di];
      const color = CURSO_COLOR[c[0]] || "var(--brand)";
      return /*#__PURE__*/React.createElement("div", {
        key: d,
        onClick: () => setCell({
          dia: d,
          bloque: b,
          curso: c[0],
          doc: c[1]
        }),
        style: {
          borderTop: "1px solid var(--border-subtle)",
          borderLeft: "1px solid var(--border-subtle)",
          padding: "7px 9px",
          cursor: "pointer",
          background: "var(--surface-card)"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 4,
          height: 22,
          borderRadius: 2,
          background: color,
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          font: "var(--type-2xs)",
          fontWeight: 600,
          color: "var(--text-strong)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, c[0]), /*#__PURE__*/React.createElement("div", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, c[1]))));
    })))))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!cell,
      onClose: () => setCell(null),
      title: "Reasignar bloque",
      icon: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      description: cell ? `${cell.dia} · ${cell.bloque} · 3° A Primaria` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setCell(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Bloque actualizado", `${cell.dia} ${cell.bloque} · guardado.`);
          setCell(null);
        }
      }, "Guardar"))
    }, cell && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Curso",
      options: Object.keys(CURSO_COLOR),
      defaultValue: cell.curso
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Docente",
      options: ["P. Gómez", "L. Díaz", "R. Meza", "I. Quinto", "A. Torres", "S. Ramos", "N. Paz", "D. Cano"],
      defaultValue: cell.doc
    }), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      style: {
        gridColumn: "1 / -1"
      }
    }, "Se valida que el docente no tenga otra clase en el mismo bloque."))));
  }
  function Asignacion() {
    const [edit, setEdit] = React.useState(null);
    const DATA = [["Pedro Gómez Silva", "Matemática", "3° A · 3° B · 4° A", 18, "var(--blue-500)"], ["Lucía Díaz Rojas", "Comunicación", "3° A · 3° B", 14, "var(--gold-500)"], ["Raúl Meza Campos", "Ciencia y Tecnología", "3° A · 4° A · 5° A", 12, "var(--green-500)"], ["Iris Quinto Vega", "Inglés", "3° A · 3° B · 4° A · 5° A", 12, "var(--brown-400)"], ["Saúl Ramos Cruz", "Educación Física", "Toda Primaria", 10, "var(--blue-400)"]];
    const cols = [{
      key: "doc",
      header: "Docente",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "curso",
      header: "Curso",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: "brand"
      }, v)
    }, {
      key: "secc",
      header: "Secciones"
    }, {
      key: "horas",
      header: "Horas/sem",
      align: "center",
      mono: true
    }, {
      key: "carga",
      header: "Carga",
      align: "center",
      render: (_, r) => /*#__PURE__*/React.createElement(Badge, {
        tone: r.horas >= 16 ? "warning" : "success",
        dot: true
      }, r.horas >= 16 ? "Alta" : "Normal")
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar asignaci\xF3n"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setEdit(r)
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null)))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "La asignaci\xF3n parte del ", /*#__PURE__*/React.createElement("b", null, "plan de estudios"), " (Estructura acad\xE9mica) y alimenta el horario y el portal del docente."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setEdit({})
    }, "Nueva asignaci\xF3n")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: DATA.map(d => ({
        doc: d[0],
        curso: d[1],
        secc: d[2],
        horas: d[3],
        color: d[4]
      })),
      hover: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: !!edit,
      onClose: () => setEdit(null),
      title: edit && edit.doc ? `Asignación · ${edit.doc}` : "Nueva asignación",
      icon: /*#__PURE__*/React.createElement(Ic.Teacher, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setEdit(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", edit.doc ? "Asignación actualizada" : "Asignación creada", "El horario y el portal del docente quedaron sincronizados.");
          setEdit(null);
        }
      }, "Guardar"))
    }, edit && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Docente",
      options: ["Pedro Gómez Silva", "Lucía Díaz Rojas", "Raúl Meza Campos", "Iris Quinto Vega"],
      defaultValue: edit.doc,
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Curso",
      options: ["Matemática", "Comunicación", "Ciencia y Tecnología", "Inglés"],
      defaultValue: edit.curso,
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Secciones",
      options: ["3° A Primaria", "3° B Primaria", "4° A Primaria"],
      placeholder: "Seleccione",
      hint: "Se a\xF1aden de una en una",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }))));
  }
  window.SGE_Schedule = function Schedule() {
    const [tab, setTab] = React.useState("horario");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "horario",
        label: "Horario por sección"
      }, {
        id: "asignacion",
        label: "Asignación docente",
        count: 5
      }]
    }), tab === "horario" ? /*#__PURE__*/React.createElement(Horario, null) : /*#__PURE__*/React.createElement(Asignacion, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/ScheduleScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/SettingsScreen.jsx
try { (() => {
/* Elohim SGE — Configuración institucional. Registers window.SGE_Settings. */
(function () {
  const {
    Card,
    Button,
    Input,
    Select,
    Textarea,
    Switch,
    Avatar,
    Badge,
    Alert,
    Table,
    IconButton,
    Tooltip,
    Tabs,
    Dialog,
    Checkbox
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  function Institucion() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1.6fr",
        gap: 18,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      title: "Identidad"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/elohim-insignia.png",
      alt: "Insignia",
      style: {
        width: 120,
        height: 120,
        objectFit: "contain"
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("info", "Cambiar insignia", "Se abriría el selector de archivo (PNG/SVG, mín. 512px).")
    }, "Cambiar insignia"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "PNG o SVG \xB7 fondo transparente \xB7 m\xEDn. 512px"))), /*#__PURE__*/React.createElement(Card, {
      title: "Datos de la instituci\xF3n"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre",
      defaultValue: "I.E.P. Elohim \u2014 Colegio Cristoc\xE9ntrico",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "C\xF3digo modular",
      defaultValue: "1698340",
      hint: "Asignado por MINEDU"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "RUC",
      defaultValue: "20601234567"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Direcci\xF3n",
      defaultValue: "Jr. Francisco Irazola 590, Satipo",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Tel\xE9fono",
      defaultValue: "(064) 545-210"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Correo",
      type: "email",
      defaultValue: "informes@elohim.edu.pe"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Regi\xF3n",
      options: ["Junín"],
      defaultValue: "Jun\xEDn"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "UGEL",
      options: ["UGEL Satipo"],
      defaultValue: "UGEL Satipo"
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "Lema",
      rows: 2,
      defaultValue: "Educaci\xF3n cristoc\xE9ntrica, gesti\xF3n moderna.",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: 16
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => notify("success", "Datos guardados", "La información institucional se actualizó correctamente.")
    }, "Guardar cambios"))));
  }
  function Notificaciones() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 760
      }
    }, /*#__PURE__*/React.createElement(Card, {
      title: "Recordatorios de pago a apoderados",
      subtitle: "Se env\xEDan al contacto principal de cada familia"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, [["3 días antes del vencimiento", true], ["El día del vencimiento", true], ["Al registrarse la mora", true], ["Resumen semanal de deuda", false]].map(([l, on]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-body)",
        color: "var(--text-body)"
      }
    }, l), /*#__PURE__*/React.createElement(Switch, {
      defaultChecked: on
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 14,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Canal principal",
      options: ["WhatsApp", "SMS", "Correo"],
      defaultValue: "WhatsApp"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Canal secundario",
      options: ["Correo", "SMS", "Ninguno"],
      defaultValue: "Correo"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Send, null),
      onClick: () => notify("success", "Mensaje de prueba enviado", "Revisa el WhatsApp del número de la institución.")
    }, "Enviar mensaje de prueba")))), /*#__PURE__*/React.createElement(Card, {
      title: "Otros avisos"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, [["Confirmación de pago (recibo digital)", true], ["Confirmación de matrícula", true], ["Inasistencia del estudiante", false]].map(([l, on]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-body)",
        color: "var(--text-body)"
      }
    }, l), /*#__PURE__*/React.createElement(Switch, {
      defaultChecked: on
    }))))));
  }

  /* ------------------------------ Evaluación (criterios) ------------------------------ */
  function Evaluacion() {
    const [dlg, setDlg] = React.useState(null); // {tipo: "est"|"apo"}
    const EST = [["Comportamiento", "Todos los niveles", true], ["Uniformidad", "Todos los niveles", true], ["Puntualidad", "Todos los niveles", true], ["Orden e higiene", "Inicial y Primaria", false]];
    const APO = [["Asiste a reuniones", "Todos los niveles", true], ["Acompañamiento en casa", "Todos los niveles", true], ["Comunicación con el tutor", "Todos los niveles", true], ["Puntualidad en el recojo", "Inicial", false]];
    const Fila = ({
      nombre,
      ambito,
      on
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 12px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, nombre), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-muted)"
      }
    }, ambito)), /*#__PURE__*/React.createElement(Tooltip, {
      content: "Editar"
    }, /*#__PURE__*/React.createElement(IconButton, {
      label: "Editar",
      size: "sm",
      onClick: () => notify("info", "Editar criterio", `“${nombre}” — nombre, ámbito y estado.`)
    }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), /*#__PURE__*/React.createElement(Switch, {
      defaultChecked: on,
      "aria-label": `Activar ${nombre}`
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 760
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Escala literal AD \xB7 A \xB7 B \xB7 C (est\xE1ndar MINEDU)"
    }, "Estos criterios aparecen autom\xE1ticamente en la ", /*#__PURE__*/React.createElement("b", null, "libreta"), " de cada bimestre. Los del estudiante los califica el tutor del aula; los del apoderado tambi\xE9n los registra el tutor."), /*#__PURE__*/React.createElement(Card, {
      title: "Aspectos formativos del estudiante",
      subtitle: "Comportamiento, uniformidad y otros \u2014 se califican por bimestre",
      actions: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
        onClick: () => setDlg({
          tipo: "est"
        })
      }, "Agregar")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, EST.map(x => /*#__PURE__*/React.createElement(Fila, {
      key: x[0],
      nombre: x[0],
      ambito: x[1],
      on: x[2]
    })))), /*#__PURE__*/React.createElement(Card, {
      title: "Evaluaci\xF3n del apoderado",
      subtitle: "La registra el tutor \u2014 compromiso de la familia con el estudiante",
      actions: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
        onClick: () => setDlg({
          tipo: "apo"
        })
      }, "Agregar")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, APO.map(x => /*#__PURE__*/React.createElement(Fila, {
      key: x[0],
      nombre: x[0],
      ambito: x[1],
      on: x[2]
    })))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!dlg,
      onClose: () => setDlg(null),
      title: dlg && dlg.tipo === "apo" ? "Nuevo criterio del apoderado" : "Nuevo aspecto formativo",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setDlg(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Criterio creado", "Aparecerá en las libretas desde el bimestre en curso.");
          setDlg(null);
        }
      }, "Crear"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre",
      required: true,
      placeholder: dlg && dlg.tipo === "apo" ? "Ej. Responde los comunicados" : "Ej. Respeto a los símbolos",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Aplica a",
      options: ["Todos los niveles", "Inicial", "Primaria", "Secundaria", "Inicial y Primaria"],
      defaultValue: "Todos los niveles"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Escala",
      defaultValue: "AD / A / B / C",
      disabled: true,
      hint: "Fija \u2014 est\xE1ndar MINEDU"
    }))));
  }

  /* ------------------------------ Planilla (régimen) ------------------------------ */
  function PlanillaCfg() {
    const AFPS = [["AFP Integra", "10.00", "1.55", "1.84"], ["AFP Prima", "10.00", "1.60", "1.84"], ["AFP Profuturo", "10.00", "1.69", "1.84"], ["AFP Habitat", "10.00", "1.47", "1.84"]];
    const cols = [{
      key: "afp",
      header: "AFP",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "fondo",
      header: "Fondo %",
      align: "center",
      mono: true,
      render: v => `${v}%`
    }, {
      key: "com",
      header: "Comisión %",
      align: "center",
      mono: true,
      render: v => `${v}%`
    }, {
      key: "seg",
      header: "Seguro %",
      align: "center",
      mono: true,
      render: v => `${v}%`
    }, {
      key: "total",
      header: "Total empleado",
      align: "center",
      mono: true,
      render: (_, r) => /*#__PURE__*/React.createElement(Badge, {
        tone: "brand"
      }, (parseFloat(r.fondo) + parseFloat(r.com) + parseFloat(r.seg)).toFixed(2), "%")
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar porcentajes"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => notify("info", r.afp, "Edición de % de fondo, comisión y seguro — se actualizan cuando la SBS publica nuevas tasas.")
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null)))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 820
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "R\xE9gimen pensionario por empleado"
    }, "Cada empleado elige ", /*#__PURE__*/React.createElement("b", null, "AFP u ONP"), " en su ficha. La planilla calcula el descuento seg\xFAn este cat\xE1logo; el empleador aporta ", /*#__PURE__*/React.createElement("b", null, "EsSalud 9%"), " aparte (no se descuenta al trabajador)."), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Cat\xE1logo de AFPs",
      subtitle: "Porcentajes editables \u2014 comisi\xF3n sobre flujo",
      actions: /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral"
      }, "ONP: 13% \xFAnico")
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: AFPS.map(a => ({
        afp: a[0],
        fondo: a[1],
        com: a[2],
        seg: a[3]
      }))
    })), /*#__PURE__*/React.createElement(Card, {
      title: "Beneficios del r\xE9gimen privado"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, [["Gratificaciones (Julio y Diciembre)", "Un sueldo adicional + bono 9% EsSalud", true], ["CTS (Mayo y Noviembre)", "Medio sueldo por semestre, depositado en banco", true], ["Asignación familiar (10% RMV)", "S/ 113.00 a quienes tienen hijos menores", true]].map(([l, d, on]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, l), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, d)), /*#__PURE__*/React.createElement(Switch, {
      defaultChecked: on
    }))), /*#__PURE__*/React.createElement(Alert, {
      tone: "warning"
    }, "En Julio y Diciembre la planilla incluir\xE1 autom\xE1ticamente la columna de gratificaci\xF3n; en Mayo y Noviembre, el dep\xF3sito de CTS."))));
  }
  function Usuarios() {
    const [dlg, setDlg] = React.useState(null); // {u?} nuevo o editar
    const USERS = [["Dir. Pérez Huamán", "Administrador", "Acceso total", "Activo", "var(--gold-500)"], ["Liliana Campos Paz", "Secretaría / Caja", "Matrícula, cobros, apoderados", "Activo", "var(--brown-400)"], ["Pedro Gómez Silva", "Docente", "Sus aulas: asistencia y notas", "Activo", "var(--blue-500)"], ["Fidel Huamán Soto", "Portería", "Solo marcación de ingreso/salida del personal", "Activo", "var(--green-500)"], ["Cuenta Apoderado", "Apoderado", "Portal: estado de cuenta y pagos en línea", "Próximamente", "var(--neutral-500)"]];
    const cols = [{
      key: "nombre",
      header: "Usuario",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "rol",
      header: "Rol",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Administrador" ? "accent" : v === "Docente" ? "brand" : v === "Portería" ? "success" : v === "Apoderado" ? "neutral" : "info"
      }, v)
    }, {
      key: "alcance",
      header: "Alcance"
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Activo" ? "success" : "neutral",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar permisos"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setDlg({
          u: r
        })
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null)))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Roles del sistema"
    }, "El Administrador todo lo puede. Secretar\xEDa opera matr\xEDcula y caja; los docentes ven solo sus aulas; Porter\xEDa solo marca ingreso/salida del personal; el portal del apoderado llegar\xE1 en una fase posterior."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setDlg({})
    }, "Nuevo usuario")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: USERS.map(u => ({
        nombre: u[0],
        rol: u[1],
        alcance: u[2],
        estado: u[3],
        color: u[4]
      })),
      hover: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: !!dlg,
      onClose: () => setDlg(null),
      size: "lg",
      title: dlg && dlg.u ? `Permisos · ${dlg.u.nombre}` : "Nuevo usuario",
      icon: /*#__PURE__*/React.createElement(Ic.Lock, null),
      description: "El rol define el alcance base; los permisos lo afinan",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setDlg(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", dlg.u ? "Permisos actualizados" : "Usuario creado", dlg.u ? `${dlg.u.nombre} guardado.` : "Se envió la contraseña temporal a su correo.");
          setDlg(null);
        }
      }, dlg && dlg.u ? "Guardar cambios" : "Crear usuario"))
    }, dlg && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombre completo",
      required: true,
      defaultValue: dlg.u ? dlg.u.nombre : "",
      placeholder: "Ej. Liliana Campos"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Correo",
      type: "email",
      required: true,
      defaultValue: dlg.u ? "usuario@elohim.edu.pe" : "",
      placeholder: "usuario@elohim.edu.pe"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Rol",
      options: ["Administrador", "Secretaría / Caja", "Docente", "Portería", "Apoderado"],
      defaultValue: dlg.u ? dlg.u.rol : undefined,
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Estado",
      options: ["Activo", "Suspendido"],
      defaultValue: dlg.u && dlg.u.estado === "Activo" ? "Activo" : "Activo"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Permisos por m\xF3dulo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: "Matr\xEDcula",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Caja y cobros",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Estudiantes y apoderados",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Notas y asistencia"
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Personal y planilla"
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Marcaci\xF3n de personal"
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Configuraci\xF3n"
    }))))));
  }
  window.SGE_Settings = function Settings() {
    const [tab, setTab] = React.useState("inst");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "inst",
        label: "Institución"
      }, {
        id: "notif",
        label: "Notificaciones"
      }, {
        id: "eval",
        label: "Evaluación"
      }, {
        id: "planilla",
        label: "Planilla"
      }, {
        id: "users",
        label: "Usuarios y roles",
        count: 4
      }]
    }), tab === "inst" && /*#__PURE__*/React.createElement(Institucion, null), tab === "notif" && /*#__PURE__*/React.createElement(Notificaciones, null), tab === "eval" && /*#__PURE__*/React.createElement(Evaluacion, null), tab === "planilla" && /*#__PURE__*/React.createElement(PlanillaCfg, null), tab === "users" && /*#__PURE__*/React.createElement(Usuarios, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/SettingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/StaffScreen.jsx
try { (() => {
/* Elohim SGE — Personal (RRHH). Registers window.SGE_Staff.
   Tabs: Personal (listado + ficha) · Asistencia (marcación de hora) · Planilla (pagos y descuentos). */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Tabs,
    Alert,
    Tooltip,
    StatCard,
    Dialog,
    ProgressBar,
    Pagination,
    Textarea,
    Switch
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const fmt = n => `S/ ${Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: 2
  })}`;

  /* ------------------------------ data ------------------------------ */
  const STAFF = [["P-001", "Pedro Gómez Silva", "Docente", "Primaria · Matemática", "Tiempo completo", "Activo", 1800, "var(--blue-500)"], ["P-002", "Lucía Díaz Rojas", "Docente", "Primaria · Comunicación", "Tiempo completo", "Activo", 1800, "var(--gold-500)"], ["P-003", "Iris Quinto Vega", "Docente", "Secundaria · Inglés", "Medio tiempo", "Activo", 1100, "var(--green-500)"], ["P-004", "Liliana Campos Paz", "Secretaría", "Administración · Caja", "Tiempo completo", "Activo", 1500, "var(--brown-400)"], ["P-005", "Saúl Ramos Cruz", "Docente", "Secundaria · Ed. Física", "Por horas", "Licencia", 900, "var(--blue-400)"], ["P-006", "Nora Paz Salas", "Auxiliar", "Inicial", "Tiempo completo", "Activo", 1300, "var(--blue-600)"]];
  const MARCAS = [["Pedro Gómez Silva", "07:42", "13:15", "Puntual", "var(--blue-500)"], ["Lucía Díaz Rojas", "07:51", "13:12", "Puntual", "var(--gold-500)"], ["Liliana Campos Paz", "07:38", "—", "Puntual", "var(--brown-400)"], ["Iris Quinto Vega", "08:12", "—", "Tardanza", "var(--green-500)"], ["Nora Paz Salas", "07:45", "—", "Puntual", "var(--blue-600)"], ["Raúl Meza Campos", "—", "—", "Sin marcar", "var(--blue-300)"], ["Marta Quispe Rojas", "—", "—", "Sin marcar", "var(--gold-600)"], ["Saúl Ramos Cruz", "—", "—", "Licencia", "var(--blue-400)"]];
  const PLANILLA = [["Pedro Gómez Silva", "Docente TC", 1800, 0, 162, 1638, "Pagado", "var(--blue-500)"], ["Lucía Díaz Rojas", "Docente TC", 1800, 0, 162, 1638, "Pagado", "var(--gold-500)"], ["Iris Quinto Vega", "Docente MT", 1100, 25, 99, 976, "Pendiente", "var(--green-500)"], ["Liliana Campos Paz", "Secretaría", 1500, 0, 135, 1365, "Pendiente", "var(--brown-400)"], ["Saúl Ramos Cruz", "Docente PH", 450, 0, 40.5, 409.5, "Pendiente", "var(--blue-400)"], ["Nora Paz Salas", "Auxiliar", 1300, 15, 117, 1168, "Pendiente", "var(--blue-600)"]];

  /* ------------------------------ Personal tab ------------------------------ */
  function FichaDialog({
    open,
    onClose,
    p,
    onEdit
  }) {
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      size: "lg",
      title: p ? p.nombre : "",
      description: p ? `${p.cod} · ${p.rol} · ${p.area}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.User, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cerrar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Pencil, null),
        onClick: onEdit
      }, "Editar ficha"))
    }, p && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 6
      }
    }, [["DNI", "42 118 906"], ["Teléfono", "964 880 213"], ["Correo", "p.gomez@elohim.edu.pe"], ["Régimen", p.reg], ["Fecha de ingreso", "01/03/2021"], ["Sueldo base", fmt(p.sueldo)], ["Horario de marcación", p.nombre === "Saúl Ramos Cruz" ? "Individual · 13:00 (tol. 10 min)" : "Según su grupo · Docentes 7:45"], ["Cursos que dicta", "Matemática · 3° A y 3° B"], ["Tutoría", "3° A Primaria"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body-md)",
        color: "var(--text-body)"
      }
    }, v)))));
  }
  function Personal() {
    const [ficha, setFicha] = React.useState(null);
    const [form, setForm] = React.useState(null); // {p?} nuevo o editar
    const [horarioInd, setHorarioInd] = React.useState(false);
    React.useEffect(() => {
      setHorarioInd(false);
    }, [form]);
    const cols = [{
      key: "cod",
      header: "Código",
      mono: true,
      width: 80
    }, {
      key: "nombre",
      header: "Empleado",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.area)))
    }, {
      key: "rol",
      header: "Rol",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Docente" ? "brand" : v === "Secretaría" ? "accent" : "info"
      }, v)
    }, {
      key: "reg",
      header: "Régimen"
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Activo" ? "success" : v === "Licencia" ? "warning" : "neutral",
        dot: true
      }, v)
    }, {
      key: "sueldo",
      header: "Sueldo base",
      num: true,
      mono: true,
      render: v => fmt(v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver ficha"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => setFicha(r)
      }, /*#__PURE__*/React.createElement(Ic.Eye, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setForm({
          p: r
        })
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))))
    }];
    const rows = STAFF.map(s => ({
      cod: s[0],
      nombre: s[1],
      rol: s[2],
      area: s[3],
      reg: s[4],
      estado: s[5],
      sueldo: s[6],
      color: s[7]
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 220
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por nombre, c\xF3digo o DNI\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Rol",
      options: ["Docente", "Secretaría", "Auxiliar", "Mantenimiento"],
      containerStyle: {
        width: 140
      }
    }), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Estado",
      options: ["Activo", "Licencia", "Cesado"],
      containerStyle: {
        width: 130
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setForm({})
    }, "Registrar empleado")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true,
      zebra: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(Pagination, {
      page: 1,
      pageCount: 2,
      onPageChange: () => {},
      total: 23,
      pageSize: 15
    }))), /*#__PURE__*/React.createElement(FichaDialog, {
      open: !!ficha,
      onClose: () => setFicha(null),
      p: ficha,
      onEdit: () => {
        const p = ficha;
        setFicha(null);
        setForm({
          p
        });
      }
    }), /*#__PURE__*/React.createElement(Dialog, {
      open: !!form,
      onClose: () => setForm(null),
      size: "lg",
      title: form && form.p ? `Editar · ${form.p.nombre}` : "Registrar empleado",
      icon: /*#__PURE__*/React.createElement(Ic.Teacher, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setForm(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", form.p ? "Empleado actualizado" : "Empleado registrado", form.p ? `${form.p.nombre} guardado.` : "Ya aparece en asistencia y en la planilla del mes.");
          setForm(null);
        }
      }, form && form.p ? "Guardar cambios" : "Registrar"))
    }, form && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombres y apellidos",
      required: true,
      defaultValue: form.p ? form.p.nombre : "",
      placeholder: "Ej. Pedro G\xF3mez Silva",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "DNI",
      required: true,
      defaultValue: form.p ? "42 118 906" : "",
      placeholder: "00000000"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Tel\xE9fono",
      defaultValue: form.p ? "964 880 213" : "",
      placeholder: "9__ ___ ___"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Rol",
      options: ["Docente", "Secretaría", "Auxiliar", "Mantenimiento", "Dirección"],
      defaultValue: form.p ? form.p.rol : undefined,
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Select, {
      label: "R\xE9gimen",
      options: ["Tiempo completo", "Medio tiempo", "Por horas"],
      defaultValue: form.p ? form.p.reg : undefined,
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "\xC1rea / nivel",
      defaultValue: form.p ? form.p.area : "",
      placeholder: "Ej. Primaria \xB7 Matem\xE1tica"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Sueldo base",
      prefix: "S/.",
      defaultValue: form.p ? String(form.p.sueldo) : "",
      inputMode: "decimal"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de ingreso",
      type: "date",
      defaultValue: form.p ? "2021-03-01" : ""
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Estado",
      options: ["Activo", "Licencia", "Cesado"],
      defaultValue: form.p ? form.p.estado : "Activo"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "R\xE9gimen pensionario",
      options: ["ONP (13%)", "AFP Integra", "AFP Prima", "AFP Profuturo", "AFP Habitat"],
      defaultValue: "ONP (13%)",
      hint: "Define el descuento en planilla"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Horario de marcaci\xF3n",
      options: ["Según su grupo", "Individual"],
      defaultValue: "Seg\xFAn su grupo",
      onChange: e => setHorarioInd(e.target.value === "Individual"),
      hint: "El grupo define hora y tolerancia (Reglas de marcaci\xF3n)"
    }), horarioInd && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Hora de ingreso",
      type: "time",
      defaultValue: "13:00"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Tolerancia",
      suffix: "min",
      inputMode: "numeric",
      defaultValue: "10"
    })))));
  }

  /* ------------------------------ Reglas de marcación ------------------------------ */
  function ReglasDialog({
    open,
    onClose
  }) {
    const GRUPOS = [{
      g: "Docentes",
      hora: "07:45",
      tol: 15
    }, {
      g: "Administrativos",
      hora: "07:30",
      tol: 10
    }, {
      g: "Auxiliares",
      hora: "07:30",
      tol: 10
    }, {
      g: "Mantenimiento",
      hora: "06:30",
      tol: 10
    }, {
      g: "Portería",
      hora: "06:00",
      tol: 5
    }];
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      size: "lg",
      title: "Reglas de marcaci\xF3n",
      icon: /*#__PURE__*/React.createElement(Ic.Clock, null),
      description: "Horario de ingreso y tolerancia por grupo \xB7 regla de descuento autom\xE1tico",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Reglas guardadas", "Rigen desde mañana; las marcas de hoy no se recalculan.");
          onClose();
        }
      }, "Guardar reglas"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)",
        marginBottom: 8
      }
    }, "Horarios de ingreso por grupo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, GRUPOS.map(x => /*#__PURE__*/React.createElement("div", {
      key: x.g,
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 1fr",
        gap: 10,
        alignItems: "center",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-body)"
      }
    }, x.g), /*#__PURE__*/React.createElement(Input, {
      size: "sm",
      type: "time",
      defaultValue: x.hora,
      "aria-label": `Hora de ingreso · ${x.g}`
    }), /*#__PURE__*/React.createElement(Input, {
      size: "sm",
      defaultValue: String(x.tol),
      suffix: "min tolerancia",
      inputMode: "numeric",
      "aria-label": `Tolerancia · ${x.g}`
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)",
        marginTop: 6
      }
    }, "La tardanza se calcula contra el horario del grupo de cada empleado. Un empleado puede tener horario individual desde su ficha.")), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Switch, {
      label: "Descuento autom\xE1tico por tardanzas acumuladas",
      defaultChecked: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Tardanzas para aplicar",
      defaultValue: "3",
      inputMode: "numeric"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Descuento",
      prefix: "S/.",
      defaultValue: "20.00",
      inputMode: "decimal"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Periodo de conteo",
      options: ["Por mes", "Por bimestre"],
      defaultValue: "Por mes"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "El descuento se genera como \xEDtem de planilla con origen \u201CAuto \xB7 tardanzas\u201D y puede anularse manualmente con justificaci\xF3n."))));
  }

  /* ------------------------------ Asistencia tab ------------------------------ */
  function Asistencia() {
    const [reglas, setReglas] = React.useState(false);
    const [marcas, setMarcas] = React.useState(() => MARCAS.map(m => ({
      nombre: m[0],
      in: m[1],
      out: m[2],
      estado: m[3],
      color: m[4]
    })));
    const hora = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };
    const marcarIn = r => {
      const h = hora();
      const estado = h > "08:00" ? "Tardanza" : "Puntual";
      setMarcas(ms => ms.map(m => m.nombre === r.nombre ? {
        ...m,
        in: h,
        estado
      } : m));
      notify(estado === "Tardanza" ? "warning" : "success", `Ingreso marcado · ${h}`, `${r.nombre} — ${estado}${estado === "Tardanza" ? " (después de las 8:00)" : ""}.`);
    };
    const marcarOut = r => {
      const h = hora();
      setMarcas(ms => ms.map(m => m.nombre === r.nombre ? {
        ...m,
        out: h
      } : m));
      notify("info", `Salida marcada · ${h}`, `${r.nombre} completó su jornada.`);
    };
    const cols = [{
      key: "nombre",
      header: "Empleado",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "in",
      header: "Ingreso",
      mono: true,
      align: "center",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: v === "—" ? "var(--text-subtle)" : "var(--text-body)"
        }
      }, v)
    }, {
      key: "out",
      header: "Salida",
      mono: true,
      align: "center",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: v === "—" ? "var(--text-subtle)" : "var(--text-body)"
        }
      }, v)
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Puntual" ? "success" : v === "Tardanza" ? "warning" : v === "Licencia" ? "info" : v === "Sin marcar" ? "neutral" : "danger",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => r.in === "—" && r.estado !== "Licencia" ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Clock, null),
        onClick: () => marcarIn(r)
      }, "Marcar ingreso") : r.out === "—" && r.in !== "—" ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "ghost",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Clock, null),
        onClick: () => marcarOut(r)
      }, "Marcar salida") : null
    }];
    const rows = marcas;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Presentes",
      value: "19",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Check, null),
      caption: "de 23 empleados"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Tardanzas",
      value: "1",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Clock, null),
      caption: "hoy"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Sin marcar",
      value: "3",
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Trash, null),
      caption: "a\xFAn no llegan"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Licencias",
      value: "1",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      caption: "S. Ramos \xB7 salud"
    })), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "Horarios y tolerancia por grupo",
      actions: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Settings, null),
        onClick: () => setReglas(true)
      }, "Configurar reglas")
    }, "Cada grupo tiene su hora de ingreso (Docentes 7:45 \xB7 Administrativos 7:30 \xB7 Mantenimiento 6:30\u2026). Pasada la tolerancia se registra tardanza; las tardanzas acumuladas generan descuento seg\xFAn la regla configurada."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Fecha",
      type: "date",
      defaultValue: "2026-07-07",
      containerStyle: {
        width: 170
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("success", "Asistencia exportada", "Julio 2026 · 23 empleados · descargada en Excel.")
    }, "Exportar mes")), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Marcaci\xF3n \xB7 Martes 07/07/2026"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true
    })), /*#__PURE__*/React.createElement(ReglasDialog, {
      open: reglas,
      onClose: () => setReglas(false)
    }));
  }

  /* ------------------------------ Descuentos por empleado ------------------------------ */
  function DescuentosDialog({
    emp,
    onClose
  }) {
    const [items, setItems] = React.useState(() => emp.desc > 20 ? [{
      id: 1,
      tipo: "Auto · tardanzas",
      det: "3 tardanzas en Junio (regla vigente)",
      monto: 20,
      estado: "Aplicado",
      just: null
    }, {
      id: 2,
      tipo: "Manual · adelanto",
      det: "Adelanto de sueldo · 15/06",
      monto: emp.desc - 20,
      estado: "Aplicado",
      just: null
    }] : emp.desc > 0 ? [{
      id: 1,
      tipo: "Auto · tardanzas",
      det: "3 tardanzas en Junio (regla vigente)",
      monto: emp.desc,
      estado: "Aplicado",
      just: null
    }] : []);
    const [anular, setAnular] = React.useState(null);
    const [justif, setJustif] = React.useState("");
    const [nuevo, setNuevo] = React.useState(false);
    const anularItem = () => {
      setItems(xs => xs.map(x => x.id === anular.id ? {
        ...x,
        estado: "Anulado",
        just: justif.trim()
      } : x));
      notify("warning", "Descuento anulado", `${anular.tipo} · ${fmt(anular.monto)} — queda registrado como anulado con tu justificación.`);
      setAnular(null);
      setJustif("");
    };
    return /*#__PURE__*/React.createElement(Dialog, {
      open: true,
      onClose: onClose,
      size: "lg",
      title: `Descuentos · ${emp.nombre}`,
      icon: /*#__PURE__*/React.createElement(Ic.Chart, null),
      description: "Julio 2026 \xB7 los anulados no se borran: quedan como evidencia",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cerrar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
        onClick: () => setNuevo(true)
      }, "Agregar descuento manual"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 4
      }
    }, items.length === 0 && !nuevo && /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body)",
        color: "var(--text-muted)",
        textAlign: "center",
        padding: "18px 0"
      }
    }, "Sin descuentos este mes."), items.map(x => /*#__PURE__*/React.createElement("div", {
      key: x.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        opacity: x.estado === "Anulado" ? 0.75 : 1
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: x.tipo.startsWith("Auto") ? "brand" : "neutral"
    }, x.tipo), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        color: "var(--text-strong)",
        textDecoration: x.estado === "Anulado" ? "line-through" : "none"
      }
    }, x.det), x.estado === "Anulado" && /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--warning-soft-fg)"
      }
    }, "Anulado por Dir. P\xE9rez \xB7 \u201C", x.just, "\u201D")), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        color: x.estado === "Anulado" ? "var(--text-subtle)" : "var(--danger)",
        textDecoration: x.estado === "Anulado" ? "line-through" : "none"
      }
    }, "\u2212 ", fmt(x.monto)), x.estado === "Anulado" ? /*#__PURE__*/React.createElement(Badge, {
      tone: "warning",
      dot: true
    }, "Anulado") : /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => setAnular(x)
    }, "Anular"))), nuevo && /*#__PURE__*/React.createElement("div", {
      style: {
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, "Nuevo descuento manual"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Tipo",
      options: ["Adelanto de sueldo", "Daño o pérdida", "Inasistencia injustificada", "Otro"],
      placeholder: "Seleccione",
      required: true
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Monto",
      prefix: "S/.",
      inputMode: "decimal",
      placeholder: "0.00",
      required: true
    })), /*#__PURE__*/React.createElement(Textarea, {
      label: "Motivo",
      rows: 2,
      required: true,
      placeholder: "Obligatorio \u2014 aparecer\xE1 en la boleta y el historial"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      onClick: () => setNuevo(false)
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => {
        setNuevo(false);
        notify("success", "Descuento registrado", `Se aplicará en la planilla de Julio de ${emp.nombre}.`);
      }
    }, "Registrar")))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!anular,
      onClose: () => {
        setAnular(null);
        setJustif("");
      },
      title: "Anular descuento",
      icon: /*#__PURE__*/React.createElement(Ic.Trash, null),
      iconTone: "warning",
      description: anular ? `${anular.tipo} · − ${fmt(anular.monto)}` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => {
          setAnular(null);
          setJustif("");
        }
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        disabled: justif.trim().length < 10,
        onClick: anularItem
      }, "Anular con justificaci\xF3n"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "No se borra: queda como evidencia"
    }, "El \xEDtem quedar\xE1 marcado como anulado, con tu usuario, fecha y justificaci\xF3n, visible en el historial y la auditor\xEDa."), /*#__PURE__*/React.createElement(Textarea, {
      label: "Justificaci\xF3n",
      rows: 2,
      required: true,
      value: justif,
      onChange: e => setJustif(e.target.value),
      placeholder: "M\xEDnimo 10 caracteres \u2014 ej. tardanzas justificadas por comisi\xF3n de la direcci\xF3n",
      hint: justif.trim().length < 10 ? `${Math.max(0, 10 - justif.trim().length)} caracteres más` : "Listo"
    }))));
  }

  /* ------------------------------ Planilla tab ------------------------------ */
  function Planilla() {
    const [pagar, setPagar] = React.useState(null);
    const [masivo, setMasivo] = React.useState(false);
    const [descDlg, setDescDlg] = React.useState(null);
    const [boleta, setBoleta] = React.useState(null);
    const REGIMEN = {
      "Pedro Gómez Silva": "AFP Integra",
      "Lucía Díaz Rojas": "ONP",
      "Liliana Campos Paz": "AFP Habitat",
      "Iris Quinto Vega": "ONP"
    };
    const regimenDe = n => REGIMEN[n] || "ONP";
    const [rows, setRows] = React.useState(() => PLANILLA.map(p => ({
      nombre: p[0],
      cargo: p[1],
      sueldo: p[2],
      desc: p[3],
      apor: p[4],
      neto: p[5],
      estado: p[6],
      color: p[7]
    })));
    const pagarUno = r => {
      setRows(rs => rs.map(x => x.nombre === r.nombre ? {
        ...x,
        estado: "Pagado"
      } : x));
      notify("success", "Sueldo pagado", `${r.nombre} · ${fmt(r.neto)} · boleta generada.`);
      setPagar(null);
    };
    const cols = [{
      key: "nombre",
      header: "Empleado",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.cargo)))
    }, {
      key: "sueldo",
      header: "Sueldo",
      num: true,
      mono: true,
      render: v => fmt(v)
    }, {
      key: "regimen",
      header: "Régimen",
      align: "center",
      render: (_, r) => /*#__PURE__*/React.createElement(Badge, {
        tone: regimenDe(r.nombre) === "ONP" ? "neutral" : "brand"
      }, regimenDe(r.nombre))
    }, {
      key: "desc",
      header: "Descuentos",
      num: true,
      mono: true,
      render: (v, r) => /*#__PURE__*/React.createElement(Button, {
        variant: "link",
        size: "sm",
        onClick: () => setDescDlg(r),
        style: {
          font: "var(--type-mono)",
          color: v > 0 ? "var(--danger)" : "var(--text-muted)"
        },
        title: "Ver / gestionar descuentos"
      }, v > 0 ? `− ${fmt(v)}` : "—")
    }, {
      key: "apor",
      header: "Aportes",
      num: true,
      mono: true,
      render: (v, r) => /*#__PURE__*/React.createElement(Button, {
        variant: "link",
        size: "sm",
        onClick: () => setBoleta(r),
        style: {
          font: "var(--type-mono)",
          color: "var(--text-muted)"
        },
        title: "Ver desglose de boleta"
      }, "\u2212 ", fmt(v))
    }, {
      key: "neto",
      header: "Neto a pagar",
      num: true,
      mono: true,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: "var(--text-strong)"
        }
      }, fmt(v))
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Pagado" ? "success" : "warning",
        dot: true
      }, v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2,
          alignItems: "center"
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Descuentos"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Descuentos",
        size: "sm",
        onClick: () => setDescDlg(r)
      }, /*#__PURE__*/React.createElement(Ic.Chart, null))), r.estado === "Pagado" ? /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver boleta"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Boleta",
        size: "sm",
        onClick: () => notify("info", "Boleta", `${r.nombre} · Julio 2026 · ${fmt(r.neto)} — abierta para impresión.`)
      }, /*#__PURE__*/React.createElement(Ic.Receipt, null))) : /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "primary",
        onClick: () => setPagar(r)
      }, "Pagar"))
    }];
    const totalPend = rows.filter(r => r.estado === "Pendiente").reduce((a, r) => a + r.neto, 0);
    const nPend = rows.filter(r => r.estado === "Pendiente").length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Planilla \xB7 Julio",
      value: "S/ 28,450",
      icon: /*#__PURE__*/React.createElement(Ic.Building, null),
      caption: "23 empleados"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Pagado",
      value: "S/ 3,276",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Check, null),
      caption: "2 empleados"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Por pagar",
      value: fmt(totalPend).replace(".00", ""),
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Clock, null),
      caption: "vence 05/07"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Descuentos del mes",
      value: "S/ 40",
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Chart, null),
      caption: "tardanzas y adelantos"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Periodo",
      options: ["Julio 2026", "Junio 2026", "Mayo 2026"],
      defaultValue: "Julio 2026",
      containerStyle: {
        width: 170
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("success", "Planilla exportada", "Julio 2026 · 23 empleados · descargada en Excel.")
    }, "Exportar planilla"), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Cash, null),
      disabled: nPend === 0,
      onClick: () => setMasivo(true)
    }, "Pagar todos los pendientes")), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Planilla \xB7 Julio 2026",
      subtitle: "AFP u ONP seg\xFAn la ficha de cada empleado \xB7 EsSalud 9% a cargo del colegio \xB7 clic en aportes para ver la boleta"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true,
      zebra: true
    })), descDlg && /*#__PURE__*/React.createElement(DescuentosDialog, {
      emp: descDlg,
      onClose: () => setDescDlg(null)
    }), /*#__PURE__*/React.createElement(Dialog, {
      open: !!boleta,
      onClose: () => setBoleta(null),
      title: "Desglose de boleta \xB7 Julio 2026",
      icon: /*#__PURE__*/React.createElement(Ic.Receipt, null),
      description: boleta ? `${boleta.nombre} · ${boleta.cargo} · régimen ${regimenDe(boleta.nombre)}` : "",
      footer: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        onClick: () => setBoleta(null)
      }, "Cerrar")
    }, boleta && (() => {
      const reg = regimenDe(boleta.nombre);
      const s = boleta.sueldo;
      const filas = reg === "ONP" ? [["Sueldo base", s, false], ["ONP (13%)", -s * 0.13, true]] : [["Sueldo base", s, false], [`${reg} · fondo (10%)`, -s * 0.10, true], [`${reg} · comisión (1.55%)`, -s * 0.0155, true], [`${reg} · seguro (1.84%)`, -s * 0.0184, true]];
      if (boleta.desc > 0) filas.push(["Descuentos del mes (tardanzas/adelantos)", -boleta.desc, true]);
      const neto = filas.reduce((a, f) => a + f[1], 0);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingTop: 4
        }
      }, filas.map(([k, v, neg]) => /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          display: "flex",
          justifyContent: "space-between",
          font: "var(--type-body)",
          padding: "6px 10px",
          background: "var(--surface-sunken)",
          borderRadius: "var(--radius-sm)"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--text-muted)"
        }
      }, k), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)",
          color: neg ? "var(--danger)" : "var(--text-strong)"
        }
      }, neg ? "− " : "", fmt(Math.abs(v))))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 10px",
          borderTop: "1px solid var(--border-subtle)",
          font: "var(--type-label)",
          fontWeight: 700
        }
      }, /*#__PURE__*/React.createElement("span", null, "Neto a pagar"), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-mono)"
        }
      }, fmt(neto))), /*#__PURE__*/React.createElement(Alert, {
        tone: "info"
      }, "Aparte, el colegio aporta ", /*#__PURE__*/React.createElement("b", null, "EsSalud 9%"), " (", fmt(s * 0.09), ") \u2014 no se descuenta al trabajador. Gratificaci\xF3n de Julio incluida en planilla aparte. Porcentajes en Configuraci\xF3n \u2192 Planilla."));
    })()), /*#__PURE__*/React.createElement(Dialog, {
      open: !!pagar,
      onClose: () => setPagar(null),
      title: "Pagar sueldo",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      iconTone: "success",
      description: pagar ? `${pagar.nombre} · Julio 2026` : "",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setPagar(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => pagarUno(pagar)
      }, "Confirmar pago"))
    }, pagar && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, [["Sueldo base", fmt(pagar.sueldo)], ["Descuentos", pagar.desc > 0 ? `− ${fmt(pagar.desc)}` : "—"], ["Aportes (ONP 9%)", `− ${fmt(pagar.apor)}`], ["Neto a pagar", fmt(pagar.neto)]].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        background: i === 3 ? "var(--surface-brand-soft)" : "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-h3)",
        fontFamily: "var(--font-mono)",
        color: i === 3 ? "var(--brand)" : "var(--text-strong)"
      }
    }, v)))), /*#__PURE__*/React.createElement(Select, {
      label: "M\xE9todo",
      options: ["Transferencia BCP", "Efectivo", "Yape / Plin"],
      defaultValue: "Transferencia BCP"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "N\xB0 de operaci\xF3n",
      placeholder: "Opcional"
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: masivo,
      onClose: () => setMasivo(false),
      title: "Pagar todos los pendientes",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      iconTone: "warning",
      description: `${nPend} empleados · ${fmt(totalPend)} en total`,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setMasivo(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "accent",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setRows(rs => rs.map(x => ({
            ...x,
            estado: "Pagado"
          })));
          setMasivo(false);
          notify("success", "Planilla pagada", `${nPend} sueldos pagados · ${fmt(totalPend)} · boletas generadas.`);
        }
      }, "Pagar ", fmt(totalPend)))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "Pago masivo"
    }, "Se registrar\xE1 el pago de todos los pendientes con el mismo m\xE9todo y se generar\xE1n sus boletas."), /*#__PURE__*/React.createElement(Select, {
      label: "M\xE9todo",
      options: ["Transferencia BCP", "Efectivo"],
      defaultValue: "Transferencia BCP"
    }))));
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_StaffAttendance = Asistencia; // vista independiente para el rol Portería
  window.SGE_Staff = function Staff() {
    const [tab, setTab] = React.useState("personal");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "personal",
        label: "Personal",
        count: 23
      }, {
        id: "asist",
        label: "Asistencia y marcación"
      }, {
        id: "planilla",
        label: "Planilla",
        count: 4
      }]
    }), tab === "personal" && /*#__PURE__*/React.createElement(Personal, null), tab === "asist" && /*#__PURE__*/React.createElement(Asistencia, null), tab === "planilla" && /*#__PURE__*/React.createElement(Planilla, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/StaffScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/StudentsScreen.jsx
try { (() => {
/* Elohim SGE — Estudiantes. Registers window.SGE_Students. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Tag,
    Pagination,
    Tooltip,
    Dialog,
    Checkbox,
    Alert,
    Radio,
    RadioGroup,
    Textarea
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);
  const COLORS = ["var(--blue-500)", "var(--gold-500)", "var(--green-500)", "var(--brown-400)", "var(--blue-400)"];
  const NAMES = [["E-1042", "María Quispe Roca", "3° A Primaria", "Activo", "0.00", "M"], ["E-1043", "José Ramos Lía", "5° B Primaria", "Activo", "280.00", "M"], ["E-1051", "Ana Flores Mendoza", "1° A Secundaria", "Activo", "310.00", "T"], ["E-1067", "Luis Paz Cárdenas", "4° A Primaria", "Activo", "0.00", "M"], ["E-1072", "Rosa Lima Vega", "2° B Primaria", "Becado", "0.00", "M"], ["E-1080", "Hugo Vela Soto", "6° A Primaria", "Activo", "560.00", "T"], ["E-1091", "Carmen Ríos Paz", "Inicial 5 años", "Activo", "0.00", "M"], ["E-1099", "Diego Ñahui Cruz", "3° A Secundaria", "Retirado", "0.00", "T"]];
  window.SGE_Students = function Students() {
    const [open, setOpen] = React.useState(false);
    const [sel, setSel] = React.useState(null);
    const [edit, setEdit] = React.useState(null);
    const [filtrosOpen, setFiltrosOpen] = React.useState(false);
    const [filtros, setFiltros] = React.useState(["Primaria", "Turno mañana"]);
    const [soloDeuda, setSoloDeuda] = React.useState(true);
    const [retiro, setRetiro] = React.useState(null);
    const [tipoRetiro, setTipoRetiro] = React.useState("retiro");
    const [carnet, setCarnet] = React.useState(null);
    const cols = [{
      key: "codigo",
      header: "Código",
      mono: true,
      width: 90
    }, {
      key: "nombre",
      header: "Estudiante",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "sm",
        color: r.color
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v))
    }, {
      key: "grado",
      header: "Grado y sección"
    }, {
      key: "turno",
      header: "Turno",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "M" ? "info" : "accent"
      }, v === "M" ? "Mañana" : "Tarde")
    }, {
      key: "estado",
      header: "Estado",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Activo" ? "success" : v === "Becado" ? "brand" : "neutral",
        dot: true
      }, v)
    }, {
      key: "deuda",
      header: "Deuda",
      num: true,
      mono: true,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: v === "0.00" ? "var(--text-muted)" : "var(--danger)"
        }
      }, "S/ ", v)
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Ver ficha"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver",
        size: "sm",
        onClick: () => {
          setSel(r);
          setOpen(true);
        }
      }, /*#__PURE__*/React.createElement(Ic.Eye, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => setEdit(r)
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))))
    }];
    const rows = NAMES.map((n, i) => ({
      codigo: n[0],
      nombre: n[1],
      grado: n[2],
      estado: n[3],
      deuda: n[4],
      turno: n[5],
      color: COLORS[i % COLORS.length]
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 220
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por nombre, c\xF3digo o DNI\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Nivel",
      options: ["Inicial", "Primaria", "Secundaria"],
      containerStyle: {
        width: 150
      }
    }), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Grado",
      options: ["1°", "2°", "3°", "4°", "5°", "6°"],
      containerStyle: {
        width: 120
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Filter, null),
      onClick: () => setFiltrosOpen(true)
    }, "Filtros"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => {
        goTo("matricula");
        notify("info", "Nueva matrícula", "Asistente de matrícula abierto.");
      }
    }, "Matricular")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Filtros:"), filtros.map(f => /*#__PURE__*/React.createElement(Tag, {
      key: f,
      onRemove: () => {
        setFiltros(fs => fs.filter(x => x !== f));
        notify("info", "Filtro quitado", `“${f}” ya no filtra la lista.`);
      }
    }, f)), /*#__PURE__*/React.createElement(Tag, {
      selected: soloDeuda,
      leadingDot: true,
      color: "var(--gold-500)",
      onClick: () => setSoloDeuda(d => !d)
    }, "Solo con deuda"), filtros.length === 0 && !soloDeuda && /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-subtle)"
      }
    }, "ninguno")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: rows,
      hover: true,
      zebra: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 16px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement(Pagination, {
      page: 1,
      pageCount: 24,
      onPageChange: () => {},
      total: 482,
      pageSize: 20
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: () => setOpen(false),
      size: "lg",
      title: sel ? sel.nombre : "",
      description: sel ? `${sel.codigo} · ${sel.grado}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.User, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Logout, null),
        onClick: () => {
          const s = sel;
          setOpen(false);
          setRetiro(s);
        }
      }, "Retirar / Trasladar"), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }), /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setOpen(false)
      }, "Cerrar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Pencil, null),
        onClick: () => {
          setOpen(false);
          setEdit(sel);
        }
      }, "Editar ficha"))
    }, sel && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingTop: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 16,
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 92,
        height: 110,
        borderRadius: "var(--radius-md)",
        border: "1.5px dashed var(--border-strong)",
        background: "var(--surface-sunken)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: sel.nombre,
      size: "lg",
      color: sel.color
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-subtle)"
      }
    }, "Foto 3\xD74")), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      onClick: () => notify("info", "Subir foto", "Selector de imagen: JPG/PNG, se recorta a 3×4 — se usa en ficha y carnet.")
    }, "Subir foto"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "accent",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      onClick: () => {
        const s = sel;
        setOpen(false);
        setCarnet(s);
      }
    }, "Ver carnet")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, [["DNI", "70 481 559"], ["Apoderado", "Juana Roca Pérez"], ["Teléfono", "964 221 880"], ["Estado", sel.estado], ["Turno", sel.turno === "M" ? "Mañana" : "Tarde"], ["Deuda actual", `S/ ${sel.deuda}`]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body-md)",
        color: "var(--text-body)"
      }
    }, v))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, "Salud y emergencia"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10
      }
    }, [["Alergias", "Penicilina"], ["Seguro", "SIS"], ["Contacto de emergencia", "Juana Roca · 964 221 880"], ["Autorizados a recoger", "Juana Roca (madre) · Elena Vega (abuela)"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "eyebrow",
      style: {
        marginBottom: 2
      }
    }, k), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-body)",
        color: k === "Alergias" ? "var(--danger)" : "var(--text-body)",
        fontWeight: k === "Alergias" ? 600 : 400
      }
    }, v))))))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!edit,
      onClose: () => setEdit(null),
      size: "lg",
      title: edit ? `Editar · ${edit.nombre}` : "",
      description: edit ? `${edit.codigo} · ${edit.grado}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Pencil, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setEdit(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", "Ficha actualizada", `${edit.nombre} guardado correctamente.`);
          setEdit(null);
        }
      }, "Guardar cambios"))
    }, edit && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Nombres y apellidos",
      defaultValue: edit.nombre,
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "DNI",
      defaultValue: "70 481 559"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha de nacimiento",
      type: "date",
      defaultValue: "2017-04-12"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Grado y secci\xF3n",
      options: [...new Set(["3° A Primaria", "3° B Primaria", edit.grado])],
      defaultValue: edit.grado
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Turno",
      options: ["Mañana", "Tarde"],
      defaultValue: edit.turno === "M" ? "Mañana" : "Tarde"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Estado",
      options: ["Activo", "Becado", "Retirado", "Trasladado"],
      defaultValue: edit.estado
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Apoderado principal",
      defaultValue: "Juana Roca P\xE9rez",
      hint: "Se gestiona desde el m\xF3dulo Apoderados"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: 12,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Alergias / condiciones m\xE9dicas",
      defaultValue: "Penicilina",
      placeholder: "Ninguna",
      hint: "Visible para tutor y auxiliar"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Seguro",
      options: ["SIS", "EsSalud", "Privado", "Ninguno"],
      defaultValue: "SIS"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Contacto de emergencia",
      defaultValue: "Juana Roca \xB7 964 221 880",
      placeholder: "Nombre \xB7 tel\xE9fono"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Autorizados a recoger",
      defaultValue: "Juana Roca \xB7 Elena Vega",
      hint: "Separados por \xB7"
    })))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!carnet,
      onClose: () => setCarnet(null),
      title: "Carnet del estudiante",
      icon: /*#__PURE__*/React.createElement(Ic.Clipboard, null),
      description: "Formato CR80 \xB7 imprime por lote desde el listado",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setCarnet(null)
      }, "Cerrar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
        onClick: () => notify("success", "Carnet generado", `${carnet.nombre} · PDF listo para impresión en PVC.`)
      }, "Imprimir carnet"))
    }, carnet && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        paddingTop: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 340,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border-subtle)",
        background: "var(--surface-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: "linear-gradient(135deg, var(--blue-700), var(--blue-900))",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/elohim-insignia.png",
      alt: "",
      style: {
        width: 30,
        height: 30,
        objectFit: "contain"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: ".04em"
      }
    }, "I.E.P. ELOHIM \xB7 SATIPO"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--blue-200)"
      }
    }, "Carnet estudiantil \xB7 2026")), /*#__PURE__*/React.createElement(Badge, {
      tone: "accent",
      solid: true,
      size: "sm"
    }, "2026")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 74,
        height: 92,
        borderRadius: 8,
        background: "var(--surface-sunken)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: carnet.nombre,
      size: "lg",
      color: carnet.color
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 700,
        color: "var(--text-strong)",
        lineHeight: 1.2
      }
    }, carnet.nombre), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-muted)"
      }
    }, carnet.grado, " \xB7 Turno ", carnet.turno === "M" ? "Mañana" : "Tarde"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-body)"
      }
    }, carnet.codigo, " \xB7 DNI 70 481 559"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "auto",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-subtle)"
      }
    }, "Vigencia:", /*#__PURE__*/React.createElement("br", null), "Mar\u2013Dic 2026"), /*#__PURE__*/React.createElement("div", {
      title: "QR para asistencia",
      style: {
        width: 52,
        height: 52,
        borderRadius: 4,
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        padding: 4,
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 1
      }
    }, [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1].map((b, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        background: b ? "var(--blue-900)" : "transparent",
        borderRadius: .5
      }
    })))))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: "3px solid var(--gold-400)",
        padding: "6px 14px",
        font: "var(--type-2xs)",
        color: "var(--text-muted)",
        display: "flex",
        justifyContent: "space-between"
      }
    }, /*#__PURE__*/React.createElement("span", null, "QR: marcaci\xF3n de asistencia (futuro)"), /*#__PURE__*/React.createElement("span", null, "(064) 545-210"))))), /*#__PURE__*/React.createElement(Dialog, {
      open: !!retiro,
      onClose: () => setRetiro(null),
      size: "lg",
      title: retiro ? `Retiro o traslado · ${retiro.nombre}` : "",
      description: retiro ? `${retiro.codigo} · ${retiro.grado}` : "",
      icon: /*#__PURE__*/React.createElement(Ic.Logout, null),
      iconTone: "danger",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setRetiro(null)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "danger",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("warning", "Proceso registrado", `${retiro.nombre} — constancia generada; su vacante queda liberada.`);
          setRetiro(null);
        }
      }, "Confirmar"))
    }, retiro && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingTop: 4
      }
    }, retiro.deuda !== "0.00" && /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: `Deuda pendiente: S/ ${retiro.deuda}`
    }, "El retiro no condona la deuda \u2014 quedar\xE1 registrada en la cuenta del apoderado."), /*#__PURE__*/React.createElement(RadioGroup, {
      name: "tiporet",
      value: tipoRetiro,
      onChange: e => setTipoRetiro(e.target.value),
      row: true
    }, /*#__PURE__*/React.createElement(Radio, {
      value: "retiro",
      label: "Retiro",
      description: "Deja la instituci\xF3n sin destino declarado"
    }), /*#__PURE__*/React.createElement(Radio, {
      value: "traslado",
      label: "Traslado",
      description: "Pasa a otra I.E. \u2014 requiere constancia"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Fecha efectiva",
      type: "date",
      defaultValue: "2026-07-07"
    }), tipoRetiro === "traslado" && /*#__PURE__*/React.createElement(Input, {
      label: "I.E. de destino",
      placeholder: "Ej. I.E. 30001 Satipo",
      required: true
    })), /*#__PURE__*/React.createElement(Textarea, {
      label: "Motivo",
      rows: 2,
      required: true,
      placeholder: "Ej. cambio de domicilio familiar\u2026"
    }), /*#__PURE__*/React.createElement(Checkbox, {
      label: "Generar constancia",
      description: tipoRetiro === "traslado" ? "Constancia de traslado + libreta de notas a la fecha" : "Constancia de retiro",
      defaultChecked: true
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: filtrosOpen,
      onClose: () => setFiltrosOpen(false),
      title: "Filtros avanzados",
      icon: /*#__PURE__*/React.createElement(Ic.Filter, null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        onClick: () => {
          setFiltros([]);
          setSoloDeuda(false);
          setFiltrosOpen(false);
          notify("info", "Filtros limpiados", "Mostrando los 482 estudiantes.");
        }
      }, "Limpiar todo"), /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setFiltrosOpen(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setFiltros(["Primaria", "3°", "Turno mañana"]);
          setFiltrosOpen(false);
          notify("success", "Filtros aplicados", "Primaria · 3° · Turno mañana — 52 estudiantes.");
        }
      }, "Aplicar filtros"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Nivel",
      placeholder: "Todos",
      options: ["Inicial", "Primaria", "Secundaria"],
      defaultValue: "Primaria"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Grado",
      placeholder: "Todos",
      options: ["1°", "2°", "3°", "4°", "5°", "6°"],
      defaultValue: "3\xB0"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Secci\xF3n",
      placeholder: "Todas",
      options: ["A", "B"]
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Turno",
      placeholder: "Ambos",
      options: ["Mañana", "Tarde"],
      defaultValue: "Ma\xF1ana"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Estado",
      placeholder: "Todos",
      options: ["Activo", "Becado", "Retirado", "Trasladado"]
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Programa",
      placeholder: "Cualquiera",
      options: ["Taller de Danza", "Taller de Música", "Reforzamiento"]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: "1 / -1"
      }
    }, /*#__PURE__*/React.createElement(Checkbox, {
      label: "Solo estudiantes con deuda",
      checked: soloDeuda,
      onChange: e => setSoloDeuda(e.target.checked)
    })))));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/StudentsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/TeacherScreen.jsx
try { (() => {
/* Elohim SGE — Portal Docente. Registers window.SGE_TeacherHome y window.SGE_TeacherAttendance. */
(function () {
  const {
    Card,
    Badge,
    Avatar,
    Button,
    Select,
    Input,
    StatCard,
    Alert,
    ProgressBar
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);
  const CLASES_HOY = [{
    hora: "7:45–9:15",
    curso: "Matemática",
    aula: "3° A Primaria",
    n: 30,
    tomada: true
  }, {
    hora: "9:30–11:00",
    curso: "Matemática",
    aula: "3° B Primaria",
    n: 22,
    tomada: false
  }, {
    hora: "11:15–12:45",
    curso: "Raz. Matemático",
    aula: "4° A Primaria",
    n: 26,
    tomada: false
  }];

  /* ------------------------------ home ------------------------------ */
  window.SGE_TeacherHome = function TeacherHome() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: "Pedro G\xF3mez Silva",
      size: "lg",
      color: "var(--blue-500)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-h3)",
        color: "var(--text-strong)"
      }
    }, "Buenos d\xEDas, Prof. Pedro"), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, "Martes 07/07/2026 \xB7 3 clases hoy \xB7 Tutor de 3\xB0 A Primaria")), /*#__PURE__*/React.createElement(Badge, {
      tone: "brand"
    }, "Bimestre II"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Mis estudiantes",
      value: "78",
      icon: /*#__PURE__*/React.createElement(Ic.Users, null),
      caption: "3 secciones"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Asistencia tomada",
      value: "1/3",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Calendar, null),
      caption: "clases de hoy"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Notas del bimestre",
      value: "64%",
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Book, null),
      caption: "registradas"
    })), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Mis clases de hoy",
      subtitle: "Marca la asistencia al iniciar cada clase"
    }, /*#__PURE__*/React.createElement("div", null, CLASES_HOY.map(c => /*#__PURE__*/React.createElement("div", {
      key: c.hora,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "13px 18px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-muted)",
        width: 92
      }
    }, c.hora), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600,
        color: "var(--text-strong)"
      }
    }, c.curso), /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-2xs)",
        color: "var(--text-muted)"
      }
    }, c.aula, " \xB7 ", c.n, " estudiantes")), c.tomada ? /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      dot: true
    }, "Asistencia tomada") : /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => {
        goTo("tasist");
        notify("info", "Asistencia", `${c.curso} · ${c.aula} lista para marcar.`);
      }
    }, "Marcar asistencia"))))), /*#__PURE__*/React.createElement(Card, {
      title: "Avance de notas \xB7 Bimestre II",
      subtitle: "Matem\xE1tica"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, [["3° A Primaria", 100], ["3° B Primaria", 68], ["4° A Primaria", 24]].map(([s, v]) => /*#__PURE__*/React.createElement(ProgressBar, {
      key: s,
      label: s,
      value: v,
      showValue: true,
      size: "sm",
      tone: v === 100 ? "success" : v > 50 ? "brand" : "warning"
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Book, null),
      style: {
        alignSelf: "flex-start"
      },
      onClick: () => goTo("notas")
    }, "Ir al registro de notas"))));
  };

  /* ------------------------------ asistencia de estudiantes ------------------------------ */
  const ESTADOS = [{
    k: "P",
    label: "Presente",
    color: "var(--success)"
  }, {
    k: "T",
    label: "Tardanza",
    color: "var(--warning)"
  }, {
    k: "F",
    label: "Falta",
    color: "var(--danger)"
  }, {
    k: "J",
    label: "Justificada",
    color: "var(--info)"
  }];
  const ALUMNOS = ["Camacho Ríos, Alba", "Cárdenas Paz, Bruno", "Espinoza Lara, Caleb", "Flores Ñahui, Dana", "García Solís, Eloy", "Huamán Cruz, Fabia", "Lima Vega, Gino", "Mendoza Roca, Hilda", "Paredes Luna, Iván", "Quispe Roca, María", "Ramos Díaz, Noé", "Salas Torres, Olga"];
  window.SGE_TeacherAttendance = function TeacherAttendance() {
    const [marcas, setMarcas] = React.useState(() => ALUMNOS.map(() => "P"));
    const set = (i, k) => setMarcas(m => m.map((x, j) => j === i ? k : x));
    const counts = ESTADOS.map(e => marcas.filter(m => m === e.k).length);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Clase",
      options: ["Matemática · 3° B Primaria", "Matemática · 3° A Primaria", "Raz. Matemático · 4° A Primaria"],
      defaultValue: "Matem\xE1tica \xB7 3\xB0 B Primaria",
      containerStyle: {
        width: 280
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha",
      type: "date",
      defaultValue: "2026-07-07",
      containerStyle: {
        width: 165
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => {
        setMarcas(ALUMNOS.map(() => "P"));
        notify("info", "Todos presentes", "Ajusta solo las excepciones y guarda.");
      }
    }, "Todos presentes"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
      onClick: () => notify("success", "Asistencia guardada", `Matemática · 3° B · ${counts[0]} presentes, ${counts[1]} tardanzas, ${counts[2]} faltas, ${counts[3]} justificadas.`)
    }, "Guardar asistencia")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }
    }, ESTADOS.map((e, i) => /*#__PURE__*/React.createElement(Badge, {
      key: e.k,
      tone: e.k === "P" ? "success" : e.k === "T" ? "warning" : e.k === "F" ? "danger" : "info",
      dot: true
    }, e.label, ": ", counts[i]))), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Matem\xE1tica \xB7 3\xB0 B Primaria",
      subtitle: "Martes 07/07/2026 \xB7 9:30\u201311:00"
    }, /*#__PURE__*/React.createElement("div", null, ALUMNOS.map((a, i) => /*#__PURE__*/React.createElement("div", {
      key: a,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 18px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-2xs)",
        fontFamily: "var(--font-mono)",
        color: "var(--text-subtle)",
        width: 20,
        textAlign: "right"
      }
    }, i + 1), /*#__PURE__*/React.createElement(Avatar, {
      name: a,
      size: "sm"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, a), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, ESTADOS.map(e => {
      const on = marcas[i] === e.k;
      return /*#__PURE__*/React.createElement("button", {
        key: e.k,
        type: "button",
        title: e.label,
        onClick: () => set(i, e.k),
        style: {
          width: 32,
          height: 32,
          borderRadius: "var(--radius-full)",
          cursor: "pointer",
          font: "var(--type-label)",
          fontWeight: 700,
          lineHeight: 1,
          border: on ? `1.5px solid ${e.color}` : "1px solid var(--border-default)",
          background: on ? e.color : "var(--surface-card)",
          color: on ? "#fff" : "var(--text-muted)",
          transition: "background var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)"
        }
      }, e.k);
    })))))), /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "La asistencia guardada notifica autom\xE1ticamente al apoderado en caso de ", /*#__PURE__*/React.createElement("b", null, "falta"), " (seg\xFAn Configuraci\xF3n \u2192 Notificaciones)."));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/TeacherScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/TreasuryScreen.jsx
try { (() => {
/* Elohim SGE — Gastos e ingresos varios (tesorería). Registers window.SGE_Treasury.
   Tabs: Resumen del mes · Gastos · Otros ingresos. */
(function () {
  const {
    Card,
    Table,
    Badge,
    Avatar,
    Button,
    IconButton,
    Input,
    Select,
    Tabs,
    Alert,
    Tooltip,
    StatCard,
    Dialog,
    Textarea,
    Pagination,
    ProgressBar
  } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = r => window.SGENavigate && window.SGENavigate(r);
  const fmt = n => `S/ ${Number(n).toLocaleString("es-PE", {
    minimumFractionDigits: 2
  })}`;
  const CAT_GASTO = ["Servicios (luz, agua, internet)", "Materiales y útiles", "Mantenimiento y reparaciones", "Infraestructura", "Transporte", "Trámites y licencias", "Otros gastos"];
  const CAT_INGRESO = ["Impresiones y copias", "Alquiler de ambientes", "Trámites documentarios", "Venta de materiales", "Kiosco / cafetería", "Donaciones", "Otros ingresos"];
  const GASTOS = [["G-0219", "05/07", "Reposición caja chica · rendición de 5 gastos menores", "Otros gastos", "Efectivo", 89.5, "Fondo fijo · L. Campos", "L. Campos", {
    tipo: "Caja chica",
    ref: "REND-07-01",
    to: null
  }], ["G-0218", "04/07", "Reparación de impresora de Secretaría", "Mantenimiento y reparaciones", "Efectivo", 120.0, "Multiservicios Rojas", "L. Campos", {
    tipo: "Activo",
    ref: "AC-007",
    to: "inventario"
  }], ["G-0217", "03/07", "Papel bond A4 (10 millares)", "Materiales y útiles", "Transferencia", 260.0, "Librería San Marcos", "L. Campos", {
    tipo: "Compra",
    ref: "OC-0043",
    to: "inventario"
  }], ["G-0216", "02/07", "Servicio de pintado · aulas 3° y 4°", "Infraestructura", "Efectivo", 850.0, "J. Huamán (contratista)", "Dir. Pérez", null], ["G-0215", "01/07", "Internet y telefonía · Julio", "Servicios (luz, agua, internet)", "Transferencia", 380.0, "Movistar", "L. Campos", null], ["G-0214", "01/07", "Luz · Junio", "Servicios (luz, agua, internet)", "Transferencia", 520.0, "Electrocentro", "L. Campos", null]];
  const INGRESOS = [["I-0142", "04/07", "Impresiones y copias · semana", "Impresiones y copias", "Efectivo", 86.5, "L. Campos"], ["I-0141", "03/07", "Constancia de estudios (×4)", "Trámites documentarios", "Efectivo", 60.0, "L. Campos"], ["I-0140", "02/07", "Alquiler de losa deportiva · sábado", "Alquiler de ambientes", "Yape / Plin", 150.0, "L. Campos"], ["I-0139", "01/07", "Certificado de conducta (×2)", "Trámites documentarios", "Efectivo", 30.0, "L. Campos"], ["I-0138", "01/07", "Venta de folder institucional (×12)", "Venta de materiales", "Efectivo", 96.0, "L. Campos"]];

  /* ------------------------------ form dialog ------------------------------ */
  function MovDialog({
    kind,
    open,
    onClose,
    mov
  }) {
    const esGasto = kind === "gasto";
    const [cat, setCat] = React.useState("");
    React.useEffect(() => {
      if (open) setCat(mov ? mov.cat : "");
    }, [open, mov]);
    const esInventariable = esGasto && cat === "Materiales y útiles";
    return /*#__PURE__*/React.createElement(Dialog, {
      open: open,
      onClose: onClose,
      size: "lg",
      icon: esGasto ? /*#__PURE__*/React.createElement(Ic.Cash, null) : /*#__PURE__*/React.createElement(Ic.Receipt, null),
      iconTone: esGasto ? "danger" : "success",
      title: mov ? `Editar · ${mov.det}` : esGasto ? "Registrar gasto" : "Registrar ingreso",
      description: esGasto ? "Egresos operativos: servicios, compras, mantenimiento…" : "Ingresos no académicos: impresiones, alquileres, trámites…",
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: onClose
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          notify("success", mov ? "Movimiento actualizado" : esGasto ? "Gasto registrado" : "Ingreso registrado", mov ? "Cambios guardados." : `Asignado al ${esGasto ? "egreso" : "ingreso"} del día y al resumen del mes.`);
          onClose();
        }
      }, mov ? "Guardar cambios" : "Registrar"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Descripci\xF3n",
      required: true,
      placeholder: esGasto ? "Ej. Compra de papel bond A4" : "Ej. Alquiler de losa deportiva",
      defaultValue: mov ? mov.det : "",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Categor\xEDa",
      required: true,
      placeholder: "Seleccione",
      options: esGasto ? CAT_GASTO : CAT_INGRESO,
      value: cat,
      onChange: e => setCat(e.target.value)
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Monto",
      prefix: "S/.",
      required: true,
      inputMode: "decimal",
      defaultValue: mov ? mov.monto.toFixed(2) : "",
      placeholder: "0.00"
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Fecha",
      type: "date",
      defaultValue: "2026-07-06"
    }), /*#__PURE__*/React.createElement(Select, {
      label: "M\xE9todo",
      options: ["Efectivo", "Yape / Plin", "Transferencia", "Tarjeta"],
      defaultValue: mov ? mov.met : "Efectivo"
    }), esGasto && /*#__PURE__*/React.createElement(Input, {
      label: "Proveedor / beneficiario",
      placeholder: "Ej. Librer\xEDa San Marcos",
      defaultValue: mov ? mov.prov : ""
    }), esGasto && /*#__PURE__*/React.createElement(Input, {
      label: "N\xB0 de comprobante",
      placeholder: "Boleta/factura (opcional)"
    }), /*#__PURE__*/React.createElement(Textarea, {
      label: "Observaciones",
      rows: 2,
      placeholder: "Opcional\u2026",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), esInventariable && /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "\xBFEs una compra de art\xEDculos con stock?",
      style: {
        gridColumn: "1 / -1"
      },
      actions: /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: () => {
          onClose();
          goTo("inventario");
          notify("info", "Inventario", "Regístrala en la pestaña Compras de almacén para que también actualice el stock.");
        }
      }, "Ir a Compras de almac\xE9n")
    }, "Si compraste papel, t\xF3ner, uniformes u otro art\xEDculo del almac\xE9n, reg\xEDstralo en ", /*#__PURE__*/React.createElement("b", null, "Inventario \u2192 Compras de almac\xE9n"), ": el gasto se crear\xE1 aqu\xED solo y adem\xE1s actualizar\xE1 el stock.")));
  }

  /* ------------------------------ tablas ------------------------------ */
  function useMovTable(kind, data, onEdit) {
    const esGasto = kind === "gasto";
    return [{
      key: "cod",
      header: "N°",
      mono: true,
      width: 84
    }, {
      key: "fecha",
      header: "Fecha",
      mono: true,
      align: "center",
      width: 70
    }, {
      key: "det",
      header: "Descripción",
      render: (v, r) => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v), r.prov && /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-2xs)",
          color: "var(--text-muted)"
        }
      }, r.prov))
    }, {
      key: "cat",
      header: "Categoría",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: esGasto ? "danger" : "success"
      }, v.split(" (")[0])
    }, ...(esGasto ? [{
      key: "origen",
      header: "Origen",
      align: "center",
      render: v => v ? /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "link",
        onClick: () => {
          if (v.to) {
            goTo(v.to);
            notify("info", "Inventario", `Abriendo ${v.tipo === "Compra" ? "la orden" : "el activo"} ${v.ref}.`);
          } else notify("info", `Rendición ${v.ref}`, "5 gastos menores del fondo fijo · detalle y comprobantes adjuntos (pestaña Caja chica).");
        }
      }, v.tipo, " \xB7 ", v.ref) : /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral"
      }, "Manual")
    }] : []), {
      key: "met",
      header: "Método",
      align: "center",
      render: v => /*#__PURE__*/React.createElement(Badge, {
        tone: v === "Efectivo" ? "neutral" : v === "Yape / Plin" ? "brand" : "info"
      }, v)
    }, {
      key: "monto",
      header: "Monto",
      num: true,
      mono: true,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          fontWeight: 600,
          color: esGasto ? "var(--danger)" : "var(--success)"
        }
      }, esGasto ? "−" : "+", " ", fmt(v))
    }, {
      key: "reg",
      header: "Registró",
      render: v => /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 7
        }
      }, /*#__PURE__*/React.createElement(Avatar, {
        name: v,
        size: "xs"
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-caption)"
        }
      }, v))
    }, {
      key: "acc",
      header: "",
      align: "right",
      render: (_, r) => r.origen ? /*#__PURE__*/React.createElement(Tooltip, {
        content: `Se corrige en su módulo de origen (${r.origen.ref})`
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Ver origen",
        size: "sm",
        onClick: () => {
          if (r.origen.to) {
            goTo(r.origen.to);
            notify("info", "Inventario", `Abriendo ${r.origen.ref} — los gastos automáticos se corrigen allí.`);
          } else notify("info", `Rendición ${r.origen.ref}`, "Se gestiona en la pestaña Caja chica — los gastos automáticos no se editan aquí.");
        }
      }, /*#__PURE__*/React.createElement(Ic.Eye, null))) : /*#__PURE__*/React.createElement("div", {
        style: {
          display: "inline-flex",
          gap: 2
        }
      }, /*#__PURE__*/React.createElement(Tooltip, {
        content: "Editar"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Editar",
        size: "sm",
        onClick: () => onEdit(r)
      }, /*#__PURE__*/React.createElement(Ic.Pencil, null))), /*#__PURE__*/React.createElement(Tooltip, {
        content: "Anular"
      }, /*#__PURE__*/React.createElement(IconButton, {
        label: "Anular",
        size: "sm",
        variant: "danger",
        onClick: () => notify("warning", "Movimiento anulado", `${r.cod} anulado — queda en el historial con motivo.`)
      }, /*#__PURE__*/React.createElement(Ic.Trash, null))))
    }];
  }
  function MovTab({
    kind
  }) {
    const esGasto = kind === "gasto";
    const [dlg, setDlg] = React.useState(null); // {} nuevo · {mov} editar
    const data = (esGasto ? GASTOS : INGRESOS).map(g => esGasto ? {
      cod: g[0],
      fecha: g[1],
      det: g[2],
      cat: g[3],
      met: g[4],
      monto: g[5],
      prov: g[6],
      reg: g[7],
      origen: g[8]
    } : {
      cod: g[0],
      fecha: g[1],
      det: g[2],
      cat: g[3],
      met: g[4],
      monto: g[5],
      reg: g[6]
    });
    const cols = useMovTable(kind, data, r => setDlg({
      mov: r
    }));
    const total = data.reduce((a, r) => a + r.monto, 0);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, esGasto && /*#__PURE__*/React.createElement(Alert, {
      tone: "info"
    }, "Los gastos con origen ", /*#__PURE__*/React.createElement("b", null, "Compra"), ", ", /*#__PURE__*/React.createElement("b", null, "Activo"), " o ", /*#__PURE__*/React.createElement("b", null, "Caja chica"), " se generaron autom\xE1ticamente y se corrigen en su m\xF3dulo de origen; aqu\xED solo se registran gastos sin stock (servicios, contratistas, tr\xE1mites)."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 200
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Buscar por descripci\xF3n, proveedor o N\xB0\u2026",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Search, null)
    })), /*#__PURE__*/React.createElement(Select, {
      placeholder: "Categor\xEDa",
      options: esGasto ? CAT_GASTO : CAT_INGRESO,
      containerStyle: {
        width: 210
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "",
      type: "date",
      defaultValue: "2026-07-06",
      containerStyle: {
        width: 160
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Download, null),
      onClick: () => notify("success", "Exportado", `${esGasto ? "Gastos" : "Ingresos"} de Julio 2026 descargados en Excel.`)
    }, "Exportar"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setDlg({})
    }, esGasto ? "Registrar gasto" : "Registrar ingreso")), /*#__PURE__*/React.createElement(Card, {
      flush: true
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: data,
      hover: true,
      zebra: true
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "10px 16px",
        borderTop: "1px solid var(--border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Pagination, {
      page: 1,
      pageCount: 4,
      onPageChange: () => {},
      total: 38,
      pageSize: 10
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontFamily: "var(--font-mono)",
        color: esGasto ? "var(--danger)" : "var(--success)"
      }
    }, esGasto ? "−" : "+", " ", fmt(total), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontFamily: "var(--font-sans)",
        fontWeight: 400
      }
    }, "esta semana")))), /*#__PURE__*/React.createElement(MovDialog, {
      kind: kind,
      open: !!dlg,
      onClose: () => setDlg(null),
      mov: dlg && dlg.mov
    }));
  }

  /* ------------------------------ resumen ------------------------------ */
  function Resumen() {
    const RUBROS = [{
      r: "Pensiones y matrículas",
      m: 84320,
      tone: "success",
      to: "pagos"
    }, {
      r: "Otros ingresos",
      m: 1830,
      tone: "success",
      to: null
    }, {
      r: "Planilla",
      m: -28450,
      tone: "danger",
      to: "docentes"
    }, {
      r: "Gastos operativos",
      m: -4780,
      tone: "danger",
      to: null
    }];
    const ingresos = 86150,
      gastos = 33230,
      neto = ingresos - gastos;
    const catGastos = [["Servicios", 900], ["Infraestructura", 850], ["Materiales", 620], ["Mantenimiento", 410], ["Otros", 2000]];
    const maxCat = Math.max(...catGastos.map(c => c[1]));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Ingresos \xB7 Julio",
      value: fmt(ingresos).replace(".00", ""),
      iconTone: "success",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      delta: 5.2,
      caption: "pensiones + varios"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Egresos \xB7 Julio",
      value: fmt(gastos).replace(".00", ""),
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Chart, null),
      delta: 2.1,
      deltaDirection: "up",
      caption: "planilla + gastos"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Resultado neto",
      value: fmt(neto).replace(".00", ""),
      icon: /*#__PURE__*/React.createElement(Ic.Check, null),
      caption: "del mes en curso"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Caja disponible",
      value: "S/ 18,940",
      iconTone: "accent",
      icon: /*#__PURE__*/React.createElement(Ic.Receipt, null),
      caption: "efectivo + bancos"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 16,
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Ingresos vs egresos por rubro",
      subtitle: "Julio 2026"
    }, /*#__PURE__*/React.createElement("div", null, RUBROS.map(x => /*#__PURE__*/React.createElement("div", {
      key: x.r,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 99,
        background: x.m > 0 ? "var(--success)" : "var(--danger)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: "var(--type-label)",
        color: "var(--text-strong)"
      }
    }, x.r), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        color: x.m > 0 ? "var(--success)" : "var(--danger)"
      }
    }, x.m > 0 ? "+" : "−", " ", fmt(Math.abs(x.m))), x.to && /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      iconRight: /*#__PURE__*/React.createElement(Ic.ChevronRight, null),
      onClick: () => goTo(x.to)
    }, "Ver"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 18px",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--surface-sunken)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-label)",
        fontWeight: 600
      }
    }, "Resultado del mes"), /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-h3)",
        fontFamily: "var(--font-mono)",
        color: "var(--success)"
      }
    }, "+ ", fmt(neto))))), /*#__PURE__*/React.createElement(Card, {
      title: "Gastos por categor\xEDa",
      subtitle: "Julio 2026 \xB7 S/ 4,780"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12
      }
    }, catGastos.map(([c, m]) => /*#__PURE__*/React.createElement(ProgressBar, {
      key: c,
      label: c,
      value: m,
      max: maxCat,
      showValue: true,
      size: "sm",
      tone: "danger",
      valueFormat: () => fmt(m).replace(".00", "")
    }))))));
  }

  /* ------------------------------ Caja chica ------------------------------ */
  function CajaChica() {
    const FONDO = 500;
    const ITEMS = [["07/07", "Pasajes · trámite en UGEL Satipo", 12.0, "—"], ["06/07", "Agua y azúcar para dirección", 18.5, "B-0041"], ["04/07", "Plumones y mota (urgente)", 24.0, "B-0038"], ["03/07", "Fotocopias notariales", 15.0, "—"], ["01/07", "Movilidad · compra de materiales", 20.0, "B-0032"]];
    const gastado = ITEMS.reduce((a, x) => a + x[2], 0);
    const saldo = FONDO - gastado;
    const [nuevo, setNuevo] = React.useState(false);
    const [rendir, setRendir] = React.useState(false);
    const cols = [{
      key: "fecha",
      header: "Fecha",
      mono: true,
      width: 70,
      align: "center"
    }, {
      key: "concepto",
      header: "Concepto",
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-label)",
          color: "var(--text-strong)"
        }
      }, v)
    }, {
      key: "comp",
      header: "Comprobante",
      align: "center",
      render: v => v === "—" ? /*#__PURE__*/React.createElement(Badge, {
        tone: "neutral",
        size: "sm"
      }, "Sin comprobante") : /*#__PURE__*/React.createElement("span", {
        style: {
          font: "var(--type-mono)"
        }
      }, v)
    }, {
      key: "monto",
      header: "Monto",
      num: true,
      mono: true,
      render: v => /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--danger)"
        }
      }, "\u2212 ", fmt(v))
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(StatCard, {
      label: "Fondo fijo",
      value: fmt(FONDO).replace(".00", ""),
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      caption: "responsable: L. Campos"
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Gastado",
      value: fmt(gastado),
      iconTone: "danger",
      icon: /*#__PURE__*/React.createElement(Ic.Chart, null),
      caption: `${ITEMS.length} gastos menores`
    }), /*#__PURE__*/React.createElement(StatCard, {
      label: "Saldo disponible",
      value: fmt(saldo),
      iconTone: saldo < FONDO * 0.3 ? "danger" : "success",
      icon: /*#__PURE__*/React.createElement(Ic.Check, null),
      caption: saldo < FONDO * 0.3 ? "por debajo del 30% — rendir" : "fondo saludable"
    })), /*#__PURE__*/React.createElement(Alert, {
      tone: "info",
      title: "C\xF3mo opera"
    }, "Cubre gastos menores del d\xEDa sin pasar por Tesorer\xEDa. Al ", /*#__PURE__*/React.createElement("b", null, "rendir"), ", se crea un \xFAnico gasto consolidado en ", /*#__PURE__*/React.createElement("b", null, "Gastos"), " (origen: Caja chica) y el fondo se repone a ", fmt(FONDO).replace(".00", ""), "."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Receipt, null),
      onClick: () => setRendir(true)
    }, "Rendir y reponer fondo"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: /*#__PURE__*/React.createElement(Ic.Plus, null),
      onClick: () => setNuevo(true)
    }, "Registrar gasto menor")), /*#__PURE__*/React.createElement(Card, {
      flush: true,
      title: "Gastos del fondo \xB7 Julio 2026"
    }, /*#__PURE__*/React.createElement(Table, {
      columns: cols,
      data: ITEMS.map(x => ({
        fecha: x[0],
        concepto: x[1],
        monto: x[2],
        comp: x[3]
      })),
      hover: true
    })), /*#__PURE__*/React.createElement(Dialog, {
      open: nuevo,
      onClose: () => setNuevo(false),
      title: "Registrar gasto menor",
      icon: /*#__PURE__*/React.createElement(Ic.Cash, null),
      description: `Saldo disponible: ${fmt(saldo)}`,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setNuevo(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setNuevo(false);
          notify("success", "Gasto registrado", "Descontado del fondo de caja chica.");
        }
      }, "Registrar"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 14,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Input, {
      label: "Concepto",
      required: true,
      placeholder: "Ej. pasajes, fotocopias\u2026",
      containerStyle: {
        gridColumn: "1 / -1"
      }
    }), /*#__PURE__*/React.createElement(Input, {
      label: "Monto",
      prefix: "S/.",
      required: true,
      inputMode: "decimal",
      placeholder: "0.00",
      hint: `Máx. ${fmt(saldo)}`
    }), /*#__PURE__*/React.createElement(Input, {
      label: "N\xB0 de comprobante",
      placeholder: "Opcional (boleta)"
    }))), /*#__PURE__*/React.createElement(Dialog, {
      open: rendir,
      onClose: () => setRendir(false),
      title: "Rendir y reponer fondo",
      icon: /*#__PURE__*/React.createElement(Ic.Receipt, null),
      iconTone: "warning",
      description: `${ITEMS.length} gastos · ${fmt(gastado)} rendidos`,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => setRendir(false)
      }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
        variant: "accent",
        iconLeft: /*#__PURE__*/React.createElement(Ic.Check, null),
        onClick: () => {
          setRendir(false);
          notify("success", "Fondo repuesto", `Gasto consolidado de ${fmt(gastado)} creado en Gastos (origen: Caja chica) · fondo de vuelta a ${fmt(FONDO).replace(".00", "")}.`);
        }
      }, "Rendir ", fmt(gastado)))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 4
      }
    }, /*#__PURE__*/React.createElement(Alert, {
      tone: "warning",
      title: "Un solo gasto consolidado"
    }, "Los ", ITEMS.length, " gastos menores se registrar\xE1n como un \xFAnico movimiento en ", /*#__PURE__*/React.createElement("b", null, "Gastos"), " con el detalle adjunto; 2 no tienen comprobante y quedar\xE1n observados."), /*#__PURE__*/React.createElement(Select, {
      label: "Origen de la reposici\xF3n",
      options: ["Efectivo de caja del día", "Transferencia"],
      defaultValue: "Efectivo de caja del d\xEDa"
    }))));
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_Treasury = function Treasury() {
    const [tab, setTab] = React.useState("resumen");
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        id: "resumen",
        label: "Resumen del mes"
      }, {
        id: "gastos",
        label: "Gastos",
        count: 6
      }, {
        id: "ingresos",
        label: "Otros ingresos",
        count: 5
      }, {
        id: "cajachica",
        label: "Caja chica"
      }]
    }), tab === "resumen" && /*#__PURE__*/React.createElement(Resumen, null), tab === "gastos" && /*#__PURE__*/React.createElement(MovTab, {
      kind: "gasto"
    }), tab === "ingresos" && /*#__PURE__*/React.createElement(MovTab, {
      kind: "ingreso"
    }), tab === "cajachica" && /*#__PURE__*/React.createElement(CajaChica, null));
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/TreasuryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/sge/icons.jsx
try { (() => {
/* Shared icon set for the Elohim SGE UI kit — Lucide-style 1.8px stroke icons.
   Registered on window.SGEIcons for the screen scripts. */
(function () {
  const I = (paths, opts) => props => React.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: opts && opts.fill ? "currentColor" : "none",
    stroke: opts && opts.fill ? "none" : "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: "1em",
    height: "1em"
  }, props), paths.map((d, i) => React.createElement("path", {
    key: i,
    d
  })));
  // multi-element helper
  const Raw = children => props => React.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: "1em",
    height: "1em"
  }, props), React.createElement("g", {
    dangerouslySetInnerHTML: {
      __html: children
    }
  }));
  window.SGEIcons = {
    Dashboard: Raw('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
    Users: Raw('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    Teacher: Raw('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),
    Book: Raw('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
    Cash: Raw('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>'),
    Calendar: Raw('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
    Clipboard: Raw('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>'),
    Chart: Raw('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
    Settings: Raw('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
    Bell: Raw('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>'),
    Search: Raw('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
    Plus: Raw('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    Filter: Raw('<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'),
    Download: Raw('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    Pencil: Raw('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    Trash: Raw('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'),
    Eye: Raw('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>'),
    Mail: Raw('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/>'),
    Lock: Raw('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    User: Raw('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    Check: Raw('<polyline points="20 6 9 17 4 12"/>'),
    ChevronRight: Raw('<polyline points="9 18 15 12 9 6"/>'),
    Home: Raw('<path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>'),
    Logout: Raw('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
    Phone: Raw('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.96.72 2.88a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.92.35 1.88.59 2.88.72A2 2 0 0 1 22 16.92z"/>'),
    Building: Raw('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/>'),
    Layers: Raw('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),
    ChevronDown: Raw('<polyline points="6 9 12 15 18 9"/>'),
    Copy: Raw('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    Receipt: Raw('<path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/>'),
    Printer: Raw('<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
    Send: Raw('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),
    Megaphone: Raw('<path d="M3 11l18-7v18l-18-7v-4z"/><path d="M7 15v4a2 2 0 0 0 2 2h1"/>'),
    Box: Raw('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/>'),
    ArrowRight: Raw('<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    Clock: Raw('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>')
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/sge/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarGroup = __ds_scope.AvatarGroup;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.ToastStack = __ds_scope.ToastStack;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Topbar = __ds_scope.Topbar;

})();
