// Portal del apoderado — Avisos (/pavisos). Comunicados (expandibles) y la
// conducta del hijo seleccionado (incidencias con gravedad, estado y citación).
import { useState } from 'react';
import { Badge, Card, EmptyState, Icons } from '@elohim/ui';
import { PortalShell } from './PortalShell';
import { usePortalAnnouncements, usePortalConduct } from './api';
import {
  SEVERITY_LABELS,
  SEVERITY_TONE,
  STATUS_LABELS,
  STATUS_TONE,
} from '../conduct/bits';
import { shortDate, timeOnly } from './bits';
import type { PortalAnnouncement, PortalStudent } from './types';

export function PortalNoticesPage() {
  return <PortalShell>{(child) => <NoticesBody child={child} />}</PortalShell>;
}

function NoticesBody({ child }: { child: PortalStudent }) {
  return (
    <>
      <AnnouncementsCard />
      <ConductCard child={child} />
    </>
  );
}

function AnnouncementsCard() {
  const { data, isLoading } = usePortalAnnouncements();
  const announcements = data?.announcements ?? [];

  return (
    <Card flush title="Comunicados">
      {isLoading && announcements.length === 0 ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          Cargando comunicados…
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<Icons.Megaphone />}
          title="Sin comunicados"
          description="Cuando el colegio envíe un comunicado, aparecerá aquí."
        />
      ) : (
        <div style={{ padding: '4px 18px 14px' }}>
          {announcements.map((a) => (
            <AnnouncementItem key={a.code} a={a} />
          ))}
        </div>
      )}
    </Card>
  );
}

function AnnouncementItem({ a }: { a: PortalAnnouncement }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pt-item">
      <div className="pt-item__head">
        <div style={{ minWidth: 0 }}>
          <div className="pt-item__title">{a.title}</div>
          <div className="pt-item__meta">
            {shortDate(a.sentAt)} · {a.scopeLabel}
          </div>
        </div>
        <Badge tone="neutral" size="sm">
          {a.code}
        </Badge>
      </div>
      {open && <div className="pt-item__body">{a.body}</div>}
      <button type="button" className="pt-toggle" onClick={() => setOpen((v) => !v)}>
        {open ? 'Ocultar' : 'Leer comunicado'}
      </button>
    </div>
  );
}

function ConductCard({ child }: { child: PortalStudent }) {
  const { data, isLoading } = usePortalConduct(child.enrollmentId);
  const incidents = data?.incidents ?? [];

  return (
    <Card flush title="Conducta" subtitle={child.fullName}>
      {isLoading && incidents.length === 0 ? (
        <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          Cargando…
        </div>
      ) : incidents.length === 0 ? (
        <EmptyState
          size="sm"
          icon={<Icons.Check />}
          title="Sin incidencias"
          description="No hay incidencias de conducta registradas."
        />
      ) : (
        <div style={{ padding: '4px 18px 14px' }}>
          {incidents.map((inc) => (
            <div className="pt-item" key={inc.code}>
              <div className="pt-item__head">
                <div style={{ minWidth: 0 }}>
                  <div className="pt-item__title">{inc.summary}</div>
                  <div className="pt-item__meta">
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{inc.code}</span> ·{' '}
                    {shortDate(inc.occurredAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Badge tone={SEVERITY_TONE[inc.severity]}>{SEVERITY_LABELS[inc.severity]}</Badge>
                  <Badge tone={STATUS_TONE[inc.status]} size="sm">
                    {STATUS_LABELS[inc.status]}
                  </Badge>
                </div>
              </div>
              {inc.citationAt && (
                <div className="pt-item__meta" style={{ marginTop: 6 }}>
                  <Icons.Calendar style={{ width: 13, height: 13, verticalAlign: '-2px' }} /> Citación:{' '}
                  {shortDate(inc.citationAt)} · {timeOnly(inc.citationAt)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
