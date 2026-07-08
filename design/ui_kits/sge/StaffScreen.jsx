/* Elohim SGE — Personal (RRHH). Registers window.SGE_Staff.
   Tabs: Personal (listado + ficha) · Asistencia (marcación de hora) · Planilla (pagos y descuentos). */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Tabs, Alert, Tooltip, StatCard, Dialog, ProgressBar, Pagination, Textarea, Switch } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  /* ------------------------------ data ------------------------------ */
  const STAFF = [
    ["P-001", "Pedro Gómez Silva", "Docente", "Primaria · Matemática", "Tiempo completo", "Activo", 1800, "var(--blue-500)"],
    ["P-002", "Lucía Díaz Rojas", "Docente", "Primaria · Comunicación", "Tiempo completo", "Activo", 1800, "var(--gold-500)"],
    ["P-003", "Iris Quinto Vega", "Docente", "Secundaria · Inglés", "Medio tiempo", "Activo", 1100, "var(--green-500)"],
    ["P-004", "Liliana Campos Paz", "Secretaría", "Administración · Caja", "Tiempo completo", "Activo", 1500, "var(--brown-400)"],
    ["P-005", "Saúl Ramos Cruz", "Docente", "Secundaria · Ed. Física", "Por horas", "Licencia", 900, "var(--blue-400)"],
    ["P-006", "Nora Paz Salas", "Auxiliar", "Inicial", "Tiempo completo", "Activo", 1300, "var(--blue-600)"],
  ];

  const MARCAS = [
    ["Pedro Gómez Silva", "07:42", "13:15", "Puntual", "var(--blue-500)"],
    ["Lucía Díaz Rojas", "07:51", "13:12", "Puntual", "var(--gold-500)"],
    ["Liliana Campos Paz", "07:38", "—", "Puntual", "var(--brown-400)"],
    ["Iris Quinto Vega", "08:12", "—", "Tardanza", "var(--green-500)"],
    ["Nora Paz Salas", "07:45", "—", "Puntual", "var(--blue-600)"],
    ["Raúl Meza Campos", "—", "—", "Sin marcar", "var(--blue-300)"],
    ["Marta Quispe Rojas", "—", "—", "Sin marcar", "var(--gold-600)"],
    ["Saúl Ramos Cruz", "—", "—", "Licencia", "var(--blue-400)"],
  ];

  const PLANILLA = [
    ["Pedro Gómez Silva", "Docente TC", 1800, 0, 162, 1638, "Pagado", "var(--blue-500)"],
    ["Lucía Díaz Rojas", "Docente TC", 1800, 0, 162, 1638, "Pagado", "var(--gold-500)"],
    ["Iris Quinto Vega", "Docente MT", 1100, 25, 99, 976, "Pendiente", "var(--green-500)"],
    ["Liliana Campos Paz", "Secretaría", 1500, 0, 135, 1365, "Pendiente", "var(--brown-400)"],
    ["Saúl Ramos Cruz", "Docente PH", 450, 0, 40.5, 409.5, "Pendiente", "var(--blue-400)"],
    ["Nora Paz Salas", "Auxiliar", 1300, 15, 117, 1168, "Pendiente", "var(--blue-600)"],
  ];

  /* ------------------------------ Personal tab ------------------------------ */
  function FichaDialog({ open, onClose, p, onEdit }) {
    return (
      <Dialog open={open} onClose={onClose} size="lg" title={p ? p.nombre : ""} description={p ? `${p.cod} · ${p.rol} · ${p.area}` : ""} icon={<Ic.User />}
        footer={<><Button variant="secondary" onClick={onClose}>Cerrar</Button><Button variant="primary" iconLeft={<Ic.Pencil />} onClick={onEdit}>Editar ficha</Button></>}>
        {p && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 6 }}>
            {[["DNI", "42 118 906"], ["Teléfono", "964 880 213"], ["Correo", "p.gomez@elohim.edu.pe"], ["Régimen", p.reg],
              ["Fecha de ingreso", "01/03/2021"], ["Sueldo base", fmt(p.sueldo)], ["Horario de marcación", p.nombre === "Saúl Ramos Cruz" ? "Individual · 13:00 (tol. 10 min)" : "Según su grupo · Docentes 7:45"], ["Cursos que dicta", "Matemática · 3° A y 3° B"], ["Tutoría", "3° A Primaria"]].map(([k, v]) => (
              <div key={k}>
                <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                <div style={{ font: "var(--type-body-md)", color: "var(--text-body)" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    );
  }

  function Personal() {
    const [ficha, setFicha] = React.useState(null);
    const [form, setForm] = React.useState(null); // {p?} nuevo o editar
    const [horarioInd, setHorarioInd] = React.useState(false);
    React.useEffect(() => { setHorarioInd(false); }, [form]);
    const cols = [
      { key: "cod", header: "Código", mono: true, width: 80 },
      { key: "nombre", header: "Empleado", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
            <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.area}</span>
          </div>
        </div>) },
      { key: "rol", header: "Rol", align: "center", render: (v) => (
        <Badge tone={v === "Docente" ? "brand" : v === "Secretaría" ? "accent" : "info"}>{v}</Badge>) },
      { key: "reg", header: "Régimen" },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Activo" ? "success" : v === "Licencia" ? "warning" : "neutral"} dot>{v}</Badge>) },
      { key: "sueldo", header: "Sueldo base", num: true, mono: true, render: (v) => fmt(v) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Ver ficha"><IconButton label="Ver" size="sm" onClick={() => setFicha(r)}><Ic.Eye /></IconButton></Tooltip>
          <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => setForm({ p: r })}><Ic.Pencil /></IconButton></Tooltip>
        </div>) },
    ];
    const rows = STAFF.map((s) => ({ cod: s[0], nombre: s[1], rol: s[2], area: s[3], reg: s[4], estado: s[5], sueldo: s[6], color: s[7] }));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Input placeholder="Buscar por nombre, código o DNI…" iconLeft={<Ic.Search />} />
          </div>
          <Select placeholder="Rol" options={["Docente", "Secretaría", "Auxiliar", "Mantenimiento"]} containerStyle={{ width: 140 }} />
          <Select placeholder="Estado" options={["Activo", "Licencia", "Cesado"]} containerStyle={{ width: 130 }} />
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setForm({})}>Registrar empleado</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={rows} hover zebra />
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
            <Pagination page={1} pageCount={2} onPageChange={() => {}} total={23} pageSize={15} />
          </div>
        </Card>
        <FichaDialog open={!!ficha} onClose={() => setFicha(null)} p={ficha} onEdit={() => { const p = ficha; setFicha(null); setForm({ p }); }} />

        {/* Nuevo / editar empleado */}
        <Dialog open={!!form} onClose={() => setForm(null)} size="lg"
          title={form && form.p ? `Editar · ${form.p.nombre}` : "Registrar empleado"} icon={<Ic.Teacher />}
          footer={<><Button variant="secondary" onClick={() => setForm(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", form.p ? "Empleado actualizado" : "Empleado registrado", form.p ? `${form.p.nombre} guardado.` : "Ya aparece en asistencia y en la planilla del mes."); setForm(null); }}>
              {form && form.p ? "Guardar cambios" : "Registrar"}</Button></>}>
          {form && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Input label="Nombres y apellidos" required defaultValue={form.p ? form.p.nombre : ""} placeholder="Ej. Pedro Gómez Silva" containerStyle={{ gridColumn: "1 / -1" }} />
              <Input label="DNI" required defaultValue={form.p ? "42 118 906" : ""} placeholder="00000000" />
              <Input label="Teléfono" defaultValue={form.p ? "964 880 213" : ""} placeholder="9__ ___ ___" />
              <Select label="Rol" options={["Docente", "Secretaría", "Auxiliar", "Mantenimiento", "Dirección"]} defaultValue={form.p ? form.p.rol : undefined} placeholder="Seleccione" required />
              <Select label="Régimen" options={["Tiempo completo", "Medio tiempo", "Por horas"]} defaultValue={form.p ? form.p.reg : undefined} placeholder="Seleccione" required />
              <Input label="Área / nivel" defaultValue={form.p ? form.p.area : ""} placeholder="Ej. Primaria · Matemática" />
              <Input label="Sueldo base" prefix="S/." defaultValue={form.p ? String(form.p.sueldo) : ""} inputMode="decimal" />
              <Input label="Fecha de ingreso" type="date" defaultValue={form.p ? "2021-03-01" : ""} />
              <Select label="Estado" options={["Activo", "Licencia", "Cesado"]} defaultValue={form.p ? form.p.estado : "Activo"} />
              <Select label="Régimen pensionario" options={["ONP (13%)", "AFP Integra", "AFP Prima", "AFP Profuturo", "AFP Habitat"]} defaultValue="ONP (13%)" hint="Define el descuento en planilla" />
              <Select label="Horario de marcación" options={["Según su grupo", "Individual"]} defaultValue="Según su grupo"
                onChange={(e) => setHorarioInd(e.target.value === "Individual")}
                hint="El grupo define hora y tolerancia (Reglas de marcación)" />
              {horarioInd && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Input label="Hora de ingreso" type="time" defaultValue="13:00" />
                  <Input label="Tolerancia" suffix="min" inputMode="numeric" defaultValue="10" />
                </div>
              )}
            </div>
          )}
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ Reglas de marcación ------------------------------ */
  function ReglasDialog({ open, onClose }) {
    const GRUPOS = [
      { g: "Docentes", hora: "07:45", tol: 15 },
      { g: "Administrativos", hora: "07:30", tol: 10 },
      { g: "Auxiliares", hora: "07:30", tol: 10 },
      { g: "Mantenimiento", hora: "06:30", tol: 10 },
      { g: "Portería", hora: "06:00", tol: 5 },
    ];
    return (
      <Dialog open={open} onClose={onClose} size="lg" title="Reglas de marcación" icon={<Ic.Clock />}
        description="Horario de ingreso y tolerancia por grupo · regla de descuento automático"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Reglas guardadas", "Rigen desde mañana; las marcas de hoy no se recalculan."); onClose(); }}>Guardar reglas</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
          <div>
            <div style={{ font: "var(--type-label)", color: "var(--text-strong)", marginBottom: 8 }}>Horarios de ingreso por grupo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GRUPOS.map((x) => (
                <div key={x.g} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10, alignItems: "center", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "8px 12px" }}>
                  <span style={{ font: "var(--type-label)", color: "var(--text-body)" }}>{x.g}</span>
                  <Input size="sm" type="time" defaultValue={x.hora} aria-label={`Hora de ingreso · ${x.g}`} />
                  <Input size="sm" defaultValue={String(x.tol)} suffix="min tolerancia" inputMode="numeric" aria-label={`Tolerancia · ${x.g}`} />
                </div>
              ))}
            </div>
            <div style={{ font: "var(--type-caption)", color: "var(--text-muted)", marginTop: 6 }}>La tardanza se calcula contra el horario del grupo de cada empleado. Un empleado puede tener horario individual desde su ficha.</div>
          </div>
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <Switch label="Descuento automático por tardanzas acumuladas" defaultChecked />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Input label="Tardanzas para aplicar" defaultValue="3" inputMode="numeric" />
              <Input label="Descuento" prefix="S/." defaultValue="20.00" inputMode="decimal" />
              <Select label="Periodo de conteo" options={["Por mes", "Por bimestre"]} defaultValue="Por mes" />
            </div>
            <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>El descuento se genera como ítem de planilla con origen “Auto · tardanzas” y puede anularse manualmente con justificación.</span>
          </div>
        </div>
      </Dialog>
    );
  }

  /* ------------------------------ Asistencia tab ------------------------------ */
  function Asistencia() {
    const [reglas, setReglas] = React.useState(false);
    const [marcas, setMarcas] = React.useState(() => MARCAS.map((m) => ({ nombre: m[0], in: m[1], out: m[2], estado: m[3], color: m[4] })));
    const hora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
    const marcarIn = (r) => {
      const h = hora();
      const estado = h > "08:00" ? "Tardanza" : "Puntual";
      setMarcas(ms => ms.map(m => m.nombre === r.nombre ? { ...m, in: h, estado } : m));
      notify(estado === "Tardanza" ? "warning" : "success", `Ingreso marcado · ${h}`, `${r.nombre} — ${estado}${estado === "Tardanza" ? " (después de las 8:00)" : ""}.`);
    };
    const marcarOut = (r) => {
      const h = hora();
      setMarcas(ms => ms.map(m => m.nombre === r.nombre ? { ...m, out: h } : m));
      notify("info", `Salida marcada · ${h}`, `${r.nombre} completó su jornada.`);
    };
    const cols = [
      { key: "nombre", header: "Empleado", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "in", header: "Ingreso", mono: true, align: "center", render: (v) => (
        <span style={{ color: v === "—" ? "var(--text-subtle)" : "var(--text-body)" }}>{v}</span>) },
      { key: "out", header: "Salida", mono: true, align: "center", render: (v) => (
        <span style={{ color: v === "—" ? "var(--text-subtle)" : "var(--text-body)" }}>{v}</span>) },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Puntual" ? "success" : v === "Tardanza" ? "warning" : v === "Licencia" ? "info" : v === "Sin marcar" ? "neutral" : "danger"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        r.in === "—" && r.estado !== "Licencia"
          ? <Button size="sm" variant="secondary" iconLeft={<Ic.Clock />} onClick={() => marcarIn(r)}>Marcar ingreso</Button>
          : r.out === "—" && r.in !== "—"
            ? <Button size="sm" variant="ghost" iconLeft={<Ic.Clock />} onClick={() => marcarOut(r)}>Marcar salida</Button>
            : null) },
    ];
    const rows = marcas;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Presentes" value="19" iconTone="success" icon={<Ic.Check />} caption="de 23 empleados" />
          <StatCard label="Tardanzas" value="1" iconTone="accent" icon={<Ic.Clock />} caption="hoy" />
          <StatCard label="Sin marcar" value="3" iconTone="danger" icon={<Ic.Trash />} caption="aún no llegan" />
          <StatCard label="Licencias" value="1" icon={<Ic.Clipboard />} caption="S. Ramos · salud" />
        </div>
        <Alert tone="info" title="Horarios y tolerancia por grupo"
          actions={<Button size="sm" variant="secondary" iconLeft={<Ic.Settings />} onClick={() => setReglas(true)}>Configurar reglas</Button>}>
          Cada grupo tiene su hora de ingreso (Docentes 7:45 · Administrativos 7:30 · Mantenimiento 6:30…). Pasada la tolerancia se registra tardanza; las tardanzas acumuladas generan descuento según la regla configurada.
        </Alert>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <Input label="Fecha" type="date" defaultValue="2026-07-07" containerStyle={{ width: 170 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Asistencia exportada", "Julio 2026 · 23 empleados · descargada en Excel.")}>Exportar mes</Button>
        </div>
        <Card flush title="Marcación · Martes 07/07/2026">
          <Table columns={cols} data={rows} hover />
        </Card>
        <ReglasDialog open={reglas} onClose={() => setReglas(false)} />
      </div>
    );
  }

  /* ------------------------------ Descuentos por empleado ------------------------------ */
  function DescuentosDialog({ emp, onClose }) {
    const [items, setItems] = React.useState(() => emp.desc > 20
      ? [
          { id: 1, tipo: "Auto · tardanzas", det: "3 tardanzas en Junio (regla vigente)", monto: 20, estado: "Aplicado", just: null },
          { id: 2, tipo: "Manual · adelanto", det: "Adelanto de sueldo · 15/06", monto: emp.desc - 20, estado: "Aplicado", just: null },
        ]
      : emp.desc > 0
        ? [{ id: 1, tipo: "Auto · tardanzas", det: "3 tardanzas en Junio (regla vigente)", monto: emp.desc, estado: "Aplicado", just: null }]
        : []);
    const [anular, setAnular] = React.useState(null);
    const [justif, setJustif] = React.useState("");
    const [nuevo, setNuevo] = React.useState(false);
    const anularItem = () => {
      setItems(xs => xs.map(x => x.id === anular.id ? { ...x, estado: "Anulado", just: justif.trim() } : x));
      notify("warning", "Descuento anulado", `${anular.tipo} · ${fmt(anular.monto)} — queda registrado como anulado con tu justificación.`);
      setAnular(null); setJustif("");
    };
    return (
      <Dialog open onClose={onClose} size="lg" title={`Descuentos · ${emp.nombre}`} icon={<Ic.Chart />}
        description="Julio 2026 · los anulados no se borran: quedan como evidencia"
        footer={<><Button variant="secondary" onClick={onClose}>Cerrar</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setNuevo(true)}>Agregar descuento manual</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
          {items.length === 0 && !nuevo && (
            <div style={{ font: "var(--type-body)", color: "var(--text-muted)", textAlign: "center", padding: "18px 0" }}>Sin descuentos este mes.</div>
          )}
          {items.map((x) => (
            <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", opacity: x.estado === "Anulado" ? 0.75 : 1 }}>
              <Badge tone={x.tipo.startsWith("Auto") ? "brand" : "neutral"}>{x.tipo}</Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: "var(--type-label)", color: "var(--text-strong)", textDecoration: x.estado === "Anulado" ? "line-through" : "none" }}>{x.det}</div>
                {x.estado === "Anulado" && <div style={{ font: "var(--type-2xs)", color: "var(--warning-soft-fg)" }}>Anulado por Dir. Pérez · “{x.just}”</div>}
              </div>
              <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", fontWeight: 600, color: x.estado === "Anulado" ? "var(--text-subtle)" : "var(--danger)", textDecoration: x.estado === "Anulado" ? "line-through" : "none" }}>− {fmt(x.monto)}</span>
              {x.estado === "Anulado"
                ? <Badge tone="warning" dot>Anulado</Badge>
                : <Button size="sm" variant="ghost" onClick={() => setAnular(x)}>Anular</Button>}
            </div>
          ))}
          {nuevo && (
            <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>Nuevo descuento manual</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Select label="Tipo" options={["Adelanto de sueldo", "Daño o pérdida", "Inasistencia injustificada", "Otro"]} placeholder="Seleccione" required />
                <Input label="Monto" prefix="S/." inputMode="decimal" placeholder="0.00" required />
              </div>
              <Textarea label="Motivo" rows={2} required placeholder="Obligatorio — aparecerá en la boleta y el historial" />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button size="sm" variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button>
                <Button size="sm" variant="primary" iconLeft={<Ic.Check />} onClick={() => { setNuevo(false); notify("success", "Descuento registrado", `Se aplicará en la planilla de Julio de ${emp.nombre}.`); }}>Registrar</Button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmar anulación */}
        <Dialog open={!!anular} onClose={() => { setAnular(null); setJustif(""); }} title="Anular descuento" icon={<Ic.Trash />} iconTone="warning"
          description={anular ? `${anular.tipo} · − ${fmt(anular.monto)}` : ""}
          footer={<><Button variant="secondary" onClick={() => { setAnular(null); setJustif(""); }}>Cancelar</Button>
            <Button variant="danger" iconLeft={<Ic.Check />} disabled={justif.trim().length < 10} onClick={anularItem}>Anular con justificación</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            <Alert tone="warning" title="No se borra: queda como evidencia">El ítem quedará marcado como anulado, con tu usuario, fecha y justificación, visible en el historial y la auditoría.</Alert>
            <Textarea label="Justificación" rows={2} required value={justif} onChange={(e) => setJustif(e.target.value)}
              placeholder="Mínimo 10 caracteres — ej. tardanzas justificadas por comisión de la dirección" hint={justif.trim().length < 10 ? `${Math.max(0, 10 - justif.trim().length)} caracteres más` : "Listo"} />
          </div>
        </Dialog>
      </Dialog>
    );
  }

  /* ------------------------------ Planilla tab ------------------------------ */
  function Planilla() {
    const [pagar, setPagar] = React.useState(null);
    const [masivo, setMasivo] = React.useState(false);
    const [descDlg, setDescDlg] = React.useState(null);
    const [boleta, setBoleta] = React.useState(null);
    const REGIMEN = { "Pedro Gómez Silva": "AFP Integra", "Lucía Díaz Rojas": "ONP", "Liliana Campos Paz": "AFP Habitat", "Iris Quinto Vega": "ONP" };
    const regimenDe = (n) => REGIMEN[n] || "ONP";
    const [rows, setRows] = React.useState(() => PLANILLA.map((p) => ({ nombre: p[0], cargo: p[1], sueldo: p[2], desc: p[3], apor: p[4], neto: p[5], estado: p[6], color: p[7] })));
    const pagarUno = (r) => {
      setRows(rs => rs.map(x => x.nombre === r.nombre ? { ...x, estado: "Pagado" } : x));
      notify("success", "Sueldo pagado", `${r.nombre} · ${fmt(r.neto)} · boleta generada.`);
      setPagar(null);
    };
    const cols = [
      { key: "nombre", header: "Empleado", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
            <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.cargo}</span>
          </div>
        </div>) },
      { key: "sueldo", header: "Sueldo", num: true, mono: true, render: (v) => fmt(v) },
      { key: "regimen", header: "Régimen", align: "center", render: (_, r) => (
        <Badge tone={regimenDe(r.nombre) === "ONP" ? "neutral" : "brand"}>{regimenDe(r.nombre)}</Badge>) },
      { key: "desc", header: "Descuentos", num: true, mono: true, render: (v, r) => (
        <Button variant="link" size="sm" onClick={() => setDescDlg(r)} style={{ font: "var(--type-mono)", color: v > 0 ? "var(--danger)" : "var(--text-muted)" }} title="Ver / gestionar descuentos">
          {v > 0 ? `− ${fmt(v)}` : "—"}
        </Button>) },
      { key: "apor", header: "Aportes", num: true, mono: true, render: (v, r) => (
        <Button variant="link" size="sm" onClick={() => setBoleta(r)} style={{ font: "var(--type-mono)", color: "var(--text-muted)" }} title="Ver desglose de boleta">− {fmt(v)}</Button>) },
      { key: "neto", header: "Neto a pagar", num: true, mono: true, render: (v) => (
        <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{fmt(v)}</span>) },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Pagado" ? "success" : "warning"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
          <Tooltip content="Descuentos"><IconButton label="Descuentos" size="sm" onClick={() => setDescDlg(r)}><Ic.Chart /></IconButton></Tooltip>
          {r.estado === "Pagado"
            ? <Tooltip content="Ver boleta"><IconButton label="Boleta" size="sm" onClick={() => notify("info", "Boleta", `${r.nombre} · Julio 2026 · ${fmt(r.neto)} — abierta para impresión.`)}><Ic.Receipt /></IconButton></Tooltip>
            : <Button size="sm" variant="primary" onClick={() => setPagar(r)}>Pagar</Button>}
        </div>) },
    ];
    const totalPend = rows.filter(r => r.estado === "Pendiente").reduce((a, r) => a + r.neto, 0);
    const nPend = rows.filter(r => r.estado === "Pendiente").length;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Planilla · Julio" value="S/ 28,450" icon={<Ic.Building />} caption="23 empleados" />
          <StatCard label="Pagado" value="S/ 3,276" iconTone="success" icon={<Ic.Check />} caption="2 empleados" />
          <StatCard label="Por pagar" value={fmt(totalPend).replace(".00", "")} iconTone="accent" icon={<Ic.Clock />} caption="vence 05/07" />
          <StatCard label="Descuentos del mes" value="S/ 40" iconTone="danger" icon={<Ic.Chart />} caption="tardanzas y adelantos" />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <Select label="Periodo" options={["Julio 2026", "Junio 2026", "Mayo 2026"]} defaultValue="Julio 2026" containerStyle={{ width: 170 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Planilla exportada", "Julio 2026 · 23 empleados · descargada en Excel.")}>Exportar planilla</Button>
          <Button variant="accent" iconLeft={<Ic.Cash />} disabled={nPend === 0} onClick={() => setMasivo(true)}>Pagar todos los pendientes</Button>
        </div>
        <Card flush title="Planilla · Julio 2026" subtitle="AFP u ONP según la ficha de cada empleado · EsSalud 9% a cargo del colegio · clic en aportes para ver la boleta">
          <Table columns={cols} data={rows} hover zebra />
        </Card>
        {descDlg && <DescuentosDialog emp={descDlg} onClose={() => setDescDlg(null)} />}
        <Dialog open={!!boleta} onClose={() => setBoleta(null)} title="Desglose de boleta · Julio 2026" icon={<Ic.Receipt />}
          description={boleta ? `${boleta.nombre} · ${boleta.cargo} · régimen ${regimenDe(boleta.nombre)}` : ""}
          footer={<Button variant="primary" onClick={() => setBoleta(null)}>Cerrar</Button>}>
          {boleta && (() => {
            const reg = regimenDe(boleta.nombre);
            const s = boleta.sueldo;
            const filas = reg === "ONP"
              ? [["Sueldo base", s, false], ["ONP (13%)", -s * 0.13, true]]
              : [["Sueldo base", s, false], [`${reg} · fondo (10%)`, -s * 0.10, true], [`${reg} · comisión (1.55%)`, -s * 0.0155, true], [`${reg} · seguro (1.84%)`, -s * 0.0184, true]];
            if (boleta.desc > 0) filas.push(["Descuentos del mes (tardanzas/adelantos)", -boleta.desc, true]);
            const neto = filas.reduce((a, f) => a + f[1], 0);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 4 }}>
                {filas.map(([k, v, neg]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", font: "var(--type-body)", padding: "6px 10px", background: "var(--surface-sunken)", borderRadius: "var(--radius-sm)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: neg ? "var(--danger)" : "var(--text-strong)" }}>{neg ? "− " : ""}{fmt(Math.abs(v))}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 10px", borderTop: "1px solid var(--border-subtle)", font: "var(--type-label)", fontWeight: 700 }}>
                  <span>Neto a pagar</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(neto)}</span>
                </div>
                <Alert tone="info">Aparte, el colegio aporta <b>EsSalud 9%</b> ({fmt(s * 0.09)}) — no se descuenta al trabajador. Gratificación de Julio incluida en planilla aparte. Porcentajes en Configuración → Planilla.</Alert>
              </div>
            );
          })()}
        </Dialog>
        <Dialog open={!!pagar} onClose={() => setPagar(null)} title="Pagar sueldo" icon={<Ic.Cash />} iconTone="success"
          description={pagar ? `${pagar.nombre} · Julio 2026` : ""}
          footer={<><Button variant="secondary" onClick={() => setPagar(null)}>Cancelar</Button><Button variant="primary" iconLeft={<Ic.Check />} onClick={() => pagarUno(pagar)}>Confirmar pago</Button></>}>
          {pagar && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Sueldo base", fmt(pagar.sueldo)], ["Descuentos", pagar.desc > 0 ? `− ${fmt(pagar.desc)}` : "—"], ["Aportes (ONP 9%)", `− ${fmt(pagar.apor)}`], ["Neto a pagar", fmt(pagar.neto)]].map(([k, v], i) => (
                  <div key={k} style={{ background: i === 3 ? "var(--surface-brand-soft)" : "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
                    <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                    <div style={{ font: "var(--type-h3)", fontFamily: "var(--font-mono)", color: i === 3 ? "var(--brand)" : "var(--text-strong)" }}>{v}</div>
                  </div>
                ))}
              </div>
              <Select label="Método" options={["Transferencia BCP", "Efectivo", "Yape / Plin"]} defaultValue="Transferencia BCP" />
              <Input label="N° de operación" placeholder="Opcional" />
            </div>
          )}
        </Dialog>

        {/* Pago masivo */}
        <Dialog open={masivo} onClose={() => setMasivo(false)} title="Pagar todos los pendientes" icon={<Ic.Cash />} iconTone="warning"
          description={`${nPend} empleados · ${fmt(totalPend)} en total`}
          footer={<><Button variant="secondary" onClick={() => setMasivo(false)}>Cancelar</Button>
            <Button variant="accent" iconLeft={<Ic.Check />} onClick={() => { setRows(rs => rs.map(x => ({ ...x, estado: "Pagado" }))); setMasivo(false); notify("success", "Planilla pagada", `${nPend} sueldos pagados · ${fmt(totalPend)} · boletas generadas.`); }}>Pagar {fmt(totalPend)}</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
            <Alert tone="warning" title="Pago masivo">Se registrará el pago de todos los pendientes con el mismo método y se generarán sus boletas.</Alert>
            <Select label="Método" options={["Transferencia BCP", "Efectivo"]} defaultValue="Transferencia BCP" />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ screen ------------------------------ */
  window.SGE_StaffAttendance = Asistencia; // vista independiente para el rol Portería
  window.SGE_Staff = function Staff() {
    const [tab, setTab] = React.useState("personal");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: "personal", label: "Personal", count: 23 },
          { id: "asist", label: "Asistencia y marcación" },
          { id: "planilla", label: "Planilla", count: 4 },
        ]} />
        {tab === "personal" && <Personal />}
        {tab === "asist" && <Asistencia />}
        {tab === "planilla" && <Planilla />}
      </div>
    );
  };
})();
