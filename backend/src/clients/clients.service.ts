import { Injectable } from '@nestjs/common';

import { PaginationQueryDto } from 'src/pagination/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateClientDto, UpdateClientDto } from './client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private pagination: PaginationService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    return this.prisma.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          ...createClientDto,
          clientNumber: '', // temporary placeholder
        },
      });

      // Update with the generated clientNumber
      return tx.client.update({
        where: { id: newClient.id },
        data: { clientNumber: `K${newClient.id}` },
      });
    });
  }

  findAll(query: PaginationQueryDto) {
    return this.pagination.paginate('Client', query);
  }

  findOne(id: number) {
    return this.prisma.client.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  remove(id: number) {
    return this.prisma.client.delete({ where: { id } });
  }
}
