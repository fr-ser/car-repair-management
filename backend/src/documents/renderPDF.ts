import fs from 'fs';
import PDFDocument from 'pdfkit';

import { Prisma } from '@/src/generated/prisma/client';

import { formatIsoDateString, getVatRate } from '@/src/common/helpers';
import { AppConfig, getConfig } from '@/src/config';

// ── Public input types ────────────────────────────────────────────────────────

export interface DocumentPositionForRender {
  type: string; // 'heading' | 'item'
  text: string | null;
  articleId: string | null;
  description: string | null;
  pricePerUnit: Prisma.Decimal | number | null;
  amount: Prisma.Decimal | number | null;
  discount: Prisma.Decimal | number | null;
}

export interface DocumentForRender {
  documentNumber: string | null;
  type: string; // 'invoice' | 'offer'
  documentDate: string;
  paymentMethod: string | null;
  paymentDueDate: string | null;
  clientCompany: string | null;
  clientFirstName: string | null;
  clientLastName: string | null;
  clientStreet: string | null;
  clientPostalCode: string | null;
  clientCity: string | null;
  clientNumber: string | null;
  carLicensePlate: string;
  carManufacturer: string;
  carModel: string;
  carVin: string | null;
  carMileage: Prisma.Decimal | string | null;
  positions: DocumentPositionForRender[];
}

// ── Internal types ────────────────────────────────────────────────────────────

interface InvoicePosition {
  heading?: string;
  articleId?: string;
  description?: string;
  pricePerUnit?: number;
  discount?: number;
  amount?: number;
}

interface InvoiceData {
  documentNumber: string;
  documentType: string;
  order: {
    date: string;
    paymentMethod: string;
    paymentDueDate?: string;
    mileage?: string;
    positions: InvoicePosition[];
  };
  vehicle: {
    manufacturer?: string;
    model?: string;
    licensePlate: string;
    vin?: string;
  };
  client: {
    company?: string;
    firstName?: string;
    lastName?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    clientNumber?: string;
  };
}

interface PageState {
  totalPages: number;
  prevY: number;
  currY: number;
}

// ── Mapping: public model → internal render format ────────────────────────────

function toPaymentMethodLabel(method: string | null): string {
  if (method === 'cash') return 'Bar';
  if (method === 'bank_transfer') return 'Überweisung';
  return method ?? '';
}

