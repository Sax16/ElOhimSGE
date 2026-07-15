// Impresión de la boleta de pago desde un documento aislado (iframe oculto):
// mismo patrón que features/cashier/printReceipt.ts — HTML/CSS propios, sin las
// hojas de la app y sin reglas @page, para que el diálogo del navegador conserve
// todas sus opciones. La boleta se imprime pagada (comprobante) o preliminar.
import { PAYMENT_METHOD_LABELS, formatPEN, toCents } from '@elohim/shared';
import sans400 from '@elohim/ui/fonts/ibm-plex-sans-latin-400.woff2?url';
import sans700 from '@elohim/ui/fonts/ibm-plex-sans-latin-700.woff2?url';
import mono400 from '@elohim/ui/fonts/ibm-plex-mono-latin-400.woff2?url';
import mono600 from '@elohim/ui/fonts/ibm-plex-mono-latin-600.woff2?url';
import { fmtDateTime } from './bits';
import type { PayrollEntryDto } from './types';

/** Datos del colegio (misma forma que ReceiptInstitution). */
export interface PayslipInstitution {
  name: string;
  address?: string | null;
  ruc?: string | null;
}

/** Contexto de impresión de la boleta. */
export interface PayslipContext {
  institution: PayslipInstitution;
  /** "Julio 2026". */
  periodLabel: string;
  /** Tasa EsSalud ("9.00"). */
  essaludRatePct: string;
}

