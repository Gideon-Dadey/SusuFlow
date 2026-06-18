import { isValidGhanaCard, formatGhanaCard } from './ghana-card.validator';

describe('ghana-card validator', () => {
  describe('isValidGhanaCard', () => {
    it('accepts valid Ghana Card format', () => {
      expect(isValidGhanaCard('GHA-123456789-0')).toBe(true);
      expect(isValidGhanaCard('gha-123456789-0')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidGhanaCard('123456789')).toBe(false);
      expect(isValidGhanaCard('GHA-12345-0')).toBe(false);
    });
  });

  describe('formatGhanaCard', () => {
    it('uppercases and removes spaces', () => {
      expect(formatGhanaCard(' gha-123456789-0 ')).toBe('GHA-123456789-0');
    });
  });
});
