# Elohim SGE — Guía responsive (obligatoria para code)

El SGE es **desktop-first**: secretaría, caja y dirección operan en PC. El diseño responsive no es rehacer las pantallas, sino aplicar estas reglas de transformación por patrón. Breakpoints sugeridos: `lg ≥1024` (layout completo), `md 768–1023` (tablet), `sm <768` (móvil).

## Reglas por patrón

| Patrón | Tablet (md) | Móvil (sm) |
|---|---|---|
| **Sidebar** | Colapsada a iconos (`--sidebar-width-collapsed`) | Drawer sobre overlay; se abre con el hamburger del topbar |
| **Topbar** | Igual, búsqueda más angosta | Búsqueda se oculta tras un icono; título + hamburger + avatar |
| **Tablas de datos** | Igual (scroll horizontal si hace falta) | **Opción A** (listados operativos): filas → tarjetas apiladas (identidad arriba, datos clave abajo, acciones a la derecha). **Opción B** (tablas contables/planilla): scroll horizontal con primera columna fija (`position: sticky; left: 0`) |
| **Grid de StatCards (4 col)** | 2×2 | 1 columna (o carrusel horizontal con snap) |
| **Formularios 2–3 columnas** | 2 columnas | 1 columna; los campos `gridColumn: 1/-1` no cambian |
| **Diálogos** | Igual (max-width) | Pantalla completa (inset 0, sin radius); footer de acciones fijo abajo |
| **Wizard matrícula (stepper)** | Igual | Indicador compacto "Paso 2 de 5" + nombre del paso |
| **Tabs** | Igual | Scroll horizontal con fade en los bordes; nunca envolver a 2 líneas |
| **Árbol de estructura académica** | Igual | Acordeones de ancho completo; acciones en menú "⋯" |
| **Calendario mensual** | Igual | Lista de agenda (eventos por día) en vez de grilla 7×n |
| **Toolbars de filtros** | Envuelven (flex-wrap ya presente) | Búsqueda arriba; filtros tras botón "Filtros" (ya existe el diálogo) |

## Reglas duras
- Targets táctiles ≥ **44px** en móvil (los Button `md` de 38px pasan a `lg` 46px en vistas móviles).
- La tipografía **no se reduce** en móvil; se reduce la densidad (padding), no el tamaño de letra.
- Los toasts pasan a ancho completo abajo (`bottom-center`).
- Nunca ocultar la acción primaria de la vista; puede fijarse al fondo (barra sticky).

## Vistas con diseño móvil explícito (prioridad de implementación)
Estas se usan en el celular con certeza — hay maqueta de referencia en `ui_kits/sge/mobile.html`:
1. **Asistencia del docente** — pasa lista desde el aula con el teléfono.
2. **Marcación de Portería** — control de ingreso/salida en la puerta.
3. (Futuro) Portal del apoderado — nacerá mobile-first.

El resto del sistema puede lanzarse desktop/tablet y ganar móvil progresivamente aplicando la tabla de arriba.
