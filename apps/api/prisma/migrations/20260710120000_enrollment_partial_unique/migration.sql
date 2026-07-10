-- Unicidad estudiante+año SOLO para matrículas vigentes.
-- El @@unique([studentId, academicYearId]) impedía re-matricular a un estudiante retirado o
-- trasladado (su matrícula previa queda ANULADA, no se borra). Se reemplaza por un índice único
-- PARCIAL que solo considera las matrículas vigentes (canceledAt IS NULL). Esto no es representable
-- en el schema Prisma, por eso vive en SQL.

DROP INDEX "Enrollment_studentId_academicYearId_key";

CREATE UNIQUE INDEX "Enrollment_studentId_academicYearId_active_key"
  ON "Enrollment" ("studentId", "academicYearId")
  WHERE "canceledAt" IS NULL;