/** Escapa texto para interpolarlo en HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Documento HTML completo de la boleta (exportado para poder probarlo aislado). */
export function payslipHtml(entry: PayrollEntryDto, ctx: PayslipContext): string {
  const pen = (v: string) => formatPEN(toCents(v));
  const paid = entry.status === 'PAGADO';

  const subline = [ctx.institution.address, ctx.institution.ruc ? `RUC ${ctx.institution.ruc}` : null]
    .filter(Boolean)
    .map((s) => esc(String(s)))
    .join(' · ');

  // Aportes retenidos (ONP/AFP) tal cual llegan del back.
  const contribRows = entry.contribItems
    .map(
      (c) => `
      <div class="row">
        <span class="body">${esc(c.concept)}</span>
        <span class="neg">− ${pen(c.amount)}</span>
      </div>`,
    )
    .join('');

  const discountRow =
    toCents(entry.discountTotal) > 0
      ? `
      <div class="row">
        <span class="body">Descuentos del mes</span>
        <span class="neg">− ${pen(entry.discountTotal)}</span>
      </div>`
      : '';

  // Línea de estado.
  const statusLine = paid
    ? `PAGADO · ${esc(PAYMENT_METHOD_LABELS[entry.paymentMethod ?? 'EFECTIVO'])}` +
      ` · ${esc(fmtDateTime(entry.paidAt))}` +
      (entry.operationNumber ? ` · Op. ${esc(entry.operationNumber)}` : '') +
      (entry.batchCode ? ` · ${esc(entry.batchCode)}` : '')
    : 'Boleta preliminar — pago pendiente';

  const statusClass = paid ? 'status status--paid' : 'status status--pending';

  const detailRows: [string, string][] = [
    ['Código', entry.staffCode],
    ['Cargo', entry.position],
    ['Régimen', entry.schemeName],
    ['Periodo', ctx.periodLabel],
  ];
  const detailHtml = detailRows
    .map(
      ([k, v]) => `
      <div class="drow">
        <span class="dkey">${esc(k)}</span>
        <span class="dval">${esc(v)}</span>
      </div>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Boleta ${esc(entry.staffName)} · ${esc(ctx.periodLabel)}</title>
<style>
  @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 400; src: url('${sans400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 700; src: url('${sans700}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 400; src: url('${mono400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 600; src: url('${mono600}') format('woff2'); }
  /* Sin @page a propósito: el diálogo de impresión conserva todas sus opciones. */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    font-size: 12px;
    color: #16130e;
    display: flex;
    justify-content: center;
    padding: 8mm 4mm;
  }
  .doc { width: 150mm; max-width: 100%; display: flex; flex-direction: column; gap: 14px; }
  .head { display: flex; align-items: center; gap: 12px; }
  .head img { width: 46px; height: 46px; object-fit: contain; }
  .inst { font-weight: 700; font-size: 15px; }
  .sub { font-size: 10px; color: #6f675c; }
  .title {
    text-align: center; font-weight: 700; font-size: 13px; letter-spacing: 2px;
    border-top: 1px solid #9b9184; border-bottom: 1px solid #9b9184; padding: 6px 0;
  }
  .who { font-weight: 700; font-size: 14px; }
  .details { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
  .drow { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; }
  .dkey { color: #6f675c; }
  .dval { color: #16130e; font-weight: 600; }
  .breakdown { display: flex; flex-direction: column; gap: 4px; }
  .row {
    display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
    font-family: 'IBM Plex Mono', monospace; font-size: 12px;
    padding: 4px 8px; background: #f6f3ee; border-radius: 4px;
  }
  .body { font-family: 'IBM Plex Sans', system-ui, sans-serif; color: #3f3931; }
  .neg { color: #b3261e; }
  .gross .body { font-weight: 600; color: #16130e; }
  .gross .val { font-weight: 600; }
  .total {
    display: flex; justify-content: space-between; align-items: baseline; gap: 8px;
    padding: 8px 8px; border-top: 2px solid #16130e; margin-top: 4px;
    font-weight: 700; font-size: 14px;
  }
  .total .amt { font-family: 'IBM Plex Mono', monospace; }
  .note { font-size: 10px; color: #6f675c; border: 1px solid #d8d2c8; border-radius: 4px; padding: 8px 10px; }
  .status { text-align: center; font-weight: 700; font-size: 11px; border-radius: 4px; padding: 6px 8px; }
  .status--paid { color: #1f7a3d; border: 1px solid #1f7a3d; }
  .status--pending { color: #9a6b00; border: 1px dashed #9a6b00; }
  .foot { text-align: center; font-size: 9px; color: #8a8175; }
</style>
</head>
<body>
  <div class="doc">
    <div class="head">
      <img src="/elohim-insignia.png" alt="" />
      <div>
        <div class="inst">${esc(ctx.institution.name)}</div>
        <div class="sub">${subline}</div>
      </div>
    </div>
    <div class="title">BOLETA DE PAGO · ${esc(ctx.periodLabel).toUpperCase()}</div>
    <div class="who">${esc(entry.staffName)}</div>
    <div class="details">${detailHtml}</div>
    <div class="breakdown">
      <div class="row gross">
        <span class="body">Sueldo base</span>
        <span class="val">${pen(entry.grossAmount)}</span>
      </div>
      ${contribRows}
      ${discountRow}
    </div>
    <div class="total">
      <span>Neto a pagar</span>
      <span class="amt">${pen(entry.netAmount)}</span>
    </div>
    <div class="note">
      Aparte, el colegio aporta EsSalud ${esc(ctx.essaludRatePct)}% (${pen(entry.essaludAmount)}) —
      no se descuenta al trabajador.
    </div>
    <div class="${statusClass}">${statusLine}</div>
    <div class="foot">Documento interno · ${esc(ctx.institution.name)}</div>
  </div>
</body>
</html>`;
}

/** Imprime la boleta desde un iframe oculto y lo retira al cerrar el diálogo. */
export function printPayslip(entry: PayrollEntryDto, ctx: PayslipContext): void {
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
      Array.from(doc.images).map((img) =>
        img.complete ? Promise.resolve() : img.decode().catch(() => undefined),
      ),
    );
    void Promise.all([fontsReady, imagesReady]).then(() => {
      win.focus();
      win.print();
    });
  };

  iframe.srcdoc = payslipHtml(entry, ctx);
  document.body.appendChild(iframe);
}
