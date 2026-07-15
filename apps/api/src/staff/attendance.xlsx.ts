import { newWorkbook, workbookToBuffer } from '../reports/reports.xlsx';

// Marca de una celda del reporte mensual: P puntual · T tardanza · F falta · L licencia · – sin marcar.
export type AttendanceCell = 'P' | 'T' | 'F' | 'L' | '–';

export interface AttendanceExportRow {
  code: string;
  fullName: string;
  role: string;
  cells: AttendanceCell[]; // una por día hábil (mismo orden que businessDays)
  puntuales: number;
  tardanzas: number;
  lateMinutes: number;
  faltas: number;
  licencias: number;
}

/**
 * Reporte mensual de asistencia (R3 — E2): una fila por empleado; columnas = días hábiles (L–V)
 * del mes con P/T/F/L/–, más totales. Sigue el patrón de estilos de reports.xlsx (cabecera en
 * negrita, anchos, moneda a la derecha). Meses sin días hábiles se exportan igual (sin reventar).
 */
export async function buildAttendanceWorkbook(
  monthLabel: string,
  businessDays: string[], // yyyy-mm-dd de cada día hábil
  rows: AttendanceExportRow[],
): Promise<Buffer> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet(`Asistencia ${monthLabel}`);

  // Columnas: fijas + una por día hábil (encabezado = número de día) + totales.
  const dayCols = businessDays.map((iso) => ({
    header: iso.slice(8, 10), // "07"
    key: `d_${iso}`,
    width: 5,
  }));
  ws.columns = [
    { header: 'Código', key: 'code', width: 10 },
    { header: 'Empleado', key: 'fullName', width: 28 },
    { header: 'Rol', key: 'role', width: 16 },
    ...dayCols,
    { header: 'Puntuales', key: 'puntuales', width: 11 },
    { header: 'Tardanzas', key: 'tardanzas', width: 11 },
    { header: 'Min tardanza', key: 'lateMinutes', width: 13 },
    { header: 'Faltas', key: 'faltas', width: 9 },
    { header: 'Licencias', key: 'licencias', width: 10 },
  ];

  const header = ws.getRow(1);
  header.font = { bold: true };
  header.alignment = { vertical: 'middle', horizontal: 'center' };

  for (const r of rows) {
    const record: Record<string, string | number> = {
      code: r.code,
      fullName: r.fullName,
      role: r.role,
      puntuales: r.puntuales,
      tardanzas: r.tardanzas,
      lateMinutes: r.lateMinutes,
      faltas: r.faltas,
      licencias: r.licencias,
    };
    businessDays.forEach((iso, i) => {
      record[`d_${iso}`] = r.cells[i] ?? '–';
    });
    const row = ws.addRow(record);
    // Centra las celdas de día.
    for (let i = 0; i < businessDays.length; i++) {
      row.getCell(4 + i).alignment = { horizontal: 'center' };
    }
  }

  return workbookToBuffer(wb);
}
