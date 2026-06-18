import { validateProductionSecrets, isValidUuid } from './validate-env';

describe('validate-env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isValidUuid', () => {
    it('accepts valid UUIDs', () => {
      expect(isValidUuid('00000000-0000-0000-0000-000000000001')).toBe(true);
    });

    it('rejects SQL injection strings', () => {
      expect(isValidUuid("'; DROP TABLE users; --")).toBe(false);
    });
  });

  describe('validateProductionSecrets', () => {
    it('skips validation in development', () => {
      process.env.NODE_ENV = 'development';
      expect(() => validateProductionSecrets()).not.toThrow();
    });

    it('throws when JWT_SECRET is missing in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;
      expect(() => validateProductionSecrets()).toThrow('JWT_SECRET');
    });

    it('throws when JWT_SECRET uses default value', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'change-me-in-production-use-64-char-random-string';
      process.env.ENCRYPTION_KEY = 'a'.repeat(32);
      process.env.DATABASE_URL = 'postgresql://localhost/test';
      expect(() => validateProductionSecrets()).toThrow('default value');
    });
  });
});
