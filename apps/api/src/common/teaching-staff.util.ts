import { type Prisma, type PrismaClient, type StaffRole } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * "El docente es un empleado": las asignaciones académicas (Section.tutorId, CourseAssignment.teacherId)
 * apuntan a Staff, no a User. El JWT sigue siendo del User; para resolver el alcance de un docente
 * (sus aulas) hay que traducir su userId al Staff vinculado (Staff.userId).
 *
 * Predicado de "cargo docente": el cargo real del empleado es el campo Staff.role (enum StaffRole).
 * Un empleado tiene cargo docente cuando role === 'DOCENTE'. (El campo `area` es texto descriptivo
 * "Primaria · Matemática", NO el cargo.) Elegible para NUEVAS asignaciones: cargo docente + ACTIVO.
 */

// El cargo del empleado es Staff.role. Cargo docente = role DOCENTE.
export const TEACHING_STAFF_ROLE: StaffRole = 'DOCENTE';

// Fragmento WHERE reutilizable: empleados con cargo docente.
export const teachingStaffWhere = { role: TEACHING_STAFF_ROLE } satisfies Prisma.StaffWhereInput;

/**
 * Staff (empleado con cargo docente) vinculado al usuario del JWT, o null si no hay vínculo.
 * Los scopes de docente lo usan para filtrar por Staff.id: sin Staff vinculado devuelven vacío
 * (nunca error) — un User rol DOCENTE sin ficha simplemente no tiene aulas.
 */
export async function resolveTeachingStaffId(
  client: DbClient,
  actorSub: string,
): Promise<string | null> {
  const staff = await client.staff.findFirst({
    where: { userId: actorSub, role: TEACHING_STAFF_ROLE },
    select: { id: true },
  });
  return staff?.id ?? null;
}
