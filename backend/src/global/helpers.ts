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

/**
 * This function formats a number into a string with a specific number of decimals
 * and optionally adds a currency symbol
 *
 * Defaults:
 * - currency: false
 * - minDecimals: 0 (2 if currency is true): Superseded by currency flag
 * - maxDecimals: 5 (2 if currency is true): Superseded by currency flag
 * - undefinedAs: "-"
 */
export function formatNumber(
  number: number | undefined,
  options?: {
    currency?: boolean;
    minDecimals?: number;
    maxDecimals?: number;
    undefinedAs?: string;
  },
): string {
  let minDecimals = 0;
  let maxDecimals = 5;
  if (options?.minDecimals != null) {
    minDecimals = options.minDecimals;
  }
  if (options?.maxDecimals != null) {
    maxDecimals = options.maxDecimals;
  }
  if (options?.currency) {
    minDecimals = 2;
    maxDecimals = 2;
  }

  if (number == null) {
    return options?.undefinedAs ?? '-';
  }

  let result = number.toLocaleString('de-DE', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });

  if (options?.currency) {
    result = `${result} €`;
  }
  return result;
}

export function round(number: number, decimals: number = 0): number {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * This function formats a date input (provided as ISO string) into a date
 * formatted for humans (e.g. 2021-12-31 -> 31.12.2021)
 *
 * Upon request padded dates are used: 2021-01-02 -> 02.01.2021
 */
export function formatIsoDateString(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('de-DE', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
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

export function getItemSum(items: { price?: number; amount?: number }[]) {
  return round(
    items.reduce((curr, item) => {
      if (item.price == null || item.amount == null) return curr;
      else return (curr += round(item.price * item.amount, 2));
    }, 0),
    2,
  );
}
