import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type User } from '@prisma/client';
import { can, type Permissions } from '@elohim/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { type JwtUser } from '../../auth/decorators/current-user.decorator';
import { REQUIRE_PERMISSION_KEY, type RequiredPermission } from './require-permission.decorator';

// Guard global (segundo en la cadena): resuelve @RequirePermission consultando el usuario fresco.
// Expulsa a suspendidos aunque su cookie siga viva.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission | undefined>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtUser; fullUser?: User }>();
    const jwtUser = request.user;
    if (!jwtUser) throw new UnauthorizedException('No autenticado');

    const user = await this.prisma.user.findUnique({ where: { id: jwtUser.sub } });
    if (!user || user.status !== 'ACTIVO') throw new UnauthorizedException('No autenticado');

    if (!can(user.permissions as Permissions, required.module, required.action)) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }

    request.fullUser = user;
    return true;
  }
}
