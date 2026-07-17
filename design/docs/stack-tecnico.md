# Elohim SGE — Stack tecnológico y reglas del proyecto

Decisión de arquitectura para pasar del prototipo (este proyecto de diseño) al producto real.
Contexto que manda: **una sola institución** (instalación por colegio, no SaaS multi-tenant), un equipo pequeño,
dominio con reglas de dinero delicadas (pensiones, planilla, caja), y un prototipo ya validado módulo por módulo.

---

## 1. Stack elegido

### Frontend — React 18 + TypeScript + Vite
- **Por qué:** el design system y los 20+ módulos del prototipo ya son React; el traspaso es casi directo (los `*.jsx` del UI kit son la especificación visual). Es también el ecosistema donde mejor me desenvuelvo para asistirte generando código.
- **Sin Next.js:** es un panel interno tras login — no hay SEO ni SSR que justifique la complejidad. SPA con Vite.
- **Enrutado:** React Router (rutas = módulos del sidebar, con guard por rol).
- **Estado de servidor:** TanStack Query (cache, invalidación tras mutaciones — ej. cobrar cuota → refresca deuda).
- **Estado de UI:** Zustand (año académico activo, sidebar colapsada, tema). Nada de Redux.
- **Formularios:** React Hook Form + **Zod** (los schemas Zod se comparten con el backend — una sola definición de validación).
- **Estilos:** el design system tal cual — `styles.css` + tokens CSS + los componentes portados a TS. **No Tailwind ni MUI**: ya tenemos sistema propio validado en claro/oscuro.
- **Tablas:** TanStack Table con el estilo de nuestro componente `Table`.

### Backend — NestJS + Prisma (TypeScript)
- **Por qué NestJS:** estructura de módulos que calca los del dominio (uno por módulo del sidebar), inyección de dependencias, guards para RBAC, pipes con Zod/class-validator. Disciplina sin inventar arquitectura propia.
- **Por qué un solo lenguaje:** TypeScript en front y back = tipos compartidos (DTOs, enums de estados como `Pagado/Pendiente/Vencido`), menos fricción para un equipo chico y para mí al asistirte.
- **ORM:** Prisma — migraciones versionadas, tipos generados, transacciones (`$transaction` para las reglas "un registro, dos efectos": compra recibida → stock + gasto).
- **Jobs y colas:** **pg-boss** (colas sobre Postgres — evita Redis): generación mensual de cuotas, mora automática, recordatorios programados, notificaciones.
- **PDFs:** Puppeteer con plantillas HTML (reutilizamos el diseño de libreta, boleta y carnet del prototipo tal cual).

### Base de datos — PostgreSQL 16
- Dinero en `NUMERIC(10,2)` — nunca float.
- **Auditoría** en tablas append-only (quién, qué, cuándo) — el prototipo ya fijó la regla "nada se borra, se anula con justificación".
- Restricciones en la BD, no solo en código: `CHECK` en estados, `UNIQUE` en DNI/código, FK estrictas.
- Un esquema por año NO: una sola BD con `academic_year_id` en las entidades anuales (matrícula, cuotas, notas, asistencia) — el histórico multi-año del prototipo se apoya en eso.

### Infraestructura
- **Docker Compose**: `app` (Nest sirve también el build de Vite), `postgres`, `caddy` (TLS automático). Un VPS basta (la escala es ~500 estudiantes).
- **Backups**: `pg_dump` diario a almacenamiento externo + prueba de restauración mensual. En un colegio, la BD ES el negocio.
- CI: GitHub Actions — lint, typecheck, tests, build.

### Integraciones (fase posterior, pero decididas ya)
- **WhatsApp**: API oficial de WhatsApp Business Cloud (recordatorios, incidencias, libretas). Cola con reintentos.
- **Pagos en línea**: Culqi o Izipay/Niubiz (Yape/tarjeta) — webhook → registra el pago como si fuera caja, mismo flujo.
- **Correo**: SES o Resend.

---

## 2. Arquitectura

**Monolito modular.** Nada de microservicios: un deployable, módulos internos con fronteras claras.

```
apps/
  web/          → React (Vite)
  api/          → NestJS
packages/
  shared/       → tipos, enums de estados, schemas Zod, cálculo puro (planilla, prorrateo, mora)
  ui/           → design system portado (componentes + tokens)
```

