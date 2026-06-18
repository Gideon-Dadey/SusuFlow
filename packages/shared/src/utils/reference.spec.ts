import {
  generateTransactionReference,
  generateCustomerNumber,
} from './reference';

describe('reference utils', () => {
  describe('generateTransactionReference', () => {
    it('starts with TXN- prefix', () => {
      expect(generateTransactionReference()).toMatch(/^TXN-\d{8}-[A-Z0-9]+$/);
    });

    it('generates unique references', () => {
      const refs = new Set(Array.from({ length: 50 }, () => generateTransactionReference()));
      expect(refs.size).toBe(50);
    });
  });

  describe('generateCustomerNumber', () => {
    it('pads sequence to 6 digits', () => {
      expect(generateCustomerNumber(1)).toBe('CUS-000001');
      expect(generateCustomerNumber(123456)).toBe('CUS-123456');
    });
  });
});
