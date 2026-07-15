// Marcación y asistencia (R3 · Etapa 2). Componente reutilizable: lo consumen la
// pestaña "Asistencia y marcación" de Personal y la vista standalone de Portería.
// Spec de pantalla: design/ui_kits/sge/StaffScreen.jsx (Asistencia + ReglasDialog).
// Decisiones: alcance-funcional.md § "Marcación y asistencia — decisiones de la etapa 2".
import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Icons,
  IconButton,
  Input,
  StatCard,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { ApiError } from '../../../lib/api';
import { useCan } from '../../../lib/useCan';
import { useMe } from '../../../lib/useMe';
import { avatarColor } from '../bits';
import {
  exportAttendance,
  useAttendanceDay,
  useAttendanceRules,
  useCheckIn,
  useCheckOut,
} from './api';
import {
  ATT_STATUS_LABELS,
  ATT_STATUS_TONE,
  dayTitle,
  monthOf,
  shortDate,
  shortName,
  todayStr,
} from './bits';
import { CorrectionDialog } from './CorrectionDialog';
import { ReglasDialog } from './ReglasDialog';
import type { AttendanceRow } from './types';
import './attendance.css';

export interface AttendanceTabProps {
  /** 'porteria' = header simplificado, día fijo hoy, solo marcación. */
  mode?: 'full' | 'porteria';
}

// Refresco en vivo de la vista Portería (varios cobradores marcan en paralelo).
const PORTERIA_REFETCH_MS = 60_000;

