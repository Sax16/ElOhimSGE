// Diálogos de pago de planilla (solo ADMIN): pago individual, pago masivo y
// anulación de pago. Spec: StaffScreen.jsx (Pagar sueldo / Pago masivo) ·
// alcance-funcional.md § "Planilla — decisiones de la etapa 3".
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  Icons,
  Input,
  Select,
  Textarea,
  useToast,
} from '@elohim/ui';
import { PAYMENT_METHOD_LABELS } from '@elohim/shared';
import { ApiError } from '../../../lib/api';
import { useCancelPayment, usePayAll, usePayEntry } from './api';
import { PAYROLL_METHODS, pen, periodLabel } from './bits';
import type { PayrollEntryDto, PayrollMethod } from './types';

const methodOptions = PAYROLL_METHODS.map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }));

// ---- Pago individual --------------------------------------------------------
export function PayDialog({
  entry,
  year,
  month,
  onClose,
}: {
  entry: PayrollEntryDto | null;
  year: number;
  month: number;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const pay = usePayEntry();
  const [method, setMethod] = useState<PayrollMethod>('TRANSFERENCIA');
  const [operationNumber, setOperationNumber] = useState('');

  useEffect(() => {
    setMethod('TRANSFERENCIA');
    setOperationNumber('');
  }, [entry?.id]);

  if (!entry) return null;

  const isCash = method === 'EFECTIVO';
  const hasDiscounts = Number(entry.discountTotal) > 0;

  const submit = () => {
    pay.mutate(
      {
        id: entry.id,
        body: {
          method,
          operationNumber: isCash || !operationNumber.trim() ? undefined : operationNumber.trim(),
        },
      },
      {
        onSuccess: () => {
          toast('success', 'Sueldo pagado', `${entry.staffName} · ${pen(entry.netAmount)} · boleta generada.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo pagar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const tiles: { key: string; label: string; value: string; net?: boolean }[] = [
    { key: 'gross', label: 'Sueldo', value: pen(entry.grossAmount) },
    { key: 'disc', label: 'Descuentos', value: hasDiscounts ? `− ${pen(entry.discountTotal)}` : '—' },
    { key: 'contrib', label: 'Aportes', value: `− ${pen(entry.contribTotal)}` },
    { key: 'net', label: 'Neto a pagar', value: pen(entry.netAmount), net: true },
  ];

  return (
    <Dialog
      open
      onClose={onClose}
      icon={<Icons.Cash />}
      iconTone="success"
      title="Pagar sueldo"
      description={`${entry.staffName} · ${periodLabel(year, month)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pay.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={pay.isPending} onClick={submit}>
            Confirmar pago
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <div className="esge-payroll-pay-grid">
          {tiles.map((t) => (
            <div
              key={t.key}
              className={`esge-payroll-pay-tile${t.net ? ' esge-payroll-pay-tile--net' : ''}`}
            >
              <div className="eyebrow" style={{ marginBottom: 2 }}>
                {t.label}
              </div>
              <div
                style={{
                  font: 'var(--type-h3)',
                  fontFamily: 'var(--font-mono)',
                  color: t.net ? 'var(--brand)' : 'var(--text-strong)',
                }}
              >
                {t.value}
              </div>
            </div>
          ))}
        </div>
        <Select
          label="Método"
          options={methodOptions}
          value={method}
          onChange={(e) => setMethod(e.target.value as PayrollMethod)}
        />
        {!isCash && (
          <Input
            label="N° de operación"
            placeholder="Opcional"
            value={operationNumber}
            onChange={(e) => setOperationNumber(e.target.value)}
          />
        )}
      </div>
    </Dialog>
  );
}

// ---- Pago masivo ------------------------------------------------------------
export function PayAllDialog({
  open,
  periodId,
  year,
  month,
  pendingCount,
  pendingNet,
  onClose,
}: {
  open: boolean;
  periodId: string;
  year: number;
  month: number;
  pendingCount: number;
  pendingNet: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const payAll = usePayAll();
  const [method, setMethod] = useState<PayrollMethod>('TRANSFERENCIA');

  useEffect(() => {
    if (open) setMethod('TRANSFERENCIA');
  }, [open]);

  const submit = () => {
    payAll.mutate(
      { periodId, body: { method } },
      {
        onSuccess: () => {
          toast(
            'success',
            'Planilla pagada',
            `${pendingCount} sueldos pagados · ${pen(pendingNet)} · boletas generadas.`,
          );
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo pagar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Cash />}
      iconTone="warning"
      title="Pagar todos los pendientes"
      description={`${pendingCount} empleados · ${pen(pendingNet)} · ${periodLabel(year, month)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={payAll.isPending}>
            Cancelar
          </Button>
          <Button
            variant="accent"
            iconLeft={<Icons.Check />}
            disabled={payAll.isPending || pendingCount === 0}
            onClick={submit}
          >
            Pagar {pen(pendingNet)}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <Alert tone="warning" title="Pago masivo">
          Se registrará el pago de todos los pendientes con el mismo método y se generarán sus
          boletas.
        </Alert>
        <Select
          label="Método"
          options={methodOptions}
          value={method}
          onChange={(e) => setMethod(e.target.value as PayrollMethod)}
        />
      </div>
    </Dialog>
  );
}

// ---- Anular pago ------------------------------------------------------------
export function CancelPaymentDialog({
  entry,
  onClose,
}: {
  entry: PayrollEntryDto | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const cancel = useCancelPayment();
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [entry?.id]);

  const valid = reason.trim().length >= 10;

  const submit = () => {
    if (!entry || !valid) return;
    cancel.mutate(
      { id: entry.id, body: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast('warning', 'Pago anulado', `${entry.staffName} vuelve a Pendiente — queda en el historial.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo anular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!entry}
      onClose={onClose}
      icon={<Icons.Trash />}
      iconTone="danger"
      title="Anular pago"
      description={entry ? `${entry.staffName} · ${pen(entry.netAmount)}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={cancel.isPending}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            iconLeft={<Icons.Trash />}
            disabled={!valid || cancel.isPending}
            onClick={submit}
          >
            Anular con justificación
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <Alert tone="danger" title="Se revierte el pago">
          La fila volverá a Pendiente y el gasto en tesorería se anulará o reducirá.
        </Alert>
        <Textarea
          label="Justificación"
          rows={2}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Mínimo 10 caracteres — ej. método de pago equivocado, se reprocesará"
          hint={valid ? 'Listo' : `${Math.max(0, 10 - reason.trim().length)} caracteres más`}
        />
      </div>
    </Dialog>
  );
}
