import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomInt } from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  DEFAULT_PERMISSIONS,
  type Permissions,
  type UserCreateInput,
  type UserUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { toMeDto, type MeDto } from '../auth/auth.service';

// Alfabeto sin caracteres ambiguos (0/O, 1/l/I) para contraseñas temporales legibles.
const TEMP_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function generateTempPassword(): string {
  let raw = '';
  for (let i = 0; i < 12; i++) {
    raw += TEMP_ALPHABET[randomInt(TEMP_ALPHABET.length)];
  }
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(): Promise<MeDto[]> {
    const users = await this.prisma.user.findMany({ orderBy: { fullName: 'asc' } });
    return users.map(toMeDto);
  }

  async create(input: UserCreateInput, actorId: string): Promise<MeDto & { tempPassword: string }> {
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const permissions = (input.permissions ?? DEFAULT_PERMISSIONS[input.role]) as Prisma.InputJsonValue;
    const username = input.username.toLowerCase();
    const email = input.email.toLowerCase();

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            fullName: input.fullName,
            username,
            email,
            role: input.role,
            permissions,
            passwordHash,
            mustChangePassword: true,
          },
        });
        await this.audit.log(
          {
            userId: actorId,
            action: 'user.create',
            entity: 'User',
            entityId: user.id,
            payload: { username, email, fullName: input.fullName, role: input.role },
          },
          tx,
        );
        return user;
      });
      return { ...toMeDto(created), tempPassword };
    } catch (error) {
      throw this.mapConflict(error);
    }
  }

  async update(id: string, input: UserUpdateInput, actorId: string): Promise<MeDto> {
    if (input.status === 'SUSPENDIDO' && id === actorId) {
      throw new BadRequestException('No puedes suspender tu propia cuenta');
    }

    const data: Prisma.UserUpdateInput = {};
    if (input.fullName !== undefined) data.fullName = input.fullName;
    if (input.username !== undefined) data.username = input.username.toLowerCase();
    if (input.email !== undefined) data.email = input.email.toLowerCase();
    if (input.role !== undefined) data.role = input.role;
    if (input.permissions !== undefined) data.permissions = input.permissions as Prisma.InputJsonValue;
    if (input.status !== undefined) data.status = input.status;

    const suspending = input.status === 'SUSPENDIDO';

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({ where: { id }, data });
        await this.audit.log(
          {
            userId: actorId,
            action: suspending ? 'user.suspend' : 'user.update',
            entity: 'User',
            entityId: id,
            payload: this.changedPayload(input),
          },
          tx,
        );
        return user;
      });
      return toMeDto(updated);
    } catch (error) {
      throw this.mapConflict(error);
    }
  }

  async resetPassword(id: string, actorId: string): Promise<{ tempPassword: string }> {
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { passwordHash, mustChangePassword: true },
      });
      await this.audit.log(
        { userId: actorId, action: 'user.reset_password', entity: 'User', entityId: id },
        tx,
      );
    });

    return { tempPassword };
  }

  private changedPayload(input: UserUpdateInput): Prisma.InputJsonValue {
    const payload: Record<string, unknown> = {};
    if (input.fullName !== undefined) payload.fullName = input.fullName;
    if (input.username !== undefined) payload.username = input.username.toLowerCase();
    if (input.email !== undefined) payload.email = input.email.toLowerCase();
    if (input.role !== undefined) payload.role = input.role;
    if (input.permissions !== undefined) payload.permissions = input.permissions as Permissions;
    if (input.status !== undefined) payload.status = input.status;
    return payload as Prisma.InputJsonValue;
  }

  private mapConflict(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new ConflictException('El usuario o correo ya existe');
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return new NotFoundException('Usuario no encontrado');
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
