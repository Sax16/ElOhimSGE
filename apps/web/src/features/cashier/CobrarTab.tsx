// Pestaña «Cobrar»: buscar estudiante → seleccionar cuotas/conceptos → método → recibo.
// Todo cobro exige la caja del día abierta (decisión R2 que manda sobre el prototipo).
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  IconButton,
  Icons,
  Input,
  Radio,
  RadioGroup,
  Select,
  useToast,
} from '@elohim/ui';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, formatPEN, toCents } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDate, fmtDayMonth } from '../structure/bits';
import { useCashierDay, useCashierSaleConcepts, useCollectibles, useCreateReceipt, useStudentSearch } from './api';
import { todayLocalISO } from './bits';
import { OpenSessionDialog } from './SessionDialogs';
import { ReceiptDialog } from './ReceiptDialog';
import type { CashSession, PaymentMethod, Receipt, StudentHit } from './types';

/** Normaliza la entrada de dinero: solo dígitos y punto decimal. */
function sanitizeMoney(v: string): string {
  return v.replace(/[^0-9.]/g, '');
}
function inputCents(v: string): number {
  const trimmed = v.trim();
  if (!trimmed || trimmed === '.') return 0;
  try {
    return toCents(trimmed);
  } catch {
    return 0;
  }
}

export function CobrarTab({ canEdit }: { canEdit: boolean }) {
  const { data: day, isLoading } = useCashierDay();
  const [openSession, setOpenSession] = useState(false);
  const session = day?.session ?? null;

  if (isLoading) {
    return <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando caja…</div>;
  }

  const isToday = session != null && session.date === todayLocalISO();
  const isOpen = session != null && session.status === 'ABIERTA' && isToday;

  if (!isOpen) {
    return (
      <>
        <CajaCerradaAviso session={session} canEdit={canEdit} onOpen={() => setOpenSession(true)} />
        <OpenSessionDialog open={openSession} onClose={() => setOpenSession(false)} />
      </>
    );
  }

  return <CobrarForm canEdit={canEdit} />;
}

/** Aviso cuando no se puede cobrar: no hay caja hoy, ya cerró, o quedó una caja
 *  de un día anterior sin cerrar (los cobros solo caen en la caja del día actual). */
