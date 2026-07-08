import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { type Prisma, type PeriodType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const YEAR_CLOSED_MESSAGE = 'El año académico está cerrado — solo lectura';

// Numeración romana para los periodos autogenerados (máx. 6 tramos).
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const MS_PER_DAY = 86_400_000;

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * MS_PER_DAY);
}

/**
 * Reglas de acceso al año académico + utilidades de periodos.
 *
 * Año cerrado = solo lectura a nivel API: toda mutación del módulo resuelve el
 * AcademicYear desde su entidad y lanza 409 si el año está CERRADO.
 */
@Injectable()
export class YearAccessService {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async assertYearOpenById(yearId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const year = await this.client(tx).academicYear.findUnique({
      where: { id: yearId },
      select: { status: true },
    });
    if (!year) throw new NotFoundException('Año académico no encontrado');
    if (year.status === 'CERRADO') throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  async assertYearOpenByLevel(levelId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const level = await this.client(tx).level.findUnique({
      where: { id: levelId },
      select: { academicYear: { select: { status: true } } },
    });
    if (!level) throw new NotFoundException('Nivel no encontrado');
    if (level.academicYear.status === 'CERRADO') throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  async assertYearOpenByGrade(gradeLevelId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const grade = await this.client(tx).gradeLevel.findUnique({
      where: { id: gradeLevelId },
      select: { level: { select: { academicYear: { select: { status: true } } } } },
    });
    if (!grade) throw new NotFoundException('Grado no encontrado');
    if (grade.level.academicYear.status === 'CERRADO')
      throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  async assertYearOpenBySection(sectionId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const section = await this.client(tx).section.findUnique({
      where: { id: sectionId },
      select: {
        gradeLevel: { select: { level: { select: { academicYear: { select: { status: true } } } } } },
      },
    });
    if (!section) throw new NotFoundException('Sección no encontrada');
    if (section.gradeLevel.level.academicYear.status === 'CERRADO')
      throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  async assertYearOpenByCourse(courseId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const course = await this.client(tx).course.findUnique({
      where: { id: courseId },
      select: {
        gradeLevel: { select: { level: { select: { academicYear: { select: { status: true } } } } } },
      },
    });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (course.gradeLevel.level.academicYear.status === 'CERRADO')
      throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  async assertYearOpenByProgram(programId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const program = await this.client(tx).program.findUnique({
      where: { id: programId },
      select: { academicYear: { select: { status: true } } },
    });
    if (!program) throw new NotFoundException('Programa no encontrado');
    if (program.academicYear.status === 'CERRADO') throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  async assertYearOpenByPeriod(periodId: string, tx?: Prisma.TransactionClient): Promise<void> {
    const period = await this.client(tx).period.findUnique({
      where: { id: periodId },
      select: { academicYear: { select: { status: true } } },
    });
    if (!period) throw new NotFoundException('Periodo no encontrado');
    if (period.academicYear.status === 'CERRADO') throw new ConflictException(YEAR_CLOSED_MESSAGE);
  }

  // Cuántos tramos genera cada tipo de división del año.
  static periodCount(type: PeriodType): number {
    return type === 'BIMESTRE' ? 4 : type === 'TRIMESTRE' ? 3 : 2;
  }

  private static periodBaseName(type: PeriodType): string {
    return type === 'BIMESTRE' ? 'Bimestre' : type === 'TRIMESTRE' ? 'Trimestre' : 'Semestre';
  }

  /**
   * Reparte el rango [start, end] en N tramos iguales (por días, redondeo a día),
   * numerados en romano, order 1..N, status PROXIMO. Sin solapes: cada tramo
   * termina un día antes del siguiente; el último cierra en la fecha de fin.
   */
  static generatePeriods(
    start: Date,
    end: Date,
    type: PeriodType,
  ): { name: string; startDate: Date; endDate: Date; order: number; status: 'PROXIMO' }[] {
    const n = YearAccessService.periodCount(type);
    const base = YearAccessService.periodBaseName(type);
    const totalDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);

    const boundaries: number[] = [];
    for (let i = 0; i <= n; i++) boundaries.push(Math.round((totalDays * i) / n));

    const periods = [];
    for (let i = 0; i < n; i++) {
      const from = boundaries[i] ?? 0;
      const to = boundaries[i + 1] ?? totalDays;
      const startDate = addDays(start, from);
      const endDate = i === n - 1 ? end : addDays(start, to - 1);
      periods.push({
        name: `${base} ${ROMAN[i] ?? String(i + 1)}`,
        startDate,
        endDate,
        order: i + 1,
        status: 'PROXIMO' as const,
      });
    }
    return periods;
  }
}
