import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Auditoría append-only: quién, qué, cuándo. Nunca se actualiza ni borra.
 * Acepta un cliente transaccional para registrar dentro de la misma $transaction.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    entry: {
      userId: string;
      action: string; // "enrollment.create", "section.update", "user.suspend"...
      entity: string;
      entityId: string;
      payload?: Prisma.InputJsonValue;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;
    await client.auditLog.create({ data: entry });
  }
}
