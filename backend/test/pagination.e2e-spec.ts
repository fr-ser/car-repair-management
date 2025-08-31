import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { resetDatabase } from 'test/helpers';

import { CreateArticleDto } from 'src/articles/article.dto';
import { PaginationQueryDto } from 'src/pagination/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PaginationService', () => {
  let paginationService: PaginationService;
  let prismaService: PrismaService;

  const testArticles: CreateArticleDto[] = [
    { id: 'id1', description: 'desc1', price: '1.1' },
    { id: 'id2', description: 'desc2', price: '2.2' },
    { id: 'id3', description: 'desc3', price: '3.3' },
    { id: 'id4', description: 'desc4', price: '4.4' },
    { id: 'id5', description: 'desc5', price: '5.5' },
  ];

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'DATABASE_URL') {
        return process.env.DATABASE_URL;
      }
      return null;
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaginationService,
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    paginationService = module.get<PaginationService>(PaginationService);
    prismaService = module.get<PrismaService>(PrismaService);

    await resetDatabase(prismaService);
    await prismaService.article.createMany({ data: testArticles });
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe('paginate', () => {
    it('should return paginated data with default parameters', async () => {
      const paginationQuery = new PaginationQueryDto();
      const result = await paginationService.paginate(
        'Article',
        paginationQuery,
      );

      expect(result.meta.totalItems).toBe(testArticles.length);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(paginationQuery.limit);

      for (let index = 0; index < result.data.length; index++) {
        const resultData = result.data[index];

        // the price being a decimal value messes up the comparison
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { price, ...testDataWithoutPrice } = testArticles[index];

        expect(resultData).toMatchObject(testDataWithoutPrice);
      }
    });

    it('should use provided pagination parameters', async () => {
      const paginationQuery = new PaginationQueryDto();
      paginationQuery.page = 2;
      paginationQuery.limit = 2;
      const result = await paginationService.paginate(
        'Article',
        paginationQuery,
      );

      expect(result.meta.totalItems).toBe(testArticles.length);
      expect(result.meta.page).toBe(paginationQuery.page);
      expect(result.meta.limit).toBe(paginationQuery.limit);
      expect(result.data).toHaveLength(paginationQuery.limit);
    });

    it('should use custom orderBy parameter', async () => {
      const paginationQuery = new PaginationQueryDto();
      paginationQuery.limit = 1;
      const result = await paginationService.paginate<
        'Article',
        CreateArticleDto
      >('Article', paginationQuery, { id: 'desc' });

      expect(result.data[0].id).toBe(testArticles[testArticles.length - 1].id);
    });
  });
});