function toInvoiceData(doc: DocumentForRender): InvoiceData {
  return {
    documentNumber: doc.documentNumber ?? String(doc.documentNumber),
    documentType: doc.type === 'invoice' ? 'Rechnung' : 'Kostenvoranschlag',
    order: {
      date: doc.documentDate,
      paymentMethod: toPaymentMethodLabel(doc.paymentMethod),
      paymentDueDate: doc.paymentDueDate ?? undefined,
      mileage:
        doc.carMileage != null
          ? typeof doc.carMileage === 'string'
            ? doc.carMileage
            : new Intl.NumberFormat('de-DE').format(Number(doc.carMileage))
          : undefined,
      positions: doc.positions.map((p) => {
        if (p.type === 'heading') {
          return { heading: p.text ?? '' };
        }
        return {
          articleId: p.articleId ?? '',
          description: p.description ?? '',
          pricePerUnit: p.pricePerUnit != null ? Number(p.pricePerUnit) : 0,
          discount: p.discount != null ? Number(p.discount) : 0,
          amount: p.amount != null ? Number(p.amount) : 0,
        };
      }),
    },
    vehicle: {
      licensePlate: doc.carLicensePlate,
      manufacturer: doc.carManufacturer,
      model: doc.carModel,
      vin: doc.carVin ?? undefined,
    },
    client: {
      company: doc.clientCompany ?? undefined,
      firstName: doc.clientFirstName ?? undefined,
      lastName: doc.clientLastName ?? undefined,
      street: doc.clientStreet ?? undefined,
      postalCode: doc.clientPostalCode ?? undefined,
      city: doc.clientCity ?? undefined,
      clientNumber: doc.clientNumber ?? undefined,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const numberFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Passed as the y argument to pdfkit text() calls that should continue from doc.y
const CONTINUE_Y = null as unknown as number;

function mmToPx(num: number): number {
  return (72 / 25.4) * num;
}

function newPageCheck(
  doc: PDFKit.PDFDocument,
  pageState: PageState,
  addition: number,
): boolean {
  if (
    pageOptions.size[1] - pageOptions.margins.bottom <
    pageState.currY + addition
  ) {
    doc.addPage(pageOptions);
    pageState.totalPages++;
    pageState.currY = pageOptions.margins.top;
    return true;
  }
  return false;
}

// ── pdfkit page setup ─────────────────────────────────────────────────────────

interface NumPDFDocOptions extends PDFKit.PDFDocumentOptions {
  size: [number, number];
  margins: { top: number; bottom: number; left: number; right: number };
}

const pageOptions: NumPDFDocOptions = {
  size: [mmToPx(210), mmToPx(297)],
  margins: {
    top: mmToPx(10),
    bottom: mmToPx(10),
    left: mmToPx(15),
    right: mmToPx(15),
  },
  layout: 'portrait',
  bufferPages: true,
};

// X-positions for the 7 columns of the positions table (plus end boundary)
const COL_X = [
  pageOptions.margins.left, // Pos.
  mmToPx(25), // Art.-Nr.
  mmToPx(53), // Bezeichnung
  mmToPx(117), // Preis / Einheit
  mmToPx(140), // Rabatt
  mmToPx(155), // Menge
  mmToPx(170), // Preis (Netto)
  pageOptions.size[0] - pageOptions.margins.right, // end boundary
];

// ── PDF section renderers ─────────────────────────────────────────────────────

function renderSubHeader(
  doc: PDFKit.PDFDocument,
  data: InvoiceData,
  cfg: AppConfig,
): void {
  const contentWidth =
    pageOptions.size[0] - pageOptions.margins.left - pageOptions.margins.right;

  doc
    .font('Times-Roman')
    .fontSize(25)
    .text(
      cfg.DOC_COMPANY_TITLE,
      pageOptions.margins.left,
      pageOptions.margins.top,
      {
        width: contentWidth,
        align: 'center',
      },
    )
    .font('Times-Roman')
    .fontSize(14)
    .text(cfg.DOC_COMPANY_SUB_TITLE, pageOptions.margins.left, doc.y - 5, {
      width: contentWidth,
      align: 'center',
    });

  doc
    .lineWidth(1)
    .moveTo(pageOptions.margins.left, mmToPx(27))
    .lineTo(pageOptions.size[0] - pageOptions.margins.right, mmToPx(27))
    .stroke();

  doc
    .fontSize(8)
    .text(
      `${cfg.DOC_STREET_AND_NUMBER} / ${cfg.DOC_ZIP_AND_CITY} / E-Mail: ${cfg.DOC_EMAIL}`,
      pageOptions.margins.left,
      mmToPx(28),
    )
    .text(formatIsoDateString(data.order.date), mmToPx(110), mmToPx(28), {
      width: pageOptions.size[0] - pageOptions.margins.right - mmToPx(110),
      align: 'right',
    });

  doc
    .font('Times-Bold')
    .fontSize(18)
    .text(data.documentType, pageOptions.margins.left, mmToPx(40), {
      width: contentWidth,
      align: 'center',
    });
}

function renderInfoTable(doc: PDFKit.PDFDocument, data: InvoiceData): void {
  doc.fontSize(10);

  const leftTableText: [string, string][] = [
    ['Firma', data.client.company || ' '],
    ['Nachname', data.client.lastName || ' '],
    ['Vorname', data.client.firstName || ' '],
    ['Straße', data.client.street || ' '],
    ['PLZ', data.client.postalCode || ' '],
    ['Stadt', data.client.city || ' '],
    ['Dokumenten-Nr', data.documentNumber],
  ];

  doc.y = mmToPx(55);
  for (const [key, value] of leftTableText) {
    const yPosition = doc.y;
    doc
      .font('Times-Bold')
      .text(`${key}: `, mmToPx(22), yPosition)
      .font('Times-Roman')
      .text(value, mmToPx(50), yPosition, { lineGap: 3.7, width: mmToPx(55) });

    doc
      .lineWidth(1)
      .moveTo(mmToPx(50), doc.y - 3)
      .lineTo(mmToPx(105), doc.y - 3)
      .strokeColor('black')
      .strokeOpacity(1)
      .stroke();
  }

  const rightTableText: [string, string][] = [
    ['Zahlungsart', data.order.paymentMethod],
    ['Kundennummer', data.client.clientNumber || ' '],
    ['Kennzeichen', data.vehicle.licensePlate],
    ['Hersteller', data.vehicle.manufacturer || ' '],
    ['Modell', data.vehicle.model || ' '],
    ['Fahrzeug-Ident-Nr', data.vehicle.vin || ' '],
    ['KM-Stand', data.order.mileage || ' '],
  ];

  doc.y = mmToPx(55);
  for (const [key, value] of rightTableText) {
    const yPosition = doc.y;
    doc
      .font('Times-Bold')
      .text(`${key}: `, mmToPx(110), yPosition)
      .font('Times-Roman')
      .text(value, mmToPx(150), yPosition, {
        lineGap: 3.7,
        width: pageOptions.size[0] - pageOptions.margins.right - mmToPx(150),
      });

    doc
      .lineWidth(1)
      .moveTo(mmToPx(150), doc.y - 3)
      .lineTo(pageOptions.size[0] - pageOptions.margins.right, doc.y - 3)
      .strokeColor('black')
      .strokeOpacity(1)
      .stroke();
  }

  // fold mark
  doc
    .lineWidth(2)
    .moveTo(mmToPx(5), mmToPx(105))
    .lineTo(mmToPx(10), mmToPx(105));
}

function renderPositionsTable(
  doc: PDFKit.PDFDocument,
  data: InvoiceData,
  pageState: PageState,
): void {
  const renderTableHeader = () => {
    const headers = [
      'Pos.',
      'Art.-Nr.',
      'Bezeichnung',
      'Preis / Einheit',
      'Rabatt',
      'Menge',
      'Preis (Netto)',
    ];

    doc.font('Times-Roman').fontSize(10);
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], COL_X[i], pageState.currY, {
        width: COL_X[i + 1] - COL_X[i],
        align: 'center',
      });
    }

    doc
      .lineWidth(1)
      .moveTo(COL_X[0], pageState.currY + mmToPx(4))
      .lineTo(COL_X[7], pageState.currY + mmToPx(4))
      .stroke();
    pageState.currY = pageState.currY + mmToPx(4) + 5;
  };

  pageState.currY = mmToPx(107);
  renderTableHeader();

  let posCounter = 0;

  for (const position of data.order.positions) {
    doc.fontSize(10);

    const heightDescription = doc.heightOfString(
      'heading' in position
        ? (position.heading as string)
        : (position.description as string),
      { width: COL_X[3] - COL_X[2] },
    );
    const heightArticleNumber = doc.heightOfString(
      'articleId' in position ? (position.articleId as string) : '',
      { width: COL_X[2] - COL_X[1] },
    );
    const rowHeight = Math.max(heightArticleNumber, heightDescription);

    if (newPageCheck(doc, pageState, rowHeight)) {
      renderTableHeader();
    }

    if ('heading' in position) {
      doc
        .font('Times-Bold')
        .fontSize(10)
        .text((position.heading as string).trim(), COL_X[2], pageState.currY, {
          width: COL_X[3] - COL_X[2],
          align: 'center',
        });
    } else {
      posCounter++;

      doc
        .font('Times-Roman')
        .fontSize(10)
        .text(posCounter.toString(), COL_X[0], pageState.currY, {
          width: COL_X[1] - COL_X[0],
          align: 'center',
        })
        .text(position.articleId as string, COL_X[1], pageState.currY, {
          width: COL_X[2] - COL_X[1],
          align: 'center',
        })
        .text(
          (position.description as string).trim(),
          COL_X[2],
          pageState.currY,
          { width: COL_X[3] - COL_X[2], align: 'center' },
        )
        .fontSize(9)
        .text(
          numberFormatter.format(position.pricePerUnit as number),
          COL_X[3],
          pageState.currY,
          { width: COL_X[4] - COL_X[3], align: 'center' },
        )
        .text(
          numberFormatter.format(position.discount as number) + ' %',
          COL_X[4],
          pageState.currY,
          { width: COL_X[5] - COL_X[4], align: 'center' },
        )
        .text(
          numberFormatter.format(position.amount as number),
          COL_X[5],
          pageState.currY,
          { width: COL_X[6] - COL_X[5], align: 'center' },
        )
        .text(
          numberFormatter.format(
            (position.pricePerUnit as number) *
              (position.amount as number) *
              (1 - (position.discount as number) / 100),
          ),
          COL_X[6],
          pageState.currY,
          { width: COL_X[7] - COL_X[6], align: 'center' },
        );
    }

    doc
      .lineWidth(1)
      .strokeOpacity(0.5)
      .strokeColor([96, 125, 139])
      .moveTo(COL_X[0], pageState.currY + rowHeight + 1)
      .lineTo(COL_X[7], pageState.currY + rowHeight + 1)
      .stroke();

    pageState.prevY = pageState.currY;
    pageState.currY = pageState.currY + rowHeight + 5;

    for (const x of COL_X) {
      doc
        .lineWidth(1)
        .strokeOpacity(0.5)
        .strokeColor([96, 125, 139])
        .moveTo(x, pageState.prevY - 5)
        .lineTo(x, pageState.currY - 5)
        .stroke();
    }
  }

  pageState.currY += 10;
}

