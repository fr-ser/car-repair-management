import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/src/prisma/prisma.service';

import { PaginatedResponseDto, PaginationQueryDto } from './pagination.dto';

type ModelNames = (typeof Prisma.ModelName)[keyof typeof Prisma.ModelName];
type PrismaOperations<ModelName extends ModelNames> =
  Prisma.TypeMap['model'][ModelName]['operations'];

@Injectable()
export class PaginationService {
  constructor(private prisma: PrismaService) {}

  async paginate<ModelName extends ModelNames, ResponseDataType>(
    model: ModelName,
    query: PaginationQueryDto,
    orderBy: PrismaOperations<ModelName>['findMany']['args']['orderBy'] = {
      id: 'asc',
    },
  ): Promise<PaginatedResponseDto<ResponseDataType>> {
    const { page = 1, limit = 10 } = query;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const db = this.prisma[model as string] as any;

    const [total, data] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      db.count() as Promise<number>,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      db.findMany({
        orderBy,
        skip: query.skip,
        take: limit,
      }) as Promise<ResponseDataType[]>,
    ]);

    return new PaginatedResponseDto<ResponseDataType>(data, total, {
      page,
      limit,
    });
  }
}
