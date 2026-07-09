// Alta / edición de apoderado (spec del prototipo GuardiansScreen.jsx).
import { useEffect, useState } from 'react';
import { Button, Dialog, Icons, Input, Select, useToast } from '@elohim/ui';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  type NotificationChannel,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useCreateGuardian, useUpdateGuardian } from './api';
import type { GuardianDetail, GuardianListItem } from './types';

export interface GuardianFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Apoderado a editar; ausente = alta. */
  guardian?: GuardianDetail | null;
  readOnly?: boolean;
  /** Se invoca con el apoderado recién creado (p. ej. para vincularlo enseguida). */
  onCreated?: (guardian: GuardianListItem) => void;
}

export function GuardianFormDialog({
  open,
  onClose,
  guardian,
  readOnly = false,
  onCreated,
}: GuardianFormDialogProps) {
  const { toast } = useToast();
  const createGuardian = useCreateGuardian();
  const updateGuardian = useUpdateGuardian();
  const edit = guardian ?? null;

  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [channel, setChannel] = useState<NotificationChannel>('WHATSAPP_Y_CORREO');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setFullName(edit?.fullName ?? '');
    setDni(edit?.dni ?? '');
    setPhone(edit?.phone ?? '');
    setEmail(edit?.email ?? '');
    setAddress(edit?.address ?? '');
    setChannel(edit?.notificationChannel ?? 'WHATSAPP_Y_CORREO');
    setErrors({});
  }, [open, edit?.id]);

  const pending = createGuardian.isPending || updateGuardian.isPending;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Ingresa nombres y apellidos.';
    if (!/^\d{8}$/.test(dni.trim())) e.dni = 'El DNI debe tener 8 dígitos.';
    if (!phone.trim()) e.phone = 'Ingresa un teléfono.';
    if (!address.trim()) e.address = 'Ingresa una dirección.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (readOnly || !validate()) return;
    const body = {
      fullName: fullName.trim(),
      dni: dni.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      notificationChannel: channel,
    };
    const onError = (err: unknown) => {
      if (err instanceof ApiError && err.errors?.length) {
        setErrors(Object.fromEntries(err.errors.map((f) => [f.path, f.message])));
      }
      toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    };
    if (edit) {
      updateGuardian.mutate(
        { id: edit.id, body },
        {
          onSuccess: () => {
            toast('success', 'Apoderado actualizado', `${body.fullName} guardado.`);
            onClose();
          },
          onError,
        },
      );
    } else {
      createGuardian.mutate(body, {
        onSuccess: (created) => {
          toast(
            'success',
            'Apoderado registrado',
            'Ya puedes vincularlo desde la matrícula o la ficha del estudiante.',
          );
          onCreated?.(created);
          onClose();
        },
        onError,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Home />}
      title={edit ? `Editar · ${edit.fullName}` : 'Registrar apoderado'}
      description="El apoderado podrá vincularse a uno o más estudiantes"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={pending || readOnly} onClick={submit}>
            {edit ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Input
          label="Nombres y apellidos"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="Ej. Juana Roca Pérez"
          containerStyle={{ gridColumn: '1 / -1' }}
        />
        <Input
          label="DNI"
          required
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
          error={errors.dni}
          inputMode="numeric"
          style={{ fontFamily: 'var(--font-mono)' }}
          placeholder="00000000"
        />
        <Input
          label="Teléfono (WhatsApp)"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          inputMode="tel"
          placeholder="9__ ___ ___"
        />
        <Input
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          hint="Opcional"
          placeholder="familia@gmail.com"
        />
        <Select
          label="Canal de notificaciones"
          options={NOTIFICATION_CHANNELS.map((c) => ({ value: c, label: NOTIFICATION_CHANNEL_LABELS[c] }))}
          value={channel}
          onChange={(e) => setChannel(e.target.value as NotificationChannel)}
        />
        <Input
          label="Dirección"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={errors.address}
          placeholder="Jr. …, Satipo"
          containerStyle={{ gridColumn: '1 / -1' }}
        />
      </div>
    </Dialog>
  );
}
