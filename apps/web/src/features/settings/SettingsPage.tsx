// Pantalla Configuración — pestañas Institución y Usuarios y roles (WP5, Etapa 2).
// Las demás pestañas quedan deshabilitadas (llegan en etapas posteriores).
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { useUsers } from './api';
import { InstitutionTab } from './InstitutionTab';
import { UsersTab } from './UsersTab';

type TabId = 'inst' | 'users' | 'notif' | 'eval' | 'planilla';

export function SettingsPage() {
  const [tab, setTab] = useState<TabId>('inst');
  const usersQuery = useUsers();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'inst', label: 'Institución' },
          { id: 'users', label: 'Usuarios y roles', count: usersQuery.data?.length },
          { id: 'notif', label: 'Notificaciones', disabled: true },
          { id: 'eval', label: 'Evaluación', disabled: true },
          { id: 'planilla', label: 'Planilla', disabled: true },
        ]}
      />
      {tab === 'inst' && <InstitutionTab />}
      {tab === 'users' && <UsersTab />}
    </div>
  );
}
