import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

// Estudiantes (Etapa 4): ficha, listado paginado, foto y retiro/traslado.
@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
