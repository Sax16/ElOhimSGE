# Elohim SGE — Alcance funcional y mapa de UI

Documento de análisis (jul 2026). Fuente: descripción del administrador de la I.E.P. Elohim. Sirve como mapa de módulos, vacíos detectados y plan de pantallas.

## Principios
- **Instalación única**: un solo colegio, sin multi-tenancy. La "Configuración institucional" es una pantalla, no un onboarding de plataforma.
- **Administrador todopoderoso** hoy; roles adicionales (Secretaría/Caja, Docente, Apoderado) se diseñan desde ya para no re-arquitecturar después.
- Estándar peruano: Inicial (3–5 años), Primaria (1°–6°), Secundaria (1°–5°); año académico marzo–diciembre; escala vigesimal; SIAGIE como sistema nacional de referencia.
- Lo único realmente variable entre colegios: **modelo de calificación** (interno vs SIAGIE). El resto son procesos generales.

## Módulos confirmados (pedido del usuario)
1. **Configuración institucional** — datos del colegio, logo, sedes/local, año académico activo.
2. **Estructura académica** — niveles → grados → secciones; periodos (bimestres/trimestres); apertura de año académico.
3. **Programas complementarios** — talleres, reforzamiento, academia: cada uno con su propia matrícula y tarifa, separados de la enseñanza regular.
4. **Estudiantes y apoderados** — relación N:M (un estudiante varios apoderados; un apoderado varios hijos). Ficha del estudiante.
5. **Matrícula** — proceso de matricular (nuevo y ratificación), asignación a grado/sección, generación automática del cronograma de pagos.
6. **Personal (RRHH)** — docentes y no docentes: registro, pagos/planilla, descuentos, asistencia y marcación de hora de ingreso.
7. **Finanzas — ingresos** — matrícula, pensiones (generación automática de cuotas), otros conceptos (libros, uniformes, talleres).
8. **Finanzas — egresos** — pago a empleados; próximos pagos visibles.
9. **Asistencia de estudiantes** — cada docente marca la asistencia del curso/aula que dicta.
10. **Notas** — postergado; diseño debe contemplar doble modelo (interno + exportación SIAGIE).
11. **Notificaciones a apoderados** — recordatorios de pago y avisos.
12. **Dashboard económico** — morosidad, por cobrar, próximos pagos a empleados, salud financiera.

## Vacíos detectados (procesos que faltan para cubrir un colegio real)
Ordenados por importancia:

### Críticos (sin esto el sistema cojea)
- **Plan de estudios / cursos**: catálogo de cursos-áreas por nivel y grado. Es prerequisito de horarios, asistencia por curso y notas. Sin él, "el docente marca asistencia de su curso" no tiene dónde apoyarse.
- **Asignación docente y horarios**: qué docente dicta qué curso en qué sección (y en qué bloque horario). Deriva el aula/curso que ve cada docente.
- **Caja diaria**: apertura/cierre de caja, arqueo, quién cobró qué. En colegios peruanos el cobro es mayormente presencial; la trazabilidad del efectivo es indispensable.
- **Comprobantes**: recibo interno numerado e imprimible por cada cobro (y a futuro boleta electrónica SUNAT). Constancia de no adeudo.
- **Tarifario y becas/descuentos**: matriz de montos por nivel/programa; descuento por hermanos, becas parciales/totales, moras y recargos por atraso. Alimenta la generación automática de cuotas.
- **Ciclo de vida del año académico**: no solo "iniciar año": ratificación de matrícula, **promoción de estudiantes** al grado siguiente, repitencia, cierre de año.
- **Retiros y traslados**: retiro de estudiante, constancia de traslado, estado "Trasladado" además de "Retirado".

### Importantes (fase 2)
- **Roles y permisos + auditoría**: pantalla de usuarios, roles (Admin, Secretaría/Caja, Docente, Apoderado) y registro de acciones — todo lo que toca dinero necesita traza.
- **Portal Docente**: vista reducida — mis aulas, mis cursos, marcar asistencia, (luego) cargar notas.
- **Comunicados generales**: no solo pagos; avisos, citaciones, circulares por nivel/grado/sección.
- **Reportes y exportaciones**: morosidad por grado, ingresos por concepto, padrón de estudiantes, exportar a Excel.
- **Documentos del estudiante**: adjuntos de la ficha (DNI, libreta, partida), campos de salud básicos (seguro, alergias) — sobre todo en Inicial.

