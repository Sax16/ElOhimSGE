// Pestaña Usuarios y roles: listado, alta/edición, suspensión y restablecimiento de contraseña.
import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Icons,
  IconButton,
  Input,
  Table,
  useToast,
  type BadgeTone,
  type TableColumn,
} from '@elohim/ui';
import { USER_ROLE_LABELS, USER_STATUS_LABELS, type UserRole } from '@elohim/shared';
import { useMe } from '../../lib/useMe';
import { ApiError } from '../../lib/api';
import { UserDialog } from './UserDialog';
import { useResetPassword, useUpdateUser, useUsers, type ApiUser } from './api';

const ROLE_TONE: Record<UserRole, BadgeTone> = {
  ADMIN: 'accent',
  DOCENTE: 'brand',
  PORTERIA: 'success',
  SECRETARIA_CAJA: 'info',
  APODERADO: 'neutral',
};

export function UsersTab() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const usersQuery = useUsers();
  const updateUser = useUpdateUser();
  const resetPassword = useResetPassword();

  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ user: ApiUser | null } | null>(null);
  const [confirm, setConfirm] = useState<{ user: ApiUser; action: 'suspend' | 'reactivate' } | null>(null);
  const [reset, setReset] = useState<{ user: ApiUser; tempPassword: string | null } | null>(null);

  const users = usersQuery.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q),
    );
  }, [users, search]);

  const columns: TableColumn<ApiUser>[] = [
    {
      key: 'fullName',
      header: 'Usuario',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.fullName} size="sm" />
          <div style={{ minWidth: 0 }}>
            <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</div>
            <div style={{ font: 'var(--type-mono)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              {r.username}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      align: 'center',
      render: (_v, r) => <Badge tone={ROLE_TONE[r.role]}>{USER_ROLE_LABELS[r.role]}</Badge>,
    },
    {
      key: 'email',
      header: 'Correo',
      render: (_v, r) => r.email ?? '—',
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => {
        const status = r.status ?? 'ACTIVO';
        return (
          <Badge tone={status === 'ACTIVO' ? 'success' : 'neutral'} dot>
            {USER_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (_v, r) => {
        const isSelf = me?.id === r.id;
        const suspended = (r.status ?? 'ACTIVO') === 'SUSPENDIDO';
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconButton label="Editar" size="sm" onClick={() => setDialog({ user: r })}>
              <Icons.Pencil />
            </IconButton>
            <IconButton label="Restablecer contraseña" size="sm" onClick={() => setReset({ user: r, tempPassword: null })}>
              <Icons.Lock />
            </IconButton>
            <Button
              size="sm"
              variant={suspended ? 'ghost' : 'danger'}
              disabled={isSelf}
              onClick={() => setConfirm({ user: r, action: suspended ? 'reactivate' : 'suspend' })}
            >
              {suspended ? 'Reactivar' : 'Suspender'}
            </Button>
          </div>
        );
      },
    },
  ];

  function applyStatusChange() {
    if (!confirm) return;
    const nextStatus = confirm.action === 'suspend' ? 'SUSPENDIDO' : 'ACTIVO';
    updateUser.mutate(
      { id: confirm.user.id, body: { status: nextStatus } },
      {
        onSuccess: () => {
          toast(
            'success',
            confirm.action === 'suspend' ? 'Usuario suspendido' : 'Usuario reactivado',
            `${confirm.user.fullName} ${confirm.action === 'suspend' ? 'ya no puede ingresar' : 'puede ingresar de nuevo'}.`,
          );
          setConfirm(null);
        },
        onError: (err) => {
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
        },
      },
    );
  }

  function doResetPassword() {
    if (!reset) return;
    resetPassword.mutate(reset.user.id, {
      onSuccess: (data) => setReset({ user: reset.user, tempPassword: data.tempPassword }),
      onError: (err) => {
        toast('danger', 'No se pudo restablecer', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
      },
    });
  }

  async function copyPassword(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast('success', 'Contraseña copiada', 'Ya puedes pegarla donde la necesites.');
    } catch {
      toast('danger', 'No se pudo copiar', 'Cópiala manualmente.');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info" title="Roles del sistema">
        El Administrador todo lo puede. Secretaría opera matrícula y caja; los docentes ven solo sus aulas; Portería solo
        marca ingreso/salida del personal; el portal del apoderado llegará en una fase posterior.
      </Alert>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, justifyContent: 'space-between' }}>
        <Input
          placeholder="Buscar por nombre, usuario o correo"
          iconLeft={<Icons.Search />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerStyle={{ width: 320 }}
        />
        <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setDialog({ user: null })}>
          Nuevo usuario
        </Button>
      </div>

      <Card flush>
        <Table
          columns={columns}
          data={filtered}
          rowKey="id"
          hover
          emptyText={usersQuery.isLoading ? 'Cargando…' : 'Sin usuarios'}
        />
      </Card>

      {dialog && <UserDialog open onClose={() => setDialog(null)} user={dialog.user} />}

      {/* Confirmación de suspender / reactivar */}
      <Dialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'suspend' ? 'Suspender usuario' : 'Reactivar usuario'}
        icon={confirm?.action === 'suspend' ? <Icons.Lock /> : <Icons.Check />}
        iconTone={confirm?.action === 'suspend' ? 'danger' : 'success'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={updateUser.isPending}>
              Cancelar
            </Button>
            <Button
              variant={confirm?.action === 'suspend' ? 'danger' : 'primary'}
              onClick={applyStatusChange}
              disabled={updateUser.isPending}
            >
              {confirm?.action === 'suspend' ? 'Suspender' : 'Reactivar'}
            </Button>
          </>
        }
      >
        {confirm?.action === 'suspend'
          ? `${confirm?.user.fullName} no podrá iniciar sesión hasta que lo reactives. La cuenta y su historial se conservan.`
          : `${confirm?.user.fullName} podrá volver a iniciar sesión.`}
      </Dialog>

      {/* Restablecer contraseña */}
      <Dialog
        open={reset !== null}
        onClose={() => setReset(null)}
        title="Restablecer contraseña"
        icon={<Icons.Lock />}
        showClose={reset?.tempPassword == null}
        footer={
          reset?.tempPassword == null ? (
            <>
              <Button variant="secondary" onClick={() => setReset(null)} disabled={resetPassword.isPending}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={doResetPassword} disabled={resetPassword.isPending}>
                Restablecer
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setReset(null)}>
              Listo
            </Button>
          )
        }
      >
        {reset?.tempPassword == null ? (
          <span>
            Se generará una nueva contraseña temporal para <b>{reset?.user.fullName}</b>. La contraseña anterior dejará
            de funcionar y deberá cambiarla al ingresar.
          </span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Alert tone="success" title="Se muestra una sola vez">
              Compártela con {reset.user.fullName}. Deberá cambiarla al ingresar.
            </Alert>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  font: 'var(--type-mono)',
                  color: 'var(--text-strong)',
                  fontSize: 'var(--text-lg)',
                  letterSpacing: '0.04em',
                }}
              >
                {reset.tempPassword}
              </span>
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Icons.Copy />}
                onClick={() => copyPassword(reset.tempPassword as string)}
              >
                Copiar
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