Módulos del backend (calcan el sidebar): `identity` (usuarios/roles/auditoría), `academic-structure`, `enrollment`,
`students`, `guardians`, `staff` (incluye marcación y planilla), `billing` (cuotas/tarifario/compromisos),
`cashier` (caja/devoluciones), `treasury` (gastos/ingresos/caja chica), `inventory`, `grades`, `attendance`,
`conduct`, `calendar`, `announcements`, `reports`, `notifications`.

**Comunicación entre módulos: eventos de dominio internos** (event emitter de Nest, persistidos en outbox):
- `CompraRecibida` → inventory sube stock, treasury crea gasto.
- `PagoRegistrado` → billing baja deuda, notifications envía recibo, inventory descuenta stock si hay venta.
- `IncidenciaGraveRegistrada` → notifications avisa y agenda citación.
Esto implementa la regla ya validada en el prototipo: *cada movimiento se registra una sola vez y se refleja solo*.

---

## 3. Metodología y patrones — qué sí y qué no

| Práctica | Veredicto | Cómo |
|---|---|---|
| **DDD** | Sí, versión ligera | Lenguaje ubicuo ya definido (cuota, compromiso, rendición…), módulos como bounded contexts, entidades con invariantes. SIN event sourcing, SIN CQRS separado. |
| **TDD estricto** | No | Frena demasiado a un equipo chico. |
| **Tests dirigidos a reglas de dinero** | Sí, obligatorio | Unit tests (Vitest) sobre `packages/shared`: cálculo de planilla (AFP/ONP/gratis/CTS), prorrateo de traslado con día de corte, mora y congelamiento por compromiso, generación de cronograma. Estas funciones se escriben **puras** justamente para testearlas. |
| **E2E** | Solo flujos críticos | Playwright: login por rol, matrícula completa, cobrar en caja, cerrar planilla. |
| **Repository pattern extra sobre Prisma** | No | Prisma ya es esa capa; servicios de módulo la usan directo. |
| **Patrones puntuales** | Sí | State machine explícita para estados (cuota, compromiso, devolución, incidencia, orden de compra); Strategy para cálculo AFP vs ONP; Outbox para eventos+notificaciones. |
| **SDD (schema-driven)** | Sí en la práctica | Zod como fuente única de validación front/back; OpenAPI generado desde Nest para documentar. |

## 4. Reglas de oro del proyecto (heredadas del prototipo)
1. Dinero: una sola escritura, efectos derivados por evento; todo anulable con justificación, nunca borrable.
2. Roles con permisos granulares (el prototipo ya define admin / secretaría-caja / docente / portería / apoderado-futuro).
3. Años cerrados = solo lectura a nivel API, no solo UI.
4. Configuración antes que hard-code: día de corte, tolerancias por grupo/individuo, criterios de evaluación, catálogo AFP — todo lo que el prototipo hizo configurable, va a tablas de configuración.
5. Español en el dominio: entidades y enums en el código pueden ir en inglés, pero los términos del negocio (`pension`, `apoderado`, `compromiso`) no se traducen a medias — glosario en este doc.

## 5. Orden de construcción sugerido (releases)
1. **R1 — Núcleo**: identity + estructura académica + estudiantes/apoderados + matrícula + cronograma. (Ya se puede matricular 2027.)
2. **R2 — Dinero**: caja, pensiones, mora, tesorería + caja chica, reportes básicos, dashboard económico.
3. **R3 — Personal**: marcación (portería), planilla configurable, descuentos.
4. **R4 — Académico**: asistencia docente (móvil), notas + libretas, conducta, calendario, comunicados.
5. **R5 — Extensiones**: inventario/activos/biblioteca, pagos en línea, portal apoderado.

Cada release entra a producción y se usa — no big bang.

## 6. Estado de implementación — cierre R1 (jul 2026)

**R1 está implementado** (monorepo pnpm en el repositorio; comandos en `CLAUDE.md`). Precisiones técnicas fijadas durante la construcción — respetarlas en R2+:

