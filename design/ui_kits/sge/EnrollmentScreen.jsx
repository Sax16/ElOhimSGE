/* Elohim SGE — Matrícula. Registers window.SGE_Enrollment.
   Listado del proceso + asistente de 5 pasos que termina generando el cronograma de pagos. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Tabs, ProgressBar, Alert, Tooltip, Checkbox, Radio, RadioGroup, StatCard, Tag, Pagination, Dialog } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);

  /* ------------------------------ list view ------------------------------ */
  const RECENT = [
    ["M-2026-0482", "Carla Núñez Ríos", "Inicial · 4 años · Los Girasoles", "Nueva", "28/06", "Pendiente de pago", "var(--gold-500)"],
    ["M-2026-0481", "José Ramos Lía", "5° B Primaria", "Ratificada", "27/06", "Completa", "var(--blue-500)"],
    ["M-2026-0480", "Piero Salas Cruz", "2° A Secundaria", "Traslado", "27/06", "Observada", "var(--green-500)"],
    ["M-2026-0479", "Rosa Lima Vega", "2° B Primaria", "Ratificada", "26/06", "Completa", "var(--brown-400)"],
    ["M-2026-0478", "Hugo Vela Soto", "6° A Primaria", "Ratificada", "26/06", "Completa", "var(--blue-400)"],
  ];

  function EnrollList({ onNew }) {
    const [ver, setVer] = React.useState(null);
    const cols = [
      { key: "cod", header: "N° Matrícula", mono: true, width: 130 },
      { key: "est", header: "Estudiante", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
            <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.ubic}</span>
          </div>
        </div>) },
      { key: "tipo", header: "Tipo", align: "center", render: (v) => (
        <Badge tone={v === "Nueva" ? "brand" : v === "Ratificada" ? "success" : "accent"}>{v}</Badge>) },
      { key: "fecha", header: "Fecha", mono: true, align: "center" },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Completa" ? "success" : v === "Pendiente de pago" ? "warning" : "danger"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Ver ficha"><IconButton label="Ver" size="sm" onClick={() => setVer(r)}><Ic.Eye /></IconButton></Tooltip>
          <Tooltip content="Imprimir ficha"><IconButton label="Imprimir" size="sm" onClick={() => notify("info", "Imprimiendo", `Ficha única de matrícula ${r.cod} enviada a la impresora.`)}><Ic.Download /></IconButton></Tooltip>
        </div>) },
    ];
    const rows = RECENT.map((r) => ({ cod: r[0], est: r[1], ubic: r[2], tipo: r[3], fecha: r[4], estado: r[5], color: r[6] }));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Matriculados 2026" value="482" icon={<Ic.Users />} caption="de 556 vacantes" />
          <StatCard label="Nuevos" value="96" iconTone="brand" icon={<Ic.Plus />} caption="ingresantes 2026" />
          <StatCard label="Ratificaciones" value="371" iconTone="success" icon={<Ic.Check />} caption="+ 15 traslados" />
          <StatCard label="Vacantes libres" value="74" iconTone="accent" icon={<Ic.Clipboard />} caption="3 secciones llenas" />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Input placeholder="Buscar por estudiante, N° de matrícula o DNI…" iconLeft={<Ic.Search />} />
          </div>
          <Select placeholder="Tipo" options={["Nueva", "Ratificada", "Traslado"]} containerStyle={{ width: 140 }} />
          <Select placeholder="Nivel" options={["Inicial", "Primaria", "Secundaria"]} containerStyle={{ width: 150 }} />
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={onNew}>Nueva matrícula</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={rows} hover zebra />
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
            <Pagination page={1} pageCount={25} onPageChange={() => {}} total={482} pageSize={20} />
          </div>
        </Card>

        {/* Detalle de matrícula */}
        <Dialog open={!!ver} onClose={() => setVer(null)} size="lg" title={ver ? ver.est : ""} icon={<Ic.Clipboard />}
          description={ver ? `${ver.cod} · ${ver.ubic}` : ""}
          footer={<>
            <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("info", "Imprimiendo", `Ficha ${ver.cod} enviada a la impresora.`)}>Imprimir ficha</Button>
            {ver && ver.estado === "Pendiente de pago"
              ? <Button variant="accent" iconLeft={<Ic.Cash />} onClick={() => { setVer(null); goTo("caja"); notify("info", "Caja", `Cobro de matrícula de ${ver.est} preparado.`); }}>Cobrar matrícula</Button>
              : <Button variant="primary" iconLeft={<Ic.Eye />} onClick={() => { setVer(null); goTo("est"); notify("info", "Estudiantes", "Abriendo la ficha del estudiante."); }}>Ver estudiante</Button>}
          </>}>
          {ver && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              {[["Tipo", ver.tipo], ["Fecha", ver.fecha + "/2026"], ["Estado", ver.estado], ["Apoderado firmante", "Juana Roca Pérez"], ["Cronograma", "1 matrícula + 10 pensiones"], ["Registrado por", "L. Campos (Secretaría)"]].map(([k, v]) => (
                <div key={k}>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                  <div style={{ font: "var(--type-body-md)", color: "var(--text-body)" }}>{v}</div>
                </div>
              ))}
              {ver.estado === "Observada" && <Alert tone="danger" title="Observada" style={{ gridColumn: "1 / -1" }}>Falta el certificado de estudios del colegio de procedencia.</Alert>}
            </div>
          )}
        </Dialog>
      </div>
    );
  }
  const STEPS = ["Estudiante", "Apoderados", "Ubicación", "Tarifa y cronograma", "Confirmación"];

  function Stepper({ step }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)" }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 99, display: "inline-flex", alignItems: "center", justifyContent: "center",
                font: "var(--type-label)", fontWeight: 600, fontSize: 16,
                background: i < step ? "var(--success)" : i === step ? "var(--brand)" : "var(--surface-sunken)",
                color: i <= step ? "#fff" : "var(--text-muted)",
                border: i === step ? "none" : "1px solid var(--border-subtle)",
              }}>{i < step ? <Ic.Check /> : <span style={{ fontSize: 13 }}>{i + 1}</span>}</span>
              <span style={{ font: "var(--type-label)", fontWeight: i === step ? 600 : 400, color: i === step ? "var(--text-strong)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ flex: 1, height: 1, background: i < step ? "var(--success)" : "var(--border-subtle)", margin: "0 14px", minWidth: 18 }}></span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  function FieldPair({ k, v, strong }) {
    return (
      <div>
        <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
        <div style={{ font: strong ? "var(--type-h3)" : "var(--type-body-md)", color: "var(--text-body)" }}>{v}</div>
      </div>
    );
  }

  /* Paso 1 — Estudiante */
  function StepStudent({ tipo, setTipo }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <RadioGroup name="tipoest" value={tipo} onChange={(e) => setTipo(e.target.value)} row>
          <Radio value="nuevo" label="Estudiante nuevo" description="Primera vez en la institución" />
          <Radio value="exist" label="Estudiante existente" description="Ratificación o pre-matrícula 2026" />
          <Radio value="traslado" label="Traslado entrante" description="Viene de otro colegio a mitad de año" />
        </RadioGroup>
        {tipo === "traslado" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Alert tone="info" title="Primero el SIAGIE">El traslado se aprueba primero en el SIAGIE. Aquí lo registras para el control interno: pensiones solo por los meses restantes y notas de origen del colegio anterior.</Alert>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Input label="Apellido paterno" placeholder="Torres" required />
              <Input label="Apellido materno" placeholder="Inga" required />
              <Input label="Nombres" placeholder="Bruno" required />
              <Input label="DNI" placeholder="00000000" required hint="8 dígitos" />
              <Input label="Colegio de origen" placeholder="I.E. 30001 Satipo" required />
              <Input label="Código de estudiante SIAGIE" placeholder="00000000000000" required hint="14 dígitos" />
              <Input label="Fecha de ingreso" type="date" defaultValue="2026-08-17" required hint="Define desde cuándo se cobran pensiones" />
              <Select label="Se incorpora en" options={["Bimestre III (ago–oct)", "Bimestre II (may–jul)", "Bimestre IV (oct–dic)"]} defaultValue="Bimestre III (ago–oct)" required />
              <Select label="Última libreta traída" options={["Sí — con notas de Bim. I y II", "Aún no la entrega"]} defaultValue="Sí — con notas de Bim. I y II" hint="Se digitan como notas de origen" />
            </div>
          </div>
        )}
        {tipo === "nuevo" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Input label="Apellido paterno" placeholder="Núñez" required />
            <Input label="Apellido materno" placeholder="Ríos" required />
            <Input label="Nombres" placeholder="Carla" required />
            <Input label="DNI" placeholder="00000000" required hint="8 dígitos" />
            <Input label="Fecha de nacimiento" type="date" required />
            <Select label="Sexo" placeholder="Seleccione" options={["Femenino", "Masculino"]} required />
            <Input label="Dirección" placeholder="Jr. Los Cedros 245, Satipo" containerStyle={{ gridColumn: "span 2" }} />
            <Select label="Colegio de procedencia" placeholder="Opcional" options={["I.E. 30001 Satipo", "I.E.P. San Juan", "Otro…"]} />
          </div>
        ) : tipo === "traslado" ? null : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input placeholder="Buscar por nombre, código o DNI…" iconLeft={<Ic.Search />} defaultValue="María Quispe" />
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "1.5px solid var(--border-brand)", borderRadius: "var(--radius-lg)", background: "var(--surface-brand-soft)" }}>
              <Avatar name="María Quispe Roca" color="var(--blue-500)" />
              <div style={{ flex: 1 }}>
                <div style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>María Quispe Roca</div>
                <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>E-1042 · DNI 70 481 559 · 2025: 2° A Primaria · Promovida a 3°</div>
              </div>
              <Badge tone="success" dot>Sin deuda</Badge>
              <Badge tone="brand">Pre-matrícula</Badge>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* Paso 2 — Apoderados */
  function StepGuardians() {
    const [nuevo, setNuevo] = React.useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">Un estudiante puede tener varios apoderados, y un apoderado varios hijos matriculados. El <b>contacto principal</b> recibe las notificaciones de pago.</Alert>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--surface-card)" }}>
          <Avatar name="Juana Roca Pérez" color="var(--gold-500)" />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>Juana Roca Pérez</span>
              <Badge tone="accent" size="sm">Contacto principal</Badge>
            </div>
            <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Madre · DNI 41 220 876 · 964 221 880 · 2 hijos en la institución</div>
          </div>
          <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => notify("info", "Editar apoderado", "Los datos del apoderado se editan en su módulo; aquí solo la relación.")}><Ic.Pencil /></IconButton></Tooltip>
          <Tooltip content="Quitar"><IconButton label="Quitar" size="sm" variant="danger" onClick={() => notify("warning", "Apoderado desvinculado", "Juana Roca Pérez ya no está vinculada a esta matrícula.")}><Ic.Trash /></IconButton></Tooltip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 12, alignItems: "flex-end", padding: "14px 16px", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)" }}>
          <Input label="Vincular apoderado existente" placeholder="Buscar por DNI o nombre…" iconLeft={<Ic.Search />} />
          <Select label="Relación" placeholder="Seleccione" options={["Madre", "Padre", "Abuelo/a", "Tío/a", "Tutor legal"]} />
          <Button variant="secondary" iconLeft={<Ic.Plus />} onClick={() => notify("success", "Apoderado vinculado", "Óscar Ramos Díaz (Padre) vinculado a la matrícula.")}>Vincular</Button>
        </div>
        <Button variant="ghost" iconLeft={<Ic.Plus />} style={{ alignSelf: "flex-start" }} onClick={() => setNuevo(true)}>Registrar apoderado nuevo</Button>

        <Dialog open={nuevo} onClose={() => setNuevo(false)} title="Registrar apoderado nuevo" icon={<Ic.Users />}
          description="Quedará vinculado a esta matrícula"
          footer={<><Button variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setNuevo(false); notify("success", "Apoderado registrado", "Vinculado a la matrícula como contacto secundario."); }}>Registrar y vincular</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Nombres y apellidos" required placeholder="Ej. Óscar Ramos Díaz" containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="DNI" required placeholder="00000000" />
            <Select label="Relación" options={["Madre", "Padre", "Abuelo/a", "Tío/a", "Tutor legal"]} placeholder="Seleccione" required />
            <Input label="Teléfono (WhatsApp)" required placeholder="9__ ___ ___" />
            <Input label="Correo" type="email" placeholder="opcional" />
          </div>
        </Dialog>
      </div>
    );
  }

  /* Paso 3 — Ubicación */
  function StepPlacement({ seccion, setSeccion }) {
    const SECC = [
      { id: "A", tutor: "Pedro Gómez", turno: "Mañana", mat: 30, cap: 30 },
      { id: "B", tutor: "Lucía Díaz", turno: "Mañana", mat: 22, cap: 30 },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <Select label="Nivel" options={["Inicial", "Primaria", "Secundaria"]} defaultValue="Primaria" />
          <Select label="Grado" options={["1°", "2°", "3°", "4°", "5°", "6°"]} defaultValue="3°" />
          <Select label="Año académico" options={["2026"]} defaultValue="2026" disabled />
        </div>
        <div>
          <div style={{ font: "var(--type-label)", color: "var(--text-strong)", marginBottom: 8 }}>Sección <span style={{ color: "var(--danger)" }}>*</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {SECC.map((s) => {
              const full = s.mat >= s.cap;
              const sel = seccion === s.id;
              return (
                <div key={s.id} onClick={() => !full && setSeccion(s.id)}
                  style={{
                    display: "flex", flexDirection: "column", gap: 10, padding: "14px 16px", borderRadius: "var(--radius-lg)", cursor: full ? "not-allowed" : "pointer",
                    border: sel ? "1.5px solid var(--border-brand)" : "1px solid var(--border-default)",
                    background: sel ? "var(--surface-brand-soft)" : "var(--surface-card)", opacity: full ? 0.55 : 1,
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ font: "var(--type-h3)", color: "var(--text-strong)" }}>Sección {s.id}</span>
                    <Badge tone="info">{s.turno}</Badge>
                    <span style={{ flex: 1 }}></span>
                    {full ? <Badge tone="danger" dot>Llena</Badge> : sel ? <Badge tone="brand" dot>Seleccionada</Badge> : <Badge tone="success" dot>{s.cap - s.mat} vacantes</Badge>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, font: "var(--type-caption)", color: "var(--text-muted)" }}>
                    <Avatar name={s.tutor} size="xs" /> Tutor: {s.tutor}
                  </div>
                  <ProgressBar value={s.mat} max={s.cap} size="sm" tone={full ? "danger" : "brand"} showValue valueFormat={(v, m) => `${v}/${m}`} />
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ font: "var(--type-label)", color: "var(--text-strong)", marginBottom: 8 }}>Programas complementarios <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", fontWeight: 400 }}>(opcional, con tarifa propia)</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Checkbox label="Taller de Danza — S/ 60.00 /mes" description="Sábados 9:00–11:00 · 4 vacantes" defaultChecked />
            <Checkbox label="Reforzamiento de Matemática — S/ 80.00 /mes" description="Lun y Mié 15:30–17:00" />
          </div>
        </div>
      </div>
    );
  }

  /* Paso 4 — Tarifa y cronograma */
  function StepFees({ desc, setDesc, tipo }) {
    const traslado = tipo === "traslado";
    const cuotas = [];
    const MESES = traslado
      ? ["Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
      : ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const base = 280, taller = 60;
    const factor = desc === "herm" ? 0.9 : desc === "beca50" ? 0.5 : 1;
    MESES.forEach((m, i) => cuotas.push({ concepto: `Pensión ${m}`, vence: traslado ? `30/${String(i + 8).padStart(2, "0")}` : `${String(31 - (i % 2)).padStart(2, "0")}/${String(i + 3).padStart(2, "0")}`, monto: (base * factor + taller).toFixed(2) }));
    const cols = [
      { key: "concepto", header: "Concepto" },
      { key: "vence", header: "Vence", mono: true, align: "center", width: 110 },
      { key: "monto", header: "Monto", num: true, mono: true, render: (v) => `S/ ${v}` },
    ];
    const total = (250 + cuotas.reduce((a, c) => a + parseFloat(c.monto), 0)).toFixed(2);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {traslado && <Alert tone="warning" title="Cronograma de traslado · ingresa 17/08">Solo se generan las pensiones de <b>Agosto a Diciembre</b> (5 cuotas). Agosto se cobra completo porque el ingreso (17/08) es antes del día de corte (<b>día 20</b> — configurable en Tarifario y becas). La matrícula se cobra completa.</Alert>}
          <Card title={traslado ? "Tarifa · Primaria 2026 (traslado)" : "Tarifa · Primaria 2026"}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Matrícula (pago único)", "S/ 250.00"], [`Pensión mensual (×${MESES.length})`, "S/ 280.00"], [`Taller de Danza (×${MESES.length})`, "S/ 60.00"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", font: "var(--type-body)" }}>
                  <span style={{ color: "var(--text-muted)" }}>{k}</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Select label="Descuento o beca" value={desc} onChange={(e) => setDesc(e.target.value)}
            options={[{ value: "no", label: "Ninguno" }, { value: "herm", label: "Descuento hermanos · −10% pensión" }, { value: "beca50", label: "Beca parcial · −50% pensión" }]} />
          {desc !== "no" && <Alert tone="success" title={desc === "herm" ? "Descuento hermanos aplicado" : "Beca parcial aplicada"}>Se aplica a las {MESES.length} pensiones, no a la matrícula ni a los programas.</Alert>}
          <div style={{ background: "var(--surface-inverse)", color: "var(--text-inverse)", borderRadius: "var(--radius-lg)", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ font: "var(--type-label)" }}>Total anual</span>
            <span style={{ font: "var(--type-h2)", fontFamily: "var(--font-mono)" }}>S/ {Number(total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <Card flush title="Cronograma de pagos" subtitle={traslado ? "Solo los meses restantes del año — 1 matrícula + 5 pensiones" : "Se genera automáticamente al matricular — 1 matrícula + 10 pensiones"}>
          <Table columns={cols} compact data={[{ concepto: "Matrícula 2026", vence: "al matricular", monto: "250.00" }, ...cuotas]} />
        </Card>
      </div>
    );
  }

  /* Paso 5 — Confirmación */
  function StepConfirm({ desc }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <FieldPair k="Estudiante" v="María Quispe Roca" strong />
          <FieldPair k="Ubicación" v="3° B · Primaria · Mañana" strong />
          <FieldPair k="Tipo de matrícula" v="Ratificación" strong />
          <FieldPair k="Apoderado principal" v="Juana Roca Pérez (Madre)" />
          <FieldPair k="Programas" v="Taller de Danza" />
          <FieldPair k="Descuento" v={desc === "herm" ? "Hermanos −10%" : desc === "beca50" ? "Beca parcial −50%" : "Ninguno"} />
        </div>
        <Alert tone="info" title="Al confirmar se generará:">
          N° de matrícula <b>M-2026-0483</b> · cronograma de 11 pagos (S/ 250.00 de matrícula + 10 pensiones) · la ficha única de matrícula lista para imprimir · notificación al apoderado principal.
        </Alert>
        <Checkbox label="Declaro que los datos consignados son correctos" description="El apoderado firmará la ficha impresa" />
      </div>
    );
  }

  /* Success */
  function Success({ onExit, onAgain }) {
    return (
      <Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, padding: "34px 20px" }}>
          <span style={{ width: 62, height: 62, borderRadius: 99, background: "var(--success-soft)", color: "var(--success)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}><Ic.Check /></span>
          <div style={{ font: "var(--type-h2)", color: "var(--text-strong)", marginTop: 6 }}>Matrícula M-2026-0483 registrada</div>
          <div style={{ font: "var(--type-body-md)", color: "var(--text-muted)", maxWidth: 460 }}>María Quispe Roca quedó matriculada en 3° B Primaria. El cronograma de 11 pagos fue generado y se notificó a Juana Roca Pérez.</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("info", "Imprimiendo", "Ficha única de matrícula M-2026-0483 enviada a la impresora.")}>Imprimir ficha</Button>
            <Button variant="accent" iconLeft={<Ic.Cash />} onClick={() => { goTo("caja"); notify("info", "Caja", "Cobro de matrícula de María Quispe Roca preparado (S/ 250.00)."); }}>Cobrar matrícula ahora</Button>
            <Button variant="primary" iconLeft={<Ic.Plus />} onClick={onAgain}>Nueva matrícula</Button>
          </div>
          <Button variant="link" onClick={onExit} style={{ marginTop: 8 }}>Volver al listado</Button>
        </div>
      </Card>
    );
  }

  /* ------------------------------ wizard shell ------------------------------ */
  function Wizard({ onExit }) {
    const [step, setStep] = React.useState(0);
    const [tipo, setTipo] = React.useState("exist");
    const [seccion, setSeccion] = React.useState("B");
    const [desc, setDesc] = React.useState("herm");
    const [done, setDone] = React.useState(false);
    if (done) return <Success onExit={onExit} onAgain={() => { setDone(false); setStep(0); }} />;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Button variant="ghost" size="sm" onClick={onExit}>← Volver al listado</Button>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Nueva matrícula · Año académico 2026</span>
        </div>
        <Card flush>
          <Stepper step={step} />
          <div style={{ padding: 22 }}>
            {step === 0 && <StepStudent tipo={tipo} setTipo={setTipo} />}
            {step === 1 && <StepGuardians />}
            {step === 2 && <StepPlacement seccion={seccion} setSeccion={setSeccion} />}
            {step === 3 && <StepFees desc={desc} setDesc={setDesc} tipo={tipo} />}
            {step === 4 && <StepConfirm desc={desc} />}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-sunken)" }}>
            <Button variant="secondary" onClick={step === 0 ? onExit : () => setStep(s => s - 1)}>{step === 0 ? "Cancelar" : "Atrás"}</Button>
            {step < 4
              ? <Button variant="primary" iconRight={<Ic.ArrowRight />} onClick={() => setStep(s => s + 1)}>Siguiente</Button>
              : <Button variant="accent" iconLeft={<Ic.Check />} onClick={() => setDone(true)}>Matricular y generar cronograma</Button>}
          </div>
        </Card>
      </div>
    );
  }

  window.SGE_Enrollment = function Enrollment() {
    const [mode, setMode] = React.useState("list");
    return mode === "list" ? <EnrollList onNew={() => setMode("wizard")} /> : <Wizard onExit={() => setMode("list")} />;
  };
})();
