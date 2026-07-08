# Elohim SGE — Design System

Design system for the **Sistema de Gestión Escolar (SGE)** of **I.E.P. Elohim** — *Colegio Cristocéntrico*, Satipo, Junín, Perú. Academic year 2026.

The SGE is a school ERP: enrollment, students, teachers, grades, attendance, academic periods (levels / grades / sections), tuition (pensiones) and teacher payroll, with online tuition payments. This system covers everything from the login screen to the smallest button, in light **and** dark mode.

## Sources
- `uploads/insignia.png` → copied to `assets/elohim-insignia.png`. **The only brand source provided.** The entire palette is derived from it: the blue shield field, the gold border + ELOHIM banner, the brown family/open-book figures, and the cream lettering.
- No codebase, Figma, or existing screens were provided. Components, screens and copy are an original, brand-consistent proposal — to be validated and iterated with the school.

---

## Content fundamentals
The product speaks **Spanish (Perú)**, to school administrators and staff.

- **Tone:** clear, warm, institutional. Respectful and plain — never jokey, never marketing-y inside the app.
- **Person:** address the user informally with **tú** for actions ("Ingresa tus credenciales", "¿Olvidaste tu contraseña?"). Refer to people by role: *estudiante, apoderado, docente, director*.
- **Casing:** Sentence case for everything — titles, buttons, labels. Reserve UPPERCASE for short eyebrows/section labels (`.eyebrow`, table column heads) with wide tracking.
- **Buttons:** imperative verbs — "Matricular", "Registrar pago", "Guardar notas", "Generar cuotas", "Exportar acta".
- **Money:** always `S/ ` prefix with tabular figures, two decimals — `S/ 280.00`. Use the mono font for amounts, DNI, codes, dates.
- **Dates:** `dd/mm` in dense tables, `aaaa-mm-dd` in inputs. Vigesimal grades 0–20, aprueba con 11.
- **Status words:** Activo · Retirado · Becado · Matriculado (students); Pagado · Pendiente · Vencido (payments); Aprobado · Desaprobado (grades). Keep these exact for consistent badge tones.
- **Domain vocabulary:** pensión, cuota, matrícula, nivel (Inicial/Primaria/Secundaria), grado, sección, turno (mañana/tarde), bimestre/periodo, apoderado, planilla.
- **Emoji:** none. The brand carries warmth through color and the insignia, not emoji.

---

## Visual foundations
- **Color:** institutional **blue** is the primary/action color (calm, trustworthy — right for an ERP). **Gold** is the accent for a single standout action or highlight, never large body fills. **Brown** grounds warmly (icons, the badge). **Cream** is a warm paper note. Neutrals are a slightly cool blue-gray so grays harmonize with the blue. Everything derives from the badge.
- **The dark institutional rail:** the sidebar is deep blue (`--sidebar-*`) in **both** light and dark modes — it's the brand anchor of the shell.
- **Type:** one family system — **IBM Plex Sans** for all UI and text (professional, neutral, quiet), **IBM Plex Mono** for figures (money, DNI, codes, grades, dates) so columns align. Modest 1.20-ish scale tuned for dense admin screens. Min UI size 13–14px.
- **Spacing:** 4px base unit; 8px rhythm dominates. Generous card padding (16–18px), tight table rows (11px).
- **Backgrounds:** flat and calm. App canvas is a near-white cool gray; cards are white. **No decorative gradients** in the product chrome — the one gradient lives on the login brand panel only (a deep-blue diagonal with a subtle dotted texture). No photography, no illustration beyond the insignia.
- **Corners:** soft, not pill-everything. Inputs/buttons/badges `--radius-md` (8px), cards `--radius-lg` (12px), modals `--radius-xl` (16px). Status pills and toggles are fully round.
- **Borders:** 1px hairlines in cool neutrals (`--border-subtle/-default/-strong`). Cards are border + soft shadow, not heavy.
- **Shadows:** cool **blue-tinted**, restrained. `--shadow-sm` for cards, `-md` for popovers/raised, `-lg/-xl` for dialogs/toasts. Dark mode uses black-based shadows.
- **Motion:** quick and functional. `--duration-fast` (120ms) for hovers, `--duration-normal` (200ms) for toggles/dialogs. Standard easing `cubic-bezier(0.2,0,0,1)`; entrances use an ease-out with a small translate+scale. No bounces, no infinite loops.
- **Hover states:** subtle surface tint (`--surface-hover`), or one step darker for filled buttons (`--brand-hover`). **Press:** filled buttons go a step darker (`--brand-active`) + a 0.5px nudge down.
- **Focus:** 3px soft blue ring (`--shadow-focus`) — always visible, accessible.
- **Selected/active:** brand-soft background tint; the active sidebar item gets a gold left accent bar.
- **Transparency/blur:** only the dialog overlay (translucent deep-blue + 2px blur). Otherwise surfaces are opaque.

