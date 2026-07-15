// Hora oficial America/Lima (UTC−5, sin horario de verano). La marcación decide el día y la hora
// SIEMPRE en Lima — nunca con getters de Date en la TZ del servidor (el VPS puede correr en UTC).

function limaParts(now: Date = new Date()): {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
} {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
  // hour12:false puede devolver "24" a medianoche en algunos motores → normaliza a "00".
  let hour = get('hour');
  if (hour === '24') hour = '00';
  return { year: get('year'), month: get('month'), day: get('day'), hour, minute: get('minute') };
}

/** Fecha civil de hoy en Lima → "yyyy-mm-dd". */
export function limaTodayISO(now: Date = new Date()): string {
  const p = limaParts(now);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Hora actual en Lima → "HH:mm". */
export function limaNowHHmm(now: Date = new Date()): string {
  const p = limaParts(now);
  return `${p.hour}:${p.minute}`;
}
