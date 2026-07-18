// Diálogo de composición de comunicado (nuevo o editar borrador). Título +
// mensaje + alcance con selectores encadenados (nivel → grado → sección). Dos
// acciones que guardan: "Guardar borrador" y "Guardar y enviar" (abre el envío).
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Dialog, Icons, Input, Select, Textarea, useToast } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import {
  useAnnouncementDetail,
  useAnnouncementOptions,
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from './api';
import { SCOPE_LABELS, SCOPE_ORDER } from './bits';
import type { Announcement, AnnouncementScope, CreateAnnouncementBody } from './types';

const schema = z
  .object({
    title: z.string().trim().min(1, 'Escribe un título.'),
    body: z.string().trim().min(1, 'Escribe el mensaje.'),
    scope: z.enum(['COLEGIO', 'NIVEL', 'GRADO', 'SECCION']),
    levelId: z.string().optional(),
    gradeLevelId: z.string().optional(),
    sectionId: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.scope === 'NIVEL' && !v.levelId)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['levelId'], message: 'Elige un nivel.' });
    if (v.scope === 'GRADO' && !v.gradeLevelId)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gradeLevelId'], message: 'Elige un grado.' });
    if (v.scope === 'SECCION' && !v.sectionId)
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sectionId'], message: 'Elige una sección.' });
  });

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  title: '',
  body: '',
  scope: 'COLEGIO',
  levelId: '',
  gradeLevelId: '',
  sectionId: '',
};

export interface ComposeDialogProps {
  open: boolean;
  /** Id del borrador a editar; null = nuevo. */
  announcementId: string | null;
  onClose: () => void;
  /** Se llama tras "Guardar y enviar" con el comunicado guardado. */
  onRequestSend: (announcement: Announcement) => void;
}

export function ComposeDialog({ open, announcementId, onClose, onRequestSend }: ComposeDialogProps) {
  const { toast } = useToast();
  const isEdit = !!announcementId;

  const { data: options } = useAnnouncementOptions(open);
  const { data: detail } = useAnnouncementDetail(open ? announcementId : null);
  const createMut = useCreateAnnouncement();
  const updateMut = useUpdateAnnouncement();

  const { control, handleSubmit, watch, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  const scope = watch('scope');
  const levelId = watch('levelId');
  const gradeLevelId = watch('gradeLevelId');

  // Prefill al abrir (nuevo = vacío; editar = detalle cargado).
  useEffect(() => {
    if (!open) return;
    if (isEdit && detail) {
      reset({
        title: detail.title,
        body: detail.body,
        scope: detail.scope,
        levelId: detail.levelId ?? '',
        gradeLevelId: detail.gradeLevelId ?? '',
        sectionId: detail.sectionId ?? '',
      });
    } else if (!isEdit) {
      reset(EMPTY);
    }
  }, [open, isEdit, detail, reset]);

  const grades = useMemo(
    () => (options?.grades ?? []).filter((g) => g.levelId === levelId),
    [options, levelId],
  );
  const sections = useMemo(
    () => (options?.sections ?? []).filter((s) => s.gradeLevelId === gradeLevelId),
    [options, gradeLevelId],
  );

  const pending = createMut.isPending || updateMut.isPending;

  const buildBody = (v: FormValues): CreateAnnouncementBody => ({
    title: v.title.trim(),
    body: v.body.trim(),
    scope: v.scope,
    levelId: v.scope === 'NIVEL' ? v.levelId : undefined,
    gradeLevelId: v.scope === 'GRADO' ? v.gradeLevelId : undefined,
    sectionId: v.scope === 'SECCION' ? v.sectionId : undefined,
  });

  const save = (v: FormValues, andSend: boolean) => {
    const body = buildBody(v);
    const onError = (err: unknown) =>
      toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    const onOk = (item: Announcement) => {
      onClose();
      if (andSend) {
        onRequestSend(item);
      } else {
        toast('info', 'Borrador guardado', 'Lo encuentras en la lista con estado Borrador.');
      }
    };
    if (isEdit && announcementId) {
      updateMut.mutate({ id: announcementId, body }, { onSuccess: onOk, onError });
    } else {
      createMut.mutate(body, { onSuccess: onOk, onError });
    }
  };

  const onDraft = handleSubmit((v) => save(v, false));
  const onSaveSend = handleSubmit((v) => save(v, true));

  const setScope = (value: AnnouncementScope) => {
    setValue('scope', value);
    // Limpia lo que ya no aplica al nuevo alcance.
    if (value === 'COLEGIO' || value === 'NIVEL') {
      setValue('gradeLevelId', '');
      setValue('sectionId', '');
    }
    if (value === 'COLEGIO') setValue('levelId', '');
    if (value !== 'SECCION') setValue('sectionId', '');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Megaphone />}
      title={isEdit ? 'Editar comunicado' : 'Nuevo comunicado'}
      description="Llega al contacto principal de cada familia del alcance"
      footer={
        <>
          <Button variant="secondary" onClick={() => onDraft()} disabled={pending}>
            Guardar borrador
          </Button>
          <Button variant="primary" iconLeft={<Icons.Send />} onClick={() => onSaveSend()} disabled={pending}>
            Guardar y enviar
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Input
              label="Título"
              required
              placeholder="Ej. Reunión de apoderados"
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="body"
          control={control}
          render={({ field, fieldState }) => (
            <Textarea
              label="Mensaje"
              required
              rows={5}
              placeholder="Estimadas familias…"
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Controller
            name="scope"
            control={control}
            render={({ field }) => (
              <Select
                label="Alcance"
                required
                value={field.value}
                onChange={(e) => setScope(e.target.value as AnnouncementScope)}
                options={SCOPE_ORDER.map((s) => ({ value: s, label: SCOPE_LABELS[s] }))}
              />
            )}
          />

          {(scope === 'NIVEL' || scope === 'GRADO' || scope === 'SECCION') && (
            <Controller
              name="levelId"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  label="Nivel"
                  required
                  placeholder="Elige un nivel"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setValue('gradeLevelId', '');
                    setValue('sectionId', '');
                  }}
                  options={(options?.levels ?? []).map((l) => ({ value: l.id, label: l.name }))}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}

          {(scope === 'GRADO' || scope === 'SECCION') && (
            <Controller
              name="gradeLevelId"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  label="Grado"
                  required
                  placeholder={levelId ? 'Elige un grado' : 'Elige un nivel primero'}
                  value={field.value}
                  disabled={!levelId}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setValue('sectionId', '');
                  }}
                  options={grades.map((g) => ({ value: g.id, label: g.label }))}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}

          {scope === 'SECCION' && (
            <Controller
              name="sectionId"
              control={control}
              render={({ field, fieldState }) => (
                <Select
                  label="Sección"
                  required
                  placeholder={gradeLevelId ? 'Elige una sección' : 'Elige un grado primero'}
                  value={field.value}
                  disabled={!gradeLevelId}
                  onChange={field.onChange}
                  options={sections.map((s) => ({ value: s.id, label: s.label }))}
                  error={fieldState.error?.message}
                />
              )}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
}
