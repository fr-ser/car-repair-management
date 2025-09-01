// This seed file is used for the playwright e2e tests
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: { userName: 'test-user', hash: await argon.hash('test-pass') },
  });
};

seed().catch(console.error);
