import { Module } from '@nestjs/common';
import { StudentAttendanceController } from './student-attendance.controller';
import { StudentAttendanceService } from './student-attendance.service';
import { CourseAssignmentsController } from './course-assignments.controller';
import { CourseAssignmentsService } from './course-assignments.service';

// Académico (R4 — E1): asistencia diaria de estudiantes por sección + asignación docente
// (curso × sección). Permisos: 'asistencia' para la toma; 'estructura' para las asignaciones.
@Module({
  controllers: [StudentAttendanceController, CourseAssignmentsController],
  providers: [StudentAttendanceService, CourseAssignmentsService],
})
export class StudentAttendanceModule {}
