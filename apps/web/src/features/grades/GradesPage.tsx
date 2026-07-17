// Notas por competencias (R4 · Etapa 2). Tres pestañas: registro de notas,
// aspectos del aula (tutor/admin) y libretas. Accesible a ADMIN, SECRETARIA con
// permiso y DOCENTE (cada uno ve solo lo suyo, según el backend).
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { RegistroNotasTab } from './RegistroNotasTab';
import { AspectsTab } from './AspectsTab';
import { LibretasTab } from './LibretasTab';
import './grades.css';

type TabId = 'registro' | 'aspectos' | 'libretas';

export function GradesPage() {
  const [tab, setTab] = useState<TabId>('registro');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'registro', label: 'Registro de notas' },
          { id: 'aspectos', label: 'Aspectos del aula' },
          { id: 'libretas', label: 'Libretas' },
        ]}
      />
      {tab === 'registro' && <RegistroNotasTab />}
      {tab === 'aspectos' && <AspectsTab />}
      {tab === 'libretas' && <LibretasTab />}
    </div>
  );
}
