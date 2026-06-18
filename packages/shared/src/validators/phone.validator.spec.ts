import { normalizeGhanaPhone, isValidGhanaPhone } from './phone.validator';

describe('phone validator', () => {
  describe('normalizeGhanaPhone', () => {
    it('converts local format to +233', () => {
      expect(normalizeGhanaPhone('0241234567')).toBe('+233241234567');
    });

    it('converts 233 prefix without plus', () => {
      expect(normalizeGhanaPhone('233241234567')).toBe('+233241234567');
    });

    it('preserves already normalized numbers', () => {
      expect(normalizeGhanaPhone('+233241234567')).toBe('+233241234567');
    });

    it('strips spaces and dashes', () => {
      expect(normalizeGhanaPhone('+233 24-123-4567')).toBe('+233241234567');
    });
  });

  describe('isValidGhanaPhone', () => {
    it('accepts valid MTN numbers', () => {
      expect(isValidGhanaPhone('0241234567')).toBe(true);
      expect(isValidGhanaPhone('+233241234567')).toBe(true);
    });

    it('rejects invalid numbers', () => {
      expect(isValidGhanaPhone('12345')).toBe(false);
      expect(isValidGhanaPhone('+233991234567')).toBe(false);
    });
  });
});
