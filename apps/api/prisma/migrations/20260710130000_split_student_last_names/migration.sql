-- Separa Student.lastNames en apellido paterno (obligatorio) y materno (opcional).
-- Crucial para actas y documentos oficiales peruanos: hay personas con un solo apellido.
-- También elimina Enrollment.originSchool (duplicaba Student.previousSchool y ya no se captura).
-- Migración production-grade: primero agrega columnas nullable, hace backfill desde lastNames,
-- fija NOT NULL solo en el paterno y luego elimina la columna antigua.

-- (1) Nuevas columnas (nullable para permitir el backfill).
ALTER TABLE "Student" ADD COLUMN "paternalLastName" TEXT;
ALTER TABLE "Student" ADD COLUMN "maternalLastName" TEXT;

-- (2) Backfill: primer token = paterno; el resto = materno (NULL si no hay resto).
--     position(' ' IN "lastNames" || ' ') siempre encuentra un espacio (se agrega uno al final),
--     así que un apellido sin espacio produce substring vacío → NULLIF(...,'') = NULL.
UPDATE "Student"
SET
  "paternalLastName" = split_part("lastNames", ' ', 1),
  "maternalLastName" = NULLIF(
    btrim(substring("lastNames" FROM position(' ' IN "lastNames" || ' '))),
    ''
  );

-- (3) El paterno es obligatorio; el materno queda nullable.
ALTER TABLE "Student" ALTER COLUMN "paternalLastName" SET NOT NULL;

-- (4) Se elimina la columna antigua.
ALTER TABLE "Student" DROP COLUMN "lastNames";

-- (5) Enrollment.originSchool deja de existir (histórico ya vivía en Student.previousSchool).
ALTER TABLE "Enrollment" DROP COLUMN "originSchool";
