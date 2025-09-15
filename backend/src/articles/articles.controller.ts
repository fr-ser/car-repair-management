import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { SearchPaginationQueryDto } from '@/src/common/dto/pagination.dto';

import { CreateArticleDto, UpdateArticleDto } from './article.dto';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  findAll(@Query() query: SearchPaginationQueryDto) {
    return this.articlesService.findAll(query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateCarDto);
  }
}
