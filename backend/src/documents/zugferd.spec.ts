import { InvoiceService } from '@e-invoice-eu/core';
import { BadRequestException, Logger } from '@nestjs/common';
import { describe, expect, test } from 'vitest';

import { renderPDF } from './renderPDF';
import { singleInvoice } from './renderPDF.fixtures';
import { buildZugferdInvoiceData, embedZugferd } from './zugferd';

describe('ZUGFeRD Builder and Embedder', () => {
  test('buildZugferdInvoiceData maps singleInvoice accurately to EN16931 structure', () => {
    const invoice = buildZugferdInvoiceData(singleInvoice);
    const ubl = invoice['ubl:Invoice'];

    expect(ubl['cbc:ID']).toBe(singleInvoice.documentNumber);
    expect(ubl['cbc:IssueDate']).toBe(singleInvoice.documentDate);
    expect(ubl['cac:Delivery']?.['cbc:ActualDeliveryDate']).toBe(
      singleInvoice.documentDate,
    );
    expect(ubl['cbc:DocumentCurrencyCode']).toBe('EUR');
    expect(ubl['cbc:BuyerReference']).toBe('K003');

    // Customer
    expect(
      ubl['cac:AccountingCustomerParty']['cac:Party']['cac:PartyLegalEntity'][
        'cbc:RegistrationName'
      ],
    ).toBe('Musterfirma');
    expect(
      ubl['cac:AccountingCustomerParty']['cac:Party']['cac:PostalAddress'][
        'cbc:CityName'
      ],
    ).toBe('Musterstadt');

    // Notes include vehicle details
    expect(ubl['cbc:Note']).toBeDefined();
    const notesJoined = Array.isArray(ubl['cbc:Note'])
      ? ubl['cbc:Note'].join(' ')
      : ubl['cbc:Note'];
    expect(notesJoined).toContain('LEXUS RX400H');
    expect(notesJoined).toContain('A-BC 123');
    expect(notesJoined).toContain('ABCD12345');

    // Cash payment
    expect(ubl['cac:PaymentMeans']?.[0]?.['cbc:PaymentMeansCode']).toBe('10');

    // Invoice lines should contain only items (headings excluded from invoice lines)
    expect(ubl['cac:InvoiceLine'].length).toBe(18);

    // Sums check
    const monetary = ubl['cac:LegalMonetaryTotal'];
    expect(parseFloat(monetary['cbc:LineExtensionAmount'])).toBeGreaterThan(0);
    expect(parseFloat(monetary['cbc:TaxInclusiveAmount'])).toBeGreaterThan(
      parseFloat(monetary['cbc:LineExtensionAmount']),
    );
  });

  test('buildZugferdInvoiceData maps bank_transfer payment with IBAN and BIC', () => {
    const bankDoc = {
      ...singleInvoice,
      paymentMethod: 'bank_transfer' as const,
      paymentDueDate: '2017-01-20',
    };
    const invoice = buildZugferdInvoiceData(bankDoc);
    const ubl = invoice['ubl:Invoice'];

    expect(ubl['cbc:DueDate']).toBe('2017-01-20');
    expect(ubl['cac:PaymentTerms']).toBeUndefined();
    expect(ubl['cac:PaymentMeans']?.[0]?.['cbc:PaymentMeansCode']).toBe('58');
    expect(
      ubl['cac:PaymentMeans']?.[0]?.['cac:PayeeFinancialAccount']?.['cbc:ID'],
    ).toBeDefined();
    expect(
      ubl['cac:PaymentMeans']?.[0]?.['cac:PayeeFinancialAccount']?.[
        'cac:FinancialInstitutionBranch'
      ]?.['cbc:ID'],
    ).toBeDefined();
  });

  test('uses immediate payment terms when the invoice has no due date', () => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      paymentDueDate: null,
    })['ubl:Invoice'];
    expect(invoice['cac:PaymentTerms']?.['cbc:Note']).toBe(
      'Sofort ohne Abzug zahlbar',
    );
  });

  test('embedZugferd embeds factur-x.xml in the PDF', async () => {
    const basePdf = await renderPDF(singleInvoice, { compress: false });
    const zugferdPdf = await embedZugferd(basePdf, singleInvoice);

    expect(zugferdPdf).toBeInstanceOf(Buffer);
    expect(zugferdPdf.length).toBeGreaterThan(basePdf.length);
    expect(zugferdPdf.subarray(0, 8).toString('ascii')).toBe('%PDF-1.7');

    const pdfString = zugferdPdf.toString('latin1');
    expect(pdfString).toContain('factur-x.xml');
    expect(pdfString).toContain('pdfaExtension');
    expect(pdfString).toContain('EN 16931');
  });

  test('includes the invoice date as the service date in Factur-X CII data', async () => {
    const document = { ...singleInvoice, documentDate: '2024-02-29' };
    const invoice = buildZugferdInvoiceData(document);
    const pdf = await renderPDF(document);
    let cii = '';
    await new InvoiceService(new Logger('ZugferdTest')).generate(invoice, {
      format: 'factur-x-en16931',
      lang: 'de',
      pdf: {
        buffer: pdf,
        filename: 'invoice.pdf',
        mimetype: 'application/pdf',
      },
      postProcessor: (data) => {
        cii = JSON.stringify(data);
        return Promise.resolve();
      },
    });

    expect(JSON.parse(cii)).toMatchObject({
      'rsm:CrossIndustryInvoice': {
        'rsm:SupplyChainTradeTransaction': {
          'ram:ApplicableHeaderTradeDelivery': {
            'ram:ActualDeliverySupplyChainEvent': {
              'ram:OccurrenceDateTime': {
                'udt:DateTimeString': '20240229',
                'udt:DateTimeString@format': '102',
              },
            },
          },
        },
      },
    });
  });

  test('includes the default payment terms in Factur-X CII data', async () => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      paymentDueDate: null,
    });
    const pdf = await renderPDF(singleInvoice);
    let cii = '';
    await new InvoiceService(new Logger('ZugferdTest')).generate(invoice, {
      format: 'factur-x-en16931',
      lang: 'de',
      pdf: {
        buffer: pdf,
        filename: 'invoice.pdf',
        mimetype: 'application/pdf',
      },
      postProcessor: (data) => {
        cii = JSON.stringify(data);
        return Promise.resolve();
      },
    });

    expect(JSON.parse(cii)).toMatchObject({
      'rsm:CrossIndustryInvoice': {
        'rsm:SupplyChainTradeTransaction': {
          'ram:ApplicableHeaderTradeSettlement': {
            'ram:SpecifiedTradePaymentTerms': {
              'ram:Description': 'Sofort ohne Abzug zahlbar',
            },
          },
        },
      },
    });
  });

  test('rejects invoices without items', () => {
    const emptyDoc = {
      ...singleInvoice,
      documentNumber: '17-01-EMPTY',
      positions: [],
    };
    expect(() => buildZugferdInvoiceData(emptyDoc)).toThrow(
      'An invoice must have at least one line item',
    );
  });

  test('rejects invoices without an invoice number', () => {
    expect(() =>
      buildZugferdInvoiceData({ ...singleInvoice, documentNumber: null }),
    ).toThrow('An invoice number is required');
  });

  test('rejects unsupported payment methods with a bad request', () => {
    const build = () =>
      buildZugferdInvoiceData({
        ...singleInvoice,
        paymentMethod: 'unsupported',
      });
    expect(build).toThrow(BadRequestException);
    expect(build).toThrow('Unsupported payment method');
  });

  test('omits unspecified payment details instead of inventing a transfer', () => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      paymentMethod: null,
    })['ubl:Invoice'];
    expect(invoice['cac:PaymentMeans']).toBeUndefined();
    expect(invoice['cbc:DueDate']).toBeUndefined();
  });

  test('ignores whitespace-only names in existing snapshots', () => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      clientCompany: '  ',
      clientFirstName: '  ',
      clientLastName: 'Smith',
      carManufacturer: '',
      carModel: 'Model',
    })['ubl:Invoice'];
    expect(
      invoice['cac:AccountingCustomerParty']['cac:Party'][
        'cac:PartyLegalEntity'
      ]['cbc:RegistrationName'],
    ).toBe('Smith');
    expect(invoice['cbc:Note']).toBe('Model, A-BC 123, ABCD12345, 12 345');
  });

  test('requires item quantity and price', () => {
    const item = singleInvoice.positions[1];
    for (const [field, message] of [
      ['amount', 'Quantity and price are required for invoice line 1'],
      ['pricePerUnit', 'Quantity and price are required for invoice line 1'],
    ] as const) {
      expect(() =>
        buildZugferdInvoiceData({
          ...singleInvoice,
          positions: [{ ...item, [field]: null }],
        }),
      ).toThrow(message);
    }
  });

  test.each([
    ['  Brake pads  ', 'PART-1', '  Brake pads  '],
    [null, '  PART-1  ', '  PART-1  '],
    ['  ', '  PART-1  ', '  PART-1  '],
    [null, null, 'Unspecified item'],
    ['  ', '  ', 'Unspecified item'],
  ])(
    'uses the available item name for description %s and article ID %s',
    (description, articleId, expected) => {
      const invoice = buildZugferdInvoiceData({
        ...singleInvoice,
        positions: [{ ...singleInvoice.positions[1], description, articleId }],
      })['ubl:Invoice'];
      expect(invoice['cac:InvoiceLine'][0]['cac:Item']['cbc:Name']).toBe(
        expected,
      );
    },
  );

  test.each([
    ['PART-1', 'PART-1'],
    [null, undefined],
    ['', undefined],
    ['  ', undefined],
  ])('maps optional article ID %s separately', (articleId, expected) => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      positions: [
        { ...singleInvoice.positions[1], description: 'Brake pads', articleId },
      ],
    })['ubl:Invoice'];
    const item = invoice['cac:InvoiceLine'][0]['cac:Item'];
    expect(item['cbc:Name']).toBe('Brake pads');
    expect(item['cac:SellersItemIdentification']?.['cbc:ID']).toBe(expected);
  });

  test('includes the article ID in the Factur-X CII data', async () => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      positions: [
        {
          ...singleInvoice.positions[1],
          description: 'Brake pads',
          articleId: 'PART-1',
        },
      ],
    });
    const pdf = await renderPDF(singleInvoice, { compress: false });
    let cii = '';
    await new InvoiceService(new Logger('ZugferdTest')).generate(invoice, {
      format: 'factur-x-en16931',
      lang: 'de',
      pdf: {
        buffer: pdf,
        filename: 'invoice.pdf',
        mimetype: 'application/pdf',
      },
      postProcessor: (data) => {
        cii = JSON.stringify(data);
        return Promise.resolve();
      },
    });
    expect(cii).toContain('"ram:SellerAssignedID":"PART-1"');
  });

  test('rejects invalid numeric values', () => {
    expect(() =>
      buildZugferdInvoiceData({
        ...singleInvoice,
        positions: [{ ...singleInvoice.positions[1], discount: 101 }],
      }),
    ).toThrow('Invoice line 1 contains invalid numeric values');
  });

  test('rounds each line before calculating invoice totals', () => {
    const item = {
      ...singleInvoice.positions[1],
      amount: 1,
      pricePerUnit: 0.335,
      discount: 0,
    };
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      positions: [item, item],
    })['ubl:Invoice'];
    expect(invoice['cac:InvoiceLine'][0]['cbc:LineExtensionAmount']).toBe(
      '0.34',
    );
    expect(invoice['cac:InvoiceLine'][0]['cac:Price']['cbc:PriceAmount']).toBe(
      '0.335',
    );
    expect(invoice['cac:LegalMonetaryTotal']['cbc:LineExtensionAmount']).toBe(
      '0.68',
    );
    expect(invoice['cac:TaxTotal'][0]['cbc:TaxAmount']).toBe('0.13');
    expect(invoice['cac:LegalMonetaryTotal']['cbc:PayableAmount']).toBe('0.81');
  });

  test('keeps the discounted unit price unrounded while rounding the line', () => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      positions: [
        {
          ...singleInvoice.positions[1],
          amount: 2,
          pricePerUnit: 0.335,
          discount: 10,
        },
      ],
    })['ubl:Invoice'];
    const line = invoice['cac:InvoiceLine'][0];
    expect(line['cac:Price']['cbc:PriceAmount']).toBe('0.3015');
    expect(line['cac:Price']['cac:AllowanceCharge']).toEqual({
      'cbc:ChargeIndicator': 'false',
      'cbc:Amount': '0.0335',
      'cbc:Amount@currencyID': 'EUR',
      'cbc:BaseAmount': '0.335',
      'cbc:BaseAmount@currencyID': 'EUR',
    });
    expect(line['cbc:LineExtensionAmount']).toBe('0.60');
  });

  test.each([0, null])(
    'omits price discount information when discount is %s',
    (discount) => {
      const invoice = buildZugferdInvoiceData({
        ...singleInvoice,
        positions: [{ ...singleInvoice.positions[1], discount }],
      })['ubl:Invoice'];
      expect(
        invoice['cac:InvoiceLine'][0]['cac:Price']['cac:AllowanceCharge'],
      ).toBeUndefined();
    },
  );

  test.each([
    [100, 10, '10', '0'],
    [25, 0, '0', '0'],
  ])(
    'preserves unit discount and net price for %s percent of %s',
    (discount, pricePerUnit, unitDiscount, netPrice) => {
      const invoice = buildZugferdInvoiceData({
        ...singleInvoice,
        positions: [{ ...singleInvoice.positions[1], discount, pricePerUnit }],
      })['ubl:Invoice'];
      const price = invoice['cac:InvoiceLine'][0]['cac:Price'];
      expect(price['cbc:PriceAmount']).toBe(netPrice);
      expect(price['cac:AllowanceCharge']?.['cbc:Amount']).toBe(unitDiscount);
      expect(price['cac:AllowanceCharge']?.['cbc:BaseAmount']).toBe(
        String(pricePerUnit),
      );
    },
  );

  test('includes original unit price and discount in Factur-X CII data', async () => {
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      positions: [
        {
          ...singleInvoice.positions[1],
          amount: 2,
          pricePerUnit: 0.335,
          discount: 10,
        },
      ],
    });
    const pdf = await renderPDF(singleInvoice, { compress: false });
    let cii = '';
    await new InvoiceService(new Logger('ZugferdTest')).generate(invoice, {
      format: 'factur-x-en16931',
      lang: 'de',
      pdf: {
        buffer: pdf,
        filename: 'invoice.pdf',
        mimetype: 'application/pdf',
      },
      postProcessor: (data) => {
        cii = JSON.stringify(data);
        return Promise.resolve();
      },
    });
    expect(cii).toContain('"ram:GrossPriceProductTradePrice"');
    expect(cii).toContain('"ram:ChargeAmount":"0.335"');
    expect(cii).toContain('"ram:AppliedTradeAllowanceCharge"');
    expect(cii).toContain('"ram:ActualAmount":"0.0335"');
    expect(cii).toContain('"ram:ChargeAmount":"0.3015"');
  });

  test('rounds decimal half cents without binary floating-point errors', () => {
    const item = {
      ...singleInvoice.positions[1],
      amount: 1,
      pricePerUnit: 1.005,
      discount: 0,
    };
    const invoice = buildZugferdInvoiceData({
      ...singleInvoice,
      positions: [item, item],
    })['ubl:Invoice'];
    expect(invoice['cac:InvoiceLine'][0]['cbc:LineExtensionAmount']).toBe(
      '1.01',
    );
    expect(invoice['cac:LegalMonetaryTotal']['cbc:LineExtensionAmount']).toBe(
      '2.02',
    );
    expect(invoice['cac:LegalMonetaryTotal']['cbc:PayableAmount']).toBe('2.40');
  });
});
