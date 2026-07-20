// Acceso al sistema desde la ficha del docente: estado (Sin acceso / Activo con
// usuario) + botón para generar o regenerar la clave. El docente entra con este
// usuario a su portal ("Mis clases"); al primer ingreso cambia su clave. Patrón
// idéntico al acceso del apoderado (GuardianAccess). La clave temporal se muestra
// UNA sola vez (con botón copiar y aviso). Solo para cargos docentes.
import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Dialog, Icons, Input, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { CredentialField } from '../guardians/GuardianAccess';
import { useGenerateStaffAccess, useStaffAccess } from './api';
import type { StaffAccessCredential } from './types';

/** Sección "Acceso al sistema" para la ficha del empleado docente. */
export function StaffAccessSection({
  staffId,
  canEdit,
}: {
  staffId: string;
  canEdit: boolean;
}) {
  const { data: access, isLoading, isError } = useStaffAccess(staffId);
  const [dialogOpen, setDialogOpen] = useState(false);

  // El GET responde 422 si el cargo no aplica: oculta la sección por completo.
  if (isError) return null;

  const hasAccess = access?.status === 'ACTIVO';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 14px',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-sunken)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Icons.Lock style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>Acceso al sistema</div>
          <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            {isLoading
              ? 'Consultando…'
              : hasAccess
                ? 'El docente puede iniciar sesión en su portal.'
                : 'Aún no tiene usuario para ingresar.'}
          </div>
        </div>
        {!isLoading &&
          (hasAccess ? (
            <Badge tone="success" dot>
              Activo · <span style={{ fontFamily: 'var(--font-mono)' }}>{access?.username}</span>
            </Badge>
          ) : (
            <Badge tone="neutral">Sin acceso</Badge>
          ))}
        {canEdit && !isLoading && (
          <Button
            size="sm"
            variant={hasAccess ? 'secondary' : 'primary'}
            iconLeft={<Icons.Lock />}
            onClick={() => setDialogOpen(true)}
          >
            {hasAccess ? 'Regenerar clave' : 'Generar acceso'}
          </Button>
        )}
      </div>
      <div style={{ font: 'var(--type-2xs)', color: 'var(--text-subtle)' }}>
        El docente entra con este usuario a su portal (Mis clases); al primer ingreso cambia su clave.
      </div>

      <AccessGenerateDialog
        open={dialogOpen}
        staffId={staffId}
        regenerate={hasAccess}
        suggestedUsername={access?.suggestedUsername ?? ''}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

function AccessGenerateDialog({
  open,
  staffId,
  regenerate,
  suggestedUsername,
  onClose,
}: {
  open: boolean;
  staffId: string;
  regenerate: boolean;
  suggestedUsername: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const generate = useGenerateStaffAccess(staffId);
  const [credential, setCredential] = useState<StaffAccessCredential | null>(null);
  const [username, setUsername] = useState('');

  // Al abrir en modo generación, precarga el usuario sugerido (editable).
  useEffect(() => {
    if (open && !regenerate) setUsername(suggestedUsername);
  }, [open, regenerate, suggestedUsername]);

  const close = () => {
    setCredential(null);
    generate.reset();
    onClose();
  };

  const onGenerate = () => {
    // En regeneración el username se ignora; en generación se manda el editado.
    generate.mutate(regenerate ? undefined : username.trim() || undefined, {
      onSuccess: (cred) => setCredential(cred),
      onError: (err) =>
        toast(
          'danger',
          'No se pudo generar el acceso',
          err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
        ),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      size="sm"
      icon={<Icons.Lock />}
      iconTone={credential ? 'success' : 'warning'}
      title={credential ? 'Acceso generado' : regenerate ? 'Regenerar clave' : 'Generar acceso'}
      description={
        credential
          ? 'Anótala ahora: no se volverá a mostrar.'
          : regenerate
            ? 'Se creará una clave temporal nueva y la anterior dejará de funcionar.'
            : 'Se creará un usuario y una clave temporal para el portal del docente.'
      }
      closeOnOverlay={!credential}
      footer={
        credential ? (
          <Button variant="primary" onClick={close}>
            Listo
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={generate.isPending}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={onGenerate} disabled={generate.isPending}>
              {generate.isPending ? 'Generando…' : regenerate ? 'Regenerar clave' : 'Generar acceso'}
            </Button>
          </>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        {credential ? (
          <>
            <CredentialField label="Usuario" value={credential.username} />
            <CredentialField label="Contraseña temporal" value={credential.tempPassword} />
            <Alert tone="warning" title="Anótala ahora">
              Esta contraseña no se volverá a mostrar. Entrégala al docente; se le pedirá cambiarla en
              su primer ingreso.
            </Alert>
          </>
        ) : regenerate ? (
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: 0 }}>
            Úsalo cuando el docente perdió su clave. El usuario se mantiene; solo cambia la contraseña.
          </p>
        ) : (
          <>
            <Input
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              hint="Sugerido a partir de la ficha; puedes ajustarlo."
              autoFocus
            />
            <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', margin: 0 }}>
              El docente usará estas credenciales para ver sus clases, tomar asistencia y registrar
              notas.
            </p>
          </>
        )}
      </div>
    </Dialog>
  );
}
