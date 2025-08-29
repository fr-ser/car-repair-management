import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bookmark } from 'generated/prisma';
import * as pactum from 'pactum';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  createDatabase,
  createTestClientApp,
  createUser,
  dropDatabase,
} from 'test/helpers';

describe('Bookmark e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;
  let globalUserAccessToken: string;
  beforeAll(async () => {
    await createDatabase();
    [, app] = await createTestClientApp();

    prisma = app.get(PrismaService);
    config = app.get(ConfigService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(`http://localhost:${config.get('PORT')}`);

    globalUserAccessToken = await createUser({});
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
    await dropDatabase();
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .expectStatus(200)
          .expectJsonLength(0)
          .expectBody([]);
      });
    });
    describe('Create bookmark', () => {
      it('should get bookmarks', () => {
        const dto: CreateBookmarkDto = {
          title: 'Test',
          link: 'example.com',
        };
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .stores('bookmark', '.');
      });
    });
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .expectStatus(200)
          .expectJsonLength(1)
          .expectBody([pactum.stash.getDataStore()['bookmark']]);
      });
    });
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark.id}')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .expectStatus(200)
          .expectBody(pactum.stash.getDataStore()['bookmark']);
      });
    });
    describe('Edit bookmark by id', () => {
      it('should edit bookmark by id', async () => {
        const dto: EditBookmarkDto = {
          title: 'Updated Title',
          description: 'Updated Test Description',
        };
        const oldBookmark: Bookmark = await pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .withBody({
            title: 'Test',
            link: 'example.com',
          })
          .expectStatus(201)
          .returns('.');
        await new Promise((res) => setTimeout(res, 2));
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark.id}')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
          .expectBodyContains(oldBookmark.link) // check that the link is not changed
          .expect((ctx) => {
            // check that updatedAt field is updated
            expect(
              new Date(
                (ctx.res.body as Bookmark).updatedAt,
              ).getUTCMilliseconds(),
            ).toBeGreaterThan(
              new Date(oldBookmark.updatedAt).getUTCMilliseconds(),
            );
          });
      });
    });
    describe('Delete bookmark by id', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark.id}')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .expectStatus(204);
      });

      it('should not get the bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmark.id}')
          .withHeaders({
            Authorization: `Bearer ${globalUserAccessToken}`,
          })
          .expectStatus(200)
          .expectBody('');
      });
    });
  });
});
