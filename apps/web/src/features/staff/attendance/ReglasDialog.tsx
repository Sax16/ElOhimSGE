// Reglas de marcación: horario y tolerancia por grupo + descuento automático por
// tardanzas acumuladas. Calca ReglasDialog del prototipo StaffScreen.jsx.
// Las reglas rigen hacia adelante; las marcas registradas no se recalculan.
import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, Icons, Input, Select, Switch, useToast } from '@elohim/ui';
import { ApiError } from '../../../lib/api';
import { useSaveRules } from './api';
import { COUNT_PERIOD_LABELS } from './bits';
import type { AttendanceRules, CountPeriod } from './types';

export interface ReglasDialogProps {
  open: boolean;
  onClose: () => void;
  rules: AttendanceRules | undefined;
}

interface GroupDraft {
  id: string;
  name: string;
  entryTime: string;
  toleranceMin: string;
}

export function ReglasDialog({ open, onClose, rules }: ReglasDialogProps) {
  const { toast } = useToast();
  const save = useSaveRules();

  const [groups, setGroups] = useState<GroupDraft[]>([]);
  const [autoDiscount, setAutoDiscount] = useState(true);
  const [threshold, setThreshold] = useState('3');
  const [amount, setAmount] = useState('20.00');
  const [period, setPeriod] = useState<CountPeriod>('MES');

  useEffect(() => {
    if (!open || !rules) return;
    setGroups(
      [...rules.groups]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((g) => ({
          id: g.id,
          name: g.name,
          entryTime: g.entryTime,
          toleranceMin: String(g.toleranceMin),
        })),
    );
    setAutoDiscount(rules.settings.autoDiscountEnabled);
    setThreshold(String(rules.settings.lateCountThreshold));
    setAmount(rules.settings.discountAmount);
    setPeriod(rules.settings.countPeriod);
  }, [open, rules]);

  const patchGroup = (id: string, patch: Partial<GroupDraft>) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const submit = () => {
    save.mutate(
      {
        groups: groups.map((g) => ({
          id: g.id,
          entryTime: g.entryTime,
          toleranceMin: Number(g.toleranceMin) || 0,
        })),
        settings: {
          autoDiscountEnabled: autoDiscount,
          lateCountThreshold: Number(threshold) || 0,
          discountAmount: amount,
          countPeriod: period,
        },
      },
      {
        onSuccess: () => {
          toast(
            'success',
            'Reglas guardadas',
            'Rigen desde ahora; las marcas ya registradas no se recalculan.',
          );
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      icon={<Icons.Clock />}
      title="Reglas de marcación"
      description="Horario de ingreso y tolerancia por grupo · regla de descuento automático"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={save.isPending} onClick={submit}>
            Guardar reglas
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
        <div>
          <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)', marginBottom: 8 }}>
            Horarios de ingreso por grupo
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {groups.map((g) => (
              <div
                key={g.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr',
                  gap: 10,
                  alignItems: 'center',
                  background: 'var(--surface-sunken)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                }}
              >
                <span style={{ font: 'var(--type-label)', color: 'var(--text-body)' }}>{g.name}</span>
                <Input
                  size="sm"
                  type="time"
                  value={g.entryTime}
                  onChange={(e) => patchGroup(g.id, { entryTime: e.target.value })}
                  aria-label={`Hora de ingreso · ${g.name}`}
                />
                <Input
                  size="sm"
                  value={g.toleranceMin}
                  onChange={(e) => patchGroup(g.id, { toleranceMin: e.target.value.replace(/\D/g, '') })}
                  suffix="min tolerancia"
                  inputMode="numeric"
                  aria-label={`Tolerancia · ${g.name}`}
                />
              </div>
            ))}
          </div>
          <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', marginTop: 6 }}>
            La tardanza se calcula contra el horario del grupo de cada empleado. Un empleado puede
            tener horario individual desde su ficha.
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Switch
            label="Descuento automático por tardanzas acumuladas"
            checked={autoDiscount}
            onChange={(e) => setAutoDiscount(e.target.checked)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input
              label="Tardanzas para aplicar"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              disabled={!autoDiscount}
            />
            <Input
              label="Descuento"
              prefix="S/."
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              inputMode="decimal"
              disabled={!autoDiscount}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <Select
              label="Periodo de conteo"
              options={(['MES', 'BIMESTRE'] as CountPeriod[]).map((p) => ({
                value: p,
                label: COUNT_PERIOD_LABELS[p],
              }))}
              value={period}
              onChange={(e) => setPeriod(e.target.value as CountPeriod)}
              disabled={!autoDiscount}
            />
          </div>
          <Alert tone="info">
            El descuento se genera como ítem de planilla con origen «Auto · tardanzas» y puede
            anularse manualmente con justificación.
          </Alert>
        </div>
      </div>
    </Dialog>
  );
}
