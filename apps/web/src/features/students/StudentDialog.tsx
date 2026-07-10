// Ficha del estudiante (spec del prototipo): datos, foto, apoderados, salud, matrícula.
// Orquesta los diálogos de edición, retiro, carnet y vínculo de apoderados.
import { useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Dialog,
  EmptyState,
  IconButton,
  Icons,
  Tooltip,
  useToast,
} from '@elohim/ui';
import {
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_TYPE_LABELS,
  GUARDIAN_RELATION_LABELS,
  INSURANCE_TYPE_LABELS,
  SHIFT_LABELS,
  STUDENT_STATUS_LABELS,
  formatPEN,
} from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useLinkGuardian, useStudent, useUnlinkGuardian, useUploadStudentPhoto } from './api';
import { STUDENT_STATUS_TONE, avatarColor, fullName } from './bits';
import { CardDialog } from './CardDialog';
import { LinkGuardianDialog } from './LinkGuardianDialog';
import { StudentFormDialog } from './StudentFormDialog';
import { WithdrawDialog } from './WithdrawDialog';
import type { StudentGuardianLink } from './types';

export interface StudentDialogProps {
  studentId: string | null;
  onClose: () => void;
  /** Deuda de la fila del listado, por si la ficha no la trae. */
  fallbackDebtCents?: number;
  readOnly?: boolean;
}