function renderSumTable(
  doc: PDFKit.PDFDocument,
  data: InvoiceData,
  pageState: PageState,
): void {
  const vatRate = getVatRate(data.order.date);
  if (pageState.totalPages === 1 && pageState.currY < mmToPx(215)) {
    pageState.currY = mmToPx(215);
  }

  doc.fontSize(12).font('Times-Bold');
  newPageCheck(doc, pageState, doc.currentLineHeight() * 4);

  const left = pageOptions.margins.left;
  const colWidth = mmToPx(60);

  doc
    .lineWidth(1)
    .moveTo(left, pageState.currY - 3)
    .lineTo(
      pageOptions.size[0] - pageOptions.margins.right,
      pageState.currY - 3,
    )
    .strokeColor('black')
    .strokeOpacity(1)
    .stroke();

  doc
    .text('Netto', left, pageState.currY + 3, {
      width: colWidth,
      align: 'center',
    })
    .text(`${vatRate * 100}% MwSt`, left + colWidth, pageState.currY + 3, {
      width: colWidth,
      align: 'center',
    })
    .text('Brutto', left + colWidth * 2, pageState.currY + 3, {
      width: colWidth,
      align: 'center',
    })
    .moveDown(0.7);

  pageState.prevY = pageState.currY;
  pageState.currY = doc.y;

  const netSum = data.order.positions.reduce(
    (acc: number, item: InvoicePosition) => {
      if ('heading' in item) return acc;
      return (acc += parseFloat(
        (
          (item.pricePerUnit as number) *
          (item.amount as number) *
          (1 - (item.discount as number) / 100)
        ).toFixed(2),
      ));
    },
    0,
  );

  doc
    .font('Times-Roman')
    .text(numberFormatter.format(netSum) + ' €', left, pageState.currY, {
      width: colWidth,
      align: 'center',
    })
    .text(
      numberFormatter.format(netSum * vatRate) + ' €',
      left + colWidth,
      pageState.currY,
      { width: colWidth, align: 'center' },
    )
    .text(
      numberFormatter.format(netSum * (1 + vatRate)) + ' €',
      left + colWidth * 2,
      pageState.currY,
      { width: colWidth, align: 'center' },
    );

  pageState.currY = doc.y;

  doc
    .lineWidth(1)
    .moveTo(left, pageState.currY + 3)
    .lineTo(pageOptions.size[0] - pageOptions.margins.left, pageState.currY + 3)
    .strokeColor('black')
    .strokeOpacity(1)
    .stroke();

  doc
    .lineWidth(1)
    .moveTo(left, pageState.prevY + (pageState.currY - pageState.prevY) / 2)
    .lineTo(
      pageOptions.size[0] - pageOptions.margins.left,
      pageState.prevY + (pageState.currY - pageState.prevY) / 2,
    )
    .stroke();

  for (const x of [
    left,
    left + colWidth,
    left + colWidth * 2,
    left + colWidth * 3,
  ]) {
    doc
      .lineWidth(1)
      .moveTo(x, pageState.prevY - 3)
      .lineTo(x, pageState.currY + 3)
      .stroke();
  }
}

