// Diálogo de crear/editar un gasto o ingreso de tesorería.
// Regla (etapa 4): los ingresos en EFECTIVO entran a la caja de hoy — su fecha
// es siempre hoy (campo deshabilitado). Editar un ingreso cuya caja ya cerró
// devuelve 409: se muestra el mensaje del backend.
import { useEffect, useMemo, useState } from 'react';
import { Button, Dialog, Icons, Input, Select, Textarea, useToast } from '@elohim/ui';
import { PAYMENT_METHOD_LABELS } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { todayLocalISO } from '../cashier/bits';
import { useCreateMovement, useTreasuryCategories, useUpdateMovement } from './api';
import { CategoriesDialog } from './CategoriesDialog';
import type { PaymentMethod, TreasuryKind, TreasuryMovement } from './types';

const METHOD_OPTIONS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => ({
  value: m,
  label: PAYMENT_METHOD_LABELS[m],
}));

/** Normaliza la entrada de dinero: solo dígitos y un punto decimal. */
function sanitizeMoney(v: string): string {
  return v.replace(/[^0-9.]/g, '');
}

export function MovDialog({
  kind,
  open,
  movement,
  canEdit,
  onClose,
}: {
  kind: TreasuryKind;
  open: boolean;
  movement: TreasuryMovement | null;
  canEdit: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const esGasto = kind === 'GASTO';
  const isEdit = movement !== null;
  const { data: categories } = useTreasuryCategories(kind);
  const create = useCreateMovement();
  const update = useUpdateMovement();

  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayLocalISO());
  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO');
  const [supplier, setSupplier] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [manageCats, setManageCats] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDescription(movement?.description ?? '');
    setCategoryId(movement?.categoryId ?? '');
    setAmount(movement?.amount ?? '');
    setDate(movement?.date ?? todayLocalISO());
    setMethod(movement?.method ?? 'EFECTIVO');
    setSupplier(movement?.supplier ?? '');
    setVoucherNumber(movement?.voucherNumber ?? '');
    setNotes(movement?.notes ?? '');
  }, [open, movement]);

  // Ingreso en efectivo → entra a la caja de hoy: la fecha es hoy y no se edita.
  const lockDateToday = !esGasto && method === 'EFECTIVO';

  // Solo las categorías activas se ofrecen; la del movimiento en edición se conserva
  // aunque esté inactiva.
  const catOptions = useMemo(() => {
    const active = (categories ?? []).filter(
      (c) => c.status === 'ACTIVO' || c.id === movement?.categoryId,
    );
    return active.map((c) => ({ value: c.id, label: c.name }));
  }, [categories, movement?.categoryId]);

  const valid = description.trim().length > 0 && !!categoryId && sanitizeMoney(amount).length > 0;

  const submit = () => {
    if (!valid) return;
    const effectiveDate = lockDateToday ? todayLocalISO() : date;
    if (isEdit && movement) {
      update.mutate(
        {
          id: movement.id,
          body: {
            categoryId,
            description: description.trim(),
            amount: sanitizeMoney(amount),
            method,
            date: effectiveDate,
            supplier: esGasto ? supplier.trim() || undefined : undefined,
            voucherNumber: esGasto ? voucherNumber.trim() || undefined : undefined,
            notes: notes.trim() || undefined,
          },
        },
        {
          onSuccess: () => {
            toast('success', 'Movimiento actualizado', 'Los cambios quedaron guardados y auditados.');
            onClose();
          },
          onError: (err) =>
            toast(
              'danger',
              'No se pudo guardar',
              err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
            ),
        },
      );
    } else {
      create.mutate(
        {
          kind,
          categoryId,
          description: description.trim(),
          amount: sanitizeMoney(amount),
          method,
          date: lockDateToday ? undefined : date,
          supplier: esGasto ? supplier.trim() || undefined : undefined,
          voucherNumber: esGasto ? voucherNumber.trim() || undefined : undefined,
          notes: notes.trim() || undefined,
        },
        {
          onSuccess: () => {
            toast(
              'success',
              esGasto ? 'Gasto registrado' : 'Ingreso registrado',
              esGasto
                ? 'Sumado al egreso del mes.'
                : method === 'EFECTIVO'
                  ? 'Ingresó a la caja del día y al resumen del mes.'
                  : 'Sumado al ingreso del mes.',
            );
            onClose();
          },
          onError: (err) => {
            if (err instanceof ApiError && err.status === 409) {
              toast('warning', 'No hay caja abierta', `${err.message} Abre la caja del día para registrar ingresos en efectivo.`);
            } else {
              toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
            }
          },
        },
      );
    }
  };

  const pending = create.isPending || update.isPending;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        size="lg"
        icon={esGasto ? <Icons.Cash /> : <Icons.Receipt />}
        iconTone={esGasto ? 'danger' : 'success'}
        title={isEdit ? `Editar · ${movement?.code}` : esGasto ? 'Registrar gasto' : 'Registrar ingreso'}
        description={
          esGasto
            ? 'Egresos operativos: servicios, compras, mantenimiento…'
            : 'Ingresos no académicos: impresiones, alquileres, trámites…'
        }
        footer={
          <>
            <Button variant="secondary" onClick={onClose} disabled={pending}>
              Cancelar
            </Button>
            <Button variant="primary" iconLeft={<Icons.Check />} disabled={!valid || pending} onClick={submit}>
              {isEdit ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
          <Input
            label="Descripción"
            required
            placeholder={esGasto ? 'Ej. Compra de papel bond A4' : 'Ej. Alquiler de losa deportiva'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            containerStyle={{ gridColumn: '1 / -1' }}
          />
          <div>
            <Select
              label="Categoría"
              required
              placeholder="Seleccione"
              options={catOptions}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
            {canEdit && (
              <Button variant="link" size="sm" onClick={() => setManageCats(true)} style={{ marginTop: 4 }}>
                Administrar categorías
              </Button>
            )}
          </div>
          <Input
            label="Monto"
            prefix="S/."
            required
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(sanitizeMoney(e.target.value))}
          />
          <Input
            label="Fecha"
            type="date"
            value={lockDateToday ? todayLocalISO() : date}
            onChange={(e) => setDate(e.target.value)}
            disabled={lockDateToday}
            hint={lockDateToday ? 'Los ingresos en efectivo entran a la caja de hoy' : undefined}
          />
          <Select
            label="Método"
            options={METHOD_OPTIONS}
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          />
          {esGasto && (
            <Input
              label="Proveedor / beneficiario"
              placeholder="Ej. Librería San Marcos"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          )}
          {esGasto && (
            <Input
              label="N° de comprobante"
              placeholder="Boleta/factura (opcional)"
              value={voucherNumber}
              onChange={(e) => setVoucherNumber(e.target.value)}
            />
          )}
          <Textarea
            label="Observaciones"
            rows={2}
            placeholder="Opcional…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            containerStyle={{ gridColumn: '1 / -1' }}
          />
        </div>
      </Dialog>

      <CategoriesDialog open={manageCats} kind={kind} onClose={() => setManageCats(false)} />
    </>
  );
}
