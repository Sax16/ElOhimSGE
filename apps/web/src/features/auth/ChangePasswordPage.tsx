// Cambio de clave obligatorio al primer ingreso (mustChangePassword). Genérico
// para cualquier rol: se muestra antes de entrar a cualquier ruta (lo intercepta
// RequireAuth). Misma estética partida del login.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Icons, Input } from '@elohim/ui';
import { ApiError, apiFetch } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
import './login.css';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresa tu contraseña temporal'),
    newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Repite la nueva contraseña'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

type ChangePasswordForm = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  async function onSubmit(values: ChangePasswordForm) {
    setFormError(null);
    try {
      await apiFetch<{ ok: boolean }>('/auth/change-password', {
        method: 'POST',
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      });
      // La sesión ya no exige cambio: refrescar /auth/me para que los guards sigan.
      await queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError('currentPassword', { message: err.message || 'La contraseña actual no es correcta' });
      } else {
        setFormError('No se pudo cambiar la contraseña. Inténtalo de nuevo.');
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
          <div className="login__headline">Protege tu cuenta.</div>
          <p className="login__lede">
            Como es tu primer ingreso, crea una contraseña nueva que solo tú conozcas.
          </p>
        </div>
        <div className="login__brand-foot">Satipo, Junín · Año académico 2026</div>
      </div>

      {/* Panel de formulario */}
      <div className="login__form-panel">
        <div className="login__form-wrap">
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              Primer ingreso
            </div>
            <h1 className="login__intro-title">Cambia tu contraseña</h1>
            <p className="login__intro-lede">
              Reemplaza la contraseña temporal por una nueva de al menos 8 caracteres.
            </p>
          </div>

          {formError && (
            <Alert tone="danger" title="No se pudo cambiar" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <form className="login__form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Input
              type="password"
              label="Contraseña temporal"
              iconLeft={<Icons.Lock />}
              placeholder="••••••••"
              autoComplete="current-password"
              autoFocus
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              type="password"
              label="Nueva contraseña"
              iconLeft={<Icons.Lock />}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              type="password"
              label="Repite la nueva contraseña"
              iconLeft={<Icons.Lock />}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" variant="primary" size="lg" block disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Guardar y continuar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
