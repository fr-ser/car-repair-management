const CURRENCY_SYMBOL = '€';
const LOCALE = 'de-DE';
export const THOUSANDS_SEPARATOR =
  getLocaleFormatInfo(LOCALE).thousandsSeparator;
export const DECIMAL_SEPARATOR = getLocaleFormatInfo(LOCALE).decimalSeparator;
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
  number: number | undefined | null,
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

  let result = number.toLocaleString(LOCALE, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });

  if (options?.currency) {
    result = `${result} ${CURRENCY_SYMBOL}`;
  }
  return result;
}

/**
 * Get the thousands separator and decimal separator for a given locale
 */
function getLocaleFormatInfo(locale: string): {
  thousandsSeparator: string;
  decimalSeparator: string;
} {
  const formatter = new Intl.NumberFormat(locale);

  // Use a number that has both thousands and decimals to ensure we get both separators
  const parts = formatter.formatToParts(1234.5);

  const thousandsSeparator =
    parts.find((part) => part.type === 'group')?.value || '';
  const decimalSeparator =
    parts.find((part) => part.type === 'decimal')?.value || '.';

  return {
    thousandsSeparator,
    decimalSeparator,
  };
}

/**
 * This function parses a string into a number with a specific number.
 * Is is meant to be used as the inverse to "formatNumber"
 *
 * Defaults:
 * - currency: false
 * - undefinedAs: "-"
 */
export function parseNumber(
  input: string,
  options?: {
    currency?: boolean;
    undefinedAs?: string;
  },
): number | null {
  const undefinedAs = options?.undefinedAs ?? '-';
  let cleanedInput = input;

  if (options?.currency) {
    cleanedInput = cleanedInput.replace(CURRENCY_SYMBOL, '').trim();
  }

  if (cleanedInput === undefinedAs || cleanedInput === '') {
    return null;
  }

  if (THOUSANDS_SEPARATOR) {
    cleanedInput = cleanedInput.replaceAll(THOUSANDS_SEPARATOR, '');
  }

  if (DECIMAL_SEPARATOR !== '.') {
    cleanedInput = cleanedInput.replaceAll(DECIMAL_SEPARATOR, '.');
  }

  return parseFloat(cleanedInput);
}
