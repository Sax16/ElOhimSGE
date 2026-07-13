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
- Matrícula: **Nueva · Ratificada** (el tipo "Traslado (ingreso)" se eliminó del flujo en R1 — ver decisiones abajo; el valor queda en el enum solo por histórico)
- Asistencia: Presente · Tardanza · Falta · Falta justificada

## Decisiones de implementación — cierre R1 (jul 2026)

R1 (identity + estructura + estudiantes/apoderados + matrícula/cronograma + tarifario + dashboard mínimo) está **implementado y en el repositorio**. Durante la construcción, el usuario (administrador de la I.E.P.) tomó decisiones que **refinan o reemplazan** lo descrito arriba y en los prototipos. Estas decisiones MANDAN sobre este documento y sobre los `.jsx` de `ui_kits/sge/`:

### Identidad y acceso
- **La institución NO tiene dominio de correo propio**: el personal usa Gmail personal. Login por **`username` único o correo completo** — nunca asumir ni autocompletar `@elohim.edu.pe`. El correo del usuario es dato de contacto, agnóstico del dominio.

### Estudiantes y apoderados
- **Apellidos separados**: `paternalLastName` (obligatorio) + `maternalLastName` (opcional — cubre personas con un solo apellido). Crucial para actas y documentos oficiales. Ya no existe `lastNames`.
- **Máximo 3 apoderados por estudiante**. El primer apoderado vinculado queda como contacto principal automáticamente; el principal se cambia con un clic desde la ficha; al quitar al principal, otro se promueve solo (nunca queda un estudiante con apoderados y sin principal). El diálogo de vincular marca "Ya asignado" a los ya vinculados.
- **Retirados/Trasladados pueden re-matricularse**: al concretar la nueva matrícula vuelven a Activo (los campos de retiro se limpian; el historial queda en auditoría). Egresado sigue bloqueado.

### Matrícula y cronograma
- **El flujo "Traslado entrante" se eliminó** (junto con el código SIAGIE y el campo colegio de origen, duplicado del colegio de procedencia). Lo reemplaza la **fecha de ingreso** editable del wizard (default hoy, rango [inicio de matrícula del año, hoy]): define desde cuándo se cobran pensiones en TODOS los casos, con la regla del **día de corte** (ingresa hasta ese día → paga el mes; después → gratis). La matrícula de campaña (dic–feb) produce año completo; un ingreso a mitad de año solo los meses restantes. La cuota de matrícula vence en la fecha de ingreso.
- **Unicidad estudiante+año**: índice único **parcial** (`WHERE canceledAt IS NULL`) — una matrícula anulada no bloquea re-matricular el mismo año.
- **Descuento HERMANOS (−10%)**: se aplica **solo al 2° hijo y siguientes** del apoderado firmante; se propone automáticamente **únicamente si su aplicación está configurada como Automático** (en Manual queda como opción elegible del selector). Los descuentos afectan solo la pensión, nunca matrícula ni programas.
- Los montos del cronograma son **snapshot**: cambiar el tarifario nunca altera cronogramas ya generados.

### Programas complementarios (rediseñados)
- Un programa tiene **vigencia** (mes de inicio y mes de fin, 2..12); las cuotas mensuales se derivan de ella.
- **Cuotas propias, separadas** del cronograma de pensiones ("Programa · Taller de Danza · Agosto"), con matrícula del programa si la tiene.
- **Inscripción independiente** de la matrícula escolar (`ProgramEnrollment`): desde la pestaña Programas en cualquier momento del año (requiere matrícula escolar activa; prorrateo con el mismo día de corte si el programa ya empezó), y también como atajo en el wizard.
- **Reapertura = nueva edición** (nuevo registro; el nombre puede repetirse si el mes de inicio difiere). Ej.: "Reforzamiento · Matemática" anual y una edición Ago–Sep conviven.

### Regla "nada se borra" — alcance acotado
- Aplica a **registros transaccionales** (dinero, matrículas, historial): solo anulación con justificación ≥10 caracteres.
- La **estructura/configuración vacía sí se elimina** (con confirmación simple + auditoría): curso; programa sin inscritos; sección sin matrículas; grado sin secciones ni cursos; nivel sin grados; y un **año académico completo** si no está cerrado y no tiene matrículas (doble confirmación escribiendo el nombre). Los botones se deshabilitan con tooltip explicando la dependencia.

### Pendientes que este documento describe y siguen vigentes para releases futuros
- Promoción de estudiantes → pre-matrículas (paso 3–4 del asistente de año): **R2**.
- Constancias PDF (retiro/traslado, no adeudo), carnet con QR real: post-R1 (impresión básica vía `@media print` ya existe).
- Recordatorios de pago, cobros en caja, mora efectiva: **R2** (la configuración de mora ya existe en tablas).

