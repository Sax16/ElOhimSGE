// Ficha del empleado: datos personales, laborales y horario de marcación.
import { Badge, Button, Dialog, Icons } from '@elohim/ui';
import {
  EMPLOYMENT_TYPE_LABELS,
  STAFF_ROLE_LABELS,
  STAFF_STATUS_TONE,
  STAFF_STATUS_LABELS,
  formatHireDate,
  formatSalary,
  scheduleText,
} from './bits';
import type { StaffDto } from './types';

export interface StaffDialogProps {
  staff: StaffDto | null;
  onClose: () => void;
  onEdit: (staff: StaffDto) => void;
  canEdit?: boolean;
}

export function StaffDialog({ staff, onClose, onEdit, canEdit = false }: StaffDialogProps) {
  const areaText = staff?.area ? ` · ${staff.area}` : '';

  const fields: [label: string, value: string, mono?: boolean][] = staff
    ? [
        ['DNI', staff.dni, true],
        ['Teléfono', staff.phone ?? '—', true],
        ['Correo', staff.email ?? '—', false],
        ['Régimen', EMPLOYMENT_TYPE_LABELS[staff.employmentType], false],
        ['Fecha de ingreso', formatHireDate(staff.hireDate), true],
        ['Sueldo base', formatSalary(staff.baseSalary), true],
        ['Régimen pensionario', staff.pensionScheme.name, false],
        ['Horario de marcación', scheduleText(staff.effectiveSchedule), false],
      ]
    : [];

  return (
    <Dialog
      open={!!staff}
      onClose={onClose}
      size="lg"
      icon={<Icons.User />}
      title={staff?.fullName ?? 'Empleado'}
      description={staff ? `${staff.code} · ${STAFF_ROLE_LABELS[staff.role]}${areaText}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          {canEdit && staff && (
            <Button variant="primary" iconLeft={<Icons.Pencil />} onClick={() => onEdit(staff)}>
              Editar ficha
            </Button>
          )}
        </>
      }
    >
      {staff && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge tone={STAFF_STATUS_TONE[staff.status]} dot>
              {STAFF_STATUS_LABELS[staff.status]}
            </Badge>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {fields.map(([k, v, mono]) => (
              <div key={k}>
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
        </div>
      )}
    </Dialog>
  );
}
