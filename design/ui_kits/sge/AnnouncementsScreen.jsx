/* Elohim SGE — Comunicados. Registers window.SGE_Announcements. */
(function () {
  const { Card, Table, Badge, Button, IconButton, Input, Select, Textarea, Tooltip, Dialog, Checkbox, StatCard } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const DATA = [
    ["C-0087", "Suspensión de clases · aniversario de Satipo", "Todo el colegio", "WhatsApp + correo", "06/07", "Enviado", 356],
    ["C-0086", "Reunión de apoderados · 3° Primaria", "3° A y 3° B Primaria", "WhatsApp", "04/07", "Enviado", 52],
    ["C-0085", "Cronograma de exámenes · Bimestre II", "Primaria y Secundaria", "WhatsApp + correo", "02/07", "Enviado", 310],
    ["C-0088", "Campaña de vacunación (citación)", "Inicial", "WhatsApp", "09/07", "Programado", 62],
    ["C-0089", "Olimpiadas Elohim 2026", "Todo el colegio", "—", "—", "Borrador", 0],
  ];

  window.SGE_Announcements = function Announcements() {
    const [dlg, setDlg] = React.useState(null); // {} nuevo · {c} ver/editar
    const cols = [
      { key: "cod", header: "N°", mono: true, width: 80 },
      { key: "titulo", header: "Comunicado", render: (v) => <span style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>{v}</span> },
      { key: "alcance", header: "Alcance", render: (v) => <Badge tone="brand">{v}</Badge> },
      { key: "canal", header: "Canal", align: "center", render: (v) => v === "—" ? <span style={{ color: "var(--text-subtle)" }}>—</span> : <Badge tone="neutral">{v}</Badge> },
      { key: "fecha", header: "Envío", mono: true, align: "center" },
      { key: "estado", header: "Estado", align: "center", render: (v) => (
        <Badge tone={v === "Enviado" ? "success" : v === "Programado" ? "info" : "neutral"} dot>{v}</Badge>) },
      { key: "dest", header: "Destinatarios", align: "center", mono: true, render: (v) => v || "—" },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content={r.estado === "Borrador" ? "Editar" : "Ver / reenviar"}><IconButton label="Ver" size="sm" onClick={() => setDlg({ c: r })}>{r.estado === "Borrador" ? <Ic.Pencil /> : <Ic.Eye />}</IconButton></Tooltip>
          <Tooltip content="Duplicar"><IconButton label="Duplicar" size="sm" onClick={() => notify("info", "Comunicado duplicado", `Copia de "${r.titulo}" creada como borrador.`)}><Ic.Copy /></IconButton></Tooltip>
        </div>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <StatCard label="Enviados · Julio" value="12" icon={<Ic.Send />} caption="3 esta semana" />
          <StatCard label="Tasa de lectura" value="87%" iconTone="success" icon={<Ic.Check />} caption="WhatsApp últimos 30 días" />
          <StatCard label="Programados" value="1" iconTone="accent" icon={<Ic.Clock />} caption="para esta semana" />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <Input placeholder="Buscar comunicado…" iconLeft={<Ic.Search />} />
          </div>
          <Select placeholder="Estado" options={["Enviado", "Programado", "Borrador"]} containerStyle={{ width: 150 }} />
          <Button variant="primary" iconLeft={<Ic.Megaphone />} onClick={() => setDlg({})}>Nuevo comunicado</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={DATA.map((d) => ({ cod: d[0], titulo: d[1], alcance: d[2], canal: d[3], fecha: d[4], estado: d[5], dest: d[6] }))} hover zebra />
        </Card>

        <Dialog open={!!dlg} onClose={() => setDlg(null)} size="lg" icon={<Ic.Megaphone />}
          title={dlg && dlg.c ? dlg.c.titulo : "Nuevo comunicado"}
          description={dlg && dlg.c ? `${dlg.c.cod} · ${dlg.c.estado}` : "Llega al contacto principal de cada familia del alcance"}
          footer={<>
            <Button variant="ghost" onClick={() => { notify("info", "Borrador guardado", "Lo encuentras en la lista con estado Borrador."); setDlg(null); }}>Guardar borrador</Button>
            <Button variant="secondary" onClick={() => setDlg(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Send />} onClick={() => { notify("success", "Comunicado enviado", "356 familias lo recibirán por WhatsApp y correo."); setDlg(null); }}>Enviar ahora</Button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
            <Input label="Título" required defaultValue={dlg && dlg.c ? dlg.c.titulo : ""} placeholder="Ej. Reunión de apoderados" />
            <Textarea label="Mensaje" rows={4} required placeholder="Estimadas familias…" defaultValue={dlg && dlg.c ? "Estimadas familias: …" : ""} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Select label="Alcance" options={["Todo el colegio", "Inicial", "Primaria", "Secundaria", "Una sección…"]} defaultValue={dlg && dlg.c ? undefined : "Todo el colegio"} />
              <Select label="Canal" options={["WhatsApp + correo", "Solo WhatsApp", "Solo correo"]} defaultValue="WhatsApp + correo" />
              <Input label="Programar envío" type="date" hint="Vacío = inmediato" />
            </div>
            <Checkbox label="Solicitar confirmación de lectura" description="El apoderado responde 'Recibido' desde WhatsApp" defaultChecked />
          </div>
        </Dialog>
      </div>
    );
  };
})();