function renderFooter(
  doc: PDFKit.PDFDocument,
  data: InvoiceData,
  pageState: PageState,
  cfg: AppConfig,
): void {
  const contentWidth =
    pageOptions.size[0] - pageOptions.margins.left - pageOptions.margins.right;
  const centeredOpts = { width: contentWidth, align: 'center' as const };

  doc.font('Times-Roman').fontSize(11);
  doc.moveDown(2);
  pageState.currY = doc.y;
  newPageCheck(doc, pageState, doc.currentLineHeight() * 7);

  doc.text(
    `Unsere Servicenummer ist ${cfg.DOC_PHONE_NUMBER}`,
    pageOptions.margins.left,
    CONTINUE_Y,
    centeredOpts,
  );
  doc.text(
    'Sie erreichen uns täglich von 8:00 bis 20:00',
    pageOptions.margins.left,
    CONTINUE_Y,
    centeredOpts,
  );
  doc.moveDown(1);

  if (data.order.paymentDueDate) {
    doc.text(
      `Bitte zahlen Sie die Rechnung fristgerecht bis zum ${formatIsoDateString(data.order.paymentDueDate)}.`,
      pageOptions.margins.left,
      CONTINUE_Y,
      centeredOpts,
    );
  }

  doc.text(
    'Rechnungsdatum entspricht Leistungs- bzw. Ausführungsdatum.',
    pageOptions.margins.left,
    CONTINUE_Y,
    centeredOpts,
  );
  doc.text(
    'Dieser Beleg wurde maschinell erstellt und ist auch ohne Unterschrift gültig.',
    pageOptions.margins.left,
    CONTINUE_Y,
    centeredOpts,
  );

  pageState.currY = doc.y;
  newPageCheck(doc, pageState, doc.currentLineHeight() * 6);

  doc
    .moveDown()
    .text(`Bank: ${cfg.DOC_BANK} (`, mmToPx(30), CONTINUE_Y, {
      underline: true,
      continued: true,
    })
    .font('Times-Bold')
    .text('BIC', { underline: true, continued: true })
    .font('Times-Roman')
    .text(`: ${cfg.DOC_BIC}) `, { underline: true, continued: true })
    .font('Times-Bold')
    .text('IBAN', { underline: true, continued: true })
    .font('Times-Roman')
    .text(`: ${cfg.DOC_IBAN}`, { underline: true })
    .text(
      `${cfg.DOC_COMPANY_TITLE} - Inh. ${cfg.DOC_OWNER} - ${cfg.DOC_STREET_AND_NUMBER} - ${cfg.DOC_ZIP_AND_CITY}`,
      pageOptions.margins.left,
      CONTINUE_Y,
      centeredOpts,
    )
    .text(
      `Mobil: ${cfg.DOC_PHONE_NUMBER} - E-Mail: ${cfg.DOC_EMAIL}`,
      pageOptions.margins.left,
      CONTINUE_Y,
      centeredOpts,
    )
    .text(
      `Ust.-IdNr.: ${cfg.DOC_VAT_ID} - St.Nr.: ${cfg.DOC_TAX_ID}`,
      pageOptions.margins.left,
      CONTINUE_Y,
      centeredOpts,
    );

  pageState.currY = doc.y;
}

