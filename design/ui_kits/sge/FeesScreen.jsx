/* Elohim SGE — Tarifario y becas. Registers window.SGE_Fees. */
(function () {
  const { Card, Table, Badge, Button, IconButton, Input, Select, Tabs, Tooltip, Alert, Avatar, Switch, Dialog } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  const TARIFAS = [
    ["Inicial", 200, 250, 10],
    ["Primaria", 250, 280, 10],
    ["Secundaria", 280, 310, 10],
  ];
  const PROGRAMAS = [
    ["Taller de Danza", 0, 60], ["Taller de Música", 0, 70],
    ["Reforzamiento · Matemática", 0, 80], ["Academia Pre (verano)", 100, 150],
  ];
  const DESCUENTOS = [
    ["Descuento hermanos", "−10% pensión", "Desde el 2° hijo matriculado", "Automático", 38, "Activo"],
    ["Beca parcial", "−50% pensión", "Evaluación socioeconómica anual", "Manual", 11, "Activo"],
    ["Beca completa", "−100% pensión", "Aprobación de dirección", "Manual", 3, "Activo"],
    ["Pronto pago", "−5% pensión", "Pago antes del día 5 del mes", "Automático", 0, "Inactivo"],
  ];

  function Tarifas() {
    const [editNivel, setEditNivel] = React.useState(null);
    const [editProg, setEditProg] = React.useState(null);
    const cols = [
      { key: "nivel", header: "Nivel", render: (v) => <span style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>{v}</span> },
      { key: "mat", header: "Matrícula (única)", num: true, mono: true, render: (v) => fmt(v) },
      { key: "pen", header: "Pensión mensual", num: true, mono: true, render: (v) => fmt(v) },
      { key: "n", header: "Cuotas al año", align: "center", mono: true, render: (v) => `${v} (mar–dic)` },
      { key: "anual", header: "Total anual", num: true, mono: true, render: (_, r) => (
        <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{fmt(r.mat + r.pen * r.n)}</span>) },
      { key: "acc", header: "", align: "right", render: (_, r) => <IconButton label="Editar" size="sm" onClick={() => setEditNivel(r)}><Ic.Pencil /></IconButton> },
    ];
    const pcols = [
      { key: "prog", header: "Programa", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "mat", header: "Matrícula", num: true, mono: true, render: (v) => v ? fmt(v) : "—" },
      { key: "pen", header: "Mensualidad", num: true, mono: true, render: (v) => fmt(v) },
      { key: "acc", header: "", align: "right", render: (_, r) => <IconButton label="Editar" size="sm" onClick={() => setEditProg(r)}><Ic.Pencil /></IconButton> },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">Estos montos alimentan la <b>generación automática del cronograma</b> en cada matrícula. Cambiarlos no altera cronogramas ya generados.</Alert>
        <Card flush title="Enseñanza regular · 2026"
          actions={<Button size="sm" variant="secondary" iconLeft={<Ic.Copy />} onClick={() => notify("success", "Tarifario copiado a 2027", "Edítalo desde el selector de año antes de abrir la matrícula 2027.")}>Copiar a 2027</Button>}>
          <Table columns={cols} data={TARIFAS.map((t) => ({ nivel: t[0], mat: t[1], pen: t[2], n: t[3] }))} />
        </Card>
        <Card flush title="Programas complementarios">
          <Table columns={pcols} data={PROGRAMAS.map((p) => ({ prog: p[0], mat: p[1], pen: p[2] }))} />
        </Card>
        <Card title="Mora por atraso">
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
            <Input label="Mora fija" prefix="S/." defaultValue="5.00" containerStyle={{ width: 140 }} />
            <Input label="Días de gracia" defaultValue="3" suffix="días" containerStyle={{ width: 150 }} />
            <Input label="Día de corte · traslados" defaultValue="20" suffix="del mes" containerStyle={{ width: 170 }} hint="Ingresa antes: paga el mes; después: gratis" />
            <div style={{ display: "flex", alignItems: "center", height: 38 }}>
              <Switch label="Aplicar mora automáticamente" defaultChecked />
            </div>
            <div style={{ flex: 1 }} />
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => notify("success", "Mora actualizada", "S/ 5.00 tras 3 días de gracia · aplicación automática.")}>Guardar</Button>
          </div>
        </Card>

        {/* Editar tarifa de nivel */}
        <Dialog open={!!editNivel} onClose={() => setEditNivel(null)} title={editNivel ? `Tarifa · ${editNivel.nivel}` : ""} icon={<Ic.Cash />}
          description="Rige para las matrículas nuevas; no altera cronogramas ya generados"
          footer={<><Button variant="secondary" onClick={() => setEditNivel(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Tarifa actualizada", `${editNivel.nivel} · guardada para el año 2026.`); setEditNivel(null); }}>Guardar</Button></>}>
          {editNivel && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Input label="Matrícula (pago único)" prefix="S/." defaultValue={editNivel.mat.toFixed(2)} inputMode="decimal" />
              <Input label="Pensión mensual" prefix="S/." defaultValue={editNivel.pen.toFixed(2)} inputMode="decimal" />
              <Select label="Cuotas al año" options={["10 (mar–dic)", "11 (feb–dic)"]} defaultValue="10 (mar–dic)" containerStyle={{ gridColumn: "1 / -1" }} />
            </div>
          )}
        </Dialog>

        {/* Editar tarifa de programa */}
        <Dialog open={!!editProg} onClose={() => setEditProg(null)} title={editProg ? `Tarifa · ${editProg.prog}` : ""} icon={<Ic.Cash />}
          footer={<><Button variant="secondary" onClick={() => setEditProg(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Tarifa actualizada", `${editProg.prog} · guardada.`); setEditProg(null); }}>Guardar</Button></>}>
          {editProg && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Input label="Matrícula" prefix="S/." defaultValue={editProg.mat ? editProg.mat.toFixed(2) : "0.00"} inputMode="decimal" hint="0 = sin pago de matrícula" />
              <Input label="Mensualidad" prefix="S/." defaultValue={editProg.pen.toFixed(2)} inputMode="decimal" />
            </div>
          )}
        </Dialog>
      </div>
    );
  }

  function Becas() {
    const [dlg, setDlg] = React.useState(null); // {d?} nuevo o editar
    const [ben, setBen] = React.useState(null);
    const cols = [
      { key: "nombre", header: "Descuento / beca", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>{v}</span>
          <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.cond}</span>
        </div>) },
      { key: "efecto", header: "Efecto", align: "center", render: (v) => <Badge tone="accent">{v}</Badge> },
      { key: "tipo", header: "Aplicación", align: "center", render: (v) => (
        <Badge tone={v === "Automático" ? "brand" : "neutral"}>{v}</Badge>) },
      { key: "ben", header: "Beneficiarios", align: "center", mono: true },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Activo" ? "success" : "neutral"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => setDlg({ d: r })}><Ic.Pencil /></IconButton></Tooltip>
          <Tooltip content="Ver beneficiarios"><IconButton label="Beneficiarios" size="sm" onClick={() => setBen(r)}><Ic.Users /></IconButton></Tooltip>
        </div>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Los descuentos se eligen en el paso "Tarifa y cronograma" de la matrícula; los automáticos se proponen solos.</span>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setDlg({})}>Nuevo descuento</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={DESCUENTOS.map((d) => ({ nombre: d[0], efecto: d[1], cond: d[2], tipo: d[3], ben: d[4], estado: d[5] }))} hover />
        </Card>

        {/* Nuevo / editar descuento */}
        <Dialog open={!!dlg} onClose={() => setDlg(null)} size="lg" title={dlg && dlg.d ? `Editar · ${dlg.d.nombre}` : "Nuevo descuento o beca"} icon={<Ic.Clipboard />}
          footer={<><Button variant="secondary" onClick={() => setDlg(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", dlg.d ? "Descuento actualizado" : "Descuento creado", "Disponible en el paso de tarifa de la matrícula."); setDlg(null); }}>
              {dlg && dlg.d ? "Guardar cambios" : "Crear"}</Button></>}>
          {dlg && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Input label="Nombre" required defaultValue={dlg.d ? dlg.d.nombre : ""} placeholder="Ej. Beca deportiva" containerStyle={{ gridColumn: "1 / -1" }} />
              <Input label="Descuento sobre la pensión" suffix="%" defaultValue={dlg.d ? dlg.d.efecto.replace(/[^0-9]/g, "") : ""} placeholder="10" inputMode="numeric" />
              <Select label="Aplicación" options={["Automático", "Manual"]} defaultValue={dlg.d ? dlg.d.tipo : "Manual"} hint="Automático se propone solo al matricular" />
              <Input label="Condición" defaultValue={dlg.d ? dlg.d.cond : ""} placeholder="Ej. promedio ≥ 18" containerStyle={{ gridColumn: "1 / -1" }} />
              <Select label="Estado" options={["Activo", "Inactivo"]} defaultValue={dlg.d ? dlg.d.estado : "Activo"} />
            </div>
          )}
        </Dialog>

        {/* Beneficiarios */}
        <Dialog open={!!ben} onClose={() => setBen(null)} size="lg" title={ben ? `Beneficiarios · ${ben.nombre}` : ""} icon={<Ic.Users />}
          description={ben ? `${ben.ben} estudiantes · ${ben.efecto}` : ""}
          footer={<><Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Exportado", `Beneficiarios de ${ben.nombre} descargados.`)}>Exportar</Button>
            <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => { notify("info", "Asignar beneficiario", "Busca al estudiante y asígnale el descuento desde su ficha."); setBen(null); }}>Asignar estudiante</Button></>}>
          {ben && (ben.ben > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
              {["Lima Vega, Rosa · 2° B Primaria", "Quispe Roca, Pedro · Inicial 5 años", "Vela Soto, Iris · 2° A Secundaria"].slice(0, Math.min(3, ben.ben)).map((e) => (
                <div key={e} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
                  <Avatar name={e} size="xs" />
                  <span style={{ flex: 1, font: "var(--type-label)", color: "var(--text-body)" }}>{e}</span>
                  <Badge tone="accent">{ben.efecto}</Badge>
                </div>
              ))}
              {ben.ben > 3 && <span style={{ font: "var(--type-2xs)", color: "var(--text-subtle)" }}>Mostrando 3 de {ben.ben} (datos de ejemplo).</span>}
            </div>
          ) : (
            <Alert tone="info" style={{ marginTop: 4 }}>Este descuento aún no tiene beneficiarios asignados.</Alert>
          ))}
        </Dialog>
      </div>
    );
  }

  window.SGE_Fees = function Fees() {
    const [tab, setTab] = React.useState("tarifas");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: "tarifas", label: "Tarifario 2026" },
          { id: "becas", label: "Descuentos y becas", count: 4 },
        ]} />
        {tab === "tarifas" ? <Tarifas /> : <Becas />}
      </div>
    );
  };
})();
