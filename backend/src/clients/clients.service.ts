import { Injectable } from '@nestjs/common';

import { CreateClientDto } from 'src/clients/client.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private pagination: PaginationService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const latestClientId: string =
      (
        await this.prisma.client.findFirst({
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
          },
        })
      )?.id || 'K0';

    const nextId = `K${latestClientId.slice(1) + 1}`;

    return await this.prisma.client.create({
      data: { id: nextId, ...createClientDto },
    });
  }
}
