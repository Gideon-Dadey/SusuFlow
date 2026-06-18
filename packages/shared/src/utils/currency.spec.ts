import { formatGhs, parseAmount } from './currency';

describe('currency utils', () => {
  describe('formatGhs', () => {
    it('formats number as GHS currency', () => {
      const formatted = formatGhs(1000);
      expect(formatted).toContain('1,000.00');
      expect(formatted).toMatch(/GHS|GH₵/);
    });

    it('formats string amounts', () => {
      expect(formatGhs('50.5')).toContain('50.50');
    });
  });

  describe('parseAmount', () => {
    it('parses valid amounts', () => {
      expect(parseAmount(100.456)).toBe(100.46);
      expect(parseAmount('25.5')).toBe(25.5);
    });

    it('throws on invalid amounts', () => {
      expect(() => parseAmount('abc')).toThrow('Invalid amount');
      expect(() => parseAmount(-1)).toThrow('Invalid amount');
    });
  });
});
