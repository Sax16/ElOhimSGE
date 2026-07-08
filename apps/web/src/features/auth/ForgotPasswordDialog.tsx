import { Alert, Button, Dialog, Icons } from '@elohim/ui';

/**
 * Diálogo de recuperación de contraseña (R1).
 * Todavía no hay envío de correos: se explica al usuario que debe contactar
 * al administrador / Secretaría para que le restablezcan la contraseña.
 */
export function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      icon={<Icons.Lock />}
      title="Recuperar contraseña"
      description="Restablece tu acceso con ayuda del administrador"
      footer={
        <Button variant="primary" onClick={onClose}>
          Entendido
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Alert tone="info" title="Aún no enviamos correos de recuperación">
          El sistema todavía no restablece contraseñas por correo. Para recuperar tu acceso, contacta
          al administrador o a Secretaría y te asignarán una contraseña nueva.
        </Alert>
        <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: 0 }}>
          Secretaría · <span style={{ fontFamily: 'var(--font-mono)' }}>(064) 545-210</span>
        </p>
      </div>
    </Dialog>
  );
}
