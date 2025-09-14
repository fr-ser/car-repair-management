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
        company: 'Company K7',
        postalCode: '1234-K7',
        city: 'City K7',
        street: 'Main St K7',
        email: 'ethan.wilson@example.com',
      },
      {
        clientNumber: 'K6',
        firstName: 'Diana',
        lastName: 'Miller',
        company: 'Company K6',
        postalCode: '1234-K6',
        city: 'City K6',
        street: 'Main St K6',
        email: 'diana.miller@example.com',
      },
      {
        clientNumber: 'K5',
        firstName: 'Charlie',
        lastName: 'Davis',
        company: 'Company K5',
        postalCode: '1234-K5',
        city: 'City K5',
        street: 'Main St K5',
        email: 'charlie.davis@example.com',
      },
      {
        clientNumber: 'K4',
        firstName: 'Bob',
        lastName: 'Brown',
        company: 'Company K4',
        postalCode: '1234-K4',
        city: 'City K4',
        street: 'Main St K4',
        email: 'bob.brown@example.com',
      },
      {
        clientNumber: 'K3',
        firstName: 'Alice',
        lastName: 'Johnson',
        company: 'Company K3',
        postalCode: '1234-K3',
        city: 'City K3',
        street: 'Main St K3',
        email: 'alice.johnson@example.com',
      },
      {
        clientNumber: 'K2',
        firstName: 'Jane',
        lastName: 'Smith',
        company: 'Company K2',
        postalCode: '1234-K2',
        city: 'City K2',
        street: 'Main St K2',
        email: 'jane.smith@example.com',
      },
      {
        clientNumber: 'K1',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Company K1',
        postalCode: '1234-K1',
        city: 'City K1',
        street: 'Main St K1',
        email: 'john.doe@example.com',
      },
    ],
  });
};

seed().catch(console.error);
