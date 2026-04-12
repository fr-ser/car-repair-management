/**
 * Backfills the `tires` field on Car rows from the legacy backup JSON.
 * The field was overlooked during the original import.
 *
 * Run from the backend/ directory:
 *
 *   node scripts/2026-04-12-backfill-tires.js \
 *     --input ../backup.production.gitignore.json \
 *     --db ./production.db
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const inputArg = parseArg('--input');
const dbArg = parseArg('--db');

if (!inputArg || !dbArg) {
  console.error(
    'Usage: node scripts/2026-04-12-backfill-tires.js --input <backup.json> --db <target.db>',
  );
  process.exit(1);
}

if (!fs.existsSync(inputArg)) {
  console.error(`Input file not found: ${inputArg}`);
  process.exit(1);
}

if (!fs.existsSync(dbArg)) {
  console.error(`Database file not found: ${dbArg}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const backup = JSON.parse(fs.readFileSync(inputArg, 'utf-8'));
const legacyCars = backup.auto ?? {};

const db = new DatabaseSync(dbArg);

const update = db.prepare(
  'UPDATE Car SET tires = ? WHERE carNumber = ? AND tires IS NULL',
);

let updated = 0;
let skipped = 0;

for (const car of Object.values(legacyCars)) {
  const raw = car.reifen;
  if (!raw || raw.trim() === '') continue;

  // Normalize whitespace (collapse tabs/multiple spaces to single space, trim)
  const tires = raw.replace(/\s+/g, ' ').trim();
  const carNumber = car.autoNr;

  if (!carNumber) {
    console.warn(`  Skipping car without autoNr (reifen: ${tires})`);
    skipped++;
    continue;
  }

  const result = update.run(tires, carNumber);
  if (result.changes === 0) {
    console.warn(
      `  No update for carNumber=${carNumber} (not found or tires already set)`,
    );
    skipped++;
  } else {
    console.log(`  Updated carNumber=${carNumber}: ${tires}`);
    updated++;
  }
}

db.close();

console.log(`\nDone. Updated: ${updated}, skipped: ${skipped}`);
