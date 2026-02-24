import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import {
  PaginatedResponseDto,
  SearchPaginationQueryDto,
} from '@/src/common/dto/pagination.dto';
import { PrismaService } from '@/src/prisma/prisma.service';

import { CreateOrderDto, OrderStatus, UpdateOrderDto } from './order.dto';

const orderInclude = {
  positions: { orderBy: { sortOrder: 'asc' as const } },
  car: { select: { carNumber: true, licensePlate: true } },
  client: {
    select: { clientNumber: true, firstName: true, lastName: true },
  },
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          title: dto.title,
          description: dto.description,
          orderDate: dto.orderDate,
          kmStand: dto.kmStand,
          status: dto.status ?? OrderStatus.IN_PROGRESS,
          paymentMethod: dto.paymentMethod,
          paymentDueDate: dto.paymentDueDate,
          orderNumber: '',
          carId: dto.carId,
          clientId: dto.clientId,
          positions: {
            create: dto.positions ?? [],
          },
        },
        include: orderInclude,
      });

      const updated = await tx.order.update({
        where: { id: order.id },
        data: { orderNumber: `A${order.id}` },
        include: orderInclude,
      });

      await this._adjustInventory(tx, [], updated.positions);

      return updated;
    });
  }

  async findAll(query: SearchPaginationQueryDto) {
    const { page, limit, search } = query;

    const where = search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { title: { contains: search } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: limit,
        include: orderInclude,
      }),
    ]);

    return new PaginatedResponseDto(data, total, { page, limit });
  }

  async findOne(id: number) {
    return this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: orderInclude,
    });
  }

  async update(id: number, dto: UpdateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUniqueOrThrow({
        where: { id },
        include: { positions: true },
      });

      if (dto.positions !== undefined) {
        await tx.orderPosition.deleteMany({ where: { orderId: id } });
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          orderDate: dto.orderDate,
          kmStand: dto.kmStand,
          status: dto.status,
          paymentMethod: dto.paymentMethod,
          paymentDueDate: dto.paymentDueDate,
          carId: dto.carId,
          clientId: dto.clientId,
          ...(dto.positions !== undefined && {
            positions: { create: dto.positions },
          }),
        },
        include: orderInclude,
      });

      if (dto.positions !== undefined) {
        await this._adjustInventory(tx, existing.positions, updated.positions);
      }

      return updated;
    });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id },
        include: { positions: true },
      });

      await this._adjustInventory(tx, order.positions, []);

      return tx.order.delete({ where: { id } });
    });
  }

  private async _adjustInventory(
    tx: Prisma.TransactionClient,
    oldPositions: Array<{
      type: string;
      articleId: string | null;
      amount: Decimal | null;
    }>,
    newPositions: Array<{
      type: string;
      articleId: string | null;
      amount: Decimal | null;
    }>,
  ) {
    const delta = new Map<string, Decimal>();

    for (const pos of oldPositions) {
      if (pos.type === 'item' && pos.articleId && pos.amount != null) {
        const prev = delta.get(pos.articleId) ?? new Decimal(0);
        delta.set(pos.articleId, prev.plus(pos.amount));
      }
    }

    for (const pos of newPositions) {
      if (pos.type === 'item' && pos.articleId && pos.amount != null) {
        const prev = delta.get(pos.articleId) ?? new Decimal(0);
        delta.set(pos.articleId, prev.minus(pos.amount));
      }
    }

    for (const [articleId, change] of delta.entries()) {
      if (!change.isZero()) {
        await tx.article.updateMany({
          where: { id: articleId, amount: { not: null } },
          data: { amount: { increment: change } },
        });
      }
    }
  }
}
