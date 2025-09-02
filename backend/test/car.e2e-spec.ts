import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pactum from 'pactum';
import { createTestClientApp, getValidJwt, resetDatabase } from 'test/helpers';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { CreateCarDto } from '@/src/cars/cars.dto';
import { AUTH_JWT_COOKIE_KEY } from '@/src/config';
import { PrismaService } from '@/src/prisma/prisma.service';

describe('Cars e2e', () => {
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

  it('can create car with a proper carNumber', async () => {
    const car: CreateCarDto = {
      licensePlate: 'foo',
      manufacturer: 'bar',
      model: 'baz',
    };

    const response = await pactum
      .spec()
      .post('/api/cars')
      .withCookies(AUTH_JWT_COOKIE_KEY, await getValidJwt(app))
      .withBody(car)
      .expectStatus(201)
      .expectJsonLike(car)
      .toss();

    const result = response.body;
    expect(result).toBeDefined();
    expect(result.carNumber).toBe(`A${result.id}`);
  });
});
