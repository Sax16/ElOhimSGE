# Handoff: Elohim SGE — Sistema de Gestión Escolar (I.E.P. Elohim, Satipo)

## Overview
Paquete de traspaso para implementar el **SGE completo** en código de producción. Contiene el design system (tokens + 28 componentes React), el prototipo interactivo de los ~20 módulos del panel, las vistas móviles de referencia, y la documentación de alcance funcional, reglas de negocio, responsive y stack técnico ya decidido.

## Sobre los archivos de diseño
Los archivos de este paquete son **referencias de diseño creadas en HTML/JSX** — prototipos que muestran la apariencia y el comportamiento previstos, **no código de producción para copiar directamente**. La tarea es **recrear estos diseños** en el entorno objetivo definido en `docs/stack-tecnico.md`: **React 18 + TypeScript + Vite** (frontend), **NestJS + Prisma + PostgreSQL** (backend), monorepo con `packages/ui` (design system portado) y `packages/shared` (tipos, schemas Zod y cálculos puros). Los `.jsx` del prototipo cargan React vía Babel standalone por ser prototipo; en producción se portan a TSX compilado.

## Fidelidad
**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios, sombras e interacciones son finales y salen de tokens CSS (`styles.css` + `tokens/`). Recrear pixel-perfect usando esos mismos tokens. Los datos (nombres, montos, fechas) son de ejemplo.

## Cómo navegar el prototipo
Abrir `ui_kits/sge/index.html`. Login demo con selector de rol (**Administrador / Docente / Portería** — cada uno ve un menú distinto). El shell maneja: ruta activa (persistida), colapso de sidebar, modo claro/oscuro (`data-theme="dark"` en `<html>`), selector de año académico (años cerrados = banner solo-lectura), y toasts globales (`window.SGEToast`) + navegación cruzada entre módulos (`window.SGENavigate`). `ui_kits/sge/mobile.html` muestra las dos vistas móviles prioritarias.

## Módulos (pantallas)
Cada módulo es un archivo `ui_kits/sge/<X>Screen.jsx` — el archivo ES la especificación de layout, estados y comportamiento. Inventario completo y decisiones funcionales en `docs/alcance-funcional.md`.

| Módulo | Archivo | Esencia |
|---|---|---|
| Login | LoginScreen.jsx | Split brand/formulario; selector de rol demo |
| Panel (dashboard) | DashboardScreen.jsx | KPIs, cobranza del mes, próximos egresos, principales deudores |
| Estructura académica | AcademicStructureScreen.jsx | Árbol Nivel→Grado→Sección (tutor + auxiliar opcional, vacantes), programas, plan de estudios, asistente de nuevo año (copia + promoción) |
| Matrícula | EnrollmentScreen.jsx | Wizard 5 pasos → genera cronograma; soporta **traslado entrante** (SIAGIE, pensiones solo meses restantes, día de corte configurable) |
| Estudiantes | StudentsScreen.jsx | Roster, ficha (salud/emergencia, foto 3×4, **carnet CR80 con QR**), retiro/traslado saliente |
| Apoderados | GuardiansScreen.jsx | Relación N:M con estudiantes, deuda familiar consolidada, recordatorios |
| Pensiones | PaymentsScreen.jsx | Cuotas por estado + **compromisos de pago** (propone Secretaría, aprueba Admin, congela mora) |
| Caja y cobros | CashierScreen.jsx | Cobro multi-cuota + otros conceptos (descuenta stock), caja del día, **devoluciones** con aprobación |
| Tarifario y becas | FeesScreen.jsx | Tarifas por nivel/programa, mora, día de corte de traslados, descuentos automáticos vs manuales |
| Gastos e ingresos | TreasuryScreen.jsx | Tesorería con orígenes automáticos no editables (Compra/Activo/Caja chica) + **caja chica** con rendición |
| Inventario y activos | InventoryScreen.jsx | Almacén, compras de almacén (→ gasto automático), activos/laboratorios con mantenimiento, biblioteca |
| Personal | StaffScreen.jsx | Fichas (régimen AFP/ONP, horario individual), marcación con reglas por grupo, **planilla peruana** con desglose de boleta, descuentos manuales/anulables con justificación |
| Notas | GradesScreen.jsx | Registro por curso y **libretas dinámicas** (escala literal AD/A/B/C, aspectos formativos + evaluación del apoderado configurables) |
| Asistencia estudiantes | (portal docente) | Pasa lista por aula — versión móvil en mobile.html |
| Conducta | ConductScreen.jsx | Incidencias Leve/Moderada/Grave; grave → notifica y cita al apoderado |
| Calendario académico | CalendarScreen.jsx | Feriados (bloquean asistencia/marcación), exámenes, actividades, vencimientos |
| Comunicados | AnnouncementsScreen.jsx | Avisos a familias por canal |
| Reportes | ReportsScreen.jsx | 6 reportes exportables |
| Configuración | SettingsScreen.jsx | Institución, notificaciones, **Evaluación** (criterios configurables), **Planilla** (catálogo AFP, gratificaciones/CTS), usuarios y roles |
| Marcación Portería | StaffScreen.jsx (`SGE_StaffAttendance`) | Portal reducido del rol Portería |

