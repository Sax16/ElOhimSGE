import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  COURSE_CONDITION_LABELS,
  GRADE_LETTER_LABELS,
  computeCourseResult,
  courseCondition,
  type AspectsSaveInput,
  type GradeLetter,
  type GradeSheetSaveInput,
} from '@elohim/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit/audit.service';
import { type JwtUser } from '../auth/decorators/current-user.decorator';
import { buildActaWorkbook } from './grades.xlsx';
import {
  gradeLabel,
  sectionFullLabel,
  type SectionLabelParts,
} from '../student-attendance/section-label.util';

const YEAR_CLOSED_MESSAGE = 'El año académico está cerrado — solo lectura';

// Sección con lo necesario para etiqueta, tutor y año.
const sectionSelect = {
  id: true,
  name: true,
  shift: true,
  tutorId: true,
  gradeLevelId: true,
  gradeLevel: {
    select: {
      name: true,
      level: {
        select: {
          name: true,
          academicYearId: true,
          academicYear: { select: { status: true, name: true } },
        },
      },
    },
  },
} satisfies Prisma.SectionSelect;

type SectionRow = Prisma.SectionGetPayload<{ select: typeof sectionSelect }>;

const periodSelect = {
  id: true,
  name: true,
  order: true,
  status: true,
  startDate: true,
  endDate: true,
  academicYearId: true,
  academicYear: { select: { status: true, name: true } },
} satisfies Prisma.PeriodSelect;

type PeriodRow = Prisma.PeriodGetPayload<{ select: typeof periodSelect }>;

// Matrícula del roster: alumno con apellidos + nombres.
const rosterEnrollmentSelect = {
  id: true,
  student: {
    select: { code: true, firstNames: true, paternalLastName: true, maternalLastName: true },
  },
} satisfies Prisma.EnrollmentSelect;

const rosterOrderBy: Prisma.EnrollmentOrderByWithRelationInput[] = [
  { student: { paternalLastName: 'asc' } },
  { student: { maternalLastName: 'asc' } },
  { student: { firstNames: 'asc' } },
];

const rosterWhere = (sectionId: string, yearId: string): Prisma.EnrollmentWhereInput => ({
  sectionId,
  canceledAt: null,
  academicYearId: yearId,
  student: { status: { in: ['ACTIVO', 'BECADO'] } },
});

// "Quispe Roca, María" — apellidos, nombres.
function fullName(s: { paternalLastName: string; maternalLastName: string | null; firstNames: string }): string {
  const last = [s.paternalLastName, s.maternalLastName].filter(Boolean).join(' ');
  return `${last}, ${s.firstNames}`;
}

