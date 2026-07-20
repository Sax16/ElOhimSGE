-- Corrección pre-1.0.0: "el docente es un empleado".
-- Las asignaciones académicas dejan de apuntar a User y pasan a apuntar al EMPLEADO (Staff) con
-- cargo docente. El User queda solo como credencial (vinculada por Staff.userId). Course.teacherId
-- (docente por grado, obsoleto) se elimina por completo.
--
-- La BD es de desarrollo (pre-lanzamiento): los ids actuales de tutor/asignación apuntan a User y no
-- son remapeables a Staff de forma automática (los nombres ni coinciden). Estrategia acordada: la
-- migración limpia lo remapeable y `pnpm db:seed` (reelaborado, idempotente) reconstruye el estado
-- demo canónico — tutores por sección y CourseAssignment por curso×sección apuntando a Staff.

-- ===== Section.tutorId: User -> Staff =====
-- Se suelta la FK vieja a User y se vacían los tutores (el seed los repuebla con ids de Staff docente).
ALTER TABLE "Section" DROP CONSTRAINT "Section_tutorId_fkey";
UPDATE "Section" SET "tutorId" = NULL;
ALTER TABLE "Section" ADD CONSTRAINT "Section_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ===== CourseAssignment.teacherId: User -> Staff =====
-- Se suelta la FK vieja a User y se vacían TODAS las asignaciones (teacherId apunta a User; dato de
-- dev que reconstruye el seed apuntando a Staff). El índice CourseAssignment_teacherId_idx se conserva.
ALTER TABLE "CourseAssignment" DROP CONSTRAINT "CourseAssignment_teacherId_fkey";
DELETE FROM "CourseAssignment";
ALTER TABLE "CourseAssignment" ADD CONSTRAINT "CourseAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===== Course.teacherId: se elimina =====
-- El plan de estudios es solo catálogo (curso + horas semanales); el docente vive en CourseAssignment.
ALTER TABLE "Course" DROP CONSTRAINT "Course_teacherId_fkey";
ALTER TABLE "Course" DROP COLUMN "teacherId";
