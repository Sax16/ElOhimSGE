import { Module } from '@nestjs/common';
import { GuardiansController } from './guardians.controller';
import { StudentGuardiansController } from './student-guardians.controller';
import { GuardiansService } from './guardians.service';

// Apoderados (Etapa 4): ficha, listado y vínculos N:M con estudiantes.
@Module({
  controllers: [GuardiansController, StudentGuardiansController],
  providers: [GuardiansService],
})
export class GuardiansModule {}
