import { Injectable } from '@nestjs/common';

import { PaginationQueryDto } from 'src/pagination/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateArticleDto } from './article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    private prisma: PrismaService,
    private pagination: PaginationService,
  ) {}

  create(createArticleDto: CreateArticleDto) {
    return this.prisma.article.create({
      data: createArticleDto,
    });
  }

  findAll(query: PaginationQueryDto) {
    return this.pagination.paginate('Article', query);
  }
}
