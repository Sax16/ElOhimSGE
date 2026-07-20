// Gestión del acceso al portal desde la ficha del apoderado: estado (Sin acceso
// / Activo con usuario) + botón para generar o regenerar la clave. La clave
// temporal se muestra UNA sola vez (con botón copiar y aviso).
import { useState } from 'react';
import { Alert, Badge, Button, Dialog, IconButton, Icons, Tooltip, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useGenerateAccess, useGuardianAccess } from './api';
import type { GuardianAccessCredential } from './types';

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

/** Campo de credencial en mono con botón de copiar. */
export function CredentialField({ label, value }: { label: string; value: string }) {
  const { toast } = useToast();
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--surface-sunken)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <span
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-strong)',
            wordBreak: 'break-all',
          }}
        >
          {value}
        </span>
        <Tooltip content="Copiar">
          <IconButton
            label={`Copiar ${label.toLowerCase()}`}
            size="sm"
            onClick={async () => {
              const ok = await copyText(value);
              toast(ok ? 'success' : 'danger', ok ? 'Copiado' : 'No se pudo copiar', `${label}: ${value}`);
            }}
          >
            <Icons.Copy />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

/** Sección "Portal" para la ficha del apoderado. */
export function GuardianAccessSection({
  guardianId,
  readOnly,
}: {
  guardianId: string;
  readOnly?: boolean;
}) {
  const { data: access, isLoading } = useGuardianAccess(guardianId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasAccess = access?.status === 'ACTIVO';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        padding: '12px 14px',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-sunken)',
      }}
    >
      <Icons.Lock style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>Acceso al portal</div>
        <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)', marginTop: 2 }}>
          {isLoading
            ? 'Consultando…'
            : hasAccess
              ? 'El apoderado puede iniciar sesión en el portal.'
              : 'Aún no tiene usuario para el portal.'}
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
      {!readOnly && !isLoading && (
        <Button
          size="sm"
          variant={hasAccess ? 'secondary' : 'primary'}
          iconLeft={<Icons.Lock />}
          onClick={() => setDialogOpen(true)}
        >
          {hasAccess ? 'Regenerar clave' : 'Generar acceso'}
        </Button>
      )}

      <AccessGenerateDialog
        open={dialogOpen}
        guardianId={guardianId}
        regenerate={hasAccess}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

function AccessGenerateDialog({
  open,
  guardianId,
  regenerate,
  onClose,
}: {
  open: boolean;
  guardianId: string;
  regenerate: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const generate = useGenerateAccess();
  const [credential, setCredential] = useState<GuardianAccessCredential | null>(null);

  const close = () => {
    setCredential(null);
    generate.reset();
    onClose();
  };

  const onGenerate = () => {
    generate.mutate(guardianId, {
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
            : 'Se creará un usuario y una clave temporal para el portal del apoderado.'
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
              Esta contraseña no se volverá a mostrar. Entrégala al apoderado; se le pedirá cambiarla
              en su primer ingreso.
            </Alert>
          </>
        ) : (
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: 0 }}>
            {regenerate
              ? 'Úsalo cuando el apoderado perdió su clave. El usuario se mantiene; solo cambia la contraseña.'
              : 'El apoderado usará estas credenciales para ver pagos, asistencia y notas de sus hijos.'}
          </p>
        )}
      </div>
    </Dialog>
  );
}
