/* Elohim SGE — Estudiantes. Registers window.SGE_Students. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Tag, Pagination, Tooltip, Dialog, Checkbox, Alert, Radio, RadioGroup, Textarea } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);

  const COLORS = ["var(--blue-500)", "var(--gold-500)", "var(--green-500)", "var(--brown-400)", "var(--blue-400)"];
  const NAMES = [
    ["E-1042", "María Quispe Roca", "3° A Primaria", "Activo", "0.00", "M"],
    ["E-1043", "José Ramos Lía", "5° B Primaria", "Activo", "280.00", "M"],
    ["E-1051", "Ana Flores Mendoza", "1° A Secundaria", "Activo", "310.00", "T"],
    ["E-1067", "Luis Paz Cárdenas", "4° A Primaria", "Activo", "0.00", "M"],
    ["E-1072", "Rosa Lima Vega", "2° B Primaria", "Becado", "0.00", "M"],
    ["E-1080", "Hugo Vela Soto", "6° A Primaria", "Activo", "560.00", "T"],
    ["E-1091", "Carmen Ríos Paz", "Inicial 5 años", "Activo", "0.00", "M"],
    ["E-1099", "Diego Ñahui Cruz", "3° A Secundaria", "Retirado", "0.00", "T"],
  ];

  window.SGE_Students = function Students() {
    const [open, setOpen] = React.useState(false);
    const [sel, setSel] = React.useState(null);
    const [edit, setEdit] = React.useState(null);
    const [filtrosOpen, setFiltrosOpen] = React.useState(false);
    const [filtros, setFiltros] = React.useState(["Primaria", "Turno mañana"]);
    const [soloDeuda, setSoloDeuda] = React.useState(true);
    const [retiro, setRetiro] = React.useState(null);
    const [tipoRetiro, setTipoRetiro] = React.useState("retiro");
    const [carnet, setCarnet] = React.useState(null);
    const cols = [
      { key: "codigo", header: "Código", mono: true, width: 90 },
      { key: "nombre", header: "Estudiante", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "grado", header: "Grado y sección" },
      { key: "turno", header: "Turno", align: "center", render: (v) => <Badge tone={v === "M" ? "info" : "accent"}>{v === "M" ? "Mañana" : "Tarde"}</Badge> },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Activo" ? "success" : v === "Becado" ? "brand" : "neutral"} dot>{v}</Badge>) },
      { key: "deuda", header: "Deuda", num: true, mono: true, render: (v) => (
        <span style={{ color: v === "0.00" ? "var(--text-muted)" : "var(--danger)" }}>S/ {v}</span>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Ver ficha"><IconButton label="Ver" size="sm" onClick={() => { setSel(r); setOpen(true); }}><Ic.Eye /></IconButton></Tooltip>
          <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => setEdit(r)}><Ic.Pencil /></IconButton></Tooltip>
        </div>) },
    ];
    const rows = NAMES.map((n, i) => ({ codigo: n[0], nombre: n[1], grado: n[2], estado: n[3], deuda: n[4], turno: n[5], color: COLORS[i % COLORS.length] }));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Input placeholder="Buscar por nombre, código o DNI…" iconLeft={<Ic.Search />} />
          </div>
          <Select placeholder="Nivel" options={["Inicial", "Primaria", "Secundaria"]} containerStyle={{ width: 150 }} />
          <Select placeholder="Grado" options={["1°", "2°", "3°", "4°", "5°", "6°"]} containerStyle={{ width: 120 }} />
          <Button variant="secondary" iconLeft={<Ic.Filter />} onClick={() => setFiltrosOpen(true)}>Filtros</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => { goTo("matricula"); notify("info", "Nueva matrícula", "Asistente de matrícula abierto."); }}>Matricular</Button>
        </div>

        {/* Active filters */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Filtros:</span>
          {filtros.map((f) => (
            <Tag key={f} onRemove={() => { setFiltros(fs => fs.filter(x => x !== f)); notify("info", "Filtro quitado", `“${f}” ya no filtra la lista.`); }}>{f}</Tag>
          ))}
          <Tag selected={soloDeuda} leadingDot color="var(--gold-500)" onClick={() => setSoloDeuda(d => !d)}>Solo con deuda</Tag>
          {filtros.length === 0 && !soloDeuda && <span style={{ font: "var(--type-caption)", color: "var(--text-subtle)" }}>ninguno</span>}
        </div>

        {/* Table */}
        <Card flush>
          <Table columns={cols} data={rows} hover zebra />
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
            <Pagination page={1} pageCount={24} onPageChange={() => {}} total={482} pageSize={20} />
          </div>
        </Card>

        <Dialog open={open} onClose={() => setOpen(false)} size="lg"
          title={sel ? sel.nombre : ""} description={sel ? `${sel.codigo} · ${sel.grado}` : ""}
          icon={<Ic.User />}
          footer={<><Button variant="danger" iconLeft={<Ic.Logout />} onClick={() => { const s = sel; setOpen(false); setRetiro(s); }}>Retirar / Trasladar</Button><span style={{ flex: 1 }}></span><Button variant="secondary" onClick={() => setOpen(false)}>Cerrar</Button><Button variant="primary" iconLeft={<Ic.Pencil />} onClick={() => { setOpen(false); setEdit(sel); }}>Editar ficha</Button></>}>
          {sel && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 6 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ width: 92, height: 110, borderRadius: "var(--radius-md)", border: "1.5px dashed var(--border-strong)", background: "var(--surface-sunken)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Avatar name={sel.nombre} size="lg" color={sel.color} />
                  <span style={{ font: "var(--type-2xs)", color: "var(--text-subtle)" }}>Foto 3×4</span>
                </div>
                <Button size="sm" variant="secondary" onClick={() => notify("info", "Subir foto", "Selector de imagen: JPG/PNG, se recorta a 3×4 — se usa en ficha y carnet.")}>Subir foto</Button>
                <Button size="sm" variant="accent" iconLeft={<Ic.Clipboard />} onClick={() => { const s = sel; setOpen(false); setCarnet(s); }}>Ver carnet</Button>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["DNI", "70 481 559"], ["Apoderado", "Juana Roca Pérez"], ["Teléfono", "964 221 880"], ["Estado", sel.estado], ["Turno", sel.turno === "M" ? "Mañana" : "Tarde"], ["Deuda actual", `S/ ${sel.deuda}`]].map(([k, v]) => (
                <div key={k}>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                  <div style={{ font: "var(--type-body-md)", color: "var(--text-body)" }}>{v}</div>
                </div>
              ))}
              </div>
            </div>
            <div>
              <div style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>Salud y emergencia</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Alergias", "Penicilina"], ["Seguro", "SIS"], ["Contacto de emergencia", "Juana Roca · 964 221 880"], ["Autorizados a recoger", "Juana Roca (madre) · Elena Vega (abuela)"]].map(([k, v]) => (
                  <div key={k} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "8px 12px" }}>
                    <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                    <div style={{ font: "var(--type-body)", color: k === "Alergias" ? "var(--danger)" : "var(--text-body)", fontWeight: k === "Alergias" ? 600 : 400 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}
        </Dialog>

        {/* Editar estudiante */}
        <Dialog open={!!edit} onClose={() => setEdit(null)} size="lg" title={edit ? `Editar · ${edit.nombre}` : ""}
          description={edit ? `${edit.codigo} · ${edit.grado}` : ""} icon={<Ic.Pencil />}
          footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Ficha actualizada", `${edit.nombre} guardado correctamente.`); setEdit(null); }}>Guardar cambios</Button></>}>
          {edit && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Input label="Nombres y apellidos" defaultValue={edit.nombre} containerStyle={{ gridColumn: "1 / -1" }} />
              <Input label="DNI" defaultValue="70 481 559" />
              <Input label="Fecha de nacimiento" type="date" defaultValue="2017-04-12" />
              <Select label="Grado y sección" options={[...new Set(["3° A Primaria", "3° B Primaria", edit.grado])]} defaultValue={edit.grado} />
              <Select label="Turno" options={["Mañana", "Tarde"]} defaultValue={edit.turno === "M" ? "Mañana" : "Tarde"} />
              <Select label="Estado" options={["Activo", "Becado", "Retirado", "Trasladado"]} defaultValue={edit.estado} />
              <Input label="Apoderado principal" defaultValue="Juana Roca Pérez" hint="Se gestiona desde el módulo Apoderados" />
              <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-subtle)", paddingTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Alergias / condiciones médicas" defaultValue="Penicilina" placeholder="Ninguna" hint="Visible para tutor y auxiliar" />
                <Select label="Seguro" options={["SIS", "EsSalud", "Privado", "Ninguno"]} defaultValue="SIS" />
                <Input label="Contacto de emergencia" defaultValue="Juana Roca · 964 221 880" placeholder="Nombre · teléfono" />
                <Input label="Autorizados a recoger" defaultValue="Juana Roca · Elena Vega" hint="Separados por ·" />
              </div>
            </div>
          )}
        </Dialog>

        {/* Carnet del estudiante */}
        <Dialog open={!!carnet} onClose={() => setCarnet(null)} title="Carnet del estudiante" icon={<Ic.Clipboard />}
          description="Formato CR80 · imprime por lote desde el listado"
          footer={<><Button variant="secondary" onClick={() => setCarnet(null)}>Cerrar</Button>
            <Button variant="primary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Carnet generado", `${carnet.nombre} · PDF listo para impresión en PVC.`)}>Imprimir carnet</Button></>}>
          {carnet && (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
              <div style={{ width: 340, borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-subtle)", background: "var(--surface-card)" }}>
                <div style={{ background: "linear-gradient(135deg, var(--blue-700), var(--blue-900))", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <img src="../../assets/elohim-insignia.png" alt="" style={{ width: 30, height: 30, objectFit: "contain" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ font: "var(--type-2xs)", fontWeight: 700, color: "#fff", letterSpacing: ".04em" }}>I.E.P. ELOHIM · SATIPO</div>
                    <div style={{ font: "var(--type-2xs)", color: "var(--blue-200)" }}>Carnet estudiantil · 2026</div>
                  </div>
                  <Badge tone="accent" solid size="sm">2026</Badge>
                </div>
                <div style={{ display: "flex", gap: 12, padding: 14 }}>
                  <div style={{ width: 74, height: 92, borderRadius: 8, background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Avatar name={carnet.nombre} size="lg" color={carnet.color} />
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    <div style={{ font: "var(--type-label)", fontWeight: 700, color: "var(--text-strong)", lineHeight: 1.2 }}>{carnet.nombre}</div>
                    <div style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{carnet.grado} · Turno {carnet.turno === "M" ? "Mañana" : "Tarde"}</div>
                    <div style={{ font: "var(--type-2xs)", fontFamily: "var(--font-mono)", color: "var(--text-body)" }}>{carnet.codigo} · DNI 70 481 559</div>
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ font: "var(--type-2xs)", color: "var(--text-subtle)" }}>Vigencia:<br/>Mar–Dic 2026</span>
                      <div title="QR para asistencia" style={{ width: 52, height: 52, borderRadius: 4, background: "var(--surface-card)", border: "1px solid var(--border-default)", padding: 4, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
                        {[1,1,1,0,1,1,1, 1,0,1,0,1,0,1, 1,1,1,0,1,1,1, 0,0,0,1,0,0,0, 1,1,0,1,1,0,1, 1,0,1,0,0,1,1, 1,1,1,0,1,0,1].map((b, i) => (
                          <span key={i} style={{ background: b ? "var(--blue-900)" : "transparent", borderRadius: .5 }}></span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "3px solid var(--gold-400)", padding: "6px 14px", font: "var(--type-2xs)", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                  <span>QR: marcación de asistencia (futuro)</span>
                  <span>(064) 545-210</span>
                </div>
              </div>
            </div>
          )}
        </Dialog>

        {/* Retiro / traslado */}
        <Dialog open={!!retiro} onClose={() => setRetiro(null)} size="lg" title={retiro ? `Retiro o traslado · ${retiro.nombre}` : ""}
          description={retiro ? `${retiro.codigo} · ${retiro.grado}` : ""} icon={<Ic.Logout />} iconTone="danger"
          footer={<><Button variant="secondary" onClick={() => setRetiro(null)}>Cancelar</Button>
            <Button variant="danger" iconLeft={<Ic.Check />} onClick={() => { notify("warning", "Proceso registrado", `${retiro.nombre} — constancia generada; su vacante queda liberada.`); setRetiro(null); }}>Confirmar</Button></>}>
          {retiro && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
              {retiro.deuda !== "0.00" && <Alert tone="warning" title={`Deuda pendiente: S/ ${retiro.deuda}`}>El retiro no condona la deuda — quedará registrada en la cuenta del apoderado.</Alert>}
              <RadioGroup name="tiporet" value={tipoRetiro} onChange={(e) => setTipoRetiro(e.target.value)} row>
                <Radio value="retiro" label="Retiro" description="Deja la institución sin destino declarado" />
                <Radio value="traslado" label="Traslado" description="Pasa a otra I.E. — requiere constancia" />
              </RadioGroup>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Fecha efectiva" type="date" defaultValue="2026-07-07" />
                {tipoRetiro === "traslado" && <Input label="I.E. de destino" placeholder="Ej. I.E. 30001 Satipo" required />}
              </div>
              <Textarea label="Motivo" rows={2} required placeholder="Ej. cambio de domicilio familiar…" />
              <Checkbox label="Generar constancia" description={tipoRetiro === "traslado" ? "Constancia de traslado + libreta de notas a la fecha" : "Constancia de retiro"} defaultChecked />
            </div>
          )}
        </Dialog>

        {/* Filtros avanzados */}
        <Dialog open={filtrosOpen} onClose={() => setFiltrosOpen(false)} title="Filtros avanzados" icon={<Ic.Filter />}
          footer={<>
            <Button variant="ghost" onClick={() => { setFiltros([]); setSoloDeuda(false); setFiltrosOpen(false); notify("info", "Filtros limpiados", "Mostrando los 482 estudiantes."); }}>Limpiar todo</Button>
            <Button variant="secondary" onClick={() => setFiltrosOpen(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setFiltros(["Primaria", "3°", "Turno mañana"]); setFiltrosOpen(false); notify("success", "Filtros aplicados", "Primaria · 3° · Turno mañana — 52 estudiantes."); }}>Aplicar filtros</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Select label="Nivel" placeholder="Todos" options={["Inicial", "Primaria", "Secundaria"]} defaultValue="Primaria" />
            <Select label="Grado" placeholder="Todos" options={["1°", "2°", "3°", "4°", "5°", "6°"]} defaultValue="3°" />
            <Select label="Sección" placeholder="Todas" options={["A", "B"]} />
            <Select label="Turno" placeholder="Ambos" options={["Mañana", "Tarde"]} defaultValue="Mañana" />
            <Select label="Estado" placeholder="Todos" options={["Activo", "Becado", "Retirado", "Trasladado"]} />
            <Select label="Programa" placeholder="Cualquiera" options={["Taller de Danza", "Taller de Música", "Reforzamiento"]} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Checkbox label="Solo estudiantes con deuda" checked={soloDeuda} onChange={(e) => setSoloDeuda(e.target.checked)} />
            </div>
          </div>
        </Dialog>
      </div>
    );
  };
})();
