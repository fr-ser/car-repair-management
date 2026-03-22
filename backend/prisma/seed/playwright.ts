// This seed file is used for the playwright e2e tests
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as argon from 'argon2';

import { PrismaClient } from '../../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./test.db',
});
const prisma = new PrismaClient({ adapter });

const seed = async () => {
  // Delete in FK-safe order
  await prisma.document.deleteMany();
  await prisma.order.deleteMany();
  await prisma.car.deleteMany();
  await prisma.client.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      userName: process.env.USERNAME as string,
      hash: await argon.hash(process.env.PASSWORD as string),
    },
  });

  await prisma.client.createMany({
    data: [
      // order matters because we want to see the results ordered by createdAt,
      // so the newest are on the very top of the list
      {
        clientNumber: 'TEST-K7',
        firstName: 'Test First 7',
        lastName: 'Test Last 7',
        postalCode: '77777',
        city: 'Test City',
        street: 'Test St. 7',
        email: 'test.7@example.com',
      },
      {
        clientNumber: 'TEST-K6',
        firstName: 'Test First 6',
        lastName: 'Test Last 6',
        postalCode: '66666',
        city: 'Test City',
        street: 'Test St. 6',
        email: 'test.6@example.com',
      },
      {
        clientNumber: 'TEST-K5',
        firstName: 'Test First 5',
        lastName: 'Test Last 5',
        postalCode: '55555',
        city: 'Test City',
        street: 'Test St. 5',
        email: 'test.5@example.com',
      },
      {
        clientNumber: 'TEST-K4',
        firstName: 'Test First 4',
        lastName: 'Test Last 4',
        postalCode: '44444',
        city: 'Test City',
        street: 'Test St. 4',
        email: 'test.4@example.com',
      },
      {
        clientNumber: 'TEST-K3',
        firstName: 'Test First 3',
        lastName: 'Test Last 3',
        postalCode: '33333',
        city: 'Test City',
        street: 'Test St. 3',
        email: 'test.3@example.com',
      },
      {
        clientNumber: 'TEST-K2',
        firstName: 'Test First 2 - Car Assignment',
        lastName: 'Test Last 2',
        postalCode: '22222',
        city: 'Test City',
        street: 'Test St. 2',
        email: 'test.2@example.com',
      },
      {
        clientNumber: 'TEST-K1',
        firstName: 'Test First 1',
        lastName: 'Test Last 1',
        postalCode: '11111',
        city: 'Test City',
        street: 'Test St. 1',
        email: 'test.1@example.com',
      },
    ],
  });

  await prisma.article.create({
    data: {
      id: 'ART-PW1',
      description: 'Test Article PW1',
      price: '19.95',
      amount: '10',
    },
  });

  const k1 = await prisma.client.findFirstOrThrow({
    where: { clientNumber: 'TEST-K1' },
  });
  const car = await prisma.car.create({
    data: {
      carNumber: 'TEST-A1',
      licensePlate: 'TEST-PW 1',
      model: 'Test Model',
      manufacturer: 'Test Manufacturer',
      clientId: k1.id,
    },
  });

  const order1 = await prisma.order.create({
    data: {
      title: 'Test Order 1',
      orderDate: '2026-01-10',
      status: 'done',
      carId: car.id,
      clientId: k1.id,
    },
  });
  await prisma.order.update({
    where: { id: order1.id },
    data: { orderNumber: `A${order1.id}` },
  });

  const order2 = await prisma.order.create({
    data: {
      title: 'Test Order 2',
      orderDate: '2026-02-01',
      status: 'in_progress',
      carId: car.id,
      clientId: k1.id,
    },
  });
  await prisma.order.update({
    where: { id: order2.id },
    data: { orderNumber: `A${order2.id}` },
  });
};

seed().catch(console.error);