export function AttendanceTab({ mode = 'full' }: AttendanceTabProps) {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const isPorteria = mode === 'porteria';

  const canMark = useCan('marcacion', 'editar');
  const canExport = useCan('marcacion', 'ver') && !isPorteria;
  const canEditRules = useCan('personal', 'editar') && !isPorteria;

  const today = todayStr();
  const [date, setDate] = useState(today);
  const effectiveDate = isPorteria ? today : date;
  const isToday = effectiveDate === today;

  const { data, isLoading } = useAttendanceDay(
    effectiveDate,
    isPorteria ? PORTERIA_REFETCH_MS : undefined,
  );
  const { data: rules } = useAttendanceRules(canEditRules);

  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const [reglasOpen, setReglasOpen] = useState(false);
  const [correcting, setCorrecting] = useState<AttendanceRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const stats = data?.stats;
  const isBusinessDay = data?.isBusinessDay ?? true;

  // Resumen dinámico de horarios por grupo para el Alert.
  const rulesSummary = useMemo(() => {
    if (!rules) return '';
    return [...rules.groups]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((g) => `${g.name} ${g.entryTime}`)
      .join(' · ');
  }, [rules]);

  // Caption de Licencias: nombres cortos si son pocas, si no un texto simple.
  const licenciasCaption = useMemo(() => {
    if (!stats || stats.licencias === 0) return 'sin licencias';
    const names = rows.filter((r) => r.status === 'LICENCIA').map((r) => shortName(r.fullName));
    if (names.length > 0 && names.length <= 2) return names.join(' · ');
    return 'empleados con licencia';
  }, [stats, rows]);

  const onMarkIn = (r: AttendanceRow) => {
    checkIn.mutate(
      { staffId: r.staffId },
      {
        onSuccess: (updated) => {
          const late = updated.status === 'TARDANZA';
          toast(
            late ? 'warning' : 'success',
            `Ingreso marcado · ${updated.checkIn ?? ''}`,
            `${updated.fullName} — ${ATT_STATUS_LABELS[updated.status]}${
              late ? ` (después de las ${updated.expectedEntryTime})` : ''
            }.`,
          );
        },
        onError: (err) =>
          toast('danger', 'No se pudo marcar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const onMarkOut = (r: AttendanceRow) => {
    checkOut.mutate(
      { staffId: r.staffId },
      {
        onSuccess: (updated) => {
          toast('info', `Salida marcada · ${updated.checkOut ?? ''}`, `${updated.fullName} completó su jornada.`);
        },
        onError: (err) =>
          toast('danger', 'No se pudo marcar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const month = monthOf(effectiveDate);
      await exportAttendance(month);
      toast('success', 'Asistencia exportada', `${month} · descargada en Excel.`);
    } catch (err) {
      toast('danger', 'No se pudo exportar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  const columns: TableColumn<AttendanceRow>[] = [
    {
      key: 'fullName',
      header: 'Empleado',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={r.fullName} size="sm" color={avatarColor(r.code)} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.fullName}</span>
            {r.area && (
              <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{r.area}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'checkIn',
      header: 'Ingreso',
      mono: true,
      align: 'center',
      render: (_v, r) => (
        <span style={{ color: r.checkIn ? 'var(--text-body)' : 'var(--text-subtle)' }}>
          {r.checkIn ?? '—'}
        </span>
      ),
    },
    {
      key: 'checkOut',
      header: 'Salida',
      mono: true,
      align: 'center',
      render: (_v, r) => (
        <span style={{ color: r.checkOut ? 'var(--text-body)' : 'var(--text-subtle)' }}>
          {r.checkOut ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => <StatusCell row={r} />,
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => {
        const marking =
          isToday && canMark
            ? r.checkIn == null && r.status !== 'LICENCIA'
              ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    iconLeft={<Icons.Clock />}
                    disabled={checkIn.isPending}
                    onClick={() => onMarkIn(r)}
                  >
                    Marcar ingreso
                  </Button>
                )
              : r.checkIn != null && r.checkOut == null
                ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      iconLeft={<Icons.Clock />}
                      disabled={checkOut.isPending}
                      onClick={() => onMarkOut(r)}
                    >
                      Marcar salida
                    </Button>
                  )
                : null
            : null;
        return (
          <div style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
            {marking}
            {isAdmin && !isPorteria && (
              <Tooltip content="Corregir">
                <IconButton label="Corregir" size="sm" onClick={() => setCorrecting(r)}>
                  <Icons.Pencil />
                </IconButton>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Tarjetas de resumen */}
      <div className="esge-att-stats">
        <StatCard
          label="Presentes"
          value={stats ? stats.presentes : '—'}
          iconTone="success"
          icon={<Icons.Check />}
          caption={stats ? `de ${stats.total} empleados` : undefined}
        />
        <StatCard
          label="Tardanzas"
          value={stats ? stats.tardanzas : '—'}
          iconTone="accent"
          icon={<Icons.Clock />}
          caption={isToday ? 'hoy' : shortDate(effectiveDate)}
        />
        <StatCard
          label={isToday ? 'Sin marcar' : 'Faltas'}
          value={stats ? stats.sinMarcarOFaltas : '—'}
          iconTone="danger"
          icon={<Icons.Clipboard />}
          caption={isToday ? 'aún no marcan' : 'del día'}
        />
        <StatCard
          label="Licencias"
          value={stats ? stats.licencias : '—'}
          icon={<Icons.Clipboard />}
          caption={licenciasCaption}
        />
      </div>

      {/* Aviso de reglas (solo quien puede editarlas) */}
      {canEditRules && (
        <Alert
          tone="info"
          title="Horarios y tolerancia por grupo"
          actions={
            <Button
              size="sm"
              variant="secondary"
              iconLeft={<Icons.Settings />}
              onClick={() => setReglasOpen(true)}
            >
              Configurar reglas
            </Button>
          }
        >
          {rulesSummary ? `${rulesSummary}. ` : ''}
          Pasada la tolerancia se registra tardanza; las tardanzas acumuladas generan descuento
          según la regla configurada.
        </Alert>
      )}

      {/* Controles: fecha + exportar (oculto en Portería) */}
      {!isPorteria && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <Input
            label="Fecha"
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            containerStyle={{ width: 180 }}
          />
          <div style={{ flex: 1 }} />
          {canExport && (
            <Button
              variant="secondary"
              iconLeft={<Icons.Download />}
              disabled={exporting}
              onClick={onExport}
            >
              Exportar mes
            </Button>
          )}
        </div>
      )}

      {/* Día no laborable */}
      {!isBusinessDay && (
        <Alert tone="info" title="Día no laborable">
          Sábados, domingos y feriados no penalizan — las marcas registradas se guardan sin generar
          faltas ni tardanzas.
        </Alert>
      )}

      {/* Tabla de marcación */}
      <Card flush title={`Marcación · ${dayTitle(effectiveDate)}`}>
        <Table
          columns={columns}
          data={rows}
          rowKey="staffId"
          hover
          emptyText={isLoading ? 'Cargando marcación…' : 'No hay empleados para este día.'}
        />
      </Card>

      {canEditRules && (
        <ReglasDialog open={reglasOpen} onClose={() => setReglasOpen(false)} rules={rules} />
      )}
      {isAdmin && !isPorteria && (
        <CorrectionDialog row={correcting} date={effectiveDate} onClose={() => setCorrecting(null)} />
      )}
    </div>
  );
}

/** Badge de estado con tooltip (tardanza / corregida). */
function StatusCell({ row }: { row: AttendanceRow }) {
  const parts: string[] = [];
  if (row.status === 'TARDANZA' && row.lateMinutes > 0) parts.push(`${row.lateMinutes} min tarde`);
  if (row.corrected) parts.push('Corregida por administración');
  const tip = parts.join(' · ');

  const badge = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Badge tone={ATT_STATUS_TONE[row.status]} dot>
        {ATT_STATUS_LABELS[row.status]}
      </Badge>
      {row.corrected && (
        <Icons.Pencil style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
      )}
    </span>
  );

  return tip ? <Tooltip content={tip}>{badge}</Tooltip> : badge;
}
