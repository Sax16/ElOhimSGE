import ExcelJS from 'exceljs';
import { PAYMENT_METHOD_LABELS, PAYROLL_STATUS_LABELS, type PaymentMethod, type PayrollStatus } from '@elohim/shared';

// Construcción del .xlsx de planilla (R3 — E3), patrón de reports.xlsx (exceljs).
const MONEY_FMT = '#,##0.00';
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

function ddmmyyyy(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export interface PayrollXlsxRow {
  code: string;
  name: string;
  position: string;
  scheme: string;
  gross: string;
  discount: string;
  contrib: string;
  net: string;
  status: PayrollStatus;
  method: PaymentMethod | null;
  paidAt: string | null;
}

export async function buildPayrollWorkbook(
  year: number,
  month: number,
  rows: PayrollXlsxRow[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Elohim SGE';
  wb.created = new Date();

  const ws = wb.addWorksheet(`Planilla ${MONTH_NAMES[month - 1]} ${year}`);
  const columns: Array<{ header: string; key: string; width: number; money?: boolean }> = [
    { header: 'Código', key: 'code', width: 12 },
    { header: 'Empleado', key: 'name', width: 30 },
    { header: 'Cargo', key: 'position', width: 16 },
    { header: 'Régimen pensionario', key: 'scheme', width: 20 },
    { header: 'Sueldo del mes', key: 'gross', width: 16, money: true },
    { header: 'Descuentos', key: 'discount', width: 14, money: true },
    { header: 'Aportes', key: 'contrib', width: 14, money: true },
    { header: 'Neto', key: 'net', width: 14, money: true },
    { header: 'Estado', key: 'status', width: 12 },
    { header: 'Método', key: 'method', width: 16 },
    { header: 'Fecha de pago', key: 'paidAt', width: 16 },
  ];
  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width,
    style: c.money ? { numFmt: MONEY_FMT, alignment: { horizontal: 'right' } } : {},
  }));
  const header = ws.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: 'middle' };

  let grossT = 0;
  let discountT = 0;
  let contribT = 0;
  let netT = 0;
  for (const r of rows) {
    grossT += Number(r.gross);
    discountT += Number(r.discount);
    contribT += Number(r.contrib);
    netT += Number(r.net);
    ws.addRow({
      code: r.code,
      name: r.name,
      position: r.position,
      scheme: r.scheme,
      gross: Number(r.gross),
      discount: Number(r.discount),
      contrib: Number(r.contrib),
      net: Number(r.net),
      status: PAYROLL_STATUS_LABELS[r.status],
      method: r.method ? PAYMENT_METHOD_LABELS[r.method] : '',
      paidAt: ddmmyyyy(r.paidAt),
    });
  }

  const totalRow = ws.addRow({
    name: 'Totales',
    gross: grossT,
    discount: discountT,
    contrib: contribT,
    net: netT,
  });
  totalRow.font = { bold: true };

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}
