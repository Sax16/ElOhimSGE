import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  studentCreateSchema,
  studentListQuerySchema,
  studentUpdateSchema,
  withdrawSchema,
  type StudentCreateInput,
  type StudentListQuery,
  type StudentUpdateInput,
  type WithdrawInput,
} from '@elohim/shared';
import { zodBody, zodQuery } from '../common/zod-validation.pipe';
import { RequirePermission } from '../common/permissions/require-permission.decorator';
import { CurrentUser, type JwtUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from './students.service';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png' };

@Controller('students')
export class StudentsController {
  constructor(
    private readonly students: StudentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @RequirePermission('estudiantes', 'ver')
  list(@(zodQuery(studentListQuerySchema)) query: StudentListQuery) {
    return this.students.list(query);
  }

  @Post()
  @RequirePermission('estudiantes', 'editar')
  create(@(zodBody(studentCreateSchema)) body: StudentCreateInput, @CurrentUser() actor: JwtUser) {
    return this.students.create(body, actor.sub);
  }

  @Get(':id')
  @RequirePermission('estudiantes', 'ver')
  findOne(@Param('id') id: string) {
    return this.students.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('estudiantes', 'editar')
  update(
    @Param('id') id: string,
    @(zodBody(studentUpdateSchema)) body: StudentUpdateInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.students.update(id, body, actor.sub);
  }

  @Post(':id/photo')
  @RequirePermission('estudiantes', 'editar')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_PHOTO_BYTES } }))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() actor: JwtUser,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    const ext = PHOTO_EXT[file.mimetype];
    if (!ext) throw new BadRequestException('Formato no permitido: usa JPG o PNG');
    if (file.size > MAX_PHOTO_BYTES) throw new BadRequestException('La imagen supera los 2 MB');

    const student = await this.prisma.student.findUnique({ where: { id }, select: { id: true } });
    if (!student) throw new NotFoundException('Estudiante no encontrado');

    const dir = join(process.cwd(), 'uploads', 'students');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${id}${ext}`), file.buffer);

    const photoUrl = `/api/files/students/${id}${ext}?v=${Date.now()}`;
    return this.students.setPhoto(id, photoUrl, actor.sub);
  }

  @Post(':id/withdraw')
  @HttpCode(200)
  @RequirePermission('estudiantes', 'editar')
  withdraw(
    @Param('id') id: string,
    @(zodBody(withdrawSchema)) body: WithdrawInput,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.students.withdraw(id, body, actor.sub);
  }
}
