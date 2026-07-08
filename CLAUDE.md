# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

**Elohim SGE** — Sistema de Gestión Escolar (ERP escolar) para la I.E.P. Elohim (Satipo, Junín, Perú). Instalación única para un solo colegio (~500 estudiantes), **no** SaaS multi-tenant. El producto habla español (Perú); contexto: escala de notas literal AD/A/B/C, año académico marzo–diciembre, niveles Inicial/Primaria/Secundaria, SIAGIE como referencia nacional, moneda en soles (`S/ 1,234.00`).

## Estado actual del repositorio

**Todavía no hay código de aplicación.** Solo existe `design/`: el paquete de handoff con el design system, el prototipo interactivo y la documentación de decisiones. El código de producción se construirá desde cero siguiendo lo ya decidido en `design/docs/stack-tecnico.md`.

- Ver el prototipo: abrir `design/ui_kits/sge/index.html` en el navegador (corre standalone; login con selector de rol Administrador/Docente/Portería). Vistas móviles en `design/ui_kits/sge/mobile.html`.
- No hay `package.json`, ni build, ni tests aún. Cuando se cree el monorepo, actualizar esta sección con los comandos reales.

## Documentos fuente (leer antes de implementar cualquier módulo)

- `design/HANDOFF.md` — mapa del paquete completo, reglas de negocio no negociables, interacciones.
- `design/docs/alcance-funcional.md` — inventario de módulos, decisiones funcionales, vocabulario de estados.
- `design/docs/stack-tecnico.md` — stack, arquitectura, metodología y orden de releases (R1–R5).
- `design/docs/responsive.md` — reglas responsive por patrón (desktop-first; breakpoints lg ≥1024 / md 768–1023 / sm <768).
- `design/readme.md` — fundamentos de marca, tono de contenido y tipografía.

Los `.jsx` del prototipo en `design/ui_kits/sge/` **son la especificación** de layout, estados y comportamiento de cada pantalla — pero cargan React vía Babel standalone por ser prototipo: se **recrean** en TSX de producción, no se copian tal cual.

## Stack y arquitectura decididos (no re-debatir)

- **Frontend:** React 18 + TypeScript + Vite (SPA, sin Next.js). React Router, TanStack Query (estado de servidor), Zustand (estado de UI), React Hook Form + Zod, TanStack Table. **Sin Tailwind ni MUI** — se usa el design system propio (tokens CSS).
- **Backend:** NestJS + Prisma. Jobs con **pg-boss** (sin Redis). PDFs con Puppeteer sobre plantillas HTML.
- **BD:** PostgreSQL 16. Dinero en `NUMERIC(10,2)` (nunca float). Una sola BD con `academic_year_id` en entidades anuales (no un esquema por año). Restricciones en la BD (`CHECK`, `UNIQUE`, FKs), no solo en código.
- **Monorepo:**
  ```
  apps/web       → React (Vite)
  apps/api       → NestJS
  packages/shared → tipos, enums de estados, schemas Zod, cálculo puro (planilla, prorrateo, mora)
  packages/ui    → design system portado (componentes + tokens)
  ```
- **Monolito modular** — módulos backend calcan el sidebar (`identity`, `academic-structure`, `enrollment`, `students`, `guardians`, `staff`, `billing`, `cashier`, `treasury`, `inventory`, `grades`, `attendance`, `conduct`, `calendar`, `announcements`, `reports`, `notifications`). Comunicación entre módulos por **eventos de dominio internos** (event emitter de Nest + outbox): ej. `CompraRecibida` → inventory sube stock, treasury crea gasto.
- **Infra:** Docker Compose (app + postgres + caddy) en un VPS. CI con GitHub Actions.
- **Metodología:** DDD ligero (sin event sourcing, sin CQRS). Sin repository pattern sobre Prisma. State machines explícitas para estados (cuota, compromiso, devolución, orden de compra). Strategy para AFP vs ONP. Tests unitarios (Vitest) **obligatorios** para las reglas de dinero en `packages/shared` (por eso esas funciones se escriben puras). E2E (Playwright) solo para flujos críticos.

## Orden de construcción (releases)

R1 núcleo (identity + estructura académica + estudiantes/apoderados + matrícula + cronograma) → R2 dinero (caja, pensiones, mora, tesorería) → R3 personal (marcación, planilla) → R4 académico (asistencia, notas, conducta, comunicados) → R5 extensiones (inventario, pagos en línea, portal apoderado). Cada release entra a producción y se usa — no big bang.

## Reglas de negocio no negociables

1. **Un solo punto de registro del dinero**: cada movimiento se registra una vez y sus efectos se derivan por evento (compra recibida → gasto automático; venta en caja → descuenta stock). Los registros automáticos llevan badge de origen y **no se editan** en el módulo destino.
2. **Nada se borra**: anulación con justificación obligatoria (mín. 10 caracteres); historial siempre. Auditoría append-only.
3. **Aprobaciones de dos pasos**: devoluciones y compromisos de pago (Secretaría propone → Admin aprueba).
4. **Años cerrados = solo lectura a nivel API**, no solo UI.
5. **Todo lo configurable va a tablas**: día de corte de traslados, tolerancias de marcación, criterios de evaluación, catálogo AFP, mora — nada hard-codeado.
6. Roles: admin (todo) · secretaría/caja · docente (solo sus aulas) · portería (solo marcación) · apoderado (portal futuro).
7. Relación estudiante↔apoderado es **N:M**.
8. Términos del dominio en español, sin traducir a medias: `pension`, `apoderado`, `compromiso`, `cuota`, `matrícula`, `planilla` (entidades/enums del código pueden ir en inglés).

## Design system (fuente de verdad visual)

- Tokens en `design/styles.css` → `design/tokens/*.css` (palette → semantic → typography → layout → base). Consumir **siempre** los alias semánticos (`--brand`, `--surface-card`, `--text-body`, `--danger-soft`…), nunca los valores crudos. Dark mode = mismos alias bajo `[data-theme="dark"]`.
- 28 componentes de referencia en `design/components/{forms,data,navigation,feedback}/` — cada uno con `.jsx` (implementación), `.d.ts` (contrato de props) y `.prompt.md` (uso). Se portan a TSX **manteniendo API y CSS**; el UI kit no reimplementa primitivas — si algo se ve distinto, es un bug del port.
- Tipografía: IBM Plex Sans (UI) + IBM Plex Mono (dinero, DNI, códigos, fechas, notas). Iconos estilo Lucide con stroke 1.8px (en producción: `lucide-react`).
- Copy: sentence case, tuteo, verbos imperativos en botones ("Matricular", "Registrar pago"), sin emoji. Estados exactos para badges: Pagado/Pendiente/Vencido/Anulado/Exonerado (cuotas), Activo/Becado/Retirado/Trasladado/Egresado/Reservado (estudiantes), etc. — ver vocabulario completo en `alcance-funcional.md`.
