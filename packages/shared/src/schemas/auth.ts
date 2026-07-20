import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
  remember: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

// POST /api/auth/change-password — cualquier usuario autenticado cambia su clave.
// Se usa también en el primer ingreso obligatorio (mustChangePassword).
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
