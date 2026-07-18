// DTOs del Calendario académico (R4 · Etapa 4), según el contrato de la API.
// El enum vive en @elohim/shared (espejo de Prisma).

export { CALENDAR_EVENT_TYPES } from '@elohim/shared';
export type { CalendarEventType } from '@elohim/shared';
import type { CalendarEventType } from '@elohim/shared';

/** Evento del calendario — GET /calendar. */
export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  name: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD' (igual a startDate si es de un solo día)
  description: string | null;
}

/** Vencimiento de pensiones derivado del cronograma (no editable). */
export interface PensionMark {
  date: string; // 'YYYY-MM-DD'
  label: string; // "Vencen cuotas de julio"
  count: number;
}

/** Respuesta del mes — GET /calendar?month=YYYY-MM. */
export interface CalendarResponse {
  month: string; // 'YYYY-MM'
  events: CalendarEvent[];
  pension: PensionMark[];
}

// ---- Crear / editar --------------------------------------------------------
export interface CreateEventBody {
  type: CalendarEventType;
  name: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate?: string; // 'YYYY-MM-DD' — vacío = un solo día
  description?: string;
}

export type UpdateEventBody = CreateEventBody;
