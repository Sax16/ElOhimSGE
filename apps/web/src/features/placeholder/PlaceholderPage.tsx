import { EmptyState, Icons } from '@elohim/ui';

/** Marcador para módulos aún no construidos. El título/migas los pone el AppLayout. */
export function PlaceholderPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
      <EmptyState
        icon={<Icons.Settings />}
        title="Módulo en construcción"
        description="Este módulo llega en una próxima etapa."
      />
    </div>
  );
}
