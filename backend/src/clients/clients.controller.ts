import { Body, Controller, Post } from '@nestjs/common';

import { CreateClientDto } from '@/src/clients/client.dto';
import { ClientsService } from '@/src/clients/clients.service';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientService.create(createClientDto);
  }
}
