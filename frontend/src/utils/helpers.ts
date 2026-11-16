export {
  getVatRate,
  invoiceLineNet,
  invoiceTotals,
} from '@shared/invoice-calculations';

/**
 * This function is for compile time checking of completeness of if statements
 * It needs to be passed the parameter, that has been checked exhaustively
 */

export function neverFunction(_: never): never {
  throw new Error('This function should not have been called.');
}
