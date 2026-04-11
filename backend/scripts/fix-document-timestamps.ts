/**
 * Back-fills createdAt for documents imported via import-backup.ts.
 * The bulk insert gives every document the same createdAt, breaking the
 * default sort order (createdAt DESC) in the document list.
 *
 * Strategy:
 *   - Use documentDate as the date base (documents have a real snapshot date).
 *   - Add seq * 60 seconds (where seq is the ### part of YY-MM-###[-K]),
 *     so documents within the same month stay in their original sequence order.
 *
 * Run from the backend/ directory:
 *
 *   yarn tsx scripts/fix-document-timestamps.ts --db ./production.db
 */
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

import { PrismaClient } from '../src/generated/prisma/client';

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const dbArg = parseArg('--db');
if (!dbArg) {
  console.error(
    'Usage: yarn tsx scripts/fix-document-timestamps.ts --db <path.db>',
  );
  process.exit(1);
}

const dbPath = path.resolve(dbArg);
const databaseUrl = `file:${dbPath}`;

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

const run = async () => {
  const documents = await prisma.document.findMany({
    select: { id: true, documentNumber: true, documentDate: true },
  });

  console.log(`Found ${documents.length} documents.`);

  let updated = 0;
  let skipped = 0;

  for (const doc of documents) {
    if (!doc.documentNumber || !doc.documentDate) {
      skipped++;
      continue;
    }

    // documentNumber format: "YY-MM-###" or "YY-MM-###-K"
    const parts = doc.documentNumber.split('-');
    const seq = parseInt(parts[2], 10);
    if (isNaN(seq)) {
      console.warn(
        `  Skipping id=${doc.id}: cannot parse sequence from "${doc.documentNumber}"`,
      );
      skipped++;
      continue;
    }

    // documentDate is "YYYY-MM-DD" (legacy data may omit zero-padding).
    // Normalise to "YYYY-MM-DD" before parsing as ISO UTC.
    const [yyyy, mm, dd] = doc.documentDate.split('-');
    const normalised = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    const base = new Date(`${normalised}T00:00:00.000Z`);
    if (isNaN(base.getTime())) {
      console.warn(
        `  Skipping id=${doc.id}: invalid documentDate "${doc.documentDate}"`,
      );
      skipped++;
      continue;
    }

    const syntheticDate = new Date(base.getTime() + seq * 60 * 1000);

    await prisma.document.update({
      where: { id: doc.id },
      data: { createdAt: syntheticDate },
    });
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, skipped: ${skipped}`);
};

run()
  .catch((err) => {
    console.error('\nFailed:', err);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
