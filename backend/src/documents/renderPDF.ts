import fs from 'fs';
import PDFDocument from 'pdfkit';

import { Prisma } from '@/src/generated/prisma/client';

import { formatIsoDateString, getVatRate } from '@/src/common/helpers';

// ── Public input type ─────────────────────────────────────────────────────────

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

// ── Internal types (pdfkit rendering) ────────────────────────────────────────

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

function mmToPx(num: number) {
  return (72 / 25.4) * num;
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

// ── PDF rendering ─────────────────────────────────────────────────────────────

function createInvoice(doc: PDFKit.PDFDocument, data: InvoiceData) {
  const DOC_COMPANY_TITLE = process.env.DOC_COMPANY_TITLE!;
  const DOC_COMPANY_SUB_TITLE = process.env.DOC_COMPANY_SUB_TITLE!;
  const DOC_STREET_AND_NUMBER = process.env.DOC_STREET_AND_NUMBER!;
  const DOC_ZIP_AND_CITY = process.env.DOC_ZIP_AND_CITY!;
  const DOC_EMAIL = process.env.DOC_EMAIL!;
  const DOC_PHONE_NUMBER = process.env.DOC_PHONE_NUMBER!;
  const DOC_BANK = process.env.DOC_BANK!;
  const DOC_BIC = process.env.DOC_BIC!;
  const DOC_IBAN = process.env.DOC_IBAN!;
  const DOC_OWNER = process.env.DOC_OWNER!;
  const DOC_VAT_ID = process.env.DOC_VAT_ID!;
  const DOC_TAX_ID = process.env.DOC_TAX_ID!;

  const pageState = { totalPages: 1, prevY: 0, currY: 0 };

  const newPageCheck = function (
    doc: PDFKit.PDFDocument,
    start: number,
    addition: number,
  ) {
    if (pageOptions.size[1] - pageOptions.margins.bottom < start + addition) {
      doc.addPage(pageOptions);
      pageState.totalPages++;
      pageState.currY = pageOptions.margins.top;
      return true;
    } else return false;
  };

  const createSubHeader = function (
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
  ) {
    doc
      .font('Times-Roman')
      .fontSize(25)
      .text(
        DOC_COMPANY_TITLE,
        pageOptions.margins.left,
        pageOptions.margins.top,
        {
          width:
            pageOptions.size[0] -
            pageOptions.margins.left -
            pageOptions.margins.right,
          align: 'center',
        },
      )
      .font('Times-Roman')
      .fontSize(14)
      .text(DOC_COMPANY_SUB_TITLE, pageOptions.margins.left, doc.y - 5, {
        width:
          pageOptions.size[0] -
          pageOptions.margins.left -
          pageOptions.margins.right,
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
        `${DOC_STREET_AND_NUMBER} / ${DOC_ZIP_AND_CITY} / E-Mail: ${DOC_EMAIL}`,
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
        width:
          pageOptions.size[0] -
          pageOptions.margins.left -
          pageOptions.margins.right,
        align: 'center',
      });
  };

  const createTableTopTable = function (
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
  ) {
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
      let yPosition = doc.y;
      doc
        .font('Times-Bold')
        .text(`${key}: `, mmToPx(22), yPosition)
        .font('Times-Roman')
        .text(value, mmToPx(50), yPosition, {
          lineGap: 3.7,
          width: mmToPx(55),
        });

      yPosition = doc.y;
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
      let yPosition = doc.y;
      doc
        .font('Times-Bold')
        .text(`${key}: `, mmToPx(110), yPosition)
        .font('Times-Roman')
        .text(value, mmToPx(150), yPosition, {
          lineGap: 3.7,
          width: pageOptions.size[0] - pageOptions.margins.right - mmToPx(150),
        });

      yPosition = doc.y;
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
  };

  const tParams: { [index: string]: number } = {
    c1x: pageOptions.margins.left,
    c2x: mmToPx(25),
    c3x: mmToPx(53),
    c4x: mmToPx(117),
    c5x: mmToPx(140),
    c6x: mmToPx(155),
    c7x: mmToPx(170),
    c8x: pageOptions.size[0] - pageOptions.margins.right,
  };

  const createTable = function (doc: PDFKit.PDFDocument, data: InvoiceData) {
    const createTableHeader = function () {
      doc
        .font('Times-Roman')
        .fontSize(10)
        .text('Pos.', tParams.c1x, pageState.currY, {
          width: tParams.c2x - tParams.c1x,
          align: 'center',
        })
        .text('Art.-Nr.', tParams.c2x, pageState.currY, {
          width: tParams.c3x - tParams.c2x,
          align: 'center',
        })
        .text('Bezeichnung', tParams.c3x, pageState.currY, {
          width: tParams.c4x - tParams.c3x,
          align: 'center',
        })
        .text('Preis / Einheit', tParams.c4x, pageState.currY, {
          width: tParams.c5x - tParams.c4x,
          align: 'center',
        })
        .text('Rabatt', tParams.c5x, pageState.currY, {
          width: tParams.c6x - tParams.c5x,
          align: 'center',
        })
        .text('Menge', tParams.c6x, pageState.currY, {
          width: tParams.c7x - tParams.c6x,
          align: 'center',
        })
        .text('Preis (Netto)', tParams.c7x, pageState.currY, {
          width: tParams.c8x - tParams.c7x,
          align: 'center',
        });

      doc
        .lineWidth(1)
        .moveTo(tParams.c1x, pageState.currY + mmToPx(4))
        .lineTo(
          pageOptions.size[0] - pageOptions.margins.right,
          pageState.currY + mmToPx(4),
        )
        .stroke();
      pageState.currY = pageState.currY + mmToPx(4) + 5;
    };

    pageState.currY = mmToPx(107);
    createTableHeader();

    let posCounter = 0;

    data.order.positions.forEach(function (position) {
      doc.fontSize(10);

      const heightDescription = doc.heightOfString(
        'heading' in position
          ? (position.heading as string)
          : (position.description as string),
        { width: tParams.c4x - tParams.c3x },
      );

      const heightArticleNumber = doc.heightOfString(
        'articleId' in position ? (position.articleId as string) : '',
        { width: tParams.c3x - tParams.c2x },
      );

      const biggestLineHeight = Math.max(
        heightArticleNumber,
        heightDescription,
      );

      if (newPageCheck(doc, pageState.currY, biggestLineHeight)) {
        createTableHeader();
      }

      if ('heading' in position) {
        doc
          .font('Times-Bold')
          .fontSize(10)
          .text(
            (position.heading as string).trim(),
            tParams.c3x,
            pageState.currY,
            {
              width: tParams.c4x - tParams.c3x,
              align: 'center',
            },
          );
      } else {
        posCounter++;

        doc
          .font('Times-Roman')
          .fontSize(10)
          .text(posCounter.toString(), tParams.c1x, pageState.currY, {
            width: tParams.c2x - tParams.c1x,
            align: 'center',
          })
          .text(position.articleId as string, tParams.c2x, pageState.currY, {
            width: tParams.c3x - tParams.c2x,
            align: 'center',
          })
          .text(
            (position.description as string).trim(),
            tParams.c3x,
            pageState.currY,
            {
              width: tParams.c4x - tParams.c3x,
              align: 'center',
            },
          )
          .fontSize(9)
          .text(
            numberFormatter.format(position.pricePerUnit as number),
            tParams.c4x,
            pageState.currY,
            {
              width: tParams.c5x - tParams.c4x,
              align: 'center',
            },
          )
          .text(
            numberFormatter.format(position.discount as number) + ' %',
            tParams.c5x,
            pageState.currY,
            {
              width: tParams.c6x - tParams.c5x,
              align: 'center',
            },
          )
          .text(
            numberFormatter.format(position.amount as number),
            tParams.c6x,
            pageState.currY,
            {
              width: tParams.c7x - tParams.c6x,
              align: 'center',
            },
          )
          .text(
            numberFormatter.format(
              (position.pricePerUnit as number) *
                (position.amount as number) *
                (1 - (position.discount as number) / 100),
            ),
            tParams.c7x,
            pageState.currY,
            { width: tParams.c8x - tParams.c7x, align: 'center' },
          );
      }

      doc
        .lineWidth(1)
        .strokeOpacity(0.5)
        .strokeColor([96, 125, 139])
        .moveTo(tParams.c1x, pageState.currY + biggestLineHeight + 1)
        .lineTo(
          pageOptions.size[0] - pageOptions.margins.right,
          pageState.currY + biggestLineHeight + 1,
        )
        .stroke();

      pageState.prevY = pageState.currY;
      pageState.currY = pageState.currY + biggestLineHeight + 5;

      for (let ii = 1; ii < 9; ii++) {
        const tempX = tParams['c' + ii + 'x'];

        doc
          .lineWidth(1)
          .strokeOpacity(0.5)
          .strokeColor([96, 125, 139])
          .moveTo(tempX, pageState.prevY - 5)
          .lineTo(tempX, pageState.currY - 5)
          .stroke();
      }
    });
    pageState.currY += 10;
  };

  const createSumTable = function (doc: PDFKit.PDFDocument, data: InvoiceData) {
    const vatRate = getVatRate(data.order.date);
    if (pageState.totalPages === 1 && pageState.currY < mmToPx(215))
      pageState.currY = mmToPx(215);

    doc.fontSize(12).font('Times-Bold');
    newPageCheck(doc, pageState.currY, doc.currentLineHeight() * 4);

    doc
      .lineWidth(1)
      .moveTo(pageOptions.margins.left, pageState.currY - 3)
      .lineTo(
        pageOptions.size[0] - pageOptions.margins.right,
        pageState.currY - 3,
      )
      .strokeColor('black')
      .strokeOpacity(1)
      .stroke();

    doc
      .text('Netto', pageOptions.margins.left, pageState.currY + 3, {
        width: mmToPx(60),
        align: 'center',
      })
      .text(
        `${vatRate * 100}% MwSt`,
        pageOptions.margins.left + mmToPx(60),
        pageState.currY + 3,
        { width: mmToPx(60), align: 'center' },
      )
      .text(
        'Brutto',
        pageOptions.margins.left + mmToPx(120),
        pageState.currY + 3,
        { width: mmToPx(60), align: 'center' },
      )
      .moveDown(0.7);
    pageState.prevY = pageState.currY;
    pageState.currY = doc.y;

    const netSum = data.order.positions.reduce(function (
      curr: number,
      item: InvoicePosition,
    ) {
      if ('heading' in item) return curr;
      else
        return (curr += parseFloat(
          (
            (item.pricePerUnit as number) *
            (item.amount as number) *
            (1 - (item.discount as number) / 100)
          ).toFixed(2),
        ));
    }, 0);

    doc
      .font('Times-Roman')
      .text(
        numberFormatter.format(netSum) + ' €',
        pageOptions.margins.left,
        pageState.currY,
        { width: mmToPx(60), align: 'center' },
      )
      .text(
        numberFormatter.format(netSum * vatRate) + ' €',
        pageOptions.margins.left + mmToPx(60),
        pageState.currY,
        { width: mmToPx(60), align: 'center' },
      )
      .text(
        numberFormatter.format(netSum * (1 + vatRate)) + ' €',
        pageOptions.margins.left + mmToPx(120),
        pageState.currY,
        { width: mmToPx(60), align: 'center' },
      );

    pageState.currY = doc.y;

    doc
      .lineWidth(1)
      .moveTo(pageOptions.margins.left, pageState.currY + 3)
      .lineTo(
        pageOptions.size[0] - pageOptions.margins.left,
        pageState.currY + 3,
      )
      .strokeColor('black')
      .strokeOpacity(1)
      .stroke();

    doc
      .lineWidth(1)
      .moveTo(
        pageOptions.margins.left,
        pageState.prevY + (doc.y - pageState.prevY) / 2,
      )
      .lineTo(
        pageOptions.size[0] - pageOptions.margins.left,
        pageState.prevY + (doc.y - pageState.prevY) / 2,
      )
      .stroke();

    doc
      .lineWidth(1)
      .moveTo(pageOptions.margins.left, pageState.prevY - 3)
      .lineTo(pageOptions.margins.left, pageState.currY + 3)
      .stroke();

    doc
      .lineWidth(1)
      .moveTo(pageOptions.margins.left + mmToPx(60), pageState.prevY - 3)
      .lineTo(pageOptions.margins.left + mmToPx(60), pageState.currY + 3)
      .stroke();

    doc
      .lineWidth(1)
      .moveTo(pageOptions.margins.left + mmToPx(120), pageState.prevY - 3)
      .lineTo(pageOptions.margins.left + mmToPx(120), pageState.currY + 3)
      .stroke();

    doc
      .lineWidth(1)
      .moveTo(pageOptions.margins.left + mmToPx(180), pageState.prevY - 3)
      .lineTo(pageOptions.margins.left + mmToPx(180), pageState.currY + 3)
      .stroke();
  };

  const createTableBottomText = function (
    doc: PDFKit.PDFDocument,
    data: InvoiceData,
  ) {
    doc.font('Times-Roman').fontSize(11);
    doc.moveDown(2);
    pageState.currY = doc.y;
    newPageCheck(doc, pageState.currY, doc.currentLineHeight() * 7);
    doc.text(
      `Unsere Servicenummer ist ${DOC_PHONE_NUMBER}`,
      pageOptions.margins.left,
      null as unknown as number,
      {
        width:
          pageOptions.size[0] -
          pageOptions.margins.left -
          pageOptions.margins.right,
        align: 'center',
      },
    );
    doc.text(
      'Sie erreichen uns täglich von 8:00 bis 20:00',
      pageOptions.margins.left,
      null as unknown as number,
      {
        width:
          pageOptions.size[0] -
          pageOptions.margins.left -
          pageOptions.margins.right,
        align: 'center',
      },
    );
    doc.moveDown(1);
    if (data.order.paymentDueDate) {
      doc.text(
        `Bitte zahlen Sie die Rechnung fristgerecht bis zum ${formatIsoDateString(
          data.order.paymentDueDate,
        )}.`,
        pageOptions.margins.left,
        null as unknown as number,
        {
          width:
            pageOptions.size[0] -
            pageOptions.margins.left -
            pageOptions.margins.right,
          align: 'center',
        },
      );
    }
    doc.text(
      'Rechnungsdatum entspricht Leistungs- bzw. Ausführungsdatum.',
      pageOptions.margins.left,
      null as unknown as number,
      {
        width:
          pageOptions.size[0] -
          pageOptions.margins.left -
          pageOptions.margins.right,
        align: 'center',
      },
    );
    doc.text(
      'Dieser Beleg wurde maschinell erstellt und ist auch ohne Unterschrift gültig.',
      pageOptions.margins.left,
      null as unknown as number,
      {
        width:
          pageOptions.size[0] -
          pageOptions.margins.left -
          pageOptions.margins.right,
        align: 'center',
      },
    );
    pageState.currY = doc.y;

    newPageCheck(doc, pageState.currY, doc.currentLineHeight() * 6);
    doc
      .moveDown()
      .text(`Bank: ${DOC_BANK} (`, mmToPx(30), null as unknown as number, {
        underline: true,
        continued: true,
      })
      .font('Times-Bold')
      .text('BIC', { underline: true, continued: true })
      .font('Times-Roman')
      .text(`: ${DOC_BIC}) `, { underline: true, continued: true })
      .font('Times-Bold')
      .text('IBAN', { underline: true, continued: true })
      .font('Times-Roman')
      .text(`: ${DOC_IBAN}`, { underline: true })
      .text(
        `${DOC_COMPANY_TITLE} - Inh. ${DOC_OWNER} - ` +
          `${DOC_STREET_AND_NUMBER} - ${DOC_ZIP_AND_CITY}`,
        pageOptions.margins.left,
        null as unknown as number,
        {
          width:
            pageOptions.size[0] -
            pageOptions.margins.left -
            pageOptions.margins.right,
          align: 'center',
        },
      )
      .text(
        `Mobil: ${DOC_PHONE_NUMBER} - E-Mail: ${DOC_EMAIL}`,
        pageOptions.margins.left,
        null as unknown as number,
        {
          width:
            pageOptions.size[0] -
            pageOptions.margins.left -
            pageOptions.margins.right,
          align: 'center',
        },
      )
      .text(
        `Ust.-IdNr.: ${DOC_VAT_ID} - St.Nr.: ${DOC_TAX_ID}`,
        pageOptions.margins.left,
        null as unknown as number,
        {
          width:
            pageOptions.size[0] -
            pageOptions.margins.left -
            pageOptions.margins.right,
          align: 'center',
        },
      );
    pageState.currY = doc.y;
  };

  createSubHeader(doc, data);
  createTableTopTable(doc, data);
  createTable(doc, data);
  createSumTable(doc, data);
  createTableBottomText(doc, data);
  doc.flushPages();
}

// ── Public API ────────────────────────────────────────────────────────────────

interface RenderOptions {
  savePath?: string;
}

export function renderPDF(
  document: DocumentForRender,
  options: RenderOptions = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = new PDFDocument(pageOptions);
      if (options.savePath) pdfDoc.pipe(fs.createWriteStream(options.savePath));

      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));

      const data = toInvoiceData(document);
      createInvoice(pdfDoc, data);
      pdfDoc.info.Title =
        'Rechnung_' +
        (document.documentNumber ?? String(document.documentNumber));
      pdfDoc.end();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

export function renderMultiplePDF(
  documents: DocumentForRender[],
  options: RenderOptions = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = new PDFDocument(pageOptions);
      if (options.savePath) pdfDoc.pipe(fs.createWriteStream(options.savePath));

      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));

      documents.forEach((document, index) => {
        if (index > 0) pdfDoc.addPage(pageOptions);
        createInvoice(pdfDoc, toInvoiceData(document));
        if (index === documents.length - 1) pdfDoc.end();
      });
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
