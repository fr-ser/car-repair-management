import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pactum from 'pactum';
import { createTestClientApp, createUser, resetDatabase } from 'test/helpers';

import { CreateArticleDto } from 'src/articles/article.dto';
import { PrismaService } from 'src/prisma/prisma.service';

describe('Articles e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService;
  let globalUserAccessToken: string;

  beforeAll(async () => {
    [, app] = await createTestClientApp();

    prisma = app.get(PrismaService);
    config = app.get(ConfigService);
    pactum.request.setBaseUrl(`http://localhost:${config.get('PORT')}`);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    globalUserAccessToken = await createUser(app, {});
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('can create articles', async () => {
    const article: CreateArticleDto = {
      id: 'foo',
      description: 'bar',
      price: '1.4',
    };

    await pactum
      .spec()
      .post('/articles')
      .withHeaders({ Authorization: `Bearer ${globalUserAccessToken}` })
      .withBody(article)
      .expectStatus(201)
      .expectJsonLike(article);
  });

  it('can get articles', async () => {
    const articleDtos: CreateArticleDto[] = [
      { id: 'foo1', description: 'bar1', price: '1.4' },
      { id: 'foo2', description: 'bar2', price: '2.4' },
    ];
    await prisma.article.createMany({
      data: articleDtos,
    });

    await pactum
      .spec()
      .get('/articles')
      .withHeaders({ Authorization: `Bearer ${globalUserAccessToken}` })
      .withQueryParams({ page: 1, limit: 10 })
      .expectStatus(200)
      .expectJsonLike({
        data: articleDtos,
        meta: { totalItems: articleDtos.length },
      });
  });
});
