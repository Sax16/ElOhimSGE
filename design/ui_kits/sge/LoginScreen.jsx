/* Elohim SGE — Login screen. Registers window.SGE_Login. */
(function () {
  const { Input, Button, Checkbox, Alert, Dialog, Radio, RadioGroup } = window.ElohimSGEDesignSystem_956020;
  const Ic = window.SGEIcons;

  window.SGE_Login = function Login({ onLogin }) {
    const [user, setUser] = React.useState("director");
    const [pass, setPass] = React.useState("••••••••");
    const [err, setErr] = React.useState(false);
    const [forgot, setForgot] = React.useState(false);
    const [sent, setSent] = React.useState(false);
    const [rol, setRol] = React.useState("admin");

    return (
      <div style={{ minHeight: "100%", display: "grid", gridTemplateColumns: "1.1fr 1fr", background: "var(--surface-app)" }}>
        {/* Brand panel */}
        <div style={{
          position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "48px 52px", color: "#fff", overflow: "hidden",
          background: "linear-gradient(155deg, var(--blue-700), var(--blue-900) 70%)",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
            <img src="../../assets/elohim-insignia.png" alt="" style={{ width: 56, height: 56, objectFit: "contain" }} />
            <div>
              <div style={{ font: "var(--type-h3)", color: "#fff", letterSpacing: ".02em" }}>Elohim SGE</div>
              <div style={{ font: "var(--type-caption)", color: "var(--blue-200)" }}>Sistema de Gestión Escolar</div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ font: "var(--type-display)", fontSize: "2.4rem", lineHeight: 1.15, color: "#fff", maxWidth: 420 }}>
              Educación cristocéntrica, gestión moderna.
            </div>
            <p style={{ font: "var(--type-body-md)", color: "var(--blue-100)", marginTop: 16, maxWidth: 400 }}>
              Matrícula, notas, asistencia y pensiones de la I.E.P. Elohim en un solo lugar.
            </p>
          </div>
          <div style={{ position: "relative", font: "var(--type-caption)", color: "var(--blue-300)" }}>
            Satipo, Junín · Año académico 2026
          </div>
        </div>

        {/* Form panel */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Bienvenido de nuevo</div>
              <h1 style={{ font: "var(--type-h1)" }}>Iniciar sesión</h1>
              <p style={{ font: "var(--type-body)", color: "var(--text-muted)", marginTop: 6 }}>Ingresa tus credenciales para acceder al panel.</p>
            </div>
            {err && <Alert tone="danger" title="Credenciales inválidas">Verifica tu usuario y contraseña.</Alert>}
            <form style={{ display: "flex", flexDirection: "column", gap: 16 }} onSubmit={(e) => { e.preventDefault(); onLogin(rol); }}>
              <Input label="Usuario o correo" value={user} onChange={(e) => setUser(e.target.value)}
                iconLeft={<Ic.User />} placeholder="usuario" />
              <Input label="Contraseña" type="password" value={pass} onChange={(e) => setPass(e.target.value)}
                iconLeft={<Ic.Lock />} placeholder="••••••••" />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Checkbox label="Recordarme" defaultChecked />
                <a href="#" style={{ font: "var(--type-label)" }} onClick={(e) => { e.preventDefault(); setSent(false); setForgot(true); }}>¿Olvidaste tu contraseña?</a>
              </div>
              <div style={{ background: "var(--surface-sunken)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Demo · ingresar como</div>
                <RadioGroup name="rol" value={rol} onChange={(e) => setRol(e.target.value)} row>
                  <Radio value="admin" label="Administrador" />
                  <Radio value="docente" label="Docente" />
                  <Radio value="porteria" label="Portería" />
                </RadioGroup>
              </div>
              <Button type="submit" variant="primary" size="lg" block>Entrar al sistema</Button>
            </form>
            <div style={{ font: "var(--type-caption)", color: "var(--text-subtle)", textAlign: "center" }}>
              ¿Problemas para ingresar? Contacta a Secretaría · (064) 545-210
            </div>
          </div>
        </div>

        <Dialog open={forgot} onClose={() => setForgot(false)} title="Recuperar contraseña" icon={<Ic.Lock />}
          description="Te enviaremos un enlace para restablecerla"
          footer={sent
            ? <Button variant="primary" onClick={() => setForgot(false)}>Entendido</Button>
            : <React.Fragment>
                <Button variant="secondary" onClick={() => setForgot(false)}>Cancelar</Button>
                <Button variant="primary" iconLeft={<Ic.Mail />} onClick={() => setSent(true)}>Enviar enlace</Button>
              </React.Fragment>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
            {sent
              ? <Alert tone="success" title="Enlace enviado">Revisa tu correo institucional. El enlace vence en 30 minutos.</Alert>
              : <Input label="Correo o usuario" placeholder="usuario@elohim.edu.pe" iconLeft={<Ic.Mail />} autoFocus />}
          </div>
        </Dialog>
      </div>
    );
  };
})();
