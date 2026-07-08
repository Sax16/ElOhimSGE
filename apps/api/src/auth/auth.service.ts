import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { type Permissions, type UserRole, type UserStatus } from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';

// Shape público del usuario (respuesta de /me, login y listado de usuarios). NUNCA incluye passwordHash.
export type MeDto = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permissions;
  mustChangePassword: boolean;
};

export function toMeDto(user: User): MeDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    permissions: user.permissions as Permissions,
    mustChangePassword: user.mustChangePassword,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(identifier: string, password: string, remember: boolean) {
    const id = identifier.toLowerCase().trim();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: id }, { email: id }] },
    });

    // Mensaje idéntico en los 3 casos: no revelar cuál falló.
    if (!user || user.status === 'SUSPENDIDO' || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const expiresIn = remember ? '30d' : '12h';
    const maxAge = (remember ? 30 * 24 * 60 * 60 : 12 * 60 * 60) * 1000;
    const token = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      { expiresIn },
    );

    return { user: toMeDto(user), token, maxAge };
  }

  async me(userId: string): Promise<MeDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === 'SUSPENDIDO') throw new UnauthorizedException('No autenticado');
    return toMeDto(user);
  }
}
