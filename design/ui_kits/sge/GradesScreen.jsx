/* Elohim SGE — Notas / Calificaciones. Registers window.SGE_Grades. */
(function () {
  const { Card, Table, Avatar, Badge, Button, Select, Input, Tabs, ProgressBar, Tooltip, IconButton, Alert } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const STUDENTS = [
    ["María Quispe Roca", "AD", "A", "AD", "var(--blue-500)"],
    ["José Ramos Lía", "A", "B", "A", "var(--gold-500)"],
    ["Ana Flores Mendoza", "A", "AD", "A", "var(--green-500)"],
    ["Luis Paz Cárdenas", "B", "B", "C", "var(--brown-400)"],
    ["Rosa Lima Vega", "AD", "AD", "AD", "var(--blue-400)"],
    ["Hugo Vela Soto", "B", "A", "B", "var(--blue-600)"],
  ];

  const LETRAS = ["AD", "A", "B", "C"];
  const VAL = { AD: 4, A: 3, B: 2, C: 1 };
  const letraColor = (v) => v === "AD" ? "var(--success)" : v === "A" ? "var(--brand)" : v === "B" ? "var(--gold-500)" : "var(--danger)";

  function NotaInput({ value }) {
    const [v, setV] = React.useState(value);
    return (
      <select value={v} onChange={(e) => setV(e.target.value)}
        style={{
          width: 58, height: 34, textAlign: "center", border: `1.5px solid ${letraColor(v)}`, borderRadius: "var(--radius-md)",
          font: "var(--type-mono)", fontWeight: 600, color: "var(--text-strong)", background: "var(--surface-card)", outline: "none", cursor: "pointer",
        }}>
        {LETRAS.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
    );
  }

  function RegistroNotas() {
    const [curso, setCurso] = React.useState("mat");
    const cols = [
      { key: "n", header: "N°", align: "center", width: 44, mono: true, render: (_, __, i) => i + 1 },
      { key: "est", header: "Estudiante", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "c1", header: "C1", align: "center", render: (v) => <NotaInput value={v} /> },
      { key: "c2", header: "C2", align: "center", render: (v) => <NotaInput value={v} /> },
      { key: "c3", header: "C3", align: "center", render: (v) => <NotaInput value={v} /> },
      { key: "prom", header: "Logro del bimestre", align: "center", render: (_, r) => {
        const p = Math.round((VAL[r.c1] + VAL[r.c2] + VAL[r.c3]) / 3);
        const letra = ["C", "B", "A", "AD"][p - 1] || "C";
        return <Badge tone={letra === "AD" ? "success" : letra === "A" ? "brand" : letra === "B" ? "warning" : "danger"} solid={letra === "AD"}>{letra}</Badge>;
      } },
      { key: "estado", header: "Condición", align: "center", render: (_, r) => {
        const p = (VAL[r.c1] + VAL[r.c2] + VAL[r.c3]) / 3;
        return <span style={{ font: "var(--type-label)", color: p >= 2.5 ? "var(--success)" : p >= 1.5 ? "var(--warning-soft-fg)" : "var(--danger)" }}>{p >= 2.5 ? "Logrado" : p >= 1.5 ? "En proceso" : "En inicio"}</span>;
      } },
    ];
    const rows = STUDENTS.map((s) => ({ est: s[0], c1: s[1], c2: s[2], c3: s[3], color: s[4] }));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Select label="Grado y sección" options={["3° A Primaria", "3° B Primaria", "4° A Primaria"]} containerStyle={{ width: 200 }} />
          <Select label="Periodo" options={["Bimestre I", "Bimestre II", "Bimestre III", "Bimestre IV"]} defaultValue="Bimestre II" containerStyle={{ width: 170 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Acta exportada", "Acta de Matemática · 3° A · Bimestre II descargada en Excel.")}>Exportar acta</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => notify("success", "Notas guardadas", "Matemática · 3° A · Bimestre II — 6 estudiantes actualizados.")}>Guardar notas</Button>
        </div>

        <Card flush>
          <div style={{ padding: "0 16px", borderBottom: "1px solid var(--border-subtle)" }}>
            <Tabs value={curso} onChange={setCurso} items={[
              { id: "mat", label: "Matemática" },
              { id: "com", label: "Comunicación" },
              { id: "cyt", label: "Ciencia y Tecnología" },
              { id: "per", label: "Personal Social" },
              { id: "rel", label: "Educación Religiosa" },
            ]} />
          </div>
          <Table columns={cols} data={rows} hover />
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Escala literal · AD Logro destacado · A Logrado · B En proceso · C En inicio</span>
            <div style={{ width: 220 }}>
              <ProgressBar label="Notas registradas" value={6} max={32} showValue size="sm" tone="brand"
                valueFormat={(v, m) => `${v}/${m}`} />
            </div>
          </div>
        </Card>
      </div>
    );
  };
  /* ------------------------------ Libreta ------------------------------ */
  const LIBRETA_EST = {
    prim: {
      nombre: "María Quispe Roca", ubic: "3° B Primaria", cod: "E-1042", nivel: "Primaria", tutor: "Lucía Díaz",
      cursos: [["Matemática", "A", "AD"], ["Comunicación", "AD", "AD"], ["Ciencia y Tecnología", "A", "A"], ["Personal Social", "A", "A"], ["Inglés", "B", "A"], ["Educación Física", "AD", "AD"], ["Arte y Cultura", "A", "A"], ["Educación Religiosa", "AD", "AD"]],
    },
    sec: {
      nombre: "Ana Flores Mendoza", ubic: "1° A Secundaria", cod: "E-1051", nivel: "Secundaria", tutor: "Iris Quinto",
      cursos: [["Matemática", "A", "A"], ["Comunicación", "A", "A"], ["Ciencia y Tecnología", "A", "AD"], ["Ciencias Sociales", "B", "A"], ["DPCC", "A", "A"], ["Inglés", "B", "B"], ["Educación Física", "AD", "AD"], ["Arte y Cultura", "A", "A"], ["Educación Religiosa", "AD", "AD"], ["Educación para el Trabajo", "B", "A"]],
    },
  };
  const FORMATIVOS = [["Comportamiento", "A", "AD"], ["Uniformidad", "A", "A"], ["Puntualidad", "B", "A"]];
  const APODERADO_CRIT = [["Asiste a reuniones", "AD", "AD"], ["Acompañamiento en casa", "A", "A"], ["Comunicación con el tutor", "B", "A"]];

  function NotaChip({ v }) {
    const tone = v === "AD" ? "success" : v === "A" ? "brand" : v === "B" ? "warning" : "danger";
    return <Badge tone={tone} solid={v === "AD"}>{v}</Badge>;
  }

  function Libreta() {
    const [who, setWho] = React.useState("prim");
    const e = LIBRETA_EST[who];
    const notaCols = [
      { key: "n", header: "Curso / criterio", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "b1", header: "Bim. I", align: "center", render: (v) => <NotaChip v={v} /> },
      { key: "b2", header: "Bim. II", align: "center", render: (v) => <NotaChip v={v} /> },
      { key: "b3", header: "Bim. III", align: "center", render: () => <span style={{ color: "var(--text-subtle)" }}>—</span> },
      { key: "b4", header: "Bim. IV", align: "center", render: () => <span style={{ color: "var(--text-subtle)" }}>—</span> },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Select label="Estudiante" options={[{ value: "prim", label: "María Quispe Roca · 3° B Primaria" }, { value: "sec", label: "Ana Flores Mendoza · 1° A Secundaria" }]}
            value={who} onChange={(ev) => setWho(ev.target.value)} containerStyle={{ width: 300 }} />
          <Select label="Periodo" options={["Bimestre II · 2026", "Bimestre I · 2026"]} defaultValue="Bimestre II · 2026" containerStyle={{ width: 180 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Libreta exportada", `${e.nombre} · Bimestre II en PDF, lista para imprimir.`)}>Imprimir / PDF</Button>
          <Button variant="primary" iconLeft={<Ic.Mail />} onClick={() => notify("success", "Libreta enviada", "El apoderado la recibirá por WhatsApp y correo.")}>Enviar al apoderado</Button>
        </div>
        <Alert tone="info">La libreta se arma sola: <b>cursos</b> desde el plan de estudios del grado, <b>aspectos formativos</b> y <b>evaluación del apoderado</b> desde Configuración → Evaluación. Toda la calificación es en <b>escala literal AD/A/B/C</b>, en todos los niveles.</Alert>

        <Card flush>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
            <img src="../../assets/elohim-insignia.png" alt="" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <div style={{ flex: 1 }}>
              <div style={{ font: "var(--type-label)", fontWeight: 700, color: "var(--text-strong)" }}>I.E.P. Elohim — Libreta de calificaciones · 2026</div>
              <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{e.nombre} · {e.cod} · {e.ubic} · Tutor(a): {e.tutor}</div>
            </div>
            <Badge tone="brand">Bimestre II</Badge>
          </div>
          <Table columns={notaCols} data={e.cursos.map((c) => ({ n: c[0], b1: c[1], b2: c[2] }))} compact />
          <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-sunken)" }}>
            <span className="eyebrow">Aspectos formativos · califica el tutor · escala AD/A/B/C</span>
          </div>
          <Table columns={notaCols} data={FORMATIVOS.map((c) => ({ n: c[0], b1: c[1], b2: c[2] }))} compact />
          <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border-subtle)", background: "var(--surface-sunken)" }}>
            <span className="eyebrow">Evaluación del apoderado · registra el tutor · escala AD/A/B/C</span>
          </div>
          <Table columns={notaCols} data={APODERADO_CRIT.map((c) => ({ n: c[0], b1: c[1], b2: c[2] }))} compact />
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--text-muted)" }}>
            <span>AD Logro destacado · A Logrado · B En proceso · C En inicio</span>
            <span>Asistencia del bimestre: 96% · 2 tardanzas</span>
          </div>
        </Card>
      </div>
    );
  }

  window.SGE_Grades = function Grades() {
    const [vista, setVista] = React.useState("registro");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={vista} onChange={setVista} items={[
          { id: "registro", label: "Registro de notas" },
          { id: "libretas", label: "Libretas" },
        ]} />
        {vista === "registro" ? <RegistroNotas /> : <Libreta />}
      </div>
    );
  };
})();
