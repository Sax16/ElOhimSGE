// Carnet estudiantil CR80 (spec del prototipo). Imprime solo el carnet.
import { Avatar, Badge, Button, Dialog, Icons } from '@elohim/ui';
import { SHIFT_LABELS } from '@elohim/shared';
import { avatarColor, fullName } from './bits';
import type { StudentDetail } from './types';
import './students.css';

export interface CardDialogProps {
  student: StudentDetail | null;
  onClose: () => void;
}

// Patrón de QR ficticio (marcador visual; el QR real llega con asistencia).
const QR_CELLS = [
  1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1,
];

export function CardDialog({ student, onClose }: CardDialogProps) {
  const name = student ? fullName(student) : '';
  const placement = student?.enrollment
    ? `${student.enrollment.gradeName} ${student.enrollment.sectionName} · ${student.enrollment.levelName}`
    : 'Sin matrícula';
  const shiftLabel = student?.shift ? SHIFT_LABELS[student.shift] : '—';

  return (
    <Dialog
      open={!!student}
      onClose={onClose}
      icon={<Icons.Clipboard />}
      title="Carnet del estudiante"
      description="Formato CR80 · 85.6 × 54 mm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Printer />} onClick={() => window.print()}>
            Imprimir carnet
          </Button>
        </>
      }
    >
      {student && (
        <div id="esge-carnet-print" style={{ display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
          <div className="esge-carnet">
            <div
              style={{
                background: 'linear-gradient(135deg, var(--blue-700), var(--blue-900))',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <img
                src="/elohim-insignia.png"
                alt=""
                style={{ width: 30, height: 30, objectFit: 'contain' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ font: 'var(--type-2xs)', fontWeight: 700, color: '#fff', letterSpacing: '.04em' }}>
                  I.E.P. ELOHIM · SATIPO
                </div>
                <div style={{ font: 'var(--type-2xs)', color: 'var(--blue-200)' }}>Carnet estudiantil · 2026</div>
              </div>
              <Badge tone="accent" solid size="sm">
                2026
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: 14 }}>
              <div
                style={{
                  width: 74,
                  height: 92,
                  borderRadius: 8,
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}
              >
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Avatar name={name} size="lg" color={avatarColor(student.code)} />
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <div style={{ font: 'var(--type-label)', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1.2 }}>
                  {name}
                </div>
                <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
                  {placement} · Turno {shiftLabel}
                </div>
                <div style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-body)' }}>
                  {student.code} · DNI {student.dni}
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ font: 'var(--type-2xs)', color: 'var(--text-subtle)' }}>
                    Vigencia:
                    <br />
                    Mar–Dic 2026
                  </span>
                  <div
                    title="QR para asistencia (futuro)"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 4,
                      background: 'var(--surface-card)',
                      border: '1px solid var(--border-default)',
                      padding: 4,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: 1,
                    }}
                  >
                    {QR_CELLS.map((b, i) => (
                      <span key={i} style={{ background: b ? 'var(--blue-900)' : 'transparent', borderRadius: 0.5 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                borderTop: '3px solid var(--gold-400)',
                padding: '6px 14px',
                font: 'var(--type-2xs)',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>QR para asistencia (futuro)</span>
              <span>(064) 545-210</span>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
