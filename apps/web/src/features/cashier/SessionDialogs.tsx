// Diálogos de apertura y cierre (arqueo) de la caja del día.
import { useEffect, useState } from 'react';
import { Alert, Button, Dialog, Icons, Input, Textarea, useToast } from '@elohim/ui';
import { formatPEN, toCents } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDate } from '../structure/bits';
import { useCloseSession, useOpenSession } from './api';
import type { CashSession, DayStats } from './types';

/** Normaliza la entrada de dinero: solo dígitos y un punto decimal. */
function sanitizeMoney(v: string): string {
  return v.replace(/[^0-9.]/g, '');
}

/** Convierte una entrada de dinero a centavos con tolerancia a vacío. */
function inputCents(v: string): number {
  const trimmed = v.trim();
  if (!trimmed || trimmed === '.') return 0;
  try {
    return toCents(trimmed);
  } catch {
    return 0;
  }
}

// ---- Apertura --------------------------------------------------------------
export function OpenSessionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const openSession = useOpenSession();
  const [initial, setInitial] = useState('0.00');

  useEffect(() => {
    if (open) setInitial('0.00');
  }, [open]);

  const submit = () => {
    openSession.mutate(
      { initialAmount: initial.trim() || '0.00' },
      {
        onSuccess: () => {
          toast('success', 'Caja abierta', `Monto inicial ${formatPEN(inputCents(initial))}.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo abrir la caja', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Cash />}
      title="Abrir caja del día"
      description="Registra el monto inicial en efectivo para empezar a cobrar"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={openSession.isPending} onClick={submit}>
            Abrir caja
          </Button>
        </>
      }
    >
      <div style={{ paddingTop: 4 }}>
        <Input
          label="Monto inicial"
          prefix="S/."
          value={initial}
          onChange={(e) => setInitial(sanitizeMoney(e.target.value))}
          inputMode="decimal"
          hint="Efectivo con el que empieza la caja (puede ser 0)."
        />
      </div>
    </Dialog>
  );
}

// ---- Cierre (arqueo) -------------------------------------------------------
export function CloseSessionDialog({
  open,
  session,
  stats,
  onClose,
}: {
  open: boolean;
  session: CashSession;
  stats: DayStats;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const closeSession = useCloseSession();
  const [counted, setCounted] = useState('');
  const [notes, setNotes] = useState('');

  const refundsCents = stats.refundsCashAmount != null ? toCents(stats.refundsCashAmount) : 0;
  const hasRefunds = refundsCents > 0;
  const expectedCents =
    session.expectedCash != null
      ? toCents(session.expectedCash)
      : toCents(session.initialAmount) + toCents(stats.cashAmount) - refundsCents;

  useEffect(() => {
    if (open) {
      setCounted(session.expectedCash ?? '');
      setNotes('');
    }
  }, [open, session.expectedCash]);

  const countedCents = inputCents(counted);
  const diff = countedCents - expectedCents;
  const balanced = Math.abs(diff) < 1; // < 1 centavo

  const submit = () => {
    closeSession.mutate(
      { countedCash: counted.trim() || '0.00', notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          toast(
            'success',
            'Caja cerrada',
            `Arqueo registrado · ${formatPEN(toCents(stats.totalAmount))} cobrados · ${stats.operationsCount} operaciones.`,
          );
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo cerrar la caja', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const cells: [string, string][] = [
    ['Monto inicial', formatPEN(toCents(session.initialAmount))],
    ['Cobros en efectivo', formatPEN(toCents(stats.cashAmount))],
    ['Cobros digitales', formatPEN(toCents(stats.digitalAmount))],
    ...(hasRefunds
      ? ([['Devoluciones en efectivo', `− ${formatPEN(refundsCents)}`]] as [string, string][])
      : []),
    ['Efectivo esperado', formatPEN(expectedCents)],
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Lock />}
      iconTone="warning"
      title="Cerrar caja · Arqueo"
      description={`${fmtDate(session.date)} · Abierta por ${session.openedByName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" iconLeft={<Icons.Lock />} disabled={closeSession.isPending} onClick={submit}>
            Cerrar caja
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {cells.map(([k, v]) => (
            <div key={k} style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
              <div className="eyebrow" style={{ marginBottom: 2, font: 'var(--type-caption)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-caps)' }}>
                {k}
              </div>
              <div style={{ font: 'var(--type-h3)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{v}</div>
            </div>
          ))}
        </div>
        <Input
          label="Efectivo contado"
          prefix="S/."
          value={counted}
          onChange={(e) => setCounted(sanitizeMoney(e.target.value))}
          inputMode="decimal"
          placeholder="0.00"
        />
        {balanced ? (
          <Alert tone="success" title="Arqueo cuadrado">
            El efectivo contado coincide con el esperado.
          </Alert>
        ) : (
          <Alert
            tone={diff < 0 ? 'danger' : 'warning'}
            title={diff < 0 ? `Faltante de ${formatPEN(Math.abs(diff))}` : `Sobrante de ${formatPEN(diff)}`}
          >
            La diferencia quedará registrada en el cierre con tu observación.
          </Alert>
        )}
        <Textarea
          label="Observaciones"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opcional…"
        />
      </div>
    </Dialog>
  );
}
