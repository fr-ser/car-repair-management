import { describe, expect, it, vi } from 'vitest';

import { DocumentsController } from './documents.controller';

describe('DocumentsController', () => {
  it.each([
    ['invoice', '26-01-001', '26-01-001_ZUGFeRD.pdf'],
    ['offer', '26-01-002-K', '26-01-002-K.pdf'],
    ['invoice', null, '42_ZUGFeRD.pdf'],
  ])(
    'uses the document number for %s PDF downloads',
    async (type, number, filename) => {
      const service = {
        findOne: vi.fn().mockResolvedValue({ type, documentNumber: number }),
        getPdf: vi.fn().mockResolvedValue(Buffer.from('pdf')),
      };
      const response = { set: vi.fn(), end: vi.fn() };
      const controller = new DocumentsController(service as never);

      await controller.getPdf(42, response as never);

      expect(response.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition': `attachment; filename="${filename}"`,
        }),
      );
    },
  );
});
