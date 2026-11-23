import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as apiService from '@/src/services/backend-service';

import DocumentDetailPage from '../DocumentDetailPage';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' }),
}));
vi.mock('@/src/hooks/notification/useNotification', () => ({
  default: () => ({ showNotification: vi.fn() }),
}));
vi.mock('@/src/services/backend-service', () => ({
  fetchDocument: vi.fn().mockResolvedValue({
    id: 1,
    type: 'invoice',
    documentNumber: 'INV-1',
    orderId: 1,
  }),
  downloadDocumentPdf: vi.fn(),
}));
vi.mock('../components/DocumentView', () => ({
  DocumentView: () => null,
}));

describe('DocumentDetailPage PDF download', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([false, true])(
    'reenables the button after the pending download fails: %s',
    async (fails) => {
      let finishDownload!: () => void;
      let failDownload!: (error: Error) => void;
      vi.mocked(apiService.downloadDocumentPdf).mockReturnValueOnce(
        new Promise<void>((resolve, reject) => {
          finishDownload = resolve;
          failDownload = reject;
        }),
      );

      render(<DocumentDetailPage />);
      const button = await screen.findByTestId('button-document-download-pdf');
      fireEvent.click(button);
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(apiService.downloadDocumentPdf).toHaveBeenCalledTimes(1);
      await act(async () => {
        if (fails) failDownload(new Error('Download failed'));
        else finishDownload();
      });
      expect(button).toBeEnabled();
    },
  );
});