// ── PDF rendering ─────────────────────────────────────────────────────────────

function createInvoice(doc: PDFKit.PDFDocument, data: InvoiceData): void {
  const cfg = getConfig();
  const pageState: PageState = { totalPages: 1, prevY: 0, currY: 0 };

  renderSubHeader(doc, data, cfg);
  renderInfoTable(doc, data);
  renderPositionsTable(doc, data, pageState);
  renderSumTable(doc, data, pageState);
  renderFooter(doc, data, pageState, cfg);
  doc.flushPages();
}

// ── Public API ────────────────────────────────────────────────────────────────

interface RenderOptions {
  savePath?: string;
  compress?: boolean;
}

function initPdfStream(options: RenderOptions): {
  pdfDoc: PDFKit.PDFDocument;
  result: Promise<Buffer>;
} {
  const pdfDoc = new PDFDocument({
    ...pageOptions,
    compress: options.compress ?? true,
  });
  if (options.savePath) pdfDoc.pipe(fs.createWriteStream(options.savePath));

  const chunks: Buffer[] = [];
  const result = new Promise<Buffer>((resolve, reject) => {
    pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
  });

  return { pdfDoc, result };
}

export function renderPDF(
  document: DocumentForRender,
  options: RenderOptions = {},
): Promise<Buffer> {
  try {
    const { pdfDoc, result } = initPdfStream(options);
    const data = toInvoiceData(document);
    createInvoice(pdfDoc, data);
    pdfDoc.info.Title =
      'Rechnung_' +
      (document.documentNumber ?? String(document.documentNumber));
    pdfDoc.end();
    return result;
  } catch (err) {
    return Promise.reject(err instanceof Error ? err : new Error(String(err)));
  }
}

export function renderMultiplePDF(
  documents: DocumentForRender[],
  options: RenderOptions = {},
): Promise<Buffer> {
  try {
    const { pdfDoc, result } = initPdfStream(options);
    documents.forEach((document, index) => {
      if (index > 0) pdfDoc.addPage(pageOptions);
      createInvoice(pdfDoc, toInvoiceData(document));
      if (index === documents.length - 1) pdfDoc.end();
    });
    return result;
  } catch (err) {
    return Promise.reject(err instanceof Error ? err : new Error(String(err)));
  }
}
