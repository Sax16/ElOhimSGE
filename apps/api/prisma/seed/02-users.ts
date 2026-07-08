import { type PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_PERMISSIONS, type UserRole } from '@elohim/shared';

const DEMO_PASSWORD = 'Elohim2026!';

// La institución no tiene dominio propio: el personal usa Gmail personal.
// El login es por username único; el correo es dato de contacto.
const USERS: { username: string; email: string; fullName: string; role: UserRole }[] = [
  { username: 'admin', email: 'elohim.direccion@gmail.com', fullName: 'Dir. Pérez Huamán', role: 'ADMIN' },
  { username: 'secretaria', email: 'elohim.secretaria@gmail.com', fullName: 'Rosa Quispe Mamani', role: 'SECRETARIA_CAJA' },
  { username: 'docente', email: 'elohim.docente1@gmail.com', fullName: 'Pedro Gómez Silva', role: 'DOCENTE' },
  { username: 'porteria', email: 'elohim.porteria@gmail.com', fullName: 'Fidel Huamán Soto', role: 'PORTERIA' },
  { username: 'lucia.diaz', email: 'elohim.docente2@gmail.com', fullName: 'Lucía Díaz Paredes', role: 'DOCENTE' },
  { username: 'mario.silva', email: 'elohim.docente3@gmail.com', fullName: 'Mario Silva Chávez', role: 'DOCENTE' },
  { username: 'carmen.rojas', email: 'elohim.docente4@gmail.com', fullName: 'Carmen Rojas Vega', role: 'DOCENTE' },
  { username: 'jorge.mendoza', email: 'elohim.docente5@gmail.com', fullName: 'Jorge Mendoza Ríos', role: 'DOCENTE' },
  { username: 'elena.castro', email: 'elohim.docente6@gmail.com', fullName: 'Elena Castro Salas', role: 'DOCENTE' },
  { username: 'raul.torres', email: 'elohim.docente7@gmail.com', fullName: 'Raúl Torres Ninanya', role: 'DOCENTE' },
];

export async function seedUsers(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of USERS) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
        permissions: DEFAULT_PERMISSIONS[u.role],
      },
    });
  }
  console.log(`  ✓ ${USERS.length} usuarios (demo: admin / ${DEMO_PASSWORD})`);
}
