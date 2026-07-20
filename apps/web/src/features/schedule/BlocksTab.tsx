// Pestaña "Bloques horarios" (Configuración): define los bloques de la grilla
// por nivel+turno. Tabla editable (el orden es la fila): hora inicio, hora fin,
// switch Recreo y label opcional. Guardar → PUT completo. No se puede eliminar
// un bloque con clases ya programadas (el API responde 409 con el detalle).
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Icons,
  IconButton,
  Input,
  Select,
  Switch,
  Tooltip,
  useToast,
} from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useCan } from '../../lib/useCan';
import { useSelectedYear } from '../../lib/useSelectedYear';
import { useLevelsTree } from '../structure/api';
import { SHIFT_LABELS } from '../student-attendance/bits';
import type { Shift } from '../student-attendance/types';
import { useBlocks, useSaveBlocks } from './api';
import type { BlockDraft } from './types';
import './schedule.css';

const SHIFTS: Shift[] = ['MANANA', 'TARDE'];

interface Row {
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label: string;
}

const EMPTY_ROW: Row = { startTime: '', endTime: '', isBreak: false, label: '' };

export function BlocksTab() {
  const { toast } = useToast();
  const canEdit = useCan('estructura', 'editar');
  const { yearId, readOnly } = useSelectedYear();

  const { data: tree } = useLevelsTree(yearId);
  const levels = useMemo(
    () => (tree ?? []).map((l) => ({ value: l.id, label: l.name })),
    [tree],
  );

  const [levelId, setLevelId] = useState('');
  const [shift, setShift] = useState<Shift>('MANANA');
  const activeLevelId = levelId || levels[0]?.value || '';

  const { data, isLoading } = useBlocks(activeLevelId || undefined, shift);
  const save = useSaveBlocks();

  const [rows, setRows] = useState<Row[]>([]);

  // Al cargar/cambiar nivel+turno, sincroniza el borrador con lo que hay guardado.
  useEffect(() => {
    if (!data) return;
    setRows(
      [...data.blocks]
        .sort((a, b) => a.order - b.order)
        .map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
          isBreak: b.isBreak,
          label: b.label ?? '',
        })),
    );
  }, [data, activeLevelId, shift]);

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const canMutate = canEdit && !readOnly;
  const valid = rows.length > 0 && rows.every((r) => r.startTime && r.endTime);

  const onSave = () => {
    if (!activeLevelId || !valid || save.isPending) return;
    const blocks: BlockDraft[] = rows.map((r, i) => ({
      order: i + 1,
      startTime: r.startTime,
      endTime: r.endTime,
      isBreak: r.isBreak,
      label: r.label.trim() || undefined,
    }));
    save.mutate(
      { levelId: activeLevelId, shift, blocks },
      {
        onSuccess: () => toast('success', 'Bloques guardados', 'La grilla del nivel y turno se actualizó.'),
        onError: (err) =>
          toast('danger', 'No se pudo guardar', err instanceof ApiError ? err.message : 'Inténtalo de nuevo.'),
      },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Alert tone="info">
        Los bloques definen la grilla de todas las secciones del nivel y turno. No puedes eliminar
        un bloque con clases ya programadas.
      </Alert>

      {readOnly && (
        <Alert tone="warning" title="Año cerrado">
          El año seleccionado está cerrado: los bloques son de solo lectura.
        </Alert>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <Select
          label="Nivel"
          placeholder={levels.length ? undefined : 'Sin niveles'}
          options={levels}
          value={activeLevelId}
          onChange={(e) => setLevelId(e.target.value)}
          disabled={!levels.length}
          containerStyle={{ minWidth: 200 }}
        />
        <Select
          label="Turno"
          options={SHIFTS.map((s) => ({ value: s, label: SHIFT_LABELS[s] }))}
          value={shift}
          onChange={(e) => setShift(e.target.value as Shift)}
          containerStyle={{ minWidth: 160 }}
        />
      </div>

      <Card
        title="Bloques del horario"
        subtitle="El orden lo determina la posición de la fila"
        actions={
          canMutate ? (
            <Button size="sm" variant="secondary" iconLeft={<Icons.Plus />} onClick={addRow}>
              Añadir bloque
            </Button>
          ) : undefined
        }
      >
        {isLoading && rows.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', font: 'var(--type-body)' }}>Cargando bloques…</div>
        ) : rows.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', font: 'var(--type-body)' }}>
            No hay bloques para este nivel y turno.{' '}
            {canMutate && 'Añade el primero para armar la grilla.'}
          </div>
        ) : (
          <div>
            {rows.map((r, i) => (
              <div key={i} className="esge-blocks-row">
                <div className="esge-blocks-row__ord">{i + 1}</div>
                <Input
                  label={i === 0 ? 'Hora inicio' : undefined}
                  type="time"
                  value={r.startTime}
                  disabled={!canMutate}
                  onChange={(e) => setRow(i, { startTime: e.target.value })}
                />
                <Input
                  label={i === 0 ? 'Hora fin' : undefined}
                  type="time"
                  value={r.endTime}
                  disabled={!canMutate}
                  onChange={(e) => setRow(i, { endTime: e.target.value })}
                />
                <div className="esge-blocks-row__switch">
                  <Switch
                    label="Recreo"
                    size="sm"
                    checked={r.isBreak}
                    disabled={!canMutate}
                    onChange={(e) => setRow(i, { isBreak: e.target.checked })}
                  />
                </div>
                <Input
                  label={i === 0 ? 'Etiqueta' : undefined}
                  placeholder={r.isBreak ? 'Recreo' : 'Opcional'}
                  value={r.label}
                  disabled={!canMutate}
                  onChange={(e) => setRow(i, { label: e.target.value })}
                />
                <div className="esge-blocks-row__del">
                  {canMutate && (
                    <Tooltip content="Quitar bloque">
                      <IconButton label="Quitar" size="sm" variant="danger" onClick={() => removeRow(i)}>
                        <Icons.Trash />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {canMutate && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            iconLeft={<Icons.Check />}
            disabled={!valid || save.isPending}
            onClick={onSave}
          >
            Guardar bloques
          </Button>
        </div>
      )}
    </div>
  );
}
