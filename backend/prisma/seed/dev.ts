// This seed file is used for the local development database
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: { email: 'admin@local.com', hash: await argon.hash('local1') },
  });
};

seed().catch(console.error);
