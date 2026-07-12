// Pestaña «Caja chica»: fondo fijo, gastos menores y rendición (consolida los
// gastos en un único egreso de Gastos y repone el fondo). Reglas: alcance-
// funcional.md § etapa 4.
import { useEffect, useState } from 'react';
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
  Input,
  Select,
  StatCard,
  Table,
  Textarea,
  Tooltip,
  useToast,
} from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { PETTY_RENDITION_SOURCE_LABELS, formatPEN, toCents } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { fmtDate } from '../structure/bits';
import { useUsers } from '../settings/api';
import {
  useCancelPettyExpense,
  useCreatePettyExpense,
  useCreateRendition,
  usePettyCash,
  useUpdateFund,
} from './api';
import { RenditionDetailDialog } from './RenditionDetailDialog';
import type { PettyExpense, PettyRenditionSource } from './types';

/** Normaliza la entrada de dinero: solo dígitos y un punto decimal. */
function sanitizeMoney(v: string): string {
  return v.replace(/[^0-9.]/g, '');
}

export function PettyCashTab({ canEdit, isAdmin }: { canEdit: boolean; isAdmin: boolean }) {
  const { data, isLoading } = usePettyCash();

  const [newExpense, setNewExpense] = useState(false);
  const [rendir, setRendir] = useState(false);
  const [editFund, setEditFund] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<PettyExpense | null>(null);
  const [renditionId, setRenditionId] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando caja chica…</div>
    );
  }

  const fundCents = toCents(data.fund.amount);
  const spentCents = toCents(data.spent);
  const balanceCents = toCents(data.balance);
  const lowBalance = balanceCents < fundCents * 0.3;
  const noExpenses = data.expenses.length === 0;

  const expenseCols: TableColumn<PettyExpense>[] = [
    { key: 'date', header: 'Fecha', mono: true, align: 'center', width: 84, render: (v) => fmtDate(v as string) },
    {
      key: 'concept',
      header: 'Concepto',
      render: (v) => <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{v}</span>,
    },
    {
      key: 'voucherNumber',
      header: 'Comprobante',
      align: 'center',
      render: (v) =>
        v ? (
          <span style={{ fontFamily: 'var(--font-mono)' }}>{v as string}</span>
        ) : (
          <Badge tone="neutral" size="sm">
            Sin comprobante
          </Badge>
        ),
    },
    {
      key: 'amount',
      header: 'Monto',
      num: true,
      mono: true,
      render: (v, r) =>
        r.status === 'ANULADO' ? (
          <span style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              {formatPEN(toCents(v as string))}
            </span>
            <Badge tone="neutral">Anulado</Badge>
          </span>
        ) : (
          <span style={{ color: 'var(--danger)' }}>− {formatPEN(toCents(v as string))}</span>
        ),
    },
    {
      key: 'registeredByName',
      header: 'Registró',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Avatar name={v as string} size="xs" />
          <span style={{ font: 'var(--type-caption)' }}>{v}</span>
        </div>
      ),
    },
    {
      key: 'acc',
      header: '',
      align: 'right',
      render: (_v, r) =>
        canEdit && r.status === 'ACTIVO' ? (
          <Tooltip content="Anular">
            <IconButton label="Anular" size="sm" variant="danger" onClick={() => setCancelTarget(r)}>
              <Icons.Trash />
            </IconButton>
          </Tooltip>
        ) : null,
    },
  ];

  const noVoucherCount = data.expenses.filter((e) => e.status === 'ACTIVO' && !e.voucherNumber).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="esge-treasury-petty-stats">
        <StatCard
          label="Fondo fijo"
          value={formatPEN(fundCents)}
          icon={
            isAdmin ? (
              <button
                type="button"
                aria-label="Editar fondo"
                onClick={() => setEditFund(true)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', display: 'inline-flex' }}
              >
                <Icons.Pencil />
              </button>
            ) : (
              <Icons.Cash />
            )
          }
          caption={`responsable: ${data.fund.responsibleName}`}
        />
        <StatCard
          label="Gastado"
          value={formatPEN(spentCents)}
          iconTone="danger"
          icon={<Icons.Chart />}
          caption={`${data.expenses.length} ${data.expenses.length === 1 ? 'gasto menor' : 'gastos menores'}`}
        />
        <StatCard
          label="Saldo disponible"
          value={formatPEN(balanceCents)}
          iconTone={lowBalance ? 'danger' : 'success'}
          icon={<Icons.Check />}
          caption={lowBalance ? 'por debajo del 30% — rendir' : 'fondo saludable'}
        />
      </div>

      <Alert tone="info" title="Cómo opera">
        Cubre gastos menores del día sin pasar por Tesorería. Al <b>rendir</b>, se crea un único gasto consolidado en{' '}
        <b>Gastos</b> (origen: Caja chica) y el fondo se repone a {formatPEN(fundCents)}.
      </Alert>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {canEdit && (
          <Button
            variant="secondary"
            iconLeft={<Icons.Receipt />}
            disabled={noExpenses}
            onClick={() => setRendir(true)}
          >
            Rendir y reponer fondo
          </Button>
        )}
        {canEdit && (
          <Button variant="primary" iconLeft={<Icons.Plus />} onClick={() => setNewExpense(true)}>
            Registrar gasto menor
          </Button>
        )}
      </div>

      <Card flush title="Gastos del fondo">
        {noExpenses ? (
          <EmptyState
            icon={<Icons.Cash />}
            title="Sin gastos menores"
            description="Registra los gastos menores del día; al rendir se consolidan en un solo gasto."
          />
        ) : (
          <Table columns={expenseCols} data={data.expenses} rowKey="id" hover zebra />
        )}
      </Card>

      <Card flush title="Rendiciones anteriores">
        {data.renditions.length === 0 ? (
          <EmptyState icon={<Icons.Receipt />} title="Sin rendiciones" description="Aquí aparecerán las reposiciones ya realizadas." />
        ) : (
          <Table
            columns={[
              { key: 'code', header: 'N°', mono: true, width: 110 },
              {
                key: 'createdAt',
                header: 'Fecha',
                mono: true,
                align: 'center',
                width: 110,
                render: (v) => fmtDate(v as string),
              },
              {
                key: 'expensesCount',
                header: 'Gastos',
                align: 'center',
                render: (v) => `${v} ${(v as number) === 1 ? 'gasto' : 'gastos'}`,
              },
              {
                key: 'source',
                header: 'Reposición',
                align: 'center',
                render: (v) => <Badge tone="info">{PETTY_RENDITION_SOURCE_LABELS[v as PettyRenditionSource]}</Badge>,
              },
              {
                key: 'totalAmount',
                header: 'Total',
                num: true,
                mono: true,
                render: (v) => <span style={{ color: 'var(--danger)' }}>− {formatPEN(toCents(v as string))}</span>,
              },
              {
                key: 'movementCode',
                header: 'Gasto',
                align: 'right',
                render: (_v, r) => (
                  // Se abre por código (REND-####): es el único identificador que un
                  // gasto expone vía originRef, así ambas entradas resuelven igual.
                  <Button size="sm" variant="link" onClick={() => setRenditionId(r.code)}>
                    {r.movementCode}
                  </Button>
                ),
              },
            ]}
            data={data.renditions}
            rowKey="id"
            hover
            zebra
          />
        )}
      </Card>

      <PettyExpenseDialog open={newExpense} balanceCents={balanceCents} onClose={() => setNewExpense(false)} />
      <RenditionDialog
        open={rendir}
        expensesCount={data.expenses.filter((e) => e.status === 'ACTIVO').length}
        spentCents={spentCents}
        noVoucherCount={noVoucherCount}
        onClose={() => setRendir(false)}
      />
      {isAdmin && (
        <FundDialog
          open={editFund}
          currentAmount={data.fund.amount}
          currentResponsibleId={data.fund.responsibleId}
          onClose={() => setEditFund(false)}
        />
      )}
      <CancelPettyExpenseDialog target={cancelTarget} onClose={() => setCancelTarget(null)} />
      <RenditionDetailDialog id={renditionId} onClose={() => setRenditionId(null)} />
    </div>
  );
}

