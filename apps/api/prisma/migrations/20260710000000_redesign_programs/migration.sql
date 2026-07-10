-- Rediseño de PROGRAMAS COMPLEMENTARIOS: los programas tienen vigencia (startMonth/endMonth)
-- y las inscripciones (ProgramEnrollment) generan sus propias cuotas SEPARADAS de las pensiones.
-- Cirugía de datos sin pérdida: cada EnrollmentProgram pasa a ProgramEnrollment y sus montos
-- incrustados en pensiones se extraen a cuotas de programa propias (dinero conservado).

-- ============================================================
-- (0) Preparación de índices/columnas (sin tocar datos aún)
-- ============================================================

-- El unique de Program cambia de (year, name) a (year, name, startMonth).
DROP INDEX "Program_academicYearId_name_key";

-- Installment: enrollmentId pasa a opcional y aparece programEnrollmentId.
ALTER TABLE "Installment" DROP CONSTRAINT "Installment_enrollmentId_fkey";
ALTER TABLE "Installment"
  ADD COLUMN "programEnrollmentId" TEXT,
  ALTER COLUMN "enrollmentId" DROP NOT NULL;

-- ============================================================
-- (1) Program: vigencia con DEFAULT temporal para backfillear las filas existentes.
-- ============================================================
ALTER TABLE "Program"
  ADD COLUMN "startMonth" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "endMonth"   INTEGER NOT NULL DEFAULT 12;

-- Quitamos el DEFAULT: en adelante el valor lo provee siempre la aplicación.
ALTER TABLE "Program" ALTER COLUMN "startMonth" DROP DEFAULT;
ALTER TABLE "Program" ALTER COLUMN "endMonth" DROP DEFAULT;

-- Reglas de vigencia (configurable en meses 2..12; el fin no puede ser anterior al inicio).
ALTER TABLE "Program"
  ADD CONSTRAINT "Program_startMonth_range_check" CHECK ("startMonth" BETWEEN 2 AND 12),
  ADD CONSTRAINT "Program_endMonth_range_check"   CHECK ("endMonth"   BETWEEN 2 AND 12),
  ADD CONSTRAINT "Program_month_order_check"       CHECK ("endMonth" >= "startMonth");

CREATE UNIQUE INDEX "Program_academicYearId_name_startMonth_key"
  ON "Program"("academicYearId", "name", "startMonth");

-- ============================================================
-- (2) ProgramEnrollment: inscripción independiente a una edición de programa.
-- ============================================================
CREATE TABLE "ProgramEnrollment" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthlyFeeSnapshot" DECIMAL(10,2) NOT NULL,
    "enrollmentFeeSnapshot" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "canceledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "ProgramEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProgramEnrollment_programId_studentId_key"
  ON "ProgramEnrollment"("programId", "studentId");

ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgramEnrollment" ADD CONSTRAINT "ProgramEnrollment_registeredById_fkey"
  FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- (3) Installment: nuevo índice, FKs y CHECK de pertenencia exclusiva.
-- ============================================================
CREATE UNIQUE INDEX "Installment_programEnrollmentId_sequence_key"
  ON "Installment"("programEnrollmentId", "sequence");

ALTER TABLE "Installment" ADD CONSTRAINT "Installment_enrollmentId_fkey"
  FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_programEnrollmentId_fkey"
  FOREIGN KEY ("programEnrollmentId") REFERENCES "ProgramEnrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Una cuota pertenece a una matrícula escolar O a una inscripción de programa, nunca a ambas ni a ninguna.
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_owner_xor_check"
  CHECK (("enrollmentId" IS NULL) <> ("programEnrollmentId" IS NULL));

-- ============================================================
-- (4) CIRUGÍA DE DATOS: EnrollmentProgram -> ProgramEnrollment + cuotas de programa.
--     El dinero se conserva: lo que sale de cada pensión entra como cuota de programa.
-- ============================================================
DO $migracion$
DECLARE
  filas_invalidas INTEGER;
  ep RECORD;
  pe_id TEXT;
  cuota RECORD;
BEGIN
  -- Precondición: la migración asume relación 1:1 (una matrícula, a lo sumo un programa incrustado).
  SELECT count(*) INTO filas_invalidas FROM (
    SELECT "enrollmentId" FROM "EnrollmentProgram" GROUP BY "enrollmentId" HAVING count(*) > 1
  ) t;
  IF filas_invalidas > 0 THEN
    RAISE EXCEPTION 'Cirugía abortada: % matrícula(s) con más de un programa incrustado; el modelo nuevo asume 1:1 y no puede desincrustar montos combinados', filas_invalidas;
  END IF;

  FOR ep IN
    SELECT epr."enrollmentId", epr."programId", epr."monthlyFeeSnapshot",
           e."studentId", e."registeredById", e."enrolledAt",
           p.name AS program_name
    FROM "EnrollmentProgram" epr
    JOIN "Enrollment" e ON e.id = epr."enrollmentId"
    JOIN "Program"    p ON p.id = epr."programId"
  LOOP
    pe_id := gen_random_uuid()::text;

    INSERT INTO "ProgramEnrollment"
      (id, "programId", "studentId", "registeredById", "enrolledAt",
       "monthlyFeeSnapshot", "enrollmentFeeSnapshot", "canceledAt", "cancelReason")
    VALUES
      (pe_id, ep."programId", ep."studentId", ep."registeredById", ep."enrolledAt",
       ep."monthlyFeeSnapshot", 0, NULL, NULL);

    -- Por cada pensión con monto de programa incrustado: crea la cuota de programa espejo
    -- (mismo mes/sequence/dueDate, mismo estado) y descuenta el monto de la pensión.
    FOR cuota IN
      SELECT id, concept, sequence, "dueDate", "programsAmount", status
      FROM "Installment"
      WHERE "enrollmentId" = ep."enrollmentId"
        AND type = 'PENSION'
        AND "programsAmount" > 0
    LOOP
      INSERT INTO "Installment"
        (id, "enrollmentId", "programEnrollmentId", type, concept, sequence,
         "dueDate", "baseAmount", "discountAmount", "programsAmount", amount, status)
      VALUES
        (gen_random_uuid()::text, NULL, pe_id, 'PENSION',
         replace(cuota.concept, 'Pensión ', 'Programa · ' || ep.program_name || ' · '),
         cuota.sequence, cuota."dueDate",
         ep."monthlyFeeSnapshot", 0, 0, ep."monthlyFeeSnapshot", cuota.status);

      UPDATE "Installment"
        SET amount = amount - "programsAmount", "programsAmount" = 0
        WHERE id = cuota.id;
    END LOOP;
  END LOOP;
END
$migracion$;

-- ============================================================
-- (5) Fin del modelo antiguo.
-- ============================================================
ALTER TABLE "EnrollmentProgram" DROP CONSTRAINT "EnrollmentProgram_enrollmentId_fkey";
ALTER TABLE "EnrollmentProgram" DROP CONSTRAINT "EnrollmentProgram_programId_fkey";
DROP TABLE "EnrollmentProgram";
