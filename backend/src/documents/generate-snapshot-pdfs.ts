/**
 * Regenerates the PDF snapshot files used by renderPDF.spec.ts.
 *
 * Run via: yarn generate-pdf-snapshots
 *
 * Must be run with .env.test loaded (the yarn script handles this) so that
 * DOC_* env vars match the environment used by the test runner.
 * Snapshots are rendered with compress: false so the content streams are
 * plain text and stable across Node.js versions.
 */
import fs from 'fs';
import path from 'path';

import { renderMultiplePDF, renderPDF } from './renderPDF';
import {
  multipleInvoice1,
  multipleInvoice2,
  singleInvoice,
} from './renderPDF.fixtures';

const SNAPSHOT_DIR = path.join(__dirname, 'test-snapshots');

async function main() {
  const buf1 = await renderPDF(singleInvoice, { compress: false });
  fs.writeFileSync(path.join(SNAPSHOT_DIR, 'single_invoice.pdf'), buf1);
  console.log('Written: single_invoice.pdf');

  const buf2 = await renderMultiplePDF([multipleInvoice1, multipleInvoice2], {
    compress: false,
  });
  fs.writeFileSync(path.join(SNAPSHOT_DIR, 'multiple_invoices.pdf'), buf2);
  console.log('Written: multiple_invoices.pdf');
}

void main();