## Decisiones de R2 — dinero (jul 2026) · R2 CERRADO

**R2 está implementado, validado en navegador por el administrador y en el repositorio** (jul 2026): caja y cobros con recibos y arqueo, pensiones con mora materializada y recordatorios, compromisos de pago y devoluciones (dos pasos), tesorería con caja chica, historial de cajas, dashboard económico y reportes con exportación a Excel. Las decisiones de las secciones siguientes se tomaron durante la construcción y MANDAN sobre los prototipos `CashierScreen.jsx`, `PaymentsScreen.jsx`, `TreasuryScreen.jsx`, `ReportsScreen.jsx` y `DashboardScreen.jsx` donde difieran.

**Pendiente que R2 no cubrió**: la promoción de estudiantes → pre-matrículas (pasos 3–4 del asistente de año, heredada del cierre de R1) sigue sin implementarse — reprogramada para cuando se prepare el año 2027 (R3 o R4).

### Mora
- **Fija, una sola vez por cuota**: pasados los días de gracia (config vigente: S/ 5.00, 3 días, `BillingSettings`), la cuota vencida carga la mora una única vez — no recurre por mes ni por día. Se registra en la propia cuota (campo de mora), no como cuota aparte.
- El **job diario (pg-boss)** materializa el estado `VENCIDO` (hoy derivado por fecha) y carga la mora.
- **Exoneración de mora: solo Admin**, con motivo obligatorio ≥ 10 caracteres, auditada. En ventanilla la mora siempre se cobra.

### Cobros y caja
- **Sin pagos parciales**: las cuotas se cobran completas. Deuda que la familia no puede cubrir → compromiso de pago.
- **Una caja compartida por día**: quien la abre registra el monto inicial y responde por el arqueo al cierre; varios usuarios pueden cobrar sobre ella y cada movimiento registra quién cobró.
- **Todo cobro exige caja abierta** (efectivo y digital). El arqueo cuenta solo el efectivo; los cobros digitales se listan aparte en el cierre.
- **El cierre no caduca a medianoche**: no hay cierre automático — el arqueo siempre lo hace una persona. Si la caja quedó abierta y se cuadra al día siguiente (o después), se cierra normal y la demora queda trazada en la hora de cierre. Mientras exista una caja anterior sin cerrar **no se puede abrir la caja del día** (la UI lleva al arqueo pendiente), y los cobros solo caen en la caja del día actual — nunca en la pendiente.
- **Anulación de recibo**: solo mientras la caja de ese día siga abierta (aunque el cierre ocurra pasada la medianoche); cerrada la caja, la corrección va por devolución. Anular devuelve las cuotas a su estado anterior.
- **Otros conceptos** (libros, uniformes, buzo…): **catálogo simple** nombre + precio administrable desde Tarifario, sin stock — la integración con Inventario llega en R5.
- El diálogo "Generar cuotas del mes" del prototipo **no aplica**: el cronograma anual nace completo con la matrícula (decisión R1).

### Recordatorios de pago
- **Semiautomáticos vía WhatsApp**: el botón "Recordar" abre WhatsApp (enlace `wa.me` al celular del apoderado principal) con el mensaje de deuda prellenado, y el sistema registra el recordatorio (fecha, quién lo envió, a quién). El envío automático masivo queda para Notificaciones (R5).
- **Mensaje consolidado por apoderado** (decidido en E2): lista las cuotas VENCIDAS de todos sus hijos (con su mora) más la cuota del mes en curso si sigue pendiente, con el total. Ni solo vencidas ni todo el año.

### Pensiones — decisiones de la etapa 2 (jul 2026)
- **La mora aplica SOLO a cuotas de pensión de enseñanza regular**: la matrícula vencida no genera mora, y las cuotas de programas complementarios tampoco. El estado `VENCIDO` sí se materializa para toda cuota con fecha pasada (cualquier tipo).
- **Job diario (pg-boss)**: materializa `VENCIDO` y carga la mora fija (una vez, tras los días de gracia, si `autoLateFee` está activo; respeta exoneraciones). Además el Admin puede ejecutarlo manualmente desde la API.
- **Exonerar mora**: solo rol Admin, motivo ≥ 10 caracteres, auditado; la cuota conserva la marca de exoneración para que el job no la vuelva a cargar.
- **El cobro siempre ocurre en Caja**: la pantalla Pensiones es la vista de seguimiento de cobranza; su acción de cobro deriva a Caja → Cobrar con el estudiante y la cuota precargados (un solo punto de registro del dinero). No existe registrar pago desde Pensiones (reemplaza el dialog del prototipo).
- **Exportar a Excel: pospuesto** al módulo Reportes (E5/R2 tardío).
- La StatCard "Pago en línea" del prototipo se reemplaza por **Morosidad** (el pago en línea llega en R5).

