import * as React from 'react';
import { Toast, ToastStack } from '../components/feedback/Toast';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

/** Fire a toast. Same conceptual signature as the prototype's `window.SGEToast`. */
export type ToastFn = (tone: ToastTone, title: string, message?: string) => void;

export interface ToastContextValue {
  toast: ToastFn;
}

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children?: React.ReactNode;
}

/**
 * Global toast host. Renders a bottom-right ToastStack and exposes `toast()`
 * via `useToast()`. Replaces the prototype's `window.SGEToast` shell:
 * queue capped at 3 (`ts.slice(-2)` + the new one) and auto-dismiss at 4200ms.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback<ToastFn>((tone, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts.slice(-2), { id, tone, title, message }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4200);
  }, []);

  const value = React.useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack position="bottom-right">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            tone={t.tone}
            title={t.title}
            message={t.message}
            onClose={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
          />
        ))}
      </ToastStack>
    </ToastContext.Provider>
  );
}

/** Access the toast dispatcher. Must be used inside a `<ToastProvider>`. */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (ctx === null) {
    throw new Error('useToast debe usarse dentro de un <ToastProvider>.');
  }
  return ctx;
}
