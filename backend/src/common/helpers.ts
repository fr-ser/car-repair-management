import { getVatRate } from './invoice-calculations';

export {
  getVatRate,
  invoiceLineNet,
  invoiceTotals,
} from './invoice-calculations';
export { formatIsoDateString } from './document-format';
export { formatInvoiceLineNumber, formatNumber } from './number-format';

/**
 * This function is for compile time checking of completeness of if statements
 * It needs to be passed the parameter, that has been checked exhaustively
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function neverFunction(_: never): never {
  throw new Error('This function should not have been called.');
}

export function maybeMultiply(a?: number, b?: number) {
  if (a && b) {
    return a * b;
  } else {
    return undefined;
  }
}

export function getVatAmount(amount?: number, price?: number, date?: string) {
  const netAmount = maybeMultiply(amount, price);

  if (netAmount) {
    return netAmount * getVatRate(date);
  } else {
    return undefined;
  }
}
