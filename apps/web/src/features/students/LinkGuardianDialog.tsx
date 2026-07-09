// Vincular apoderado a un estudiante (relación N:M): buscar existente o registrar nuevo.
import { useEffect, useState } from 'react';
import { Avatar, Badge, Button, Checkbox, Dialog, Icons, Input, Select, useToast } from '@elohim/ui';
import { GUARDIAN_RELATIONS, GUARDIAN_RELATION_LABELS, type GuardianRelation } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useGuardianSearch } from '../guardians/api';
import { GuardianFormDialog } from '../guardians/GuardianFormDialog';
import type { GuardianListItem } from '../guardians/types';
import { useLinkGuardian } from './api';
import { avatarColor } from './bits';

export interface LinkGuardianDialogProps {
  studentId: string | null;
  onClose: () => void;
  readOnly?: boolean;
}

export function LinkGuardianDialog({ studentId, onClose, readOnly = false }: LinkGuardianDialogProps) {
  const { toast } = useToast();
  const link = useLinkGuardian();

  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<GuardianListItem | null>(null);
  const [relation, setRelation] = useState<GuardianRelation>('MADRE');
  const [isPrimary, setIsPrimary] = useState(false);
  const [newForm, setNewForm] = useState(false);

  const { data, isFetching } = useGuardianSearch(term);
  const results = data?.items ?? [];

  useEffect(() => {
    if (!studentId) return;
    setTerm('');
    setSelected(null);
    setRelation('MADRE');
    setIsPrimary(false);
    setNewForm(false);
  }, [studentId]);

  const doLink = (guardianId: string, onDone: () => void) => {
    if (!studentId) return;
    link.mutate(
      { studentId, guardianId, relation, isPrimary },
      {
        onSuccess: () => {
          toast('success', 'Apoderado vinculado', 'El apoderado quedó vinculado al estudiante.');
          onDone();
        },
        onError: (err) =>
          toast('danger', 'No se pudo vincular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <>
      <Dialog
        open={!!studentId && !newForm}
        onClose={onClose}
        icon={<Icons.Users />}
        title="Vincular apoderado"
        description="Busca un apoderado registrado o crea uno nuevo (relación N:M)"
        footer={
          <>
            <Button
              variant="secondary"
              iconLeft={<Icons.Plus />}
              disabled={readOnly}
              onClick={() => setNewForm(true)}
            >
              Registrar apoderado nuevo
            </Button>
            <span style={{ flex: 1 }} />
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              iconLeft={<Icons.Check />}
              disabled={!selected || readOnly || link.isPending}
              onClick={() => selected && doLink(selected.id, onClose)}
            >
              Vincular
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <Input
            label="Buscar apoderado"
            iconLeft={<Icons.Search />}
            placeholder="Nombre, DNI o teléfono…"
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setSelected(null);
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 6,
            }}
          >
            {term.trim().length < 2 ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                Escribe al menos 2 caracteres para buscar.
              </div>
            ) : isFetching ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>Buscando…</div>
            ) : results.length === 0 ? (
              <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                Sin resultados. Puedes registrar un apoderado nuevo.
              </div>
            ) : (
              results.map((r) => {
                const active = selected?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      textAlign: 'left',
                      background: active ? 'var(--surface-brand-soft)' : 'transparent',
                      border: `1px solid ${active ? 'var(--border-brand)' : 'transparent'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <Avatar name={r.fullName} size="sm" color={avatarColor(r.code)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</div>
                      <div style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {r.code} · DNI {r.dni}
                      </div>
                    </div>
                    {active && (
                      <Badge tone="brand" dot>
                        Seleccionado
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'end' }}>
            <Select
              label="Relación"
              options={GUARDIAN_RELATIONS.map((rel) => ({ value: rel, label: GUARDIAN_RELATION_LABELS[rel] }))}
              value={relation}
              onChange={(e) => setRelation(e.target.value as GuardianRelation)}
            />
            <div style={{ display: 'flex', alignItems: 'center', height: 38 }}>
              <Checkbox
                label="Contacto principal"
                description="Recibe avisos y estado de cuenta"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </Dialog>

      <GuardianFormDialog
        open={newForm}
        readOnly={readOnly}
        onClose={() => setNewForm(false)}
        onCreated={(created) => {
          // Recién registrado: se vincula de inmediato con la relación elegida.
          setNewForm(false);
          doLink(created.id, onClose);
        }}
      />
    </>
  );
}
