// Placeholder de la Etapa 1: verifica la conexión con la API vía el proxy de Vite.
// El shell real (sidebar, topbar, login) llega en la Etapa 2.
import { useEffect, useState } from 'react';

export function App() {
  const [health, setHealth] = useState<'cargando' | 'ok' | 'error'>('cargando');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: { status: string; db: string }) =>
        setHealth(data.status === 'ok' && data.db === 'ok' ? 'ok' : 'error'),
      )
      .catch(() => setHealth('error'));
  }, []);

  return (
    <main style={{ fontFamily: 'system-ui', padding: '4rem', textAlign: 'center' }}>
      <h1>Elohim SGE</h1>
      <p>Sistema de Gestión Escolar — I.E.P. Elohim, Satipo</p>
      <p>
        API + base de datos:{' '}
        {health === 'cargando' ? 'verificando…' : health === 'ok' ? '✅ conectadas' : '❌ error'}
      </p>
    </main>
  );
}
