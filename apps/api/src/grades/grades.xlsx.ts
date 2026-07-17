import { newWorkbook, workbookToBuffer } from '../reports/reports.xlsx';

// Fila del acta: número de orden, código, estudiante, una letra por competencia, logro y condición.
export interface ActaExportRow {
  n: number;
  studentCode: string;
  fullName: string;
  letters: Record<string, string>; // competencyId → "AD" | "A" | "B" | "C" (o "–")
  resultLetter: string; // logro del bimestre ("–" si vacío)
  conditionLabel: string; // "Logrado" | "En proceso" | "En inicio" | "–"
}

/**
 * Acta de evaluación por curso·sección·periodo (R4 — E2): una fila por estudiante; columnas =
 * competencias (letra AD/A/B/C), más el logro del bimestre y la condición. Sigue el patrón de estilos
 * de reports.xlsx (título, cabecera en negrita, celdas de competencia centradas).
 */
export async function buildActaWorkbook(
  sectionLabel: string,
  courseName: string,
  periodName: string,
  competencies: { id: string; name: string }[],
  rows: ActaExportRow[],
): Promise<Buffer> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet('Acta');

  const compCols = competencies.map((c, i) => ({ header: c.name, key: `c_${c.id}`, width: 16, index: i }));
  ws.columns = [
    { header: 'N°', key: 'n', width: 5 },
    { header: 'Código', key: 'code', width: 10 },
    { header: 'Estudiante', key: 'fullName', width: 32 },
    ...compCols.map((c) => ({ header: c.header, key: c.key, width: c.width })),
    { header: 'Logro del bimestre', key: 'result', width: 18 },
    { header: 'Condición', key: 'condition', width: 14 },
  ];

  // Título en dos filas insertadas sobre la cabecera.
  ws.spliceRows(1, 0, [`${courseName} — ${sectionLabel}`], [periodName]);
  ws.getRow(1).font = { bold: true, size: 13 };
  ws.getRow(2).font = { italic: true };

  const header = ws.getRow(3);
  header.font = { bold: true };
  header.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  for (const r of rows) {
    const record: Record<string, string | number> = {
      n: r.n,
      code: r.studentCode,
      fullName: r.fullName,
      result: r.resultLetter,
      condition: r.conditionLabel,
    };
    for (const c of competencies) record[`c_${c.id}`] = r.letters[c.id] ?? '–';
    const row = ws.addRow(record);
    // Centra las columnas de competencia + logro (desde la 4ª hasta la penúltima).
    for (let i = 0; i < competencies.length + 1; i++) {
      row.getCell(4 + i).alignment = { horizontal: 'center' };
    }
  }

  return workbookToBuffer(wb);
}
