/* Elohim SGE — Caja y cobros. Registers window.SGE_Cashier.
   Tabs: Cobrar (buscar estudiante → seleccionar cuotas/conceptos → método → recibo)
   y Caja del día (apertura, movimientos, cierre con arqueo). */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Tabs, Alert, Tooltip, Checkbox, Radio, RadioGroup, StatCard, Dialog, Textarea } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  /* ------------------------------ recibo ------------------------------ */
  function ReceiptDialog({ open, onClose, items, total, metodo }) {
    return (
      <Dialog open={open} onClose={onClose} size="md" showClose={true}
        footer={<>
          <Button variant="secondary" iconLeft={<Ic.Send />} onClick={() => notify("success", "Recibo enviado", "Juana Roca Pérez lo recibirá por WhatsApp y correo.")}>Enviar al apoderado</Button>
          <Button variant="primary" iconLeft={<Ic.Printer />} onClick={() => notify("info", "Imprimiendo", "Recibo R-2026-04313 enviado a la impresora de Secretaría.")}>Imprimir recibo</Button>
        </>}>
        <div style={{ fontFamily: "var(--font-mono)", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="../../assets/elohim-insignia.png" alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <div>
              <div style={{ font: "var(--type-label)", fontWeight: 700, color: "var(--text-strong)", fontFamily: "var(--font-sans)" }}>I.E.P. ELOHIM — Colegio Cristocéntrico</div>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-muted)" }}>Satipo, Junín · RUC 20601234567</div>
            </div>
          </div>
          <div style={{ borderTop: "1px dashed var(--border-strong)", paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            <span>RECIBO <b style={{ color: "var(--text-strong)" }}>R-2026-04313</b></span>
            <span>03/07/2026 · 10:24 a.m.</span>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
            Estudiante: <b style={{ color: "var(--text-strong)" }}>María Quispe Roca</b> · 3° B Primaria<br />
            Apoderada: Juana Roca Pérez
          </div>
          <div style={{ borderTop: "1px dashed var(--border-strong)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((it) => (
              <div key={it.c} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                <span style={{ color: "var(--text-body)" }}>{it.c}</span>
                <span style={{ color: "var(--text-strong)" }}>{fmt(it.m)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px dashed var(--border-strong)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Método: {metodo}</span>
            <span style={{ font: "var(--type-h3)", fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>TOTAL {fmt(total)}</span>
          </div>
          <div style={{ textAlign: "center", fontSize: "var(--text-2xs)", color: "var(--text-subtle)" }}>Cobró: Secretaría (L. Campos) · ¡Gracias por su puntualidad!</div>
        </div>
      </Dialog>
    );
  }

  /* ------------------------------ cobrar ------------------------------ */
  const CUOTAS = [
    { id: "jun", c: "Pensión Junio", vence: "30/06", m: 252.0, estado: "Vencido", mora: 5.0 },
    { id: "jul", c: "Pensión Julio", vence: "31/07", m: 252.0, estado: "Pendiente", mora: 0 },
    { id: "dan", c: "Taller de Danza · Julio", vence: "31/07", m: 60.0, estado: "Pendiente", mora: 0 },
  ];
  const OTROS = [
    { value: "", label: "Agregar concepto…" },
    { value: "lib", label: "Libros 3° Primaria — S/ 120.00" },
    { value: "uni", label: "Uniforme diario — S/ 85.00" },
    { value: "buzo", label: "Buzo institucional — S/ 95.00" },
  ];
  const OTROS_M = { lib: { c: "Libros 3° Primaria", m: 120 }, uni: { c: "Uniforme diario", m: 85 }, buzo: { c: "Buzo institucional", m: 95 } };

  function Cobrar() {
    const [sel, setSel] = React.useState(["jun"]);
    const [extras, setExtras] = React.useState([]);
    const [metodo, setMetodo] = React.useState("efe");
    const [recibido, setRecibido] = React.useState("300");
    const [recibo, setRecibo] = React.useState(false);

    const items = [
      ...CUOTAS.filter((q) => sel.includes(q.id)).map((q) => ({ c: q.c + (q.mora ? " (+mora)" : ""), m: q.m + q.mora })),
      ...extras.map((e) => OTROS_M[e]),
    ];
    const total = items.reduce((a, i) => a + i.m, 0);
    const vuelto = Math.max(0, parseFloat(recibido || 0) - total);
    const METODOS = { efe: "Efectivo", yape: "Yape / Plin", trans: "Transferencia", tarj: "Tarjeta" };

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
        {/* left: student + cuotas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input placeholder="Buscar estudiante por nombre, código o DNI…" iconLeft={<Ic.Search />} defaultValue="María Quispe" />
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--surface-card)" }}>
            <Avatar name="María Quispe Roca" color="var(--blue-500)" />
            <div style={{ flex: 1 }}>
              <div style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>María Quispe Roca</div>
              <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>E-1042 · 3° B Primaria · Apoderada: Juana Roca Pérez</div>
            </div>
            <Badge tone="danger" dot>Deuda S/ 257.00</Badge>
          </div>

          <Card flush title="Cuotas pendientes" subtitle="Selecciona las que se cobrarán">
            <div>
              {CUOTAS.map((q) => {
                const on = sel.includes(q.id);
                return (
                  <label key={q.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderTop: "1px solid var(--border-subtle)", cursor: "pointer", background: on ? "var(--surface-brand-soft)" : "transparent" }}>
                    <Checkbox checked={on} onChange={() => setSel(s => on ? s.filter(x => x !== q.id) : [...s, q.id])} />
                    <div style={{ flex: 1 }}>
                      <div style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{q.c}</div>
                      <div style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>Vence {q.vence}{q.mora ? ` · mora ${fmt(q.mora)}` : ""}</div>
                    </div>
                    <Badge tone={q.estado === "Vencido" ? "danger" : "warning"} dot>{q.estado}</Badge>
                    <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", color: "var(--text-strong)", minWidth: 82, textAlign: "right" }}>{fmt(q.m + q.mora)}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card title="Otros conceptos" subtitle="Libros, uniformes y ventas — descuentan stock del Almacén (Inventario)">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Select options={OTROS} value="" onChange={(e) => { const v = e.target.value; if (v && !extras.includes(v)) setExtras(x => [...x, v]); }} />
              {extras.map((e) => (
                <div key={e} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
                  <span style={{ flex: 1, font: "var(--type-label)", color: "var(--text-body)" }}>{OTROS_M[e].c}</span>
                  <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{fmt(OTROS_M[e].m)}</span>
                  <IconButton label="Quitar" size="sm" variant="danger" onClick={() => setExtras(x => x.filter(y => y !== e))}><Ic.Trash /></IconButton>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* right: resumen */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 0 }}>
          <Card title="Resumen del cobro">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.length === 0 && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Sin conceptos seleccionados.</span>}
              {items.map((it) => (
                <div key={it.c} style={{ display: "flex", justifyContent: "space-between", font: "var(--type-body)" }}>
                  <span style={{ color: "var(--text-muted)" }}>{it.c}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{fmt(it.m)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ font: "var(--type-label)", fontWeight: 600 }}>Total</span>
                <span style={{ font: "var(--type-h2)", fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{fmt(total)}</span>
              </div>
            </div>
          </Card>
          <Card title="Método de pago">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <RadioGroup name="metodo" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                <Radio value="efe" label="Efectivo" />
                <Radio value="yape" label="Yape / Plin" />
                <Radio value="trans" label="Transferencia" />
                <Radio value="tarj" label="Tarjeta" />
              </RadioGroup>
              {metodo === "efe" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Input label="Recibido" prefix="S/." value={recibido} onChange={(e) => setRecibido(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" />
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 6 }}>Vuelto</div>
                    <div style={{ height: 38, display: "flex", alignItems: "center", padding: "0 12px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-mono)", color: vuelto > 0 ? "var(--success)" : "var(--text-muted)", fontWeight: 600 }}>{fmt(vuelto)}</div>
                  </div>
                </div>
              )}
              {(metodo === "yape" || metodo === "trans") && <Input label="N° de operación" placeholder="Ej. 90412238" />}
            </div>
          </Card>
          <Button variant="accent" size="lg" block iconLeft={<Ic.Receipt />} disabled={total === 0} onClick={() => { setRecibo(true); notify("success", "Pago registrado", `R-2026-04313 · ${fmt(total)} · ${METODOS[metodo]}.`); }}>
            Cobrar {fmt(total)} y emitir recibo
          </Button>
        </div>
        <ReceiptDialog open={recibo} onClose={() => setRecibo(false)} items={items} total={total} metodo={METODOS[metodo]} />
      </div>
    );
  }

  /* ------------------------------ caja del día ------------------------------ */
  const MOVS = [
    ["R-2026-04312", "10:02", "José Ramos Lía", "Pensión Junio", "Yape / Plin", "280.00", "L. Campos"],
    ["R-2026-04311", "09:47", "Carla Núñez Ríos", "Matrícula 2026 + libros", "Efectivo", "370.00", "L. Campos"],
    ["R-2026-04310", "09:31", "Hugo Vela Soto", "Pensión Abril + Mayo (+mora)", "Efectivo", "570.00", "L. Campos"],
    ["R-2026-04309", "08:55", "Rosa Lima Vega", "Pensión Junio (Beca 50%)", "Transferencia", "140.00", "D. Pérez"],
    ["R-2026-04308", "08:12", "Ana Flores Mendoza", "Uniforme diario", "Efectivo", "85.00", "L. Campos"],
  ];

  function CierreDialog({ open, onClose }) {
    const esperado = 1225.0; // inicial 200 + efectivo del día 1025
    const [contado, setContado] = React.useState("1225.00");
    const dif = (parseFloat(contado || 0) - esperado);
    return (
      <Dialog open={open} onClose={onClose} title="Cerrar caja · Arqueo" description="03/07/2026 · Turno mañana · Abierta por L. Campos a las 7:45"
        icon={<Ic.Lock />} iconTone="warning" size="md"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button variant="danger" iconLeft={<Ic.Lock />} onClick={() => { onClose(); notify("success", "Caja cerrada", "Arqueo registrado · S/ 1,445 cobrados · 5 operaciones."); }}>Cerrar caja</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Monto inicial", "S/ 200.00"], ["Cobros en efectivo", "S/ 1,025.00"], ["Cobros digitales", "S/ 420.00"], ["Efectivo esperado", fmt(esperado)]].map(([k, v]) => (
              <div key={k} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
                <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                <div style={{ font: "var(--type-h3)", fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{v}</div>
              </div>
            ))}
          </div>
          <Input label="Efectivo contado" prefix="S/." value={contado} onChange={(e) => setContado(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" />
          {Math.abs(dif) < 0.005
            ? <Alert tone="success" title="Arqueo cuadrado">El efectivo contado coincide con el esperado.</Alert>
            : <Alert tone={dif < 0 ? "danger" : "warning"} title={dif < 0 ? `Faltante de ${fmt(Math.abs(dif))}` : `Sobrante de ${fmt(dif)}`}>La diferencia quedará registrada en el cierre con tu observación.</Alert>}
          <Textarea label="Observaciones" rows={2} placeholder="Opcional…" />
        </div>
      </Dialog>
    );
  }

  function CajaDia() {
    const [cierre, setCierre] = React.useState(false);
    const [anular, setAnular] = React.useState(null);
    const cols = [
      { key: "rec", header: "Recibo", mono: true, width: 130 },
      { key: "hora", header: "Hora", mono: true, align: "center", width: 70 },
      { key: "est", header: "Estudiante", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "concepto", header: "Concepto" },
      { key: "met", header: "Método", align: "center", render: (v) => (
        <Badge tone={v === "Efectivo" ? "success" : v === "Yape / Plin" ? "brand" : "info"}>{v}</Badge>) },
      { key: "monto", header: "Monto", num: true, mono: true, render: (v) => `S/ ${v}` },
      { key: "cobrador", header: "Cobró", render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Avatar name={v} size="xs" /><span style={{ font: "var(--type-caption)" }}>{v}</span></div>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Ver recibo"><IconButton label="Recibo" size="sm" onClick={() => notify("info", "Recibo", `${r.rec} · ${r.est} · S/ ${r.monto} — abierto para reimpresión.`)}><Ic.Receipt /></IconButton></Tooltip>
          <Tooltip content="Anular"><IconButton label="Anular" size="sm" variant="danger" onClick={() => setAnular(r)}><Ic.Trash /></IconButton></Tooltip>
        </div>) },
    ];
    const rows = MOVS.map((m) => ({ rec: m[0], hora: m[1], est: m[2], concepto: m[3], met: m[4], monto: m[5], cobrador: m[6] }));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--success-soft)", color: "var(--success)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}><Ic.Cash /></span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ font: "var(--type-h3)", color: "var(--text-strong)" }}>Caja · 03/07/2026</span>
                <Badge tone="success" dot>Abierta</Badge>
              </div>
              <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Abierta a las 7:45 a.m. por L. Campos (Secretaría) · Monto inicial S/ 200.00</div>
            </div>
            <Button variant="secondary" iconLeft={<Ic.Lock />} onClick={() => setCierre(true)}>Cerrar caja</Button>
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Cobrado hoy" value="S/ 1,445" iconTone="success" icon={<Ic.Cash />} caption="5 operaciones" />
          <StatCard label="Efectivo" value="S/ 1,025" icon={<Ic.Cash />} caption="3 operaciones" />
          <StatCard label="Digital" value="S/ 420" iconTone="brand" icon={<Ic.Phone />} caption="Yape/Plin · transferencias" />
          <StatCard label="Anulados" value="0" iconTone="danger" icon={<Ic.Trash />} caption="hoy" />
        </div>
        <Card flush title="Movimientos del día">
          <Table columns={cols} data={rows} hover zebra />
        </Card>
        <CierreDialog open={cierre} onClose={() => setCierre(false)} />
        <Dialog open={!!anular} onClose={() => setAnular(null)} title="Anular recibo" icon={<Ic.Trash />} iconTone="danger"
          description={anular ? `${anular.rec} · ${anular.est} · S/ ${anular.monto}` : ""}
          footer={<><Button variant="secondary" onClick={() => setAnular(null)}>Cancelar</Button>
            <Button variant="danger" iconLeft={<Ic.Trash />} onClick={() => { notify("warning", "Recibo anulado", `${anular.rec} anulado — la cuota vuelve a estado Pendiente.`); setAnular(null); }}>Anular recibo</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            <Alert tone="warning" title="Esta acción queda registrada">El recibo se marca como anulado (no se borra) y la cuota vuelve a Pendiente. Requiere motivo.</Alert>
            <Textarea label="Motivo de anulación" rows={2} placeholder="Ej. monto erróneo, duplicado…" required />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ Devoluciones ------------------------------ */
  function Devoluciones() {
    const fmtS = (n) => `S/ ${Number(n).toFixed(2)}`;
    const [rows, setRows] = React.useState([
      { id: "D-0013", est: "José Ramos Lía", rec: "R-2026-04298", motivo: "Pago duplicado de pensión Junio", monto: 280, estado: "Pendiente de aprobación", just: null },
      { id: "D-0012", est: "Diego Ñahui Cruz", rec: "R-2026-04102", motivo: "Retiro con matrícula pagada (prorrateo)", monto: 100, estado: "Aprobada", just: null },
      { id: "D-0011", est: "Rosa Lima Vega", rec: "R-2026-03987", motivo: "Cobro en exceso por error de digitación", monto: 40, estado: "Devuelta", just: null },
    ]);
    const [nueva, setNueva] = React.useState(false);
    const [rechazo, setRechazo] = React.useState(null);
    const [justif, setJustif] = React.useState("");
    const setEstado = (id, estado, extra) => setRows((rs) => rs.map((x) => x.id === id ? { ...x, estado, ...extra } : x));
    const tone = (e) => e === "Devuelta" ? "success" : e === "Aprobada" ? "info" : e === "Rechazada" ? "neutral" : "warning";
    const cols = [
      { key: "id", header: "N°", mono: true, width: 76 },
      { key: "est", header: "Estudiante / recibo", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
          <span style={{ font: "var(--type-2xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{r.rec}</span>
        </div>) },
      { key: "motivo", header: "Motivo", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>{v}</span>
          {r.just && <span style={{ font: "var(--type-2xs)", color: "var(--warning-soft-fg)" }}>Rechazo: “{r.just}”</span>}
        </div>) },
      { key: "monto", header: "Monto", num: true, mono: true, render: (v) => fmtS(v) },
      { key: "estado", header: "Estado", align: "center", render: (v) => <Badge tone={tone(v)} dot>{v}</Badge> },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        r.estado === "Pendiente de aprobación"
          ? <div style={{ display: "inline-flex", gap: 6 }}>
              <Button size="sm" variant="ghost" onClick={() => { setRechazo(r); setJustif(""); }}>Rechazar</Button>
              <Button size="sm" variant="primary" iconLeft={<Ic.Check />} onClick={() => { setEstado(r.id, "Aprobada"); notify("success", "Devolución aprobada", `${r.id} · ${fmtS(r.monto)} — Caja ya puede devolver el dinero.`); }}>Aprobar</Button>
            </div>
          : r.estado === "Aprobada"
            ? <Button size="sm" variant="accent" iconLeft={<Ic.Cash />} onClick={() => { setEstado(r.id, "Devuelta"); notify("success", "Devolución registrada", `${fmtS(r.monto)} entregados · egreso en la caja del día · comprobante generado.`); }}>Registrar devolución</Button>
            : r.estado === "Devuelta"
              ? <Tooltip content="Ver comprobante"><IconButton label="Comprobante" size="sm" onClick={() => notify("info", "Comprobante", `${r.id} · ${fmtS(r.monto)} · firmado por el apoderado.`)}><Ic.Receipt /></IconButton></Tooltip>
              : null) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info" title="Flujo de devolución">Secretaría registra la solicitud → el <b>Administrador aprueba</b> (o rechaza con justificación) → recién entonces Caja entrega el dinero y se genera el egreso del día. Nada se borra: todo queda en el historial.</Alert>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setNueva(true)}>Nueva solicitud</Button>
        </div>
        <Card flush><Table columns={cols} data={rows} hover /></Card>

        <Dialog open={nueva} onClose={() => setNueva(false)} size="lg" title="Solicitud de devolución" icon={<Ic.Cash />}
          description="Debe estar vinculada a un recibo emitido"
          footer={<><Button variant="secondary" onClick={() => setNueva(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setNueva(false); notify("success", "Solicitud registrada", "Quedará pendiente de aprobación del Administrador."); }}>Registrar solicitud</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Recibo" required placeholder="R-2026-____" containerStyle={{ gridColumn: "1 / -1" }} iconLeft={<Ic.Search />} hint="Busca por número o estudiante" />
            <Input label="Monto a devolver" prefix="S/." required inputMode="decimal" placeholder="0.00" hint="Total o parcial del recibo" />
            <Select label="Forma de devolución" options={["Efectivo en caja", "Transferencia", "Crédito a cuota futura"]} defaultValue="Efectivo en caja" />
            <Textarea label="Motivo" rows={2} required placeholder="Obligatorio — ej. pago duplicado…" containerStyle={{ gridColumn: "1 / -1" }} />
          </div>
        </Dialog>

        <Dialog open={!!rechazo} onClose={() => setRechazo(null)} title="Rechazar solicitud" icon={<Ic.Trash />} iconTone="warning"
          description={rechazo ? `${rechazo.id} · ${rechazo.est} · ${fmtS(rechazo.monto)}` : ""}
          footer={<><Button variant="secondary" onClick={() => setRechazo(null)}>Cancelar</Button>
            <Button variant="danger" disabled={justif.trim().length < 10} onClick={() => { setEstado(rechazo.id, "Rechazada", { just: justif.trim() }); notify("warning", "Solicitud rechazada", `${rechazo.id} — queda registrada con tu justificación.`); setRechazo(null); }}>Rechazar con justificación</Button></>}>
          <div style={{ paddingTop: 4 }}>
            <Textarea label="Justificación" rows={2} required value={justif} onChange={(e) => setJustif(e.target.value)}
              placeholder="Mínimo 10 caracteres" hint={justif.trim().length < 10 ? `${Math.max(0, 10 - justif.trim().length)} caracteres más` : "Listo"} />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_Cashier = function Cashier() {
    const [tab, setTab] = React.useState("cobrar");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: "cobrar", label: "Cobrar" },
          { id: "dia", label: "Caja del día", count: 5 },
          { id: "dev", label: "Devoluciones", count: 1 },
        ]} />
        {tab === "cobrar" && <Cobrar />}
        {tab === "dia" && <CajaDia />}
        {tab === "dev" && <Devoluciones />}
      </div>
    );
  };
})();
