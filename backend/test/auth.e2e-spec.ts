import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { IncomingMessage } from 'http';
import pactum from 'pactum';
import { createTestClientApp, resetDatabase } from 'test/helpers';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { AuthDto } from 'src/auth/auth.dto';
import { AuthService } from 'src/auth/auth.service';
import { AUTH_JWT_COOKIE_KEY } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: number;

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

  describe('Authentication', () => {
    const testCredentials: AuthDto = {
      userName: 'test-user',
      password: 'test-pass',
    };

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          userName: testCredentials.userName,
          hash: await argon.hash(testCredentials.password),
        },
      });
      userId = user.id;
    });

    it('should sign in with right credentials and set JWT cookie', async () => {
      const response = (await pactum
        .spec()
        .post('/api/auth/sign-in')
        .withBody(testCredentials)
        .expectStatus(201)) as IncomingMessage;

      const cookies = response.headers['set-cookie'];
      expect(cookies).toHaveLength(1);
      expect(cookies![0]).toContain(`${AUTH_JWT_COOKIE_KEY}=`);
      expect(cookies![0]).toContain('HttpOnly');
    });

    it('should not sign in with wrong credentials', async () => {
      await pactum
        .spec()
        .post('/api/auth/sign-in')
        .withBody({ ...testCredentials, password: 'wrong' })
        .expectStatus(403);
    });

    describe('JWT Authentication Guard with Cookies', () => {
      it('should block access to protected endpoints without cookie', async () => {
        await pactum.spec().get('/api/articles').expectStatus(401);
      });

      it('should allow access to protected endpoints with valid cookie', async () => {
        const jwt = await app
          .get(AuthService)
          .getSignedToken(userId, testCredentials.userName);

        await pactum
          .spec()
          .get('/api/articles')
          .withCookies(AUTH_JWT_COOKIE_KEY, jwt)
          .expectStatus(200);
      });
    });
  });
});
