/* Elohim SGE — Apoderados. Registers window.SGE_Guardians.
   Listado + ficha con hijos vinculados (relación N:M) y estado de cuenta consolidado. */
(function () {
  const { Card, Table, Badge, Avatar, Button, IconButton, Input, Select, Tooltip, Dialog, Pagination, Alert } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);
  const fmt = (n) => `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  const DATA = [
    ["A-0211", "Juana Roca Pérez", "Madre", "964 221 880", 2, 0, "var(--gold-500)",
      [["María Quispe Roca", "3° B Primaria", 0], ["Pedro Quispe Roca", "Inicial · 5 años", 0]]],
    ["A-0212", "Óscar Ramos Díaz", "Padre", "989 410 227", 1, 280, "var(--blue-500)",
      [["José Ramos Lía", "5° B Primaria", 280]]],
    ["A-0230", "Silvia Mendoza Cruz", "Madre", "913 552 090", 1, 620, "var(--green-500)",
      [["Ana Flores Mendoza", "1° A Secundaria", 620]]],
    ["A-0242", "Elena Vega Torres", "Abuela", "942 118 306", 1, 0, "var(--brown-400)",
      [["Rosa Lima Vega", "2° B Primaria", 0]]],
    ["A-0251", "Marcos Vela Ruiz", "Padre", "955 023 481", 2, 560, "var(--blue-400)",
      [["Hugo Vela Soto", "6° A Primaria", 560], ["Iris Vela Soto", "2° A Secundaria", 0]]],
  ];

  function Ficha({ g, onClose, onEdit }) {
    const cols = [
      { key: "hijo", header: "Estudiante", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
            <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.ubic}</span>
          </div>
        </div>) },
      { key: "deuda", header: "Deuda", num: true, mono: true, render: (v) => (
        <span style={{ color: v > 0 ? "var(--danger)" : "var(--text-muted)" }}>{v > 0 ? fmt(v) : "Al día"}</span>) },
      { key: "acc", header: "", align: "right", render: () => (
        <Tooltip content="Ver ficha del estudiante"><IconButton label="Ver" size="sm" onClick={() => { onClose(); goTo("est"); notify("info", "Estudiantes", "Abriendo el módulo con la ficha del estudiante."); }}><Ic.Eye /></IconButton></Tooltip>) },
    ];
    return (
      <Dialog open={!!g} onClose={onClose} size="lg" title={g.nombre}
        description={`${g.cod} · ${g.rel} · ${g.tel}`} icon={<Ic.Users />}
        footer={<>
          <Button variant="secondary" iconLeft={<Ic.Send />} onClick={() => notify("success", "Recordatorio enviado", `${g.nombre} recibirá el estado de cuenta por WhatsApp.`)}>Enviar recordatorio de pago</Button>
          <Button variant="primary" iconLeft={<Ic.Pencil />} onClick={onEdit}>Editar</Button>
        </>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
          {g.deuda > 0
            ? <Alert tone="warning" title={`Deuda familiar: ${fmt(g.deuda)}`}>Consolidada entre sus {g.hijos.length > 1 ? `${g.hijos.length} hijos` : "hijo"}.</Alert>
            : <Alert tone="success" title="Familia al día">Sin cuotas pendientes ni vencidas.</Alert>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["DNI", "41 220 876"], ["Correo", "familia@gmail.com"], ["Dirección", "Jr. Los Cedros 245, Satipo"], ["Notificaciones", "WhatsApp + correo"]].map(([k, v]) => (
              <div key={k}>
                <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
                <div style={{ font: "var(--type-body)", color: "var(--text-body)" }}>{v}</div>
              </div>
            ))}
          </div>
          <Card flush title={`Hijos en la institución (${g.hijos.length})`}>
            <Table columns={cols} data={g.hijos.map((h) => ({ hijo: h[0], ubic: h[1], deuda: h[2] }))} compact />
          </Card>
        </div>
      </Dialog>
    );
  }

  window.SGE_Guardians = function Guardians() {
    const [ficha, setFicha] = React.useState(null);
    const [form, setForm] = React.useState(null); // {g?} nuevo o editar
    const cols = [
      { key: "cod", header: "Código", mono: true, width: 84 },
      { key: "nombre", header: "Apoderado", render: (v, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={v} size="sm" color={r.color} />
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
        </div>) },
      { key: "rel", header: "Relación", align: "center", render: (v) => <Badge tone="neutral">{v}</Badge> },
      { key: "tel", header: "Teléfono", mono: true },
      { key: "nh", header: "Hijos", align: "center", mono: true },
      { key: "deuda", header: "Deuda familiar", num: true, mono: true, render: (v) => (
        v > 0 ? <span style={{ color: "var(--danger)", fontWeight: 600 }}>{fmt(v)}</span> : <Badge tone="success" dot>Al día</Badge>) },
      { key: "acc", header: "", align: "right", render: (_, r) => (
        <div style={{ display: "inline-flex", gap: 2 }}>
          <Tooltip content="Ver ficha"><IconButton label="Ver" size="sm" onClick={() => setFicha(r)}><Ic.Eye /></IconButton></Tooltip>
          <Tooltip content="Enviar recordatorio"><IconButton label="Recordatorio" size="sm" onClick={() => notify("success", "Recordatorio enviado", `${r.nombre} · ${r.deuda > 0 ? `deuda de ${fmt(r.deuda)}` : "sin deuda"} · vía WhatsApp.`)}><Ic.Send /></IconButton></Tooltip>
        </div>) },
    ];
    const rows = DATA.map((d) => ({ cod: d[0], nombre: d[1], rel: d[2], tel: d[3], nh: d[4], deuda: d[5], color: d[6], hijos: d[7] }));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Input placeholder="Buscar por nombre, DNI o teléfono…" iconLeft={<Ic.Search />} />
          </div>
          <Select placeholder="Estado de cuenta" options={["Al día", "Con deuda"]} containerStyle={{ width: 170 }} />
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setForm({})}>Registrar apoderado</Button>
        </div>
        <Card flush>
          <Table columns={cols} data={rows} hover zebra />
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)" }}>
            <Pagination page={1} pageCount={18} onPageChange={() => {}} total={356} pageSize={20} />
          </div>
        </Card>
        {ficha && <Ficha g={ficha} onClose={() => setFicha(null)} onEdit={() => { const g = ficha; setFicha(null); setForm({ g }); }} />}

        {/* Nuevo / editar apoderado */}
        <Dialog open={!!form} onClose={() => setForm(null)} size="lg"
          title={form && form.g ? `Editar · ${form.g.nombre}` : "Registrar apoderado"} icon={<Ic.Users />}
          description="El apoderado podrá vincularse a uno o más estudiantes"
          footer={<><Button variant="secondary" onClick={() => setForm(null)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { notify("success", form.g ? "Apoderado actualizado" : "Apoderado registrado", form.g ? `${form.g.nombre} guardado.` : "Ya puedes vincularlo desde la matrícula o la ficha del estudiante."); setForm(null); }}>
              {form && form.g ? "Guardar cambios" : "Registrar"}</Button></>}>
          {form && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
              <Input label="Nombres y apellidos" required defaultValue={form.g ? form.g.nombre : ""} placeholder="Ej. Juana Roca Pérez" containerStyle={{ gridColumn: "1 / -1" }} />
              <Input label="DNI" required defaultValue={form.g ? "41 220 876" : ""} placeholder="00000000" />
              <Select label="Relación" options={["Madre", "Padre", "Abuelo/a", "Tío/a", "Tutor legal"]} defaultValue={form.g ? form.g.rel : undefined} placeholder="Seleccione" />
              <Input label="Teléfono (WhatsApp)" required defaultValue={form.g ? form.g.tel : ""} placeholder="9__ ___ ___" />
              <Input label="Correo" type="email" defaultValue={form.g ? "familia@gmail.com" : ""} placeholder="opcional" />
              <Input label="Dirección" placeholder="Jr. …, Satipo" containerStyle={{ gridColumn: "1 / -1" }} defaultValue={form.g ? "Jr. Los Cedros 245, Satipo" : ""} />
              <Select label="Canal de notificaciones" options={["WhatsApp + correo", "Solo WhatsApp", "Solo correo", "Ninguno"]} defaultValue="WhatsApp + correo" />
            </div>
          )}
        </Dialog>
      </div>
    );
  };
})();
