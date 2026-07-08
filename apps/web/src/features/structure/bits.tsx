// Piezas compartidas de la pantalla Estructura académica: barra de vacantes y helpers.
import { ProgressBar } from '@elohim/ui';
import type { ProgressBarProps } from '@elohim/ui';

/** Barra de ocupación de vacantes: danger ≥100%, warning ≥85%, success <85%. */
export function VacBar({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const pct = capacity > 0 ? (enrolled / capacity) * 100 : 0;
  const tone: ProgressBarProps['tone'] = pct >= 100 ? 'danger' : pct >= 85 ? 'warning' : 'success';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 170 }}>
      <div style={{ flex: 1 }}>
        <ProgressBar value={enrolled} max={capacity || 1} tone={tone} size="sm" />
      </div>
      <span
        style={{
          font: 'var(--type-mono)',
          fontSize: 'var(--text-xs)',
          color: pct >= 100 ? 'var(--danger)' : 'var(--text-muted)',
          whiteSpace: 'nowrap',
        }}
      >
        {enrolled}/{capacity}
      </span>
    </div>
  );
}

/** ISO (YYYY-MM-DD o datetime) → "dd/mm/aaaa". */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** ISO → "dd/mm" (para tablas compactas de periodos). */
export function fmtDayMonth(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [, m, d] = iso.slice(0, 10).split('-');
  if (!m || !d) return iso;
  return `${d}/${m}`;
}

/** ISO → "YYYY-MM-DD" para inputs type="date". */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

/** Extrae el año (4 dígitos) del nombre/fechas de un año académico. */
export function yearNumberFrom(name: string, startDate?: string): number | null {
  const fromName = name.match(/\d{4}/);
  if (fromName) return Number(fromName[0]);
  if (startDate) {
    const fromDate = startDate.slice(0, 4);
    if (/^\d{4}$/.test(fromDate)) return Number(fromDate);
  }
  return null;
}

/** ¿El nivel es de tipo Inicial? (afecta el naming de secciones/grados). */
export function isInicial(levelName: string): boolean {
  return levelName.toLowerCase().includes('inicial');
}

/** % de avance de un periodo según fechas vs hoy. */
export function periodProgress(startDate: string, endDate: string, today = new Date()): number {
  const start = new Date(startDate.slice(0, 10)).getTime();
  const end = new Date(endDate.slice(0, 10)).getTime();
  const now = today.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}