- **Workspace**: pnpm (sin Turborepo). `packages/shared` se compila con **tsup** (lo consume Nest); `packages/ui` se consume como fuente TS directa (la compila Vite). `concurrently` para `pnpm dev` (Windows-friendly).
- **Validación**: Zod como única fuente (schemas en `packages/shared/src/schemas/`), pipe propio `zodBody/zodQuery/zodParam` en Nest — sin class-validator.
- **Auth**: JWT `{sub, role}` en cookie httpOnly `sge_token` (SameSite=Lax; 12h, 30d con recordarme), **bcryptjs** (sin node-gyp). Los permisos se leen frescos de BD en `/me` y en `PermissionsGuard` (suspensión aplica sin re-login). Login por username o correo (la institución no tiene dominio propio).
- **Dinero**: **centavos enteros** en `packages/shared/src/money/` (funciones puras con 42 tests Vitest: `buildEnrollmentSchedule`, `buildProgramSchedule`, `billableMonths`, `applyDiscount`; redondeo half-up en un solo punto), `NUMERIC(10,2)` en BD, conversión en la frontera API (`money.util.ts`). Los montos de cuotas son snapshot. Fechas civiles como strings `yyyy-mm-dd` (nunca `new Date(iso)` para mostrar — corrimiento UTC−5).
- **Prisma**: la unicidad de matrícula es un **índice único parcial** (`WHERE "canceledAt" IS NULL`), no representable en `schema.prisma` → aplicar migraciones con `pnpm db:deploy`; si `migrate dev` reporta drift, revisar el SQL antes de aceptar. Los CHECKs de negocio (DNI 8 dígitos, SIAGIE 14, capacidad>0, anulación exige motivo) viven en las migraciones SQL escritas a mano. La cadena completa de migraciones se replica limpia sobre BD vacía (validado — es el camino de producción).
- **Códigos correlativos** (`E-####`, `A-####`, `M-YYYY-####`): tabla `CodeCounter` con incremento en transacción. Los contadores **nunca retroceden** (el seed usa GREATEST); los saltos por registros eliminados son normales.
- **Seed**: idempotente por uniques (institución, usuarios demo, estructura 2026, 40 estudiantes con apellidos separados, 25 apoderados, 39 matrículas con 448 cuotas realistas ~70% al día, programas). `pnpm db:seed`.
- **Fuentes**: IBM Plex **self-host** (.woff2 en `packages/ui/src/fonts/`, subset latin de Fontsource) — cero dependencia de Google Fonts (internet inestable en Satipo).
- **Design system**: 28 componentes portados 1:1 del prototipo (hook `useStyleOnce` compartido, clases `esge-`); QA visual en `/dev/kit` (solo dev). Iconos `lucide-react` stroke 1.8.
- **Fotos**: multer a disco `apps/api/uploads/`, servidas públicas bajo `/api/files` (aceptable en instalación única; endurecer si se expone a Internet).
- **Auditoría**: `AuditLog` append-only en toda mutación, dentro de la misma `$transaction`.

**Arranque de R2 (dinero)**: los specs son `ui_kits/sge/CashierScreen.jsx` (caja: cobro multi-cuota + otros conceptos, caja del día, arqueo, devoluciones con aprobación), `PaymentsScreen.jsx` (pensiones por estado + compromisos de pago con congelamiento de mora), `TreasuryScreen.jsx` (gastos/ingresos + caja chica) y `DashboardScreen.jsx` (KPIs económicos). Base ya lista de R1: cuotas con estados, `BillingSettings` (mora fija, días de gracia, mora automática), `debt.util` (definición única de deuda vencida), permisos `caja`/`pensiones` en `PERMISSION_MODULES`, y pg-boss decidido (aún sin instalar) para la generación de mora y recordatorios. El estado `VENCIDO` de cuota hoy se deriva por fecha; en R2 el job de mora lo materializa.

Las **decisiones de negocio de R2** (mora fija una vez, sin pagos parciales, caja compartida por día con cobro solo con caja abierta, recordatorios wa.me, devolución sin saldo a favor, catálogo de conceptos de venta sin stock) están en `alcance-funcional.md` § "Decisiones de R2". Plan por etapas: **E1** Caja y cobros (sesión, cobro multi-cuota + conceptos, recibo, anulación, arqueo) → **E2** Pensiones + job de mora + recordatorios → **E3** Compromisos + Devoluciones (flujos de dos pasos) → **E4** Tesorería (gastos, otros ingresos, caja chica, resumen) → **E5** Dashboard económico + exportaciones.

