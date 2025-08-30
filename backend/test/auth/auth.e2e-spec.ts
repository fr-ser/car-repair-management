import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { createTestClientApp, resetDatabase } from 'test/helpers';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeAll(async () => {
    [, app] = await createTestClientApp();

    prisma = app.get(PrismaService);
    config = app.get(ConfigService);
    await resetDatabase(prisma);
    pactum.request.setBaseUrl(`http://localhost:${config.get('PORT')}`);
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
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ passport: dto.password })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ passport: dto.password })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
});
