/* Elohim SGE — Portal Docente. Registers window.SGE_TeacherHome y window.SGE_TeacherAttendance. */
(function () {
  const { Card, Badge, Avatar, Button, Select, Input, StatCard, Alert, ProgressBar } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);

  const CLASES_HOY = [
    { hora: "7:45–9:15", curso: "Matemática", aula: "3° A Primaria", n: 30, tomada: true },
    { hora: "9:30–11:00", curso: "Matemática", aula: "3° B Primaria", n: 22, tomada: false },
    { hora: "11:15–12:45", curso: "Raz. Matemático", aula: "4° A Primaria", n: 26, tomada: false },
  ];

  /* ------------------------------ home ------------------------------ */
  window.SGE_TeacherHome = function TeacherHome() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name="Pedro Gómez Silva" size="lg" color="var(--blue-500)" />
            <div style={{ flex: 1 }}>
              <div style={{ font: "var(--type-h3)", color: "var(--text-strong)" }}>Buenos días, Prof. Pedro</div>
              <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Martes 07/07/2026 · 3 clases hoy · Tutor de 3° A Primaria</div>
            </div>
            <Badge tone="brand">Bimestre II</Badge>
          </div>
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <StatCard label="Mis estudiantes" value="78" icon={<Ic.Users />} caption="3 secciones" />
          <StatCard label="Asistencia tomada" value="1/3" iconTone="accent" icon={<Ic.Calendar />} caption="clases de hoy" />
          <StatCard label="Notas del bimestre" value="64%" iconTone="success" icon={<Ic.Book />} caption="registradas" />
        </div>
        <Card flush title="Mis clases de hoy" subtitle="Marca la asistencia al iniciar cada clase">
          <div>
            {CLASES_HOY.map((c) => (
              <div key={c.hora} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", color: "var(--text-muted)", width: 92 }}>{c.hora}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>{c.curso}</div>
                  <div style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{c.aula} · {c.n} estudiantes</div>
                </div>
                {c.tomada
                  ? <Badge tone="success" dot>Asistencia tomada</Badge>
                  : <Button size="sm" variant="primary" iconLeft={<Ic.Check />} onClick={() => { goTo("tasist"); notify("info", "Asistencia", `${c.curso} · ${c.aula} lista para marcar.`); }}>Marcar asistencia</Button>}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Avance de notas · Bimestre II" subtitle="Matemática">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["3° A Primaria", 100], ["3° B Primaria", 68], ["4° A Primaria", 24]].map(([s, v]) => (
              <ProgressBar key={s} label={s} value={v} showValue size="sm" tone={v === 100 ? "success" : v > 50 ? "brand" : "warning"} />
            ))}
            <Button variant="secondary" size="sm" iconLeft={<Ic.Book />} style={{ alignSelf: "flex-start" }} onClick={() => goTo("notas")}>Ir al registro de notas</Button>
          </div>
        </Card>
      </div>
    );
  };

  /* ------------------------------ asistencia de estudiantes ------------------------------ */
  const ESTADOS = [
    { k: "P", label: "Presente", color: "var(--success)" },
    { k: "T", label: "Tardanza", color: "var(--warning)" },
    { k: "F", label: "Falta", color: "var(--danger)" },
    { k: "J", label: "Justificada", color: "var(--info)" },
  ];
  const ALUMNOS = ["Camacho Ríos, Alba", "Cárdenas Paz, Bruno", "Espinoza Lara, Caleb", "Flores Ñahui, Dana", "García Solís, Eloy", "Huamán Cruz, Fabia", "Lima Vega, Gino", "Mendoza Roca, Hilda", "Paredes Luna, Iván", "Quispe Roca, María", "Ramos Díaz, Noé", "Salas Torres, Olga"];

  window.SGE_TeacherAttendance = function TeacherAttendance() {
    const [marcas, setMarcas] = React.useState(() => ALUMNOS.map(() => "P"));
    const set = (i, k) => setMarcas((m) => m.map((x, j) => (j === i ? k : x)));
    const counts = ESTADOS.map((e) => marcas.filter((m) => m === e.k).length);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Select label="Clase" options={["Matemática · 3° B Primaria", "Matemática · 3° A Primaria", "Raz. Matemático · 4° A Primaria"]} defaultValue="Matemática · 3° B Primaria" containerStyle={{ width: 280 }} />
          <Input label="Fecha" type="date" defaultValue="2026-07-07" containerStyle={{ width: 165 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Check />} onClick={() => { setMarcas(ALUMNOS.map(() => "P")); notify("info", "Todos presentes", "Ajusta solo las excepciones y guarda."); }}>Todos presentes</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => notify("success", "Asistencia guardada", `Matemática · 3° B · ${counts[0]} presentes, ${counts[1]} tardanzas, ${counts[2]} faltas, ${counts[3]} justificadas.`)}>Guardar asistencia</Button>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ESTADOS.map((e, i) => (
            <Badge key={e.k} tone={e.k === "P" ? "success" : e.k === "T" ? "warning" : e.k === "F" ? "danger" : "info"} dot>{e.label}: {counts[i]}</Badge>
          ))}
        </div>
        <Card flush title="Matemática · 3° B Primaria" subtitle="Martes 07/07/2026 · 9:30–11:00">
          <div>
            {ALUMNOS.map((a, i) => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ font: "var(--type-2xs)", fontFamily: "var(--font-mono)", color: "var(--text-subtle)", width: 20, textAlign: "right" }}>{i + 1}</span>
                <Avatar name={a} size="sm" />
                <span style={{ flex: 1, font: "var(--type-label)", color: "var(--text-strong)" }}>{a}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {ESTADOS.map((e) => {
                    const on = marcas[i] === e.k;
                    return (
                      <button key={e.k} type="button" title={e.label} onClick={() => set(i, e.k)}
                        style={{
                          width: 32, height: 32, borderRadius: "var(--radius-full)", cursor: "pointer",
                          font: "var(--type-label)", fontWeight: 700, lineHeight: 1,
                          border: on ? `1.5px solid ${e.color}` : "1px solid var(--border-default)",
                          background: on ? e.color : "var(--surface-card)",
                          color: on ? "#fff" : "var(--text-muted)",
                          transition: "background var(--duration-fast), color var(--duration-fast), border-color var(--duration-fast)",
                        }}>{e.k}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Alert tone="info">La asistencia guardada notifica automáticamente al apoderado en caso de <b>falta</b> (según Configuración → Notificaciones).</Alert>
      </div>
    );
  };
})();
