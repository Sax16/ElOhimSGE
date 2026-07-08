/* Elohim SGE — Estructura académica. Registers window.SGE_Structure.
   Tabs: Estructura (árbol Nivel→Grado→Sección) · Plan de estudios · Programas · Periodos.
   Todas las acciones (nuevo nivel/grado/sección, editar, ver estudiantes, cursos,
   programas) abren formularios funcionales que mutan el estado del prototipo. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Select, Input, Tabs, ProgressBar, Dialog, Alert, Tooltip, Checkbox, RadioGroup, Radio, EmptyState } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;

  /* ------------------------------ sample data ------------------------------ */
  const NIVELES_INIT = [
    { id: "ini", nombre: "Inicial", rango: "3–5 años", color: "var(--gold-500)", soft: "var(--surface-accent-soft)", grados: [
      { nombre: "3 años", secciones: [ { n: "Los Pollitos", turno: "M", cap: 20, mat: 17, tutor: "Rosa Lima", aux: "Betty Salazar" } ] },
      { nombre: "4 años", secciones: [ { n: "Los Girasoles", turno: "M", cap: 22, mat: 21, tutor: "Carmen Ríos", aux: "Delia Poma" } ] },
      { nombre: "5 años", secciones: [
        { n: "Las Estrellitas", turno: "M", cap: 24, mat: 24, tutor: "Julia Vega", aux: "Betty Salazar" },
        { n: "Los Delfines", turno: "M", cap: 24, mat: 15, tutor: "Nora Paz", aux: null } ] },
    ]},
    { id: "pri", nombre: "Primaria", rango: "1° – 6°", color: "var(--blue-500)", soft: "var(--surface-brand-soft)", grados: [
      { nombre: "1°", secciones: [
        { n: "A", turno: "M", cap: 30, mat: 28, tutor: "Elsa Campos", aux: "Marta Quispe" },
        { n: "B", turno: "T", cap: 30, mat: 19, tutor: "Iván Rojas", aux: null } ] },
      { nombre: "2°", secciones: [ { n: "A", turno: "M", cap: 30, mat: 27, tutor: "María Salas" } ] },
      { nombre: "3°", secciones: [
        { n: "A", turno: "M", cap: 30, mat: 30, tutor: "Pedro Gómez" },
        { n: "B", turno: "M", cap: 30, mat: 22, tutor: "Lucía Díaz" } ] },
      { nombre: "4°", secciones: [ { n: "A", turno: "M", cap: 32, mat: 26, tutor: "Raúl Meza" } ] },
      { nombre: "5°", secciones: [ { n: "A", turno: "M", cap: 32, mat: 29, tutor: "Ana Torres" } ] },
      { nombre: "6°", secciones: [ { n: "A", turno: "M", cap: 32, mat: 31, tutor: "Jorge Luna" } ] },
    ]},
    { id: "sec", nombre: "Secundaria", rango: "1° – 5°", color: "var(--green-500)", soft: "var(--success-soft)", grados: [
      { nombre: "1°", secciones: [ { n: "A", turno: "M", cap: 35, mat: 33, tutor: "Iris Quinto" } ] },
      { nombre: "2°", secciones: [ { n: "A", turno: "M", cap: 35, mat: 30, tutor: "Saúl Ramos" } ] },
      { nombre: "3°", secciones: [ { n: "A", turno: "M", cap: 35, mat: 34, tutor: "Delia Cano" } ] },
      { nombre: "4°", secciones: [ { n: "A", turno: "M", cap: 35, mat: 27, tutor: "Mario Silva" } ] },
      { nombre: "5°", secciones: [ { n: "A", turno: "M", cap: 35, mat: 25, tutor: "Rita Flores" } ] },
    ]},
  ];

  const TUTORES = ["Rosa Lima", "Carmen Ríos", "Julia Vega", "Nora Paz", "Elsa Campos", "Iván Rojas", "María Salas", "Pedro Gómez", "Lucía Díaz", "Raúl Meza", "Ana Torres", "Jorge Luna", "Iris Quinto", "Saúl Ramos", "Delia Cano", "Mario Silva", "Rita Flores", "— Sin asignar —"];
  const DOCENTES = TUTORES.slice(0, -1);
  const AUXILIARES = ["— Sin auxiliar —", "Betty Salazar", "Delia Poma", "Marta Quispe", "Sofía Rivas"];

  const CURSOS_INIT = [
    { curso: "Matemática", horas: 6, doc: "Pedro Gómez" },
    { curso: "Comunicación", horas: 6, doc: "Lucía Díaz" },
    { curso: "Ciencia y Tecnología", horas: 4, doc: "Raúl Meza" },
    { curso: "Personal Social", horas: 3, doc: "Ana Torres" },
    { curso: "Inglés", horas: 3, doc: "Iris Quinto" },
    { curso: "Educación Física", horas: 2, doc: "Saúl Ramos" },
    { curso: "Arte y Cultura", horas: 2, doc: "Nora Paz" },
    { curso: "Educación Religiosa", horas: 2, doc: "Delia Cano" },
  ];

  const PROGRAMAS_INIT = [
    { nombre: "Taller de Danza", tipo: "Taller", dia: "Sáb 9:00–11:00", tarifa: "60.00", cap: 25, mat: 21, estado: "Activo" },
    { nombre: "Taller de Música", tipo: "Taller", dia: "Vie 15:30–17:00", tarifa: "70.00", cap: 20, mat: 14, estado: "Activo" },
    { nombre: "Reforzamiento · Matemática", tipo: "Reforzamiento", dia: "Lun y Mié 15:30–17:00", tarifa: "80.00", cap: 30, mat: 26, estado: "Activo" },
    { nombre: "Academia Pre (verano)", tipo: "Academia", dia: "Ene–Feb · L a V", tarifa: "150.00", cap: 40, mat: 0, estado: "Cerrado" },
  ];

  const PERIODOS = [
    { n: "Bimestre I", ini: "09/03", fin: "15/05", estado: "Cerrado", avance: 100 },
    { n: "Bimestre II", ini: "18/05", fin: "24/07", estado: "En curso", avance: 78 },
    { n: "Bimestre III", ini: "10/08", fin: "16/10", estado: "Próximo", avance: 0 },
    { n: "Bimestre IV", ini: "19/10", fin: "18/12", estado: "Próximo", avance: 0 },
  ];

  const ALUMNOS = ["Quispe Roca, María", "Ramos Lía, José", "Flores Mendoza, Ana", "Paz Cárdenas, Luis", "Lima Vega, Rosa", "Vela Soto, Hugo", "Ríos Paz, Carmen", "Ñahui Cruz, Diego", "Salas Cruz, Piero", "Núñez Ríos, Carla", "Torres Vila, Sara", "Campos Luna, Iván"];

  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);

  /* ------------------------------ shared bits ------------------------------ */
  function VacBar({ mat, cap }) {
    const pct = (mat / cap) * 100;
    const tone = pct >= 100 ? "danger" : pct >= 85 ? "warning" : "success";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 170 }}>
        <div style={{ flex: 1 }}><ProgressBar value={mat} max={cap} tone={tone} size="sm" /></div>
        <span style={{ font: "var(--type-mono)", fontSize: "var(--text-xs)", color: pct >= 100 ? "var(--danger)" : "var(--text-muted)", whiteSpace: "nowrap" }}>{mat}/{cap}</span>
      </div>
    );
  }

  /* ------------------------------ dialogs ------------------------------ */
  function NivelDialog({ open, onClose, onSave }) {
    const [nombre, setNombre] = React.useState("");
    const [rango, setRango] = React.useState("");
    React.useEffect(() => { if (open) { setNombre(""); setRango(""); } }, [open]);
    return (
      <Dialog open={open} onClose={onClose} title="Nuevo nivel académico" icon={<Ic.Layers />}
        description="Ej. Academia, CEBA, Talleres de verano"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} disabled={!nombre.trim()}
            onClick={() => { onSave({ nombre: nombre.trim(), rango: rango.trim() || "—" }); onClose(); }}>Crear nivel</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <Input label="Nombre del nivel" placeholder="Ej. Academia Pre" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input label="Rango o descripción" placeholder="Ej. 1° – 5° / 12–16 años" value={rango} onChange={(e) => setRango(e.target.value)} hint="Se muestra junto al nombre del nivel" />
        </div>
      </Dialog>
    );
  }

  function GradoDialog({ ctx, onClose, onSave }) {
    const [nombre, setNombre] = React.useState("");
    React.useEffect(() => { if (ctx) setNombre(""); }, [ctx]);
    return (
      <Dialog open={!!ctx} onClose={onClose} title={`Nuevo grado · ${ctx ? ctx.nivel.nombre : ""}`} icon={<Ic.Layers />}
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} disabled={!nombre.trim()}
            onClick={() => { onSave(nombre.trim()); onClose(); }}>Crear grado</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <Input label="Nombre del grado" placeholder={ctx && ctx.nivel.id === "ini" ? "Ej. 4 años" : "Ej. 4°"} required
            value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Alert tone="info">El grado se crea sin secciones — agrégalas desde el árbol. El plan de estudios se define en su pestaña.</Alert>
        </div>
      </Dialog>
    );
  }

  function SeccionDialog({ ctx, onClose, onSave }) {
    // ctx: { nivel, grado, seccion? (edit), idx? }
    const edit = ctx && ctx.seccion;
    const inicial = ctx && ctx.nivel.id === "ini";
    const [n, setN] = React.useState("");
    const [turno, setTurno] = React.useState("M");
    const [cap, setCap] = React.useState("30");
    const [tutor, setTutor] = React.useState("— Sin asignar —");
    const [aux, setAux] = React.useState("— Sin auxiliar —");
    React.useEffect(() => {
      if (!ctx) return;
      setN(edit ? ctx.seccion.n : "");
      setTurno(edit ? ctx.seccion.turno : "M");
      setCap(edit ? String(ctx.seccion.cap) : "30");
      setTutor(edit ? ctx.seccion.tutor : "— Sin asignar —");
      setAux(edit ? (ctx.seccion.aux || "— Sin auxiliar —") : "— Sin auxiliar —");
    }, [ctx]);
    return (
      <Dialog open={!!ctx} onClose={onClose}
        title={edit ? `Editar sección · ${ctx.grado.nombre} ${ctx.seccion.n}` : `Nueva sección · ${ctx ? `${ctx.nivel.nombre} ${ctx.grado.nombre}` : ""}`}
        icon={<Ic.Users />}
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} disabled={!n.trim() || !(parseInt(cap, 10) > 0)}
            onClick={() => { onSave({ n: n.trim(), turno, cap: parseInt(cap, 10), tutor, aux: aux === "— Sin auxiliar —" ? null : aux }); onClose(); }}>
            {edit ? "Guardar cambios" : "Crear sección"}</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label={inicial ? "Nombre de la sección" : "Letra de la sección"} placeholder={inicial ? "Ej. Los Girasoles" : "Ej. C"} required
              value={n} onChange={(e) => setN(e.target.value)} hint={inicial ? "En Inicial las secciones llevan nombre" : "En Primaria/Secundaria se usan letras"} />
            <Input label="Vacantes (capacidad)" type="number" required value={cap} onChange={(e) => setCap(e.target.value)} suffix="est." />
          </div>
          <div>
            <div style={{ font: "var(--type-label)", color: "var(--text-strong)", marginBottom: 8 }}>Turno</div>
            <RadioGroup name="turno-sec" value={turno} onChange={(e) => setTurno(e.target.value)} row>
              <Radio value="M" label="Mañana" />
              <Radio value="T" label="Tarde" />
            </RadioGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Select label="Tutor de aula" options={TUTORES} value={tutor} onChange={(e) => setTutor(e.target.value)} hint="Docente responsable del aula" />
            <Select label="Auxiliar de aula" options={AUXILIARES} value={aux} onChange={(e) => setAux(e.target.value)} hint="Opcional — apoyo al tutor (usual en Inicial)" />
          </div>
          {edit && ctx.seccion.mat > parseInt(cap || 0, 10) &&
            <Alert tone="warning" title="Capacidad menor que los matriculados">Hay {ctx.seccion.mat} estudiantes; no puedes reducir por debajo de eso.</Alert>}
        </div>
      </Dialog>
    );
  }

  function EstudiantesDialog({ ctx, onClose }) {
    // ctx: { nivel, grado, seccion } — con drill-in a la ficha del estudiante
    const [q, setQ] = React.useState("");
    const [ficha, setFicha] = React.useState(null);
    React.useEffect(() => { if (ctx) { setQ(""); setFicha(null); } }, [ctx]);
    if (!ctx) return null;
    const list = ALUMNOS.slice(0, Math.min(ctx.seccion.mat, ALUMNOS.length))
      .filter((a) => a.toLowerCase().includes(q.toLowerCase()));
    const cols = [
      { key: "i", header: "N°", width: 44, align: "center", mono: true, render: (_, __, i) => i + 1 },
      { key: "nombre", header: "Estudiante", render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="xs" /><span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "estado", header: "Estado", align: "center", render: () => <Badge tone="success" dot>Activo</Badge> },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <Tooltip content="Ver ficha"><IconButton label="Ver ficha" size="sm" onClick={() => setFicha(r.nombre)}><Ic.Eye /></IconButton></Tooltip>) },
    ];
    const titulo = `${ctx.grado.nombre} ${ctx.nivel.id === "ini" ? `“${ctx.seccion.n}”` : ctx.seccion.n} ${ctx.nivel.nombre}`;

    if (ficha) {
      return (
        <Dialog open onClose={onClose} size="lg" icon={<Ic.User />}
          title={ficha} description={`Estudiante de ${titulo}`}
          footer={<>
            <Button variant="secondary" onClick={() => setFicha(null)}>← Volver a la nómina</Button>
            <Button variant="primary" iconLeft={<Ic.Eye />} onClick={() => { onClose(); goTo("est"); notify("info", "Ficha completa", `Abriendo el módulo Estudiantes con ${ficha}.`); }}>Ficha completa en Estudiantes</Button>
          </>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 6 }}>
            {[["DNI", "70 481 559"], ["Código", "E-1042"], ["Apoderado principal", "Juana Roca Pérez (Madre)"], ["Teléfono", "964 221 880"], ["Estado", "Activo · Matrícula ratificada"], ["Estado de cuenta", "Al día"], ["Programas", "Taller de Danza"], ["Asistencia del bimestre", "96% · 1 tardanza"]].map(([k, v]) => (
              <div key={k}>
                <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                <div style={{ font: "var(--type-body-md)", color: "var(--text-body)" }}>{v}</div>
              </div>
            ))}
          </div>
        </Dialog>
      );
    }

    return (
      <Dialog open onClose={onClose} size="lg" icon={<Ic.Users />}
        title={`Estudiantes · ${titulo}`}
        description={`${ctx.seccion.mat} matriculados de ${ctx.seccion.cap} vacantes · Tutor: ${ctx.seccion.tutor}${ctx.seccion.aux ? ` · Auxiliar: ${ctx.seccion.aux}` : ""}`}
        footer={<>
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Nómina exportada", `Nómina de ${titulo} descargada en Excel.`)}>Exportar nómina</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => { onClose(); goTo("matricula"); notify("info", "Nueva matrícula", `Asistente abierto con ${titulo} preseleccionado.`); }}>Matricular en esta sección</Button>
        </>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
          <Input placeholder="Buscar estudiante…" iconLeft={<Ic.Search />} value={q} onChange={(e) => setQ(e.target.value)} />
          <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 320, overflowY: "auto" }}>
            {list.length ? <Table columns={cols} data={list.map((nombre) => ({ nombre }))} compact />
              : <EmptyState size="sm" icon={<Ic.Search />} title="Sin resultados" description={`Nadie coincide con “${q}”.`} />}
          </div>
          {ctx.seccion.mat > ALUMNOS.length && <span style={{ font: "var(--type-2xs)", color: "var(--text-subtle)" }}>Mostrando {ALUMNOS.length} de {ctx.seccion.mat} (datos de ejemplo).</span>}
        </div>
      </Dialog>
    );
  }

  function CursoDialog({ ctx, onClose, onSave }) {
    // ctx: { curso? } — new or edit
    const edit = ctx && ctx.curso;
    const [curso, setCurso] = React.useState("");
    const [horas, setHoras] = React.useState("2");
    const [doc, setDoc] = React.useState(DOCENTES[0]);
    React.useEffect(() => {
      if (!ctx) return;
      setCurso(edit ? ctx.curso.curso : "");
      setHoras(edit ? String(ctx.curso.horas) : "2");
      setDoc(edit ? ctx.curso.doc : DOCENTES[0]);
    }, [ctx]);
    return (
      <Dialog open={!!ctx} onClose={onClose} title={edit ? `Editar curso · ${ctx.curso.curso}` : "Agregar curso"} icon={<Ic.Book />}
        description="Primaria · 3°"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} disabled={!curso.trim() || !(parseInt(horas, 10) > 0)}
            onClick={() => { onSave({ curso: curso.trim(), horas: parseInt(horas, 10), doc }); onClose(); }}>
            {edit ? "Guardar cambios" : "Agregar curso"}</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <Input label="Nombre del curso / área" placeholder="Ej. Computación" required value={curso} onChange={(e) => setCurso(e.target.value)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 14 }}>
            <Input label="Horas semanales" type="number" value={horas} onChange={(e) => setHoras(e.target.value)} suffix="h" />
            <Select label="Docente asignado" options={DOCENTES} value={doc} onChange={(e) => setDoc(e.target.value)} />
          </div>
        </div>
      </Dialog>
    );
  }

  function CopiarPlanDialog({ open, onClose, onCopy }) {
    return (
      <Dialog open={open} onClose={onClose} title="Copiar plan de otro grado" icon={<Ic.Copy />}
        description="Trae los cursos y horas; los docentes se reasignan después"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Copy />} onClick={() => { onCopy(); onClose(); }}>Copiar plan</Button></>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
          <Select label="Nivel de origen" options={["Inicial", "Primaria", "Secundaria"]} defaultValue="Primaria" />
          <Select label="Grado de origen" options={["1°", "2°", "4°", "5°", "6°"]} defaultValue="4°" />
        </div>
      </Dialog>
    );
  }

  function ProgramaDialog({ ctx, onClose, onSave }) {
    // ctx: { prog?, idx? }
    const edit = ctx && ctx.prog;
    const [nombre, setNombre] = React.useState("");
    const [tipo, setTipo] = React.useState("Taller");
    const [dia, setDia] = React.useState("");
    const [tarifa, setTarifa] = React.useState("60.00");
    const [cap, setCap] = React.useState("25");
    const [activo, setActivo] = React.useState(true);
    React.useEffect(() => {
      if (!ctx) return;
      setNombre(edit ? ctx.prog.nombre : "");
      setTipo(edit ? ctx.prog.tipo : "Taller");
      setDia(edit ? ctx.prog.dia : "");
      setTarifa(edit ? ctx.prog.tarifa : "60.00");
      setCap(edit ? String(ctx.prog.cap) : "25");
      setActivo(edit ? ctx.prog.estado === "Activo" : true);
    }, [ctx]);
    return (
      <Dialog open={!!ctx} onClose={onClose} title={edit ? `Editar · ${ctx.prog.nombre}` : "Nuevo programa"} icon={<Ic.Clipboard />}
        description="Talleres, reforzamiento y academia — con matrícula y tarifa propia"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} disabled={!nombre.trim()}
            onClick={() => { onSave({ nombre: nombre.trim(), tipo, dia: dia.trim() || "Por definir", tarifa, cap: parseInt(cap, 10) || 0, mat: edit ? ctx.prog.mat : 0, estado: activo ? "Activo" : "Cerrado" }); onClose(); }}>
            {edit ? "Guardar cambios" : "Crear programa"}</Button></>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Input label="Nombre" placeholder="Ej. Taller de Ajedrez" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <Select label="Tipo" options={["Taller", "Reforzamiento", "Academia"]} value={tipo} onChange={(e) => setTipo(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Input label="Horario" placeholder="Ej. Sáb 9:00–11:00" value={dia} onChange={(e) => setDia(e.target.value)} />
            <Input label="Vacantes" type="number" value={cap} onChange={(e) => setCap(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "end" }}>
            <Input label="Tarifa mensual" prefix="S/." value={tarifa} onChange={(e) => setTarifa(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" />
            <div style={{ display: "flex", alignItems: "center", height: 38 }}>
              <Checkbox label="Programa activo" description="Visible al matricular" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  /* ------------------------------ tree ------------------------------ */
  function SeccionRow({ s, inicial, onEdit, onView }) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(150px,1.2fr) 90px 1.4fr minmax(180px,1fr) 76px", alignItems: "center", gap: 14, padding: "9px 16px 9px 46px", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--border-strong)", flexShrink: 0 }}></span>
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{inicial ? s.n : `Sección ${s.n}`}</span>
        </div>
        <Badge tone={s.turno === "M" ? "info" : "accent"}>{s.turno === "M" ? "Mañana" : "Tarde"}</Badge>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {s.tutor !== "— Sin asignar —" ? <React.Fragment><Avatar name={s.tutor} size="xs" />
            <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tutor}</span></React.Fragment>
            : <Badge tone="warning" size="sm">Sin tutor</Badge>}
          {s.aux && <Tooltip content={`Auxiliar: ${s.aux}`}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--surface-sunken)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-pill)", padding: "1px 8px 1px 2px", flexShrink: 0 }}>
            <Avatar name={s.aux} size={16} />
            <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>Aux.</span>
          </span></Tooltip>}
        </div>
        <VacBar mat={s.mat} cap={s.cap} />
        <div style={{ display: "inline-flex", gap: 2, justifyContent: "flex-end" }}>
          <Tooltip content="Editar sección"><IconButton label="Editar" size="sm" onClick={onEdit}><Ic.Pencil /></IconButton></Tooltip>
          <Tooltip content="Ver estudiantes"><IconButton label="Ver" size="sm" onClick={onView}><Ic.Users /></IconButton></Tooltip>
        </div>
      </div>
    );
  }

  function GradoBlock({ g, inicial, onAddSeccion, onEditSeccion, onViewSeccion }) {
    const [open, setOpen] = React.useState(true);
    const tot = g.secciones.reduce((a, s) => a + s.mat, 0);
    const cap = g.secciones.reduce((a, s) => a + s.cap, 0);
    return (
      <div>
        <div onClick={() => setOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer", userSelect: "none" }}>
          <span style={{ display: "inline-flex", color: "var(--text-muted)", transition: "transform var(--duration-fast)", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}><Ic.ChevronDown /></span>
          <span style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)", width: 70 }}>{g.nombre}</span>
          <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>
            {g.secciones.length ? `${g.secciones.length} ${g.secciones.length === 1 ? "sección" : "secciones"} · ${tot}/${cap} estudiantes` : "Sin secciones aún"}
          </span>
          <span style={{ flex: 1 }}></span>
          <Button size="sm" variant="ghost" iconLeft={<Ic.Plus />} onClick={(e) => { e.stopPropagation(); onAddSeccion(); }}>Sección</Button>
        </div>
        {open && g.secciones.map((s, i) => (
          <SeccionRow key={s.n + i} s={s} inicial={inicial}
            onEdit={() => onEditSeccion(s, i)} onView={() => onViewSeccion(s)} />
        ))}
      </div>
    );
  }

  function NivelCard({ nv, onAddGrado, onAddSeccion, onEditSeccion, onViewSeccion }) {
    const [open, setOpen] = React.useState(true);
    const tot = nv.grados.reduce((a, g) => a + g.secciones.reduce((x, s) => x + s.mat, 0), 0);
    const secc = nv.grados.reduce((a, g) => a + g.secciones.length, 0);
    return (
      <Card flush>
        <div onClick={() => setOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", userSelect: "none" }}>
          <span style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: nv.soft, color: nv.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}><Ic.Layers /></span>
          <div style={{ flex: 1 }}>
            <div style={{ font: "var(--type-h3)", color: "var(--text-strong)" }}>{nv.nombre} <span style={{ font: "var(--type-caption)", color: "var(--text-muted)", fontWeight: 400 }}>· {nv.rango}</span></div>
            <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{nv.grados.length} grados · {secc} secciones · {tot} estudiantes</div>
          </div>
          <Button size="sm" variant="secondary" iconLeft={<Ic.Plus />} onClick={(e) => { e.stopPropagation(); onAddGrado(); }}>Grado</Button>
          <span style={{ display: "inline-flex", color: "var(--text-muted)", transition: "transform var(--duration-fast)", transform: open ? "rotate(180deg)" : "none" }}><Ic.ChevronDown /></span>
        </div>
        {open && <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {nv.grados.length === 0 && (
            <div style={{ padding: "18px 16px" }}>
              <EmptyState size="sm" icon={<Ic.Layers />} title="Nivel sin grados"
                description="Crea el primer grado con el botón “+ Grado”." />
            </div>
          )}
          {nv.grados.map((g) => (
            <GradoBlock key={g.nombre} g={g} inicial={nv.id === "ini"}
              onAddSeccion={() => onAddSeccion(nv, g)}
              onEditSeccion={(s, i) => onEditSeccion(nv, g, s, i)}
              onViewSeccion={(s) => onViewSeccion(nv, g, s)} />
          ))}
        </div>}
      </Card>
    );
  }

  /* ------------------------------ wizard (iniciar año) ------------------------------ */
  function YearWizard({ open, onClose }) {
    const [step, setStep] = React.useState(0);
    const STEPS = ["Datos del año", "Estructura", "Promoción", "Confirmar"];
    React.useEffect(() => { if (open) setStep(0); }, [open]);
    return (
      <Dialog open={open} onClose={onClose} size="lg" title="Iniciar año académico 2027"
        description="Asistente de apertura — nada se aplica hasta el paso final." icon={<Ic.Calendar />}
        footer={<>
          <Button variant="secondary" onClick={step === 0 ? onClose : () => setStep(s => s - 1)}>{step === 0 ? "Cancelar" : "Atrás"}</Button>
          {step < 3
            ? <Button variant="primary" iconRight={<Ic.ArrowRight />} onClick={() => setStep(s => s + 1)}>Siguiente</Button>
            : <Button variant="accent" iconLeft={<Ic.Check />} onClick={() => { onClose(); notify("success", "Año académico 2027 iniciado", "Estructura copiada y 448 pre-matrículas generadas (simulación)."); }}>Iniciar año 2027</Button>}
        </>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ height: 4, borderRadius: 99, background: i <= step ? "var(--brand)" : "var(--surface-sunken)" }}></div>
                <span style={{ font: "var(--type-2xs)", fontWeight: i === step ? 600 : 400, color: i === step ? "var(--brand)" : "var(--text-muted)" }}>{i + 1}. {s}</span>
              </div>
            ))}
          </div>
          {step === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input label="Nombre" defaultValue="Año académico 2027" containerStyle={{ gridColumn: "1 / -1" }} />
              <Input label="Inicio de clases" type="date" defaultValue="2027-03-08" />
              <Input label="Fin de clases" type="date" defaultValue="2027-12-17" />
              <Select label="División del año" options={["4 bimestres", "3 trimestres", "2 semestres"]} defaultValue="4 bimestres" />
              <Input label="Inicio de matrícula" type="date" defaultValue="2027-01-11" />
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Alert tone="info" icon={<Ic.Copy />}>Se copiará la estructura del año 2026: 3 niveles, 14 grados, 17 secciones y su plan de estudios.</Alert>
              <Checkbox label="Copiar niveles, grados y secciones" description="Con sus turnos y límites de vacantes" defaultChecked />
              <Checkbox label="Copiar plan de estudios" description="Cursos y horas por grado" defaultChecked />
              <Checkbox label="Copiar tutores y auxiliares asignados" description="Podrás reasignarlos después" />
              <Checkbox label="Copiar programas complementarios" description="Talleres y reforzamientos con sus tarifas" defaultChecked />
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Alert tone="warning" title="Promoción de estudiantes">Cada estudiante activo será propuesto en el grado siguiente. Revisa los casos de repitencia antes de confirmar la matrícula — la promoción genera <b>pre-matrículas</b>, no matrículas definitivas.</Alert>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[["448", "Promovidos al grado siguiente"], ["31", "Egresan (5° Secundaria)"], ["3", "Posible repitencia — revisar"]].map(([n, l]) => (
                  <div key={l} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "12px 14px" }}>
                    <div style={{ font: "var(--type-h2)", fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>{n}</div>
                    <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Alert tone="success" title="Todo listo">Se creará el <b>Año académico 2027</b> (4 bimestres, del 08/03 al 17/12) con la estructura copiada de 2026 y 448 pre-matrículas por ratificar. El año 2026 pasará a estado <b>Cerrado</b> al finalizar sus periodos.</Alert>
              <Checkbox label="Entiendo que esta acción abre el nuevo año académico" />
            </div>
          )}
        </div>
      </Dialog>
    );
  }

  /* ------------------------------ Plan de estudios tab ------------------------------ */
  function PlanEstudios() {
    const [cursos, setCursos] = React.useState(CURSOS_INIT);
    const [dlg, setDlg] = React.useState(null); // {curso?, idx?}
    const [copiar, setCopiar] = React.useState(false);
    const cols = [
      { key: "curso", header: "Curso / área", render: (v) => <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span> },
      { key: "horas", header: "Horas semanales", align: "center", mono: true },
      { key: "doc", header: "Docente asignado", render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={v} size="xs" /><span>{v}</span></div>) },
      { key: "acc", header: "", align: "right", render: (_, r, i) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => setDlg({ curso: r, idx: i })}><Ic.Pencil /></IconButton></Tooltip>
          <Tooltip content="Quitar"><IconButton label="Quitar" size="sm" variant="danger" onClick={() => { setCursos(cs => cs.filter((_, x) => x !== i)); notify("info", "Curso quitado", `${r.curso} eliminado del plan de 3°.`); }}><Ic.Trash /></IconButton></Tooltip>
        </div>) },
    ];
    const totalH = cursos.reduce((a, r) => a + r.horas, 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <Select label="Nivel" options={["Inicial", "Primaria", "Secundaria"]} defaultValue="Primaria" containerStyle={{ width: 160 }} />
          <Select label="Grado" options={["1°", "2°", "3°", "4°", "5°", "6°"]} defaultValue="3°" containerStyle={{ width: 110 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Copy />} onClick={() => setCopiar(true)}>Copiar de otro grado</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setDlg({})}>Agregar curso</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={cursos} hover />
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", font: "var(--type-caption)", color: "var(--text-muted)" }}>
            <span>{cursos.length} cursos · Primaria 3°</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{totalH} h semanales</span>
          </div>
        </Card>
        <CursoDialog ctx={dlg} onClose={() => setDlg(null)}
          onSave={(data) => { setCursos(cs => dlg.curso ? cs.map((c, i) => i === dlg.idx ? data : c) : [...cs, data]); notify("success", dlg.curso ? "Curso actualizado" : "Curso agregado", `${data.curso} · ${data.horas} h semanales · ${data.doc}.`); }} />
        <CopiarPlanDialog open={copiar} onClose={() => setCopiar(false)}
          onCopy={() => { setCursos(cs => [...cs, { curso: "Computación", horas: 2, doc: "Mario Silva" }]); notify("success", "Plan copiado", "Cursos de Primaria 4° traídos a 3° — revisa los docentes."); }} />
      </div>
    );
  }

  /* ------------------------------ Programas tab ------------------------------ */
  function ProgMatriculadosDialog({ prog, onClose }) {
    if (!prog) return null;
    const list = ALUMNOS.slice(0, Math.min(prog.mat, ALUMNOS.length));
    const cols = [
      { key: "i", header: "N°", width: 44, align: "center", mono: true, render: (_, __, i) => i + 1 },
      { key: "nombre", header: "Estudiante", render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="xs" /><span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "pago", header: "Mensualidad", align: "center", render: (_, __, i) => (
        <Badge tone={i % 4 === 2 ? "warning" : "success"} dot>{i % 4 === 2 ? "Pendiente" : "Pagado"}</Badge>) },
    ];
    return (
      <Dialog open onClose={onClose} size="lg" icon={<Ic.Users />}
        title={`Matriculados · ${prog.nombre}`}
        description={`${prog.mat} de ${prog.cap} vacantes · ${prog.dia} · S/ ${prog.tarifa} mensual`}
        footer={<>
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Nómina exportada", `Matriculados de ${prog.nombre} descargados en Excel.`)}>Exportar</Button>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => { onClose(); goTo("matricula"); notify("info", "Nueva matrícula", `Asistente abierto con ${prog.nombre} preseleccionado.`); }}>Matricular al programa</Button>
        </>}>
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden", maxHeight: 320, overflowY: "auto", marginTop: 4 }}>
          {list.length ? <Table columns={cols} data={list.map((nombre) => ({ nombre }))} compact />
            : <EmptyState size="sm" icon={<Ic.Users />} title="Sin matriculados" description="Este programa aún no tiene estudiantes." />}
        </div>
      </Dialog>
    );
  }

  function Programas() {
    const [progs, setProgs] = React.useState(PROGRAMAS_INIT);
    const [dlg, setDlg] = React.useState(null); // {prog?, idx?}
    const [ver, setVer] = React.useState(null);
    const cols = [
      { key: "nombre", header: "Programa", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
          <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.dia}</span>
        </div>) },
      { key: "tipo", header: "Tipo", align: "center", render: (v) => (
        <Badge tone={v === "Taller" ? "accent" : v === "Reforzamiento" ? "info" : "brand"}>{v}</Badge>) },
      { key: "tarifa", header: "Tarifa mensual", num: true, mono: true, render: (v) => `S/ ${v}` },
      { key: "vac", header: "Matriculados", render: (_, r) => <VacBar mat={r.mat} cap={r.cap} /> },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Activo" ? "success" : "neutral"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r, i) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => setDlg({ prog: r, idx: i })}><Ic.Pencil /></IconButton></Tooltip>
          <Tooltip content="Ver matriculados"><IconButton label="Ver" size="sm" onClick={() => setVer(r)}><Ic.Users /></IconButton></Tooltip>
        </div>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info">Los programas usan la misma matrícula y cobranza que la enseñanza regular, con su propia tarifa. Un estudiante puede matricularse en varios programas.</Alert>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setDlg({})}>Nuevo programa</Button>
        </div>
        <Card flush><Table columns={cols} data={progs} hover /></Card>
        <ProgramaDialog ctx={dlg} onClose={() => setDlg(null)}
          onSave={(data) => { setProgs(ps => dlg.prog ? ps.map((p, i) => i === dlg.idx ? data : p) : [...ps, data]); notify("success", dlg.prog ? "Programa actualizado" : "Programa creado", `${data.nombre} · S/ ${data.tarifa} mensual.`); }} />
        <ProgMatriculadosDialog prog={ver} onClose={() => setVer(null)} />
      </div>
    );
  }

  /* ------------------------------ Periodos tab ------------------------------ */
  function PeriodoDialog({ ctx, onClose }) {
    if (!ctx) return null;
    const toDate = (s) => `2026-${s.split("/")[1]}-${s.split("/")[0]}`;
    return (
      <Dialog open onClose={onClose} title={`Editar · ${ctx.n}`} icon={<Ic.Calendar />}
        description="Las fechas definen qué periodo está en curso"
        footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { onClose(); notify("success", "Periodo actualizado", `${ctx.n} guardado.`); }}>Guardar</Button></>}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
          <Input label="Inicio" type="date" defaultValue={toDate(ctx.ini)} />
          <Input label="Fin" type="date" defaultValue={toDate(ctx.fin)} />
        </div>
        {ctx.estado === "Cerrado" && <Alert tone="warning" title="Periodo cerrado" style={{ marginTop: 12 }}>Modificar un periodo cerrado no reabre sus notas ni asistencias.</Alert>}
      </Dialog>
    );
  }

  function Periodos() {
    const [edit, setEdit] = React.useState(null);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {PERIODOS.map((p) => (
          <Card key={p.n} title={p.n} subtitle={`${p.ini} — ${p.fin}`}
            actions={<div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Badge tone={p.estado === "En curso" ? "success" : p.estado === "Cerrado" ? "neutral" : "info"} dot>{p.estado}</Badge>
              <Tooltip content="Editar fechas"><IconButton label="Editar" size="sm" onClick={() => setEdit(p)}><Ic.Pencil /></IconButton></Tooltip>
            </div>}>
            <ProgressBar value={p.avance} showValue size="sm" tone={p.estado === "Cerrado" ? "success" : "brand"} label="Avance" />
          </Card>
        ))}
        <PeriodoDialog ctx={edit} onClose={() => setEdit(null)} />
      </div>
    );
  }

  /* ------------------------------ screen ------------------------------ */
  const PALETA = [
    { color: "var(--blue-500)", soft: "var(--surface-brand-soft)" },
    { color: "var(--gold-500)", soft: "var(--surface-accent-soft)" },
    { color: "var(--green-500)", soft: "var(--success-soft)" },
    { color: "var(--brown-400)", soft: "var(--surface-sunken)" },
  ];

  window.SGE_Structure = function Structure() {
    const [tab, setTab] = React.useState("estructura");
    const [wizard, setWizard] = React.useState(false);
    const [niveles, setNiveles] = React.useState(NIVELES_INIT);
    const [nivelDlg, setNivelDlg] = React.useState(false);
    const [gradoDlg, setGradoDlg] = React.useState(null);     // { nivel }
    const [seccionDlg, setSeccionDlg] = React.useState(null); // { nivel, grado, seccion?, idx? }
    const [verDlg, setVerDlg] = React.useState(null);         // { nivel, grado, seccion }

    const totalSecc = niveles.reduce((a, nv) => a + nv.grados.reduce((x, g) => x + g.secciones.length, 0), 0);

    const mutate = (nivelId, gradoNombre, fn) => setNiveles(nvs => nvs.map(nv =>
      nv.id !== nivelId ? nv : { ...nv, grados: nv.grados.map(g => g.nombre !== gradoNombre ? g : fn(g)) }));

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "var(--surface-brand-soft)", color: "var(--brand)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 21 }}><Ic.Calendar /></span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ font: "var(--type-h3)", color: "var(--text-strong)" }}>Año académico 2026</span>
                <Badge tone="success" dot>Activo</Badge>
              </div>
              <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>09/03/2026 — 18/12/2026 · 4 bimestres · Bimestre II en curso</div>
            </div>
            <Select options={["2026", "2025", "2024"]} defaultValue="2026" containerStyle={{ width: 110 }} />
            <Button variant="accent" iconLeft={<Ic.Calendar />} onClick={() => setWizard(true)}>Iniciar año 2027</Button>
          </div>
        </Card>

        <Tabs value={tab} onChange={setTab} items={[
          { id: "estructura", label: "Estructura", count: totalSecc },
          { id: "plan", label: "Plan de estudios" },
          { id: "prog", label: "Programas", count: 4 },
          { id: "per", label: "Periodos" },
        ]} />

        {tab === "estructura" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="secondary" iconLeft={<Ic.Plus />} onClick={() => setNivelDlg(true)}>Nuevo nivel</Button>
            </div>
            {niveles.map((nv) => (
              <NivelCard key={nv.id} nv={nv}
                onAddGrado={() => setGradoDlg({ nivel: nv })}
                onAddSeccion={(nivel, g) => setSeccionDlg({ nivel, grado: g })}
                onEditSeccion={(nivel, g, s, i) => setSeccionDlg({ nivel, grado: g, seccion: s, idx: i })}
                onViewSeccion={(nivel, g, s) => setVerDlg({ nivel, grado: g, seccion: s })} />
            ))}
          </div>
        )}
        {tab === "plan" && <PlanEstudios />}
        {tab === "prog" && <Programas />}
        {tab === "per" && <Periodos />}

        <YearWizard open={wizard} onClose={() => setWizard(false)} />
        <NivelDialog open={nivelDlg} onClose={() => setNivelDlg(false)}
          onSave={({ nombre, rango }) => {
            const pal = PALETA[niveles.length % PALETA.length];
            setNiveles(nvs => [...nvs, { id: "nv" + Date.now(), nombre, rango, color: pal.color, soft: pal.soft, grados: [] }]);
            notify("success", "Nivel creado", `${nombre} agregado — crea sus grados desde el árbol.`);
          }} />
        <GradoDialog ctx={gradoDlg} onClose={() => setGradoDlg(null)}
          onSave={(nombre) => { setNiveles(nvs => nvs.map(nv => nv.id !== gradoDlg.nivel.id ? nv : { ...nv, grados: [...nv.grados, { nombre, secciones: [] }] })); notify("success", "Grado creado", `${nombre} · ${gradoDlg.nivel.nombre} — agrégale secciones.`); }} />
        <SeccionDialog ctx={seccionDlg} onClose={() => setSeccionDlg(null)}
          onSave={(data) => {
            const { nivel, grado, seccion, idx } = seccionDlg;
            mutate(nivel.id, grado.nombre, (g) => seccion
              ? { ...g, secciones: g.secciones.map((s, i) => i === idx ? { ...s, ...data } : s) }
              : { ...g, secciones: [...g.secciones, { ...data, mat: 0 }] });
            notify("success", seccion ? "Sección actualizada" : "Sección creada", `${grado.nombre} ${data.n} · ${data.turno === "M" ? "Mañana" : "Tarde"} · ${data.cap} vacantes.`);
          }} />
        <EstudiantesDialog ctx={verDlg} onClose={() => setVerDlg(null)} />
      </div>
    );
  };
})();
