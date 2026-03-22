import fs from 'fs';
import path from 'path';
import { describe, expect, test } from 'vitest';

import { renderMultiplePDF, renderPDF } from './renderPDF';

const SNAPSHOT_DIR = path.join(__dirname, 'snapshots');

function compareToSnapshot(buffer: Buffer, snapshotFile: string) {
  const snapshotPath = path.join(SNAPSHOT_DIR, snapshotFile);
  const expectedLines = fs
    .readFileSync(snapshotPath, { encoding: 'utf-8' })
    .split('\n');
  buffer
    .toString('utf-8')
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

// ── Single-invoice test data ─

const singleInvoice = {
  documentNumber: '17-01-002',
  type: 'invoice' as const,
  documentDate: '2017-01-04',
  paymentMethod: 'cash' as const,
  paymentDueDate: null,
  clientCompany: 'Musterfirma',
  clientFirstName: 'Max',
  clientLastName: 'Mustermann',
  clientStreet: 'Musterstr .4',
  clientPostalCode: '12345',
  clientCity: 'Musterstadt',
  clientNumber: 'K003',
  carLicensePlate: 'A-BC 123',
  carManufacturer: 'LEXUS',
  carModel: 'RX400H',
  carVin: 'ABCD12345',
  carMileage: '12 345',
  positions: [
    {
      type: 'heading',
      text: 'Positionen A',
      articleId: null,
      description: null,
      pricePerUnit: null,
      amount: null,
      discount: null,
    },
    ...Array(9)
      .fill(null)
      .map(() => ({
        type: 'item',
        text: null,
        articleId: '798132 and sometimes they are multiple lines long',
        description: 'Wischblatt-stueck350mm',
        pricePerUnit: 9.3,
        discount: 40,
        amount: 12.5,
      })),
    {
      type: 'heading',
      text: 'Positionen B',
      articleId: null,
      description: null,
      pricePerUnit: null,
      amount: null,
      discount: null,
    },
    ...Array(9)
      .fill(null)
      .map(() => ({
        type: 'item',
        text: null,
        articleId: '798042',
        description:
          'Wischblattsatz650/550mm this field is regularly multiple lines long',
        pricePerUnit: 38.5,
        discount: 40,
        amount: 1,
      })),
  ],
};

// ── Multi-invoice test data ──

const multipleInvoice1 = {
  documentNumber: '17-01-002',
  type: 'invoice' as const,
  documentDate: '2017-01-04',
  paymentMethod: 'cash' as const,
  paymentDueDate: null,
  clientCompany: 'Musterfirma and other very long parts of a company name',
  clientFirstName: 'Max',
  clientLastName: 'Mustermann',
  clientStreet: 'Musterstr .4',
  clientPostalCode: '12345',
  clientCity: 'Musterstadt',
  clientNumber: 'K003',
  carLicensePlate: 'A-BC 123',
  carManufacturer: 'LEXUS',
  carModel: 'RX400H',
  carVin: 'ABCD12345',
  carMileage: '12 345',
  positions: [
    {
      type: 'heading',
      text: 'Positionen A',
      articleId: null,
      description: null,
      pricePerUnit: null,
      amount: null,
      discount: null,
    },
    ...Array(18)
      .fill(null)
      .map(() => ({
        type: 'item',
        text: null,
        articleId: '798132',
        description: 'Wischblatt-stueck350mm',
        pricePerUnit: 9.3,
        discount: 40,
        amount: 12.5,
      })),
    {
      type: 'heading',
      text: 'Positionen B',
      articleId: null,
      description: null,
      pricePerUnit: null,
      amount: null,
      discount: null,
    },
    ...Array(18)
      .fill(null)
      .map(() => ({
        type: 'item',
        text: null,
        articleId: '798042',
        description: 'Wischblattsatz650/550mm',
        pricePerUnit: 38.5,
        discount: 40,
        amount: 1,
      })),
  ],
};

const multipleInvoice2 = {
  documentNumber: '17-01-002',
  type: 'invoice' as const,
  documentDate: '2017-01-04',
  paymentMethod: 'cash' as const,
  paymentDueDate: null,
  clientCompany: 'Musterfirma',
  clientFirstName: 'Max',
  clientLastName: 'Mustermann',
  clientStreet: 'Musterstr .4',
  clientPostalCode: '12345',
  clientCity: 'Musterstadt',
  clientNumber: 'K003',
  carLicensePlate: 'A-BC 123',
  carManufacturer: 'LEXUS',
  carModel: 'RX400H',
  carVin: 'ABCD12345',
  carMileage: '12 345',
  positions: [
    {
      type: 'heading',
      text: 'Positionen A',
      articleId: null,
      description: null,
      pricePerUnit: null,
      amount: null,
      discount: null,
    },
    {
      type: 'item',
      text: null,
      articleId: '798132',
      description: 'Wischblatt-stueck350mm',
      pricePerUnit: 9.3,
      discount: 40,
      amount: 12.5,
    },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Rendering PDFs', () => {
  test('render single PDF that is identical to the stored snapshot', async () => {
    const buffer = await renderPDF(singleInvoice);
    compareToSnapshot(buffer, 'single_invoice.pdf');
  });

  test('render multiple PDFs that are identical to the snapshot', async () => {
    const buffer = await renderMultiplePDF([
      multipleInvoice1,
      multipleInvoice2,
    ]);
    compareToSnapshot(buffer, 'multiple_invoices.pdf');
  });
});
