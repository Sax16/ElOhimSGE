/* Elohim SGE — Gastos e ingresos varios (tesorería). Registers window.SGE_Treasury.
   Tabs: Resumen del mes · Gastos · Otros ingresos. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Tabs, Alert, Tooltip, StatCard, Dialog, Textarea, Pagination, ProgressBar } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);
  const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  const CAT_GASTO = ["Servicios (luz, agua, internet)", "Materiales y útiles", "Mantenimiento y reparaciones", "Infraestructura", "Transporte", "Trámites y licencias", "Otros gastos"];
  const CAT_INGRESO = ["Impresiones y copias", "Alquiler de ambientes", "Trámites documentarios", "Venta de materiales", "Kiosco / cafetería", "Donaciones", "Otros ingresos"];

  const GASTOS = [
    ["G-0219", "05/07", "Reposición caja chica · rendición de 5 gastos menores", "Otros gastos", "Efectivo", 89.5, "Fondo fijo · L. Campos", "L. Campos", { tipo: "Caja chica", ref: "REND-07-01", to: null }],
    ["G-0218", "04/07", "Reparación de impresora de Secretaría", "Mantenimiento y reparaciones", "Efectivo", 120.0, "Multiservicios Rojas", "L. Campos", { tipo: "Activo", ref: "AC-007", to: "inventario" }],
    ["G-0217", "03/07", "Papel bond A4 (10 millares)", "Materiales y útiles", "Transferencia", 260.0, "Librería San Marcos", "L. Campos", { tipo: "Compra", ref: "OC-0043", to: "inventario" }],
    ["G-0216", "02/07", "Servicio de pintado · aulas 3° y 4°", "Infraestructura", "Efectivo", 850.0, "J. Huamán (contratista)", "Dir. Pérez", null],
    ["G-0215", "01/07", "Internet y telefonía · Julio", "Servicios (luz, agua, internet)", "Transferencia", 380.0, "Movistar", "L. Campos", null],
    ["G-0214", "01/07", "Luz · Junio", "Servicios (luz, agua, internet)", "Transferencia", 520.0, "Electrocentro", "L. Campos", null],
  ];
  const INGRESOS = [
    ["I-0142", "04/07", "Impresiones y copias · semana", "Impresiones y copias", "Efectivo", 86.5, "L. Campos"],
    ["I-0141", "03/07", "Constancia de estudios (×4)", "Trámites documentarios", "Efectivo", 60.0, "L. Campos"],
    ["I-0140", "02/07", "Alquiler de losa deportiva · sábado", "Alquiler de ambientes", "Yape / Plin", 150.0, "L. Campos"],
    ["I-0139", "01/07", "Certificado de conducta (×2)", "Trámites documentarios", "Efectivo", 30.0, "L. Campos"],
    ["I-0138", "01/07", "Venta de folder institucional (×12)", "Venta de materiales", "Efectivo", 96.0, "L. Campos"],
  ];

  /* ------------------------------ form dialog ------------------------------ */
  function MovDialog({ kind, open, onClose, mov }) {
    const esGasto = kind === "gasto";
    const [cat, setCat] = React.useState("");
    React.useEffect(() => { if (open) setCat(mov ? mov.cat : ""); }, [open, mov]);
    const esInventariable = esGasto && cat === "Materiales y útiles";
    return (
      <Dialog open={open} onClose={onClose} size="lg" icon={esGasto ? <Ic.Cash /> : <Ic.Receipt />} iconTone={esGasto ? "danger" : "success"}
        title={mov ? `Editar · ${mov.det}` : esGasto ? "Registrar gasto" : "Registrar ingreso"}
        description={esGasto ? "Egresos operativos: servicios, compras, mantenimiento…" : "Ingresos no académicos: impresiones, alquileres, trámites…"}
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", mov ? "Movimiento actualizado" : esGasto ? "Gasto registrado" : "Ingreso registrado", mov ? "Cambios guardados." : `Asignado al ${esGasto ? "egreso" : "ingreso"} del día y al resumen del mes.`); onClose(); }}>
            {mov ? "Guardar cambios" : "Registrar"}</Button></>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
          <Input label="Descripción" required placeholder={esGasto ? "Ej. Compra de papel bond A4" : "Ej. Alquiler de losa deportiva"} defaultValue={mov ? mov.det : ""} containerStyle={{ gridColumn: "1 / -1" }} />
          <Select label="Categoría" required placeholder="Seleccione" options={esGasto ? CAT_GASTO : CAT_INGRESO} value={cat} onChange={(e) => setCat(e.target.value)} />
          <Input label="Monto" prefix="S/." required inputMode="decimal" defaultValue={mov ? mov.monto.toFixed(2) : ""} placeholder="0.00" />
          <Input label="Fecha" type="date" defaultValue="2026-07-06" />
          <Select label="Método" options={["Efectivo", "Yape / Plin", "Transferencia", "Tarjeta"]} defaultValue={mov ? mov.met : "Efectivo"} />
          {esGasto && <Input label="Proveedor / beneficiario" placeholder="Ej. Librería San Marcos" defaultValue={mov ? mov.prov : ""} />}
          {esGasto && <Input label="N° de comprobante" placeholder="Boleta/factura (opcional)" />}
          <Textarea label="Observaciones" rows={2} placeholder="Opcional…" containerStyle={{ gridColumn: "1 / -1" }} />
          {esInventariable && (
            <Alert tone="warning" title="¿Es una compra de artículos con stock?" style={{ gridColumn: "1 / -1" }}
              actions={<Button size="sm" variant="secondary" onClick={() => { onClose(); goTo("inventario"); notify("info", "Inventario", "Regístrala en la pestaña Compras de almacén para que también actualice el stock."); }}>Ir a Compras de almacén</Button>}>
              Si compraste papel, tóner, uniformes u otro artículo del almacén, regístralo en <b>Inventario → Compras de almacén</b>: el gasto se creará aquí solo y además actualizará el stock.
            </Alert>
          )}
        </div>
      </Dialog>
    );
  }

  /* ------------------------------ tablas ------------------------------ */
  function useMovTable(kind, data, onEdit) {
    const esGasto = kind === "gasto";
    return [
      { key: "cod", header: "N°", mono: true, width: 84 },
      { key: "fecha", header: "Fecha", mono: true, align: "center", width: 70 },
      { key: "det", header: "Descripción", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
          {r.prov && <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.prov}</span>}
        </div>) },
      { key: "cat", header: "Categoría", render: (v) => <Badge tone={esGasto ? "danger" : "success"}>{v.split(" (")[0]}</Badge> },
      ...(esGasto ? [{ key: "origen", header: "Origen", align: "center", render: (v) => (
        v ? <Button size="sm" variant="link" onClick={() => {
              if (v.to) { goTo(v.to); notify("info", "Inventario", `Abriendo ${v.tipo === "Compra" ? "la orden" : "el activo"} ${v.ref}.`); }
              else notify("info", `Rendición ${v.ref}`, "5 gastos menores del fondo fijo · detalle y comprobantes adjuntos (pestaña Caja chica).");
            }}>{v.tipo} · {v.ref}</Button>
          : <Badge tone="neutral">Manual</Badge>) }] : []),
      { key: "met", header: "Método", align: "center", render: (v) => (
        <Badge tone={v === "Efectivo" ? "neutral" : v === "Yape / Plin" ? "brand" : "info"}>{v}</Badge>) },
      { key: "monto", header: "Monto", num: true, mono: true, render: (v) => (
        <span style={{ fontWeight: 600, color: esGasto ? "var(--danger)" : "var(--success)" }}>{esGasto ? "−" : "+"} {fmt(v)}</span>) },
      { key: "reg", header: "Registró", render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Avatar name={v} size="xs" /><span style={{ font: "var(--type-caption)" }}>{v}</span></div>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        r.origen
          ? <Tooltip content={`Se corrige en su módulo de origen (${r.origen.ref})`}><IconButton label="Ver origen" size="sm" onClick={() => { if (r.origen.to) { goTo(r.origen.to); notify("info", "Inventario", `Abriendo ${r.origen.ref} — los gastos automáticos se corrigen allí.`); } else notify("info", `Rendición ${r.origen.ref}`, "Se gestiona en la pestaña Caja chica — los gastos automáticos no se editan aquí."); }}><Ic.Eye /></IconButton></Tooltip>
          : <div style={{ display: "inline-flex", gap: 2 }}>
              <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => onEdit(r)}><Ic.Pencil /></IconButton></Tooltip>
              <Tooltip content="Anular"><IconButton label="Anular" size="sm" variant="danger" onClick={() => notify("warning", "Movimiento anulado", `${r.cod} anulado — queda en el historial con motivo.`)}><Ic.Trash /></IconButton></Tooltip>
            </div>) },
    ];
  }

  function MovTab({ kind }) {
    const esGasto = kind === "gasto";
    const [dlg, setDlg] = React.useState(null); // {} nuevo · {mov} editar
    const data = (esGasto ? GASTOS : INGRESOS).map((g) => esGasto
      ? { cod: g[0], fecha: g[1], det: g[2], cat: g[3], met: g[4], monto: g[5], prov: g[6], reg: g[7], origen: g[8] }
      : { cod: g[0], fecha: g[1], det: g[2], cat: g[3], met: g[4], monto: g[5], reg: g[6] });
    const cols = useMovTable(kind, data, (r) => setDlg({ mov: r }));
    const total = data.reduce((a, r) => a + r.monto, 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {esGasto && <Alert tone="info">Los gastos con origen <b>Compra</b>, <b>Activo</b> o <b>Caja chica</b> se generaron automáticamente y se corrigen en su módulo de origen; aquí solo se registran gastos sin stock (servicios, contratistas, trámites).</Alert>}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input placeholder="Buscar por descripción, proveedor o N°…" iconLeft={<Ic.Search />} />
          </div>
          <Select placeholder="Categoría" options={esGasto ? CAT_GASTO : CAT_INGRESO} containerStyle={{ width: 210 }} />
          <Input label="" type="date" defaultValue="2026-07-06" containerStyle={{ width: 160 }} />
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Exportado", `${esGasto ? "Gastos" : "Ingresos"} de Julio 2026 descargados en Excel.`)}>Exportar</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setDlg({})}>{esGasto ? "Registrar gasto" : "Registrar ingreso"}</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={data} hover zebra />
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Pagination page={1} pageCount={4} onPageChange={() => {}} total={38} pageSize={10} />
            <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", color: esGasto ? "var(--danger)" : "var(--success)" }}>
              {esGasto ? "−" : "+"} {fmt(total)} <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)", fontWeight: 400 }}>esta semana</span>
            </span>
          </div>
        </Card>
        <MovDialog kind={kind} open={!!dlg} onClose={() => setDlg(null)} mov={dlg && dlg.mov} />
      </div>
    );
  }

  /* ------------------------------ resumen ------------------------------ */
  function Resumen() {
    const RUBROS = [
      { r: "Pensiones y matrículas", m: 84320, tone: "success", to: "pagos" },
      { r: "Otros ingresos", m: 1830, tone: "success", to: null },
      { r: "Planilla", m: -28450, tone: "danger", to: "docentes" },
      { r: "Gastos operativos", m: -4780, tone: "danger", to: null },
    ];
    const ingresos = 86150, gastos = 33230, neto = ingresos - gastos;
    const catGastos = [["Servicios", 900], ["Infraestructura", 850], ["Materiales", 620], ["Mantenimiento", 410], ["Otros", 2000]];
    const maxCat = Math.max(...catGastos.map((c) => c[1]));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Ingresos · Julio" value={fmt(ingresos).replace(".00", "")} iconTone="success" icon={<Ic.Cash />} delta={5.2} caption="pensiones + varios" />
          <StatCard label="Egresos · Julio" value={fmt(gastos).replace(".00", "")} iconTone="danger" icon={<Ic.Chart />} delta={2.1} deltaDirection="up" caption="planilla + gastos" />
          <StatCard label="Resultado neto" value={fmt(neto).replace(".00", "")} icon={<Ic.Check />} caption="del mes en curso" />
          <StatCard label="Caja disponible" value="S/ 18,940" iconTone="accent" icon={<Ic.Receipt />} caption="efectivo + bancos" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
          <Card flush title="Ingresos vs egresos por rubro" subtitle="Julio 2026">
            <div>
              {RUBROS.map((x) => (
                <div key={x.r} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: x.m > 0 ? "var(--success)" : "var(--danger)", flexShrink: 0 }}></span>
                  <span style={{ flex: 1, font: "var(--type-label)", color: "var(--text-strong)" }}>{x.r}</span>
                  <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", fontWeight: 600, color: x.m > 0 ? "var(--success)" : "var(--danger)" }}>{x.m > 0 ? "+" : "−"} {fmt(Math.abs(x.m))}</span>
                  {x.to && <Button size="sm" variant="ghost" iconRight={<Ic.ChevronRight />} onClick={() => goTo(x.to)}>Ver</Button>}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 18px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-sunken)" }}>
                <span style={{ font: "var(--type-label)", fontWeight: 600 }}>Resultado del mes</span>
                <span style={{ font: "var(--type-h3)", fontFamily: "var(--font-mono)", color: "var(--success)" }}>+ {fmt(neto)}</span>
              </div>
            </div>
          </Card>
          <Card title="Gastos por categoría" subtitle="Julio 2026 · S/ 4,780">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {catGastos.map(([c, m]) => (
                <ProgressBar key={c} label={c} value={m} max={maxCat} showValue size="sm" tone="danger" valueFormat={() => fmt(m).replace(".00", "")} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  /* ------------------------------ Caja chica ------------------------------ */
  function CajaChica() {
    const FONDO = 500;
    const ITEMS = [
      ["07/07", "Pasajes · trámite en UGEL Satipo", 12.0, "—"],
      ["06/07", "Agua y azúcar para dirección", 18.5, "B-0041"],
      ["04/07", "Plumones y mota (urgente)", 24.0, "B-0038"],
      ["03/07", "Fotocopias notariales", 15.0, "—"],
      ["01/07", "Movilidad · compra de materiales", 20.0, "B-0032"],
    ];
    const gastado = ITEMS.reduce((a, x) => a + x[2], 0);
    const saldo = FONDO - gastado;
    const [nuevo, setNuevo] = React.useState(false);
    const [rendir, setRendir] = React.useState(false);
    const cols = [
      { key: "fecha", header: "Fecha", mono: true, width: 70, align: "center" },
      { key: "concepto", header: "Concepto", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "comp", header: "Comprobante", align: "center", render: (v) => v === "—" ? <Badge tone="neutral" size="sm">Sin comprobante</Badge> : <span style={{ font: "var(--type-mono)" }}>{v}</span> },
      { key: "monto", header: "Monto", num: true, mono: true, render: (v) => <span style={{ color: "var(--danger)" }}>− {fmt(v)}</span> },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <StatCard label="Fondo fijo" value={fmt(FONDO).replace(".00", "")} icon={<Ic.Cash />} caption="responsable: L. Campos" />
          <StatCard label="Gastado" value={fmt(gastado)} iconTone="danger" icon={<Ic.Chart />} caption={`${ITEMS.length} gastos menores`} />
          <StatCard label="Saldo disponible" value={fmt(saldo)} iconTone={saldo < FONDO * 0.3 ? "danger" : "success"} icon={<Ic.Check />} caption={saldo < FONDO * 0.3 ? "por debajo del 30% — rendir" : "fondo saludable"} />
        </div>
        <Alert tone="info" title="Cómo opera">Cubre gastos menores del día sin pasar por Tesorería. Al <b>rendir</b>, se crea un único gasto consolidado en <b>Gastos</b> (origen: Caja chica) y el fondo se repone a {fmt(FONDO).replace(".00", "")}.</Alert>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Button variant="secondary" iconLeft={<Ic.Receipt />} onClick={() => setRendir(true)}>Rendir y reponer fondo</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setNuevo(true)}>Registrar gasto menor</Button>
        </div>
        <Card flush title="Gastos del fondo · Julio 2026">
          <Table columns={cols} data={ITEMS.map((x) => ({ fecha: x[0], concepto: x[1], monto: x[2], comp: x[3] }))} hover />
        </Card>

        <Dialog open={nuevo} onClose={() => setNuevo(false)} title="Registrar gasto menor" icon={<Ic.Cash />}
          description={`Saldo disponible: ${fmt(saldo)}`}
          footer={<><Button variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setNuevo(false); notify("success", "Gasto registrado", "Descontado del fondo de caja chica."); }}>Registrar</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Concepto" required placeholder="Ej. pasajes, fotocopias…" containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="Monto" prefix="S/." required inputMode="decimal" placeholder="0.00" hint={`Máx. ${fmt(saldo)}`} />
            <Input label="N° de comprobante" placeholder="Opcional (boleta)" />
          </div>
        </Dialog>

        <Dialog open={rendir} onClose={() => setRendir(false)} title="Rendir y reponer fondo" icon={<Ic.Receipt />} iconTone="warning"
          description={`${ITEMS.length} gastos · ${fmt(gastado)} rendidos`}
          footer={<><Button variant="secondary" onClick={() => setRendir(false)}>Cancelar</Button>
            <Button variant="accent" iconLeft={<Ic.Check />} onClick={() => { setRendir(false); notify("success", "Fondo repuesto", `Gasto consolidado de ${fmt(gastado)} creado en Gastos (origen: Caja chica) · fondo de vuelta a ${fmt(FONDO).replace(".00", "")}.`); }}>Rendir {fmt(gastado)}</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            <Alert tone="warning" title="Un solo gasto consolidado">Los {ITEMS.length} gastos menores se registrarán como un único movimiento en <b>Gastos</b> con el detalle adjunto; 2 no tienen comprobante y quedarán observados.</Alert>
            <Select label="Origen de la reposición" options={["Efectivo de caja del día", "Transferencia"]} defaultValue="Efectivo de caja del día" />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_Treasury = function Treasury() {
    const [tab, setTab] = React.useState("resumen");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: "resumen", label: "Resumen del mes" },
          { id: "gastos", label: "Gastos", count: 6 },
          { id: "ingresos", label: "Otros ingresos", count: 5 },
          { id: "cajachica", label: "Caja chica" },
        ]} />
        {tab === "resumen" && <Resumen />}
        {tab === "gastos" && <MovTab kind="gasto" />}
        {tab === "ingresos" && <MovTab kind="ingreso" />}
        {tab === "cajachica" && <CajaChica />}
      </div>
    );
  };
})();
