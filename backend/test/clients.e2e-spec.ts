import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pactum from 'pactum';
import { createTestClientApp, getValidJwt, resetDatabase } from 'test/helpers';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import { CreateClientDto, UpdateClientDto } from '@/src/clients/client.dto';
import { AUTH_JWT_COOKIE_KEY } from '@/src/config';
import { PrismaService } from '@/src/prisma/prisma.service';

describe('Clients e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    [, app] = await createTestClientApp();

    prisma = app.get(PrismaService);
    const config = app.get(ConfigService);
    pactum.request.setBaseUrl(`http://localhost:${config.get('PORT')}`);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('can create clients', async () => {
    const client: CreateClientDto = {
      firstName: 'Test',
      phoneNumber: '+491234567890',
      email: 'test@example.com',
    };

    await pactum
      .spec()
      .post('/api/clients')
      .withCookies(AUTH_JWT_COOKIE_KEY, await getValidJwt(app))
      .withBody(client)
      .expectStatus(201)
      .expectJsonLike(client);
  });

  it('can get clients', async () => {
    const clientDtos: CreateClientDto[] = [
      {
        firstName: 'Test',
        phoneNumber: '+49111111111',
        email: 'test@example.com',
      },
      {
        firstName: 'Test2',
        phoneNumber: '+49222222222',
        email: 'test2@example.com',
      },
    ];
    await prisma.client.createMany({
      data: clientDtos,
    });

    await pactum
      .spec()
      .get('/api/clients')
      .withCookies(AUTH_JWT_COOKIE_KEY, await getValidJwt(app))
      .withQueryParams({ page: 1, limit: 10 })
      .expectStatus(200)
      .expectJsonLike({
        data: clientDtos,
        meta: { totalItems: clientDtos.length },
      });
  });

  it('can edit a client', async () => {
    const previousClient: CreateClientDto = {
      firstName: 'Test',
      phoneNumber: '+49111111111',
      email: 'test@example.com',
    };

    const createdClient = await prisma.client.create({ data: previousClient });

    const newFields: UpdateClientDto = {
      firstName: 'Test Updated',
      phoneNumber: '+49111111112',
      email: 'test_updated@example.com',
    };

    await pactum
      .spec()
      .patch(`/api/clients/${createdClient.id}`)
      .withCookies(AUTH_JWT_COOKIE_KEY, await getValidJwt(app))
      .withBody(newFields)
      .expectStatus(200)
      .expectJsonLike({ ...previousClient, ...newFields });
  });
});
