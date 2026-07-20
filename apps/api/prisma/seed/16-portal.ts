import { type PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_PERMISSIONS } from '@elohim/shared';

const DEMO_PASSWORD = 'Elohim2026!';

// Portal del apoderado (v1.0.0): crea una cuenta DEMO de acceso al portal. Elige
// determinísticamente un apoderado ACTIVO con ≥2 hijos con matrícula vigente del año activo (el de
// menor DNI); si ninguno tiene 2, el primero con 1. La cuenta demo NO fuerza cambio de clave.
export async function seedPortal(prisma: PrismaClient) {
  const year = await prisma.academicYear.findFirst({
    where: { status: 'ACTIVO' },
    select: { id: true },
  });
  if (!year) {
    console.log('  ⚠ Portal apoderado demo: sin año activo, se omite');
    return;
  }

  // Apoderados con ≥1 hijo (ACTIVO/BECADO) con matrícula vigente del año activo, vínculo activo.
  const guardians = await prisma.guardian.findMany({
    where: {
      students: {
        some: {
          active: true,
          student: {
            status: { in: ['ACTIVO', 'BECADO'] },
            enrollments: { some: { academicYearId: year.id, canceledAt: null } },
          },
        },
      },
    },
    orderBy: { dni: 'asc' },
    select: {
      id: true,
      dni: true,
      fullName: true,
      userId: true,
      students: {
        where: {
          active: true,
          student: {
            status: { in: ['ACTIVO', 'BECADO'] },
            enrollments: { some: { academicYearId: year.id, canceledAt: null } },
          },
        },
        select: { studentId: true },
      },
    },
  });

  if (guardians.length === 0) {
    console.log('  ⚠ Portal apoderado demo: no hay apoderados con hijos matriculados, se omite');
    return;
  }

  // Menor DNI con ≥2 hijos; si ninguno, el primero (menor DNI) con ≥1.
  const withTwo = guardians.find((g) => g.students.length >= 2);
  const chosen = withTwo ?? guardians[0];
  if (!chosen) {
    console.log('  ⚠ Portal apoderado demo: no hay apoderados elegibles, se omite');
    return;
  }
  const childCount = chosen.students.length;
  const username = chosen.dni.toLowerCase();

  // Idempotente: si ya existe el usuario (username = DNI), no lo dupliques ni le pises la clave.
  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (existing) {
    if (chosen.userId !== existing.id) {
      await prisma.guardian.update({ where: { id: chosen.id }, data: { userId: existing.id } });
    }
    console.log(
      `  ✓ Portal apoderado demo: usuario ${chosen.dni} (${chosen.fullName}, ${childCount} hijos)`,
    );
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email: `${username}@apoderado.local`,
      passwordHash,
      fullName: chosen.fullName,
      role: 'APODERADO',
      permissions: DEFAULT_PERMISSIONS.APODERADO,
      mustChangePassword: false, // demo: sin cambio obligatorio
    },
    select: { id: true },
  });
  await prisma.guardian.update({ where: { id: chosen.id }, data: { userId: user.id } });

  console.log(
    `  ✓ Portal apoderado demo: usuario ${chosen.dni} (${chosen.fullName}, ${childCount} hijos, clave ${DEMO_PASSWORD})`,
  );
}
