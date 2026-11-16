import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import { renderPDF } from '@/src/documents/renderPDF';
import { embedZugferd } from '@/src/documents/zugferd';

import { BackupService } from './backup.service';

vi.mock('@/src/documents/renderPDF', () => ({ renderPDF: vi.fn() }));
vi.mock('@/src/documents/zugferd', () => ({ embedZugferd: vi.fn() }));

describe('BackupService.backupDocuments', () => {
  it('backs up later documents and retries failures without advancing the checkpoint', async () => {
    const docs = [
      {
        id: 1,
        type: 'invoice',
        documentDate: '2026-01-01',
        documentNumber: '1',
      },
      {
        id: 2,
        type: 'invoice',
        documentDate: '2026-01-02',
        documentNumber: '2',
      },
    ];
    const prisma = { document: { findMany: vi.fn().mockResolvedValue(docs) } };
    const dropbox = {
      downloadFile: vi
        .fn()
        .mockResolvedValue(Buffer.from('2025-01-01T00:00:00Z')),
      uploadFile: vi.fn().mockResolvedValue(undefined),
    };
    const service = new BackupService(
      prisma as never,
      dropbox as never,
      {} as never,
    );
    const pdf = Buffer.from('PDF');
    vi.mocked(renderPDF).mockResolvedValue(pdf);
    vi.mocked(embedZugferd)
      .mockRejectedValueOnce(new Error('Invalid invoice'))
      .mockResolvedValue(pdf);
    const logger = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    await expect(service.backupDocuments()).rejects.toThrow(
      'Document backup failed',
    );
    expect(dropbox.uploadFile).toHaveBeenCalledWith(
      '/backups/dokumente/2026/2.pdf',
      pdf,
    );
    expect(dropbox.uploadFile).not.toHaveBeenCalledWith(
      '/backups/dokumente/.status.txt',
      expect.anything(),
    );
    expect(logger).toHaveBeenCalled();

    await service.backupDocuments();
    expect(dropbox.uploadFile).toHaveBeenCalledWith(
      '/backups/dokumente/2026/1.pdf',
      pdf,
    );
    expect(dropbox.uploadFile).toHaveBeenCalledWith(
      '/backups/dokumente/.status.txt',
      expect.any(String),
    );
    logger.mockRestore();
  });
});
