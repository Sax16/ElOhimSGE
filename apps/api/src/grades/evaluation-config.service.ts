import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  type EvaluationAspectCreateInput,
  type EvaluationAspectUpdateInput,
  type CompetencyCreateInput,
  type CompetencyUpdateInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';

// Configuración → Evaluación (R4 — E2): catálogo de aspectos (formativos + del apoderado) y de
// competencias por curso. Permiso 'config'; las mutaciones exigen además rol ADMIN (aquí en el service).
@Injectable()
export class EvaluationConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private assertAdmin(actor: JwtUser) {
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede modificar la configuración de evaluación');
    }
  }

  // ===== Aspectos =====

  // GET /evaluation-config/aspects — ordenados por tipo (formativo antes que apoderado) y orden.
  async listAspects() {
    const aspects = await this.prisma.evaluationAspect.findMany({
      orderBy: [{ kind: 'asc' }, { order: 'asc' }],
      select: { id: true, kind: true, name: true, order: true, active: true },
    });
    return { aspects };
  }

  // POST /evaluation-config/aspects — order = max+1 dentro del tipo; 409 si el nombre ya existe.
  async createAspect(input: EvaluationAspectCreateInput, actor: JwtUser) {
    this.assertAdmin(actor);
    const last = await this.prisma.evaluationAspect.findFirst({
      where: { kind: input.kind },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (last?.order ?? 0) + 1;

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const row = await tx.evaluationAspect.create({
          data: { kind: input.kind, name: input.name, order },
          select: { id: true, kind: true, name: true, order: true, active: true },
        });
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'evaluation-config.aspect-create',
            entity: 'EvaluationAspect',
            entityId: row.id,
            payload: { kind: input.kind, name: input.name },
          },
          tx,
        );
        return row;
      });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un aspecto con ese nombre');
      }
      throw error;
    }
  }

  // PATCH /evaluation-config/aspects/:id — renombra y/o (des)activa. No se elimina.
  async updateAspect(id: string, input: EvaluationAspectUpdateInput, actor: JwtUser) {
    this.assertAdmin(actor);
    const existing = await this.prisma.evaluationAspect.findUnique({
      where: { id },
      select: { id: true, name: true, active: true },
    });
    if (!existing) throw new NotFoundException('Aspecto no encontrado');

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const row = await tx.evaluationAspect.update({
          where: { id },
          data: {
            ...(input.name !== undefined ? { name: input.name } : {}),
            ...(input.active !== undefined ? { active: input.active } : {}),
          },
          select: { id: true, kind: true, name: true, order: true, active: true },
        });
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'evaluation-config.aspect-update',
            entity: 'EvaluationAspect',
            entityId: id,
            payload: { name: input.name, active: input.active, previousName: existing.name },
          },
          tx,
        );
        return row;
      });
      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un aspecto con ese nombre');
      }
      throw error;
    }
  }

  // ===== Competencias =====

  // GET /evaluation-config/competencies?gradeLevelId= — cursos del grado con sus competencias.
  async listCompetencies(gradeLevelId: string) {
    const grade = await this.prisma.gradeLevel.findUnique({
      where: { id: gradeLevelId },
      select: { id: true },
    });
    if (!grade) throw new NotFoundException('Grado no encontrado');

    const courses = await this.prisma.course.findMany({
      where: { gradeLevelId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        competencies: { orderBy: { order: 'asc' }, select: { id: true, name: true, order: true } },
      },
    });

    return {
      courses: courses.map((c) => ({
        courseId: c.id,
        courseName: c.name,
        competencies: c.competencies,
      })),
    };
  }

  // POST /evaluation-config/competencies — order = max+1 del curso; 409 si el nombre ya existe.
  async createCompetency(input: CompetencyCreateInput, actor: JwtUser) {
    this.assertAdmin(actor);
    const course = await this.prisma.course.findUnique({
      where: { id: input.courseId },
      select: { id: true },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');

    const last = await this.prisma.courseCompetency.findFirst({
      where: { courseId: input.courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = (last?.order ?? 0) + 1;

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const row = await tx.courseCompetency.create({
          data: { courseId: input.courseId, name: input.name, order },
          select: { id: true, name: true, order: true },
        });
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'evaluation-config.competency-create',
            entity: 'CourseCompetency',
            entityId: row.id,
            payload: { courseId: input.courseId, name: input.name },
          },
          tx,
        );
        return row;
      });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe una competencia con ese nombre en el curso');
      }
      throw error;
    }
  }

  // PATCH /evaluation-config/competencies/:id — renombra.
  async updateCompetency(id: string, input: CompetencyUpdateInput, actor: JwtUser) {
    this.assertAdmin(actor);
    const existing = await this.prisma.courseCompetency.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) throw new NotFoundException('Competencia no encontrada');

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const row = await tx.courseCompetency.update({
          where: { id },
          data: { name: input.name },
          select: { id: true, name: true, order: true },
        });
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'evaluation-config.competency-update',
            entity: 'CourseCompetency',
            entityId: id,
            payload: { name: input.name, previousName: existing.name },
          },
          tx,
        );
        return row;
      });
      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe una competencia con ese nombre en el curso');
      }
      throw error;
    }
  }

  // DELETE /evaluation-config/competencies/:id — solo si no tiene notas registradas (si no → 409).
  async removeCompetency(id: string, actor: JwtUser) {
    this.assertAdmin(actor);
    const existing = await this.prisma.courseCompetency.findUnique({
      where: { id },
      select: { id: true, courseId: true, name: true, _count: { select: { gradeEntries: true } } },
    });
    if (!existing) throw new NotFoundException('Competencia no encontrada');
    if (existing._count.gradeEntries > 0) {
      throw new ConflictException('No se puede eliminar: la competencia ya tiene notas registradas');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.courseCompetency.delete({ where: { id } });
      await this.audit.log(
        {
          userId: actor.sub,
          action: 'evaluation-config.competency-delete',
          entity: 'CourseCompetency',
          entityId: id,
          payload: { courseId: existing.courseId, name: existing.name },
        },
        tx,
      );
    });
  }
}
