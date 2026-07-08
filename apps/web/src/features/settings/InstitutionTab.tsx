// Pestaña Institución: identidad (insignia) y datos de la institución.
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Icons, Input, Textarea, useToast } from '@elohim/ui';
import { institutionUpdateSchema, type InstitutionUpdateInput } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useInstitution, useUpdateInstitution } from './api';

const EMPTY: InstitutionUpdateInput = {
  name: '',
  modularCode: '',
  ruc: '',
  address: '',
  phone: '',
  email: '',
  region: '',
  ugel: '',
  motto: '',
};

export function InstitutionTab() {
  const { toast } = useToast();
  const institutionQuery = useInstitution();
  const updateInstitution = useUpdateInstitution();

  const { control, handleSubmit, reset } = useForm<InstitutionUpdateInput>({
    resolver: zodResolver(institutionUpdateSchema),
    defaultValues: EMPTY,
  });

  // Carga los valores actuales en el formulario cuando llegan de la API.
  const data = institutionQuery.data;
  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        modularCode: data.modularCode,
        ruc: data.ruc,
        address: data.address,
        phone: data.phone,
        email: data.email,
        region: data.region,
        ugel: data.ugel,
        motto: data.motto ?? '',
      });
    }
  }, [data, reset]);

  const onSubmit = handleSubmit((values) => {
    updateInstitution.mutate(values, {
      onSuccess: () => toast('success', 'Datos actualizados', 'La información institucional se guardó correctamente.'),
      onError: (err) =>
        toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 18, alignItems: 'start' }}>
      <Card title="Identidad">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <img
            src="/elohim-insignia.png"
            alt="Insignia de la institución"
            style={{ width: 120, height: 120, objectFit: 'contain' }}
          />
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Icons.Download />}
            onClick={() => toast('info', 'Subir insignia', 'Disponible próximamente.')}
          >
            Subir insignia
          </Button>
          <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
            PNG o SVG · fondo transparente · mín. 512px
          </span>
        </div>
      </Card>

      <Card title="Datos de la institución">
        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Nombre"
                  {...field}
                  error={fieldState.error?.message}
                  containerStyle={{ gridColumn: '1 / -1' }}
                />
              )}
            />
            <Controller
              name="modularCode"
              control={control}
              render={({ field, fieldState }) => (
                <Input label="Código modular" hint="Asignado por MINEDU" {...field} error={fieldState.error?.message} />
              )}
            />
            <Controller
              name="ruc"
              control={control}
              render={({ field, fieldState }) => (
                <Input label="RUC" {...field} error={fieldState.error?.message} />
              )}
            />
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  label="Dirección"
                  {...field}
                  error={fieldState.error?.message}
                  containerStyle={{ gridColumn: '1 / -1' }}
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field, fieldState }) => (
                <Input label="Teléfono" {...field} error={fieldState.error?.message} />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Input label="Correo" type="email" {...field} error={fieldState.error?.message} />
              )}
            />
            <Controller
              name="region"
              control={control}
              render={({ field, fieldState }) => (
                <Input label="Región" {...field} error={fieldState.error?.message} />
              )}
            />
            <Controller
              name="ugel"
              control={control}
              render={({ field, fieldState }) => (
                <Input label="UGEL" {...field} error={fieldState.error?.message} />
              )}
            />
            <Controller
              name="motto"
              control={control}
              render={({ field, fieldState }) => (
                <Textarea
                  label="Lema"
                  rows={2}
                  {...field}
                  value={field.value ?? ''}
                  error={fieldState.error?.message}
                  containerStyle={{ gridColumn: '1 / -1' }}
                />
              )}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button
              type="submit"
              variant="primary"
              iconLeft={<Icons.Check />}
              disabled={updateInstitution.isPending || !institutionQuery.data}
            >
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
