// Diálogo de crear/editar usuario, con permisos por módulo y entrega de credenciales.
import { useState } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Checkbox, Dialog, Icons, Input, Select, useToast } from '@elohim/ui';
import {
  DEFAULT_PERMISSIONS,
  PERMISSION_MODULES,
  USER_ROLE_LABELS,
  USER_ROLES,
  USER_STATUSES,
  USER_STATUS_LABELS,
  userCreateSchema,
  userUpdateSchema,
  type PermissionModule,
  type Permissions,
  type UserRole,
  type UserStatus,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import type { ApiUser } from './api';
import { useCreateUser, useUpdateUser } from './api';

const MODULE_LABELS: Record<PermissionModule, string> = {
  estructura: 'Estructura académica',
  estudiantes: 'Estudiantes',
  apoderados: 'Apoderados',
  matricula: 'Matrícula',
  tarifario: 'Tarifario',
  caja: 'Caja y cobros',
  pensiones: 'Pensiones',
  personal: 'Personal y planilla',
  marcacion: 'Marcación de personal',
  notas: 'Notas',
  asistencia: 'Asistencia',
  reportes: 'Reportes',
  comunicados: 'Comunicados',
  config: 'Configuración',
};

const NONE_PERMISSIONS: Permissions = Object.fromEntries(
  PERMISSION_MODULES.map((m) => [m, { ver: false, editar: false }]),
) as Permissions;

interface FormValues {
  fullName: string;
  username: string;
  email: string;
  role: '' | UserRole;
  status: UserStatus;
  permissions: Permissions;
}

export interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  /** Usuario a editar; null para crear uno nuevo. */
  user: ApiUser | null;
}

export function UserDialog({ open, onClose, user }: UserDialogProps) {
  const { toast } = useToast();
  const isEdit = user !== null;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [formError, setFormError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; tempPassword: string } | null>(null);

  const { control, handleSubmit, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? userUpdateSchema : userCreateSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      fullName: user?.fullName ?? '',
      username: user?.username ?? '',
      email: user?.email ?? '',
      role: user?.role ?? '',
      status: user?.status ?? 'ACTIVO',
      permissions: user?.permissions ?? NONE_PERMISSIONS,
    },
  });

  const permissions = watch('permissions');

  const togglePermission = (module: PermissionModule, action: 'ver' | 'editar', checked: boolean) => {
    setValue('permissions', {
      ...permissions,
      [module]: { ...permissions[module], [action]: checked },
    });
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    if (isEdit && user) {
      updateUser.mutate(
        {
          id: user.id,
          body: {
            fullName: values.fullName,
            username: values.username,
            email: values.email,
            role: values.role as UserRole,
            status: values.status,
            permissions: values.permissions,
          },
        },
        {
          onSuccess: () => {
            toast('success', 'Cambios guardados', `${values.fullName} se actualizó correctamente.`);
            onClose();
          },
          onError: (err) => handleError(err),
        },
      );
    } else {
      createUser.mutate(
        {
          fullName: values.fullName,
          username: values.username,
          email: values.email,
          role: values.role as UserRole,
          permissions: values.permissions,
        },
        {
          onSuccess: (created) => {
            setCredentials({ username: created.username, tempPassword: created.tempPassword });
          },
          onError: (err) => handleError(err),
        },
      );
    }
  });

  function handleError(err: unknown) {
    setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar. Inténtalo de nuevo.');
  }

  async function copyPassword(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast('success', 'Contraseña copiada', 'Ya puedes pegarla donde la necesites.');
    } catch {
      toast('danger', 'No se pudo copiar', 'Cópiala manualmente.');
    }
  }

  const pending = createUser.isPending || updateUser.isPending;

  // ---- Vista de credenciales (tras crear) --------------------------------
  if (credentials) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        size="lg"
        icon={<Icons.Check />}
        iconTone="success"
        title="Usuario creado"
        showClose={false}
        footer={
          <Button variant="primary" onClick={onClose}>
            Listo
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <Alert tone="success" title="Guárdala ahora — se muestra una sola vez">
            El usuario deberá cambiarla al ingresar por primera vez.
          </Alert>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Usuario</span>
            <span style={{ font: 'var(--type-mono)', color: 'var(--text-strong)', fontSize: 'var(--text-md)' }}>
              {credentials.username}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>Contraseña temporal</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  font: 'var(--type-mono)',
                  color: 'var(--text-strong)',
                  fontSize: 'var(--text-lg)',
                  letterSpacing: '0.04em',
                }}
              >
                {credentials.tempPassword}
              </span>
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Icons.Copy />}
                onClick={() => copyPassword(credentials.tempPassword)}
              >
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  // ---- Formulario de crear / editar --------------------------------------
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Lock />}
      title={isEdit ? `Editar · ${user?.fullName}` : 'Nuevo usuario'}
      description="El rol define el alcance base; los permisos lo afinan"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} onClick={() => onSubmit()} disabled={pending}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        {formError && <Alert tone="danger" title="No se pudo guardar">{formError}</Alert>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Controller
            name="fullName"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Nombre completo"
                required
                {...field}
                error={fieldState.error?.message}
                containerStyle={{ gridColumn: '1 / -1' }}
              />
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="Usuario"
                required
                hint="minúsculas, números, punto o guion"
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Input label="Correo" type="email" required {...field} error={fieldState.error?.message} />
            )}
          />
          <Controller
            name="role"
            control={control}
            render={({ field, fieldState }) => (
              <Select
                label="Rol"
                required
                placeholder="Seleccione"
                value={field.value}
                onChange={(e) => {
                  const next = e.target.value as UserRole;
                  field.onChange(next);
                  if (!isEdit && next) setValue('permissions', DEFAULT_PERMISSIONS[next]);
                }}
                error={fieldState.error?.message}
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r} disabled={r === 'APODERADO'}>
                    {USER_ROLE_LABELS[r]}
                    {r === 'APODERADO' ? ' — Próximamente' : ''}
                  </option>
                ))}
              </Select>
            )}
          />
          {isEdit && (
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Estado"
                  value={field.value}
                  onChange={field.onChange}
                  options={USER_STATUSES.map((s) => ({ value: s, label: USER_STATUS_LABELS[s] }))}
                />
              )}
            />
          )}
        </div>

        <div>
          <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)', marginBottom: 4 }}>Permisos por módulo</div>
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginBottom: 10 }}>
            El rol define el alcance base; los permisos lo afinan.
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto',
              gap: '8px 16px',
              alignItems: 'center',
            }}
          >
            <span />
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', textAlign: 'center' }}>Ver</span>
            <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', textAlign: 'center' }}>Editar</span>
            {PERMISSION_MODULES.map((m) => (
              <div key={m} style={{ display: 'contents' }}>
                <span style={{ font: 'var(--type-body)', color: 'var(--text-body)' }}>{MODULE_LABELS[m]}</span>
                <span style={{ display: 'flex', justifyContent: 'center' }}>
                  <Checkbox
                    checked={permissions[m].ver}
                    onChange={(e) => togglePermission(m, 'ver', e.target.checked)}
                    aria-label={`Ver ${MODULE_LABELS[m]}`}
                  />
                </span>
                <span style={{ display: 'flex', justifyContent: 'center' }}>
                  <Checkbox
                    checked={permissions[m].editar}
                    onChange={(e) => togglePermission(m, 'editar', e.target.checked)}
                    aria-label={`Editar ${MODULE_LABELS[m]}`}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
