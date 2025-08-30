// This seed file is used for the playwright e2e tests
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: { email: 'test@test.test', hash: await argon.hash('test') },
  });
};

seed().catch(console.error);
