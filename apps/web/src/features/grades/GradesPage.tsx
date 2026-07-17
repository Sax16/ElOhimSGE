// Notas por competencias (R4 · Etapa 2). Pestañas: registro de notas, aspectos
// del aula (tutor/admin) y libretas — esta última SOLO para ADMIN (regla de
// negocio, jul 2026; el backend también la restringe).
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { useMe } from '../../lib/useMe';
import { RegistroNotasTab } from './RegistroNotasTab';
import { AspectsTab } from './AspectsTab';
import { LibretasTab } from './LibretasTab';
import './grades.css';

type TabId = 'registro' | 'aspectos' | 'libretas';

export function GradesPage() {
  const [tab, setTab] = useState<TabId>('registro');
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';

  const items = [
    { id: 'registro', label: 'Registro de notas' },
    { id: 'aspectos', label: 'Aspectos del aula' },
    ...(isAdmin ? [{ id: 'libretas', label: 'Libretas' }] : []),
  ];

  const activeTab = tab === 'libretas' && !isAdmin ? 'registro' : tab;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs value={activeTab} onChange={(id) => setTab(id as TabId)} items={items} />
      {activeTab === 'registro' && <RegistroNotasTab />}
      {activeTab === 'aspectos' && <AspectsTab />}
      {activeTab === 'libretas' && isAdmin && <LibretasTab />}
    </div>
  );
}
