import { can, type ModulePermission, type PermissionModule } from '@elohim/shared';
import { useMe } from './useMe';

/** ¿El usuario actual puede `action` sobre `module`? Basado en me.permissions. */
export function useCan(module: PermissionModule, action: keyof ModulePermission = 'ver'): boolean {
  const { data: me } = useMe();
  return can(me?.permissions, module, action);
}
