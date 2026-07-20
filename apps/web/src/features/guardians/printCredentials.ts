// Impresión de la lista de credenciales del portal desde un iframe aislado,
// mismo patrón que features/schedule/printSchedule.ts (fuentes embebidas, sin
// @page para conservar las opciones del diálogo del navegador).
import sans400 from '@elohim/ui/fonts/ibm-plex-sans-latin-400.woff2?url';
import sans700 from '@elohim/ui/fonts/ibm-plex-sans-latin-700.woff2?url';
import mono400 from '@elohim/ui/fonts/ibm-plex-mono-latin-400.woff2?url';
import mono600 from '@elohim/ui/fonts/ibm-plex-mono-latin-600.woff2?url';
import type { BulkAccessRow } from './types';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function credentialsHtml(rows: BulkAccessRow[], institutionName: string): string {
  const body = rows
    .map(
      (r) => `<tr>
        <td>${esc(r.guardianName)}<div class="muted">${esc(r.students.join(' · '))}</div></td>
        <td class="mono">${esc(r.dni)}</td>
        <td class="mono">${esc(r.username)}</td>
        <td class="mono strong">${esc(r.tempPassword)}</td>
      </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Accesos al portal · ${esc(institutionName)}</title>
<style>
  @font-face { font-family: 'IBM Plex Sans'; font-weight: 400; src: url('${sans400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Sans'; font-weight: 700; src: url('${sans700}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-weight: 400; src: url('${mono400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-weight: 600; src: url('${mono600}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'IBM Plex Sans', system-ui, sans-serif; font-size: 12px; color: #16130e; padding: 10mm 8mm; }
  .head { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #d8d2c8; padding-bottom: 12px; margin-bottom: 14px; }
  .head img { width: 44px; height: 44px; object-fit: contain; }
  .inst { font-weight: 700; font-size: 14px; }
  .sub { font-size: 10.5px; color: #6f675c; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px 10px; border: 1px solid #eee7dc; text-align: left; vertical-align: top; font-size: 11px; }
  th { font-size: 10px; letter-spacing: .4px; text-transform: uppercase; color: #6f675c; background: #f6f3ee; }
  .mono { font-family: 'IBM Plex Mono', monospace; }
  .strong { font-weight: 600; }
  .muted { font-size: 10px; color: #6f675c; margin-top: 2px; }
  .note { margin-top: 12px; font-size: 10px; color: #6f675c; }
</style>
</head>
<body>
  <div class="head">
    <img src="/elohim-insignia.png" alt="" />
    <div>
      <div class="inst">${esc(institutionName)} — Accesos al portal del apoderado</div>
      <div class="sub">Entrega cada credencial a la familia correspondiente. Se pedirá cambiar la clave en el primer ingreso.</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Apoderado</th><th>DNI</th><th>Usuario</th><th>Clave temporal</th></tr></thead>
    <tbody>${body}</tbody>
  </table>
  <div class="note">Estas contraseñas son temporales y no se volverán a mostrar en el sistema.</div>
</body>
</html>`;
}

export function printCredentials(rows: BulkAccessRow[], institutionName: string): void {
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

  iframe.srcdoc = credentialsHtml(rows, institutionName);
  document.body.appendChild(iframe);
}
