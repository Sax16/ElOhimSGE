// Pantalla Caja y cobros (R2 · Etapa 1). Pestañas «Cobrar» y «Caja del día».
// La pestaña «Devoluciones» del prototipo llega en una etapa posterior.
// Spec: design/ui_kits/sge/CashierScreen.jsx.
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { useCan } from '../../lib/useCan';
import { useCashierDay } from './api';
import { CobrarTab } from './CobrarTab';
import { CajaDiaTab } from './CajaDiaTab';

type TabId = 'cobrar' | 'dia';

export function CashierPage() {
  const [tab, setTab] = useState<TabId>('cobrar');
  const canEdit = useCan('caja', 'editar');
  const { data: day } = useCashierDay();

  const operationsCount = day?.stats?.operationsCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'cobrar', label: 'Cobrar' },
          { id: 'dia', label: 'Caja del día', count: operationsCount },
        ]}
      />
      {tab === 'cobrar' ? <CobrarTab canEdit={canEdit} /> : <CajaDiaTab canEdit={canEdit} />}
    </div>
  );
}
