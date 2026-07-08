/* Elohim SGE — Dashboard. Registers window.SGE_Dashboard. */
(function () {
  const { StatCard, Card, Table, Badge, ProgressBar, Avatar, Button, Tag } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);

  const payCols = [
    { key: "est", header: "Estudiante", render: (v, r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={v} size="sm" color={r.color} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{v}</span>
          <span style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{r.grado}</span>
        </div>
      </div>) },
    { key: "concepto", header: "Concepto" },
    { key: "fecha", header: "Fecha", mono: true, align: "center" },
    { key: "monto", header: "Monto", num: true, mono: true, render: (v) => `S/ ${v}` },
    { key: "estado", header: "Estado", align: "center", render: (v) => (
      <Badge tone={v === "Pagado" ? "success" : v === "Pendiente" ? "warning" : "danger"} dot>{v}</Badge>) },
  ];
  const payRows = [
    { est: "María Quispe Roca", grado: "3° Primaria", concepto: "Pensión Junio", fecha: "28/06", monto: "280.00", estado: "Pagado", color: "var(--blue-500)" },
    { est: "José Ramos Lía", grado: "5° Primaria", concepto: "Pensión Junio", fecha: "27/06", monto: "280.00", estado: "Pendiente", color: "var(--gold-500)" },
    { est: "Ana Flores Mendoza", grado: "1° Secundaria", concepto: "Pensión Mayo", fecha: "15/05", monto: "310.00", estado: "Vencido", color: "var(--green-500)" },
    { est: "Luis Paz Cárdenas", grado: "4° Primaria", concepto: "Matrícula 2026", fecha: "26/06", monto: "150.00", estado: "Pagado", color: "var(--brown-400)" },
  ];

  const grados = [
    { g: "Inicial", val: 96 }, { g: "1° Prim", val: 88 }, { g: "2° Prim", val: 92 },
    { g: "3° Prim", val: 85 }, { g: "4° Prim", val: 79 }, { g: "5° Prim", val: 90 },
  ];

  const DEUDORES = [
    { fam: "Fam. Vela Soto", det: "2 cuotas · Hugo (6° A)", monto: 560, color: "var(--blue-400)" },
    { fam: "Fam. Flores Mendoza", det: "2 cuotas · Ana (1° Sec)", monto: 620, color: "var(--green-500)" },
    { fam: "Fam. Ramos Lía", det: "1 cuota · José (5° B)", monto: 280, color: "var(--gold-500)" },
    { fam: "Fam. Ñahui Cruz", det: "3 cuotas · Diego (3° Sec)", monto: 930, color: "var(--brown-400)" },
  ];
  const EGRESOS = [
    { c: "Planilla · Julio", d: "Vence 05/07 · 21 empleados", m: "S/ 25,174", urg: true },
    { c: "Servicios (luz, agua, internet)", d: "Vence 10/07", m: "S/ 1,180", urg: false },
    { c: "Editorial · libros 2° lote", d: "Vence 15/07", m: "S/ 4,600", urg: false },
  ];

  window.SGE_Dashboard = function Dashboard() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Estudiantes" value="482" icon={<Ic.Users />} delta={4.2} caption="vs. 2025" />
          <StatCard label="Cobrado · Junio" value="S/ 84,320" iconTone="success" icon={<Ic.Cash />} delta={6.1} caption="del mes" />
          <StatCard label="Morosidad" value="12.4%" iconTone="danger" icon={<Ic.Chart />} delta={1.3} deltaDirection="up" caption="60 cuotas" />
          <StatCard label="Asistencia hoy" value="93.8%" iconTone="accent" icon={<Ic.Calendar />} delta={0.7} caption="452 presentes" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
          {/* Recent payments */}
          <Card flush title="Pagos recientes" subtitle="Últimos movimientos de pensiones y matrículas"
            actions={<Button variant="ghost" size="sm" iconRight={<Ic.ChevronRight />} onClick={() => goTo("pagos")}>Ver todos</Button>}>
            <Table columns={payCols} data={payRows} hover />
          </Card>

          {/* Collection progress */}
          <Card title="Cobranza de Junio" subtitle="Meta mensual S/ 96,000">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ font: "var(--type-h1)", fontFamily: "var(--font-mono)", color: "var(--text-strong)" }}>S/ 84,320</span>
                  <span style={{ font: "var(--type-label)", color: "var(--success)" }}>87.8%</span>
                </div>
                <ProgressBar value={87.8} tone="success" />
              </div>
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                <span className="eyebrow">Asistencia por nivel</span>
                {grados.map((x) => (
                  <ProgressBar key={x.g} label={x.g} value={x.val} showValue size="sm"
                    tone={x.val >= 90 ? "success" : x.val >= 82 ? "brand" : "warning"} />
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* economic row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <Card flush title="Próximos egresos" subtitle="Lo que el colegio debe pagar pronto"
            actions={<Button variant="ghost" size="sm" iconRight={<Ic.ChevronRight />} onClick={() => goTo("docentes")}>Ver planilla</Button>}>
            <div>
              {EGRESOS.map((e) => (
                <div key={e.c} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: e.urg ? "var(--warning-soft)" : "var(--surface-sunken)", color: e.urg ? "var(--warning)" : "var(--text-muted)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}><Ic.Clock /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{e.c}</div>
                    <div style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{e.d}</div>
                  </div>
                  {e.urg && <Badge tone="warning" dot>Próximo</Badge>}
                  <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-strong)" }}>{e.m}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card flush title="Principales deudores" subtitle="Familias con cuotas vencidas — S/ 6,420 en total"
            actions={<Button variant="ghost" size="sm" iconRight={<Ic.ChevronRight />} onClick={() => goTo("pagos")}>Ver morosidad</Button>}>
            <div>
              {DEUDORES.map((d) => (
                <div key={d.fam} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderTop: "1px solid var(--border-subtle)" }}>
                  <Avatar name={d.fam.replace("Fam. ", "")} size="sm" color={d.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: "var(--type-label)", color: "var(--text-strong)" }}>{d.fam}</div>
                    <div style={{ font: "var(--type-2xs)", color: "var(--text-muted)" }}>{d.det}</div>
                  </div>
                  <span style={{ font: "var(--type-label)", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--danger)" }}>S/ {d.monto.toFixed(2)}</span>
                  <Button size="sm" variant="ghost" onClick={() => notify("success", "Recordatorio enviado", `${d.fam} · WhatsApp y correo al apoderado principal.`)}>Recordar</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };
})();
