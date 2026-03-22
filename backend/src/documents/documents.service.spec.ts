import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentsService } from './documents.service';

const mockPrisma = {
  order: {
    findUnique: vi.fn(),
  },
  document: {
    count: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    delete: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockOrder = {
  id: 1,
  orderNumber: 'A1',
  kmStand: null,
  paymentMethod: 'cash',
  paymentDueDate: null,
  positions: [
    {
      type: 'heading',
      sortOrder: 0,
      text: 'Labor',
      articleId: null,
      description: null,
      pricePerUnit: null,
      amount: null,
      discount: null,
    },
    {
      type: 'item',
      sortOrder: 1,
      text: null,
      articleId: 'ART-1',
      description: 'Oil',
      pricePerUnit: '10.00',
      amount: '2',
      discount: null,
    },
  ],
  car: {
    licensePlate: 'TEST-KZ 1',
    manufacturer: 'VW',
    model: 'Golf',
    vin: 'WVW123',
    color: null,
  },
  client: {
    company: null,
    firstName: 'Max',
    lastName: 'Smith',
    street: 'Sample St. 1',
    postalCode: '12345',
    city: 'Sampletown',
  },
};

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(() => {
    service = new DocumentsService(mockPrisma as never);
  });

  describe('create', () => {
    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ orderId: 999, type: 'invoice' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('generates invoice document number and copies snapshot', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      const createdDoc = {
        id: 1,
        documentNumber: '26-03-001',
        type: 'invoice',
        documentDate: '2026-03-17',
        positions: [],
      };

      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
          mockPrisma.document.count.mockResolvedValue(0);
          mockPrisma.document.create.mockResolvedValue(createdDoc);
          return fn(mockPrisma);
        },
      );

      const result = await service.create({
        orderId: 1,
        type: 'invoice',
        documentDate: '2026-03-17',
      });

      expect(result).toEqual(createdDoc);
      expect(mockPrisma.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            documentNumber: '26-03-001',
            type: 'invoice',
            orderId: 1,
            carLicensePlate: 'TEST-KZ 1',
            clientLastName: 'Smith',
            paymentMethod: 'cash',
          }),
        }),
      );
    });

    it('appends -K suffix for offer type', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);

      mockPrisma.$transaction.mockImplementation(
        async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
          mockPrisma.document.count.mockResolvedValue(2);
          mockPrisma.document.create.mockResolvedValue({
            id: 2,
            documentNumber: '26-03-003-K',
          });
          return fn(mockPrisma);
        },
      );

      await service.create({
        orderId: 1,
        type: 'offer',
        documentDate: '2026-03-17',
      });

      expect(mockPrisma.document.create).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: expect.objectContaining({
            documentNumber: '26-03-003-K',
            type: 'offer',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('returns paginated documents', async () => {
      const docs = [{ id: 1, documentNumber: '26-03-001' }];
      mockPrisma.document.count.mockResolvedValue(1);
      mockPrisma.document.findMany.mockResolvedValue(docs);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        skip: 0,
        search: undefined,
      } as never);

      expect(result.data).toEqual(docs);
      expect(result.meta.totalItems).toBe(1);
    });

    it('applies search filter', async () => {
      mockPrisma.document.count.mockResolvedValue(0);
      mockPrisma.document.findMany.mockResolvedValue([]);

      await service.findAll({
        page: 1,
        limit: 10,
        skip: 0,
        search: 'Smith',
      } as never);

      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('deletes the document', async () => {
      mockPrisma.document.delete.mockResolvedValue({ id: 1 });

      await service.remove(1);

      expect(mockPrisma.document.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