@Injectable()
export class GradesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ===== Utilidades comunes =====

  private isAdmin(actor: JwtUser): boolean {
    return actor.role === 'ADMIN';
  }

  private async activeYear() {
    const year = await this.prisma.academicYear.findFirst({
      where: { status: 'ACTIVO' },
      select: { id: true, name: true, startDate: true, endDate: true },
    });
    if (!year) throw new NotFoundException('No hay un año académico activo');
    return year;
  }

  private label(s: SectionLabelParts): string {
    return sectionFullLabel(s);
  }

  private async loadSection(sectionId: string): Promise<SectionRow> {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId }, select: sectionSelect });
    if (!section) throw new NotFoundException('Sección no encontrada');
    return section;
  }

  private async loadPeriod(periodId: string): Promise<PeriodRow> {
    const period = await this.prisma.period.findUnique({ where: { id: periodId }, select: periodSelect });
    if (!period) throw new NotFoundException('Periodo no encontrado');
    return period;
  }

  // ¿El docente tiene la asignación exacta curso×sección? (fuente de verdad de "qué dicta").
  private async hasCourseAssignment(actor: JwtUser, courseId: string, sectionId: string): Promise<boolean> {
    const a = await this.prisma.courseAssignment.findFirst({
      where: { courseId, sectionId, teacherId: actor.sub },
      select: { id: true },
    });
    return Boolean(a);
  }

  // ¿El docente es tutor de la sección o tiene alguna asignación en ella? (para ver aspectos/libreta).
  private async ownsSectionAny(actor: JwtUser, section: SectionRow): Promise<boolean> {
    if (section.tutorId === actor.sub) return true;
    const a = await this.prisma.courseAssignment.findFirst({
      where: { sectionId: section.id, teacherId: actor.sub },
      select: { id: true },
    });
    return Boolean(a);
  }

  // Editabilidad de una hoja: año ACTIVO + periodo no PROXIMO + rol habilitado; CERRADO solo ADMIN.
  private computeEditable(actor: JwtUser, period: PeriodRow, canEditByRole: boolean): boolean {
    if (period.academicYear.status === 'CERRADO') return false;
    if (period.status === 'PROXIMO') return false;
    if (!canEditByRole) return false;
    if (period.status === 'CERRADO') return this.isAdmin(actor);
    return true; // EN_CURSO
  }

  // Valida que se pueda mutar el periodo (lanza según el caso). Devuelve si es corrección de CERRADO.
  private assertCanMutate(
    actor: JwtUser,
    period: PeriodRow,
    canEditByRole: boolean,
    reason: string | undefined,
    roleErrorMessage: string,
  ): { isCorrection: boolean } {
    if (period.academicYear.status === 'CERRADO') {
      throw new ConflictException(YEAR_CLOSED_MESSAGE);
    }
    if (period.status === 'PROXIMO') {
      throw new UnprocessableEntityException('No puedes registrar notas de un periodo próximo');
    }
    if (!canEditByRole) {
      throw new ForbiddenException(roleErrorMessage);
    }
    if (period.status === 'CERRADO') {
      if (!this.isAdmin(actor)) {
        throw new ForbiddenException('Solo un administrador puede corregir un periodo cerrado');
      }
      if (!reason || reason.trim().length < 10) {
        throw new UnprocessableEntityException(
          'Para corregir un periodo cerrado indica una justificación de al menos 10 caracteres',
        );
      }
      return { isCorrection: true };
    }
    return { isCorrection: false };
  }

  // ===== GET /grades/my-courses =====

  async myCourses(actor: JwtUser, periodId?: string) {
    const year = await this.activeYear();
    const period = periodId ? await this.loadPeriod(periodId) : await this.currentPeriod(year.id);

    const assignments = await this.prisma.courseAssignment.findMany({
      where: {
        section: { gradeLevel: { level: { academicYearId: year.id } } },
        ...(this.isAdmin(actor) ? {} : { teacherId: actor.sub }),
      },
      orderBy: [
        { course: { gradeLevel: { level: { order: 'asc' } } } },
        { course: { gradeLevel: { order: 'asc' } } },
        { section: { name: 'asc' } },
        { course: { name: 'asc' } },
      ],
      select: {
        courseId: true,
        sectionId: true,
        course: {
          select: {
            name: true,
            _count: { select: { competencies: true } },
          },
        },
        section: { select: sectionSelect },
      },
    });

    // Conteos de alumnos por sección y de notas por (curso, sección) para el periodo.
    const sectionIds = [...new Set(assignments.map((a) => a.sectionId))];
    const studentCounts = await this.prisma.enrollment.groupBy({
      by: ['sectionId'],
      where: {
        sectionId: { in: sectionIds },
        canceledAt: null,
        academicYearId: year.id,
        student: { status: { in: ['ACTIVO', 'BECADO'] } },
      },
      _count: { _all: true },
    });
    const studentBySection = new Map(studentCounts.map((c) => [c.sectionId, c._count._all]));

    // Notas registradas por (curso, sección): GradeEntry del periodo cuyas matrículas caen en la sección.
    const filledByCourseSection = new Map<string, number>();
    await Promise.all(
      assignments.map(async (a) => {
        const key = `${a.courseId}|${a.sectionId}`;
        if (filledByCourseSection.has(key)) return;
        const n = await this.prisma.gradeEntry.count({
          where: { periodId: period.id, courseId: a.courseId, enrollment: { sectionId: a.sectionId } },
        });
        filledByCourseSection.set(key, n);
      }),
    );

    const courses = assignments.map((a) => {
      const students = studentBySection.get(a.sectionId) ?? 0;
      const competencies = a.course._count.competencies;
      const filled = filledByCourseSection.get(`${a.courseId}|${a.sectionId}`) ?? 0;
      return {
        sectionId: a.sectionId,
        sectionLabel: this.label(a.section),
        courseId: a.courseId,
        courseName: a.course.name,
        students,
        filled,
        total: students * competencies,
      };
    });

    return {
      period: { id: period.id, name: period.name },
      courses,
    };
  }

  // ===== GET /grades/periods =====
  // Bimestres del año (activo por defecto) para los selectores de Notas: el
  // DOCENTE no tiene permiso `estructura`, así que no puede usar la ruta de
  // estructura académica.
  async periods(yearId?: string) {
    const year = yearId
      ? await this.prisma.academicYear.findUnique({ where: { id: yearId }, select: { id: true } })
      : await this.activeYear();
    if (!year) throw new NotFoundException('Año académico no encontrado');
    return this.prisma.period.findMany({
      where: { academicYearId: year.id },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, order: true, status: true },
    });
  }

  // Periodo por defecto: EN_CURSO del año activo; si no hay, el de mayor orden CERRADO; si no, el primero.
  private async currentPeriod(yearId: string): Promise<PeriodRow> {
    const enCurso = await this.prisma.period.findFirst({
      where: { academicYearId: yearId, status: 'EN_CURSO' },
      select: periodSelect,
    });
    if (enCurso) return enCurso;
    const fallback = await this.prisma.period.findFirst({
      where: { academicYearId: yearId },
      orderBy: { order: 'asc' },
      select: periodSelect,
    });
    if (!fallback) throw new NotFoundException('El año activo no tiene periodos configurados');
    return fallback;
  }

  // ===== GET /grades/sheet =====

  async sheet(actor: JwtUser, sectionId: string, courseId: string, periodId: string) {
    const year = await this.activeYear();
    const [section, course, period] = await Promise.all([
      this.loadSection(sectionId),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, name: true, gradeLevelId: true },
      }),
      this.loadPeriod(periodId),
    ]);
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (course.gradeLevelId !== section.gradeLevelId) {
      throw new UnprocessableEntityException('El curso no pertenece al grado de la sección');
    }

    const canEditByRole = this.isAdmin(actor) || (await this.hasCourseAssignment(actor, courseId, sectionId));
    if (!canEditByRole) {
      // Solo puede ver quien tiene la asignación (o Admin). Sin asignación → 403.
      throw new ForbiddenException('No tienes esta asignación');
    }

    const [competencies, enrollments] = await Promise.all([
      this.prisma.courseCompetency.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
        select: { id: true, name: true, order: true },
      }),
      this.prisma.enrollment.findMany({
        where: rosterWhere(sectionId, year.id),
        orderBy: rosterOrderBy,
        select: rosterEnrollmentSelect,
      }),
    ]);

    const [entries, results] = await Promise.all([
      this.prisma.gradeEntry.findMany({
        where: { courseId, periodId, enrollment: { sectionId } },
        select: { enrollmentId: true, competencyId: true, letter: true },
      }),
      this.prisma.courseResult.findMany({
        where: { courseId, periodId, enrollment: { sectionId } },
        select: { enrollmentId: true, letter: true, auto: true },
      }),
    ]);

    // enrollmentId → competencyId → letter.
    const lettersByEnrollment = new Map<string, Map<string, GradeLetter>>();
    for (const e of entries) {
      const map = lettersByEnrollment.get(e.enrollmentId) ?? new Map<string, GradeLetter>();
      map.set(e.competencyId, e.letter);
      lettersByEnrollment.set(e.enrollmentId, map);
    }
    const resultByEnrollment = new Map(results.map((r) => [r.enrollmentId, { letter: r.letter, auto: r.auto }]));

    const students = enrollments.map((e) => {
      const map = lettersByEnrollment.get(e.id);
      const letters: Record<string, GradeLetter | null> = {};
      for (const c of competencies) letters[c.id] = map?.get(c.id) ?? null;
      return {
        enrollmentId: e.id,
        studentCode: e.student.code,
        fullName: fullName(e.student),
        letters,
        result: resultByEnrollment.get(e.id) ?? null,
      };
    });

    return {
      section: { id: section.id, label: this.label(section) },
      course: { id: course.id, name: course.name },
      period: { id: period.id, name: period.name, status: period.status },
      editable: this.computeEditable(actor, period, canEditByRole),
      competencies,
      students,
      progress: { filled: entries.length, total: enrollments.length * competencies.length },
    };
  }

  // ===== PUT /grades/sheet =====

  async saveSheet(input: GradeSheetSaveInput, actor: JwtUser) {
    const year = await this.activeYear();
    const [section, course, period] = await Promise.all([
      this.loadSection(input.sectionId),
      this.prisma.course.findUnique({
        where: { id: input.courseId },
        select: { id: true, name: true, gradeLevelId: true },
      }),
      this.loadPeriod(input.periodId),
    ]);
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (course.gradeLevelId !== section.gradeLevelId) {
      throw new UnprocessableEntityException('El curso no pertenece al grado de la sección');
    }
    if (section.gradeLevel.level.academicYearId !== year.id || period.academicYearId !== year.id) {
      throw new BadRequestException('La sección o el periodo no pertenecen al año académico activo');
    }

    const canEditByRole = this.isAdmin(actor) || (await this.hasCourseAssignment(actor, input.courseId, input.sectionId));
    const { isCorrection } = this.assertCanMutate(
      actor,
      period,
      canEditByRole,
      input.reason,
      'No tienes esta asignación',
    );

    // Validación de pertenencia: matrículas vigentes de la sección y competencias del curso.
    const [validEnrollments, validCompetencies] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { sectionId: input.sectionId, canceledAt: null, academicYearId: year.id },
        select: { id: true },
      }),
      this.prisma.courseCompetency.findMany({ where: { courseId: input.courseId }, select: { id: true } }),
    ]);
    const validEnrollmentIds = new Set(validEnrollments.map((e) => e.id));
    const validCompetencyIds = new Set(validCompetencies.map((c) => c.id));
    for (const e of input.entries) {
      if (!validEnrollmentIds.has(e.enrollmentId)) {
        throw new BadRequestException('Una de las matrículas no pertenece a la sección');
      }
      if (!validCompetencyIds.has(e.competencyId)) {
        throw new BadRequestException('Una de las competencias no pertenece al curso');
      }
    }
    const touched = new Set<string>(input.entries.map((e) => e.enrollmentId));

    // Estado previo (para auditoría de corrección en periodo CERRADO).
    const beforeEntries = await this.prisma.gradeEntry.findMany({
      where: { courseId: input.courseId, periodId: input.periodId, enrollment: { sectionId: input.sectionId } },
      select: { enrollmentId: true, competencyId: true, letter: true },
    });
    const beforeMap = new Map(beforeEntries.map((e) => [`${e.enrollmentId}|${e.competencyId}`, e.letter]));

    const result = await this.prisma.$transaction(async (tx) => {
      let saved = 0;
      let removed = 0;
      const changes: { enrollmentId: string; competencyId: string; old: GradeLetter | null; new: GradeLetter | null }[] = [];

      for (const e of input.entries) {
        const old = beforeMap.get(`${e.enrollmentId}|${e.competencyId}`) ?? null;
        if (e.letter === null) {
          if (old !== null) {
            await tx.gradeEntry.deleteMany({
              where: {
                enrollmentId: e.enrollmentId,
                courseId: input.courseId,
                periodId: input.periodId,
                competencyId: e.competencyId,
              },
            });
            removed += 1;
            changes.push({ enrollmentId: e.enrollmentId, competencyId: e.competencyId, old, new: null });
          }
          continue;
        }
        await tx.gradeEntry.upsert({
          where: {
            enrollmentId_courseId_periodId_competencyId: {
              enrollmentId: e.enrollmentId,
              courseId: input.courseId,
              periodId: input.periodId,
              competencyId: e.competencyId,
            },
          },
          create: {
            enrollmentId: e.enrollmentId,
            courseId: input.courseId,
            periodId: input.periodId,
            competencyId: e.competencyId,
            letter: e.letter,
            gradedById: actor.sub,
          },
          update: { letter: e.letter, gradedById: actor.sub },
        });
        saved += 1;
        if (old !== e.letter) {
          changes.push({ enrollmentId: e.enrollmentId, competencyId: e.competencyId, old, new: e.letter });
        }
      }

      // El logro del bimestre es SIEMPRE automático (regla de negocio): se
      // recalcula para cada enrollment tocado, incluso si alguna fila quedó
      // con un ajuste manual antiguo (auto=false) — el guardado la normaliza.
      for (const enrollmentId of touched) {
        await this.recomputeAutoResult(tx, input.courseId, input.periodId, enrollmentId, actor.sub);
      }

      await this.audit.log(
        {
          userId: actor.sub,
          action: 'grades.save',
          entity: 'Section',
          entityId: input.sectionId,
          payload: { courseId: input.courseId, periodId: input.periodId, saved, removed, touched: touched.size },
        },
        tx,
      );
      if (isCorrection) {
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'grades.correct',
            entity: 'Section',
            entityId: input.sectionId,
            payload: {
              courseId: input.courseId,
              periodId: input.periodId,
              reason: input.reason,
              changes,
            },
          },
          tx,
        );
      }

      // Estado final de los resultados de los enrollments tocados.
      const finalResults = await tx.courseResult.findMany({
        where: {
          courseId: input.courseId,
          periodId: input.periodId,
          enrollmentId: { in: [...touched] },
        },
        select: { enrollmentId: true, letter: true, auto: true },
      });
      const finalMap = new Map(finalResults.map((r) => [r.enrollmentId, { letter: r.letter, auto: r.auto }]));
      const results = [...touched].map((enrollmentId) => {
        const r = finalMap.get(enrollmentId);
        return {
          enrollmentId,
          letter: r?.letter ?? null,
          auto: r?.auto ?? true,
        };
      });

      return { saved, removed, results };
    });

    return result;
  }

  // Upsert de CourseResult con letra y flag auto.
  private async upsertResult(
    tx: Prisma.TransactionClient,
    courseId: string,
    periodId: string,
    enrollmentId: string,
    letter: GradeLetter,
    auto: boolean,
    userId: string,
  ) {
    await tx.courseResult.upsert({
      where: { enrollmentId_courseId_periodId: { enrollmentId, courseId, periodId } },
      create: { enrollmentId, courseId, periodId, letter, auto, gradedById: userId },
      update: { letter, auto, gradedById: userId },
    });
  }

  // Recalcula el logro automático a partir de las competencias; si no hay notas, borra el resultado.
  private async recomputeAutoResult(
    tx: Prisma.TransactionClient,
    courseId: string,
    periodId: string,
    enrollmentId: string,
    userId: string,
  ) {
    const entries = await tx.gradeEntry.findMany({
      where: { enrollmentId, courseId, periodId },
      select: { letter: true },
    });
    const auto = computeCourseResult(entries.map((e) => e.letter));
    if (auto === null) {
      await tx.courseResult.deleteMany({ where: { enrollmentId, courseId, periodId } });
      return;
    }
    await this.upsertResult(tx, courseId, periodId, enrollmentId, auto, true, userId);
  }

  // ===== GET /grades/aspects-sheet =====

  async aspectsSheet(actor: JwtUser, sectionId: string, periodId: string) {
    const year = await this.activeYear();
    const [section, period] = await Promise.all([this.loadSection(sectionId), this.loadPeriod(periodId)]);

    const isTutor = section.tutorId === actor.sub;
    if (!this.isAdmin(actor) && !isTutor && !(await this.ownsSectionAny(actor, section))) {
      throw new ForbiddenException('No tienes acceso a esta sección');
    }

    const canEditByRole = this.isAdmin(actor) || isTutor;

    const [aspects, enrollments] = await Promise.all([
      this.prisma.evaluationAspect.findMany({
        where: { active: true },
        orderBy: [{ kind: 'asc' }, { order: 'asc' }],
        select: { id: true, kind: true, name: true, order: true },
      }),
      this.prisma.enrollment.findMany({
        where: rosterWhere(sectionId, year.id),
        orderBy: rosterOrderBy,
        select: rosterEnrollmentSelect,
      }),
    ]);

    const grades = await this.prisma.aspectGrade.findMany({
      where: { periodId, enrollment: { sectionId } },
      select: { enrollmentId: true, aspectId: true, letter: true },
    });
    const byEnrollment = new Map<string, Map<string, GradeLetter>>();
    for (const g of grades) {
      const map = byEnrollment.get(g.enrollmentId) ?? new Map<string, GradeLetter>();
      map.set(g.aspectId, g.letter);
      byEnrollment.set(g.enrollmentId, map);
    }

    const students = enrollments.map((e) => {
      const map = byEnrollment.get(e.id);
      const letters: Record<string, GradeLetter | null> = {};
      for (const a of aspects) letters[a.id] = map?.get(a.id) ?? null;
      return {
        enrollmentId: e.id,
        studentCode: e.student.code,
        fullName: fullName(e.student),
        letters,
      };
    });

    return {
      section: { id: section.id, label: this.label(section) },
      period: { id: period.id, name: period.name, status: period.status },
      editable: this.computeEditable(actor, period, canEditByRole),
      isTutor,
      aspects,
      students,
    };
  }

  // ===== PUT /grades/aspects =====

  async saveAspects(input: AspectsSaveInput, actor: JwtUser) {
    const year = await this.activeYear();
    const [section, period] = await Promise.all([this.loadSection(input.sectionId), this.loadPeriod(input.periodId)]);
    if (section.gradeLevel.level.academicYearId !== year.id || period.academicYearId !== year.id) {
      throw new BadRequestException('La sección o el periodo no pertenecen al año académico activo');
    }

    const isTutor = section.tutorId === actor.sub;
    const canEditByRole = this.isAdmin(actor) || isTutor;
    const { isCorrection } = this.assertCanMutate(
      actor,
      period,
      canEditByRole,
      input.reason,
      'Solo el tutor del aula o un administrador registran los aspectos',
    );

    const [validEnrollments, validAspects] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { sectionId: input.sectionId, canceledAt: null, academicYearId: year.id },
        select: { id: true },
      }),
      this.prisma.evaluationAspect.findMany({ where: { active: true }, select: { id: true } }),
    ]);
    const validEnrollmentIds = new Set(validEnrollments.map((e) => e.id));
    const validAspectIds = new Set(validAspects.map((a) => a.id));
    for (const e of input.entries) {
      if (!validEnrollmentIds.has(e.enrollmentId)) {
        throw new BadRequestException('Una de las matrículas no pertenece a la sección');
      }
      if (!validAspectIds.has(e.aspectId)) {
        throw new BadRequestException('Uno de los aspectos no es válido');
      }
    }

    const beforeGrades = await this.prisma.aspectGrade.findMany({
      where: { periodId: input.periodId, enrollment: { sectionId: input.sectionId } },
      select: { enrollmentId: true, aspectId: true, letter: true },
    });
    const beforeMap = new Map(beforeGrades.map((g) => [`${g.enrollmentId}|${g.aspectId}`, g.letter]));

    const result = await this.prisma.$transaction(async (tx) => {
      let saved = 0;
      let removed = 0;
      const changes: { enrollmentId: string; aspectId: string; old: GradeLetter | null; new: GradeLetter | null }[] = [];

      for (const e of input.entries) {
        const old = beforeMap.get(`${e.enrollmentId}|${e.aspectId}`) ?? null;
        if (e.letter === null) {
          if (old !== null) {
            await tx.aspectGrade.deleteMany({
              where: { enrollmentId: e.enrollmentId, periodId: input.periodId, aspectId: e.aspectId },
            });
            removed += 1;
            changes.push({ enrollmentId: e.enrollmentId, aspectId: e.aspectId, old, new: null });
          }
          continue;
        }
        await tx.aspectGrade.upsert({
          where: {
            enrollmentId_periodId_aspectId: {
              enrollmentId: e.enrollmentId,
              periodId: input.periodId,
              aspectId: e.aspectId,
            },
          },
          create: {
            enrollmentId: e.enrollmentId,
            periodId: input.periodId,
            aspectId: e.aspectId,
            letter: e.letter,
            gradedById: actor.sub,
          },
          update: { letter: e.letter, gradedById: actor.sub },
        });
        saved += 1;
        if (old !== e.letter) {
          changes.push({ enrollmentId: e.enrollmentId, aspectId: e.aspectId, old, new: e.letter });
        }
      }

      await this.audit.log(
        {
          userId: actor.sub,
          action: 'grades.aspects-save',
          entity: 'Section',
          entityId: input.sectionId,
          payload: { periodId: input.periodId, saved, removed },
        },
        tx,
      );
      if (isCorrection) {
        await this.audit.log(
          {
            userId: actor.sub,
            action: 'grades.correct',
            entity: 'Section',
            entityId: input.sectionId,
            payload: { periodId: input.periodId, reason: input.reason, changes },
          },
          tx,
        );
      }

      return { saved, removed };
    });

    return result;
  }

  // ===== GET /grades/report-card =====

  async reportCard(actor: JwtUser, enrollmentId: string, periodId: string) {
    // Regla de negocio (jul 2026): la libreta solo la ve/imprime el ADMIN.
    if (actor.role !== 'ADMIN') {
      throw new ForbiddenException('Solo administración puede ver e imprimir libretas');
    }
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        academicYearId: true,
        student: { select: { code: true, firstNames: true, paternalLastName: true, maternalLastName: true } },
        section: {
          select: {
            ...sectionSelect,
            tutor: { select: { fullName: true } },
          },
        },
      },
    });
    if (!enrollment) throw new NotFoundException('Matrícula no encontrada');
    const section = enrollment.section;

    const period = await this.loadPeriod(periodId);

    // Los 4 periodos del año de la matrícula.
    const periods = await this.prisma.period.findMany({
      where: { academicYearId: enrollment.academicYearId },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, order: true, status: true },
    });
    const periodIds = periods.map((p) => p.id);

    // Cursos del grado (orden alfabético).
    const courses = await this.prisma.course.findMany({
      where: { gradeLevelId: section.gradeLevelId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    // Resultados del estudiante por curso × periodo.
    const results = await this.prisma.courseResult.findMany({
      where: { enrollmentId, periodId: { in: periodIds } },
      select: { courseId: true, periodId: true, letter: true, auto: true },
    });
    const resultMap = new Map(results.map((r) => [`${r.courseId}|${r.periodId}`, { letter: r.letter, auto: r.auto }]));

    const coursesDto = courses.map((c) => {
      const byPeriod: Record<string, { letter: GradeLetter; auto: boolean } | null> = {};
      for (const p of periods) byPeriod[p.id] = resultMap.get(`${c.id}|${p.id}`) ?? null;
      return { courseId: c.id, courseName: c.name, byPeriod };
    });

    // Aspectos: activos + los inactivos que tengan alguna nota del estudiante (para no perder histórico).
    const [activeAspects, aspectGrades] = await Promise.all([
      this.prisma.evaluationAspect.findMany({
        where: { active: true },
        orderBy: [{ kind: 'asc' }, { order: 'asc' }],
        select: { id: true, kind: true, name: true, order: true },
      }),
      this.prisma.aspectGrade.findMany({
        where: { enrollmentId, periodId: { in: periodIds } },
        select: { aspectId: true, periodId: true, letter: true, aspect: { select: { id: true, kind: true, name: true, order: true } } },
      }),
    ]);
    const aspectById = new Map(activeAspects.map((a) => [a.id, a]));
    for (const g of aspectGrades) {
      if (!aspectById.has(g.aspectId)) aspectById.set(g.aspectId, g.aspect);
    }
    const aspects = [...aspectById.values()].sort((a, b) =>
      a.kind === b.kind ? a.order - b.order : a.kind.localeCompare(b.kind),
    );
    const aspectGradeMap = new Map(aspectGrades.map((g) => [`${g.aspectId}|${g.periodId}`, g.letter]));
    const aspectsDto = aspects.map((a) => {
      const byPeriod: Record<string, GradeLetter | null> = {};
      for (const p of periods) byPeriod[p.id] = aspectGradeMap.get(`${a.id}|${p.id}`) ?? null;
      return { id: a.id, kind: a.kind, name: a.name, byPeriod };
    });

    // Asistencia del periodo solicitado (desde StudentAttendanceEntry entre start y endDate).
    const attendance = await this.attendanceForPeriod(enrollmentId, period.startDate, period.endDate);

    return {
      student: {
        code: enrollment.student.code,
        fullName: fullName(enrollment.student),
        gradeLabel: gradeLabel(section.gradeLevel.name, section.gradeLevel.level.name),
        sectionLabel: this.label(section as SectionLabelParts),
        tutorName: section.tutor?.fullName ?? null,
      },
      year: section.gradeLevel.level.academicYear.name,
      period: { id: period.id, name: period.name, order: period.order },
      periods,
      courses: coursesDto,
      aspects: aspectsDto,
      attendance,
    };
  }

  // ===== Portal del apoderado: notas de solo lectura, SOLO bimestres CERRADOS =====
  // Reutiliza la lógica de la libreta (reportCard) sin el header del alumno ni la asistencia,
  // devolviendo solo las letras por periodo. El logro del bimestre sigue siendo el CourseResult.
  async portalGrades(enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { id: true, academicYearId: true, section: { select: { gradeLevelId: true } } },
    });
    if (!enrollment) throw new NotFoundException('Matrícula no encontrada');

    // SOLO periodos CERRADOS del año, en orden.
    const periods = await this.prisma.period.findMany({
      where: { academicYearId: enrollment.academicYearId, status: 'CERRADO' },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, order: true },
    });
    if (periods.length === 0) return { periods: [], courses: [], aspects: [] };
    const periodIds = periods.map((p) => p.id);

    // Cursos del grado (orden alfabético) con el logro por periodo.
    const [courses, results] = await Promise.all([
      this.prisma.course.findMany({
        where: { gradeLevelId: enrollment.section.gradeLevelId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
      this.prisma.courseResult.findMany({
        where: { enrollmentId, periodId: { in: periodIds } },
        select: { courseId: true, periodId: true, letter: true },
      }),
    ]);
    const resultMap = new Map(results.map((r) => [`${r.courseId}|${r.periodId}`, r.letter]));
    const coursesDto = courses.map((c) => {
      const byPeriod: Record<string, GradeLetter | null> = {};
      for (const p of periods) byPeriod[p.id] = resultMap.get(`${c.id}|${p.id}`) ?? null;
      return { courseName: c.name, byPeriod };
    });

    // Aspectos: activos + inactivos con nota del estudiante (para no perder histórico).
    const [activeAspects, aspectGrades] = await Promise.all([
      this.prisma.evaluationAspect.findMany({
        where: { active: true },
        orderBy: [{ kind: 'asc' }, { order: 'asc' }],
        select: { id: true, kind: true, name: true, order: true },
      }),
      this.prisma.aspectGrade.findMany({
        where: { enrollmentId, periodId: { in: periodIds } },
        select: {
          aspectId: true,
          periodId: true,
          letter: true,
          aspect: { select: { id: true, kind: true, name: true, order: true } },
        },
      }),
    ]);
    const aspectById = new Map(activeAspects.map((a) => [a.id, a]));
    for (const g of aspectGrades) {
      if (!aspectById.has(g.aspectId)) aspectById.set(g.aspectId, g.aspect);
    }
    const aspects = [...aspectById.values()].sort((a, b) =>
      a.kind === b.kind ? a.order - b.order : a.kind.localeCompare(b.kind),
    );
    const aspectGradeMap = new Map(aspectGrades.map((g) => [`${g.aspectId}|${g.periodId}`, g.letter]));
    const aspectsDto = aspects.map((a) => {
      const byPeriod: Record<string, GradeLetter | null> = {};
      for (const p of periods) byPeriod[p.id] = aspectGradeMap.get(`${a.id}|${p.id}`) ?? null;
      return { kind: a.kind, name: a.name, byPeriod };
    });

    return {
      periods: periods.map((p) => ({ id: p.id, name: p.name, order: p.order })),
      courses: coursesDto,
      aspects: aspectsDto,
    };
  }

  // % de asistencia del periodo: (P+T)/total*100 redondeado; null sin registros. Cuenta tardanzas y faltas.
  private async attendanceForPeriod(enrollmentId: string, startDate: Date, endDate: Date) {
    const entries = await this.prisma.studentAttendanceEntry.findMany({
      where: { enrollmentId, date: { gte: startDate, lte: endDate } },
      select: { status: true },
    });
    if (entries.length === 0) return { pct: null, tardanzas: 0, faltas: 0 };
    let presente = 0;
    let tardanzas = 0;
    let faltas = 0;
    for (const e of entries) {
      if (e.status === 'PRESENTE') presente += 1;
      else if (e.status === 'TARDANZA') tardanzas += 1;
      else if (e.status === 'FALTA') faltas += 1;
    }
    const total = entries.length;
    const pct = Math.round(((presente + tardanzas) / total) * 100);
    return { pct, tardanzas, faltas };
  }

  // ===== GET /grades/sheet/export =====

  async exportSheet(actor: JwtUser, sectionId: string, courseId: string, periodId: string) {
    const data = await this.sheet(actor, sectionId, courseId, periodId);

    const rows = data.students.map((s, i) => {
      const letters: Record<string, string> = {};
      for (const c of data.competencies) {
        const l = s.letters[c.id];
        letters[c.id] = l ?? '–';
      }
      const compLetters = data.competencies
        .map((c) => s.letters[c.id])
        .filter((l): l is GradeLetter => l !== null && l !== undefined);
      const cond = courseCondition(compLetters);
      return {
        n: i + 1,
        studentCode: s.studentCode,
        fullName: s.fullName,
        letters,
        resultLetter: s.result ? `${s.result.letter} · ${GRADE_LETTER_LABELS[s.result.letter]}` : '–',
        conditionLabel: cond ? COURSE_CONDITION_LABELS[cond] : '–',
      };
    });

    const buffer = await buildActaWorkbook(
      data.section.label,
      data.course.name,
      data.period.name,
      data.competencies.map((c) => ({ id: c.id, name: c.name })),
      rows,
    );

    const slug = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const filename = `acta-${slug(data.course.name)}-${slug(data.section.label)}-${slug(data.period.name)}.xlsx`;
    return { buffer, filename };
  }
}
