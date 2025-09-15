import { Injectable } from '@nestjs/common';
import { Client } from '@prisma/client';

import {
  PaginatedResponseDto,
  SearchPaginationQueryDto,
} from '@/src/common/dto/pagination.dto';
import { PrismaService } from '@/src/prisma/prisma.service';

import { CreateClientDto, UpdateClientDto } from './client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

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

  async findAll(query: SearchPaginationQueryDto) {
    const { page, limit, search } = query;

    const where = search
      ? {
          OR: [
            { clientNumber: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { company: { contains: search } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: limit,
      }),
    ]);

    return new PaginatedResponseDto<Client>(data, total, { page, limit });
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
