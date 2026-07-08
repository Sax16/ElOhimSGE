/* Elohim SGE — Calendario académico. Registers window.SGE_Calendar.
   Tipos de evento: feriado/no lectivo (bloquea asistencia y marcación), exámenes,
   actividad institucional (enlaza a comunicados) y vencimiento de pensiones. */
(function () {
  const { Card, Badge, Button, IconButton, Input, Select, Textarea, Dialog, Alert, Tooltip, Checkbox } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;
  const notify = (tone, title, message) => window.SGEToast && window.SGEToast(tone, title, message);
  const goTo = (r) => window.SGENavigate && window.SGENavigate(r);

  const TIPOS = {
    feriado:  { label: "Feriado / no lectivo", color: "var(--danger)", soft: "var(--danger-soft)", fg: "var(--danger-soft-fg)" },
    examen:   { label: "Exámenes", color: "var(--brand)", soft: "var(--surface-brand-soft)", fg: "var(--info-soft-fg)" },
    actividad:{ label: "Actividad", color: "var(--gold-500)", soft: "var(--surface-accent-soft)", fg: "var(--gold-700)" },
    pension:  { label: "Vencimiento pensiones", color: "var(--success)", soft: "var(--success-soft)", fg: "var(--success-soft-fg)" },
  };
  // Julio 2026 — 1 = miércoles
  const EVENTOS = {
    6:  [{ t: "actividad", n: "Día del Maestro · actuación" }],
    13: [{ t: "examen", n: "Exámenes Bim. II · Com." }],
    14: [{ t: "examen", n: "Exámenes Bim. II · Mat." }],
    15: [{ t: "examen", n: "Exámenes Bim. II · CyT" }],
    16: [{ t: "examen", n: "Exámenes Bim. II · PS/Ing." }],
    17: [{ t: "examen", n: "Exámenes Bim. II · Arte/Rel." }],
    24: [{ t: "actividad", n: "Festival folclórico · aniversario Satipo" }],
    27: [{ t: "feriado", n: "Día no lectivo (puente)" }],
    28: [{ t: "feriado", n: "Fiestas Patrias" }],
    29: [{ t: "feriado", n: "Fiestas Patrias" }],
    31: [{ t: "pension", n: "Vence pensión de Julio" }],
  };

  window.SGE_Calendar = function Calendar() {
    const [nuevo, setNuevo] = React.useState(false);
    const [tipo, setTipo] = React.useState("feriado");
    const primerDia = 3; // 1 jul 2026 = miércoles (0=lunes)
    const dias = 31;
    const celdas = [];
    for (let i = 0; i < primerDia; i++) celdas.push(null);
    for (let d = 1; d <= dias; d++) celdas.push(d);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconButton label="Mes anterior" variant="outline" size="sm" onClick={() => notify("info", "Junio 2026", "Navegación entre meses (demo en Julio).")}><Ic.ChevronRight style={{ transform: "rotate(180deg)" }} /></IconButton>
            <span style={{ font: "var(--type-h3)", minWidth: 130, textAlign: "center" }}>Julio 2026</span>
            <IconButton label="Mes siguiente" variant="outline" size="sm" onClick={() => notify("info", "Agosto 2026", "Navegación entre meses (demo en Julio).")}><Ic.ChevronRight /></IconButton>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
            {Object.entries(TIPOS).map(([k, t]) => (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--type-caption)", color: "var(--text-muted)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: t.color }}></span>{t.label}
              </span>
            ))}
          </div>
          <Button variant="primary" iconLeft={<Ic.Plus />} onClick={() => setNuevo(true)}>Nuevo evento</Button>
        </div>

        <Card flush>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d, i) => (
              <div key={d} style={{ padding: "9px 10px", font: "var(--type-caption)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: i >= 5 ? "var(--text-subtle)" : "var(--text-muted)", textAlign: "center", borderBottom: "1px solid var(--border-subtle)" }}>{d}</div>
            ))}
            {celdas.map((d, i) => {
              const col = i % 7;
              const finde = col >= 5;
              const evs = d ? EVENTOS[d] || [] : [];
              const feriado = evs.some((e) => e.t === "feriado");
              return (
                <div key={i} style={{
                  minHeight: 86, padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)",
                  borderLeft: col > 0 ? "1px solid var(--border-subtle)" : "none",
                  background: d == null ? "var(--surface-sunken)" : feriado ? "var(--danger-soft)" : finde ? "var(--surface-sunken)" : "var(--surface-card)",
                  display: "flex", flexDirection: "column", gap: 4,
                }}>
                  {d && <span style={{ font: "var(--type-caption)", fontWeight: 600, color: d === 7 ? "var(--brand)" : finde || feriado ? "var(--text-subtle)" : "var(--text-body)" }}>{d}{d === 7 && <span style={{ font: "var(--type-2xs)", fontWeight: 400 }}> · hoy</span>}</span>}
                  {evs.map((e) => (
                    <span key={e.n} title={e.n}
                      onClick={() => e.t === "actividad"
                        ? notify("info", e.n, "Actividad institucional — puedes crear su comunicado desde aquí.")
                        : e.t === "pension"
                          ? (goTo("pagos"), notify("info", "Pensiones", "Abriendo las cuotas que vencen el 31/07."))
                          : notify("info", e.n, e.t === "feriado" ? "Día no lectivo: la asistencia queda bloqueada y no se computan tardanzas." : "Visible para los docentes en su portal.")}
                      style={{ font: "var(--type-2xs)", fontWeight: 600, color: TIPOS[e.t].fg, background: TIPOS[e.t].soft, borderLeft: `3px solid ${TIPOS[e.t].color}`, borderRadius: "var(--radius-xs)", padding: "3px 6px", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.n}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        <Alert tone="info" title="Efectos del calendario">Los días <b>feriados/no lectivos</b> bloquean la asistencia de estudiantes y la marcación de personal (sin tardanzas). Las fechas de <b>exámenes</b> se muestran al docente en su portal; las <b>actividades</b> pueden generar un comunicado; los <b>vencimientos</b> se enlazan con Pensiones.</Alert>

        <Dialog open={nuevo} onClose={() => setNuevo(false)} size="lg" title="Nuevo evento" icon={<Ic.Calendar />}
          footer={<><Button variant="secondary" onClick={() => setNuevo(false)}>Cancelar</Button>
            <Button variant="primary" iconLeft={<Ic.Check />} onClick={() => { setNuevo(false); notify("success", "Evento creado", tipo === "feriado" ? "Día marcado como no lectivo: asistencia y marcación bloqueadas." : "Evento agregado al calendario."); }}>Crear evento</Button></>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, paddingTop: 4 }}>
            <Input label="Nombre" required placeholder="Ej. Simulacro de sismo" containerStyle={{ gridColumn: "1 / -1" }} />
            <Select label="Tipo" options={[{ value: "feriado", label: "Feriado / no lectivo" }, { value: "examen", label: "Exámenes" }, { value: "actividad", label: "Actividad institucional" }, { value: "pension", label: "Vencimiento de pensiones" }]} value={tipo} onChange={(e) => setTipo(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Desde" type="date" defaultValue="2026-07-20" />
              <Input label="Hasta" type="date" defaultValue="2026-07-20" hint="Igual = un solo día" />
            </div>
            {tipo === "feriado" && <Alert tone="warning" style={{ gridColumn: "1 / -1" }}>Ese día se bloqueará la asistencia de estudiantes y la marcación de personal — no se computarán tardanzas ni faltas.</Alert>}
            {tipo === "actividad" && <div style={{ gridColumn: "1 / -1" }}><Checkbox label="Crear comunicado a las familias" description="Se abrirá como borrador en Comunicados" defaultChecked /></div>}
            <Textarea label="Descripción" rows={2} placeholder="Opcional…" containerStyle={{ gridColumn: "1 / -1" }} />
          </div>
        </Dialog>
      </div>
    );
  };
})();
