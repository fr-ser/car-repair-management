import { Injectable, NotFoundException } from '@nestjs/common';

import {
  PaginatedResponseDto,
  SearchPaginationQueryDto,
} from '@/src/common/dto/pagination.dto';
import { PrismaService } from '@/src/prisma/prisma.service';

import { CreateDocumentDto, DOCUMENT_TYPE } from './document.dto';
import { renderMultiplePDF, renderPDF } from './renderPDF';
import { buildZugferdInvoiceData, embedZugferd } from './zugferd';

const documentInclude = {
  positions: { orderBy: { sortOrder: 'asc' as const } },
};

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDocumentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        positions: { orderBy: { sortOrder: 'asc' } },
        car: true,
        client: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    const documentDate =
      dto.documentDate ?? new Date().toISOString().slice(0, 10);

    return this.prisma.$transaction(async (tx) => {
      // Generate document number: YY-MM-### (offer gets -K suffix)
      const yy = documentDate.slice(2, 4);
      const mm = documentDate.slice(5, 7);
      const prefix = `${yy}-${mm}-`;

      const existingCount = await tx.document.count({
        where: { documentNumber: { startsWith: prefix } },
      });
      const seq = String(existingCount + 1).padStart(3, '0');
      const isOffer = dto.type === DOCUMENT_TYPE.OFFER;
      const documentNumber = isOffer ? `${prefix}${seq}-K` : `${prefix}${seq}`;

      const data = {
        documentNumber,
        type: dto.type,
        documentDate,
        orderId: order.id,
        paymentMethod: order.paymentMethod,
        paymentDueDate: order.paymentDueDate,
        clientNumber: order.client.clientNumber,
        clientCompany: order.client.company?.trim() ?? null,
        clientFirstName: order.client.firstName?.trim() ?? null,
        clientLastName: order.client.lastName?.trim() ?? null,
        clientStreet: order.client.street,
        clientPostalCode: order.client.postalCode,
        clientCity: order.client.city,
        carLicensePlate: order.car.licensePlate,
        carManufacturer: order.car.manufacturer.trim(),
        carModel: order.car.model.trim(),
        carVin: order.car.vin,
        carMileage: order.kmStand,
        positions: {
          create: order.positions.map((p) => ({
            type: p.type,
            sortOrder: p.sortOrder,
            text: p.text,
            articleId: p.articleId?.trim() ?? null,
            description: p.description?.trim() ?? null,
            pricePerUnit: p.pricePerUnit,
            amount: p.amount,
            discount: p.discount,
          })),
        },
      };

      if (!isOffer) {
        // just to validate that it is possible or throw otherwise
        buildZugferdInvoiceData({ ...data, positions: data.positions.create });
      }

      const document = await tx.document.create({
        data,
        include: documentInclude,
      });

      return document;
    });
  }

  async findAll(query: SearchPaginationQueryDto) {
    const { page, limit, search } = query;

    const where = search
      ? {
          OR: [
            { documentNumber: { contains: search } },
            { clientLastName: { contains: search } },
            { clientCompany: { contains: search } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: limit,
      }),
    ]);

    return new PaginatedResponseDto(data, total, { page, limit });
  }

  async findByOrderId(orderId: number) {
    return this.prisma.document.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.document.findUniqueOrThrow({
      where: { id },
      include: documentInclude,
    });
  }

  async remove(id: number) {
    return this.prisma.document.delete({ where: { id } });
  }

  async getPdf(id: number): Promise<Buffer> {
    const document = await this.prisma.document.findUniqueOrThrow({
      where: { id },
      include: documentInclude,
    });

    const basePdf = await renderPDF(document);
    if (document.type === DOCUMENT_TYPE.INVOICE) {
      return embedZugferd(basePdf, document);
    }
    return basePdf;
  }

  async getBulkPdf(ids: number[]): Promise<Buffer> {
    const documents = await this.prisma.document.findMany({
      where: { id: { in: ids } },
      include: documentInclude,
      orderBy: { documentNumber: 'asc' },
    });

    return renderMultiplePDF(documents);
  }
}
