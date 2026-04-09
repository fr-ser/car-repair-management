import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { SearchPaginationQueryDto } from '@/src/common/dto/pagination.dto';

import { BulkPdfDto, CreateDocumentDto } from './document.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Post('bulk-pdf')
  async getBulkPdf(@Body() dto: BulkPdfDto, @Res() res: Response) {
    const buffer = await this.documentsService.getBulkPdf(dto.ids);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Dokumente.pdf"',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get()
  findAll(@Query() query: SearchPaginationQueryDto) {
    return this.documentsService.findAll(query);
  }

  @Get('by-order/:orderId')
  findByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.documentsService.findByOrderId(orderId);
  }

  @Get(':id/pdf')
  async getPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.documentsService.getPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.remove(id);
  }
}
