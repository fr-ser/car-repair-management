import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from 'src/pagination/pagination.dto';

import { CreateArticleDto } from './article.dto';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.articlesService.findAll(query);
  }
}