function CajaCerradaAviso({
  session,
  canEdit,
  onOpen,
}: {
  session: CashSession | null;
  canEdit: boolean;
  onOpen: () => void;
}) {
  const pendingPrevious = session != null && session.status === 'ABIERTA' && session.date !== todayLocalISO();
  if (pendingPrevious) {
    return (
      <Alert tone="warning" title={`La caja del ${fmtDate(session.date)} sigue abierta`}>
        Realiza su arqueo y ciérrala en la pestaña <b>Caja del día</b> antes de abrir la de hoy. Los cobros solo
        caen en la caja del día actual, así el arqueo pendiente no se contamina.
      </Alert>
    );
  }
  const alreadyClosed = session?.status === 'CERRADA';
  return (
    <Alert tone="warning" title="La caja del día no está abierta">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span>
          Todo cobro exige una caja abierta: así el dinero del día queda cuadrado en el arqueo de cierre.{' '}
          {alreadyClosed
            ? 'La caja de hoy ya fue cerrada. La caja es una sola por día y no se reabre; vuelve a abrir mañana.'
            : 'Ábrela con el monto inicial en efectivo para empezar a cobrar.'}
        </span>
        {!alreadyClosed && canEdit && (
          <div>
            <Button variant="primary" iconLeft={<Icons.Cash />} onClick={onOpen}>
              Abrir caja
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
}

// ---- Formulario de cobro ---------------------------------------------------
function CobrarForm({ canEdit }: { canEdit: boolean }) {
  const { toast } = useToast();
  const createReceipt = useCreateReceipt();
  const [searchParams, setSearchParams] = useSearchParams();

  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [student, setStudent] = useState<StudentHit | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO');
  const [received, setReceived] = useState('');
  const [operationNumber, setOperationNumber] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  // Debounce ~300ms de la búsqueda.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  // Enlace profundo desde Pensiones: /caja?student=<id>&installment=<id>.
  // Precarga el estudiante (por id) con la cuota seleccionada y limpia los params.
  useEffect(() => {
    const sid = searchParams.get('student');
    if (!sid) return;
    const iid = searchParams.get('installment');
    setStudent({
      id: sid,
      code: '',
      fullName: '',
      gradeSection: '',
      primaryGuardianName: '',
      primaryGuardianPhone: '',
      debtAmount: '0.00',
    });
    setExtras([]);
    setMethod('EFECTIVO');
    setReceived('');
    setOperationNumber('');
    setSelectedIds(iid ? [iid] : []);
    const next = new URLSearchParams(searchParams);
    next.delete('student');
    next.delete('installment');
    setSearchParams(next, { replace: true });
    // Solo al montar: los params se consumen una vez.
  }, []);

  const { data: hits = [], isFetching } = useStudentSearch(student ? '' : debounced);
  const { data: collectibles } = useCollectibles(student?.id ?? null);
  const { data: catalog = [] } = useCashierSaleConcepts();

  const installments = collectibles?.installments ?? [];

  // Hidrata el estudiante sintético del enlace profundo con los datos reales.
  useEffect(() => {
    if (!student || student.fullName !== '' || !collectibles) return;
    const s = collectibles.student;
    setStudent({
      id: s.id,
      code: s.code,
      fullName: s.fullName,
      gradeSection: s.gradeSection,
      primaryGuardianName: s.primaryGuardianName ?? '',
      primaryGuardianPhone: s.primaryGuardianPhone ?? '',
      debtAmount: s.debtAmount ?? '0.00',
    });
  }, [collectibles, student]);

  const resetForm = () => {
    setSelectedIds([]);
    setExtras([]);
    setMethod('EFECTIVO');
    setReceived('');
    setOperationNumber('');
  };

  const pickStudent = (hit: StudentHit) => {
    setStudent(hit);
    resetForm();
  };
  const clearStudent = () => {
    setStudent(null);
    resetForm();
  };

  const items = useMemo(() => {
    const cuotaItems = installments
      .filter((q) => selectedIds.includes(q.id))
      .map((q) => ({ key: `cuota-${q.id}`, concept: q.concept, cents: toCents(q.totalWithFee ?? q.amount) }));
    const extraItems = extras
      .map((id) => catalog.find((c) => c.id === id))
      .filter((c): c is NonNullable<typeof c> => !!c)
      .map((c) => ({ key: `venta-${c.id}`, concept: c.name, cents: toCents(c.price) }));
    return [...cuotaItems, ...extraItems];
  }, [installments, selectedIds, extras, catalog]);

  const totalCents = items.reduce((a, it) => a + it.cents, 0);
  const receivedCents = inputCents(received);
  const changeCents = Math.max(0, receivedCents - totalCents);

  const catalogOptions = [
    { value: '', label: 'Agregar concepto…' },
    ...catalog
      .filter((c) => !extras.includes(c.id))
      .map((c) => ({ value: c.id, label: `${c.name} — ${formatPEN(toCents(c.price))}` })),
  ];

  const isCash = method === 'EFECTIVO';
  const needsOperation = method === 'YAPE_PLIN' || method === 'TRANSFERENCIA';
  const disabled =
    !canEdit || totalCents === 0 || (isCash && receivedCents < totalCents) || createReceipt.isPending;

  const submit = () => {
    if (!student || disabled) return;
    createReceipt.mutate(
      {
        studentId: student.id,
        installmentIds: selectedIds,
        saleItems: extras.map((id) => ({ saleConceptId: id, quantity: 1 })),
        method,
        operationNumber: needsOperation && operationNumber.trim() ? operationNumber.trim() : undefined,
        receivedAmount: isCash ? received.trim() || '0.00' : undefined,
      },
      {
        onSuccess: (r) => {
          setReceipt(r);
          toast(
            'success',
            'Pago registrado',
            `${r.code} · ${formatPEN(toCents(r.totalAmount))} · ${PAYMENT_METHOD_LABELS[r.method]}.`,
          );
          clearStudent();
        },
        onError: (err) =>
          toast('danger', 'No se pudo cobrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  const debtCents = student ? toCents(student.debtAmount) : 0;

  return (
    <div className="esge-cobrar-grid">
      {/* Izquierda: estudiante + cuotas + conceptos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ position: 'relative' }}>
          <Input
            placeholder="Buscar estudiante por nombre, código o DNI…"
            iconLeft={<Icons.Search />}
            value={student ? student.fullName : term}
            disabled={!!student}
            onChange={(e) => {
              setTerm(e.target.value);
              if (student) setStudent(null);
            }}
          />
          {!student && debounced.trim().length >= 2 && (
            <div
              style={{
                marginTop: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxHeight: 280,
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 6,
                background: 'var(--surface-card)',
              }}
            >
              {isFetching ? (
                <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>Buscando…</div>
              ) : hits.length === 0 ? (
                <div style={{ padding: 12, color: 'var(--text-muted)', font: 'var(--type-caption)' }}>
                  Sin resultados.
                </div>
              ) : (
                hits.map((h) => {
                  const hitDebt = toCents(h.debtAmount);
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => pickStudent(h)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                      }}
                    >
                      <Avatar name={h.fullName} size="sm" color="var(--blue-500)" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{h.fullName}</div>
                        <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{h.code}</span> · {h.gradeSection}
                        </div>
                      </div>
                      {hitDebt > 0 ? (
                        <Badge tone="danger" dot>
                          {formatPEN(hitDebt)}
                        </Badge>
                      ) : (
                        <Badge tone="success" dot>
                          Sin deuda
                        </Badge>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {student && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-card)',
            }}
          >
            <Avatar name={student.fullName} color="var(--blue-500)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: 'var(--type-label)', fontWeight: 600, color: 'var(--text-strong)' }}>
                {student.fullName}
              </div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{student.code}</span> · {student.gradeSection} ·
                Apoderado: {student.primaryGuardianName}
              </div>
            </div>
            {debtCents > 0 ? (
              <Badge tone="danger" dot>
                Deuda {formatPEN(debtCents)}
              </Badge>
            ) : (
              <Badge tone="success" dot>
                Sin deuda
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearStudent}>
              Cambiar
            </Button>
          </div>
        )}

        {student && (
          <>
            <Card flush title="Cuotas pendientes" subtitle="Selecciona las que se cobrarán">
              {installments.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={<Icons.Check />}
                  title="Sin cuotas pendientes"
                  description="Este estudiante no tiene cuotas por cobrar."
                />
              ) : (
                <div>
                  {installments.map((q) => {
                    const on = selectedIds.includes(q.id);
                    const lateCents = q.lateFee ? toCents(q.lateFee) : 0;
                    return (
                      <label
                        key={q.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '11px 16px',
                          borderTop: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          background: on ? 'var(--surface-brand-soft)' : 'transparent',
                        }}
                      >
                        <Checkbox
                          checked={on}
                          onChange={() =>
                            setSelectedIds((s) => (on ? s.filter((x) => x !== q.id) : [...s, q.id]))
                          }
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{q.concept}</div>
                          <div style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
                            Vence {fmtDayMonth(q.dueDate)}
                            {lateCents > 0 && (
                              <span style={{ color: 'var(--danger)' }}> · mora {formatPEN(lateCents)}</span>
                            )}
                          </div>
                        </div>
                        <Badge tone={q.status === 'VENCIDO' ? 'danger' : 'warning'} dot>
                          {q.status === 'VENCIDO' ? 'Vencido' : 'Pendiente'}
                        </Badge>
                        <span
                          style={{
                            font: 'var(--type-label)',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-strong)',
                            minWidth: 82,
                            textAlign: 'right',
                          }}
                        >
                          {formatPEN(toCents(q.totalWithFee ?? q.amount))}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Otros conceptos" subtitle="Libros, uniformes y otros cobros de ventanilla">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Select
                  options={catalogOptions}
                  value=""
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v && !extras.includes(v)) setExtras((x) => [...x, v]);
                  }}
                />
                {extras.map((id) => {
                  const c = catalog.find((x) => x.id === id);
                  if (!c) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        background: 'var(--surface-sunken)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{ flex: 1, font: 'var(--type-label)', color: 'var(--text-body)' }}>{c.name}</span>
                      <span style={{ font: 'var(--type-label)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
                        {formatPEN(toCents(c.price))}
                      </span>
                      <IconButton
                        label="Quitar"
                        size="sm"
                        variant="danger"
                        onClick={() => setExtras((x) => x.filter((y) => y !== id))}
                      >
                        <Icons.Trash />
                      </IconButton>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Derecha: resumen sticky */}
      <div className="esge-cobrar-summary">
        <Card title="Resumen del cobro">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.length === 0 && (
              <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                Sin conceptos seleccionados.
              </span>
            )}
            {items.map((it) => (
              <div key={it.key} style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-body)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{it.concept}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>{formatPEN(it.cents)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ font: 'var(--type-label)', fontWeight: 600 }}>Total</span>
              <span style={{ font: 'var(--type-h2)', fontFamily: 'var(--font-mono)', color: 'var(--text-strong)' }}>
                {formatPEN(totalCents)}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Método de pago">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <RadioGroup name="metodo" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {PAYMENT_METHODS.map((m) => (
                <Radio key={m} value={m} label={PAYMENT_METHOD_LABELS[m]} />
              ))}
            </RadioGroup>
            {isCash && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input
                  label="Recibido"
                  prefix="S/."
                  value={received}
                  onChange={(e) => setReceived(sanitizeMoney(e.target.value))}
                  inputMode="decimal"
                  placeholder="0.00"
                />
                <div>
                  <div
                    style={{
                      marginBottom: 6,
                      font: 'var(--type-label)',
                      color: 'var(--text-strong)',
                    }}
                  >
                    Vuelto
                  </div>
                  <div
                    style={{
                      height: 38,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 12px',
                      background: 'var(--surface-sunken)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-mono)',
                      color: changeCents > 0 ? 'var(--success)' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    {formatPEN(changeCents)}
                  </div>
                </div>
              </div>
            )}
            {needsOperation && (
              <Input
                label="N° de operación"
                placeholder="Ej. 90412238"
                value={operationNumber}
                onChange={(e) => setOperationNumber(e.target.value)}
                hint="Opcional"
              />
            )}
          </div>
        </Card>

        <Button variant="accent" size="lg" block iconLeft={<Icons.Receipt />} disabled={disabled} onClick={submit}>
          Cobrar {formatPEN(totalCents)} y emitir recibo
        </Button>
      </div>

      <ReceiptDialog open={!!receipt} receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
