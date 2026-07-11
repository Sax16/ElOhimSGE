// Impresión del recibo desde un documento aislado (iframe oculto): el ticket se
// imprime con su propio HTML/CSS, sin las hojas de estilo de la app y sin reglas
// @page, así el diálogo del navegador conserva todas sus opciones (orientación,
// márgenes, etc.). Mismo patrón que usaremos para constancias y reportes.
import { PAYMENT_METHOD_LABELS, formatPEN, toCents } from '@elohim/shared';
import sans400 from '@elohim/ui/fonts/ibm-plex-sans-latin-400.woff2?url';
import sans700 from '@elohim/ui/fonts/ibm-plex-sans-latin-700.woff2?url';
import mono400 from '@elohim/ui/fonts/ibm-plex-mono-latin-400.woff2?url';
import mono600 from '@elohim/ui/fonts/ibm-plex-mono-latin-600.woff2?url';
import { fmtDateTime } from './bits';
import type { Receipt } from './types';

export interface ReceiptInstitution {
  name: string;
  address?: string | null;
  ruc?: string | null;
}

/** Escapa texto para interpolarlo en HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Documento HTML completo del ticket (exportado para poder probarlo aislado). */
export function ticketHtml(receipt: Receipt, institution: ReceiptInstitution): string {
  const pen = (v: string) => formatPEN(toCents(v));
  const items = receipt.items
    .map(
      (it) => `
      <div class="row item">
        <span class="body">${esc(it.concept)}${it.quantity > 1 ? ` ×${it.quantity}` : ''}</span>
        <span class="strong">${pen(it.amount)}</span>
      </div>`,
    )
    .join('');

  const cash =
    receipt.method === 'EFECTIVO' && receipt.receivedAmount != null
      ? `
      <div class="row muted small">
        <span>Recibido ${pen(receipt.receivedAmount)}</span>
        <span>Vuelto ${pen(receipt.changeAmount ?? '0')}</span>
      </div>`
      : '';

  const canceled =
    receipt.status === 'ANULADO' ? '<div class="canceled">ANULADO</div>' : '';

  const subline = [institution.address, institution.ruc ? `RUC ${institution.ruc}` : null]
    .filter(Boolean)
    .map((s) => esc(String(s)))
    .join(' · ');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Recibo ${esc(receipt.code)}</title>
<style>
  @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 400; src: url('${sans400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 700; src: url('${sans700}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 400; src: url('${mono400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 600; src: url('${mono600}') format('woff2'); }
  /* Sin @page a propósito: el diálogo de impresión conserva todas sus opciones. */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'IBM Plex Mono', 'Courier New', monospace;
    font-size: 11px;
    color: #16130e;
    display: flex;
    justify-content: center;
  }
  .ticket { width: 80mm; max-width: 100%; padding: 6mm 2mm; display: flex; flex-direction: column; gap: 9px; }
  .head { display: flex; align-items: center; gap: 10px; }
  .head img { width: 40px; height: 40px; object-fit: contain; }
  .inst { font-family: 'IBM Plex Sans', system-ui, sans-serif; font-weight: 700; font-size: 12px; }
  .sub { font-size: 9px; color: #6f675c; }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .sep { border-top: 1px dashed #9b9184; padding-top: 8px; }
  .muted { color: #6f675c; }
  .small { font-size: 10px; }
  .body { color: #3f3931; }
  .strong { color: #16130e; font-weight: 600; }
  .total { font-size: 15px; font-weight: 600; }
  .canceled {
    text-align: center; font-family: 'IBM Plex Sans', system-ui, sans-serif;
    font-weight: 700; font-size: 12px; letter-spacing: 2px; color: #b3261e;
    border: 1px solid #b3261e; border-radius: 4px; padding: 3px 0;
  }
  .foot { text-align: center; font-size: 9px; color: #8a8175; }
</style>
</head>
<body>
  <div class="ticket">
    <div class="head">
      <img src="/elohim-insignia.png" alt="" />
      <div>
        <div class="inst">${esc(institution.name)}</div>
        <div class="sub">${subline}</div>
      </div>
    </div>
    <div class="row sep muted small">
      <span>RECIBO <span class="strong">${esc(receipt.code)}</span></span>
      <span>${esc(fmtDateTime(receipt.createdAt))}</span>
    </div>
    ${canceled}
    <div class="muted small">
      Estudiante: <span class="strong">${esc(receipt.student.fullName)}</span> · ${esc(receipt.student.gradeSection ?? '—')}<br />
      Apoderado: ${esc(receipt.guardianName || '—')}
    </div>
    <div class="sep">${items}</div>
    <div class="row sep">
      <span class="muted small">Método: ${esc(PAYMENT_METHOD_LABELS[receipt.method])}${receipt.operationNumber ? ` · Op. ${esc(receipt.operationNumber)}` : ''}</span>
      <span class="total">TOTAL ${pen(receipt.totalAmount)}</span>
    </div>
    ${cash}
    <div class="foot">Cobró: ${esc(receipt.cashierName)} · ¡Gracias por su puntualidad!</div>
  </div>
</body>
</html>`;
}

/** Imprime el recibo desde un iframe oculto y lo retira al cerrar el diálogo. */
export function printReceipt(receipt: Receipt, institution: ReceiptInstitution): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  iframe.onload = () => {
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc) return;

    let removed = false;
    const cleanup = () => {
      if (removed) return;
      removed = true;
      iframe.remove();
    };
    win.addEventListener('afterprint', () => setTimeout(cleanup, 0));
    // Respaldo por si afterprint no llega (p. ej. impresión cancelada sin evento).
    setTimeout(cleanup, 120_000);

    // Espera fuentes e imágenes para que la vista previa salga completa.
    const fontsReady: Promise<unknown> = doc.fonts ? doc.fonts.ready : Promise.resolve();
    const imagesReady = Promise.all(
      Array.from(doc.images).map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined))),
    );
    void Promise.all([fontsReady, imagesReady]).then(() => {
      win.focus();
      win.print();
    });
  };

  iframe.srcdoc = ticketHtml(receipt, institution);
  document.body.appendChild(iframe);
}
