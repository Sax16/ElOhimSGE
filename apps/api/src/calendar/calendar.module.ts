import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

// Académico (R4 — E4): calendario académico (eventos FERIADO/EXAMEN/ACTIVIDAD + vencimientos de
// pensión derivados del cronograma). Permiso 'estructura'.
@Module({
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