---

## Iconography
- **System:** Lucide-style line icons — 24px viewbox, **1.8px** stroke, round caps/joins, `currentColor`. They inherit text color and sit at ~1.15em next to labels.
- **Where:** the UI kit ships a curated set in `ui_kits/sge/icons.jsx` (registered on `window.SGEIcons`: Dashboard, Users, Teacher, Book, Cash, Calendar, Clipboard, Chart, Settings, Bell, Search, Plus, Filter, Download, Pencil, Trash, Eye, Mail, Lock, User, Check, ChevronRight, Home, Logout, Phone, Building, Clock).
- **Components** that need a default icon (Alert, Toast, Dialog, Select chevron, Checkbox tick, sort arrows, pagination) draw their own inline SVG in the same stroke style, so primitives are self-contained.
- **CDN substitution:** the curated icons approximate **Lucide**. For broader coverage, load Lucide from CDN and keep the 1.8px stroke. *(Flagged substitution — no brand icon set was provided.)*
- **No emoji, no unicode glyphs** as icons. The only raster asset is the insignia PNG.

---

## Index / manifest
**Root**
- `styles.css` — the single entry point consumers link. `@import`s the tokens + base in order.
- `tokens/` — `palette.css` (raw ramps) · `semantic.css` (aliases + dark mode) · `typography.css` · `fonts.css` (IBM Plex via Google Fonts) · `layout.css` (spacing/radius/shadow/motion/z) · `base.css` (reset + document defaults).
- `assets/elohim-insignia.png` — the badge / logo.
- `SKILL.md` — Agent-Skills wrapper.

**Components** (`window.ElohimSGEDesignSystem_956020`) — each dir has a `@dsCard` demo.
- `components/forms/` — Button, IconButton, Input, Textarea, Select, Checkbox, Radio + RadioGroup, Switch.
- `components/data/` — Card, Badge, Tag, Avatar + AvatarGroup, StatCard, ProgressBar, Table.
- `components/navigation/` — Sidebar, Topbar, Tabs, Breadcrumb, Pagination.
- `components/feedback/` — Alert, Toast + ToastStack, Dialog, Tooltip, EmptyState.

**Guidelines** (`guidelines/*.card.html`) — foundation specimen cards: brand/neutral/semantic colors, surfaces & text, dark mode, type (display + body/figures), spacing, radius & elevation, the insignia.

**UI kit** (`ui_kits/sge/`) — interactive SGE dashboard: login, panel, estudiantes, pensiones, notas, plus the app shell. See its `README.md`.

## Caveats
- **Fonts** load from Google Fonts (IBM Plex Sans/Mono) rather than self-hosted files — swap `tokens/fonts.css` for local `@font-face` if you need offline/self-hosted.
- The **insignia** is an AI-style raster badge; if a clean vector logo exists, drop it into `assets/` and update the login + sidebar references.
- All product copy, names and figures are **sample data** pending the school's real structure (niveles, grados, secciones, montos de pensión, cursos).
