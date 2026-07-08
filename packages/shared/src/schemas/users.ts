import { z } from 'zod';
import { USER_ROLES, USER_STATUSES } from '../enums';
import { PERMISSION_MODULES, type Permissions } from '../permissions';

export const usernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9._-]+$/, 'Solo minúsculas, números, punto, guion y guion bajo');

// Valida el objeto Permissions completo: cada módulo → { ver, editar }.
const permissionsShape = Object.fromEntries(
  PERMISSION_MODULES.map((m) => [m, z.object({ ver: z.boolean(), editar: z.boolean() })]),
) as Record<
  (typeof PERMISSION_MODULES)[number],
  z.ZodObject<{ ver: z.ZodBoolean; editar: z.ZodBoolean }>
>;

export const permissionsSchema: z.ZodType<Permissions> = z.object(permissionsShape);

export const userCreateSchema = z.object({
  fullName: z.string().min(3, 'Nombre muy corto'),
  username: usernameSchema,
  email: z.string().email('Correo inválido'),
  role: z.enum(USER_ROLES),
  permissions: permissionsSchema.optional(),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userCreateSchema.partial().extend({
  status: z.enum(USER_STATUSES).optional(),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
