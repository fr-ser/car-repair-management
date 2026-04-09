// This seed file is used for the local development database
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as argon from 'argon2';

import { PrismaClient } from '../../src/generated/prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
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

  await prisma.article.createMany({
    data: [
      { id: 'foo1', description: 'bar1', price: '1.4' },
      { id: 'foo2', description: 'bar2', price: '2.4', amount: '293' },
    ],
  });

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

  const devClient1 = await prisma.client.findFirstOrThrow({
    where: { clientNumber: 'K1' },
  });
  const devClient2 = await prisma.client.findFirstOrThrow({
    where: { clientNumber: 'K2' },
  });

  await prisma.car.createMany({
    data: [
      // order matters because we want to see the results ordered by createdAt,
      // so the newest are on the very top of the list
      {
        carNumber: 'A4',
        licensePlate: 'license-A4',
        model: 'Model A4',
        manufacturer: 'Manufacturer A4',
      },
      {
        carNumber: 'A3',
        licensePlate: 'license-A3',
        model: 'Model A3',
        manufacturer: 'Manufacturer A3',
        clientId: devClient2.id,
      },
      {
        carNumber: 'A2',
        licensePlate: 'license-A2',
        model: 'Model A2',
        manufacturer: 'Manufacturer A2',
        clientId: devClient2.id,
      },
      {
        carNumber: 'A1',
        licensePlate: 'license-A1',
        model: 'Model A1',
        manufacturer: 'Manufacturer A1',
        clientId: devClient1.id,
      },
    ],
  });

  const devCar1 = await prisma.car.findFirstOrThrow({
    where: { carNumber: 'A1' },
  });

  // Order 1: oil change + inspection (done) — gets an invoice and an offer
  const order1 = await prisma.order.create({
    data: {
      title: 'Oil Change + Inspection',
      orderDate: '2026-01-15',
      status: 'done',
      paymentMethod: 'cash',
      kmStand: '87500',
      carId: devCar1.id,
      clientId: devClient1.id,
    },
  });
  await prisma.order.update({
    where: { id: order1.id },
    data: { orderNumber: `A${order1.id}` },
  });
  await prisma.orderPosition.createMany({
    data: [
      { orderId: order1.id, type: 'heading', sortOrder: 1, text: 'Oil Change' },
      {
        orderId: order1.id,
        type: 'item',
        sortOrder: 2,
        articleId: 'foo1',
        description: 'Oil Filter',
        pricePerUnit: '15.00',
        amount: '1',
      },
      {
        orderId: order1.id,
        type: 'item',
        sortOrder: 3,
        description: 'Engine Oil 5W-30',
        pricePerUnit: '45.00',
        amount: '5',
      },
      {
        orderId: order1.id,
        type: 'heading',
        sortOrder: 4,
        text: 'Inspection',
      },
      {
        orderId: order1.id,
        type: 'item',
        sortOrder: 5,
        description: 'Air Filter',
        pricePerUnit: '12.50',
        amount: '1',
      },
      {
        orderId: order1.id,
        type: 'item',
        sortOrder: 6,
        description: 'Spark Plugs',
        pricePerUnit: '8.00',
        amount: '4',
        discount: '10',
      },
    ],
  });

  const order1Positions = await prisma.orderPosition.findMany({
    where: { orderId: order1.id },
    orderBy: { sortOrder: 'asc' },
  });

  const positionSnapshot = order1Positions.map((p) => ({
    type: p.type,
    sortOrder: p.sortOrder,
    text: p.text,
    articleId: p.articleId,
    description: p.description,
    pricePerUnit: p.pricePerUnit,
    amount: p.amount,
    discount: p.discount,
  }));

  await prisma.document.create({
    data: {
      documentNumber: '26-01-001',
      type: 'invoice',
      documentDate: '2026-01-15',
      orderId: order1.id,
      paymentMethod: 'cash',
      clientNumber: devClient1.clientNumber,
      clientCompany: devClient1.company,
      clientFirstName: devClient1.firstName,
      clientLastName: devClient1.lastName,
      clientStreet: devClient1.street,
      clientPostalCode: devClient1.postalCode,
      clientCity: devClient1.city,
      carLicensePlate: devCar1.licensePlate,
      carManufacturer: devCar1.manufacturer,
      carModel: devCar1.model,
      carMileage: '87500',
      positions: { create: positionSnapshot },
    },
  });

  await prisma.document.create({
    data: {
      documentNumber: '26-01-001-K',
      type: 'offer',
      documentDate: '2026-01-10',
      orderId: order1.id,
      paymentMethod: 'cash',
      clientNumber: devClient1.clientNumber,
      clientCompany: devClient1.company,
      clientFirstName: devClient1.firstName,
      clientLastName: devClient1.lastName,
      clientStreet: devClient1.street,
      clientPostalCode: devClient1.postalCode,
      clientCity: devClient1.city,
      carLicensePlate: devCar1.licensePlate,
      carManufacturer: devCar1.manufacturer,
      carModel: devCar1.model,
      carMileage: '87500',
      positions: { create: positionSnapshot },
    },
  });

  // Order 2: brake replacement (in progress) — gets an offer
  const order2 = await prisma.order.create({
    data: {
      title: 'Front Brake Replacement',
      orderDate: '2026-02-10',
      status: 'in_progress',
      paymentMethod: 'bank_transfer',
      paymentDueDate: '2026-03-10',
      kmStand: '102300',
      carId: devCar1.id,
      clientId: devClient2.id,
    },
  });
  await prisma.order.update({
    where: { id: order2.id },
    data: { orderNumber: `A${order2.id}` },
  });
  await prisma.orderPosition.createMany({
    data: [
      {
        orderId: order2.id,
        type: 'heading',
        sortOrder: 1,
        text: 'Front Brakes',
      },
      {
        orderId: order2.id,
        type: 'item',
        sortOrder: 2,
        description: 'Brake Pad Set (front)',
        pricePerUnit: '45.00',
        amount: '2',
      },
      {
        orderId: order2.id,
        type: 'item',
        sortOrder: 3,
        description: 'Brake Discs (front)',
        pricePerUnit: '89.00',
        amount: '2',
      },
      {
        orderId: order2.id,
        type: 'item',
        sortOrder: 4,
        description: 'Labor',
        pricePerUnit: '80.00',
        amount: '1.5',
      },
    ],
  });

  const order2Positions = await prisma.orderPosition.findMany({
    where: { orderId: order2.id },
    orderBy: { sortOrder: 'asc' },
  });

  await prisma.document.create({
    data: {
      documentNumber: '26-02-001-K',
      type: 'offer',
      documentDate: '2026-02-10',
      orderId: order2.id,
      paymentMethod: 'bank_transfer',
      paymentDueDate: '2026-03-10',
      clientNumber: devClient2.clientNumber,
      clientCompany: devClient2.company,
      clientFirstName: devClient2.firstName,
      clientLastName: devClient2.lastName,
      clientStreet: devClient2.street,
      clientPostalCode: devClient2.postalCode,
      clientCity: devClient2.city,
      carLicensePlate: devCar1.licensePlate,
      carManufacturer: devCar1.manufacturer,
      carModel: devCar1.model,
      carMileage: '102300',
      positions: {
        create: order2Positions.map((p) => ({
          type: p.type,
          sortOrder: p.sortOrder,
          text: p.text,
          articleId: p.articleId,
          description: p.description,
          pricePerUnit: p.pricePerUnit,
          amount: p.amount,
          discount: p.discount,
        })),
      },
    },
  });

  // Order 3: tire change (cancelled) — no documents
  const order3 = await prisma.order.create({
    data: {
      title: 'Tire Change',
      orderDate: '2026-02-20',
      status: 'cancelled',
      carId: devCar1.id,
      clientId: devClient1.id,
    },
  });
  await prisma.order.update({
    where: { id: order3.id },
    data: { orderNumber: `A${order3.id}` },
  });
  await prisma.orderPosition.createMany({
    data: [
      {
        orderId: order3.id,
        type: 'item',
        sortOrder: 1,
        description: 'Tire 205/55 R16',
        pricePerUnit: '95.00',
        amount: '4',
      },
    ],
  });

  // Orders 4–8: additional orders for K1 (John Doe) to test the preview card
  const extraOrders: {
    title: string;
    date: string;
    status: string;
    km: string;
  }[] = [
    {
      title: 'Timing Belt Replacement',
      date: '2025-09-05',
      status: 'done',
      km: '78200',
    },
    { title: 'AC Service', date: '2025-06-12', status: 'done', km: '71000' },
    {
      title: 'Windshield Replacement',
      date: '2025-03-18',
      status: 'done',
      km: '64500',
    },
    {
      title: 'Battery Replacement',
      date: '2024-11-22',
      status: 'done',
      km: '58000',
    },
    {
      title: 'Suspension Check',
      date: '2024-07-30',
      status: 'done',
      km: '51300',
    },
  ];

  for (const entry of extraOrders) {
    const o = await prisma.order.create({
      data: {
        title: entry.title,
        orderDate: entry.date,
        status: entry.status,
        kmStand: entry.km,
        carId: devCar1.id,
        clientId: devClient1.id,
      },
    });
    await prisma.order.update({
      where: { id: o.id },
      data: { orderNumber: `A${o.id}` },
    });
  }
};

seed().catch(console.error);
