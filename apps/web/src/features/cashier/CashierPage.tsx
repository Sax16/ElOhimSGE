// Pantalla Caja y cobros. Pestañas «Cobrar», «Caja del día», «Devoluciones»
// (R2 · Etapa 3) e «Historial». Spec: design/ui_kits/sge/CashierScreen.jsx con
// los reemplazos de la etapa 3 (alcance-funcional.md § «Compromisos y devoluciones»).
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { useCan } from '../../lib/useCan';
import { useMe } from '../../lib/useMe';
import { useCashierDay, useRefunds } from './api';
import { CobrarTab } from './CobrarTab';
import { CajaDiaTab } from './CajaDiaTab';
import { DevolucionesTab } from './DevolucionesTab';
import { HistorialTab } from './HistorialTab';

type TabId = 'cobrar' | 'dia' | 'dev' | 'hist';

export function CashierPage() {
  const [tab, setTab] = useState<TabId>('cobrar');
  const canEdit = useCan('caja', 'editar');
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';
  const { data: day } = useCashierDay();
  // Contador del tab Devoluciones: solicitudes pendientes de aprobación.
  const { data: pending } = useRefunds('PENDIENTE_APROBACION', 1, 1);

  const operationsCount = day?.stats?.operationsCount;
  const pendingCount = pending?.total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'cobrar', label: 'Cobrar' },
          { id: 'dia', label: 'Caja del día', count: operationsCount },
          { id: 'dev', label: 'Devoluciones', count: pendingCount },
          { id: 'hist', label: 'Historial' },
        ]}
      />
      {tab === 'cobrar' && <CobrarTab canEdit={canEdit} />}
      {tab === 'dia' && <CajaDiaTab canEdit={canEdit} />}
      {tab === 'dev' && <DevolucionesTab canEdit={canEdit} isAdmin={isAdmin} />}
      {tab === 'hist' && <HistorialTab />}
    </div>
  );
}
