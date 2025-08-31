import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import * as pactum from 'pactum';
import { createTestClientApp, resetDatabase } from 'test/helpers';

import { AuthDto } from 'src/auth/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeAll(async () => {
    [, app] = await createTestClientApp();

    prisma = app.get(PrismaService);
    config = app.get(ConfigService);
    pactum.request.setBaseUrl(`http://localhost:${config.get('PORT')}`);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('Auth', () => {
    it('should sign in with right credentials', async () => {
      const testCredentials: AuthDto = {
        email: 'test@test.test',
        password: '123',
      };
      await prisma.user.create({
        data: {
          email: testCredentials.email,
          hash: await argon.hash(testCredentials.password),
        },
      });

      return pactum
        .spec()
        .post('/auth/sign-in')
        .withBody(testCredentials)
        .expectStatus(201);
    });

    it('should not sign in with wrong credentials', async () => {
      const testCredentials: AuthDto = {
        email: 'test@test.test',
        password: '123',
      };
      await prisma.user.create({
        data: {
          email: testCredentials.email,
          hash: await argon.hash(testCredentials.password),
        },
      });

      return pactum
        .spec()
        .post('/auth/sign-in')
        .withBody({ ...testCredentials, password: 'wrong' })
        .expectStatus(403);
    });
  });
});