## 7. Estado de implementación — cierre R2 (jul 2026)

**R2 está implementado y validado** (las 5 etapas + correctivos). Precisiones técnicas fijadas durante la construcción — respetarlas en R3+:

- **Fecha efectiva de una cuota** (reprogramada si su compromiso está VIGENTE): centralizada en `apps/api/src/common/installment-view.util.ts`; de ella derivan estado mostrado, deuda (`debt.util`), vencidas con desglose (`overdue.util`), mora, recordatorios y morosidad. **Toda consulta de dinero confía en `installment.status`, nunca en si la matrícula fue anulada** (correctivo post-E5: anular matrícula = error → anula todo lo no pagado; retiro = deuda no condonada → conserva vencidas cobrables con regla del día de corte para el mes del retiro).
- **pg-boss** corre dentro del proceso del API (`JobsModule`, misma `DATABASE_URL`): job `late-fees-daily` 00:30 America/Lima (materializa VENCIDO, mora fija una vez solo a pensiones escolares, marca compromisos INCUMPLIDO); corrida manual solo ADMIN. Si pg-boss no inicia, loggea y no tumba la API.
- **Caja**: `CashSession` única por fecha (`@db.Date @unique`); el cierre no caduca a medianoche (se cierra la ABIERTA aunque sea de ayer; no se abre la de hoy con una anterior sin cerrar). Arqueo: esperado = inicial + cobros efectivo + otros ingresos efectivo − devoluciones efectivo − reposición caja chica. Los movimientos del día son filas tipadas (COBRO/DEVOLUCION/INGRESO/CAJA_CHICA).
- **Impresión de documentos** (recibos, comprobantes de devolución; patrón para constancias futuras): documento HTML aislado en iframe (`apps/web/src/features/cashier/printReceipt.ts`) con sus propias `@font-face` (export `@elohim/ui/fonts/*` + import `?url`), escape de HTML y sin reglas `@page` — el diálogo de impresión del navegador conserva todas sus opciones.
- **Exportación a Excel**: `.xlsx` real generado en el API con **exceljs** (`reports.xlsx.ts`); descarga en el front con `lib/download.ts` (filename del Content-Disposition).
- **Permisos**: módulo `tesoreria` agregado en R2 (los usuarios existentes lo heredaron de `caja` vía migración de datos jsonb). ADMIN-only se valida en el service (`actor.role`), además del guard por módulo.
- **Correlativos** acumulados: `R-YYYY-#####` (recibos), `CP-####`, `D-####`, `G-####`, `I-####`, `REND-####`.
- **Tests de dinero en shared: 71** (cronogramas, prorrateo, descuento, mora `isLateFeeEligible`, fechas de compromiso `buildCommitmentDates`).

**Arranque de R3 (personal)**: el spec es `ui_kits/sge/StaffScreen.jsx` (3 pestañas: Personal, Asistencia y marcación, Planilla con pago). Base ya lista: permisos `personal` y `marcacion` en `PERMISSION_MODULES`, rol PORTERIA (solo marcación), pg-boss para jobs, tolerancias de marcación y catálogo AFP a tablas (regla 5), Strategy AFP vs ONP decidido en § 4. Integraciones clave a resolver: el **pago de planilla debe crear su gasto en tesorería por evento** (badge de origen, regla de un solo punto de registro — reemplaza a la categoría manual "Planilla y personal" de R2), y "Últimos gastos" del dashboard evoluciona a **próximos egresos** reales con las cuentas por pagar de planilla. Pendiente heredado: promoción de estudiantes → pre-matrículas (asistente del año 2027).

## 8. Estado de implementación — cierre R3 (jul 2026)

**R3 está implementado y validado** (4 etapas + correctivos). Precisiones técnicas fijadas durante la construcción — respetarlas en R4+:

