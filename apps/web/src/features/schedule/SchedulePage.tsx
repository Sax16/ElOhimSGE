// Horarios (post-R4). Tres pestañas: "Horario por sección" (grilla bloques×L–V),
// "Asignación docente" (la pantalla previa, reutilizada tal cual) y "Bloques
// horarios" (configuración de la grilla por nivel+turno). Pantalla de admin
// (permiso estructura).
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { AssignmentsPage } from '../assignments/AssignmentsPage';
import { ScheduleGridTab } from './ScheduleGridTab';
import { BlocksTab } from './BlocksTab';

type TabId = 'horario' | 'asignacion' | 'bloques';

export function SchedulePage() {
  const [tab, setTab] = useState<TabId>('horario');

  const items = [
    { id: 'horario', label: 'Horario por sección' },
    { id: 'asignacion', label: 'Asignación docente' },
    { id: 'bloques', label: 'Bloques horarios' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs value={tab} onChange={(id) => setTab(id as TabId)} items={items} />
      {tab === 'horario' && <ScheduleGridTab />}
      {tab === 'asignacion' && <AssignmentsPage />}
      {tab === 'bloques' && <BlocksTab />}
    </div>
  );
}
