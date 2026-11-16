import { afterEach, describe, expect, it, vi } from 'vitest';

import { RequestError } from '@/src/types/errors';

import { downloadDocumentPdf, downloadDocumentsPdf } from '../backend-service';

describe('PDF downloads', () => {
  const invoice = { id: 1, type: 'invoice', documentNumber: 'invoice' };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('surfaces the invoice validation error returned by the backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: 'Position 1 is incomplete' }),
      }),
    );

    await expect(downloadDocumentPdf(invoice)).rejects.toThrowError(
      new RequestError('Error! Position 1 is incomplete'),
    );
  });

  it('uses the same error handling for bulk downloads', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'Content-Type': 'application/json' }),
        json: async () => ({ message: ['Invalid document ID'] }),
      }),
    );

    await expect(downloadDocumentsPdf([1])).rejects.toThrowError(
      new RequestError('Error! Invalid document ID'),
    );
  });

  it('redirects unauthorized downloads to login without consuming the PDF', async () => {
    const location = { href: '' };
    const blob = vi.fn();
    vi.stubGlobal('window', { location });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers(),
        blob,
      }),
    );

    await downloadDocumentPdf(invoice);

    expect(location.href).toBe('/login');
    expect(blob).not.toHaveBeenCalled();
  });

  it('uses the standard error for a non-JSON failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        headers: new Headers({ 'Content-Type': 'text/html' }),
      }),
    );

    await expect(downloadDocumentPdf(invoice)).rejects.toThrowError(
      new RequestError('Error! Unknown error'),
    );
  });

  it('downloads the PDF using the supplied filename', async () => {
    const blob = new Blob(['PDF'], { type: 'application/pdf' });
    const createObjectURL = vi.fn().mockReturnValue('blob:invoice');
    const revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('invoice_ZUGFeRD.pdf');
      });
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, blob: async () => blob }),
    );

    await downloadDocumentPdf(invoice);

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:invoice');
  });
});
