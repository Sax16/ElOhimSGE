// Desglose de la boleta de un empleado en el periodo: sueldo base, aportes
// retenidos (tal cual del back), descuentos del mes y neto. Botón "Imprimir
// boleta". Spec: StaffScreen.jsx (diálogo boleta) · alcance-funcional.md
// § "Planilla — decisiones de la etapa 3".
import { Alert, Button, Dialog, Icons } from '@elohim/ui';
import { useInstitution } from '../../settings/api';
import { pen, periodLabel } from './bits';
import { printPayslip } from './printPayslip';
import type { PayrollEntryDto } from './types';

export function BoletaDialog({
  entry,
  year,
  month,
  essaludRatePct,
  onClose,
}: {
  entry: PayrollEntryDto | null;
  year: number;
  month: number;
  essaludRatePct: string;
  onClose: () => void;
}) {
  const { data: institution } = useInstitution();
  const institutionName = institution?.name ?? 'I.E.P. Elohim';

  if (!entry) return null;

  const hasDiscounts = Number(entry.discountTotal) > 0;
  const label = periodLabel(year, month);

  const onPrint = () => {
    printPayslip(entry, {
      institution: { name: institutionName, address: institution?.address, ruc: institution?.ruc },
      periodLabel: label,
      essaludRatePct,
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      icon={<Icons.Receipt />}
      title={`Desglose de boleta · ${label}`}
      description={`${entry.staffName} · ${entry.position} · régimen ${entry.schemeName}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Printer />} onClick={onPrint}>
            Imprimir boleta
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
        <BoletaRow label="Sueldo base" value={pen(entry.grossAmount)} />
        {entry.contribItems.map((c, i) => (
          <BoletaRow key={`${c.concept}-${i}`} label={c.concept} value={`− ${pen(c.amount)}`} neg />
        ))}
        {hasDiscounts && (
          <BoletaRow label="Descuentos del mes" value={`− ${pen(entry.discountTotal)}`} neg />
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px',
            borderTop: '1px solid var(--border-subtle)',
            font: 'var(--type-label)',
            fontWeight: 700,
          }}
        >
          <span>Neto a pagar</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{pen(entry.netAmount)}</span>
        </div>
        <Alert tone="info">
          Aparte, el colegio aporta <b>EsSalud {essaludRatePct}%</b> ({pen(entry.essaludAmount)}) — no
          se descuenta al trabajador. Porcentajes en Configuración → Planilla (llega en la siguiente
          etapa).
        </Alert>
      </div>
    </Dialog>
  );
}

function BoletaRow({ label, value, neg = false }: { label: string; value: string; neg?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        font: 'var(--type-body)',
        padding: '6px 10px',
        background: 'var(--surface-sunken)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', color: neg ? 'var(--danger)' : 'var(--text-strong)' }}>
        {value}
      </span>
    </div>
  );
}
