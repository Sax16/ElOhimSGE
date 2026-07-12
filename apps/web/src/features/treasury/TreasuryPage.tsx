// Pantalla Gastos e ingresos (Tesorería · R2 · Etapa 4). Pestañas: Resumen del
// mes · Gastos · Otros ingresos · Caja chica. El mes/año es estado compartido.
// Spec: design/ui_kits/sge/TreasuryScreen.jsx con los reemplazos de la etapa 4
// (alcance-funcional.md § «Tesorería — decisiones de la etapa 4»).
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { useCan } from '../../lib/useCan';
import { useMe } from '../../lib/useMe';
import { useTreasuryMovements } from './api';
import { ResumenTab } from './ResumenTab';
import { MovTab } from './MovTab';
import { PettyCashTab } from './PettyCashTab';
import './treasury.css';

type TabId = 'resumen' | 'gastos' | 'ingresos' | 'cajachica';

export function TreasuryPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState<TabId>('resumen');

  const canEdit = useCan('tesoreria', 'editar');
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';

  // Conteos de gastos/ingresos del mes para los chips de las pestañas.
  const gastosCount = useTreasuryMovements({
    kind: 'GASTO',
    categoryId: null,
    month,
    year,
    q: '',
    page: 1,
    pageSize: 1,
  }).data?.total;
  const ingresosCount = useTreasuryMovements({
    kind: 'INGRESO',
    categoryId: null,
    month,
    year,
    q: '',
    page: 1,
    pageSize: 1,
  }).data?.total;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'resumen', label: 'Resumen del mes' },
          { id: 'gastos', label: 'Gastos', count: gastosCount },
          { id: 'ingresos', label: 'Otros ingresos', count: ingresosCount },
          { id: 'cajachica', label: 'Caja chica' },
        ]}
      />
      {tab === 'resumen' && (
        <ResumenTab month={month} year={year} onMonth={setMonth} onYear={setYear} />
      )}
      {tab === 'gastos' && (
        <MovTab kind="GASTO" month={month} year={year} onMonth={setMonth} onYear={setYear} canEdit={canEdit} />
      )}
      {tab === 'ingresos' && (
        <MovTab kind="INGRESO" month={month} year={year} onMonth={setMonth} onYear={setYear} canEdit={canEdit} />
      )}
      {tab === 'cajachica' && <PettyCashTab canEdit={canEdit} isAdmin={isAdmin} />}
    </div>
  );
}
