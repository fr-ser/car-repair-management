import { Injectable } from '@nestjs/common';
import { Article } from '@prisma/client';

import {
  PaginatedResponseDto,
  SearchPaginationQueryDto,
} from '@/src/common/dto/pagination.dto';
import { PrismaService } from '@/src/prisma/prisma.service';

import { CreateArticleDto, UpdateArticleDto } from './article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  create(createArticleDto: CreateArticleDto) {
    return this.prisma.article.create({
      data: createArticleDto,
    });
  }

  async findAll(query: SearchPaginationQueryDto) {
    const { page, limit, search } = query;

    const where = search
      ? {
          OR: [{ id: { contains: search } }, { title: { contains: search } }],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: limit,
      }),
    ]);

    return new PaginatedResponseDto<Article>(data, total, { page, limit });
  }
  update(id: string, updateArticleDto: UpdateArticleDto) {
    return this.prisma.article.update({
      where: { id },
      data: updateArticleDto,
    });
  }
}
