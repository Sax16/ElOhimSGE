import { useEffect } from 'react';

/** Injects a component's CSS once per document. */
export function useStyleOnce(id: string, css: string): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  }, [id, css]);
}
