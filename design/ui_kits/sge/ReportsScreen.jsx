/* Elohim SGE — Reportes. Registers window.SGE_Reports. */
(function () {
  const { Card, Table, Badge, Button, Select, Input, ProgressBar } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);

  const REPORTES = [
    { t: "Morosidad por grado", d: "Cuotas vencidas y deuda acumulada por nivel, grado y sección", icon: "Chart", tone: "danger" },
    { t: "Ingresos por concepto", d: "Pensiones, matrículas, programas y otros ingresos por periodo", icon: "Cash", tone: "success" },
    { t: "Padrón de estudiantes", d: "Lista completa con apoderados, contacto y estado de matrícula", icon: "Users", tone: "brand" },
    { t: "Asistencia mensual", d: "Estudiantes y personal: faltas, tardanzas y justificaciones", icon: "Calendar", tone: "accent" },
    { t: "Planilla anual", d: "Sueldos, descuentos y aportes por empleado, mes a mes", icon: "Building", tone: "brand" },
    { t: "Caja diaria", d: "Cobros por método y cobrador, arqueos y anulaciones", icon: "Receipt", tone: "success" },
  ];
  const TONE_BG = { danger: "var(--danger-soft)", success: "var(--success-soft)", brand: "var(--surface-brand-soft)", accent: "var(--surface-accent-soft)" };
  const TONE_FG = { danger: "var(--danger)", success: "var(--success)", brand: "var(--brand)", accent: "var(--gold-600)" };

  const MOROSIDAD = [
    ["Inicial", 62, 4, 640.0], ["1°–2° Primaria", 96, 7, 1420.0], ["3°–4° Primaria", 108, 9, 2130.0],
    ["5°–6° Primaria", 87, 6, 1300.0], ["Secundaria", 129, 11, 3050.0],
  ];

  window.SGE_Reports = function Reports() {
    const cols = [
      { key: "grupo", header: "Nivel / grado", render: (v) => <span style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>{v}</span> },
      { key: "est", header: "Estudiantes", align: "center", mono: true },
      { key: "deudores", header: "Con deuda", align: "center", render: (v, r) => (
        <Badge tone={v / r.est > 0.08 ? "danger" : "warning"} dot>{v}</Badge>) },
      { key: "pct", header: "% morosidad", render: (_, r) => (
        <div style={{ minWidth: 140 }}><ProgressBar value={(r.deudores / r.est) * 100} max={15} size="sm" tone="danger" showValue valueFormat={() => `${((r.deudores / r.est) * 100).toFixed(1)}%`} /></div>) },
      { key: "monto", header: "Deuda", num: true, mono: true, render: (v) => (
        <span style={{ fontWeight: 600, color: "var(--danger)" }}>S/ {v.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>) },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {REPORTES.map((r) => (
            <Card key={r.t} interactive onClick={() => notify("success", "Reporte generado", `"${r.t}" descargado en Excel.`)}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ width: 38, height: 38, borderRadius: "var(--radius-md)", background: TONE_BG[r.tone], color: TONE_FG[r.tone], display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {React.createElement(Ic[r.icon])}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ font: "var(--type-label)", fontWeight: 600, color: "var(--text-strong)" }}>{r.t}</div>
                  <div style={{ font: "var(--type-caption)", color: "var(--text-muted)", marginTop: 2 }}>{r.d}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <Select label="Periodo" options={["Julio 2026", "Junio 2026", "Bimestre II", "Año 2026"]} defaultValue="Julio 2026" containerStyle={{ width: 170 }} />
          <div style={{ flex: 1 }} />
          <Button variant="secondary" iconLeft={<Ic.Download />} onClick={() => notify("success", "Exportado", "Morosidad por grado · Julio 2026 · Excel.")}>Exportar vista</Button>
        </div>
        <Card flush title="Vista previa · Morosidad por grado" subtitle="Julio 2026 · S/ 8,540 en 37 cuotas vencidas">
          <Table columns={cols} data={MOROSIDAD.map((m) => ({ grupo: m[0], est: m[1], deudores: m[2], monto: m[3] }))} hover />
        </Card>
      </div>
    );
  };
})();
