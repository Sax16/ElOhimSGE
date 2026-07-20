// Portal del apoderado — Pagos (/ppagos). Cronograma de cuotas del hijo, una
// tarjeta por cuota (mobile-first), con estado, mora incluida en vencidas y el
// nº de recibo en las pagadas. Solo lectura.
import { useMemo } from 'react';
import { Badge, Card, EmptyState, Icons } from '@elohim/ui';
import { formatPEN, toCents } from '@elohim/shared';
import { PortalShell } from './PortalShell';
import { usePortalInstallments } from './api';
import {
  INSTALLMENT_STATUS_LABELS,
  INSTALLMENT_STATUS_TONE,
  isPositive,
  money,
  shortDate,
} from './bits';
import type { PortalInstallment, PortalStudent } from './types';

export function PortalPaymentsPage() {
  return <PortalShell>{(child) => <PaymentsBody child={child} />}</PortalShell>;
}

function PaymentsBody({ child }: { child: PortalStudent }) {
  const { data, isLoading } = usePortalInstallments(child.enrollmentId);
  const installments = useMemo(() => data?.installments ?? [], [data]);

  // Deuda vencida = suma de totales de cuotas VENCIDO (en centavos, sin float).
  const overdueTotalCents = useMemo(
    () =>
      installments
        .filter((i) => i.status === 'VENCIDO')
        .reduce((sum, i) => sum + toCents(i.total), 0),
    [installments],
  );

  return (
    <>
      {/* Resumen */}
      <Card>
        {overdueTotalCents > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Badge tone="danger" dot>
              Deuda vencida
            </Badge>
            <span className="pt-money" style={{ color: 'var(--danger)', font: 'var(--type-h3)' }}>
              {formatPEN(overdueTotalCents)}
            </span>
          </div>
        ) : (
          <Badge tone="success" dot>
            Al día
          </Badge>
        )}
      </Card>

      <Card flush title="Cronograma de pagos" subtitle={`${child.fullName} · ${child.sectionLabel}`}>
        {isLoading && installments.length === 0 ? (
          <div style={{ padding: 18, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
            Cargando cuotas…
          </div>
        ) : installments.length === 0 ? (
          <EmptyState
            size="sm"
            icon={<Icons.Receipt />}
            title="Sin cuotas"
            description="Aún no hay un cronograma de pagos para este estudiante."
          />
        ) : (
          <div style={{ padding: '4px 18px 14px' }}>
            {installments.map((it) => (
              <InstallmentRow key={it.id} it={it} />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function InstallmentRow({ it }: { it: PortalInstallment }) {
  const isPaid = it.status === 'PAGADO';
  const isCanceled = it.status === 'ANULADO';
  const hasLate = it.status === 'VENCIDO' && isPositive(it.lateFee);

  return (
    <div className="pt-inst">
      <div className="pt-inst__main">
        <span
          className="pt-inst__label"
          style={isCanceled ? { textDecoration: 'line-through', color: 'var(--text-muted)' } : undefined}
        >
          {it.label}
        </span>
        <span className="pt-inst__meta">Vence {shortDate(it.dueDate)}</span>
        {isPaid && it.paidAt && (
          <span className="pt-inst__meta">Pagado el {shortDate(it.paidAt)}</span>
        )}
        {isPaid && it.receiptCode && (
          <span className="pt-inst__meta pt-inst__meta--mono">Recibo {it.receiptCode}</span>
        )}
      </div>
      <div className="pt-inst__right">
        <span className="pt-money">{money(it.total)}</span>
        <Badge tone={INSTALLMENT_STATUS_TONE[it.status]} dot={it.status === 'VENCIDO'}>
          {INSTALLMENT_STATUS_LABELS[it.status]}
        </Badge>
        {hasLate && <span className="pt-inst__late">incluye mora {money(it.lateFee)}</span>}
      </div>
    </div>
  );
}
