import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { describe, expect, test, vi } from 'vitest';

import { Prisma } from '@/src/generated/prisma/client';

import { formatInvoiceLineNumber, invoiceLineNet } from '@/src/common/helpers';
import * as config from '@/src/config';

import { renderMultiplePDF, renderPDF } from './renderPDF';
import {
  multipleInvoice1,
  multipleInvoice2,
  singleInvoice,
} from './renderPDF.fixtures';

const SNAPSHOT_DIR = path.join(__dirname, 'test-snapshots');

function compareToSnapshot(buffer: Buffer, snapshotFile: string) {
  const snapshotPath = path.join(SNAPSHOT_DIR, snapshotFile);
  const expectedLines = fs
    .readFileSync(snapshotPath, { encoding: 'latin1' })
    .split('\n');
  buffer
    .toString('latin1')
    .split('\n')
    .forEach((resultLine, index) => {
      const expectedLine = expectedLines[index];
      if (expectedLine?.startsWith('(D:') && expectedLine.endsWith('Z)')) {
        // creation date differs between runs
        expect(resultLine.startsWith('(D:')).toBe(true);
      } else if (expectedLine?.startsWith('/ID [<')) {
        // content hash differs between runs
        expect(resultLine.startsWith('/ID [<')).toBe(true);
      } else {
        expect(resultLine).toEqual(expectedLine);
      }
    });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Rendering PDFs', () => {
  test('generates PDF 1.7 for single and combined documents', async () => {
    const single = await renderPDF(singleInvoice);
    const combined = await renderMultiplePDF([singleInvoice, multipleInvoice1]);
    expect(single.subarray(0, 8).toString('ascii')).toBe('%PDF-1.7');
    expect(combined.subarray(0, 8).toString('ascii')).toBe('%PDF-1.7');
  });

  test('embeds both fonts used by single and combined documents', async () => {
    const single = await renderPDF(singleInvoice, { compress: false });
    const combined = await renderMultiplePDF(
      [singleInvoice, multipleInvoice1],
      { compress: false },
    );

    for (const pdf of [single, combined]) {
      const contents = pdf.toString('latin1');
      expect(contents.split('/FontFile2').length - 1).toBe(2);
      expect(contents).toContain('LiberationSerif');
      expect(contents).not.toContain('/BaseFont /Times-');
    }
  });

  test.each([1234567.89, 12345678901.23])(
    'fits or accommodates wrapped numeric values for quantity %s',
    async (amount) => {
      const text = vi.spyOn(PDFDocument.prototype, 'text');
      const metrics = new PDFDocument();
      try {
        const quantity = formatInvoiceLineNumber(amount);
        const net = formatInvoiceLineNumber(invoiceLineNet(2, amount, 5));
        await renderPDF(
          {
            ...singleInvoice,
            positions: [
              {
                ...singleInvoice.positions[1],
                amount,
                pricePerUnit: 2,
                discount: 5,
              },
              { ...singleInvoice.positions[1], description: 'Next item' },
            ],
          },
          { compress: false },
        );
        const quantityCall = text.mock.calls.find(
          (args) => args[0] === quantity,
        );
        const netCall = text.mock.calls.find((args) => args[0] === net);
        const nextCall = text.mock.calls.find(
          (args) => args[0] === 'Next item',
        );
        const quantityOptions = quantityCall?.[3];
        const netOptions = netCall?.[3];
        const quantityY = quantityCall?.[2];
        const nextY = nextCall?.[2];
        if (
          !quantityOptions ||
          !netOptions ||
          typeof quantityOptions !== 'object' ||
          typeof netOptions !== 'object' ||
          !('width' in quantityOptions) ||
          !('width' in netOptions) ||
          typeof quantityOptions.width !== 'number' ||
          typeof netOptions.width !== 'number' ||
          typeof quantityY !== 'number' ||
          typeof nextY !== 'number'
        ) {
          throw new Error('Numeric cell layout was not recorded');
        }

        metrics
          .font(path.join(__dirname, 'fonts', 'LiberationSerif-Regular.ttf'))
          .fontSize(9);
        if (amount === 1234567.89) {
          expect(metrics.widthOfString(quantity)).toBeLessThanOrEqual(
            quantityOptions.width,
          );
          expect(metrics.widthOfString(net)).toBeLessThanOrEqual(
            netOptions.width,
          );
        } else {
          expect(metrics.widthOfString(quantity)).toBeGreaterThan(
            quantityOptions.width,
          );
        }
        const quantityHeight = metrics.heightOfString(quantity, {
          width: quantityOptions.width,
        });
        const netHeight = metrics.heightOfString(net, {
          width: netOptions.width,
        });
        expect(nextY - quantityY).toBeGreaterThanOrEqual(
          Math.max(quantityHeight, netHeight),
        );
      } finally {
        metrics.end();
        text.mockRestore();
      }
    },
  );

  test.each([null, ''])(
    'keeps info table rows separate when payment method is %s',
    async (paymentMethod) => {
      const text = vi.spyOn(PDFDocument.prototype, 'text');
      try {
        await renderPDF(
          { ...singleInvoice, paymentMethod },
          { compress: false },
        );

        const paymentRow = text.mock.calls.find(
          (args) => args[0] === 'Zahlungsart: ',
        );
        const customerRow = text.mock.calls.find(
          (args) => args[0] === 'Kundennummer: ',
        );
        const paymentY = paymentRow?.[2];
        const customerY = customerRow?.[2];
        expect(typeof paymentY).toBe('number');
        expect(typeof customerY).toBe('number');
        if (typeof paymentY !== 'number' || typeof customerY !== 'number') {
          throw new Error('Info table row positions were not recorded');
        }
        expect(customerY).toBeGreaterThan(paymentY);
      } finally {
        text.mockRestore();
      }
    },
  );

  test('renders document and due dates in the same format as the invoice view', async () => {
    const text = vi.spyOn(PDFDocument.prototype, 'text');
    try {
      await renderPDF({
        ...singleInvoice,
        documentDate: '2024-01-02',
        paymentDueDate: '2024-02-05',
      });
      const values = text.mock.calls.map((args) => args[0]);
      expect(
        values.some(
          (value) => typeof value === 'string' && value.includes('02.01.2024'),
        ),
      ).toBe(true);
      expect(
        values.some(
          (value) => typeof value === 'string' && value.includes('05.02.2024'),
        ),
      ).toBe(true);
      expect(values).not.toContain('Sofort ohne Abzug zahlbar');
    } finally {
      text.mockRestore();
    }
  });

  test.each([
    ['invoice', true],
    ['offer', false],
  ])(
    'renders default payment terms for %s without a due date',
    async (type, expected) => {
      const text = vi.spyOn(PDFDocument.prototype, 'text');
      try {
        await renderPDF({ ...singleInvoice, type, paymentDueDate: null });
        expect(
          text.mock.calls.some(
            (args) => args[0] === 'Sofort ohne Abzug zahlbar',
          ),
        ).toBe(expected);
      } finally {
        text.mockRestore();
      }
    },
  );

  test.each([null, '2024-02-05'])(
    'fits a short invoice with due date %s on one page',
    async (paymentDueDate) => {
      const currentConfig = config.getConfig();
      const getConfig = vi.spyOn(config, 'getConfig').mockReturnValue({
        ...currentConfig,
        DOC_COMPANY_TITLE: 'Sample Repair Shop',
        DOC_OWNER: 'Sample Owner',
        DOC_STREET_AND_NUMBER: 'Sample Street 1',
        DOC_ZIP_AND_CITY: '12345 Sample City',
        DOC_PHONE_NUMBER: '01234 56789',
        DOC_EMAIL: 'office@example.test',
        DOC_BANK: 'Sample Bank',
        DOC_BIC: 'TESTDE12345',
        DOC_IBAN: 'DE00123456789012345678',
        DOC_VAT_ID: 'DE123456789',
        DOC_TAX_ID: '123/456/78901',
      });
      const addPage = vi.spyOn(PDFDocument.prototype, 'addPage');
      try {
        await renderPDF({
          ...singleInvoice,
          paymentDueDate,
          positions: Array.from({ length: 3 }, (_, index) => ({
            ...singleInvoice.positions[1],
            articleId: `PART-${index + 1}`,
            description:
              index === 1 ? 'Sample item '.repeat(10) : 'Sample item',
          })),
        });
        expect(addPage).toHaveBeenCalledTimes(1);
      } finally {
        getConfig.mockRestore();
        addPage.mockRestore();
      }
    },
  );

  test.each([null, '2024-02-05'])(
    'keeps the first footer section together near page boundaries with due date %s',
    async (paymentDueDate) => {
      const currentConfig = config.getConfig();
      const getConfig = vi.spyOn(config, 'getConfig');
      getConfig.mockReturnValue({
        ...currentConfig,
        DOC_PHONE_NUMBER: '0123 '.repeat(70),
      });
      const metrics = new PDFDocument();
      // The original method is applied to each document instance below.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalText = metrics.text;
      metrics.end();
      let textSplitAcrossPages: boolean;
      let inFooterSection = false;
      const text = vi
        .spyOn(PDFDocument.prototype, 'text')
        .mockImplementation(function (this: PDFKit.PDFDocument, ...args) {
          if (
            typeof args[0] === 'string' &&
            args[0].startsWith('Unsere Servicenummer ist ')
          ) {
            inFooterSection = true;
          }
          const previousPage = this.page;
          originalText.apply(this, args);
          if (inFooterSection && this.page !== previousPage) {
            textSplitAcrossPages = true;
          }
          if (
            args[0] ===
            'Dieser Beleg wurde maschinell erstellt und ist auch ohne Unterschrift gültig.'
          ) {
            inFooterSection = false;
          }
          return this;
        });
      const addPage = vi.spyOn(PDFDocument.prototype, 'addPage');
      try {
        for (let count = 0; count <= 45; count++) {
          text.mockClear();
          addPage.mockClear();
          textSplitAcrossPages = false;
          await renderPDF({
            ...singleInvoice,
            paymentDueDate,
            positions: Array.from(
              { length: count },
              () => singleInvoice.positions[1],
            ),
          });
          const firstIndex = text.mock.calls.findIndex(
            (args) =>
              typeof args[0] === 'string' &&
              args[0].startsWith('Unsere Servicenummer ist '),
          );
          const lastIndex = text.mock.calls.findIndex(
            (args) =>
              args[0] ===
              'Dieser Beleg wurde maschinell erstellt und ist auch ohne Unterschrift gültig.',
          );
          expect(firstIndex).toBeGreaterThanOrEqual(0);
          expect(lastIndex).toBeGreaterThan(firstIndex);
          expect(text.mock.calls[firstIndex][0]).toContain('0123 0123');
          const firstCall = text.mock.invocationCallOrder[firstIndex];
          const lastCall = text.mock.invocationCallOrder[lastIndex];
          expect(
            addPage.mock.invocationCallOrder.some(
              (call) => call > firstCall && call < lastCall,
            ),
          ).toBe(false);
          expect(textSplitAcrossPages).toBe(false);
        }
      } finally {
        getConfig.mockRestore();
        text.mockRestore();
        addPage.mockRestore();
      }
    },
  );

  test('formats numeric mileage with the same precision as the invoice view', async () => {
    const text = vi.spyOn(PDFDocument.prototype, 'text');
    try {
      await renderPDF({
        ...singleInvoice,
        carMileage: new Prisma.Decimal('3.14159'),
      });
      expect(text.mock.calls.some((args) => args[0] === '3,14159')).toBe(true);
    } finally {
      text.mockRestore();
    }
  });

  test('render single PDF that is identical to the stored snapshot', async () => {
    const buffer = await renderPDF(singleInvoice, { compress: false });
    compareToSnapshot(buffer, 'single_invoice.pdf');
  });

  test('render multiple PDFs that are identical to the snapshot', async () => {
    const buffer = await renderMultiplePDF(
      [multipleInvoice1, multipleInvoice2],
      { compress: false },
    );
    compareToSnapshot(buffer, 'multiple_invoices.pdf');
  });
});
