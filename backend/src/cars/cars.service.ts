import { Injectable } from '@nestjs/common';

import { PaginationQueryDto } from 'src/pagination/pagination.dto';
import { PaginationService } from 'src/pagination/pagination.service';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCarDto, UpdateCarDto } from './cars.dto';

@Injectable()
export class CarsService {
  constructor(
    private prisma: PrismaService,
    private pagination: PaginationService,
  ) {}

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

  findAll(query: PaginationQueryDto) {
    return this.pagination.paginate('Car', query);
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
