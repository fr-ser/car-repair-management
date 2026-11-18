import { Invoice, InvoiceService } from '@e-invoice-eu/core';
import { BadRequestException, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';

import { getDefaultPaymentTerms } from '@/src/common/document-format';
import {
  getVatRate,
  invoiceLineNet,
  invoiceTotals,
} from '@/src/common/helpers';
import { getConfig } from '@/src/config';
import { PaymentMethod } from '@/src/orders/order.dto';

import { DocumentForRender } from './renderPDF';

const logger = new Logger('Zugferd');

function hasText(value: string | null): value is string {
  return value != null && value.trim().length > 0;
}

/**
 * Builds the canonical EN16931 / UBL invoice structure required by @e-invoice-eu/core.
 */
export function buildZugferdInvoiceData(document: DocumentForRender): Invoice {
  const config = getConfig();
  const currency = 'EUR' as const;

  if (!document.documentNumber) {
    throw new BadRequestException('An invoice number is required');
  }

  const buyerName = hasText(document.clientCompany)
    ? document.clientCompany
    : [document.clientFirstName, document.clientLastName]
        .filter(hasText)
        .join(' ');

  let paymentMeans: Invoice['ubl:Invoice']['cac:PaymentMeans'];
  if (document.paymentMethod === PaymentMethod.BANK_TRANSFER) {
    paymentMeans = [
      {
        'cbc:PaymentMeansCode': '58',
        'cac:PayeeFinancialAccount': {
          'cbc:ID': config.DOC_IBAN.replace(/\s+/g, ''),
          'cac:FinancialInstitutionBranch': {
            'cbc:ID': config.DOC_BIC.replace(/\s+/g, ''),
          },
        },
      },
    ];
  } else if (document.paymentMethod === PaymentMethod.CASH) {
    paymentMeans = [{ 'cbc:PaymentMeansCode': '10' }];
  } else if (document.paymentMethod != null) {
    throw new BadRequestException('Unsupported payment method');
  }

  const vatRate = getVatRate(document.documentDate);
  const vatPercent = String(Math.round(vatRate * 100));

  let lineExtensionSum = 0;

  const invoiceLines = document.positions
    .filter((p) => p.type === 'item')
    .map((p, idx) => {
      if (p.amount == null || p.pricePerUnit == null) {
        throw new BadRequestException(
          `Quantity and price are required for invoice line ${idx + 1}`,
        );
      }
      const quantity = Number(p.amount);
      const pricePerUnit = Number(p.pricePerUnit);
      const discount = p.discount != null ? Number(p.discount) : 0;
      if (
        !Number.isFinite(quantity) ||
        !Number.isFinite(pricePerUnit) ||
        pricePerUnit < 0 ||
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
      ) {
        throw new BadRequestException(
          `Invoice line ${idx + 1} contains invalid numeric values`,
        );
      }
      // invoiceLineNet rounds the line total; the XML unit price must remain unrounded.
      const originalUnitPrice = new Decimal(String(p.pricePerUnit));
      const unitDiscount = originalUnitPrice.mul(
        new Decimal(discount).div(100),
      );
      const netUnitPrice = originalUnitPrice.minus(unitDiscount).toString();
      const lineNetAmount = invoiceLineNet(pricePerUnit, quantity, discount);
      lineExtensionSum += lineNetAmount;

      return {
        'cbc:ID': String(idx + 1),
        'cbc:InvoicedQuantity': String(quantity),
        'cbc:InvoicedQuantity@unitCode': 'C62' as const, // hardcoded to "Piece/Stück"
        'cbc:LineExtensionAmount': lineNetAmount.toFixed(2),
        'cbc:LineExtensionAmount@currencyID': currency,
        'cac:Item': {
          'cbc:Name':
            [p.description, p.articleId].find(hasText) ?? 'Unspecified item',
          ...(hasText(p.articleId) && {
            'cac:SellersItemIdentification': { 'cbc:ID': p.articleId },
          }),
          'cac:ClassifiedTaxCategory': {
            'cbc:ID': 'S' as const,
            'cbc:Percent': vatPercent,
            'cac:TaxScheme': { 'cbc:ID': 'VAT' },
          },
        },
        'cac:Price': {
          'cbc:PriceAmount': netUnitPrice,
          'cbc:PriceAmount@currencyID': currency,
          ...(discount > 0 && {
            'cac:AllowanceCharge': {
              'cbc:ChargeIndicator': 'false',
              'cbc:Amount': unitDiscount.toString(),
              'cbc:Amount@currencyID': currency,
              'cbc:BaseAmount': originalUnitPrice.toString(),
              'cbc:BaseAmount@currencyID': currency,
            },
          }),
        },
      };
    });

  const [firstLine, ...remainingLines] = invoiceLines;
  if (!firstLine) {
    throw new BadRequestException(
      'An invoice must have at least one line item',
    );
  }
  const totals = invoiceTotals(lineExtensionSum, vatRate);
  const paymentTerms = getDefaultPaymentTerms(
    document.type,
    document.paymentDueDate,
  );

  const vehicleNote = [
    [document.carManufacturer, document.carModel].filter(hasText).join(' '),
    document.carLicensePlate,
    document.carVin,
    document.carMileage != null ? String(document.carMileage) : null,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    'ubl:Invoice': {
      'cbc:ID': document.documentNumber,
      'cbc:IssueDate': document.documentDate,
      'cac:Delivery': {
        'cbc:ActualDeliveryDate': document.documentDate,
      },
      ...(document.paymentDueDate && {
        'cbc:DueDate': document.paymentDueDate,
      }),
      ...(paymentTerms && { 'cac:PaymentTerms': { 'cbc:Note': paymentTerms } }),
      'cbc:InvoiceTypeCode': '380', // commercial invoice
      'cbc:DocumentCurrencyCode': currency,
      ...(document.clientNumber && {
        'cbc:BuyerReference': document.clientNumber,
      }),
      ...(vehicleNote && { 'cbc:Note': vehicleNote }),
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PostalAddress': {
            'cbc:StreetName': config.DOC_STREET_AND_NUMBER,
            'cbc:CityName': config.DOC_CITY,
            'cbc:PostalZone': config.DOC_POSTAL_CODE,
            'cac:Country': {
              'cbc:IdentificationCode': 'DE',
            },
          },
          'cac:PartyTaxScheme': [
            {
              'cbc:CompanyID': config.DOC_VAT_ID.replace(/\s+/g, ''),
              'cac:TaxScheme': { 'cbc:ID': 'VAT' },
            },
          ],
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': config.DOC_COMPANY_TITLE,
          },
          'cac:Contact': {
            'cbc:Name': config.DOC_OWNER,
            'cbc:Telephone': config.DOC_PHONE_NUMBER,
            'cbc:ElectronicMail': config.DOC_EMAIL,
          },
        },
      },
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PostalAddress': {
            'cbc:StreetName': document.clientStreet || '',
            'cbc:CityName': document.clientCity || '',
            'cbc:PostalZone': document.clientPostalCode || '',
            'cac:Country': {
              'cbc:IdentificationCode': 'DE',
            },
          },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': buyerName,
          },
        },
      },
      ...(paymentMeans && { 'cac:PaymentMeans': paymentMeans }),
      'cac:TaxTotal': [
        {
          'cbc:TaxAmount': totals.vat.toFixed(2),
          'cbc:TaxAmount@currencyID': currency,
          'cac:TaxSubtotal': [
            {
              'cbc:TaxableAmount': totals.net.toFixed(2),
              'cbc:TaxableAmount@currencyID': currency,
              'cbc:TaxAmount': totals.vat.toFixed(2),
              'cbc:TaxAmount@currencyID': currency,
              'cac:TaxCategory': {
                'cbc:ID': 'S',
                'cbc:Percent': vatPercent,
                'cac:TaxScheme': { 'cbc:ID': 'VAT' },
              },
            },
          ],
        },
      ],
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': totals.net.toFixed(2),
        'cbc:LineExtensionAmount@currencyID': currency,
        'cbc:TaxExclusiveAmount': totals.net.toFixed(2),
        'cbc:TaxExclusiveAmount@currencyID': currency,
        'cbc:TaxInclusiveAmount': totals.gross.toFixed(2),
        'cbc:TaxInclusiveAmount@currencyID': currency,
        'cbc:PayableAmount': totals.gross.toFixed(2),
        'cbc:PayableAmount@currencyID': currency,
      },
      'cac:InvoiceLine': [firstLine, ...remainingLines],
    },
  };
}

/**
 * Embeds ZUGFeRD / Factur-X (EN16931 COMFORT profile) machine-readable CII XML
 * into an existing PDF buffer.
 */
export async function embedZugferd(
  pdfBuffer: Buffer,
  document: DocumentForRender,
): Promise<Buffer> {
  const invoiceData = buildZugferdInvoiceData(document);

  const invoiceService = new InvoiceService(logger);

  const filename = `${document.documentNumber}.pdf`;

  const result = await invoiceService.generate(invoiceData, {
    format: 'factur-x-en16931',
    lang: 'de',
    pdf: {
      buffer: pdfBuffer,
      filename,
      mimetype: 'application/pdf',
    },
  });

  return Buffer.from(result);
}
