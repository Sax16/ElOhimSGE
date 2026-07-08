import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@elohim/shared';
import { Alert, Button, Checkbox, Icons, Input } from '@elohim/ui';
import { ApiError, apiFetch } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
import { useMe, type Me } from '../../lib/useMe';
import { HOME_BY_ROLE } from '../../app/nav';
import { ForgotPasswordDialog } from './ForgotPasswordDialog';
import './login.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const [forgotOpen, setForgotOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: true },
  });

  // Ya hay sesión: no mostrar el login, ir directo al inicio del rol.
  if (me) return <Navigate to={HOME_BY_ROLE[me.role]} replace />;

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      const session = await apiFetch<Me>('/auth/login', { method: 'POST', body: values });
      queryClient.setQueryData(['me'], session);
      navigate(HOME_BY_ROLE[session.role], { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormError(err.message || 'Usuario o contraseña incorrectos');
      } else {
        setFormError('No se pudo conectar con el servidor');
      }
    }
  }

  return (
    <div className="login">
      {/* Panel de marca */}
      <div className="login__brand">
        <div className="login__texture" aria-hidden="true" />
        <div className="login__brand-head">
          <img src="/elohim-insignia.png" alt="" className="login__insignia" />
          <div>
            <div className="login__brand-name">Elohim SGE</div>
            <div className="login__brand-sub">Sistema de Gestión Escolar</div>
          </div>
        </div>
        <div className="login__brand-body">
          <div className="login__headline">Educación cristocéntrica, gestión moderna.</div>
          <p className="login__lede">
            Matrícula, notas, asistencia y pensiones de la I.E.P. Elohim en un solo lugar.
          </p>
        </div>
        <div className="login__brand-foot">Satipo, Junín · Año académico 2026</div>
      </div>

      {/* Panel de formulario */}
      <div className="login__form-panel">
        <div className="login__form-wrap">
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Bienvenido de nuevo
            </div>
            <h1 className="login__intro-title">Iniciar sesión</h1>
            <p className="login__intro-lede">Ingresa tus credenciales para acceder al panel.</p>
          </div>

          {formError && (
            <Alert tone="danger" title="No se pudo iniciar sesión" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <form className="login__form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="identifier"
              control={control}
              render={({ field: { ref: _ref, ...field } }) => (
                <Input
                  {...field}
                  label="Usuario o correo"
                  iconLeft={<Icons.User />}
                  placeholder="usuario o correo"
                  autoComplete="username"
                  autoFocus
                  error={errors.identifier?.message}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field: { ref: _ref, ...field } }) => (
                <Input
                  {...field}
                  type="password"
                  label="Contraseña"
                  iconLeft={<Icons.Lock />}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={errors.password?.message}
                />
              )}
            />
            <div className="login__options">
              <Controller
                name="remember"
                control={control}
                render={({ field: { value, onChange, onBlur, name } }) => (
                  <Checkbox
                    name={name}
                    label="Recordarme"
                    checked={!!value}
                    onBlur={onBlur}
                    onChange={(e) => onChange(e.target.checked)}
                  />
                )}
              />
              <a
                href="#"
                className="login__forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotOpen(true);
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Button type="submit" variant="primary" size="lg" block disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>

          <div className="login__help">
            ¿Problemas para ingresar? Contacta a Secretaría · (064) 545-210
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
