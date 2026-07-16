// Descuentos de un empleado en el periodo (tardanzas auto + manuales). Anular no
// borra: queda como evidencia. Agregar descuento manual (personal editar, fila
// PENDIENTE). Spec: StaffScreen.jsx (DescuentosDialog) · alcance-funcional.md
// § "Planilla — decisiones de la etapa 3".
import { useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Dialog,
  Icons,
  Input,
  Select,
  Textarea,
  useToast,
} from '@elohim/ui';
import { ApiError } from '../../../lib/api';
import { useAddItem, useCancelItem } from './api';
import { ITEM_KIND_LABELS, MANUAL_ITEM_KINDS, itemBadgeText, itemBadgeTone, pen, periodLabel } from './bits';
import type { PayrollEntryDto, PayrollItemDto, PayrollItemKind } from './types';

export function DescuentosDialog({
  entry,
  year,
  month,
  canEdit,
  onClose,
}: {
  entry: PayrollEntryDto | null;
  year: number;
  month: number;
  canEdit: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const addItem = useAddItem();
  const cancelItem = useCancelItem();

  const [cancelTarget, setCancelTarget] = useState<PayrollItemDto | null>(null);
  const [reason, setReason] = useState('');
  const [adding, setAdding] = useState(false);

  // Formulario de alta manual.
  const [kind, setKind] = useState<PayrollItemKind | ''>('');
  const [amount, setAmount] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    // Reinicia todo al abrir con otra fila / cerrar.
    setCancelTarget(null);
    setReason('');
    setAdding(false);
    setKind('');
    setAmount('');
    setDetail('');
  }, [entry?.id]);

  if (!entry) return null;

  const isPending = entry.status === 'PENDIENTE';
  const items = entry.items;
  const canCancelReason = reason.trim().length >= 10;

  const parsedAmount = Number(amount);
  const addValid =
    kind !== '' &&
    amount.trim() !== '' &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    detail.trim().length > 0;

  const onCancelItem = () => {
    if (!cancelTarget || !canCancelReason) return;
    cancelItem.mutate(
      { id: cancelTarget.id, body: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast(
            'warning',
            'Descuento anulado',
            `${itemBadgeText(cancelTarget.kind, cancelTarget.auto)} · ${pen(cancelTarget.amount)} — queda como evidencia.`,
          );
          setCancelTarget(null);
          setReason('');
        },
        onError: (err) =>
          toast('danger', 'No se pudo anular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const onAddItem = () => {
    // addValid ya garantiza kind !== '' (TS lo estrecha a PayrollItemKind aquí).
    if (!addValid) return;
    addItem.mutate(
      { id: entry.id, body: { kind, amount: parsedAmount.toFixed(2), detail: detail.trim() } },
      {
        onSuccess: () => {
          toast('success', 'Descuento registrado', `Se aplicará en la planilla de ${entry.staffName}.`);
          setAdding(false);
          setKind('');
          setAmount('');
          setDetail('');
        },
        onError: (err) =>
          toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const canAddManual = canEdit && isPending;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      icon={<Icons.Chart />}
      title={`Descuentos · ${entry.staffName}`}
      description={`${periodLabel(year, month)} · los anulados no se borran: quedan como evidencia`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {canAddManual && !adding && (
            <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setAdding(true)}>
              Agregar descuento manual
            </Button>
          )}
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
        {items.length === 0 && !adding && (
          <div
            style={{
              font: 'var(--type-body)',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '18px 0',
            }}
          >
            Sin descuentos este mes.
          </div>
        )}

        {items.map((it) => {
          const canceled = it.status === 'ANULADO';
          return (
            <div
              key={it.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: 'var(--surface-sunken)',
                borderRadius: 'var(--radius-md)',
                opacity: canceled ? 0.75 : 1,
              }}
            >
              <Badge tone={itemBadgeTone(it.auto)}>{itemBadgeText(it.kind, it.auto)}</Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    font: 'var(--type-label)',
                    color: 'var(--text-strong)',
                    textDecoration: canceled ? 'line-through' : 'none',
                  }}
                >
                  {it.detail}
                </div>
                {canceled && (
                  <div style={{ font: 'var(--type-2xs)', color: 'var(--warning-soft-fg)' }}>
                    Anulado por {it.canceledByName ?? '—'} · “{it.cancelReason ?? ''}”
                  </div>
                )}
              </div>
              <span
                style={{
                  font: 'var(--type-label)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: canceled ? 'var(--text-subtle)' : 'var(--danger)',
                  textDecoration: canceled ? 'line-through' : 'none',
                }}
              >
                − {pen(it.amount)}
              </span>
              {canceled ? (
                <Badge tone="warning" dot>
                  Anulado
                </Badge>
              ) : isPending ? (
                <Button size="sm" variant="ghost" onClick={() => setCancelTarget(it)}>
                  Anular
                </Button>
              ) : null}
            </div>
          );
        })}

        {adding && canAddManual && (
          <div
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
              Nuevo descuento manual
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Select
                label="Tipo"
                placeholder="Seleccione"
                required
                options={MANUAL_ITEM_KINDS.map((k) => ({ value: k, label: ITEM_KIND_LABELS[k] }))}
                value={kind}
                onChange={(e) => setKind(e.target.value as PayrollItemKind)}
              />
              <Input
                label="Monto"
                prefix="S/."
                inputMode="decimal"
                placeholder="0.00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Textarea
              label="Motivo"
              rows={2}
              required
              placeholder="Obligatorio — aparecerá en la boleta y el historial"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button size="sm" variant="secondary" onClick={() => setAdding(false)} disabled={addItem.isPending}>
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="primary"
                iconLeft={<Icons.Check />}
                disabled={!addValid || addItem.isPending}
                onClick={onAddItem}
              >
                Registrar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmar anulación (motivo ≥ 10) */}
      <Dialog
        open={!!cancelTarget}
        onClose={() => {
          setCancelTarget(null);
          setReason('');
        }}
        icon={<Icons.Trash />}
        iconTone="warning"
        title="Anular descuento"
        description={cancelTarget ? `${itemBadgeText(cancelTarget.kind, cancelTarget.auto)} · − ${pen(cancelTarget.amount)}` : ''}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setCancelTarget(null);
                setReason('');
              }}
              disabled={cancelItem.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              iconLeft={<Icons.Check />}
              disabled={!canCancelReason || cancelItem.isPending}
              onClick={onCancelItem}
            >
              Anular con justificación
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
          <Alert tone="warning" title="No se borra: queda como evidencia">
            El ítem quedará marcado como anulado, con tu usuario, fecha y justificación, visible en
            el historial y la auditoría.
          </Alert>
          <Textarea
            label="Justificación"
            rows={2}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Mínimo 10 caracteres — ej. tardanzas justificadas por comisión de la dirección"
            hint={canCancelReason ? 'Listo' : `${Math.max(0, 10 - reason.trim().length)} caracteres más`}
          />
        </div>
      </Dialog>
    </Dialog>
  );
}