### Deseables (fase 3)
- **Portal Apoderado + pago en línea**: ver estado de cuenta, pagar pensión (Yape/Plin/tarjeta), recibir notificaciones.
- **Notas + exportación SIAGIE**: doble libreta (modelo interno y formato oficial).
- **Inventario simple**: stock de libros/uniformes que se venden. ✅ **ampliado y diseñado** como módulo "Inventario y activos" (jul 2026), 4 pestañas: **Almacén** (stock de venta + suministros con mínimos y alertas; las ventas de Caja descuentan stock), **Compras de almacén** (orden a proveedor → al recibir repone stock y crea el gasto en Tesorería automáticamente), **Activos y laboratorios** (equipos por ubicación con responsable, estado, historial de mantenimiento vinculado a gastos, reporte de averías) y **Biblioteca** (catálogo + préstamos con recordatorio al apoderado).
- **Frontera Tesorería ↔ Compras** (decisión de arquitectura, jul 2026): se mantienen separados. Tesorería registra *movimientos de dinero* (unidad: gasto/ingreso); Compras de almacén registra *órdenes logísticas* (unidad: orden con ciclo pendiente→recibido y efecto en stock). Regla de un solo punto de registro: (1) la compra de bienes inventariables se registra SOLO en Inventario → Compras de almacén y genera su gasto automáticamente; (2) los gastos automáticos llevan badge de origen (Compra OC-xxxx / Activo AC-xxx) y NO se editan en Tesorería — botón "ver origen" navega al módulo dueño; (3) al registrar un gasto manual con categoría "Materiales y útiles", la UI advierte y ofrece ir a Compras de almacén.
- **Conducta/incidencias**: registro de incidencias del estudiante.
- **Gastos generales**: egresos no-planilla (servicios, mantenimiento) para completar el estado económico. ✅ **diseñado** como módulo "Gastos e ingresos" (jul 2026): resumen del mes (ingresos vs egresos por rubro, gastos por categoría), registro de gastos (servicios, materiales, mantenimiento, infraestructura, con proveedor y comprobante) y otros ingresos (impresiones, alquileres, trámites documentarios, ventas, kiosco, donaciones).

## Mapa de pantallas propuesto

### Fase 1 — núcleo administrativo (diseñar primero)
| Pantalla | Estado |
|---|---|
| Login | ✅ diseñada |
| Dashboard (económico + académico) | ✅ reorientado: KPIs, cobranza, próximos egresos, principales deudores |
| Configuración institucional | ✅ diseñada (Institución · Notificaciones · Usuarios y roles) |
| Estructura académica (niveles/grados/secciones/periodos, año académico) | ✅ diseñada (incluye plan de estudios, programas y asistente de año) |
| Plan de estudios (cursos por nivel-grado) | ✅ pestaña en Estructura académica |
| Estudiantes (listado + ficha con apoderados N:M) | ✅ listado base; falta ficha completa |
| Apoderados (listado + ficha con hijos) | ✅ diseñada (deuda familiar consolidada, recordatorios) |
| Matrícula (asistente paso a paso: estudiante → grado/sección → tarifa → cronograma) | ✅ diseñada (listado + asistente de 5 pasos + éxito) |
| Pensiones y cobros (cuotas, registrar pago, caja diaria, recibo) | ✅ Pensiones + módulo Caja y cobros (cobro multi-concepto, recibo, arqueo) |
| Otros cobros (libros, uniformes, talleres) | ✅ dentro de Caja y cobros ("Otros conceptos") |
| Tarifario y becas | ✅ diseñada (tarifas por nivel/programa, mora, descuentos y becas) |
| Personal (listado + ficha, asistencia/marcación, planilla) | ✅ diseñada (3 pestañas: Personal, Asistencia y marcación, Planilla con pago) |

### Fase 2
| Pantalla | Estado |
|---|---|
| Portal Docente (Mis clases + asistencia de estudiantes P/T/F/J) | ✅ diseñada (rol "Docente" desde el login) |
| Horarios y asignación docente (grilla semanal + carga por docente) | ✅ diseñada |
| Comunicados (alcance por nivel/grado/sección, WhatsApp/correo, programación) | ✅ diseñada |
| Reportes (morosidad, ingresos, padrón, asistencia, planilla, caja) | ✅ diseñada con vista previa de morosidad |
| Retiros y traslados (constancia, deuda no condonada, vacante liberada) | ✅ en la ficha del estudiante |
| Usuarios y roles | ✅ en Configuración |

### Fase 3
Portal apoderado + pago en línea · Notas (interno + SIAGIE) · Inventario · Incidencias · Gastos generales.

## Decisiones confirmadas (jul 2026)
- Periodos: **4 bimestres**. Secciones: letras en Prim/Sec, **nombres en Inicial**. Turnos **mañana y tarde**. **Vacantes con límite por sección**. Programas y plan de estudios viven como **pestañas de Estructura académica**. Iniciar año = **asistente completo** (datos → copiar estructura → promoción → confirmar), genera pre-matrículas.

## Vocabulario de estados (ampliado)
- Estudiante: Activo · Becado · Retirado · **Trasladado** · **Egresado** · **Reservado** (matrícula reservada)
- Cuota: Pagado · Pendiente · Vencido · **Anulado** · **Exonerado**
- Empleado: Activo · Licencia · Cesado
- Matrícula: **Nueva · Ratificada · Trasladado (ingreso)**
- Asistencia: Presente · Tardanza · Falta · Falta justificada
