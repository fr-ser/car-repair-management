import Decimal from 'decimal.js';

export function getVatRate(isoDate?: string): number {
  if (isoDate == null || isoDate === '') {
    return 0.19;
  }

  const date = new Date(isoDate);
  const startReducedVat = new Date('2020-07-01');
  const endReducedVat = new Date('2020-12-31');

  return date >= startReducedVat && date <= endReducedVat ? 0.16 : 0.19;
}

export function invoiceLineNet(
  price: number,
  amount: number,
  discount: number,
): number {
  return new Decimal(price)
    .mul(amount)
    .mul(new Decimal(1).minus(new Decimal(discount).div(100)))
    .toDecimalPlaces(2)
    .toNumber();
}

export function invoiceTotals(net: number, vatRate: number) {
  const netTotal = new Decimal(net).toDecimalPlaces(2);
  const vat = netTotal.mul(vatRate).toDecimalPlaces(2);
  return {
    net: netTotal.toNumber(),
    vat: vat.toNumber(),
    gross: netTotal.plus(vat).toNumber(),
  };
}
