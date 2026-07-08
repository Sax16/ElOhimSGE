import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { type JwtUser } from './decorators/current-user.decorator';

// Guard global (primero en la cadena): valida el JWT de la cookie. No consulta la BD.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ cookies?: Record<string, string>; user?: JwtUser }>();
    const token = request.cookies?.['sge_token'];
    if (!token) throw new UnauthorizedException('No autenticado');

    try {
      const payload = await this.jwtService.verifyAsync<JwtUser>(token);
      request.user = { sub: payload.sub, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
  }
}
