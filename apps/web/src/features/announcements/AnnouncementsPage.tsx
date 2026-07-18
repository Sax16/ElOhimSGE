// Comunicados (R4 · Etapa 4). StatCards + filtros server-side + tabla (tarjetas
// en móvil). Un alcance por comunicado; estados Borrador → Enviado; envío manual
// por WhatsApp, familia por familia.
// Referencia visual: design/ui_kits/sge/AnnouncementsScreen.jsx (adaptada a las
// decisiones de la etapa: sin Programado ni tasa de lectura).
import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Dialog,
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
import { useAnnouncements, useDeleteAnnouncement, useDuplicateAnnouncement } from './api';
import { STATUS_LABELS, STATUS_ORDER, STATUS_TONE, shortDate } from './bits';
import { ComposeDialog } from './ComposeDialog';
import { SendDialog } from './SendDialog';
import { ViewDialog } from './ViewDialog';
import type { Announcement, AnnouncementFilters, AnnouncementStatus } from './types';
import './announcements.css';

export function AnnouncementsPage() {
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | AnnouncementStatus>('');

  const filters: AnnouncementFilters = useMemo(
    () => ({ search: search.trim() || undefined, status: status || undefined }),
    [search, status],
  );

  const { data, isLoading } = useAnnouncements(filters);
  const stats = data?.stats;
  const announcements = useMemo(() => data?.announcements ?? [], [data]);

  const duplicateMut = useDuplicateAnnouncement();
  const deleteMut = useDeleteAnnouncement();

  // Diálogos.
  const [compose, setCompose] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [send, setSend] = useState<{ id: string | null; mode: 'send' | 'resend' }>({
    id: null,
    mode: 'send',
  });
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const onDuplicate = (a: Announcement) => {
    duplicateMut.mutate(a.id, {
      onSuccess: (item) =>
        toast('success', 'Comunicado duplicado', `Se creó "${item.title}" como borrador.`),
      onError: (err) =>
        toast('danger', 'No se pudo duplicar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const onConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast('success', 'Borrador eliminado', `Se eliminó "${deleteTarget.title}".`);
        setDeleteTarget(null);
      },
      onError: (err) =>
        toast('danger', 'No se pudo eliminar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
    });
  };

  const openRow = (a: Announcement) =>
    a.status === 'BORRADOR' ? setCompose({ open: true, id: a.id }) : setViewId(a.id);

  const columns: TableColumn<Announcement>[] = [
    { key: 'code', header: 'N°', mono: true, width: 84 },
    {
      key: 'title',
      header: 'Comunicado',
      render: (_v, r) => (
        <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
          {r.title}
        </span>
      ),
    },
    {
      key: 'scopeLabel',
      header: 'Alcance',
      render: (_v, r) => <Badge tone="brand">{r.scopeLabel}</Badge>,
    },
    {
      key: 'sentAt',
      header: 'Envío',
      align: 'center',
      mono: true,
      render: (_v, r) =>
        r.sentAt ? shortDate(r.sentAt) : <span style={{ color: 'var(--text-subtle)' }}>—</span>,
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
      key: 'recipientsCount',
      header: 'Destinatarios',
      align: 'center',
      mono: true,
      render: (_v, r) =>
        r.recipientsCount != null ? (
          r.recipientsCount
        ) : (
          <span style={{ color: 'var(--text-subtle)' }}>—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: 150,
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 2 }}>
          <Tooltip content={r.status === 'BORRADOR' ? 'Editar' : 'Ver'}>
            <IconButton label={r.status === 'BORRADOR' ? 'Editar' : 'Ver'} size="sm" onClick={() => openRow(r)}>
              {r.status === 'BORRADOR' ? <Icons.Pencil /> : <Icons.Eye />}
            </IconButton>
          </Tooltip>
          {r.status === 'BORRADOR' && (
            <Tooltip content="Enviar">
              <IconButton label="Enviar" size="sm" onClick={() => setSend({ id: r.id, mode: 'send' })}>
                <Icons.Send />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip content="Duplicar">
            <IconButton
              label="Duplicar"
              size="sm"
              onClick={() => onDuplicate(r)}
              disabled={duplicateMut.isPending}
            >
              <Icons.Copy />
            </IconButton>
          </Tooltip>
          {r.status === 'BORRADOR' && (
            <Tooltip content="Eliminar">
              <IconButton label="Eliminar" size="sm" onClick={() => setDeleteTarget(r)}>
                <Icons.Trash />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const monthLabel = stats?.monthLabel ?? '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* StatCards */}
      <div className="esge-ann-stats">
        <StatCard
          label={`Enviados · ${monthLabel}`}
          value={stats?.sentMonth ?? 0}
          icon={<Icons.Send />}
          caption="este mes"
        />
        <StatCard
          label="Borradores"
          value={stats?.drafts ?? 0}
          iconTone="accent"
          icon={<Icons.Clipboard />}
          caption="pendientes de envío"
        />
        <StatCard
          label="Último envío"
          value={stats?.lastSentAt ? shortDate(stats.lastSentAt) : '—'}
          icon={<Icons.Clock />}
          caption={stats?.lastSentAt ? 'fecha del último comunicado' : 'sin envíos aún'}
        />
      </div>

      {/* Toolbar */}
      <div className="esge-ann-toolbar">
        <div className="esge-ann-toolbar__search">
          <Input
            iconLeft={<Icons.Search />}
            placeholder="Buscar comunicado…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | AnnouncementStatus)}
          containerStyle={{ minWidth: 160 }}
          options={[
            { value: '', label: 'Todos' },
            ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
          ]}
        />
        <div className="esge-ann-toolbar__spacer" />
        <Button
          variant="primary"
          iconLeft={<Icons.Megaphone />}
          onClick={() => setCompose({ open: true, id: null })}
        >
          Nuevo comunicado
        </Button>
      </div>

      {/* Listado */}
      {!isLoading && announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Icons.Megaphone />}
            title="Sin comunicados"
            description={
              search || status
                ? 'No hay comunicados que coincidan con los filtros.'
                : 'Aún no se han creado comunicados.'
            }
          />
        </Card>
      ) : (
        <>
          {/* Tabla (md+) */}
          <div className="esge-ann-table">
            <Card flush>
              <Table columns={columns} data={announcements} rowKey="id" hover zebra />
            </Card>
          </div>

          {/* Tarjetas (sm) */}
          <div className="esge-ann-cards">
            {announcements.map((a) => (
              <div key={a.id} className="esge-ann-card">
                <div className="esge-ann-card__top">
                  <span className="esge-ann-card__code">{a.code}</span>
                  <span className="esge-ann-card__date">{a.sentAt ? shortDate(a.sentAt) : '—'}</span>
                </div>
                <div className="esge-ann-card__title">{a.title}</div>
                <div className="esge-ann-card__badges">
                  <Badge tone="brand">{a.scopeLabel}</Badge>
                  <Badge tone={STATUS_TONE[a.status]} dot>
                    {STATUS_LABELS[a.status]}
                  </Badge>
                  {a.recipientsCount != null && (
                    <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
                      {a.recipientsCount} destinatarios
                    </span>
                  )}
                </div>
                <div className="esge-ann-card__actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={a.status === 'BORRADOR' ? <Icons.Pencil /> : <Icons.Eye />}
                    onClick={() => openRow(a)}
                  >
                    {a.status === 'BORRADOR' ? 'Editar' : 'Ver'}
                  </Button>
                  {a.status === 'BORRADOR' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Icons.Send />}
                      onClick={() => setSend({ id: a.id, mode: 'send' })}
                    >
                      Enviar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    iconLeft={<Icons.Copy />}
                    onClick={() => onDuplicate(a)}
                    disabled={duplicateMut.isPending}
                  >
                    Duplicar
                  </Button>
                  {a.status === 'BORRADOR' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<Icons.Trash />}
                      onClick={() => setDeleteTarget(a)}
                      style={{ color: 'var(--danger)' }}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Diálogos */}
      <ComposeDialog
        open={compose.open}
        announcementId={compose.id}
        onClose={() => setCompose({ open: false, id: null })}
        onRequestSend={(item) => setSend({ id: item.id, mode: 'send' })}
      />
      <SendDialog
        announcementId={send.id}
        mode={send.mode}
        onClose={() => setSend({ id: null, mode: 'send' })}
      />
      <ViewDialog
        announcementId={viewId}
        onClose={() => setViewId(null)}
        onResend={(id) => {
          setViewId(null);
          setSend({ id, mode: 'resend' });
        }}
      />

      {/* Confirmación de borrado. */}
      <ConfirmDelete
        target={deleteTarget}
        pending={deleteMut.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}

function ConfirmDelete({
  target,
  pending,
  onCancel,
  onConfirm,
}: {
  target: Announcement | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={!!target}
      onClose={onCancel}
      icon={<Icons.Trash />}
      iconTone="danger"
      title="Eliminar borrador"
      description={target ? `${target.code} · ${target.title}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="danger" iconLeft={<Icons.Check />} onClick={onConfirm} disabled={pending}>
            Eliminar
          </Button>
        </>
      }
    >
      <p style={{ padding: '4px 0', font: 'var(--type-body)', color: 'var(--text-body)' }}>
        El borrador se eliminará de la lista. Esta acción no se puede deshacer.
      </p>
    </Dialog>
  );
}
