// Retiro o traslado del estudiante (spec exacta del prototipo).
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  Icons,
  Input,
  Radio,
  RadioGroup,
  Textarea,
  useToast,
} from '@elohim/ui';
import { formatPEN } from '@elohim/shared';
import { ApiError } from '../../lib/api';
import { useWithdrawStudent } from './api';
import { fullName } from './bits';
import type { StudentDetail } from './types';

export interface WithdrawDialogProps {
  student: StudentDetail | null;
  debtCents: number;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function WithdrawDialog({ student, debtCents, onClose }: WithdrawDialogProps) {
  const { toast } = useToast();
  const withdraw = useWithdrawStudent();

  const [type, setType] = useState<'retiro' | 'traslado'>('retiro');
  const [effectiveDate, setEffectiveDate] = useState(today());
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [certificate, setCertificate] = useState(true);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!student) return;
    setType('retiro');
    setEffectiveDate(today());
    setDestination('');
    setReason('');
    setCertificate(true);
    setTouched(false);
  }, [student?.id]);

  const reasonTooShort = reason.trim().length < 10;
  const destinationMissing = type === 'traslado' && !destination.trim();
  const canSubmit = !reasonTooShort && !destinationMissing && !withdraw.isPending;

  const submit = () => {
    if (!student) return;
    setTouched(true);
    if (reasonTooShort || destinationMissing) return;
    withdraw.mutate(
      {
        id: student.id,
        body: {
          type: type === 'traslado' ? 'TRASLADO' : 'RETIRO',
          reason: reason.trim(),
          effectiveDate,
          destinationSchool: type === 'traslado' ? destination.trim() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast(
            'warning',
            'Proceso registrado',
            `${fullName(student)} — su vacante queda liberada.`,
          );
          if (certificate) {
            toast('info', 'Constancia', 'Constancia disponible próximamente.');
          }
          onClose();
        },
        onError: (err) =>
          toast('danger', 'No se pudo registrar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <Dialog
      open={!!student}
      onClose={onClose}
      size="lg"
      icon={<Icons.Logout />}
      iconTone="danger"
      title={student ? `Retiro o traslado · ${fullName(student)}` : ''}
      description={student ? student.code : ''}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={withdraw.isPending}>
            Cancelar
          </Button>
          <Button variant="danger" iconLeft={<Icons.Check />} disabled={!canSubmit} onClick={submit}>
            Confirmar
          </Button>
        </>
      }
    >
      {student && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          {debtCents > 0 && (
            <Alert tone="warning" title={`Deuda vencida: ${formatPEN(debtCents)}`}>
              El retiro no condona la deuda vencida — queda cobrable en Caja y en los recordatorios
              al apoderado. Solo se anulan las cuotas futuras.
            </Alert>
          )}
          <Alert tone="info" title="Cuotas al retirar">
            Las cuotas vencidas se conservan y las futuras se anulan. La pensión del mes del retiro
            se anula o queda exigible según el día de corte configurado.
          </Alert>
          <RadioGroup name="withdraw-type" value={type} onChange={(e) => setType(e.target.value as 'retiro' | 'traslado')} row>
            <Radio value="retiro" label="Retiro" description="Deja la institución sin destino declarado" />
            <Radio value="traslado" label="Traslado" description="Pasa a otra I.E. — requiere constancia" />
          </RadioGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input
              label="Fecha efectiva"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
            {type === 'traslado' && (
              <Input
                label="I.E. de destino"
                required
                placeholder="Ej. I.E. 30001 Satipo"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                error={touched && destinationMissing ? 'Indica la institución de destino.' : undefined}
              />
            )}
          </div>
          <Textarea
            label="Motivo"
            required
            rows={2}
            placeholder="Ej. cambio de domicilio familiar…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={touched && reasonTooShort ? 'El motivo debe tener al menos 10 caracteres.' : undefined}
            hint={touched && reasonTooShort ? undefined : `${reason.trim().length}/10 caracteres mínimos`}
          />
          <Checkbox
            label="Generar constancia"
            description={
              type === 'traslado'
                ? 'Constancia de traslado + libreta de notas a la fecha'
                : 'Constancia de retiro'
            }
            checked={certificate}
            onChange={(e) => setCertificate(e.target.checked)}
          />
        </div>
      )}
    </Dialog>
  );
}
