import { type Prisma, type PrismaClient } from '@prisma/client';
import { dateToISO, isoToDate } from './installment-view.util';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Feriados académicos (R4 — E4): un evento CalendarEvent de tipo FERIADO cubre un día o un rango
 * (startDate..endDate, ambos inclusive). Un FERIADO es no lectivo: bloquea la toma de asistencia de
 * estudiantes ese día y NEUTRALIZA la falta derivada del personal (el día no cuenta como hábil).
 *
 * getHolidaySet devuelve el conjunto de fechas civiles 'yyyy-mm-dd' cubiertas por algún FERIADO que
 * intersecta el rango [fromISO, toISO] (ambos inclusive), expandiendo cada rango día por día. Se
 * consulta por año activo implícitamente (los eventos son por año, pero el filtro es solo por fecha
 * de calendario, suficiente para asistencia/marcación que ya operan sobre el año en curso).
 */
export async function getHolidaySet(
  client: DbClient,
  fromISO: string,
  toISO: string,
): Promise<Set<string>> {
  const from = isoToDate(fromISO);
  const to = isoToDate(toISO);

  // Eventos FERIADO que intersectan [from, to]: startDate <= to && endDate >= from.
  const events = await client.calendarEvent.findMany({
    where: { type: 'FERIADO', startDate: { lte: to }, endDate: { gte: from } },
    select: { startDate: true, endDate: true },
  });

  const set = new Set<string>();
  for (const ev of events) {
    // Expande el rango del evento, recortado a la ventana consultada.
    const evStart = ev.startDate < from ? from : ev.startDate;
    const evEnd = ev.endDate > to ? to : ev.endDate;
    for (let t = evStart.getTime(); t <= evEnd.getTime(); t += 86_400_000) {
      set.add(dateToISO(new Date(t)));
    }
  }
  return set;
}
