import { z } from 'zod';
import { ANNOUNCEMENT_SCOPES, ANNOUNCEMENT_STATUSES } from '../enums';

// Esquemas de Comunicados (R4 — E4). Única definición de validación (compartida entre React Hook
// Form y la API). Mensajes de error en español. Un solo alcance por comunicado; el id del alcance
// es condicional (superRefine): NIVEL exige levelId, GRADO gradeLevelId, SECCION sectionId.

// POST/PATCH /api/announcements — crea/edita un borrador.
export const announcementCreateSchema = z
  .object({
    title: z.string().trim().min(3, 'Escribe un título (mínimo 3 caracteres)'),
    body: z.string().trim().min(10, 'Escribe el mensaje (mínimo 10 caracteres)'),
    scope: z.enum(ANNOUNCEMENT_SCOPES),
    levelId: z.string().optional().or(z.literal('')),
    gradeLevelId: z.string().optional().or(z.literal('')),
    sectionId: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.scope === 'NIVEL' && !data.levelId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['levelId'], message: 'Selecciona un nivel' });
    }
    if (data.scope === 'GRADO' && !data.gradeLevelId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gradeLevelId'], message: 'Selecciona un grado' });
    }
    if (data.scope === 'SECCION' && !data.sectionId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sectionId'], message: 'Selecciona una sección' });
    }
  });
export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;

// PATCH usa el mismo shape completo (edición de todos los campos del borrador).
export const announcementUpdateSchema = announcementCreateSchema;
export type AnnouncementUpdateInput = z.infer<typeof announcementUpdateSchema>;

// GET /api/announcements?search=&status=
export const announcementListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(ANNOUNCEMENT_STATUSES).optional(),
});
export type AnnouncementListQuery = z.infer<typeof announcementListQuerySchema>;
