// Ficha del apoderado: datos, estado de cuenta consolidado e hijos vinculados (N:M).
import { useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  IconButton,
  Icons,
  Table,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { GUARDIAN_RELATION_LABELS, NOTIFICATION_CHANNEL_LABELS, formatPEN } from '@elohim/shared';
import { avatarColor, fullName } from '../students/bits';
import { StudentDialog } from '../students/StudentDialog';
import { useCan } from '../../lib/useCan';
import { useGuardian } from './api';
import { GuardianAccessSection } from './GuardianAccess';
import type { GuardianChild, GuardianDetail } from './types';

export interface GuardianDialogProps {
  guardianId: string | null;
  onClose: () => void;
  onEdit: (guardian: GuardianDetail) => void;
  readOnly?: boolean;
}

function placementText(child: GuardianChild): string {
  const p = child.placement;
  if (!p) return 'Sin matrícula';
  return `${p.gradeName} ${p.sectionName} · ${p.levelName}`;
}

export function GuardianDialog({ guardianId, onClose, onEdit, readOnly = false }: GuardianDialogProps) {
  const { toast } = useToast();
  const canEdit = useCan('apoderados', 'editar');
  const { data: g, isLoading } = useGuardian(guardianId ?? undefined);
  const [childId, setChildId] = useState<{ id: string; debtCents: number } | null>(null);

  const columns: TableColumn<GuardianChild>[] = [
    {
      key: 'student',
      header: 'Estudiante',
      render: (_v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={fullName(r.student)} size="sm" color={avatarColor(r.student.code)} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{fullName(r.student)}</span>
            <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>{placementText(r)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'relation',
      header: 'Relación',
      align: 'center',
      render: (_v, r) => (
        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <Badge tone="neutral">{GUARDIAN_RELATION_LABELS[r.relation]}</Badge>
          {r.isPrimary && (
            <Badge tone="brand" dot>
              Contacto principal
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'debt',
      header: 'Deuda',
      num: true,
      mono: true,
      render: (_v, r) => (
        <span style={{ color: r.debtCents > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
          {r.debtCents > 0 ? formatPEN(r.debtCents) : 'Al día'}
        </span>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) => (
        <Tooltip content="Ver ficha del estudiante">
          <IconButton
            label="Ver ficha del estudiante"
            size="sm"
            onClick={() => setChildId({ id: r.student.id, debtCents: r.debtCents })}
          >
            <Icons.Eye />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const childrenList = g?.children ?? [];
  // La ficha no repite estos agregados: se derivan de los hijos (con fallback si vinieran).
  const childrenCount = g?.childrenCount ?? childrenList.length;
  const familyDebtCents = g?.debtCents ?? childrenList.reduce((sum, c) => sum + c.debtCents, 0);

  return (
    <>
      <Dialog
        open={!!guardianId}
        onClose={onClose}
        size="lg"
        icon={<Icons.Home />}
        title={g?.fullName ?? 'Apoderado'}
        description={g ? `${g.code} · ${g.phone}` : ''}
        footer={
          <>
            <Button
              variant="secondary"
              iconLeft={<Icons.Send />}
              onClick={() =>
                toast(
                  'info',
                  'Módulo de cobranza (R2)',
                  'Los recordatorios de pago llegan con el módulo de cobranza.',
                )
              }
            >
              Enviar recordatorio de pago
            </Button>
            <span style={{ flex: 1 }} />
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
            {!readOnly && g && (
              <Button variant="primary" iconLeft={<Icons.Pencil />} onClick={() => onEdit(g)}>
                Editar
              </Button>
            )}
          </>
        }
      >
        {isLoading || !g ? (
          <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando ficha…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
            {familyDebtCents > 0 ? (
              <Alert tone="warning" title={`Deuda familiar: ${formatPEN(familyDebtCents)}`}>
                Consolidada entre sus {childrenCount > 1 ? `${childrenCount} hijos` : 'hijo'}.
              </Alert>
            ) : (
              <Alert tone="success" title="Familia al día">
                Sin cuotas pendientes ni vencidas.
              </Alert>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['DNI', g.dni, true],
                ['Correo', g.email ?? '—', false],
                ['Dirección', g.address, false],
                ['Notificaciones', NOTIFICATION_CHANNEL_LABELS[g.notificationChannel], false],
              ].map(([k, v, mono]) => (
                <div key={k as string}>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>
                    {k}
                  </div>
                  <div
                    style={{
                      font: 'var(--type-body)',
                      color: 'var(--text-body)',
                      fontFamily: mono ? 'var(--font-mono)' : undefined,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <GuardianAccessSection guardianId={g.id} readOnly={readOnly || !canEdit} />
            <Card flush title={`Hijos en la institución (${childrenCount})`}>
              {childrenList.length > 0 ? (
                <Table columns={columns} data={childrenList} rowKey={(r) => r.student.id} compact />
              ) : (
                <EmptyState
                  size="sm"
                  icon={<Icons.Users />}
                  title="Sin hijos vinculados"
                  description="Vincula estudiantes desde la ficha del estudiante o al matricular."
                />
              )}
            </Card>
          </div>
        )}
      </Dialog>

      <StudentDialog
        studentId={childId?.id ?? null}
        fallbackDebtCents={childId?.debtCents ?? 0}
        readOnly={readOnly}
        onClose={() => setChildId(null)}
      />
    </>
  );
}
