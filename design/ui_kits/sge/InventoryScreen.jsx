/* Elohim SGE — Inventario y activos. Registers window.SGE_Inventory.
   Tabs: Almacén (stock venta+suministros) · Compras (→ gasto en Tesorería) ·
   Activos (equipos por ubicación, incl. laboratorios) · Biblioteca (catálogo + préstamos).
   Integraciones: venta en Caja descuenta stock; compra crea gasto; avería genera gasto vinculado. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Tabs, Alert, Tooltip, StatCard, Dialog, Textarea, Checkbox } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);
  const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  /* ------------------------------ data ------------------------------ */
  const ALMACEN = [
    ["AL-001", "Libro Matemática 3° · Santillana", "Venta", 34, 10, 120.0],
    ["AL-002", "Uniforme diario (tallas 8–12)", "Venta", 18, 15, 85.0],
    ["AL-003", "Buzo institucional (tallas 8–12)", "Venta", 6, 10, 95.0],
    ["AL-004", "Folder institucional", "Venta", 52, 20, 8.0],
    ["AL-005", "Papel bond A4 (millar)", "Suministro", 4, 6, null],
    ["AL-006", "Tóner HP 85A", "Suministro", 0, 2, null],
    ["AL-007", "Kit de materiales de limpieza", "Suministro", 9, 4, null],
  ];
  const COMPRAS = [
    ["OC-0044", "06/07", "Compulaser Satipo", "Tóner HP 85A ×3", 255.0, "Pendiente", null],
    ["OC-0043", "03/07", "Librería San Marcos", "Papel bond A4 ×10 millares", 260.0, "Recibido", "G-0217"],
    ["OC-0042", "28/06", "Distribuidora Andina", "Uniformes ×20 · Buzos ×10", 2650.0, "Recibido", "G-0209"],
  ];
  const ACTIVOS = [
    ["AC-018", "Computadoras de cómputo (×15)", "Laboratorio de cómputo", "I. Quinto", "Operativo", 22500],
    ["AC-012", "Proyector Epson X49", "Laboratorio de cómputo", "P. Gómez", "Operativo", 1850],
    ["AC-021", "Microscopios (×6)", "Laboratorio de ciencias", "R. Meza", "Operativo", 4200],
    ["AC-007", "Impresora HP LaserJet", "Secretaría", "L. Campos", "En reparación", 950],
    ["AC-003", "Fotocopiadora Canon", "Dirección", "L. Campos", "Operativo", 3800],
    ["AC-015", "Carpetas unipersonales (×120)", "Aulas", "—", "Operativo", 14400],
  ];
  const LIBROS = [
    ["B-101", "Matemática 3° · Santillana", 12, 9],
    ["B-214", "María · Jorge Isaacs", 8, 6],
    ["B-330", "Atlas del Perú", 5, 4],
    ["B-118", "Comunicación 5° · Norma", 10, 10],
  ];
  const PRESTAMOS = [
    ["Hugo Vela Soto · 6° A", "Matemática 3° · Santillana", "01/07", "Atrasado"],
    ["María Quispe Roca · 3° B", "María · Jorge Isaacs", "10/07", "Prestado"],
    ["Prof. R. Meza", "Atlas del Perú", "08/07", "Prestado"],
  ];

  const stockTone = (s, min) => (s === 0 ? "danger" : s < min ? "warning" : "success");
  const stockLabel = (s, min) => (s === 0 ? "Agotado" : s < min ? "Stock bajo" : "OK");

  /* ------------------------------ Almacén ------------------------------ */
  function Almacen() {
    const [ajuste, setAjuste] = React.useState(null);
    const [nuevo, setNuevo] = React.useState(false);
    const data = ALMACEN.map((a) => ({ cod: a[0], item: a[1], cat: a[2], stock: a[3], min: a[4], precio: a[5] }));
    const bajos = data.filter((d) => d.stock < d.min).length;
    const cols = [
      { key: "cod", header: "Código", mono: true, width: 84 },
      { key: "item", header: "Artículo", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "cat", header: "Tipo", align: "center", render: (v) => <Badge tone={v === "Venta" ? "accent" : "info"}>{v}</Badge> },
      { key: "stock", header: "Stock", align: "center", mono: true, render: (v, r) => (
        <span style={{ fontWeight: 600, color: v === 0 ? "var(--danger)" : v < r.min ? "var(--warning)" : "var(--text-strong)" }}>{v}</span>) },
      { key: "min", header: "Mínimo", align: "center", mono: true, render: (v) => <span style={{ color: "var(--text-muted)" }}>{v}</span> },
      { key: "precio", header: "Precio venta", num: true, mono: true, render: (v) => v ? fmt(v) : <span style={{ color: "var(--text-subtle)" }}>—</span> },
      { key: "estado", header: "Estado", align: "center", render: (_, r) => (
        <Badge tone={stockTone(r.stock, r.min)} dot>{stockLabel(r.stock, r.min)}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Ajustar stock"><IconButton label="Ajustar" size="sm" onClick={() => setAjuste(r)}><Ic.Pencil /></IconButton></Tooltip>
          {r.stock < r.min && <Tooltip content="Generar orden de compra"><IconButton label="Comprar" size="sm" onClick={() => notify("info", "Orden de compra", `Borrador de compra de "${r.item}" creado en la pestaña Compras.`)}><Ic.Plus /></IconButton></Tooltip>}
        </div>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <StatCard label="Artículos" value="7" icon={<Ic.Box />} caption="4 de venta · 3 suministros" />
          <StatCard label="Stock bajo / agotado" value={String(bajos)} iconTone="danger" icon={<Ic.Chart />} caption="requieren compra" />
          <StatCard label="Valor en stock (venta)" value="S/ 6,494" iconTone="accent" icon={<Ic.Cash />} caption="a precio de venta" />
        </div>
        <Alert tone="info" title="Integrado con Caja">Las ventas de <b>Caja y cobros → Otros conceptos</b> descuentan stock automáticamente; las compras recibidas lo reponen. Los artículos agotados dejan de ofrecerse en Caja.</Alert>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}><Input placeholder="Buscar artículo…" iconLeft={<Ic.Search />} /></div>
          <Select placeholder="Tipo" options={["Venta", "Suministro"]} containerStyle={{ width: 140 }} />
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setNuevo(true)}>Nuevo artículo</Button>
        </div>
        <Card flush><Table columns={cols} data={data} hover zebra /></Card>

        {/* Ajustar stock */}
        <Dialog open={!!ajuste} onClose={() => setAjuste(null)} title={ajuste ? `Ajustar stock · ${ajuste.item}` : ""} icon={<Ic.Box />}
          description={ajuste ? `Stock actual: ${ajuste.stock} · mínimo: ${ajuste.min}` : ""}
          footer={<><Button variant="secondary" onClick={() => setAjuste(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Stock ajustado", `${ajuste.item} — el movimiento queda en el historial con motivo.`); setAjuste(null); }}>Guardar ajuste</Button></>}>
          {ajuste && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Select label="Tipo de movimiento" options={["Entrada (compra directa)", "Salida (consumo interno)", "Merma / deterioro", "Corrección de conteo"]} placeholder="Seleccione" required />
              <Input label="Cantidad" inputMode="numeric" placeholder="0" required />
              <Textarea label="Motivo" rows={2} required placeholder="Obligatorio — queda en el historial" containerStyle={{ gridColumn: "1 / -1" }} />
            </div>
          )}
        </Dialog>

        {/* Nuevo artículo */}
        <Dialog open={nuevo} onClose={() => setNuevo(false)} title="Nuevo artículo" icon={<Ic.Box />}
          footer={<><Button variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Artículo creado", "Si es de venta, ya aparece en Caja → Otros conceptos."); setNuevo(false); }}>Crear</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Nombre" required placeholder="Ej. Agenda escolar 2026" containerStyle={{ gridColumn: "1 / -1" }} />
            <Select label="Tipo" options={["Venta", "Suministro"]} placeholder="Seleccione" required hint="Venta se ofrece en Caja" />
            <Input label="Stock mínimo" inputMode="numeric" placeholder="0" />
            <Input label="Precio de venta" prefix="S/." inputMode="decimal" placeholder="Solo si es de venta" />
            <Input label="Stock inicial" inputMode="numeric" placeholder="0" />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ Compras ------------------------------ */
  function Compras() {
    const [nueva, setNueva] = React.useState(false);
    const data = COMPRAS.map((c) => ({ cod: c[0], fecha: c[1], prov: c[2], items: c[3], total: c[4], estado: c[5], gasto: c[6] }));
    const cols = [
      { key: "cod", header: "Orden", mono: true, width: 90 },
      { key: "fecha", header: "Fecha", mono: true, align: "center", width: 70 },
      { key: "prov", header: "Proveedor", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
          <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.items}</span>
        </div>) },
      { key: "total", header: "Total", num: true, mono: true, render: (v) => fmt(v) },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Recibido" ? "success" : "warning"} dot>{v}</Badge>) },
      { key: "gasto", header: "Gasto vinculado", align: "center", render: (v) => (
        v ? <Button size="sm" variant="link" onClick={() => { goTo("tesoreria"); notify("info", "Tesorería", `Abriendo el gasto ${v} en Gastos e ingresos.`); }}>{v}</Button>
          : <span style={{ font: "var(--type-caption)", color: "var(--text-subtle)" }}>al recibir</span>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        r.estado === "Pendiente"
          ? <Button size="sm" variant="primary" iconLeft={<Ic.Check />} onClick={() => notify("success", "Compra recibida", `${r.cod} · stock actualizado · gasto G-0219 creado en Tesorería (Materiales y útiles).`)}>Recibir</Button>
          : <Tooltip content="Ver detalle"><IconButton label="Ver" size="sm" onClick={() => notify("info", "Orden de compra", `${r.cod} · ${r.prov} · ${fmt(r.total)} · comprobante adjunto.`)}><Ic.Eye /></IconButton></Tooltip>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info" title="Un solo registro, dos efectos">Al marcar una compra como <b>recibida</b>, el stock del Almacén sube y el gasto se crea solo en <b>Gastos e ingresos</b> — nunca se digita dos veces.</Alert>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}><Input placeholder="Buscar por orden o proveedor…" iconLeft={<Ic.Search />} /></div>
          <Select placeholder="Estado" options={["Recibido", "Pendiente"]} containerStyle={{ width: 140 }} />
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setNueva(true)}>Nueva compra</Button>
        </div>
        <Card flush><Table columns={cols} data={data} hover /></Card>

        <Dialog open={nueva} onClose={() => setNueva(false)} size="lg" title="Nueva compra" icon={<Ic.Box />}
          description="Orden de compra a proveedor — repone stock y genera el gasto"
          footer={<><Button variant="secondary" onClick={() => setNueva(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Compra OC-0045 registrada", "Al recibirla se actualizará el stock y se creará el gasto en Tesorería."); setNueva(false); }}>Registrar compra</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Proveedor" required placeholder="Ej. Librería San Marcos" />
              <Input label="Fecha" type="date" defaultValue="2026-07-07" />
              <Select label="Artículo" options={ALMACEN.map((a) => a[1])} placeholder="Seleccione" required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Input label="Cantidad" inputMode="numeric" placeholder="0" required />
                <Input label="Costo unit." prefix="S/." inputMode="decimal" required />
              </div>
              <Select label="Método de pago" options={["Efectivo", "Transferencia", "Yape / Plin", "Crédito del proveedor"]} defaultValue="Transferencia" />
              <Input label="N° de comprobante" placeholder="Factura / boleta" />
            </div>
            <Button variant="ghost" size="sm" iconLeft={<Ic.Plus />} style={{ alignSelf: "flex-start" }} onClick={() => notify("info", "Ítem agregado", "Puedes añadir varios artículos a la misma orden.")}>Agregar otro artículo</Button>
            <Checkbox label="Generar gasto en Tesorería al recibir" description="Categoría: Materiales y útiles — editable" defaultChecked disabled />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ Activos ------------------------------ */
  function Activos() {
    const [ubic, setUbic] = React.useState("Todas");
    const [hist, setHist] = React.useState(null);
    const [averia, setAveria] = React.useState(null);
    const [alta, setAlta] = React.useState(false);
    const UBICS = ["Todas", "Laboratorio de cómputo", "Laboratorio de ciencias", "Aulas", "Secretaría", "Dirección"];
    const data = ACTIVOS.map((a) => ({ cod: a[0], activo: a[1], ubic: a[2], resp: a[3], estado: a[4], valor: a[5] }))
      .filter((a) => ubic === "Todas" || a.ubic === ubic);
    const cols = [
      { key: "cod", header: "Código", mono: true, width: 84 },
      { key: "activo", header: "Activo", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "ubic", header: "Ubicación", render: (v) => <Badge tone={v.startsWith("Laboratorio") ? "brand" : "neutral"}>{v}</Badge> },
      { key: "resp", header: "Responsable", render: (v) => v === "—" ? <span style={{ color: "var(--text-subtle)" }}>—</span> : (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Avatar name={v} size="xs" /><span style={{ font: "var(--type-caption)" }}>{v}</span></div>) },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Operativo" ? "success" : v === "En reparación" ? "warning" : "neutral"} dot>{v}</Badge>) },
      { key: "valor", header: "Valor", num: true, mono: true, render: (v) => fmt(v).replace(".00", "") },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Historial de mantenimiento"><IconButton label="Historial" size="sm" onClick={() => setHist(r)}><Ic.Clock /></IconButton></Tooltip>
          <Tooltip content="Reportar avería"><IconButton label="Avería" size="sm" variant="danger" onClick={() => setAveria(r)}><Ic.Settings /></IconButton></Tooltip>
        </div>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <StatCard label="Activos registrados" value="6" icon={<Ic.Building />} caption="en 5 ubicaciones" />
          <StatCard label="En reparación" value="1" iconTone="danger" icon={<Ic.Settings />} caption="impresora de Secretaría" />
          <StatCard label="Valor total" value="S/ 47,700" iconTone="accent" icon={<Ic.Cash />} caption="a valor de adquisición" />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Select label="Ubicación" options={UBICS} value={ubic} onChange={(e) => setUbic(e.target.value)} containerStyle={{ width: 220 }} />
          <div style={{ flex: 1 }}><Input placeholder="Buscar activo…" iconLeft={<Ic.Search />} /></div>
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Exportado", "Inventario de activos descargado en Excel.")}>Exportar</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setAlta(true)}>Registrar activo</Button>
        </div>
        <Card flush title={ubic === "Todas" ? "Todos los activos" : ubic} subtitle="Los laboratorios son vistas por ubicación de este mismo inventario">
          <Table columns={cols} data={data} hover zebra />
        </Card>

        {/* Alta de activo */}
        <Dialog open={alta} onClose={() => setAlta(false)} size="lg" title="Registrar activo" icon={<Ic.Building />}
          description="Equipos y mobiliario durable de la institución"
          footer={<><Button variant="secondary" onClick={() => setAlta(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Activo registrado", "Ya aparece en el inventario de su ubicación con historial vacío."); setAlta(false); }}>Registrar</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Nombre del activo" required placeholder="Ej. Proyector Epson X49" containerStyle={{ gridColumn: "1 / -1" }} />
            <Select label="Ubicación" options={UBICS.filter((u) => u !== "Todas")} placeholder="Seleccione" required />
            <Select label="Responsable" options={["P. Gómez", "L. Díaz", "I. Quinto", "R. Meza", "L. Campos", "Sin asignar"]} placeholder="Seleccione" />
            <Input label="Cantidad" inputMode="numeric" defaultValue="1" hint="Para lotes (ej. 15 computadoras)" />
            <Input label="Valor de adquisición" prefix="S/." inputMode="decimal" placeholder="0.00" required />
            <Input label="Fecha de adquisición" type="date" defaultValue="2026-07-07" />
            <Select label="Origen" options={["Compra (vincular orden)", "Donación", "Ya existía (inventario inicial)"]} defaultValue="Ya existía (inventario inicial)" hint="Si es compra, se enlaza a su gasto" />
            <Textarea label="Descripción / número de serie" rows={2} placeholder="Opcional" containerStyle={{ gridColumn: "1 / -1" }} />
          </div>
        </Dialog>

        {/* Historial */}
        <Dialog open={!!hist} onClose={() => setHist(null)} size="lg" title={hist ? `Historial · ${hist.activo}` : ""} icon={<Ic.Clock />}
          description={hist ? `${hist.cod} · ${hist.ubic} · Responsable: ${hist.resp}` : ""}
          footer={<Button variant="secondary" onClick={() => setHist(null)}>Cerrar</Button>}>
          {hist && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              {(hist.cod === "AC-007" ? [
                ["04/07/2026", "Reparación de rodillo de arrastre", "G-0218 · S/ 120.00"],
                ["12/03/2026", "Mantenimiento preventivo", "G-0141 · S/ 80.00"],
                ["15/08/2025", "Cambio de tóner y limpieza", "—"],
              ] : [["10/02/2026", "Revisión de inicio de año — operativo", "—"]]).map(([f, d, g]) => (
                <div key={f + d} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
                  <span style={{ font: "var(--type-2xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)", width: 78 }}>{f}</span>
                  <span style={{ flex: 1, font: "var(--type-label)", color: "var(--text-body)" }}>{d}</span>
                  {g !== "—"
                    ? <Button size="sm" variant="link" onClick={() => { setHist(null); goTo("tesoreria"); notify("info", "Tesorería", "Abriendo el gasto vinculado."); }}>{g}</Button>
                    : <span style={{ font: "var(--type-caption)", color: "var(--text-subtle)" }}>sin costo</span>}
                </div>
              ))}
            </div>
          )}
        </Dialog>

        {/* Avería */}
        <Dialog open={!!averia} onClose={() => setAveria(null)} title={averia ? `Reportar avería · ${averia.activo}` : ""} icon={<Ic.Settings />} iconTone="warning"
          footer={<><Button variant="secondary" onClick={() => setAveria(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("warning", "Avería registrada", `${averia.activo} pasa a "En reparación"; el costo se vinculará como gasto de Mantenimiento.`); setAveria(null); }}>Registrar</Button></>}>
          {averia && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
              <Textarea label="Descripción de la avería" rows={2} required placeholder="Ej. no enciende, atasco recurrente…" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Costo estimado" prefix="S/." inputMode="decimal" placeholder="Opcional" />
                <Input label="Proveedor / técnico" placeholder="Opcional" />
              </div>
              <Checkbox label="Generar gasto en Tesorería al pagar la reparación" description="Categoría: Mantenimiento y reparaciones — quedará vinculado a este activo" defaultChecked />
            </div>
          )}
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ Biblioteca ------------------------------ */
  function Biblioteca() {
    const [prestar, setPrestar] = React.useState(false);
    const [nuevoTitulo, setNuevoTitulo] = React.useState(false);
    const catCols = [
      { key: "cod", header: "Código", mono: true, width: 80 },
      { key: "titulo", header: "Título", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "ej", header: "Ejemplares", align: "center", mono: true },
      { key: "disp", header: "Disponibles", align: "center", render: (v, r) => (
        <Badge tone={v === 0 ? "danger" : v < r.ej ? "warning" : "success"}>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <Button size="sm" variant="secondary" disabled={r.disp === 0} onClick={() => setPrestar(true)}>Prestar</Button>) },
    ];
    const preCols = [
      { key: "quien", header: "Prestatario", render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={v} size="xs" /><span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span></div>) },
      { key: "libro", header: "Libro" },
      { key: "vence", header: "Devolución", mono: true, align: "center" },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Atrasado" ? "danger" : "info"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 6 }}>
          {r.estado === "Atrasado" && <Button size="sm" variant="ghost" iconLeft={<Ic.Send />} onClick={() => notify("success", "Recordatorio enviado", `Aviso de devolución de "${r.libro}" enviado al apoderado por WhatsApp.`)}>Recordar</Button>}
          <Button size="sm" variant="secondary" iconLeft={<Ic.Check />} onClick={() => notify("success", "Devolución registrada", `"${r.libro}" vuelve a estar disponible.`)}>Devolver</Button>
        </div>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}><Input placeholder="Buscar por título, autor o código…" iconLeft={<Ic.Search />} /></div>
          <Button variant="secondary" iconLeft={<Ic.Plus />} onClick={() => setNuevoTitulo(true)}>Nuevo título</Button>
          <Button variant="primary" iconLeft={<Ic.Book />} onClick={() => setPrestar(true)}>Registrar préstamo</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card flush title="Catálogo" subtitle="35 ejemplares · 4 títulos">
            <Table columns={catCols} data={LIBROS.map((l) => ({ cod: l[0], titulo: l[1], ej: l[2], disp: l[3] }))} hover />
          </Card>
          <Card flush title="Préstamos activos" subtitle="1 atrasado — notifica al apoderado">
            <Table columns={preCols} data={PRESTAMOS.map((p) => ({ quien: p[0], libro: p[1], vence: p[2], estado: p[3] }))} hover />
          </Card>
        </div>
        <Dialog open={prestar} onClose={() => setPrestar(false)} title="Registrar préstamo" icon={<Ic.Book />}
          footer={<><Button variant="secondary" onClick={() => setPrestar(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Préstamo registrado", "El ejemplar queda descontado de los disponibles."); setPrestar(false); }}>Prestar</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Select label="Libro" options={LIBROS.filter((l) => l[3] > 0).map((l) => l[1])} placeholder="Seleccione" required containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="Estudiante o docente" placeholder="Buscar por nombre o código…" required containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="Fecha de devolución" type="date" defaultValue="2026-07-14" />
            <Select label="Duración" options={["7 días", "14 días", "Fin del bimestre"]} defaultValue="7 días" />
          </div>
        </Dialog>

        {/* Nuevo título */}
        <Dialog open={nuevoTitulo} onClose={() => setNuevoTitulo(false)} title="Nuevo título" icon={<Ic.Book />}
          description="Alta de libro en el catálogo de la biblioteca"
          footer={<><Button variant="secondary" onClick={() => setNuevoTitulo(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Título agregado", "Ya está disponible para préstamos."); setNuevoTitulo(false); }}>Agregar al catálogo</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Título" required placeholder="Ej. Historia del Perú · 4°" containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="Autor / editorial" placeholder="Ej. Santillana" />
            <Input label="Código" placeholder="B-___" hint="Se sugiere automáticamente" />
            <Input label="N° de ejemplares" inputMode="numeric" defaultValue="1" required />
            <Select label="Categoría" options={["Texto escolar", "Literatura", "Consulta / referencia", "Religión"]} placeholder="Seleccione" />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_Inventory = function Inventory() {
    const [tab, setTab] = React.useState("almacen");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: "almacen", label: "Almacén", count: 3 },
          { id: "compras", label: "Compras de almacén", count: 1 },
          { id: "activos", label: "Activos y laboratorios" },
          { id: "biblioteca", label: "Biblioteca", count: 3 },
        ]} />
        {tab === "almacen" && <Almacen />}
        {tab === "compras" && <Compras />}
        {tab === "activos" && <Activos />}
        {tab === "biblioteca" && <Biblioteca />}
      </div>
    );
  };
})();
