// Impresión de la libreta desde un documento aislado (iframe oculto), mismo
// patrón que features/staff/payroll/printPayslip.ts: HTML/CSS propios, fuentes
// IBM Plex embebidas y sin reglas @page, para que el diálogo del navegador
// conserve todas sus opciones (imprimir o guardar como PDF).
import sans400 from '@elohim/ui/fonts/ibm-plex-sans-latin-400.woff2?url';
import sans700 from '@elohim/ui/fonts/ibm-plex-sans-latin-700.woff2?url';
import mono400 from '@elohim/ui/fonts/ibm-plex-mono-latin-400.woff2?url';
import mono600 from '@elohim/ui/fonts/ibm-plex-mono-latin-600.woff2?url';
import type { GradeLetter, ReportCard } from './types';

/** Colores de impresión por letra (hex fijos: el iframe no ve los tokens CSS). */
const CHIP: Record<GradeLetter, { bg: string; fg: string }> = {
  AD: { bg: '#e6f4ea', fg: '#1f7a3d' },
  A: { bg: '#e8eefc', fg: '#2b53c4' },
  B: { bg: '#fbf1de', fg: '#9a6b00' },
  C: { bg: '#fbe7e5', fg: '#b3261e' },
};

export interface ReportCardPrintContext {
  institutionName: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function chip(letter: GradeLetter | null | undefined): string {
  if (!letter) return `<span class="dash">—</span>`;
  const c = CHIP[letter];
  return `<span class="chip" style="background:${c.bg};color:${c.fg}">${letter}</span>`;
}

/** Documento HTML completo de la libreta (exportado para poder probarlo aislado). */
export function reportCardHtml(rc: ReportCard, ctx: ReportCardPrintContext): string {
  const periods = [...rc.periods].sort((a, b) => a.order - b.order);
  const headCols = periods.map((p) => `<th class="c">${esc(p.name)}</th>`).join('');

  const courseRows = rc.courses
    .map(
      (c) => `
      <tr>
        <td class="name">${esc(c.courseName)}</td>
        ${periods.map((p) => `<td class="c">${chip(c.byPeriod[p.id]?.letter)}</td>`).join('')}
      </tr>`,
    )
    .join('');

  const aspectRowsFor = (kind: 'FORMATIVO' | 'APODERADO') =>
    rc.aspects
      .filter((a) => a.kind === kind)
      .map(
        (a) => `
      <tr>
        <td class="name">${esc(a.name)}</td>
        ${periods.map((p) => `<td class="c">${chip(a.byPeriod[p.id])}</td>`).join('')}
      </tr>`,
      )
      .join('');

  const formativos = aspectRowsFor('FORMATIVO');
  const apoderado = aspectRowsFor('APODERADO');

  const student = rc.student;
  const subline = [
    esc(student.code),
    esc(student.gradeLabel),
    esc(student.sectionLabel),
    student.tutorName ? `Tutor(a): ${esc(student.tutorName)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const att = rc.attendance;
  const attLine =
    att.pct == null
      ? `Asistencia del bimestre: sin registro`
      : `Asistencia del bimestre: ${att.pct}% · ${att.tardanzas} ${
          att.tardanzas === 1 ? 'tardanza' : 'tardanzas'
        }` + (att.faltas ? ` · ${att.faltas} ${att.faltas === 1 ? 'falta' : 'faltas'}` : '');

  const band = (label: string) => `<tr class="band"><td colspan="${periods.length + 1}">${label}</td></tr>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Libreta ${esc(student.fullName)} · ${esc(rc.year)}</title>
<style>
  @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 400; src: url('${sans400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Sans'; font-style: normal; font-weight: 700; src: url('${sans700}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 400; src: url('${mono400}') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-style: normal; font-weight: 600; src: url('${mono600}') format('woff2'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
    font-size: 12px; color: #16130e;
    display: flex; justify-content: center; padding: 8mm 4mm;
  }
  .doc { width: 180mm; max-width: 100%; display: flex; flex-direction: column; gap: 14px; }
  .head { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #d8d2c8; padding-bottom: 12px; }
  .head img { width: 46px; height: 46px; object-fit: contain; }
  .inst { font-weight: 700; font-size: 14px; }
  .sub { font-size: 10.5px; color: #6f675c; margin-top: 2px; }
  .badge {
    margin-left: auto; font-size: 11px; font-weight: 700; color: #2b53c4;
    border: 1px solid #2b53c4; border-radius: 4px; padding: 4px 10px; white-space: nowrap;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 6px 10px; font-size: 11.5px; border-bottom: 1px solid #eee7dc; }
  th { text-align: left; font-size: 10px; letter-spacing: .4px; text-transform: uppercase; color: #6f675c; }
  th.c, td.c { text-align: center; width: 60px; }
  td.name { color: #16130e; font-weight: 600; }
  tr.band td {
    background: #f6f3ee; font-size: 10px; letter-spacing: .5px; text-transform: uppercase;
    color: #6f675c; font-weight: 600; padding: 6px 10px;
  }
  .chip {
    display: inline-block; min-width: 26px; padding: 2px 7px; border-radius: 4px;
    font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 11px;
  }
  .dash { color: #b7afa0; }
  .foot {
    display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    font-size: 10px; color: #6f675c; border-top: 1px solid #d8d2c8; padding-top: 10px;
  }
</style>
</head>
<body>
  <div class="doc">
    <div class="head">
      <img src="/elohim-insignia.png" alt="" />
      <div>
        <div class="inst">${esc(ctx.institutionName)} — Libreta de calificaciones · ${esc(rc.year)}</div>
        <div class="sub">${esc(student.fullName)} · ${subline}</div>
      </div>
      <span class="badge">${esc(rc.period.name)}</span>
    </div>

    <table>
      <thead><tr><th>Curso</th>${headCols}</tr></thead>
      <tbody>
        ${courseRows}
        ${formativos ? band('Aspectos formativos · califica el tutor') + formativos : ''}
        ${apoderado ? band('Evaluación del apoderado · registra el tutor') + apoderado : ''}
      </tbody>
    </table>

    <div class="foot">
      <span>AD Logro destacado · A Logrado · B En proceso · C En inicio</span>
      <span>${attLine}</span>
    </div>
  </div>
</body>
</html>`;
}

/** Imprime la libreta desde un iframe oculto y lo retira al cerrar el diálogo. */
export function printReportCard(rc: ReportCard, ctx: ReportCardPrintContext): void {
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

  iframe.srcdoc = reportCardHtml(rc, ctx);
  document.body.appendChild(iframe);
}
