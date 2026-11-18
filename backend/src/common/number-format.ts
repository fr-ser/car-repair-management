export const NUMBER_LOCALE = 'de-DE';
export const CURRENCY_SYMBOL = '€';

/**
 * Formats a number using the German locale, optionally as currency.
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
  let minDecimals = options?.minDecimals ?? 0;
  let maxDecimals = options?.maxDecimals ?? 5;
  if (options?.currency) {
    minDecimals = 2;
    maxDecimals = 2;
  }

  if (number == null) {
    return options?.undefinedAs ?? '-';
  }

  const result = number.toLocaleString(NUMBER_LOCALE, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });

  return options?.currency ? `${result} ${CURRENCY_SYMBOL}` : result;
}

export function formatInvoiceLineNumber(value: number): string {
  return formatNumber(value, { minDecimals: 2, maxDecimals: 2 });
}
