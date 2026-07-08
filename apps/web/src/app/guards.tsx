import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@elohim/shared';
import { useMe } from '../lib/useMe';
import { HOME_BY_ROLE } from './nav';

/** Exige sesión activa. Mientras carga muestra un aviso simple; sin sesión redirige a /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: me, isLoading } = useMe();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)', font: 'var(--type-body)' }}>
        Cargando…
      </div>
    );
  }

  if (!me) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

/** Exige que el rol del usuario esté permitido; si no, lo lleva a su inicio. */
export function RequireRole({ allowedRoles, children }: { allowedRoles: UserRole[]; children: ReactNode }) {
  const { data: me } = useMe();

  if (!me) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(me.role)) return <Navigate to={HOME_BY_ROLE[me.role]} replace />;

  return <>{children}</>;
}
