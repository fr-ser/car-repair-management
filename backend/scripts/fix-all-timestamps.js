/**
 * Back-fills createdAt for orders, clients, cars, and articles imported via
 * import-backup.ts.  The bulk insert assigns every record the same createdAt,
 * breaking the default sort order (createdAt DESC) in all list views.
 *
 * Only records whose createdAt falls within 5 minutes of the per-entity
 * minimum are updated.  Records added by real users after the import have a
 * much later createdAt and are left untouched.
 *
 * Strategies:
 *   Orders:   orderDate as base + rank-within-that-date * 60 s
 *   Clients:  2020-01-01 base + numeric part of clientNumber * 60 s (fallback: id)
 *   Cars:     2020-01-01 base + numeric part of carNumber   * 60 s (fallback: id)
 *   Articles: 2020-01-01 base + numeric part of article id  * 60 s
 *
 * All updates for each entity run inside a single transaction so only one
 * fsync is needed per entity — important on slow hardware.
 *
 * Requires Node.js >= 22.5 (uses the built-in node:sqlite module).
 *
 * Run from the backend/ directory:
 *
 *   node scripts/fix-all-timestamps.js --db ./production.db
 */
'use strict';

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArg(flag) {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const dbArg = parseArg('--db');
if (!dbArg) {
  console.error('Usage: node scripts/fix-all-timestamps.js --db <path.db>');
  process.exit(1);
}

const db = new DatabaseSync(path.resolve(dbArg));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Returns the first run of digits found in a string, e.g. "K042" → 42.
function numericSeq(s) {
  if (!s) return null;
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

// Normalise a potentially unpadded "YYYY-M-D" string to "YYYY-MM-DD".
function normaliseDate(s) {
  const [y, m, d] = s.split('-');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// Records created within 5 minutes of the entity's earliest createdAt are
// considered part of the bulk import.  New records (added hours later) are
// well outside this window.
const IMPORT_WINDOW_MS = 5 * 60_000;

// Anchor date for entities that have no semantic date field.
const LEGACY_BASE_MS = new Date('2020-01-01T00:00:00.000Z').getTime();

function getMinCreatedAt(table) {
  const row = db.prepare(`SELECT MIN(createdAt) as min FROM "${table}"`).get();
  return row.min ? new Date(row.min) : null;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

{
  const min = getMinCreatedAt('Order');
  if (!min) {
    console.log('Orders: no records, skipping');
  } else {
    const windowEnd = new Date(min.getTime() + IMPORT_WINDOW_MS).toISOString();

    // Known orderDate typos from the legacy backup: map orderNumber → correct date.
    const orderDateFixes = {
      Auf253: '2019-07-31',
    };

    const orders = db
      .prepare(
        `SELECT id, orderDate, orderNumber FROM "Order" WHERE createdAt <= ? ORDER BY id ASC`,
      )
      .all(windowEnd);
    console.log(`Orders: ${orders.length} legacy records`);

    // Also include orders with known date corrections that fell outside the
    // window (e.g. skipped in a previous run, still carrying the bulk-import
    // timestamp, which is newer than any synthetic date after a partial run).
    const windowIds = new Set(orders.map((o) => o.id));
    for (const orderNumber of Object.keys(orderDateFixes)) {
      const row = db
        .prepare(
          `SELECT id, orderDate, orderNumber FROM "Order" WHERE orderNumber = ?`,
        )
        .get(orderNumber);
      if (row && !windowIds.has(row.id)) {
        console.log(
          `  Also including order ${orderNumber} with date correction (outside window)`,
        );
        orders.push(row);
      }
    }

    // Apply corrections in-memory before computing ranks.
    for (const o of orders) {
      if (o.orderNumber && orderDateFixes[o.orderNumber]) {
        console.log(
          `  Correcting orderDate for ${o.orderNumber}: "${o.orderDate}" → "${orderDateFixes[o.orderNumber]}"`,
        );
        o.orderDate = orderDateFixes[o.orderNumber];
      }
    }

    // Rank within each orderDate: gives orders on the same day a stable
    // relative order that respects the insertion (i.e. legacy) sequence.
    const rankPerDate = new Map();
    const updates = [];
    let skipped = 0;

    for (const o of orders) {
      const dateKey = o.orderDate ? normaliseDate(o.orderDate) : '2020-01-01';
      const base = new Date(`${dateKey}T00:00:00.000Z`);
      if (isNaN(base.getTime())) {
        console.warn(
          `  Skipping order id=${o.id}: invalid orderDate "${o.orderDate}"`,
        );
        skipped++;
        continue;
      }
      const rank = (rankPerDate.get(dateKey) ?? 0) + 1;
      rankPerDate.set(dateKey, rank);
      updates.push({
        id: o.id,
        createdAt: new Date(base.getTime() + rank * 60_000).toISOString(),
      });
    }

    const setOrderDate = db.prepare(
      `UPDATE "Order" SET orderDate = ? WHERE orderNumber = ?`,
    );
    const setCreatedAt = db.prepare(
      `UPDATE "Order" SET createdAt = ? WHERE id = ?`,
    );

    db.prepare('BEGIN').run();
    try {
      for (const [orderNumber, correctedDate] of Object.entries(
        orderDateFixes,
      )) {
        setOrderDate.run(correctedDate, orderNumber);
      }
      for (const { id, createdAt } of updates) {
        setCreatedAt.run(createdAt, id);
      }
      db.prepare('COMMIT').run();
    } catch (err) {
      db.prepare('ROLLBACK').run();
      throw err;
    }

    console.log(
      `Orders: updated ${updates.length}${skipped ? `, skipped ${skipped}` : ''}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

{
  const min = getMinCreatedAt('Client');
  if (!min) {
    console.log('Clients: no records, skipping');
  } else {
    const windowEnd = new Date(min.getTime() + IMPORT_WINDOW_MS).toISOString();

    const clients = db
      .prepare(`SELECT id, clientNumber FROM "Client" WHERE createdAt <= ?`)
      .all(windowEnd);
    console.log(`Clients: ${clients.length} legacy records`);

    const updates = clients.map((c) => ({
      id: c.id,
      createdAt: new Date(
        LEGACY_BASE_MS + (numericSeq(c.clientNumber) ?? c.id) * 60_000,
      ).toISOString(),
    }));

    const setCreatedAt = db.prepare(
      `UPDATE "Client" SET createdAt = ? WHERE id = ?`,
    );
    db.prepare('BEGIN').run();
    try {
      for (const { id, createdAt } of updates) setCreatedAt.run(createdAt, id);
      db.prepare('COMMIT').run();
    } catch (err) {
      db.prepare('ROLLBACK').run();
      throw err;
    }
    console.log(`Clients: updated ${updates.length}`);
  }
}

// ---------------------------------------------------------------------------
// Cars
// ---------------------------------------------------------------------------

{
  const min = getMinCreatedAt('Car');
  if (!min) {
    console.log('Cars: no records, skipping');
  } else {
    const windowEnd = new Date(min.getTime() + IMPORT_WINDOW_MS).toISOString();

    const cars = db
      .prepare(`SELECT id, carNumber FROM "Car" WHERE createdAt <= ?`)
      .all(windowEnd);
    console.log(`Cars: ${cars.length} legacy records`);

    const updates = cars.map((c) => ({
      id: c.id,
      createdAt: new Date(
        LEGACY_BASE_MS + (numericSeq(c.carNumber) ?? c.id) * 60_000,
      ).toISOString(),
    }));

    const setCreatedAt = db.prepare(
      `UPDATE "Car" SET createdAt = ? WHERE id = ?`,
    );
    db.prepare('BEGIN').run();
    try {
      for (const { id, createdAt } of updates) setCreatedAt.run(createdAt, id);
      db.prepare('COMMIT').run();
    } catch (err) {
      db.prepare('ROLLBACK').run();
      throw err;
    }
    console.log(`Cars: updated ${updates.length}`);
  }
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

{
  const min = getMinCreatedAt('Article');
  if (!min) {
    console.log('Articles: no records, skipping');
  } else {
    const windowEnd = new Date(min.getTime() + IMPORT_WINDOW_MS).toISOString();

    const articles = db
      .prepare(`SELECT id FROM "Article" WHERE createdAt <= ?`)
      .all(windowEnd);
    console.log(`Articles: ${articles.length} legacy records`);

    const updates = [];
    let skipped = 0;
    for (const a of articles) {
      const seq = numericSeq(a.id);
      if (seq === null) {
        console.warn(`  Skipping article id="${a.id}": no numeric part`);
        skipped++;
        continue;
      }
      updates.push({
        id: a.id,
        createdAt: new Date(LEGACY_BASE_MS + seq * 60_000).toISOString(),
      });
    }

    const setCreatedAt = db.prepare(
      `UPDATE "Article" SET createdAt = ? WHERE id = ?`,
    );
    db.prepare('BEGIN').run();
    try {
      for (const { id, createdAt } of updates) setCreatedAt.run(createdAt, id);
      db.prepare('COMMIT').run();
    } catch (err) {
      db.prepare('ROLLBACK').run();
      throw err;
    }
    console.log(
      `Articles: updated ${updates.length}${skipped ? `, skipped ${skipped}` : ''}`,
    );
  }
}

// ---------------------------------------------------------------------------

console.log('\nDone.');
db.close();
