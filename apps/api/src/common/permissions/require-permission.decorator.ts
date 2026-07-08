import { SetMetadata } from '@nestjs/common';
import { type PermissionModule, type ModulePermission } from '@elohim/shared';

export const REQUIRE_PERMISSION_KEY = 'requirePermission';

export type RequiredPermission = {
  module: PermissionModule;
  action: keyof ModulePermission;
};

// Exige un permiso granular (módulo + acción) sobre el endpoint. Lo evalúa el PermissionsGuard.
export const RequirePermission = (module: PermissionModule, action: keyof ModulePermission) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, { module, action } satisfies RequiredPermission);
