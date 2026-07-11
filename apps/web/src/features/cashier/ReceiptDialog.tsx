// Recibo estilo ticket. Se usa tras cobrar (recibo en memoria) y desde la caja
// del día (recibo cargado por id). Imprime solo el ticket y ofrece envío por wa.me.
import { Badge, Button, Dialog, Icons, Tooltip } from '@elohim/ui';
import { PAYMENT_METHOD_LABELS, RECEIPT_STATUS_LABELS, formatPEN, toCents } from '@elohim/shared';
import { useInstitution } from '../settings/api';
import { fmtDateTime, digitsOnly } from './bits';
import type { Receipt } from './types';
import './cashier.css';

export interface ReceiptDialogProps {
  open: boolean;
  receipt: Receipt | null;
  loading?: boolean;
  onClose: () => void;
}

/** Arma el resumen de texto del recibo para WhatsApp. */
function receiptSummary(r: Receipt, institutionName: string): string {
  const lines = [
    `*${institutionName}*`,
    `Recibo ${r.code}`,
    `Estudiante: ${r.student.fullName} · ${r.student.gradeSection}`,
    '',
    ...r.items.map((it) => {
      const label = it.quantity > 1 ? `${it.concept} ×${it.quantity}` : it.concept;
      return `• ${label}: ${formatPEN(toCents(it.amount))}`;
    }),
    '',
    `Total: ${formatPEN(toCents(r.totalAmount))}`,
    `Método: ${PAYMENT_METHOD_LABELS[r.method]}`,
    '¡Gracias por su puntualidad!',
  ];
  return lines.join('\n');
}

export function ReceiptDialog({ open, receipt, loading = false, onClose }: ReceiptDialogProps) {
  const { data: institution } = useInstitution();
  const institutionName = institution?.name ?? 'I.E.P. Elohim';

  const phone = receipt ? digitsOnly(receipt.guardianPhone) : '';
  const canWhatsApp = phone.length >= 9;

  const openWhatsApp = () => {
    if (!receipt || !canWhatsApp) return;
    const text = encodeURIComponent(receiptSummary(receipt, institutionName));
    window.open(`https://wa.me/51${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const sendButton = (
    <Button variant="secondary" iconLeft={<Icons.Send />} disabled={!canWhatsApp} onClick={openWhatsApp}>
      Enviar al apoderado
    </Button>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      showClose
      title="Recibo"
      description={receipt ? receipt.code : undefined}
      footer={
        receipt ? (
          <>
            {canWhatsApp ? (
              sendButton
            ) : (
              <Tooltip content="El apoderado no tiene teléfono registrado">
                <span style={{ display: 'inline-flex' }}>{sendButton}</span>
              </Tooltip>
            )}
            <Button variant="primary" iconLeft={<Icons.Printer />} onClick={() => window.print()}>
              Imprimir recibo
            </Button>
          </>
        ) : undefined
      }
    >
      {!receipt ? (
        <div style={{ padding: '24px 4px', textAlign: 'center', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          {loading ? 'Cargando recibo…' : 'No se encontró el recibo.'}
        </div>
      ) : (
        <div id="esge-receipt-print">
          <div
            className="esge-receipt-ticket"
            style={{
              fontFamily: 'var(--font-mono)',
              background: 'var(--surface-sunken)',
              borderRadius: 'var(--radius-md)',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/elohim-insignia.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <div>
                <div
                  style={{
                    font: 'var(--type-label)',
                    fontWeight: 700,
                    color: 'var(--text-strong)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {institutionName}
                </div>
                <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
                  {institution?.address ? `${institution.address} · ` : ''}
                  RUC {institution?.ruc ?? '—'}
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px dashed var(--border-strong)',
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
              }}
            >
              <span>
                RECIBO <b style={{ color: 'var(--text-strong)' }}>{receipt.code}</b>
              </span>
              <span>{fmtDateTime(receipt.createdAt)}</span>
            </div>

            {receipt.status === 'ANULADO' && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Badge tone="danger" dot>
                  {RECEIPT_STATUS_LABELS.ANULADO}
                </Badge>
              </div>
            )}

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Estudiante: <b style={{ color: 'var(--text-strong)' }}>{receipt.student.fullName}</b> ·{' '}
              {receipt.student.gradeSection}
              <br />
              Apoderado: {receipt.guardianName || '—'}
            </div>

            <div
              style={{
                borderTop: '1px dashed var(--border-strong)',
                paddingTop: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {receipt.items.map((it, i) => (
                <div
                  key={`${it.concept}-${i}`}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}
                >
                  <span style={{ color: 'var(--text-body)' }}>
                    {it.concept}
                    {it.quantity > 1 ? ` ×${it.quantity}` : ''}
                  </span>
                  <span style={{ color: 'var(--text-strong)' }}>{formatPEN(toCents(it.amount))}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: '1px dashed var(--border-strong)',
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Método: {PAYMENT_METHOD_LABELS[receipt.method]}
                {receipt.operationNumber ? ` · Op. ${receipt.operationNumber}` : ''}
              </span>
              <span style={{ font: 'var(--type-h3)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
                TOTAL {formatPEN(toCents(receipt.totalAmount))}
              </span>
            </div>

            {receipt.method === 'EFECTIVO' && receipt.receivedAmount != null && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Recibido {formatPEN(toCents(receipt.receivedAmount))}</span>
                <span>Vuelto {formatPEN(toCents(receipt.changeAmount ?? '0'))}</span>
              </div>
            )}

            <div style={{ textAlign: 'center', fontSize: 'var(--text-2xs)', color: 'var(--text-subtle)' }}>
              Cobró: {receipt.cashierName} · ¡Gracias por su puntualidad!
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
