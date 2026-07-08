/* Elohim SGE — Conducta e incidencias. Registers window.SGE_Conduct.
   Registran: tutor y auxiliar del aula + administración. Gravedad Leve/Moderada/Grave;
   grave notifica al apoderado y programa citación. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Textarea, Dialog, Alert, Tooltip, StatCard } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const GRAV = { Leve: "info", Moderada: "warning", Grave: "danger" };
  const INIT = [
    { id: "I-0032", fecha: "07/07", est: "Hugo Vela Soto", ubic: "6° A Primaria", tipo: "Agresión verbal a compañero", grav: "Grave", por: "L. Díaz (tutora)", estado: "Citación programada", medida: "Citación al apoderado · 10/07 8:00", color: "var(--blue-600)" },
    { id: "I-0031", fecha: "06/07", est: "José Ramos Lía", ubic: "5° B Primaria", tipo: "No presenta tareas (3ª vez)", grav: "Moderada", por: "P. Gómez (tutor)", estado: "Apoderado notificado", medida: "Compromiso de acompañamiento en casa", color: "var(--gold-500)" },
    { id: "I-0030", fecha: "03/07", est: "Luis Paz Cárdenas", ubic: "4° A Primaria", tipo: "Tardanza reiterada al aula", grav: "Leve", por: "M. Quispe (auxiliar)", estado: "Registrada", medida: "Llamada de atención verbal", color: "var(--brown-400)" },
    { id: "I-0029", fecha: "01/07", est: "Diego Ñahui Cruz", ubic: "3° A Secundaria", tipo: "Uso de celular en examen", grav: "Grave", por: "Dirección", estado: "Cerrada", medida: "Suspensión 1 día + citación (realizada)", color: "var(--neutral-500)" },
  ];

  window.SGE_Conduct = function Conduct() {
    const [rows, setRows] = React.useState(INIT);
    const [nueva, setNueva] = React.useState(false);
    const [grav, setGrav] = React.useState("Leve");
    const [ver, setVer] = React.useState(null);
    const cerrar = (id) => { setRows((rs) => rs.map((x) => x.id === id ? { ...x, estado: "Cerrada" } : x)); notify("success", "Incidencia cerrada", `${id} — queda en el historial del estudiante.`); };

    const cols = [
      { key: "id", header: "N°", mono: true, width: 70 },
      { key: "fecha", header: "Fecha", mono: true, align: "center", width: 64 },
      { key: "est", header: "Estudiante", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
            <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.ubic}</span>
          </div>
        </div>) },
      { key: "tipo", header: "Incidencia", render: (v, r) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>{v}</span>
          <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>Registró: {r.por}</span>
        </div>) },
      { key: "grav", header: "Gravedad", align: "center", render: (v) => <Badge tone={GRAV[v]} dot>{v}</Badge> },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Cerrada" ? "neutral" : v === "Citación programada" ? "danger" : v === "Apoderado notificado" ? "warning" : "info"}>{v}</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Ver detalle y medida"><IconButton label="Ver" size="sm" onClick={() => setVer(r)}><Ic.Eye /></IconButton></Tooltip>
          {r.estado !== "Cerrada" && <Tooltip content="Cerrar incidencia"><IconButton label="Cerrar" size="sm" onClick={() => cerrar(r.id)}><Ic.Check /></IconButton></Tooltip>}
        </div>) },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Incidencias · Julio" value="4" icon={<Ic.Clipboard />} caption="en toda la institución" />
          <StatCard label="Graves" value="2" iconTone="danger" icon={<Ic.Bell />} caption="con citación al apoderado" />
          <StatCard label="Abiertas" value="3" iconTone="accent" icon={<Ic.Clock />} caption="pendientes de cierre" />
          <StatCard label="Citaciones esta semana" value="1" icon={<Ic.Calendar />} caption="viernes 10/07 · 8:00" />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}><Input placeholder="Buscar por estudiante o tipo…" iconLeft={<Ic.Search />} /></div>
          <Select placeholder="Gravedad" options={["Leve", "Moderada", "Grave"]} containerStyle={{ width: 130 }} />
          <Select placeholder="Estado" options={["Registrada", "Apoderado notificado", "Citación programada", "Cerrada"]} containerStyle={{ width: 180 }} />
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => { setGrav("Leve"); setNueva(true); }}>Registrar incidencia</Button>
        </div>
        <Card flush><Table columns={cols} data={rows} hover zebra /></Card>
        <Alert tone="info" title="Quién registra y quién se entera">Registran el <b>tutor</b> y el <b>auxiliar</b> del aula, además de administración. Las <b>moderadas</b> notifican al apoderado por WhatsApp; las <b>graves</b> además programan una citación presencial. Todo queda en el historial de conducta del estudiante y lo ve el tutor en su portal.</Alert>

        {/* Nueva incidencia */}
        <Dialog open={nueva} onClose={() => setNueva(false)} size="lg" title="Registrar incidencia" icon={<Ic.Clipboard />}
          footer={<><Button variant="secondary" onClick={() => setNueva(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setNueva(false); notify(grav === "Leve" ? "success" : "warning", "Incidencia registrada", grav === "Grave" ? "Se notificó al apoderado y quedó propuesta la citación." : grav === "Moderada" ? "El apoderado fue notificado por WhatsApp." : "Registrada en el historial del estudiante."); }}>Registrar</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Estudiante" required placeholder="Buscar por nombre o código…" iconLeft={<Ic.Search />} containerStyle={{ gridColumn: "1 / -1" }} />
            <Select label="Gravedad" options={["Leve", "Moderada", "Grave"]} value={grav} onChange={(e) => setGrav(e.target.value)} required />
            <Input label="Fecha y hora" type="datetime-local" defaultValue="2026-07-08T09:30" />
            <Textarea label="Descripción de los hechos" rows={3} required placeholder="Qué ocurrió, dónde, testigos…" containerStyle={{ gridColumn: "1 / -1" }} />
            <Input label="Medida aplicada" placeholder="Ej. llamada de atención, compromiso…" containerStyle={{ gridColumn: "1 / -1" }} />
            {grav !== "Leve" && (
              <Alert tone={grav === "Grave" ? "danger" : "warning"} title={grav === "Grave" ? "Se notificará y citará al apoderado" : "Se notificará al apoderado"} style={{ gridColumn: "1 / -1" }}>
                {grav === "Grave" ? "Aviso inmediato por WhatsApp + propuesta de citación presencial (elige fecha al registrar)." : "Aviso por WhatsApp con el detalle de la incidencia."}
              </Alert>
            )}
            {grav === "Grave" && <Input label="Fecha de citación" type="datetime-local" defaultValue="2026-07-10T08:00" containerStyle={{ gridColumn: "1 / -1" }} />}
          </div>
        </Dialog>

        {/* Detalle */}
        <Dialog open={!!ver} onClose={() => setVer(null)} title={ver ? `${ver.id} · ${ver.tipo}` : ""} icon={<Ic.Clipboard />}
          description={ver ? `${ver.est} · ${ver.ubic} · ${ver.fecha}` : ""}
          footer={<>
            {ver && ver.grav !== "Leve" && <Button variant="secondary" iconLeft={<Ic.Send />} onClick={() => notify("success", "Reenviado", "El apoderado recibió nuevamente el aviso.")}>Reenviar aviso</Button>}
            <Button variant="primary" onClick={() => setVer(null)}>Cerrar</Button></>}>
          {ver && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              <div style={{ display: "flex", gap: 8 }}><Badge tone={GRAV[ver.grav]} dot>{ver.grav}</Badge><Badge tone="neutral">{ver.estado}</Badge></div>
              {[["Registrado por", ver.por], ["Medida", ver.medida]].map(([k, v]) => (
                <div key={k} style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "8px 12px" }}>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                  <div style={{ font: "var(--type-body)" }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </Dialog>
      </div>
    );
  };
})();