### Devoluciones
- Flujo de dos pasos: Secretaría solicita (vinculada a un recibo, motivo obligatorio) → Admin aprueba o rechaza (justificación ≥ 10) → Caja ejecuta.
- Ejecución: **efectivo de caja o transferencia** (genera el egreso del día), **o aplicación a una cuota pendiente del mismo estudiante cuyo monto coincida exactamente** (queda Pagada con origen "Devolución D-xxxx"). **Sin saldo a favor / cuenta corriente** — si los montos no calzan exacto, se devuelve en dinero.

### Compromisos de pago
- Secretaría propone → Admin aprueba. Mientras esté vigente y al día, **mora y recordatorios de la deuda original se congelan**; una cuota del plan vencida e impaga (detectada por el job diario) lo marca **Incumplido** y reactiva mora y recordatorios sobre la deuda original.

### Compromisos y devoluciones — decisiones de la etapa 3 (jul 2026)
- **El compromiso reprograma cuotas 1:1** (reemplaza el "plan deuda ÷ N" del prototipo): toma las cuotas VENCIDAS seleccionadas de los hijos del apoderado firmante (pensiones, matrícula y programas) y le asigna a cada una su **nueva fecha** según la frecuencia (mensual/quincenal desde la primera fecha pactada). Los montos no cambian — la cuota conserva su mora ya aplicada (refinanciar no condona; el Admin puede exonerar aparte). Se cobran en Caja como cualquier cuota.
- **Fecha efectiva de una cuota**: la reprogramada si su compromiso está VIGENTE, si no la original. De ella derivan el estado mostrado (Pendiente/Vencido), la deuda, los recordatorios y la mora — así el congelamiento es una consecuencia, no un flag: mientras el compromiso esté vigente y al día, sus cuotas no aparecen vencidas ni en recordatorios ni generan mora nueva.
- **Estados**: Propuesto → (Admin) Vigente | Rechazado (justificación ≥ 10). Vigente → Cumplido (última cuota pagada) | Incumplido (el job diario lo marca **al día siguiente de la fecha pactada, sin gracia adicional**) | Anulado (Admin, justificación). Incumplido/Anulado devuelven las cuotas restantes a su condición vencida original (reactiva mora congelada pendiente y recordatorios). Anular el pago de una cuota del plan regresa el compromiso Cumplido → Vigente.
- **Devoluciones**: solicitud vinculada a un recibo EMITIDO (monto total o parcial, motivo ≥ 10) → Admin aprueba o rechaza (justificación ≥ 10) → Caja ejecuta según la forma pactada: **efectivo** (exige caja del día abierta; genera el egreso del día y descuenta del efectivo esperado del arqueo), **transferencia** (no toca el cajón; n° de operación opcional) o **aplicación exacta a una cuota pendiente del mismo estudiante** (queda Pagada con origen "Devolución D-xxxx", sin recibo). Comprobante de devolución imprimible con el patrón de documento aislado.
- **Historial de cajas**: pestaña en Caja y cobros con las cajas cerradas (quién abrió/cerró, cobrado, esperado vs. contado, diferencia, observaciones) y el detalle de movimientos de cada día. El reporte formal con exportación sigue en E5.
- Correlativos: compromisos `CP-####`, devoluciones `D-####`.

### Tesorería y dashboard
- **Planilla llega en R3**: mientras tanto los pagos al personal se registran como gasto manual (categoría "Planilla y personal").
- **Caja chica**: un solo fondo fijo con responsable y monto configurable; la rendición crea un único gasto consolidado en Gastos (origen: Caja chica) y repone el fondo.
- **Meta de cobranza del dashboard: derivada** (suma de cuotas del mes según cronogramas), no configurable a mano.

