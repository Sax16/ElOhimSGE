// Conducta e incidencias (R4 · Etapa 3). StatCards + filtros server-side + tabla
// (tarjetas en móvil) + registro y detalle. El docente la ve scoped a sus aulas
// (el backend aplica el alcance); el copy de las caption se adapta al rol.
// Referencia visual: design/ui_kits/sge/ConductScreen.jsx.
import { useMemo, useState, type CSSProperties } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Icons,
  IconButton,
  Input,
  Select,
  StatCard,
  Table,
  Tooltip,
  useToast,
  type TableColumn,
} from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useMe } from '../../lib/useMe';
import { useCloseIncident, useConductList } from './api';
import {
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  SEVERITY_TONE,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_TONE,
  citationCaption,
  dateTime,
  isFinalStatus,
  shortDate,
  timeOnly,
} from './bits';
import { RegisterIncidentDialog } from './RegisterIncidentDialog';
import { IncidentDetailDialog } from './IncidentDetailDialog';
import type { ConductFilters, ConductSeverity, ConductStatus, Incident } from './types';
import './conduct.css';

export function ConductPage() {
  const { toast } = useToast();
  const { data: me } = useMe();
  const isTeacher = me?.role === 'DOCENTE';

  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'' | ConductSeverity>('');
  const [status, setStatus] = useState<'' | ConductStatus>('');

  const filters: ConductFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      severity: severity || undefined,
      status: status || undefined,
    }),
    [search, severity, status],
  );

  const { data, isLoading } = useConductList(filters);
  const stats = data?.stats;
  const incidents = useMemo(() => data?.incidents ?? [], [data]);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const closeIncident = useCloseIncident();

  const onCloseQuick = (inc: Incident) => {
    closeIncident.mutate(inc.id, {
      onSuccess: () =>
        toast('success', 'Incidencia cerrada', `${inc.code} — queda en el historial del estudiante.`),
      onError: (err) =>
        toast(
          'danger',
          'No se pudo cerrar',
          err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
        ),
    });
  };

  // Próxima citación (para la caption de la StatCard).
  const nextCitation = useMemo(() => {
    const upcoming = incidents
      .filter((i) => i.citationAt && !isFinalStatus(i.status))
      .map((i) => i.citationAt as string)
      .sort();
    return upcoming[0] ?? null;
  }, [incidents]);

  // La Table del design system no expone clase por fila: atenuamos las ANULADAS
  // celda a celda con este estilo (opacity aplicada al contenido).
  const dim = (r: Incident): CSSProperties | undefined =>
    r.status === 'ANULADA' ? { opacity: 0.5 } : undefined;

  const columns: TableColumn<Incident>[] = [
    {
      key: 'code',
      header: 'N°',
      mono: true,
      width: 72,
      render: (_v, r) => <span style={dim(r)}>{r.code}</span>,
    },
    {
      key: 'occurredAt',
      header: 'Fecha',
      align: 'center',
      width: 96,
      render: (_v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)', ...dim(r) }}>
          <span>{shortDate(r.occurredAt)}</span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
            {timeOnly(r.occurredAt)}
          </span>
        </div>
      ),
    },
    {
      key: 'student',
      header: 'Estudiante',
      render: (_v, r) => (
        <div className="esge-conduct-cell" style={dim(r)}>
          <Avatar name={r.student.fullName} size="sm" />
          <div className="esge-conduct-cell__stack">
            <span className="esge-conduct-cell__main">{r.student.fullName}</span>
            <span className="esge-conduct-cell__sub">{r.student.sectionLabel}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'summary',
      header: 'Incidencia',
      render: (_v, r) => (
        <div className="esge-conduct-cell__stack" style={dim(r)}>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.summary}</span>
          <span className="esge-conduct-cell__sub">Registró: {r.registeredByName}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Gravedad',
      align: 'center',
      render: (_v, r) => (
        <span style={dim(r)}>
          <Badge tone={SEVERITY_TONE[r.severity]} dot>
            {SEVERITY_LABELS[r.severity]}
          </Badge>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center',
      render: (_v, r) => (
        <Badge tone={STATUS_TONE[r.status]} dot>
          {STATUS_LABELS[r.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 90,
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 2 }}>
          <Tooltip content="Ver detalle">
            <IconButton label="Ver detalle" size="sm" onClick={() => setDetailId(r.id)}>
              <Icons.Eye />
            </IconButton>
          </Tooltip>
          {!isFinalStatus(r.status) && (
            <Tooltip content="Cerrar incidencia">
              <IconButton
                label="Cerrar incidencia"
                size="sm"
                onClick={() => onCloseQuick(r)}
                disabled={closeIncident.isPending}
              >
                <Icons.Check />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const monthLabel = stats?.monthLabel ?? '—';
  const scopeCaption = isTeacher ? 'en tus aulas' : 'en toda la institución';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* StatCards */}
      <div className="esge-conduct-stats">
        <StatCard
          label={`Incidencias · ${monthLabel}`}
          value={stats?.month ?? 0}
          icon={<Icons.Clipboard />}
          caption={scopeCaption}
        />
        <StatCard
          label="Graves"
          value={stats?.graves ?? 0}
          iconTone="danger"
          icon={<Icons.Bell />}
          caption="con citación al apoderado"
        />
        <StatCard
          label="Abiertas"
          value={stats?.open ?? 0}
          iconTone="accent"
          icon={<Icons.Clock />}
          caption="pendientes de cierre"
        />
        <StatCard
          label="Citaciones esta semana"
          value={stats?.citationsThisWeek ?? 0}
          icon={<Icons.Calendar />}
          caption={nextCitation ? citationCaption(nextCitation) : 'sin citaciones próximas'}
        />
      </div>

      {/* Toolbar */}
      <div className="esge-conduct-toolbar">
        <div className="esge-conduct-toolbar__search">
          <Input
            iconLeft={<Icons.Search />}
            placeholder="Buscar por estudiante o asunto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          placeholder="Todas"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as '' | ConductSeverity)}
          containerStyle={{ minWidth: 140 }}
          options={SEVERITY_ORDER.map((s) => ({ value: s, label: SEVERITY_LABELS[s] }))}
        />
        <Select
          placeholder="Todos"
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | ConductStatus)}
          containerStyle={{ minWidth: 190 }}
          options={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
        />
        <div className="esge-conduct-toolbar__spacer" />
        <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setRegisterOpen(true)}>
          Registrar incidencia
        </Button>
      </div>

      {/* Listado */}
      {!isLoading && incidents.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Icons.Clipboard />}
            title="Sin incidencias"
            description={
              search || severity || status
                ? 'No hay incidencias que coincidan con los filtros.'
                : 'Aún no se han registrado incidencias de conducta.'
            }
          />
        </Card>
      ) : (
        <>
          {/* Tabla (md+) */}
          <div className="esge-conduct-table">
            <Card flush>
              <Table columns={columns} data={incidents} hover zebra />
            </Card>
          </div>

          {/* Tarjetas (sm) */}
          <div className="esge-conduct-cards">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className={`esge-conduct-card${
                  inc.status === 'ANULADA' ? ' esge-conduct-card--canceled' : ''
                }`}
              >
                <div className="esge-conduct-card__top">
                  <span className="esge-conduct-card__code">{inc.code}</span>
                  <span className="esge-conduct-card__date">{dateTime(inc.occurredAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={inc.student.fullName} size="sm" />
                  <div className="esge-conduct-cell__stack">
                    <span className="esge-conduct-cell__main">{inc.student.fullName}</span>
                    <span className="esge-conduct-cell__sub">{inc.student.sectionLabel}</span>
                  </div>
                </div>
                <div className="esge-conduct-card__summary">{inc.summary}</div>
                <div className="esge-conduct-card__meta">Registró: {inc.registeredByName}</div>
                <div className="esge-conduct-card__badges">
                  <Badge tone={SEVERITY_TONE[inc.severity]} dot>
                    {SEVERITY_LABELS[inc.severity]}
                  </Badge>
                  <Badge tone={STATUS_TONE[inc.status]} dot>
                    {STATUS_LABELS[inc.status]}
                  </Badge>
                </div>
                <div className="esge-conduct-card__actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<Icons.Eye />}
                    onClick={() => setDetailId(inc.id)}
                  >
                    Ver detalle
                  </Button>
                  {!isFinalStatus(inc.status) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Icons.Check />}
                      onClick={() => onCloseQuick(inc)}
                      disabled={closeIncident.isPending}
                    >
                      Cerrar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <RegisterIncidentDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onCreated={(inc) => setDetailId(inc.id)}
      />
      <IncidentDetailDialog incidentId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