## Reglas de negocio no negociables
1. **Un solo punto de registro del dinero**: compra recibida → gasto automático; venta en caja → stock; rendición de caja chica → gasto consolidado. Los registros automáticos llevan badge de origen y NO se editan en destino.
2. **Nada se borra**: anulación con justificación obligatoria (mín. 10 caracteres donde el prototipo lo exige), historial siempre.
3. **Aprobaciones de dos pasos**: devoluciones y compromisos de pago (Secretaría propone → Admin aprueba).
4. **Años cerrados = solo lectura** a nivel API, no solo UI.
5. **Todo lo configurable va a tablas**: día de corte de traslados, tolerancias de marcación (por grupo y por empleado), criterios de evaluación, catálogo AFP, mora.
6. Roles: admin (todo), secretaría/caja, docente (solo sus aulas), portería (solo marcación), apoderado (futuro portal).
7. Escala de notas **literal AD/A/B/C** en todo el colegio (sin vigesimal).

## Interacciones y comportamiento
- Hovers: tinte de superficie (`--surface-hover`) o un paso más oscuro en botones llenos; press: `--brand-active` + nudge 0.5px.
- Focus: anillo azul 3px (`--shadow-focus`) siempre visible.
- Transiciones 120–200ms, easing `cubic-bezier(0.2,0,0,1)`; diálogos entran con translate+scale ease-out; sin animaciones decorativas.
- Diálogos cierran por overlay, Esc y ✕. Toasts (bottom-right) confirman toda mutación.
- Tablas: hover de fila, zebra opcional, columnas numéricas con mono + tabular-nums alineadas a la derecha.
- Estados vacíos con `EmptyState` + acción. Validación: error rojo bajo el campo (`Input error=`).
- Responsive: reglas por patrón en `docs/responsive.md`; targets móviles ≥44px; vistas móviles prioritarias en `mobile.html`.

## Design tokens
Todo en `styles.css` → `tokens/*.css` (palette → semantic → typography → layout → base). Consumir SIEMPRE los alias semánticos (`--brand`, `--surface-card`, `--text-body`, `--danger-soft`…), nunca los crudos. Dark mode = mismos alias bajo `[data-theme="dark"]`. Tipografía: IBM Plex Sans (UI) + IBM Plex Mono (cifras, dinero `S/ 1,234.00`, DNI, códigos), escala en `--type-*`. Espaciado base 4px, radios `--radius-md` 8px (controles) / `lg` 12px (cards) / `xl` 16px (modales), sombras frías azuladas.

## Componentes (packages/ui)
28 componentes en `components/{forms,data,navigation,feedback}/` — cada uno con `.jsx` (implementación de referencia), `.d.ts` (contrato de props) y `.prompt.md` (uso). Portarlos a TSX manteniendo API y CSS. El UI kit **no** reimplementa primitivas: si algo se ve distinto, es un bug del port.

## Assets
- `assets/elohim-insignia.png` — insignia oficial (única fuente de marca; origen de toda la paleta).
- Iconos: set estilo Lucide 1.8px en `ui_kits/sge/icons.jsx`; en producción usar `lucide-react` manteniendo stroke 1.8.

## Archivos del paquete
- `HANDOFF.md` — este documento.
- `docs/` — `alcance-funcional.md` (inventario funcional + decisiones), `stack-tecnico.md` (stack, arquitectura, metodología, releases), `responsive.md` (reglas responsive).
- `styles.css` + `tokens/` — design tokens (fuente de verdad visual).
- `components/` — design system de referencia (28 componentes + contratos `.d.ts` + guías `.prompt.md`).
- `ui_kits/sge/` — prototipo completo (shell + 20 pantallas + mobile.html + README propio). Corre standalone: abrir `ui_kits/sge/index.html`.
- `assets/` — insignia oficial.
- `readme.md` — guía de marca, contenido y fundamentos visuales del design system.
- `guidelines/` — specimens visuales de tokens (colores, tipo, espaciado).
- `_ds_bundle.js` — bundle compilado que usa el prototipo.

## Orden de implementación
Seguir los releases R1–R5 de `docs/stack-tecnico.md` (núcleo/matrícula → dinero → personal → académico → extensiones). Cada release entra a producción y se usa.
