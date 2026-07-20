// Envoltura común de las páginas del portal: contenedor centrado mobile-first,
// selector de hijo arriba, y los estados de carga / sin-hijos resueltos una vez.
// Pasa el hijo seleccionado (garantizado no-nulo) al render prop.
import type { ReactNode } from 'react';
import { Card, EmptyState, Icons } from '@elohim/ui';
import { ChildSelector } from './ChildSelector';
import { usePortalChild } from './usePortalChild';
import type { PortalStudent } from './types';
import './portal.css';

export function PortalShell({
  children,
  header,
}: {
  /** Render con el hijo seleccionado (siempre presente). */
  children: (child: PortalStudent) => ReactNode;
  /** Nodo opcional por encima del selector (p. ej. el saludo de inicio). */
  header?: ReactNode;
}) {
  const { isLoading, students, selected } = usePortalChild();

  if (isLoading && students.length === 0) {
    return (
      <div className="pt">
        <div style={{ padding: 24, color: 'var(--text-muted)', font: 'var(--type-body)' }}>
          Cargando…
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="pt">
        {header}
        <Card>
          <EmptyState
            icon={<Icons.Users />}
            title="Sin estudiantes vigentes"
            description="No tienes estudiantes con matrícula vigente — acércate a secretaría."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="pt">
      {header}
      <ChildSelector students={students} selected={selected} />
      {children(selected)}
    </div>
  );
}
