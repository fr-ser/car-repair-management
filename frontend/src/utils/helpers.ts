/**
 * This function is for compile time checking of completeness of if statements
 * It needs to be passed the parameter, that has been checked exhaustively
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function neverFunction(_: never): never {
  throw new Error('This function should not have been called.');
}

/**
 * getVatRate returns the correct full German VAT rate (e.g. 0.19) depending on the date
 */
export function getVatRate(isoDate?: string): number {
  if (isoDate == null || isoDate === '') {
    return 0.19;
  }

  const realDate = new Date(isoDate);
  // The German government decided to lower the VAT rate for three months (because why not)
  const start16VAT = new Date('2020-07-01');
  const end16VAT = new Date('2020-12-31');

  if (realDate >= start16VAT && realDate <= end16VAT) {
    return 0.16;
  } else {
    return 0.19;
  }
}
