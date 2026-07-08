/* Elohim SGE — Pensiones / Pagos. Registers window.SGE_Payments. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, StatCard, Tabs, Tag, Dialog, Input, Select, Alert, Tooltip } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const ROWS = [
    ["María Quispe Roca", "3° A", "Pensión Junio", "30/06", "280.00", "Pagado", "var(--blue-500)"],
    ["José Ramos Lía", "5° B", "Pensión Junio", "30/06", "280.00", "Pendiente", "var(--gold-500)"],
    ["Ana Flores Mendoza", "1° A Sec", "Pensión Mayo", "30/05", "310.00", "Vencido", "var(--green-500)"],
    ["Luis Paz Cárdenas", "4° A", "Pensión Junio", "30/06", "280.00", "Pagado", "var(--brown-400)"],
    ["Rosa Lima Vega", "2° B", "Pensión Junio (Beca 50%)", "30/06", "140.00", "Pagado", "var(--blue-400)"],
    ["Hugo Vela Soto", "6° A", "Pensión Abril+Mayo", "30/05", "560.00", "Vencido", "var(--blue-600)"],
  ];

  const COMPROMISOS = [
    { id: "CP-007", fam: "Fam. Vela Soto", deuda: 560, cuotas: "2 de S/ 280 · 15/07 y 15/08", avance: 0, estado: "Vigente", color: "var(--blue-600)" },
    { id: "CP-006", fam: "Fam. Ñahui Cruz", deuda: 930, cuotas: "3 de S/ 310 · jul–sep", avance: 1, estado: "Propuesto", color: "var(--brown-400)" },
    { id: "CP-005", fam: "Fam. Flores Mendoza", deuda: 620, cuotas: "2 de S/ 310 · may–jun", avance: 2, estado: "Cumplido", color: "var(--green-500)" },
    { id: "CP-004", fam: "Fam. Torres Inga", deuda: 840, cuotas: "3 de S/ 280 · abr–jun", avance: 1, estado: "Incumplido", color: "var(--gold-600)" },
  ];

  function Compromisos() {
    const [rows, setRows] = React.useState(COMPROMISOS);
    const [nuevo, setNuevo] = React.useState(false);
    const upd = (id, estado) => setRows((rs) => rs.map((x) => x.id === id ? { ...x, estado } : x));
    const tone = (e) => e === "Cumplido" ? "success" : e === "Vigente" ? "info" : e === "Propuesto" ? "warning" : "danger";
    const cols = [
      { key: "id", header: "N°", mono: true, width: 76 },
      { key: "fam", header: "Familia", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v.replace("Fam. ", "")} size="sm" color={r.color} />
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "deuda", header: "Deuda refinanciada", num: true, mono: true, render: (v) => `S/ ${v.toFixed(2)}` },
      { key: "cuotas", header: "Plan", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>{v}</span>
          <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.avance} cuota(s) pagada(s)</span>
        </div>) },
      { key: "estado", header: "Estado", align: "center", render: (v) => <Badge tone={tone(v)} dot>{v}</Badge> },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        r.estado === "Propuesto"
          ? <Button size="sm" variant="primary" iconLeft={<Ic.Check />} onClick={() => { upd(r.id, "Vigente"); notify("success", "Compromiso aprobado", `${r.id} · ${r.fam} — mora y recordatorios congelados mientras cumpla.`); }}>Aprobar</Button>
          : r.estado === "Vigente"
            ? <Button size="sm" variant="accent" iconLeft={<Ic.Cash />} onClick={() => notify("success", "Cuota del compromiso cobrada", `${r.fam} — se registró en Caja y avanza el plan.`)}>Cobrar cuota</Button>
            : r.estado === "Incumplido"
              ? <Tooltip content="Mora y recordatorios reactivados"><Button size="sm" variant="ghost" iconLeft={<Ic.Send />} onClick={() => notify("warning", "Recordatorio enviado", `${r.fam} — compromiso incumplido; la deuda original sigue vigente con mora.`)}>Recordar</Button></Tooltip>
              : <Tooltip content="Ver historial"><IconButton label="Ver" size="sm" onClick={() => notify("info", r.id, `${r.fam} · plan completado · deuda saldada.`)}><Ic.Eye /></IconButton></Tooltip>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: 16 }}>
        <Alert tone="info" title="Cómo funciona">Secretaría <b>propone</b> el plan y el Administrador lo <b>aprueba</b>. Mientras el compromiso esté al día, la <b>mora y los recordatorios se congelan</b>; si incumple una cuota, se reactivan sobre la deuda original.</Alert>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setNuevo(true)}>Proponer compromiso</Button>
        </div>
        <Table columns={cols} data={rows} hover />
        <Dialog open={nuevo} onClose={() => setNuevo(false)} size="lg" title="Proponer compromiso de pago" icon={<Ic.Cash />}
          description="Refinancia deuda vencida en cuotas — requiere aprobación del Administrador"
          footer={<><Button variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setNuevo(false); notify("success", "Compromiso propuesto", "Quedará pendiente de aprobación del Administrador."); }}>Proponer</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Familia / apoderado" required placeholder="Buscar…" iconLeft={<Ic.Search />} containerStyle={{ gridColumn: "1 / -1" }} hint="Se listará su deuda vencida consolidada" />
            <Input label="Deuda a refinanciar" prefix="S/." defaultValue="560.00" hint="Total o parcial" />
            <Select label="N° de cuotas" options={["2", "3", "4", "6"]} defaultValue="2" />
            <Input label="Primera cuota" type="date" defaultValue="2026-07-15" />
            <Select label="Frecuencia" options={["Mensual", "Quincenal"]} defaultValue="Mensual" />
            <Alert tone="warning" style={{ gridColumn: "1 / -1" }}>Mientras esté vigente y al día: sin mora nueva ni recordatorios de la deuda original. El incumplimiento de una cuota lo marca <b>Incumplido</b> y reactiva todo.</Alert>
          </div>
        </Dialog>
      </div>
    );
  }

  window.SGE_Payments = function Payments() {
    const [tab, setTab] = React.useState("todos");
    const [open, setOpen] = React.useState(false);
    const [target, setTarget] = React.useState(null);
    const [gen, setGen] = React.useState(false);

    const cols = [
      { key: "est", header: "Estudiante", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
            <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.grado}</span>
          </div>
        </div>) },
      { key: "concepto", header: "Concepto" },
      { key: "venc", header: "Vence", mono: true, align: "center" },
      { key: "monto", header: "Monto", num: true, mono: true, render: (v) => `S/ ${v}` },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Pagado" ? "success" : v === "Pendiente" ? "warning" : "danger"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        r.estado === "Pagado"
          ? <Tooltip content="Ver recibo"><IconButton label="Recibo" size="sm" onClick={() => notify("info", "Recibo descargado", `${r.est} · ${r.concepto} · S/ ${r.monto}.`)}><Ic.Download /></IconButton></Tooltip>
          : <Button size="sm" variant="primary" onClick={() => { setTarget(r); setOpen(true); }}>Registrar pago</Button>) },
    ];
    const rows = ROWS.map((r) => ({ est: r[0], grado: r[1], concepto: r[2], venc: r[3], monto: r[4], estado: r[5], color: r[6] }))
      .filter((r) => tab === "todos" || (tab === "pend" && r.estado !== "Pagado") || (tab === "pag" && r.estado === "Pagado"));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Cobrado · Junio" value="S/ 84,320" iconTone="success" icon={<Ic.Cash />} delta={6.1} caption="del mes" />
          <StatCard label="Por cobrar" value="S/ 11,680" iconTone="accent" icon={<Ic.Clock />} caption="42 cuotas" />
          <StatCard label="Vencido" value="S/ 6,420" iconTone="danger" icon={<Ic.Chart />} delta={1.3} deltaDirection="up" caption="18 cuotas" />
          <StatCard label="Pago en línea" value="61%" icon={<Ic.Cash />} delta={9.0} caption="de los pagos" />
        </div>

        <Card flush
          title="Pensiones · Junio 2026"
          actions={<><Button variant="secondary" size="sm" iconLeft={<Ic.Download />} onClick={() => notify("success", "Exportado", "Pensiones de Junio 2026 descargadas en Excel.")}>Exportar</Button><Button variant="primary" size="sm" iconLeft={<Ic.Plus />} onClick={() => setGen(true)}>Generar cuotas</Button></>}>
          <div style={{ padding: "0 16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <Tabs value={tab} onChange={setTab} items={[
              { id: "todos", label: "Todas", count: 6 },
              { id: "pend", label: "Pendientes", count: 3 },
              { id: "pag", label: "Pagadas", count: 3 },
              { id: "comp", label: "Compromisos", count: 2 },
            ]} />
          </div>
          {tab === "comp" ? <Compromisos /> : <Table columns={cols} data={rows} hover />}
        </Card>

        <Dialog open={open} onClose={() => setOpen(false)}
          title="Registrar pago de pensión" description={target ? `${target.est} · ${target.concepto}` : ""}
          icon={<Ic.Cash />} iconTone="success" size="md"
          footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setOpen(false); notify("success", "Pago registrado", target ? `${target.est} · S/ ${target.monto} · recibo enviado al apoderado.` : ""); }}>Confirmar pago</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
            <Alert tone="info">El recibo se enviará al apoderado por correo y WhatsApp.</Alert>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Monto" prefix="S/." defaultValue={target ? target.monto : ""} />
              <Select label="Método" options={["Efectivo", "Yape / Plin", "Transferencia", "Tarjeta"]} defaultValue="Yape / Plin" />
              <Input label="Fecha de pago" type="date" defaultValue="2026-06-30" />
              <Input label="N° de operación" placeholder="Opcional" />
            </div>
          </div>
        </Dialog>

        <Dialog open={gen} onClose={() => setGen(false)} title="Generar cuotas del mes" icon={<Ic.Plus />}
          description="Crea la cuota de pensión de cada estudiante activo según el tarifario"
          footer={<><Button variant="secondary" onClick={() => setGen(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setGen(false); notify("success", "Cuotas generadas", "482 cuotas de Julio 2026 creadas · vencen el 31/07."); }}>Generar 482 cuotas</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Select label="Mes" options={["Julio 2026", "Agosto 2026"]} defaultValue="Julio 2026" />
              <Input label="Fecha de vencimiento" type="date" defaultValue="2026-07-31" />
              <Select label="Alcance" options={["Todos los niveles", "Solo Inicial", "Solo Primaria", "Solo Secundaria"]} defaultValue="Todos los niveles" containerStyle={{ gridColumn: "1 / -1" }} />
            </div>
            <Alert tone="info" title="Se generarán 482 cuotas">Con el tarifario vigente y los descuentos/becas de cada estudiante ya aplicados. Los programas complementarios generan su cuota aparte.</Alert>
          </div>
        </Dialog>
      </div>
    );
  };
})();
