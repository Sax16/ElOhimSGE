-- CreateEnum
CREATE TYPE "GradeLetter" AS ENUM ('AD', 'A', 'B', 'C');

-- CreateEnum
CREATE TYPE "EvaluationAspectKind" AS ENUM ('FORMATIVO', 'APODERADO');

-- CreateTable
CREATE TABLE "CourseCompetency" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "CourseCompetency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationAspect" (
    "id" TEXT NOT NULL,
    "kind" "EvaluationAspectKind" NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EvaluationAspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeEntry" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "letter" "GradeLetter" NOT NULL,
    "gradedById" TEXT NOT NULL,
    "gradedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseResult" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "letter" "GradeLetter" NOT NULL,
    "auto" BOOLEAN NOT NULL DEFAULT true,
    "gradedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AspectGrade" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "aspectId" TEXT NOT NULL,
    "letter" "GradeLetter" NOT NULL,
    "gradedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AspectGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseCompetency_courseId_idx" ON "CourseCompetency"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseCompetency_courseId_name_key" ON "CourseCompetency"("courseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationAspect_kind_name_key" ON "EvaluationAspect"("kind", "name");

-- CreateIndex
CREATE INDEX "GradeEntry_courseId_periodId_idx" ON "GradeEntry"("courseId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "GradeEntry_enrollmentId_courseId_periodId_competencyId_key" ON "GradeEntry"("enrollmentId", "courseId", "periodId", "competencyId");

-- CreateIndex
CREATE INDEX "CourseResult_courseId_periodId_idx" ON "CourseResult"("courseId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseResult_enrollmentId_courseId_periodId_key" ON "CourseResult"("enrollmentId", "courseId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "AspectGrade_enrollmentId_periodId_aspectId_key" ON "AspectGrade"("enrollmentId", "periodId", "aspectId");

-- AddForeignKey
ALTER TABLE "CourseCompetency" ADD CONSTRAINT "CourseCompetency_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "CourseCompetency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeEntry" ADD CONSTRAINT "GradeEntry_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseResult" ADD CONSTRAINT "CourseResult_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseResult" ADD CONSTRAINT "CourseResult_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseResult" ADD CONSTRAINT "CourseResult_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseResult" ADD CONSTRAINT "CourseResult_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspectGrade" ADD CONSTRAINT "AspectGrade_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspectGrade" ADD CONSTRAINT "AspectGrade_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspectGrade" ADD CONSTRAINT "AspectGrade_aspectId_fkey" FOREIGN KEY ("aspectId") REFERENCES "EvaluationAspect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AspectGrade" ADD CONSTRAINT "AspectGrade_gradedById_fkey" FOREIGN KEY ("gradedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
