import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export type JwtUser = { sub: string; role: string };

// Inyecta el payload del JWT ({ sub, role }) que el JwtAuthGuard dejó en request.user.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
    return request.user;
  },
);
