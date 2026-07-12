// Impresión del comprobante de devolución desde un documento aislado (iframe
// oculto): mismo patrón que printReceipt.ts — HTML/CSS propios, sin las hojas de
// la app y sin reglas @page, para que el diálogo del navegador conserve todas
// sus opciones. El comprobante lo firma el apoderado al recibir el dinero.
import { REFUND_METHOD_LABELS, formatPEN, toCents } from '@elohim/shared';
import sans400 from '@elohim/ui/fonts/ibm-plex-sans-latin-400.woff2?url';
import sans700 from '@elohim/ui/fonts/ibm-plex-sans-latin-700.woff2?url';
import mono400 from '@elohim/ui/fonts/ibm-plex-mono-latin-400.woff2?url';
import mono600 from '@elohim/ui/fonts/ibm-plex-mono-latin-600.woff2?url';
import { fmtDateTime } from './bits';
import type { Refund } from './types';
import type { ReceiptInstitution } from './printReceipt';

/** Escapa texto para interpolarlo en HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Documento HTML completo del comprobante de devolución (exportado para probar aislado). */
export function refundHtml(refund: Refund, institution: ReceiptInstitution): string {
  const pen = (v: string) => formatPEN(toCents(v));

  const subline = [institution.address, institution.ruc ? `RUC ${institution.ruc}` : null]
    .filter(Boolean)
    .map((s) => esc(String(s)))
    .join(' · ');

  const detailRows: [string, string][] = [
    ['Recibo de origen', refund.receiptCode],
    ['Estudiante', refund.studentName],
    ['Forma', REFUND_METHOD_LABELS[refund.method]],
  ];
  if (refund.method === 'APLICACION_CUOTA' && refund.targetConcept) {
    detailRows.push(['Aplicada a', refund.targetConcept]);
  }
  if (refund.method === 'TRANSFERENCIA' && refund.operationNumber) {
    detailRows.push(['N° de operación', refund.operationNumber]);
  }
  if (refund.executedByName) detailRows.push(['Ejecutó', refund.executedByName]);

  const detailHtml = detailRows
    .map(
      ([k, v]) => `
      <div class="row muted small">
        <span>${esc(k)}</span>
        <span class="strong">${esc(v)}</span>
      </div>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Devolución ${esc(refund.code)}</title>
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
  .kind {
    text-align: center; font-family: 'IBM Plex Sans', system-ui, sans-serif;
    font-weight: 700; font-size: 12px; letter-spacing: 2px; color: #16130e;
    border: 1px solid #9b9184; border-radius: 4px; padding: 3px 0;
  }
  .row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .sep { border-top: 1px dashed #9b9184; padding-top: 8px; }
  .muted { color: #6f675c; }
  .small { font-size: 10px; }
  .strong { color: #16130e; font-weight: 600; }
  .total { font-size: 15px; font-weight: 600; }
  .reason { font-size: 10px; color: #3f3931; }
  .sign { margin-top: 18px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .sign .line { width: 60%; border-top: 1px solid #16130e; }
  .sign .cap { font-size: 9px; color: #6f675c; }
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
      <span>DEVOLUCIÓN <span class="strong">${esc(refund.code)}</span></span>
      <span>${esc(fmtDateTime(refund.executedAt ?? refund.createdAt))}</span>
    </div>
    <div class="kind">COMPROBANTE DE DEVOLUCIÓN</div>
    <div class="sep">${detailHtml}</div>
    <div class="row sep">
      <span class="muted small">Motivo</span>
      <span class="total">${pen(refund.amount)}</span>
    </div>
    <div class="reason">${esc(refund.reason)}</div>
    <div class="sign">
      <div class="line"></div>
      <div class="cap">Firma del apoderado — conforme con la devolución</div>
    </div>
    <div class="foot">Documento interno · I.E.P. Elohim</div>
  </div>
</body>
</html>`;
}

/** Imprime el comprobante de devolución desde un iframe oculto y lo retira al cerrar. */
export function printRefund(refund: Refund, institution: ReceiptInstitution): void {
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
    setTimeout(cleanup, 120_000);

    const fontsReady: Promise<unknown> = doc.fonts ? doc.fonts.ready : Promise.resolve();
    const imagesReady = Promise.all(
      Array.from(doc.images).map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined))),
    );
    void Promise.all([fontsReady, imagesReady]).then(() => {
      win.focus();
      win.print();
    });
  };

  iframe.srcdoc = refundHtml(refund, institution);
  document.body.appendChild(iframe);
}
