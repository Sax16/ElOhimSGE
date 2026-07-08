import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.academicYear.findMany({
      select: { id: true, name: true, status: true },
      orderBy: { name: 'desc' },
    });
  }
}
