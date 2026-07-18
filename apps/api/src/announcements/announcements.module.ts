import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

// Académico (R4 — E4): comunicados a las familias por wa.me manual (contacto principal, deduplicado
// por apoderado). Un alcance por comunicado; estados BORRADOR → ENVIADO. Permiso 'comunicados'.
@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