- **Módulo `staff`** (apps/api/src/staff/): fichas (`Staff`, correlativo `P-###`, estados ACTIVO/LICENCIA/INACTIVO — "Inactivo" reemplazó a "Cesado" del prototipo), catálogos `PensionScheme` y `MarkingGroup` en tablas, vínculo opcional `Staff.userId` para R4. El horario efectivo (individual o grupo por rol) vive en `effective-schedule.util.ts` (compartido por ficha, marcación y reglas).
- **Marcación** (`StaffTimeEntry`, única por empleado/día): cada marca congela **snapshot** de hora de entrada y tolerancia; cambiar reglas rige hacia adelante. Falta = derivada (día hábil L–V pasado sin marca), nunca materializada. Corrección solo ADMIN con justificación ≥ 10 y AuditLog. Hora civil de Lima en `apps/api/src/common/lima-time.util.ts` (usarla siempre; jamás `Date` UTC crudo para decidir el día). `MarkingSettings` (fila única) guarda la regla de descuento por tardanzas.
- **Planilla**: cálculo puro en `packages/shared/src/money/payroll.ts` (aportes ONP/AFP por concepto con redondeo half-up en céntimos, EsSalud, descuento por tardanzas, neto con clamp) — **101 tests** en shared. Filas (`PayrollEntry`) con snapshot completo de sueldo/cargo/régimen y tasas; **generación lazy solo del mes en curso** (mes pasado sin periodo → `generated:false`, sin crear nada); refresh re-sincroniza solo PENDIENTES y respeta `grossEdited`. Pago individual/masivo (`PayrollBatch` `PL-####`) **solo ADMIN validado en service**; crea su gasto en tesorería en la misma transacción (origin `PLANILLA`, categoría "Planilla y personal", monto = neto, no editable/anulable desde tesorería); anular pago revierte (anula el gasto individual o reduce el consolidado) con AuditLog. Ítem `AUTO_TARDANZAS` se crea al generar/refresh una vez por periodo; anulado no se regenera.
- **Frontera de dinero en DTOs: SIEMPRE string decimal `"1234.00"`**, en requests y responses (un `number` en el body rompe contra los zod de shared — correctivo post-E3). Los schemas zod de planilla/marcación viven en `packages/shared/src/schemas/`.
- **Configuración → Planilla** (solo Admin): `PayrollSettings` fila única (EsSalud %, día de pago null = fin de mes, seeds MYPE de gratificación/CTS para releases futuros) + edición del catálogo AFP; los cambios de tasas solo afectan generaciones futuras (los snapshots no se recalculan).
- **Dashboard**: `upcomingPayroll` en el summary (pendiente real del mes o estimado si no está generada; `dueDate` = día de pago clampeado). Reporte **Planilla anual** (`/api/reports/payroll-annual?year`) con hojas Resumen y Detalle desde los snapshots (nunca tasas vigentes).
- Los tres agentes de marcación exponen vistas distintas del mismo componente: pestaña Asistencia (admin) y `/pmarcacion` (portería, solo marcar hoy, refetch 60 s).

**Arranque de R4 (académico)**: specs `ui_kits/sge/` de asistencia de estudiantes, notas (escala AD/A/B/C, criterios por tabla), conducta y comunicados. Base lista: permisos `notas`/`asistencia`/`comunicados` en `PERMISSION_MODULES`, rol DOCENTE con `TEACHER_NAV` (rutas `tclases`/`tasist` hoy en placeholder), estructura académica completa (secciones, cursos, periodos, tutores vía `Section.tutorId` y `Course.teacherId` → conectar con `Staff.userId`), patrón de export xlsx y de documentos imprimibles. Reporte "Asistencia mensual" deshabilitado en Reportes esperando R4. Pendientes heredados: promoción de estudiantes → pre-matrículas 2027; feriados para marcación de personal cuando exista el calendario académico.

## 9. Cierre técnico de R4 — etapa 1 (asistencia de estudiantes + asignación docente)

