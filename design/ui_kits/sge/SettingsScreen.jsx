/* Elohim SGE — Configuración institucional. Registers window.SGE_Settings. */
(function () {
  const { Card, Button, Input, Select, Textarea, Switch, Avatar, Badge, Alert, Table, IconButton, Tooltip, Tabs, Dialog, Checkbox } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  function Institucion() {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 18, alignItems: "start" }}>
        <Card title="Identidad">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <img src="../../assets/elohim-insignia.png" alt="Insignia" style={{ width: 120, height: 120, objectFit: "contain" }} />
            <Button variant="secondary" size="sm" iconLeft={<Ic.Download />} onClick={() => notify("info", "Cambiar insignia", "Se abriría el selector de archivo (PNG/SVG, mín. 512px).")}>Cambiar insignia</Button>
            <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>PNG o SVG · fondo transparente · mín. 512px</span>
          </div>
        </Card>
        <Card title="Datos de la institución">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Nombre" defaultValue="I.E.P. Elohim — Colegio Cristocéntrico" containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="Código modular" defaultValue="1698340" hint="Asignado por MINEDU" />
            <Input label="RUC" defaultValue="20601234567" />
            <Input label="Dirección" defaultValue="Jr. Francisco Irazola 590, Satipo" containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="Teléfono" defaultValue="(064) 545-210" />
            <Input label="Correo" type="email" defaultValue="informes@elohim.edu.pe" />
            <Select label="Región" options={["Junín"]} defaultValue="Junín" />
            <Select label="UGEL" options={["UGEL Satipo"]} defaultValue="UGEL Satipo" />
            <Textarea label="Lema" rows={2} defaultValue="Educación cristocéntrica, gestión moderna." containerStyle={{ gridColumn: "1 / -1" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => notify("success", "Datos guardados", "La información institucional se actualizó correctamente.")}>Guardar cambios</Button>
          </div>
        </Card>
      </div>
    );
  }

  function Notificaciones() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
        <Card title="Recordatorios de pago a apoderados" subtitle="Se envían al contacto principal de cada familia">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["3 días antes del vencimiento", true], ["El día del vencimiento", true], ["Al registrarse la mora", true], ["Resumen semanal de deuda", false]].map(([l, on]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ font: "var(--type-body)", color: "var(--text-body)" }}>{l}</span>
                <Switch defaultChecked={on} />
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Select label="Canal principal" options={["WhatsApp", "SMS", "Correo"]} defaultValue="WhatsApp" />
              <Select label="Canal secundario" options={["Correo", "SMS", "Ninguno"]} defaultValue="Correo" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" iconLeft={<Ic.Send />} onClick={() => notify("success", "Mensaje de prueba enviado", "Revisa el WhatsApp del número de la institución.")}>Enviar mensaje de prueba</Button>
            </div>
          </div>
        </Card>
        <Card title="Otros avisos">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Confirmación de pago (recibo digital)", true], ["Confirmación de matrícula", true], ["Inasistencia del estudiante", false]].map(([l, on]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ font: "var(--type-body)", color: "var(--text-body)" }}>{l}</span>
                <Switch defaultChecked={on} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  /* ------------------------------ Evaluación (criterios) ------------------------------ */
  function Evaluacion() {
    const [dlg, setDlg] = React.useState(null); // {tipo: "est"|"apo"}
    const EST = [
      ["Comportamiento", "Todos los niveles", true],
      ["Uniformidad", "Todos los niveles", true],
      ["Puntualidad", "Todos los niveles", true],
      ["Orden e higiene", "Inicial y Primaria", false],
    ];
    const APO = [
      ["Asiste a reuniones", "Todos los niveles", true],
      ["Acompañamiento en casa", "Todos los niveles", true],
      ["Comunicación con el tutor", "Todos los niveles", true],
      ["Puntualidad en el recojo", "Inicial", false],
    ];
    const Fila = ({ nombre, ambito, on }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", background: "var(--surface-sunken)", borderRadius: "var(--radius-md)" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{nombre}</div>
          <div style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{ambito}</div>
        </div>
        <Tooltip content="Editar"><IconButton label="Editar" size="sm" onClick={() => notify("info", "Editar criterio", `“${nombre}” — nombre, ámbito y estado.`)}><Ic.Pencil /></IconButton></Tooltip>
        <Switch defaultChecked={on} aria-label={`Activar ${nombre}`} />
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
        <Alert tone="info" title="Escala literal AD · A · B · C (estándar MINEDU)">Estos criterios aparecen automáticamente en la <b>libreta</b> de cada bimestre. Los del estudiante los califica el tutor del aula; los del apoderado también los registra el tutor.</Alert>
        <Card title="Aspectos formativos del estudiante" subtitle="Comportamiento, uniformidad y otros — se califican por bimestre"
          actions={<Button size="sm" variant="secondary" iconLeft={<Ic.Plus />} onClick={() => setDlg({ tipo: "est" })}>Agregar</Button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {EST.map((x) => <Fila key={x[0]} nombre={x[0]} ambito={x[1]} on={x[2]} />)}
          </div>
        </Card>
        <Card title="Evaluación del apoderado" subtitle="La registra el tutor — compromiso de la familia con el estudiante"
          actions={<Button size="sm" variant="secondary" iconLeft={<Ic.Plus />} onClick={() => setDlg({ tipo: "apo" })}>Agregar</Button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {APO.map((x) => <Fila key={x[0]} nombre={x[0]} ambito={x[1]} on={x[2]} />)}
          </div>
        </Card>

        <Dialog open={!!dlg} onClose={() => setDlg(null)} title={dlg && dlg.tipo === "apo" ? "Nuevo criterio del apoderado" : "Nuevo aspecto formativo"} icon={<Ic.Clipboard />}
          footer={<><Button variant="secondary" onClick={() => setDlg(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", "Criterio creado", "Aparecerá en las libretas desde el bimestre en curso."); setDlg(null); }}>Crear</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Nombre" required placeholder={dlg && dlg.tipo === "apo" ? "Ej. Responde los comunicados" : "Ej. Respeto a los símbolos"} containerStyle={{ gridColumn: "1 / -1" }} />
            <Select label="Aplica a" options={["Todos los niveles", "Inicial", "Primaria", "Secundaria", "Inicial y Primaria"]} defaultValue="Todos los niveles" />
            <Input label="Escala" defaultValue="AD / A / B / C" disabled hint="Fija — estándar MINEDU" />
          </div>
        </Dialog>
      </div>
    );
  }

  /* ------------------------------ Planilla (régimen) ------------------------------ */
  function PlanillaCfg() {
    const AFPS = [
      ["AFP Integra", "10.00", "1.55", "1.84"],
      ["AFP Prima", "10.00", "1.60", "1.84"],
      ["AFP Profuturo", "10.00", "1.69", "1.84"],
      ["AFP Habitat", "10.00", "1.47", "1.84"],
    ];
    const cols = [
      { key: "afp", header: "AFP", render: (v) => <span style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>{v}</span> },
      { key: "fondo", header: "Fondo %", align: "center", mono: true, render: (v) => `${v}%` },
      { key: "com", header: "Comisión %", align: "center", mono: true, render: (v) => `${v}%` },
      { key: "seg", header: "Seguro %", align: "center", mono: true, render: (v) => `${v}%` },
      { key: "total", header: "Total empleado", align: "center", mono: true, render: (_, r) => (
        <Badge tone="brand">{(parseFloat(r.fondo) + parseFloat(r.com) + parseFloat(r.seg)).toFixed(2)}%</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <Tooltip content="Editar porcentajes"><IconButton label="Editar" size="sm" onClick={() => notify("info", r.afp, "Edición de % de fondo, comisión y seguro — se actualizan cuando la SBS publica nuevas tasas.")}><Ic.Pencil /></IconButton></Tooltip>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 820 }}>
        <Alert tone="info" title="Régimen pensionario por empleado">Cada empleado elige <b>AFP u ONP</b> en su ficha. La planilla calcula el descuento según este catálogo; el empleador aporta <b>EsSalud 9%</b> aparte (no se descuenta al trabajador).</Alert>
        <Card flush title="Catálogo de AFPs" subtitle="Porcentajes editables — comisión sobre flujo"
          actions={<Badge tone="neutral">ONP: 13% único</Badge>}>
          <Table columns={cols} data={AFPS.map((a) => ({ afp: a[0], fondo: a[1], com: a[2], seg: a[3] }))} />
        </Card>
        <Card title="Beneficios del régimen privado">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Gratificaciones (Julio y Diciembre)", "Un sueldo adicional + bono 9% EsSalud", true], ["CTS (Mayo y Noviembre)", "Medio sueldo por semestre, depositado en banco", true], ["Asignación familiar (10% RMV)", "S/ 113.00 a quienes tienen hijos menores", true]].map(([l, d, on]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <div style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{l}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{d}</div>
                </div>
                <Switch defaultChecked={on} />
              </div>
            ))}
            <Alert tone="warning">En Julio y Diciembre la planilla incluirá automáticamente la columna de gratificación; en Mayo y Noviembre, el depósito de CTS.</Alert>
          </div>
        </Card>
      </div>
    );
  }

  function Usuarios() {
    const [dlg, setDlg] = React.useState(null); // {u?} nuevo o editar
    const USERS = [
      ["Dir. Pérez Huamán", "Administrador", "Acceso total", "Activo", "var(--gold-500)"],
      ["Liliana Campos Paz", "Secretaría / Caja", "Matrícula, cobros, apoderados", "Activo", "var(--brown-400)"],
      ["Pedro Gómez Silva", "Docente", "Sus aulas: asistencia y notas", "Activo", "var(--blue-500)"],
      ["Fidel Huamán Soto", "Portería", "Solo marcación de ingreso/salida del personal", "Activo", "var(--green-500)"],
      ["Cuenta Apoderado", "Apoderado", "Portal: estado de cuenta y pagos en línea", "Próximamente", "var(--neutral-500)"],
    ];
    const cols = [
      { key: "nombre", header: "Usuario", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "rol", header: "Rol", align: "center", render: (v) => (
        <Badge tone={v === "Administrador" ? "accent" : v === "Docente" ? "brand" : v === "Portería" ? "success" : v === "Apoderado" ? "neutral" : "info"}>{v}</Badge>) },
      { key: "alcance", header: "Alcance" },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Activo" ? "success" : "neutral"} dot>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <Tooltip content="Editar permisos"><IconButton label="Editar" size="sm" onClick={() => setDlg({ u: r })}><Ic.Pencil /></IconButton></Tooltip>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Alert tone="info" title="Roles del sistema">El Administrador todo lo puede. Secretaría opera matrícula y caja; los docentes ven solo sus aulas; Portería solo marca ingreso/salida del personal; el portal del apoderado llegará en una fase posterior.</Alert>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setDlg({})}>Nuevo usuario</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={USERS.map((u) => ({ nombre: u[0], rol: u[1], alcance: u[2], estado: u[3], color: u[4] }))} hover />
        </Card>

        {/* Nuevo / editar usuario */}
        <Dialog open={!!dlg} onClose={() => setDlg(null)} size="lg" title={dlg && dlg.u ? `Permisos · ${dlg.u.nombre}` : "Nuevo usuario"} icon={<Ic.Lock />}
          description="El rol define el alcance base; los permisos lo afinan"
          footer={<><Button variant="secondary" onClick={() => setDlg(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", dlg.u ? "Permisos actualizados" : "Usuario creado", dlg.u ? `${dlg.u.nombre} guardado.` : "Se envió la contraseña temporal a su correo."); setDlg(null); }}>
              {dlg && dlg.u ? "Guardar cambios" : "Crear usuario"}</Button></>}>
          {dlg && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Input label="Nombre completo" required defaultValue={dlg.u ? dlg.u.nombre : ""} placeholder="Ej. Liliana Campos" />
                <Input label="Correo" type="email" required defaultValue={dlg.u ? "usuario@elohim.edu.pe" : ""} placeholder="usuario@elohim.edu.pe" />
                <Select label="Rol" options={["Administrador", "Secretaría / Caja", "Docente", "Portería", "Apoderado"]} defaultValue={dlg.u ? dlg.u.rol : undefined} placeholder="Seleccione" required />
                <Select label="Estado" options={["Activo", "Suspendido"]} defaultValue={dlg.u && dlg.u.estado === "Activo" ? "Activo" : "Activo"} />
              </div>
              <div>
                <div style={{ font: "var(--type-label)", color: "var(--text-strong)", marginBottom: 8 }}>Permisos por módulo</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Checkbox label="Matrícula" defaultChecked />
                  <Checkbox label="Caja y cobros" defaultChecked />
                  <Checkbox label="Estudiantes y apoderados" defaultChecked />
                  <Checkbox label="Notas y asistencia" />
                  <Checkbox label="Personal y planilla" />
                  <Checkbox label="Marcación de personal" />
                  <Checkbox label="Configuración" />
                </div>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    );
  }

  window.SGE_Settings = function Settings() {
    const [tab, setTab] = React.useState("inst");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Tabs value={tab} onChange={setTab} items={[
          { id: "inst", label: "Institución" },
          { id: "notif", label: "Notificaciones" },
          { id: "eval", label: "Evaluación" },
          { id: "planilla", label: "Planilla" },
          { id: "users", label: "Usuarios y roles", count: 4 },
        ]} />
        {tab === "inst" && <Institucion />}
        {tab === "notif" && <Notificaciones />}
        {tab === "eval" && <Evaluacion />}
        {tab === "planilla" && <PlanillaCfg />}
        {tab === "users" && <Usuarios />}
      </div>
    );
  };
})();
