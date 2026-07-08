import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { type InstitutionUpdateInput } from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';

@Injectable()
export class InstitutionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  get() {
    return this.prisma.institution.findUnique({ where: { id: 1 } });
  }

  async update(input: InstitutionUpdateInput, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const institution = await tx.institution.update({
        where: { id: 1 },
        data: input,
      });
      await this.audit.log(
        {
          userId: actorId,
          action: 'institution.update',
          entity: 'Institution',
          entityId: '1',
          payload: input as Prisma.InputJsonValue,
        },
        tx,
      );
      return institution;
    });
  }
}
