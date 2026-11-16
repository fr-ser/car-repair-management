import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as apiClient from '@/src/services/backend-service';

import { DocumentsTable } from '../DocumentsTable';

vi.mock('@/src/hooks/confirmation/useConfirmation', () => ({
  default: () => ({ confirm: vi.fn() }),
}));
vi.mock('@/src/hooks/notification/useNotification', () => ({
  default: () => ({ showNotification: vi.fn() }),
}));
vi.mock('@/src/hooks/useTableData', () => ({
  default: () => ({
    items: [
      {
        id: 1,
        type: 'invoice',
        documentNumber: 'INV-1',
        documentDate: '2026-01-01',
      },
      {
        id: 2,
        type: 'invoice',
        documentNumber: 'INV-2',
        documentDate: '2026-01-02',
      },
    ],
    totalItems: 2,
    isPending: false,
    page: 0,
    rowsPerPage: 10,
    searchTerm: '',
    refetch: vi.fn(),
    handlers: {
      onPageChange: vi.fn(),
      onSearchChange: vi.fn(),
      onRowsPerPageChange: vi.fn(),
    },
  }),
}));
vi.mock('@/src/services/backend-service', () => ({
  fetchDocuments: vi.fn(),
  downloadDocumentPdf: vi.fn(),
  downloadDocumentsPdf: vi.fn(),
}));

describe('DocumentsTable downloads', () => {
  beforeEach(() => vi.clearAllMocks());

  it('downloads one selected invoice as an e-invoice', async () => {
    render(<DocumentsTable handleViewDocument={vi.fn()} />);
    fireEvent.click(
      within(screen.getByTestId('document-row-1')).getByRole('checkbox'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'PDF (1)' }));

    await waitFor(() => {
      expect(apiClient.downloadDocumentPdf).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, documentNumber: 'INV-1' }),
      );
    });
    expect(apiClient.downloadDocumentsPdf).not.toHaveBeenCalled();
  });

  it('warns and uses the bulk endpoint for multiple documents', async () => {
    render(<DocumentsTable handleViewDocument={vi.fn()} />);
    fireEvent.click(
      within(screen.getByTestId('document-row-1')).getByRole('checkbox'),
    );
    fireEvent.click(
      within(screen.getByTestId('document-row-2')).getByRole('checkbox'),
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Sammel-PDFs');
    fireEvent.click(screen.getByRole('button', { name: 'PDF (2)' }));

    await waitFor(() => {
      expect(apiClient.downloadDocumentsPdf).toHaveBeenCalledWith([1, 2]);
    });
    expect(apiClient.downloadDocumentPdf).not.toHaveBeenCalled();
  });
});
