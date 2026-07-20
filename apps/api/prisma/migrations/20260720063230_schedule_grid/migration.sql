-- CreateTable
CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "shift" "Shift" NOT NULL,
    "order" INTEGER NOT NULL,
    "startTime" CHAR(5) NOT NULL,
    "endTime" CHAR(5) NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleSlot" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "blockId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleBlock_levelId_shift_order_key" ON "ScheduleBlock"("levelId", "shift", "order");

-- CreateIndex
CREATE INDEX "ScheduleSlot_blockId_idx" ON "ScheduleSlot"("blockId");

-- CreateIndex
CREATE INDEX "ScheduleSlot_courseId_idx" ON "ScheduleSlot"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_sectionId_dayOfWeek_blockId_key" ON "ScheduleSlot"("sectionId", "dayOfWeek", "blockId");

-- AddForeignKey
ALTER TABLE "ScheduleBlock" ADD CONSTRAINT "ScheduleBlock_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ScheduleBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
