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
