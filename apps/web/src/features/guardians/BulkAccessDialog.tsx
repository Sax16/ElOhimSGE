// Diálogo "Generar accesos pendientes" (bulk): genera credenciales para todos
// los apoderados sin acceso y muestra la lista resultante una sola vez, con
// opción de imprimirla.
import { useState } from 'react';
import { Alert, Badge, Button, Dialog, EmptyState, Icons, Table, useToast } from '@elohim/ui';
import type { TableColumn } from '@elohim/ui';
import { ApiError } from '../../lib/api';
import { useBulkAccess } from './api';
import { printCredentials } from './printCredentials';
import type { BulkAccessResult, BulkAccessRow } from './types';

const INSTITUTION = 'I.E.P. Elohim';

export function BulkAccessDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const bulk = useBulkAccess();
  const [result, setResult] = useState<BulkAccessResult | null>(null);

  const close = () => {
    setResult(null);
    bulk.reset();
    onClose();
  };

  const onGenerate = () => {
    bulk.mutate(undefined, {
      onSuccess: (res) => {
        setResult(res);
        toast(
          'success',
          'Accesos generados',
          `${res.generated.length} ${res.generated.length === 1 ? 'apoderado' : 'apoderados'} · ${res.skipped} ya tenían acceso.`,
        );
      },
      onError: (err) =>
        toast(
          'danger',
          'No se pudieron generar los accesos',
          err instanceof ApiError ? err.message : 'Inténtalo de nuevo.',
        ),
    });
  };

  const columns: TableColumn<BulkAccessRow>[] = [
    {
      key: 'guardianName',
      header: 'Apoderado',
      render: (_v, r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-strong)' }}>{r.guardianName}</span>
          <span style={{ font: 'var(--type-2xs)', color: 'var(--text-muted)' }}>
            {r.students.join(' · ')}
          </span>
        </div>
      ),
    },
    { key: 'dni', header: 'DNI', mono: true },
    { key: 'username', header: 'Usuario', mono: true },
    {
      key: 'tempPassword',
      header: 'Clave temporal',
      mono: true,
      render: (v) => <span style={{ fontWeight: 600 }}>{v as string}</span>,
    },
  ];

  const rows = result?.generated ?? [];

  return (
    <Dialog
      open={open}
      onClose={close}
      size="xl"
      icon={<Icons.Lock />}
      iconTone={result ? 'success' : 'brand'}
      title="Generar accesos pendientes"
      description={
        result
          ? 'Anota o imprime estas credenciales: no se volverán a mostrar.'
          : 'Crea usuario y clave temporal para cada apoderado que aún no tiene acceso.'
      }
      closeOnOverlay={!result}
      footer={
        result ? (
          <>
            {rows.length > 0 && (
              <Button
                variant="secondary"
                iconLeft={<Icons.Printer />}
                onClick={() => printCredentials(rows, INSTITUTION)}
              >
                Imprimir lista
              </Button>
            )}
            <span style={{ flex: 1 }} />
            <Button variant="primary" onClick={close}>
              Listo
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={bulk.isPending}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={onGenerate} disabled={bulk.isPending}>
              {bulk.isPending ? 'Generando…' : 'Generar accesos'}
            </Button>
          </>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
        {result ? (
          rows.length === 0 ? (
            <EmptyState
              size="sm"
              icon={<Icons.Check />}
              title="No había accesos pendientes"
              description={`Todos los apoderados ya tenían acceso (${result.skipped} omitidos).`}
            />
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge tone="success" dot>
                  {rows.length} {rows.length === 1 ? 'acceso generado' : 'accesos generados'}
                </Badge>
                {result.skipped > 0 && (
                  <Badge tone="neutral">{result.skipped} ya tenían acceso</Badge>
                )}
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                <Table columns={columns} data={rows} rowKey="username" compact />
              </div>
              <Alert tone="warning" title="Anótalas ahora">
                Estas contraseñas temporales no se volverán a mostrar. Imprime la lista o cópialas
                antes de cerrar.
              </Alert>
            </>
          )
        ) : (
          <p style={{ font: 'var(--type-body)', color: 'var(--text-muted)', margin: 0 }}>
            Se generará una credencial para cada apoderado que todavía no tenga acceso al portal. Los
            que ya lo tienen se omiten (su clave no cambia).
          </p>
        )}
      </div>
    </Dialog>
  );
}
