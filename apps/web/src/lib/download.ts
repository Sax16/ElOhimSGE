// Descarga de archivos binarios de la API (p. ej. exportaciones .xlsx de Reportes).
// apiFetch está pensado para JSON; esto hace fetch con la cookie de sesión, toma el
// blob, deduce el nombre del Content-Disposition y dispara la descarga con un
// enlace temporal.
import { ApiError } from './api';

/** Extrae el filename de un header Content-Disposition (soporta filename*=UTF-8''). */
function filenameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const star = header.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^["']|["']$/g, ''));
    } catch {
      /* usa el fallback de abajo */
    }
  }
  const plain = header.match(/filename=("?)([^";]+)\1/i);
  if (plain?.[2]) return plain[2].trim();
  return fallback;
}

/**
 * Descarga `/api{path}` como archivo. Lanza ApiError si la respuesta no es ok
 * (intenta parsear el { message } del Nest). `fallbackName` se usa si el servidor
 * no envía Content-Disposition.
 */
export async function downloadFile(path: string, fallbackName = 'reporte.xlsx'): Promise<void> {
  const res = await fetch(`/api${path}`, { method: 'GET', credentials: 'include' });

  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message.join(' ');
      else if (data.message) message = data.message;
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    throw new ApiError(res.status, message);
  }

  const blob = await res.blob();
  const name = filenameFromDisposition(res.headers.get('Content-Disposition'), fallbackName);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
