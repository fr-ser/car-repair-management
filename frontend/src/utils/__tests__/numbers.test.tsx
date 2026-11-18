import { describe, expect, it } from 'vitest';

import { formatNumber, parseNumber } from '../numbers';

describe('number formatting', () => {
  it('formats and parses German currency consistently', () => {
    const formatted = formatNumber(1234.5, { currency: true });

    expect(formatted).toBe('1.234,50 €');
    expect(parseNumber(formatted, { currency: true })).toBe(1234.5);
  });
});
