import { type PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_PERMISSIONS } from '@elohim/shared';

const DEMO_PASSWORD = 'Elohim2026!';

export async function seedUsers(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: 'admin@elohim.edu.pe' },
    update: {},
    create: {
      email: 'admin@elohim.edu.pe',
      passwordHash,
      fullName: 'Dir. Pérez Huamán',
      role: 'ADMIN',
      permissions: DEFAULT_PERMISSIONS.ADMIN,
    },
  });
  console.log(`  ✓ Usuario admin (admin@elohim.edu.pe / ${DEMO_PASSWORD})`);
}
