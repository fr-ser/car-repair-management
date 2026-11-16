import { expect, test } from 'vitest';

import { formatIsoDateString, formatNumber, getVatRate } from './helpers';

test('getVatRate applies the temporary reduced rate only during 2020', () => {
  expect(getVatRate('2020-06-30')).toBe(0.19);
  expect(getVatRate('2020-07-01')).toBe(0.16);
  expect(getVatRate('2020-12-31')).toBe(0.16);
  expect(getVatRate('2021-01-01')).toBe(0.19);
});

test('formatNumber', () => {
  expect(formatNumber(1234)).toBe('1.234');
  expect(formatNumber(1.234)).toBe('1,234');
  expect(formatNumber(12.34, { maxDecimals: 2 })).toBe('12,34');
  expect(formatNumber(12.349, { maxDecimals: 2 })).toBe('12,35');
  expect(formatNumber(12.34, { currency: true })).toBe('12,34 €');
  expect(formatNumber(null)).toBe('-');
  expect(formatNumber(undefined, { undefinedAs: '' })).toBe('');
  expect(formatNumber(12.3, { currency: true, minDecimals: 3 })).toBe(
    '12,30 €',
  );
});

test('formatIsoDateString', () => {
  expect(formatIsoDateString('2050-12-31')).toBe('31.12.2050');
  expect(formatIsoDateString('2024-01-02')).toBe('02.01.2024');
});
