import ExcelJS from 'exceljs';

// Formato de moneda para celdas numéricas de los reportes.
export const MONEY_FMT = '#,##0.00';

export interface SheetColumn {
  header: string;
  key: string;
  width?: number;
  money?: boolean; // aplica MONEY_FMT y alinea a la derecha
}

export type CellValue = string | number | null;

// yyyy-mm-dd → "dd/mm/yyyy" (texto; las fechas van como texto por decisión del contrato E5).
export function ddmmyyyy(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// yyyy-mm-ddThh:mm:ss... → "dd/mm/yyyy hh:mm" (para columnas de hora).
export function datetimeText(iso: string | null): string {
  if (!iso) return '';
  const dt = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
}

export function timeText(iso: string | null): string {
  if (!iso) return '';
  const dt = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(dt.getHours())}:${p(dt.getMinutes())}`;
}

// Monto string "0.00" → número (para celdas con formato de moneda).
export function num(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export function newWorkbook(): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Elohim SGE';
  wb.created = new Date();
  return wb;
}

// Agrega una hoja con cabecera en negrita, anchos y formato de moneda por columna.
export function addSheet(
  wb: ExcelJS.Workbook,
  name: string,
  columns: SheetColumn[],
  rows: Record<string, CellValue>[],
): ExcelJS.Worksheet {
  const ws = wb.addWorksheet(name);
  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 18,
    style: c.money ? { numFmt: MONEY_FMT, alignment: { horizontal: 'right' } } : {},
  }));
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: 'middle' };
  for (const r of rows) ws.addRow(r);
  return ws;
}

export async function workbookToBuffer(wb: ExcelJS.Workbook): Promise<Buffer> {
  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}
