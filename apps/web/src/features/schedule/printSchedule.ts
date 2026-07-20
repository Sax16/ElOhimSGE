// Impresión del horario semanal desde un documento aislado (iframe oculto),
// mismo patrón que features/grades/printReportCard.ts: HTML/CSS propios, fuentes
// IBM Plex embebidas y sin reglas @page, para que el diálogo del navegador
// conserve todas sus opciones (imprimir o guardar como PDF).
import sans400 from '@elohim/ui/fonts/ibm-plex-sans-latin-400.woff2?url';
import sans700 from '@elohim/ui/fonts/ibm-plex-sans-latin-700.woff2?url';
import mono400 from '@elohim/ui/fonts/ibm-plex-mono-latin-400.woff2?url';
import mono600 from '@elohim/ui/fonts/ibm-plex-mono-latin-600.woff2?url';
import { DAYS, DAY_LABELS_LONG, courseColorHex, timeRange } from './bits';
import type { ScheduleResponse } from './types';

export interface SchedulePrintContext {
  institutionName: string;
  sectionLabel: string;
  year: string;
}

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Documento HTML completo del horario (exportado para poder probarlo aislado). */
export function scheduleHtml(data: ScheduleResponse, ctx: SchedulePrintContext): string {
  const blocks = [...data.blocks].sort((a, b) => a.order - b.order);

  // Índice slot por "blockId|dayOfWeek".
  const slotAt = new Map<string, (typeof data.slots)[number]>();
  for (const s of data.slots) slotAt.set(`${s.blockId}|${s.dayOfWeek}`, s);

  const headCols = DAYS.map((d) => `<th class="c">${esc(DAY_LABELS_LONG[d - 1] ?? '')}</th>`).join('');

  const rows = blocks
    .map((b) => {
      const time = `<td class="time">${esc(timeRange(b.startTime, b.endTime))}</td>`;
      if (b.isBreak) {
        return `<tr class="break"><td class="time">${esc(timeRange(b.startTime, b.endTime))}</td><td class="brk" colspan="${DAYS.length}">${esc(b.label || 'Recreo')}</td></tr>`;
      }
      const cells = DAYS.map((d) => {
        const slot = slotAt.get(`${b.id}|${d}`);
        if (!slot) return `<td class="cell empty"></td>`;
        const color = courseColorHex(slot.courseId);
        const teacher = slot.teacherName
          ? `<div class="teacher">${esc(slot.teacherName)}</div>`
          : `<div class="teacher warn">Sin docente</div>`;
        return `<td class="cell" style="border-left:3px solid ${color}"><div class="course">${esc(slot.courseName)}</div>${teacher}</td>`;
      }).join('');
      return `<tr>${time}${cells}</tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${esc(ctx.sectionLabel)} · Horario semanal · ${esc(ctx.year)}</title>
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
  .doc { width: 250mm; max-width: 100%; display: flex; flex-direction: column; gap: 14px; }
  .head { display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #d8d2c8; padding-bottom: 12px; }
  .head img { width: 46px; height: 46px; object-fit: contain; }
  .inst { font-weight: 700; font-size: 14px; }
  .sub { font-size: 10.5px; color: #6f675c; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { padding: 7px 9px; font-size: 11px; border: 1px solid #eee7dc; vertical-align: top; }
  th { text-align: left; font-size: 10px; letter-spacing: .4px; text-transform: uppercase; color: #6f675c; background: #f6f3ee; }
  th.c { text-align: left; }
  td.time, th:first-child {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #6f675c;
    white-space: nowrap; width: 78px; background: #faf8f4;
  }
  td.cell .course { font-weight: 600; color: #16130e; }
  td.cell .teacher { font-size: 10px; color: #6f675c; margin-top: 2px; }
  td.cell .teacher.warn { color: #9a6b00; }
  td.cell.empty { background: #fbfaf7; }
  tr.break td.brk {
    text-align: center; background: #f2efe9; font-size: 10px; letter-spacing: .5px;
    text-transform: uppercase; color: #8a8175; font-weight: 600;
  }
  .foot { font-size: 10px; color: #6f675c; border-top: 1px solid #d8d2c8; padding-top: 10px; }
</style>
</head>
<body>
  <div class="doc">
    <div class="head">
      <img src="/elohim-insignia.png" alt="" />
      <div>
        <div class="inst">${esc(ctx.institutionName)} — Horario semanal · ${esc(ctx.year)}</div>
        <div class="sub">${esc(ctx.sectionLabel)}</div>
      </div>
    </div>

    <table>
      <thead><tr><th>Hora</th>${headCols}</tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="foot">Cada bloque muestra el curso y el docente a cargo.</div>
  </div>
</body>
</html>`;
}

/** Imprime el horario desde un iframe oculto y lo retira al cerrar el diálogo. */
export function printSchedule(data: ScheduleResponse, ctx: SchedulePrintContext): void {
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

  iframe.srcdoc = scheduleHtml(data, ctx);
  document.body.appendChild(iframe);
}
