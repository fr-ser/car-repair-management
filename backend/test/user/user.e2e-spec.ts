import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pactum from 'pactum';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';
import { createTestClientApp, createUser, resetDatabase } from 'test/helpers';

describe('User e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;
  let globalUserAccessToken: string;

  beforeAll(async () => {
    [, app] = await createTestClientApp();

    prisma = app.get(PrismaService);
    config = app.get(ConfigService);
    await resetDatabase(prisma);
    pactum.request.setBaseUrl(`http://localhost:${config.get('PORT')}`);

    globalUserAccessToken = await createUser({});
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .expectStatus(200);
      });
    });
    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Updated',
          email: 'updated@updated.updated',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });
});
