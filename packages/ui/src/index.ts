// Design system Elohim SGE — port de design/components/** (Etapa 2).
// Los consumidores importan de '@elohim/ui' y enlazan '@elohim/ui/styles.css' una vez.

// forms
export * from './components/forms/Button';
export * from './components/forms/IconButton';
export * from './components/forms/Input';
export * from './components/forms/Textarea';
export * from './components/forms/Select';
export * from './components/forms/Checkbox';
export * from './components/forms/Radio';
export * from './components/forms/Switch';

// data
export * from './components/data/Card';
export * from './components/data/Badge';
export * from './components/data/Tag';
export * from './components/data/Avatar';
export * from './components/data/StatCard';
export * from './components/data/ProgressBar';
export * from './components/data/Table';

// feedback
export * from './components/feedback/Alert';
export * from './components/feedback/Toast';
export * from './components/feedback/Dialog';
export * from './components/feedback/Tooltip';
export * from './components/feedback/EmptyState';

// navigation
export * from './components/navigation/Sidebar';
export * from './components/navigation/Topbar';
export * from './components/navigation/Tabs';
export * from './components/navigation/Breadcrumb';
export * from './components/navigation/Pagination';

// toast de producción (reemplaza window.SGEToast del prototipo)
export * from './toast/ToastProvider';

// iconos estilo Lucide 1.8px (namespace: Icons.Dashboard, Icons.Users, …)
export * as Icons from './icons';

export { useStyleOnce } from './lib/useStyleOnce';
