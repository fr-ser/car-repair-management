import fs from 'fs';
import path from 'path';
import { describe, expect, test } from 'vitest';

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Rendering PDFs', () => {
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