type Sub = 'edit' | 'withdraw' | 'card' | 'link' | null;

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function StudentDialog({ studentId, onClose, fallbackDebtCents = 0, readOnly = false }: StudentDialogProps) {
  const { toast } = useToast();
  const { data: student, isLoading } = useStudent(studentId ?? undefined);
  const uploadPhoto = useUploadStudentPhoto();
  const unlink = useUnlinkGuardian();
  const link = useLinkGuardian();
  const fileRef = useRef<HTMLInputElement>(null);

  const MAX_GUARDIANS = 3;

  const [sub, setSub] = useState<Sub>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<StudentGuardianLink | null>(null);

  const debtCents = student?.debtCents ?? fallbackDebtCents;
  const withdrawn = student?.status === 'RETIRADO' || student?.status === 'TRASLADADO';
  const fichaOpen = !!studentId && sub === null && !unlinkTarget;

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !student) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast('danger', 'Formato no admitido', 'La foto debe ser JPG o PNG.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast('danger', 'Archivo muy grande', 'La foto no debe superar los 2 MB.');
      return;
    }
    uploadPhoto.mutate(
      { id: student.id, file },
      {
        onSuccess: () => toast('success', 'Foto actualizada', 'La foto se usará en la ficha y el carnet.'),
        onError: (err) =>
          toast('danger', 'No se pudo subir la foto', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const makePrimary = (g: StudentGuardianLink) => {
    if (!student || g.isPrimary) return;
    link.mutate(
      { studentId: student.id, guardianId: g.guardian.id, relation: g.relation, isPrimary: true },
      {
        onSuccess: () =>
          toast('success', 'Contacto principal actualizado', `${g.guardian.fullName} recibirá los avisos y el estado de cuenta.`),
        onError: (err) =>
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const confirmUnlink = () => {
    if (!student || !unlinkTarget) return;
    const target = unlinkTarget;
    unlink.mutate(
      { studentId: student.id, guardianId: target.guardian.id },
      {
        onSuccess: () => {
          toast('success', 'Apoderado desvinculado', `${target.guardian.fullName} ya no figura como apoderado.`);
          setUnlinkTarget(null);
        },
        onError: (err) =>
          toast('danger', 'No se pudo desvincular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const name = student ? fullName(student) : '';
  const placement = student?.enrollment
    ? `${student.enrollment.gradeName} ${student.enrollment.sectionName} · ${student.enrollment.levelName}`
    : 'Sin matrícula';

  return (
    <>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={onPickPhoto} />

      <Dialog
        open={fichaOpen}
        onClose={onClose}
        size="lg"
        icon={<Icons.User />}
        title={name || 'Estudiante'}
        description={student ? `${student.code} · ${placement}` : ''}
        footer={
          <>
            {!readOnly && (
              <Tooltip content={withdrawn ? 'El estudiante ya fue retirado o trasladado' : 'Retirar o trasladar'}>
                <span>
                  <Button
                    variant="danger"
                    iconLeft={<Icons.Logout />}
                    disabled={withdrawn || !student}
                    onClick={() => setSub('withdraw')}
                  >
                    Retirar / Trasladar
                  </Button>
                </span>
              </Tooltip>
            )}
            <span style={{ flex: 1 }} />
            <Button variant="accent" iconLeft={<Icons.Clipboard />} disabled={!student} onClick={() => setSub('card')}>
              Ver carnet
            </Button>
            {!readOnly && (
              <Button variant="primary" iconLeft={<Icons.Pencil />} disabled={!student} onClick={() => setSub('edit')}>
                Editar ficha
              </Button>
            )}
          </>
        }
      >
        {isLoading || !student ? (
          <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando ficha…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 6 }}>
            {/* Foto + datos */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div
                  style={{
                    width: 92,
                    height: 110,
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--border-strong)',
                    background: 'var(--surface-sunken)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    overflow: 'hidden',
                  }}
                >
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <Avatar name={name} size="lg" color={avatarColor(student.code)} />
                      <span style={{ font: 'var(--type-2xs)', color: 'var(--text-subtle)' }}>Foto 3×4</span>
                    </>
                  )}
                </div>
                {!readOnly && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={uploadPhoto.isPending}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploadPhoto.isPending ? 'Subiendo…' : 'Subir foto'}
                  </Button>
                )}
                <span style={{ font: 'var(--type-2xs)', color: 'var(--text-subtle)', textAlign: 'center', maxWidth: 110 }}>
                  JPG/PNG, se recorta a 3×4 — se usa en ficha y carnet
                </span>
              </div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {(
                  [
                    ['DNI', student.dni, true],
                    ['Fecha de nacimiento', student.birthDate.slice(0, 10), true],
                    ['Estado', STUDENT_STATUS_LABELS[student.status], false],
                    ['Turno', student.shift ? SHIFT_LABELS[student.shift] : '—', false],
                    ['Dirección', student.address, false],
                    ['Colegio de procedencia', student.previousSchool ?? '—', false],
                    ['Apoderado principal', student.guardians.find((g) => g.isPrimary)?.guardian.fullName ?? '—', false],
                    ['Deuda actual', formatPEN(debtCents), true],
                  ] as [string, string, boolean][]
                ).map(([k, v, mono]) => (
                  <div key={k}>
                    <div className="eyebrow" style={{ marginBottom: 2 }}>
                      {k}
                    </div>
                    {k === 'Estado' ? (
                      <Badge tone={STUDENT_STATUS_TONE[student.status]} dot>
                        {v}
                      </Badge>
                    ) : (
                      <div
                        style={{
                          font: 'var(--type-body-md)',
                          color: k === 'Deuda actual' && debtCents > 0 ? 'var(--danger)' : 'var(--text-body)',
                          fontFamily: mono ? 'var(--font-mono)' : undefined,
                        }}
                      >
                        {v}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Apoderados */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
                  Apoderados ({student.guardians.length}/{MAX_GUARDIANS})
                </span>
                {!readOnly &&
                  (student.guardians.length >= MAX_GUARDIANS ? (
                    <Tooltip content={`Máximo ${MAX_GUARDIANS} apoderados. Quita uno para agregar otro.`}>
                      <span>
                        <Button size="sm" variant="secondary" iconLeft={<Icons.Plus />} disabled>
                          Vincular apoderado
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button size="sm" variant="secondary" iconLeft={<Icons.Plus />} onClick={() => setSub('link')}>
                      Vincular apoderado
                    </Button>
                  ))}
              </div>
              {student.guardians.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={<Icons.Users />}
                  title="Sin apoderados vinculados"
                  description="Vincula al menos un apoderado para las notificaciones y la cobranza."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {student.guardians.map((g) => (
                    <div
                      key={g.guardian.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        background: 'var(--surface-sunken)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <Avatar name={g.guardian.fullName} size="sm" color={avatarColor(g.guardian.code)} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>
                          {g.guardian.fullName}
                        </div>
                        <div style={{ font: 'var(--type-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {g.guardian.code} · {g.guardian.phone}
                        </div>
                      </div>
                      <Badge tone="neutral">{GUARDIAN_RELATION_LABELS[g.relation]}</Badge>
                      {g.isPrimary ? (
                        <Badge tone="brand" dot>
                          Contacto principal
                        </Badge>
                      ) : (
                        !readOnly && (
                          <Tooltip content="Este apoderado recibirá los avisos y el estado de cuenta">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={link.isPending}
                              onClick={() => makePrimary(g)}
                            >
                              Hacer principal
                            </Button>
                          </Tooltip>
                        )
                      )}
                      {!readOnly && (
                        <Tooltip content="Quitar apoderado">
                          <IconButton
                            label="Quitar apoderado"
                            size="sm"
                            variant="danger"
                            onClick={() => setUnlinkTarget(g)}
                          >
                            <Icons.Trash />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Salud y emergencia */}
            <div>
              <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8 }}>
                Salud y emergencia
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(
                  [
                    ['Alergias', student.allergies?.trim() || 'Ninguna'],
                    ['Seguro', INSURANCE_TYPE_LABELS[student.insuranceType]],
                    [
                      'Contacto de emergencia',
                      student.emergencyContactName
                        ? `${student.emergencyContactName}${student.emergencyContactPhone ? ` · ${student.emergencyContactPhone}` : ''}`
                        : '—',
                    ],
                    [
                      'Autorizados a recoger',
                      student.authorizedPickups.length
                        ? student.authorizedPickups
                            .map((p) => (p.relation ? `${p.name} (${p.relation})` : p.name))
                            .join(' · ')
                        : '—',
                    ],
                  ] as [string, string][]
                ).map(([k, v]) => {
                  const isAllergy = k === 'Alergias' && !!student.allergies?.trim();
                  return (
                    <div
                      key={k}
                      style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}
                    >
                      <div className="eyebrow" style={{ marginBottom: 2 }}>
                        {k}
                      </div>
                      <div
                        style={{
                          font: 'var(--type-body)',
                          color: isAllergy ? 'var(--danger)' : 'var(--text-body)',
                          fontWeight: isAllergy ? 600 : 400,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matrícula activa */}
            <div>
              <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)', marginBottom: 8 }}>
                Matrícula activa
              </div>
              {student.enrollment ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    background: 'var(--surface-sunken)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px',
                  }}
                >
                  <span style={{ font: 'var(--type-mono)', color: 'var(--text-strong)' }}>{student.enrollment.code}</span>
                  <Badge tone="neutral">{ENROLLMENT_TYPE_LABELS[student.enrollment.type]}</Badge>
                  <Badge tone={student.enrollment.status === 'COMPLETA' ? 'success' : 'warning'} dot>
                    {ENROLLMENT_STATUS_LABELS[student.enrollment.status]}
                  </Badge>
                  <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                    {student.enrollment.levelName} · {student.enrollment.gradeName} {student.enrollment.sectionName}
                    {student.enrollment.year || student.enrollment.yearName
                      ? ` · ${student.enrollment.year ?? student.enrollment.yearName}`
                      : ''}
                  </span>
                </div>
              ) : (
                <EmptyState
                  size="sm"
                  icon={<Icons.Clipboard />}
                  title="Sin matrícula activa"
                  description="Matricula al estudiante desde el asistente de matrícula."
                />
              )}
              {(() => {
                const activePrograms = (student.programs ?? []).filter((p) => !p.canceledAt);
                if (activePrograms.length === 0) return null;
                return (
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      flexWrap: 'wrap',
                      font: 'var(--type-caption)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>Programas:</span>
                    {activePrograms.map((p, i) => (
                      <span key={p.programEnrollmentId}>
                        {p.name} ({p.scheduleText})
                        {i < activePrograms.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Dialog>

      {/* Sub-diálogos */}
      <StudentFormDialog
        open={sub === 'edit'}
        student={student ?? null}
        readOnly={readOnly}
        onClose={() => setSub(null)}
      />
      <WithdrawDialog
        student={sub === 'withdraw' ? (student ?? null) : null}
        debtCents={debtCents}
        onClose={() => setSub(null)}
      />
      <CardDialog student={sub === 'card' ? (student ?? null) : null} onClose={() => setSub(null)} />
      <LinkGuardianDialog
        studentId={sub === 'link' ? (studentId ?? null) : null}
        readOnly={readOnly}
        onClose={() => setSub(null)}
      />

      {/* Confirmar desvínculo */}
      <Dialog
        open={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        icon={<Icons.Trash />}
        iconTone="danger"
        title="Quitar apoderado"
        description={unlinkTarget ? unlinkTarget.guardian.fullName : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setUnlinkTarget(null)} disabled={unlink.isPending}>
              Cancelar
            </Button>
            <Button variant="danger" iconLeft={<Icons.Check />} disabled={unlink.isPending} onClick={confirmUnlink}>
              Quitar apoderado
            </Button>
          </>
        }
      >
        <div style={{ paddingTop: 4 }}>
          {unlinkTarget?.isPrimary && student && student.guardians.length > 1 ? (
            <Alert tone="warning" title="Es el contacto principal">
              Al quitarlo, otro apoderado vinculado pasará a ser el contacto principal automáticamente.
            </Alert>
          ) : (
            <p style={{ font: 'var(--type-body)', color: 'var(--text-body)', margin: 0 }}>
              Se quitará el vínculo con este apoderado. El apoderado no se elimina y puede volver a vincularse.
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
}
