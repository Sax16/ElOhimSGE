# UI Kit — Elohim SGE Dashboard

High-fidelity, click-through recreation of the school-management ERP for **I.E.P. Elohim** (Colegio Cristocéntrico, Satipo). Built entirely from the design-system components — no bespoke primitives.

## Run
Open `index.html`. It loads the compiled `_ds_bundle.js` and the screen scripts. Start at the **login** screen → "Entrar al sistema" → the app shell.

## Screens
- **LoginScreen.jsx** — split brand panel (insignia + institutional blue) and credential form.
- **AcademicStructureScreen.jsx** — año académico header + wizard "Iniciar año" (copiar estructura, promoción, confirmar); tabs: Estructura (árbol Nivel→Grado→Sección con turnos, tutores y vacantes), Plan de estudios, Programas (talleres/reforzamiento/academia), Periodos (bimestres).
- **EnrollmentScreen.jsx** — listado del proceso de matrícula (stats, tipos Nueva/Ratificada/Traslado) + asistente de 5 pasos: Estudiante (nuevo o existente) → Apoderados (N:M, contacto principal) → Ubicación (selector de sección con vacantes, programas opcionales) → Tarifa y cronograma (descuentos/beca, preview de 11 pagos) → Confirmación → pantalla de éxito con "Cobrar matrícula ahora".
- **CashierScreen.jsx** — Caja y cobros: pestaña **Cobrar** (buscar estudiante, seleccionar cuotas con mora, agregar otros conceptos —libros/uniformes—, método de pago con cálculo de vuelto, recibo numerado imprimible) y **Caja del día** (apertura, stats efectivo/digital, movimientos con anulación, cierre con arqueo que detecta faltante/sobrante).
- **StaffScreen.jsx** — Personal (RRHH): **Personal** (listado por rol/régimen/estado + ficha), **Asistencia y marcación** (ingreso/salida, puntual/tardanza/falta/licencia, regla de tolerancia 8:00), **Planilla** (sueldo − descuentos − aportes = neto, pago individual o masivo, boletas).
- **GuardiansScreen.jsx** — Apoderados: listado con deuda familiar consolidada y ficha con hijos vinculados (N:M), recordatorios de pago.
- **FeesScreen.jsx** — Tarifario y becas: tarifas por nivel y programa (alimentan el cronograma automático), configuración de mora, y catálogo de descuentos/becas (automáticos vs manuales) con beneficiarios.
- **SettingsScreen.jsx** — Configuración: datos de la institución (código modular, RUC, UGEL, insignia), notificaciones a apoderados (canales y disparadores), usuarios y roles.
- **TreasuryScreen.jsx** — Gastos e ingresos (tesorería): **Resumen del mes** (ingresos vs egresos por rubro con navegación cruzada, gastos por categoría), **Gastos** (servicios, materiales, mantenimiento, infraestructura — con proveedor, comprobante y anulación) y **Otros ingresos** (impresiones, alquiler de ambientes, trámites documentarios, ventas, kiosco, donaciones).
- **TeacherScreen.jsx** — Portal Docente (rol "Docente" desde el login): **Mis clases** (clases de hoy, avance de notas) y **Asistencia de estudiantes** (P/T/F/J por alumno, "todos presentes", aviso al apoderado en faltas). La vista admin "Asistencia" reutiliza la misma pantalla.
- **ScheduleScreen.jsx** — Horarios: grilla semanal por sección (clic en celda para reasignar, validación de choques) y asignación docente (curso × secciones × horas con indicador de carga).
- **AnnouncementsScreen.jsx** — Comunicados: enviados/programados/borradores, nuevo comunicado con alcance (colegio/nivel/sección), canal WhatsApp/correo, programación y confirmación de lectura.
- **ReportsScreen.jsx** — Reportes: seis reportes exportables (morosidad, ingresos, padrón, asistencia, planilla, caja) con vista previa de morosidad por grado.
- Retiros/traslados: desde la ficha del estudiante (StudentsScreen) — retiro o traslado con motivo, constancia y advertencia de deuda.
- **mobile.html** — referencia responsive: versiones móviles de la asistencia del docente y la marcación de Portería (tarjetas en vez de tablas, targets 44px, acción primaria fija abajo). Reglas generales en `docs/responsive.md`.
- **InventoryScreen.jsx** — Inventario y activos: **Almacén** (stock venta/suministros, mínimos, ajustes con motivo), **Compras** (orden → al recibir repone stock y crea el gasto en Tesorería; gasto vinculado navegable), **Activos y laboratorios** (ubicación, responsable, historial de mantenimiento ligado a gastos, averías), **Biblioteca** (catálogo + préstamos, recordatorio de devolución al apoderado). Integrado con Caja (ventas descuentan stock) y Tesorería (único punto de registro del gasto).
- **DashboardScreen.jsx** — KPI stat cards, recent-payments table, monthly collection progress, attendance by level.
- **StudentsScreen.jsx** — searchable/filterable student roster with status badges, active-filter tags, pagination and a student-detail dialog.
- **PaymentsScreen.jsx** — pensiones with KPI cards, status tabs (todas/pendientes/pagadas) and a "registrar pago" dialog (efectivo / Yape / transferencia).
- **GradesScreen.jsx** — vigesimal (0–20) grade-entry table with per-cell inputs that color by approval threshold, course tabs and an acta export.

## Shell
The shell (Sidebar + Topbar) lives in `index.html`. It manages auth, the active route, sidebar collapse, and a light/dark toggle (persisted to `localStorage`). Routes without a dedicated screen render a friendly "módulo en construcción" EmptyState — the navigation frame is complete even where modules are pending.

## Notes
- Icons come from `icons.jsx` (Lucide-style, 1.8px stroke) — registered on `window.SGEIcons`.
- All data is fabricated sample content (Peruvian names, soles, DNI format, turnos mañana/tarde).
- Components are consumed via `window.ElohimSGEDesignSystem_956020`.
