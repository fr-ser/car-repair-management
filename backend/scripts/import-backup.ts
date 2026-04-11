/**
 * Imports a legacy backup JSON into a freshly migrated SQLite database.
 * Migrations are applied automatically before insertion.
 *
 * Run from the backend/ directory:
 *
 *   yarn tsx scripts/import-backup.ts \
 *     --input ../backup.production.gitignore.json \
 *     --output ./production.db
 *
 * The output file must not already exist (accidental overwrites are blocked).
 * Paths are resolved relative to the current working directory (backend/).
 */
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaClient } from '../src/generated/prisma/client';

// ---------------------------------------------------------------------------
// Parse --input / --output args
// ---------------------------------------------------------------------------

function parseArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const inputArg = parseArg('--input');
const outputArg = parseArg('--output');

if (!inputArg || !outputArg) {
  console.error(
    'Usage: yarn tsx scripts/import-backup.ts --input <backup.json> --output <target.db>',
  );
  process.exit(1);
}

const inputPath = path.resolve(inputArg);
const outputPath = path.resolve(outputArg);
const databaseUrl = `file:${outputPath}`;

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

if (fs.existsSync(outputPath)) {
  console.error(`Output file already exists: ${outputPath}`);
  console.error('Delete it first or choose a different path.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nullIfEmpty(value: string | undefined | null): string | null {
  if (value === undefined || value === null || value === '') return null;
  return value;
}

function floatOrNull(value: string | number | undefined | null): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

// Strips spaces and thousands separators before parsing; returns null for non-numeric values.
function decimalOrNull(
  value: string | number | undefined | null,
): string | null {
  if (value === undefined || value === null || value === '') return null;
  const cleaned = String(value).replace(/\s/g, '').replace(/,/g, '.');
  const n = Number(cleaned);
  return isNaN(n) ? null : cleaned;
}

function mapStatus(legacyStatus: string): string {
  switch (legacyStatus) {
    case 'In Arbeit':
      return 'in_progress';
    case 'Fertig':
      return 'done';
    case 'Storniert':
      return 'cancelled';
    default:
      console.warn(
        `  Warning: unknown status "${legacyStatus}", defaulting to "in_progress"`,
      );
      return 'in_progress';
  }
}

function mapPaymentMethod(value: string | undefined | null): string | null {
  switch (value) {
    case 'Bar':
      return 'cash';
    case 'Überweisung':
      return 'bank_transfer';
    default:
      return null;
  }
}

function mapDocumentType(value: string): string {
  switch (value) {
    case 'Rechnung':
      return 'invoice';
    case 'Kostenvoranschlag':
      return 'offer';
    default:
      console.warn(
        `  Warning: unknown document type "${value}", defaulting to "invoice"`,
      );
      return 'invoice';
  }
}

interface LegacyPosition {
  ueberschrift?: string;
  artikelNr?: string;
  bezeichnung?: string;
  preisEinheit?: number;
  rabatt?: number;
  menge?: number;
}

interface LegacyArticle {
  nr: string;
  bez: string;
  preis: number | string;
  menge?: number | string | null;
}

interface LegacyClient {
  kundenNr?: string;
  vorname?: string;
  nachname?: string;
  email?: string;
  festnetz?: string;
  firma?: string;
  geburtstag?: string;
  kommentar?: string;
  mobil?: string;
  plz?: string;
  stadt?: string;
  strasse?: string;
}

interface LegacyCar {
  autoNr?: string;
  kennzeichen?: string;
  modell?: string;
  hersteller?: string;
  erstzulassung?: string;
  farbe?: string;
  hubraum?: string;
  kommentar?: string;
  kraftstoff?: string;
  leistung?: string;
  oelwechselDatum?: string;
  oelwechselKM?: number | string;
  tuev?: string;
  vin?: string;
  zahnriemenKM?: number | string;
  zahnriemenDatum?: string;
  zu2?: string;
  zu3?: string;
  kunden?: string[];
}

interface LegacyOrder {
  auftragsNr?: string;
  auto?: string;
  kunde?: string;
  titel?: string;
  beschreibung?: string;
  datum?: string;
  kmStand?: string | number;
  status?: string;
  zahlungsart?: string;
  zahlungsziel?: string;
  positionen?: LegacyPosition[];
}

interface LegacyDocumentOrderSnapshot {
  auftragsNr?: string;
  zahlungsart?: string;
  zahlungsziel?: string;
  kmStand?: string | number;
  positionen?: LegacyPosition[];
}

interface LegacyDocumentClientSnapshot {
  kundenNr?: string;
  firma?: string;
  vorname?: string;
  nachname?: string;
  strasse?: string;
  plz?: string;
  stadt?: string;
}

interface LegacyDocumentCarSnapshot {
  kennzeichen?: string;
  hersteller?: string;
  modell?: string;
  vin?: string;
}

interface LegacyDocument {
  nummer?: string;
  art?: string;
  speicherdatum?: string;
  auftrag?: LegacyDocumentOrderSnapshot;
  kunde?: LegacyDocumentClientSnapshot;
  auto?: LegacyDocumentCarSnapshot;
}

interface LegacyBackup {
  artikel?: Record<string, LegacyArticle>;
  kunde?: Record<string, LegacyClient>;
  auto?: Record<string, LegacyCar>;
  auftrag?: Record<string, LegacyOrder>;
  dokument?: Record<string, LegacyDocument>;
}

function mapPositions(positions: LegacyPosition[]) {
  return positions.map((pos, index) => {
    if ('ueberschrift' in pos) {
      return {
        type: 'heading' as const,
        sortOrder: index,
        text: nullIfEmpty(pos.ueberschrift),
      };
    }
    return {
      type: 'item' as const,
      sortOrder: index,
      articleId: nullIfEmpty(pos.artikelNr),
      description: nullIfEmpty(pos.bezeichnung),
      pricePerUnit: pos.preisEinheit != null ? String(pos.preisEinheit) : null,
      amount: pos.menge != null ? String(pos.menge) : null,
      discount: pos.rabatt != null ? String(pos.rabatt) : null,
    };
  });
}

// ---------------------------------------------------------------------------
// Migrate
// ---------------------------------------------------------------------------

console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log('');
console.log('Applying migrations...');

execSync('yarn prisma migrate deploy', {
  cwd: process.cwd(), // must be backend/
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: 'inherit',
});
console.log('');

// ---------------------------------------------------------------------------
// Connect
// ---------------------------------------------------------------------------

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

// ---------------------------------------------------------------------------
// Load backup
// ---------------------------------------------------------------------------

console.log('Loading backup...');
const backup = JSON.parse(fs.readFileSync(inputPath, 'utf-8')) as LegacyBackup;

const legacyArticles: Record<string, LegacyArticle> = backup.artikel ?? {};
const legacyClients: Record<string, LegacyClient> = backup.kunde ?? {};
const legacyCars: Record<string, LegacyCar> = backup.auto ?? {};
const legacyOrders: Record<string, LegacyOrder> = backup.auftrag ?? {};
const legacyDocuments: Record<string, LegacyDocument> = backup.dokument ?? {};

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------

const run = async () => {
  // 1. Articles
  // Legacy "nr" is the human-readable article code → Article.id (String @id).
  console.log(`Inserting ${Object.keys(legacyArticles).length} articles...`);
  await prisma.article.createMany({
    data: Object.values(legacyArticles).map((a) => ({
      id: a.nr,
      description: a.bez,
      price: String(a.preis),
      amount: a.menge != null ? String(a.menge) : null,
    })),
  });

  // 2. Clients
  // Legacy "kundenNr" (e.g. "K042") → clientNumber (preserved for display).
  console.log(`Inserting ${Object.keys(legacyClients).length} clients...`);
  await prisma.client.createMany({
    data: Object.values(legacyClients).map((k) => ({
      clientNumber: nullIfEmpty(k.kundenNr),
      firstName: nullIfEmpty(k.vorname),
      lastName: nullIfEmpty(k.nachname),
      email: nullIfEmpty(k.email),
      landline: nullIfEmpty(k.festnetz),
      company: nullIfEmpty(k.firma),
      birthday: nullIfEmpty(k.geburtstag),
      comment: nullIfEmpty(k.kommentar),
      phoneNumber: nullIfEmpty(k.mobil),
      postalCode: nullIfEmpty(k.plz),
      city: nullIfEmpty(k.stadt),
      street: nullIfEmpty(k.strasse),
    })),
  });

  const allClients = await prisma.client.findMany({
    select: { id: true, clientNumber: true },
  });
  const clientIdByNumber = new Map(
    allClients
      .filter((c) => c.clientNumber)
      .map((c) => [c.clientNumber!, c.id]),
  );

  // 3. Cars
  // Legacy cars can reference multiple clients; only the first is stored as
  // clientId because the schema has a single optional FK to Client.
  console.log(`Inserting ${Object.keys(legacyCars).length} cars...`);
  await prisma.car.createMany({
    data: Object.values(legacyCars).map((a) => {
      const primaryClientNumber: string | undefined = a.kunden?.[0];
      const clientId = primaryClientNumber
        ? clientIdByNumber.get(primaryClientNumber)
        : undefined;
      return {
        carNumber: nullIfEmpty(a.autoNr),
        licensePlate: a.kennzeichen ?? '',
        model: a.modell ?? '',
        manufacturer: a.hersteller ?? '',
        firstRegistration: nullIfEmpty(a.erstzulassung),
        color: nullIfEmpty(a.farbe),
        engineCapacity: nullIfEmpty(a.hubraum),
        comment: nullIfEmpty(a.kommentar),
        fuelType: nullIfEmpty(a.kraftstoff),
        enginePower: nullIfEmpty(a.leistung),
        oilChangeDate: nullIfEmpty(a.oelwechselDatum),
        oilChangeKm: floatOrNull(a.oelwechselKM),
        inspectionDate: nullIfEmpty(a.tuev),
        vin: nullIfEmpty(a.vin),
        timingBeltKm: floatOrNull(a.zahnriemenKM),
        timingBeltDate: nullIfEmpty(a.zahnriemenDatum),
        documentField2: nullIfEmpty(a.zu2),
        documentField3: nullIfEmpty(a.zu3),
        clientId: clientId ?? null,
      };
    }),
  });

  const allCars = await prisma.car.findMany({
    select: { id: true, carNumber: true },
  });
  const carIdByNumber = new Map(
    allCars.filter((c) => c.carNumber).map((c) => [c.carNumber!, c.id]),
  );

  // 4. Orders
  // Status mapping:         "In Arbeit" → "in_progress", "Fertig" → "done"
  // Payment method mapping: "Bar" → "cash", "Überweisung" → "bank_transfer"
  console.log(`Inserting ${Object.keys(legacyOrders).length} orders...`);
  const skippedOrders: string[] = [];

  const orderRows = Object.values(legacyOrders)
    .map((auf) => {
      const carId = auf.auto ? carIdByNumber.get(auf.auto) : undefined;
      const clientId = auf.kunde ? clientIdByNumber.get(auf.kunde) : undefined;
      if (!carId || !clientId) {
        skippedOrders.push(
          `  ${auf.auftragsNr ?? '?'}: auto=${auf.auto ?? '?'} → ${carId ?? 'NOT FOUND'}, kunde=${auf.kunde ?? '?'} → ${clientId ?? 'NOT FOUND'}`,
        );
        return null;
      }
      return {
        orderNumber: nullIfEmpty(auf.auftragsNr),
        title: auf.titel ?? '',
        description: nullIfEmpty(auf.beschreibung),
        orderDate: auf.datum ?? '',
        kmStand: decimalOrNull(auf.kmStand),
        status: mapStatus(auf.status ?? ''),
        paymentMethod: mapPaymentMethod(auf.zahlungsart),
        paymentDueDate: nullIfEmpty(auf.zahlungsziel),
        carId,
        clientId,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (skippedOrders.length > 0) {
    console.warn(
      `  Skipping ${skippedOrders.length} orders with unresolvable references:`,
    );
    skippedOrders.forEach((l) => console.warn(l));
  }

  await prisma.order.createMany({ data: orderRows });

  const allOrders = await prisma.order.findMany({
    select: { id: true, orderNumber: true },
  });
  const orderIdByNumber = new Map(
    allOrders.filter((o) => o.orderNumber).map((o) => [o.orderNumber!, o.id]),
  );

  // 5. Order positions
  const orderPositionRows = Object.values(legacyOrders).flatMap((auf) => {
    const orderId = auf.auftragsNr
      ? orderIdByNumber.get(auf.auftragsNr)
      : undefined;
    if (!orderId) return [];
    return mapPositions(auf.positionen ?? []).map((pos) => ({
      ...pos,
      orderId,
    }));
  });
  console.log(`Inserting ${orderPositionRows.length} order positions...`);
  await prisma.orderPosition.createMany({ data: orderPositionRows });

  // 6. Documents
  // Each document embeds a snapshot of client/car/order data at save time.
  // orderId is a non-FK integer reference to the Order.
  console.log(`Inserting ${Object.keys(legacyDocuments).length} documents...`);
  const skippedDocs: string[] = [];

  const documentRows = Object.values(legacyDocuments)
    .map((dok) => {
      const auf = dok.auftrag ?? {};
      const kunde = dok.kunde ?? {};
      const auto = dok.auto ?? {};
      const orderId = auf.auftragsNr
        ? orderIdByNumber.get(auf.auftragsNr)
        : undefined;
      if (!orderId) {
        skippedDocs.push(
          `  ${dok.nummer ?? '?'}: auftragsNr=${auf.auftragsNr ?? '?'} NOT FOUND`,
        );
        return null;
      }
      return {
        documentNumber: nullIfEmpty(dok.nummer),
        type: mapDocumentType(dok.art ?? ''),
        documentDate: dok.speicherdatum ?? '',
        orderId,
        paymentMethod: mapPaymentMethod(auf.zahlungsart),
        paymentDueDate: nullIfEmpty(auf.zahlungsziel),
        clientNumber: nullIfEmpty(kunde.kundenNr),
        clientCompany: nullIfEmpty(kunde.firma),
        clientFirstName: nullIfEmpty(kunde.vorname),
        clientLastName: nullIfEmpty(kunde.nachname),
        clientStreet: nullIfEmpty(kunde.strasse),
        clientPostalCode: nullIfEmpty(kunde.plz),
        clientCity: nullIfEmpty(kunde.stadt),
        carLicensePlate: auto.kennzeichen ?? '',
        carManufacturer: auto.hersteller ?? '',
        carModel: auto.modell ?? '',
        carVin: nullIfEmpty(auto.vin),
        carMileage: decimalOrNull(auf.kmStand),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (skippedDocs.length > 0) {
    console.warn(
      `  Skipping ${skippedDocs.length} documents with unresolvable order reference:`,
    );
    skippedDocs.forEach((l) => console.warn(l));
  }

  await prisma.document.createMany({ data: documentRows });

  const allDocuments = await prisma.document.findMany({
    select: { id: true, documentNumber: true },
  });
  const documentIdByNumber = new Map(
    allDocuments
      .filter((d) => d.documentNumber)
      .map((d) => [d.documentNumber!, d.id]),
  );

  // 7. Document positions
  const documentPositionRows = Object.values(legacyDocuments).flatMap((dok) => {
    const documentId = dok.nummer
      ? documentIdByNumber.get(dok.nummer)
      : undefined;
    if (!documentId) return [];
    return mapPositions(dok.auftrag?.positionen ?? []).map((pos) => ({
      ...pos,
      documentId,
    }));
  });
  console.log(`Inserting ${documentPositionRows.length} document positions...`);
  await prisma.documentPosition.createMany({ data: documentPositionRows });

  console.log('\nDone.');
  console.log(`  Articles:           ${Object.keys(legacyArticles).length}`);
  console.log(`  Clients:            ${Object.keys(legacyClients).length}`);
  console.log(`  Cars:               ${Object.keys(legacyCars).length}`);
  console.log(`  Orders:             ${orderRows.length}`);
  console.log(`  Order positions:    ${orderPositionRows.length}`);
  console.log(`  Documents:          ${documentRows.length}`);
  console.log(`  Document positions: ${documentPositionRows.length}`);
};

run()
  .catch((err) => {
    console.error('\nImport failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