// ---- Diálogo gasto menor ---------------------------------------------------
function PettyExpenseDialog({
  open,
  balanceCents,
  onClose,
}: {
  open: boolean;
  balanceCents: number;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const create = useCreatePettyExpense();
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');

  useEffect(() => {
    if (open) {
      setConcept('');
      setAmount('');
      setVoucherNumber('');
    }
  }, [open]);

  const valid = concept.trim().length > 0 && sanitizeMoney(amount).length > 0;

  const submit = () => {
    if (!valid) return;
    create.mutate(
      {
        concept: concept.trim(),
        amount: sanitizeMoney(amount),
        voucherNumber: voucherNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast('success', 'Gasto registrado', 'Descontado del fondo de caja chica.');
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Cash />}
      title="Registrar gasto menor"
      description={`Saldo disponible: ${formatPEN(balanceCents)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={!valid || create.isPending} onClick={submit}>
            Registrar
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Input
          label="Concepto"
          required
          placeholder="Ej. pasajes, fotocopias…"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          containerStyle={{ gridColumn: '1 / -1' }}
        />
        <Input
          label="Monto"
          prefix="S/."
          required
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(sanitizeMoney(e.target.value))}
          hint={`Máx. ${formatPEN(balanceCents)}`}
        />
        <Input
          label="N° de comprobante"
          placeholder="Opcional (boleta)"
          value={voucherNumber}
          onChange={(e) => setVoucherNumber(e.target.value)}
        />
      </div>
    </Dialog>
  );
}

// ---- Diálogo rendición -----------------------------------------------------
function RenditionDialog({
  open,
  expensesCount,
  spentCents,
  noVoucherCount,
  onClose,
}: {
  open: boolean;
  expensesCount: number;
  spentCents: number;
  noVoucherCount: number;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const rendir = useCreateRendition();
  const [source, setSource] = useState<PettyRenditionSource>('EFECTIVO_CAJA');

  useEffect(() => {
    if (open) setSource('EFECTIVO_CAJA');
  }, [open]);

  const submit = () => {
    rendir.mutate(
      { source },
      {
        onSuccess: () => {
          toast(
            'success',
            'Fondo repuesto',
            `Gasto consolidado de ${formatPEN(spentCents)} creado en Gastos (origen: Caja chica).`,
          );
          onClose();
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            toast('warning', 'No hay caja abierta', `${err.message} Abre la caja del día o repón por transferencia.`);
          } else {
            toast('danger', 'No se pudo rendir', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.');
          }
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Receipt />}
      iconTone="warning"
      title="Rendir y reponer fondo"
      description={`${expensesCount} ${expensesCount === 1 ? 'gasto' : 'gastos'} · ${formatPEN(spentCents)} rendidos`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="accent" iconLeft={<Icons.Check />} disabled={rendir.isPending} onClick={submit}>
            Rendir {formatPEN(spentCents)}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <Alert tone="warning" title="Un solo gasto consolidado">
          Los {expensesCount} gastos menores se registrarán como un único movimiento en <b>Gastos</b> con el detalle
          adjunto.
          {noVoucherCount > 0
            ? ` ${noVoucherCount} ${noVoucherCount === 1 ? 'no tiene comprobante y quedará observado' : 'no tienen comprobante y quedarán observados'}.`
            : ''}
        </Alert>
        <Select
          label="Origen de la reposición"
          options={(Object.keys(PETTY_RENDITION_SOURCE_LABELS) as PettyRenditionSource[]).map((s) => ({
            value: s,
            label: PETTY_RENDITION_SOURCE_LABELS[s],
          }))}
          value={source}
          onChange={(e) => setSource(e.target.value as PettyRenditionSource)}
        />
      </div>
    </Dialog>
  );
}

// ---- Diálogo editar fondo (solo ADMIN) -------------------------------------
function FundDialog({
  open,
  currentAmount,
  currentResponsibleId,
  onClose,
}: {
  open: boolean;
  currentAmount: string;
  currentResponsibleId: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { data: users } = useUsers();
  const update = useUpdateFund();
  const [amount, setAmount] = useState(currentAmount);
  const [responsibleId, setResponsibleId] = useState(currentResponsibleId);

  useEffect(() => {
    if (open) {
      setAmount(currentAmount);
      setResponsibleId(currentResponsibleId);
    }
  }, [open, currentAmount, currentResponsibleId]);

  const valid = sanitizeMoney(amount).length > 0 && !!responsibleId;

  const submit = () => {
    if (!valid) return;
    update.mutate(
      { amount: sanitizeMoney(amount), responsibleId },
      {
        onSuccess: () => {
          toast('success', 'Fondo actualizado', 'El monto y responsable del fondo fijo quedaron guardados.');
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo actualizar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      icon={<Icons.Cash />}
      title="Editar fondo fijo"
      description="Monto del fondo y responsable que lo administra"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" iconLeft={<Icons.Check />} disabled={!valid || update.isPending} onClick={submit}>
            Guardar
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, paddingTop: 4 }}>
        <Input
          label="Monto del fondo"
          prefix="S/."
          required
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(sanitizeMoney(e.target.value))}
        />
        <Select
          label="Responsable"
          required
          placeholder="Seleccione"
          options={(users ?? []).map((u) => ({ value: u.id, label: u.fullName }))}
          value={responsibleId}
          onChange={(e) => setResponsibleId(e.target.value)}
        />
      </div>
    </Dialog>
  );
}

// ---- Diálogo anular gasto menor --------------------------------------------
function CancelPettyExpenseDialog({ target, onClose }: { target: PettyExpense | null; onClose: () => void }) {
  const { toast } = useToast();
  const cancel = useCancelPettyExpense();
  const [reason, setReason] = useState('');

  useEffect(() => {
    setReason('');
  }, [target?.id]);

  const valid = reason.trim().length >= 10;

  const submit = () => {
    if (!target || !valid) return;
    cancel.mutate(
      { id: target.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast('warning', 'Gasto anulado', `${target.concept} anulado — vuelve al saldo del fondo.`);
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo anular', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!target}
      onClose={onClose}
      icon={<Icons.Trash />}
      iconTone="danger"
      title="Anular gasto menor"
      description={target ? `${target.concept} · ${formatPEN(toCents(target.amount))}` : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" iconLeft={<Icons.Trash />} disabled={!valid || cancel.isPending} onClick={submit}>
            Anular gasto
          </Button>
        </>
      }
    >
      <div style={{ paddingTop: 4 }}>
        <Textarea
          label="Motivo de anulación"
          rows={2}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej. registrado por error, monto incorrecto…"
          hint={valid ? 'Listo' : `${Math.max(0, 10 - reason.trim().length)} caracteres más`}
        />
      </div>
    </Dialog>
  );
}