- **Módulo `student-attendance`** (apps/api/src/student-attendance/): `StudentAttendanceEntry` única por `[enrollmentId, date]` con estados PRESENTE/TARDANZA/FALTA/JUSTIFICADA (enum espejo y labels/letras/tonos en shared). La fila referencia la **matrícula** (no al estudiante directo): la sección y el año salen de ahí, y el roster filtra `canceledAt IS NULL` + estudiante ACTIVO/BECADO. **No hay falta derivada** para estudiantes: día sin toma = sin registro (a diferencia de la marcación de personal).
- **Reglas de fecha en el service** (no solo UI): docente → solo HOY (Lima, `limaTodayISO()`) y solo secciones donde es tutor (`Section.tutorId`) o tiene `CourseAssignment`; puede re-guardar el día pero las entradas con `correctedById` no se pisan (`skippedCorrected`). Admin → puede crear la toma completa de un día pasado sin registros; si el día ya tiene registros, corrige entrada por entrada (`PATCH /student-attendance/:id/correct`, motivo ≥ 10, AuditLog `student-attendance.correct`). Futuro → 400, fin de semana → 422, fuera del año activo → 400.
- **`CourseAssignment`** (curso×sección×docente, única por `[courseId, sectionId]`, docente = `User` rol DOCENTE): fuente de verdad de "qué dicta cada docente"; `Course.teacherId` se conserva solo como referencia. Valida en service que la sección pertenezca al grado del curso (422). CRUD bajo permiso `estructura` con candado de año cerrado; la página `/horarios` se renombró **"Asignación docente"** (la grilla de bloques horarios quedó postergada).
- **Portal docente**: `/tclases` (Mis clases: stats + aulas de hoy con estado de toma) y `/tasist` (toma táctil P/T/F/J pensada para celular, "Todos presentes", contadores en vivo). El aviso de falta es **manual vía wa.me** al contacto principal (dialog post-guardado y panel "Avisos del día" en `/asist`); nada se envía automático.
- **Vista admin `/asist`**: pestañas Por día (roster + corrección auditada) y Mensual (matriz día×estudiante con letras, totales y % asistencia = (P+T)/total, export `.xlsx` con exceljs, patrón de la marcación de personal).
- Seed `11-r4-academico.ts`: asignaciones desde `Course.teacherId` (round-robin de 7 docentes — cada docente queda con ~25 aulas, artefacto del seed) y ~10 días hábiles de asistencia demo en secciones de Primaria (estados deterministas por hash, idempotente, nunca crea registros de hoy).

### Cierre técnico de R4 — etapa 2 (notas por competencias + libreta)

- **Módulo `grades`** (apps/api/src/grades/): `CourseCompetency` (catálogo por curso, seed CNEB), `EvaluationAspect` (FORMATIVO/APODERADO, se desactiva, no se borra), `GradeEntry` (única por matrícula×curso×periodo×competencia), `CourseResult` (logro con flag `auto`) y `AspectGrade`. Enum `GradeLetter` (AD/A/B/C) espejo en shared con labels/tones.
- **Cálculo puro en shared** (`packages/shared/src/academics/grades.ts`, 13 tests): `gradeValue`, `computeCourseResult` (promedio half-up → letra) y `courseCondition` (≥2.5/≥1.5). El service y el front consumen la misma función; el recálculo tras cada guardado respeta los logros ajustados (`auto=false`).
- **Reglas en service**: docente solo su `CourseAssignment` exacta; tutor (`Section.tutorId`) los aspectos; periodo EN_CURSO editable, CERRADO solo ADMIN con `reason` ≥10 → `AuditLog grades.correct` (old→new, sin columnas de corrección), PROXIMO 422, año cerrado 409. `letter: null` elimina la nota (captura en curso).
- **`GET /grades/periods`** (permiso `notas`, yearId opcional → año activo): los selectores de Notas NO usan la ruta de estructura académica porque el DOCENTE no tiene ese permiso (403 detectado en la integración de E2).
- **Front**: los selectores de sección del docente salen de `student-attendance/my-sections` (cubre al tutor sin asignaciones) y el roster de libretas de `grades/aspects-sheet` (única fuente con `enrollmentId` visible para tutores). La libreta se imprime con el patrón de iframe aislado (`printReportCard.ts`). Configuración → Evaluación es una pestaña de la página de Configuración (permiso `config`).
- Seed `12-r4-notas.ts`: aspectos del prototipo, competencias CNEB por nombre de curso (fallback 3 genéricas), Bim I completo y Bim II parcial (~60%) en secciones de Primaria con estados deterministas por hash.
