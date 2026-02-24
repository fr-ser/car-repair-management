// This seed file is used for the playwright e2e tests
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
  await prisma.order.deleteMany();
  await prisma.article.deleteMany();
  await prisma.car.deleteMany();
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
        firstName: 'FTest 2 - Car Assignment',
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
  await prisma.article.create({
    data: {
      id: 'ART-PW1',
      description: 'PW Test Artikel',
      price: '19.95',
      amount: '10',
    },
  });

  const k1 = await prisma.client.findFirst({ where: { clientNumber: 'K1' } });
  const car = await prisma.car.create({
    data: {
      carNumber: 'A1',
      licensePlate: 'TEST-PW 1',
      model: 'Testmodell',
      manufacturer: 'Testhersteller',
      clientId: k1?.id,
    },
  });

  const order1 = await prisma.order.create({
    data: {
      title: 'Seed Auftrag 1',
      orderDate: '2026-01-10',
      status: 'done',
      carId: car.id,
      clientId: k1!.id,
    },
  });
  await prisma.order.update({
    where: { id: order1.id },
    data: { orderNumber: `A${order1.id}` },
  });

  const order2 = await prisma.order.create({
    data: {
      title: 'Seed Auftrag 2',
      orderDate: '2026-02-01',
      status: 'in_progress',
      carId: car.id,
      clientId: k1!.id,
    },
  });
  await prisma.order.update({
    where: { id: order2.id },
    data: { orderNumber: `A${order2.id}` },
  });
};

seed().catch(console.error);
