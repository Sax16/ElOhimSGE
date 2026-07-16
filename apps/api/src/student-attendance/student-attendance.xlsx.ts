import { newWorkbook, workbookToBuffer } from '../reports/reports.xlsx';

// Fila de un estudiante en la matriz mensual (letras P/T/F/J por día + totales + %).
export interface StudentAttendanceExportRow {
  studentCode: string;
  fullName: string;
  byDate: Record<string, string>; // dateISO → "P" | "T" | "F" | "J"
  totals: { PRESENTE: number; TARDANZA: number; FALTA: number; JUSTIFICADA: number };
  pct: number | null;
}

/**
 * Reporte mensual de asistencia de estudiantes (R4 — E1): una fila por estudiante; columnas = días
 * lectivos con toma (L–V) con P/T/F/J, más totales y % de asistencia. Sigue el patrón de estilos de
 * reports.xlsx (cabecera en negrita, anchos, celdas de día centradas).
 */
export async function buildStudentAttendanceWorkbook(
  sectionLabel: string,
  monthLabel: string,
  days: string[], // yyyy-mm-dd de cada día con registros
  rows: StudentAttendanceExportRow[],
): Promise<Buffer> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet(`Asistencia ${monthLabel}`);

  const dayCols = days.map((iso) => ({ header: iso.slice(8, 10), key: `d_${iso}`, width: 5 }));
  ws.columns = [
    { header: 'Código', key: 'code', width: 10 },
    { header: 'Estudiante', key: 'fullName', width: 30 },
    ...dayCols,
    { header: 'Presentes', key: 'presentes', width: 11 },
    { header: 'Tardanzas', key: 'tardanzas', width: 11 },
    { header: 'Faltas', key: 'faltas', width: 9 },
    { header: 'Justificadas', key: 'justificadas', width: 13 },
    { header: '% Asist.', key: 'pct', width: 9 },
  ];

  // Título en una fila insertada sobre la cabecera.
  ws.spliceRows(1, 0, [`${sectionLabel} — ${monthLabel}`]);
  ws.getRow(1).font = { bold: true, size: 13 };

  const header = ws.getRow(2);
  header.font = { bold: true };
  header.alignment = { vertical: 'middle', horizontal: 'center' };

  for (const r of rows) {
    const record: Record<string, string | number> = {
      code: r.studentCode,
      fullName: r.fullName,
      presentes: r.totals.PRESENTE,
      tardanzas: r.totals.TARDANZA,
      faltas: r.totals.FALTA,
      justificadas: r.totals.JUSTIFICADA,
      pct: r.pct === null ? '' : r.pct,
    };
    for (const iso of days) record[`d_${iso}`] = r.byDate[iso] ?? '–';
    const row = ws.addRow(record);
    // Centra las celdas de día (columnas 3 .. 2+days.length).
    for (let i = 0; i < days.length; i++) {
      row.getCell(3 + i).alignment = { horizontal: 'center' };
    }
  }

  return workbookToBuffer(wb);
}
