// This seed file is used for the playwright e2e tests
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: { userName: 'test-user', hash: await argon.hash('test-pass') },
  });
  await prisma.client.deleteMany();
  await prisma.client.createMany({
    data: [
      // order matters because we want to see the results ordered by createdAt,
      // so the newest are on the very top of the list
      {
        clientNumber: 'K7',
        firstName: 'FTest 7',
        lastName: 'LTest 7',
        postalCode: '77777',
        city: 'test City',
        street: 'teststr. 7',
        email: 'test.7@example.com',
      },
      {
        clientNumber: 'K6',
        firstName: 'FTest 6',
        lastName: 'LTest 6',
        postalCode: '66666',
        city: 'test City',
        street: 'teststr. 6',
        email: 'test.6@example.com',
      },
      {
        clientNumber: 'K5',
        firstName: 'FTest 5',
        lastName: 'LTest 5',
        postalCode: '55555',
        city: 'test City',
        street: 'teststr. 5',
        email: 'test.5@example.com',
      },
      {
        clientNumber: 'K4',
        firstName: 'FTest 4',
        lastName: 'LTest 4',
        postalCode: '44444',
        city: 'test City',
        street: 'teststr. 4',
        email: 'test.4@example.com',
      },
      {
        clientNumber: 'K3',
        firstName: 'FTest 3',
        lastName: 'LTest 3',
        postalCode: '33333',
        city: 'test City',
        street: 'teststr. 3',
        email: 'test.3@example.com',
      },
      {
        clientNumber: 'K2',
        firstName: 'FTest 2',
        lastName: 'LTest 2',
        postalCode: '22222',
        city: 'test City',
        street: 'teststr. 2',
        email: 'test.2@example.com',
      },
      {
        clientNumber: 'K1',
        firstName: 'FTest 1',
        lastName: 'LTest 1',
        postalCode: '11111',
        city: 'test City',
        street: 'teststr. 1',
        email: 'test.1@example.com',
      },
    ],
  });
};

seed().catch(console.error);
