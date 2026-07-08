/* Elohim SGE — Horarios y asignación docente. Registers window.SGE_Schedule. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Select, Tabs, Tooltip, Dialog, Alert } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const BLOQUES = ["7:45–8:30", "8:30–9:15", "9:15–10:00", "Recreo", "10:20–11:05", "11:05–11:50", "11:50–12:35"];
  const CURSO_COLOR = {
    "Matemática": "var(--chart-1)", "Comunicación": "var(--chart-2)", "C. y T.": "var(--chart-3)",
    "P. Social": "var(--chart-4)", "Inglés": "var(--chart-5)", "Ed. Física": "var(--chart-6)",
    "Arte": "var(--gold-600)", "Religión": "var(--brown-500)",
  };
  // horario de 3° A — [curso, docente] por [bloque][día]
  const H = [
    [["Matemática", "P. Gómez"], ["Matemática", "P. Gómez"], ["Comunicación", "L. Díaz"], ["Matemática", "P. Gómez"], ["Ed. Física", "S. Ramos"]],
    [["Matemática", "P. Gómez"], ["Comunicación", "L. Díaz"], ["Comunicación", "L. Díaz"], ["Matemática", "P. Gómez"], ["Ed. Física", "S. Ramos"]],
    [["Comunicación", "L. Díaz"], ["C. y T.", "R. Meza"], ["Inglés", "I. Quinto"], ["P. Social", "A. Torres"], ["Arte", "N. Paz"]],
    null,
    [["Inglés", "I. Quinto"], ["C. y T.", "R. Meza"], ["Matemática", "P. Gómez"], ["Religión", "D. Cano"], ["Arte", "N. Paz"]],
    [["P. Social", "A. Torres"], ["Religión", "D. Cano"], ["C. y T.", "R. Meza"], ["Comunicación", "L. Díaz"], ["P. Social", "A. Torres"]],
    [["Comunicación", "L. Díaz"], ["Matemática", "P. Gómez"], ["Ed. Física", "S. Ramos"], ["Inglés", "I. Quinto"], ["Matemática", "P. Gómez"]],
  ];

  function Horario() {
    const [cell, setCell] = React.useState(null); // {dia, bloque, curso, doc}
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Select label="Sección" options={["3° A Primaria", "3° B Primaria", "4° A Primaria"]} defaultValue="3° A Primaria" containerStyle={{ width: 190 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Copy />} onClick={() => notify("success", "Horario copiado", "3° A → 3° B · ajusta los cambios y guarda.")}>Copiar de otra sección</Button>
          <Button variant="secondary" iconLeft={<Ic.Printer />} onClick={() => notify("info", "Imprimiendo", "Horario de 3° A Primaria enviado a la impresora.")}>Imprimir</Button>
        </div>
        <Card flush title="3° A Primaria · Turno mañana" subtitle="Haz clic en una celda para reasignar curso o docente">
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "92px repeat(5, 1fr)", minWidth: 720 }}>
              <div></div>
              {DIAS.map((d) => <div key={d} style={{ padding: "9px 10px", font: "var(--type-caption)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "var(--text-muted)", textAlign: "center", borderBottom: "1px solid var(--border-subtle)" }}>{d}</div>)}
              {BLOQUES.map((b, bi) => (
                <React.Fragment key={b}>
                  <div style={{ padding: "10px 10px", font: "var(--type-2xs)", fontFamily: "var(--font-mono)", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center" }}>{b}</div>
                  {b === "Recreo"
                    ? <div style={{ gridColumn: "span 5", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-sunken)", textAlign: "center", padding: "7px", font: "var(--type-2xs)", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}>Recreo</div>
                    : DIAS.map((d, di) => {
                        const c = H[bi][di];
                        const color = CURSO_COLOR[c[0]] || "var(--brand)";
                        return (
                          <div key={d} onClick={() => setCell({ dia: d, bloque: b, curso: c[0], doc: c[1] })}
                            style={{ borderTop: "1px solid var(--border-subtle)", borderLeft: "1px solid var(--border-subtle)", padding: "7px 9px", cursor: "pointer", background: "var(--surface-card)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 4, height: 22, borderRadius: 2, background: color, flexShrink: 0 }}></span>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ font: "var(--type-2xs)", fontWeight: 600, color: "var(--text-strong)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c[0]}</div>
                                <div style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{c[1]}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>
        <Dialog open={!!cell} onClose={() => setCell(null)} title="Reasignar bloque" icon={<Ic.Calendar />}
          description={cell ? `${cell.dia} · ${cell.bloque} · 3° A Primaria` : ""}
          footer={<><Button variant="secondary" onClick={() => setCell(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Bloque actualizado", `${cell.dia} ${cell.bloque} · guardado.`); setCell(null); }}>Guardar</Button></>}>
          {cell && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Select label="Curso" options={Object.keys(CURSO_COLOR)} defaultValue={cell.curso} />
              <Select label="Docente" options={["P. Gómez", "L. Díaz", "R. Meza", "I. Quinto", "A. Torres", "S. Ramos", "N. Paz", "D. Cano"]} defaultValue={cell.doc} />
              <Alert tone="info" style={{ gridColumn: "1 / -1" }}>Se valida que el docente no tenga otra clase en el mismo bloque.</Alert>
            </div>
          )}
        </Dialog>
      </div>
    );
  }

  function Asignacion() {
    const [edit, setEdit] = React.useState(null);
    const DATA = [
      ["Pedro Gómez Silva", "Matemática", "3° A · 3° B · 4° A", 18, "var(--blue-500)"],
      ["Lucía Díaz Rojas", "Comunicación", "3° A · 3° B", 14, "var(--gold-500)"],
      ["Raúl Meza Campos", "Ciencia y Tecnología", "3° A · 4° A · 5° A", 12, "var(--green-500)"],
      ["Iris Quinto Vega", "Inglés", "3° A · 3° B · 4° A · 5° A", 12, "var(--brown-400)"],
      ["Saúl Ramos Cruz", "Educación Física", "Toda Primaria", 10, "var(--blue-400)"],
    ];
    const cols = [
      { key: "doc", header: "Docente", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "curso", header: "Curso", render: (v) => <Badge tone="brand">{v}</Badge> },
      { key: "secc", header: "Secciones" },
      { key: "horas", header: "Horas/sem", align: "center", mono: true },
      { key: "carga", header: "Carga", align: "center", render: (_, r) => (
        <Badge tone={r.horas >= 16 ? "warning" : "success"} dot>{r.horas >= 16 ? "Alta" : "Normal"}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <Tooltip content="Editar asignación"><IconButton label="Editar" size="sm" onClick={() => setEdit(r)}><Ic.Pencil /></IconButton></Tooltip>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">La asignación parte del <b>plan de estudios</b> (Estructura académica) y alimenta el horario y el portal del docente.</Alert>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setEdit({})}>Nueva asignación</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={DATA.map((d) => ({ doc: d[0], curso: d[1], secc: d[2], horas: d[3], color: d[4] }))} hover />
        </Card>
        <Dialog open={!!edit} onClose={() => setEdit(null)} title={edit && edit.doc ? `Asignación · ${edit.doc}` : "Nueva asignación"} icon={<Ic.Teacher />}
          footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", edit.doc ? "Asignación actualizada" : "Asignación creada", "El horario y el portal del docente quedaron sincronizados."); setEdit(null); }}>Guardar</Button></>}>
          {edit && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Select label="Docente" options={["Pedro Gómez Silva", "Lucía Díaz Rojas", "Raúl Meza Campos", "Iris Quinto Vega"]} defaultValue={edit.doc} placeholder="Seleccione" required />
              <Select label="Curso" options={["Matemática", "Comunicación", "Ciencia y Tecnología", "Inglés"]} defaultValue={edit.curso} placeholder="Seleccione" required />
              <Select label="Secciones" options={["3° A Primaria", "3° B Primaria", "4° A Primaria"]} placeholder="Seleccione" hint="Se añaden de una en una" containerStyle={{ gridColumn: "1 / -1" }} />
            </div>
          )}
        </Dialog>
      </div>
    );
  }

  window.SGE_Schedule = function Schedule() {
    const [tab, setTab] = React.useState("horario");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: "horario", label: "Horario por sección" },
          { id: "asignacion", label: "Asignación docente", count: 5 },
        ]} />
        {tab === "horario" ? <Horario /> : <Asignacion />}
      </div>
    );
  };
})();
