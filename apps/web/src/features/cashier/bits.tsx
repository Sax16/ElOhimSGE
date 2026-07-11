// Piezas compartidas de la pantalla Caja y cobros.
import type { BadgeTone } from '@elohim/ui';
import type { PaymentMethod } from './types';

/** Tono del badge por método de pago (Efectivo=success, Yape/Plin=brand, resto=info). */
export function methodTone(method: PaymentMethod): BadgeTone {
  if (method === 'EFECTIVO') return 'success';
  if (method === 'YAPE_PLIN') return 'brand';
  return 'info';
}

/** ISO datetime → "hh:mm" en hora local (para la columna Hora). */
export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

/** ISO datetime → "dd/mm/aaaa · hh:mm" en hora local (encabezado del recibo). */
export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

/** Solo dígitos de un teléfono (para armar el enlace wa.me). */
export function digitsOnly(phone: string | null | undefined): string {
  return (phone ?? '').replace(/\D/g, '');
}
