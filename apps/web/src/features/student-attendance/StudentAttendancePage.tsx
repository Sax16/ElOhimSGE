// Asistencia de estudiantes — vista Admin/secretaría (R4 · Etapa 1).
// Dos pestañas: "Por día" (roster + corrección) y "Mensual" (matriz + export).
import { useState } from 'react';
import { Tabs } from '@elohim/ui';
import { DayTab } from './DayTab';
import { MonthlyTab } from './MonthlyTab';

type TabId = 'dia' | 'mensual';

export function StudentAttendancePage() {
  const [tab, setTab] = useState<TabId>('dia');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tabs
        value={tab}
        onChange={(id) => setTab(id as TabId)}
        items={[
          { id: 'dia', label: 'Por día' },
          { id: 'mensual', label: 'Mensual' },
        ]}
      />
      {tab === 'dia' ? <DayTab /> : <MonthlyTab />}
    </div>
  );
}
