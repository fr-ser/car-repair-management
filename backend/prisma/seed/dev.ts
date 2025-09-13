// This seed file is used for the local development database
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      userName: process.env.USERNAME as string,
      hash: await argon.hash(process.env.PASSWORD as string),
    },
  });

  await prisma.article.deleteMany();
  await prisma.article.createMany({
    data: [
      { id: 'foo1', description: 'bar1', price: '1.4' },
      { id: 'foo2', description: 'bar2', price: '2.4', amount: '293' },
    ],
  });
  await prisma.client.deleteMany();
  await prisma.client.createMany({
    data: [
      // order matters because we want to see the results ordered by createdAt,
      // so the newest are on the very top of the list
      {
        clientNumber: 'K7',
        firstName: 'Ethan',
        lastName: 'Wilson',
        postalCode: '12345',
        city: 'Sample City',
        street: 'Main St',
        email: 'ethan.wilson@example.com',
      },
      {
        clientNumber: 'K6',
        firstName: 'Diana',
        lastName: 'Miller',
        postalCode: '12345',
        city: 'Sample City',
        street: 'Main St',
        email: 'diana.miller@example.com',
      },
      {
        clientNumber: 'K5',
        firstName: 'Charlie',
        lastName: 'Davis',
        postalCode: '12345',
        city: 'Sample City',
        street: 'Main St',
        email: 'charlie.davis@example.com',
      },
      {
        clientNumber: 'K4',
        firstName: 'Bob',
        lastName: 'Brown',
        postalCode: '12345',
        city: 'Sample City',
        street: 'Main St',
        email: 'bob.brown@example.com',
      },
      {
        clientNumber: 'K3',
        firstName: 'Alice',
        lastName: 'Johnson',
        postalCode: '12345',
        city: 'Sample City',
        street: 'Main St',
        email: 'alice.johnson@example.com',
      },
      {
        clientNumber: 'K2',
        firstName: 'Jane',
        lastName: 'Smith',
        postalCode: '12345',
        city: 'Sample City',
        street: 'Main St',
        email: 'jane.smith@example.com',
      },
      {
        clientNumber: 'K1',
        firstName: 'John',
        lastName: 'Doe',
        postalCode: '12345',
        city: 'Sample City',
        street: 'Main St',
        email: 'john.doe@example.com',
      },
    ],
  });
};

seed().catch(console.error);