### Tesorería — decisiones de la etapa 4 (jul 2026)
- **Otros ingresos en EFECTIVO entran al arqueo**: registrarlos exige caja del día abierta; quedan vinculados a la sesión, aparecen como movimiento del día y suman al efectivo esperado del cierre. Su fecha es siempre la de hoy. Los cobrados por Yape/transferencia/tarjeta no exigen caja (no tocan el cajón).
- **Los gastos nunca salen del cajón de ventanilla**: se pagan por transferencia o del fondo administrativo (método efectivo permitido, pero sin tocar el arqueo). Única excepción: la **reposición de caja chica** puede tomarse del efectivo de la caja del día y se registra como egreso del arqueo.
- **Arqueo completo**: efectivo esperado = monto inicial + cobros en efectivo + otros ingresos en efectivo − devoluciones en efectivo − reposición de caja chica en efectivo.
- **Movimientos manuales editables con auditoría** (quién y qué cambió); eliminar sigue siendo anulación con motivo ≥ 10. El monto/método/anulación de un ingreso en efectivo solo pueden cambiar mientras su caja siga abierta (un arqueo cerrado no se altera).
- **Categorías de gasto/ingreso en tabla administrable** (seed = las del prototipo + "Planilla y personal"); solo se eliminan si no tienen movimientos, si no se desactivan.
- La advertencia del prototipo sobre "Materiales y útiles → Compras de almacén" queda como nota informativa (Inventario llega en R5); el origen automático de gastos en R2 es solo **Caja chica**.
- La StatCard "Caja disponible (efectivo + bancos)" del prototipo se reemplaza por **"Resultado acumulado del año"** (no hay saldos bancarios en R2).
- **Permiso nuevo `tesoreria`** (hasta ahora la nav lo mapeaba a `caja`): los usuarios existentes lo heredan de su permiso de caja vía migración de datos.
- Correlativos: gastos `G-####`, ingresos `I-####`, rendiciones `REND-####`.

### Anulación de matrícula vs. retiro — deuda (jul 2026, correctivo post-E5)
Detectado al anular una matrícula con cuotas vencidas: R1 anulaba solo cuotas PENDIENTE (antes de que existiera VENCIDO materializado) y las pantallas de dinero filtraban por matrícula no anulada, dejando deuda huérfana e indicadores que "mejoraban" al retirar. Decisión:
- **La deuda es del estudiante, no de la matrícula viva**: una cuota se debe según SU estado (Pendiente/Vencido), no según si su matrícula fue anulada. Todas las consultas de dinero (pensiones, caja, deuda, mora, recordatorios, compromisos, morosidad, dashboard) dejan de filtrar por matrícula anulada.
- **Anular matrícula = corrección de error de registro**: anula TODO el cronograma no pagado (pendientes Y vencidas) → deuda cero. Las pagadas conservan su recibo (corrección vía Devoluciones). La UI lo advierte y redirige al retiro cuando corresponde.
- **Retirar/Trasladar = salida real, deuda no condonada**: se anulan solo las cuotas futuras; las VENCIDAS quedan vivas y cobrables en Caja (el apoderado puede pagar después, recibir recordatorios y firmar compromisos). La pensión del **mes del retiro** sigue la **regla del día de corte** (misma config del ingreso): retiro hasta el día de corte → se anula; después → queda exigible. Aplica también a inscripciones de programas (se cancelan y sus cuotas siguen la misma regla).
- **La deuda de retirados cuenta igual** en morosidad, vencido acumulado, deudores, recordatorios y reportes (el detalle muestra el estado del estudiante para distinguirlos).

### Dashboard y reportes — decisiones de la etapa 5 (jul 2026)
El prototipo del dashboard mezcla datos de releases futuros; en R2 se reemplazan por datos reales:
- Tarjeta "Asistencia hoy" (R4) → **"Caja de hoy"**: estado de la caja del día (abierta/cerrada/sin abrir) + cobrado hoy.
- Barras "Asistencia por nivel" (R4) → **"Cobranza del mes por nivel"**: % cobrado vs. esperado del mes para Inicial/Primaria/Secundaria + Programas.
- "Próximos egresos" (necesita planilla R3) → **"Últimos gastos registrados"** (Tesorería); evolucionará a próximos egresos reales en R3.
- "Pagos recientes" = últimos recibos emitidos. "Principales deudores" = top familias por deuda vencida efectiva (excluye compromisos vigentes al día) con el botón Recordar reutilizando el flujo wa.me.
- La meta mensual de cobranza es derivada (suma de cuotas de pensión del mes), como ya estaba decidido.

Reportes (pantalla según `ReportsScreen.jsx`, permiso `reportes`): en R2 se habilitan **4 con exportación a Excel (.xlsx real, generado en el API)** — **Morosidad por grado** (resumen por grado + detalle por familia), **Ingresos por concepto** (pensiones/matrículas/programas/ventas/otros por periodo y método), **Caja diaria** (arqueos y movimientos por rango de fechas) y **Padrón de estudiantes** (con apoderado principal y contacto). "Asistencia mensual" y "Planilla anual" aparecen deshabilitados con la nota de su release (R4/R3). La regularización de diferencias de arqueo hacia tesorería se evaluó y quedó **fuera** (decisión del administrador: el registro del faltante/sobrante en el historial es suficiente).
