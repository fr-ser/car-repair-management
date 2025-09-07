import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateClientDto, UpdateClientDto } from '@/src/clients/client.dto';
import { ClientsService } from '@/src/clients/clients.service';

import { PaginationQueryDto } from '../pagination/pagination.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientService.create(createClientDto);
  }

  @Get()
  async get(@Query() query: PaginationQueryDto) {
    return await this.clientService.findAll(query);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return await this.clientService.update(id, updateClientDto);
  }
}
