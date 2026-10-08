import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercentageDelta,
  formatRate,
  formatDateTime,
  formatDate,
  formatRelativeTime,
} from './formatters';

describe('formatCurrency', () => {
  it('should correctly format integer cents into USD currency string', () => {
    expect(formatCurrency(1050, 'USD')).toBe('$10.50');
    expect(formatCurrency(24999, 'USD')).toBe('$249.99');
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('should handle negative cents accurately', () => {
    expect(formatCurrency(-500, 'USD')).toBe('-$5.00');
  });

  it('should support alternative currencies such as EUR', () => {
    const formatted = formatCurrency(12000, 'EUR', 'en-US');
    expect(formatted).toContain('120.00');
  });
});

describe('formatPercentageDelta', () => {
  it('should prepend + sign for positive percentages', () => {
    expect(formatPercentageDelta(8.4)).toBe('+8.40%');
  });

  it('should format negative percentages with minus sign', () => {
    expect(formatPercentageDelta(-4.5)).toBe('-4.50%');
  });

  it('should handle zero without sign', () => {
    expect(formatPercentageDelta(0)).toBe('0.00%');
  });
});

describe('formatRate', () => {
  it('should format success rate with two decimals and percent sign', () => {
    expect(formatRate(96.82)).toBe('96.82%');
    expect(formatRate(100)).toBe('100.00%');
  });
});

describe('formatDateTime and formatDate', () => {
  it('should format valid ISO UTC strings predictably', () => {
    const iso = '2026-11-01T10:14:22.000Z';
    expect(formatDate(iso)).toBe('Nov 1, 2026');
    expect(formatDateTime(iso)).toBe('Nov 1, 2026, 10:14:22 UTC');
  });

  it('should return "Invalid Date" for unparseable input', () => {
    expect(formatDate('invalid-timestamp')).toBe('Invalid Date');
    expect(formatDateTime('invalid-timestamp')).toBe('Invalid Date');
    expect(formatRelativeTime('invalid-timestamp')).toBe('Invalid Date');
  });

  it('should format relative timestamps appropriately', () => {
    const now = new Date();
    const tenSecAgo = new Date(now.getTime() - 10 * 1000).toISOString();
    expect(formatRelativeTime(tenSecAgo)).toBe('just now');

    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    expect(formatRelativeTime(tenMinAgo)).toBe('10m ago');

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
  });
});
