import { Injectable } from '@nestjs/common';
import { Car } from '@prisma/client';

import {
  PaginatedResponseDto,
  SearchPaginationQueryDto,
} from '@/src/common/dto/pagination.dto';
import { PrismaService } from '@/src/prisma/prisma.service';

import { CreateCarDto, UpdateCarDto } from './cars.dto';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async create(createCarDto: CreateCarDto) {
    return this.prisma.$transaction(async (tx) => {
      const newCar = await tx.car.create({
        data: {
          ...createCarDto,
          carNumber: '', // temporary placeholder
        },
      });

      // Update with the generated carNumber
      return tx.car.update({
        where: { id: newCar.id },
        data: { carNumber: `A${newCar.id}` },
      });
    });
  }

  async findAll(query: SearchPaginationQueryDto) {
    const { page, limit, search } = query;

    const where = search
      ? {
          OR: [
            { carNumber: { contains: search } },
            { licensePlate: { contains: search } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.car.count({ where }),
      this.prisma.car.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: limit,
      }),
    ]);

    return new PaginatedResponseDto<Car>(data, total, { page, limit });
  }

  findOne(id: number) {
    return this.prisma.car.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, updateCarDto: UpdateCarDto) {
    return this.prisma.car.update({
      where: { id },
      data: updateCarDto,
    });
  }

  remove(id: number) {
    return this.prisma.car.delete({ where: { id } });
  }
}
