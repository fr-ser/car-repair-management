import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import * as pactum from 'pactum';
import { createTestClientApp, resetDatabase } from 'test/helpers';

import { AuthDto } from 'src/auth/dto';
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
    const dto: AuthDto = {
      email: 'test@test.test',
      password: '123',
    };

    describe('Sign Up', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ passport: dto.password })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/sign-up').expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/sign-up')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Sign In', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ passport: dto.password })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/sign-in').expectStatus(400);
      });

      it('should sign in', async () => {
        await prisma.user.create({
          data: {
            email: dto.email,
            hash: await argon.hash(dto.password),
          },
        });

        return pactum
          .spec()
          .post('/auth/sign-in')
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
});
