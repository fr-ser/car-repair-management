// This seed file is used for the local development database
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: { userName: 'admin', hash: await argon.hash('local') },
  });

  await prisma.article.deleteMany();
  await prisma.article.createMany({
    data: [
      { id: 'foo1', description: 'bar1', price: '1.4' },
      { id: 'foo2', description: 'bar2', price: '2.4', amount: '293' },
    ],
  });
};

seed().catch(console.error);
