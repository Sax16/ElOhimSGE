---
name: elohim-sge-design
description: Use this skill to generate well-branded interfaces and assets for the Elohim SGE (school-management system of I.E.P. Elohim, Colegio Cristocéntrico, Satipo), either for production or throwaway prototypes/mocks. Contains the design guidelines, colors, type, fonts, insignia asset, and a full React UI-kit of components for prototyping a school ERP.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (`styles.css` + `tokens/`, `components/`, `guidelines/`, `ui_kits/sge/`, `assets/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view: link `styles.css`, load `_ds_bundle.js`, and read components from `window.ElohimSGEDesignSystem_956020` (see any `*.card.html` for the exact pattern). The brand is bilingual-aware but the product is **Spanish (Perú)** — keep copy in Spanish, address the user with *tú*, prefix money with `S/ ` in the mono font, and use the status vocabulary (Activo/Becado/Retirado · Pagado/Pendiente/Vencido · Aprobado/Desaprobado).

If working on production code, copy the tokens + components and follow the rules here to become an expert in designing with this brand. Honor light **and** dark mode (`[data-theme="dark"]`), the dark institutional blue sidebar, gold used sparingly as accent, Lucide-style 1.8px icons, and the calm flat (no decorative gradients) aesthetic.

If the user invokes this skill without other guidance, ask what they want to build or design, ask a few focused questions (which SGE module, light/dark, audience), then act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
