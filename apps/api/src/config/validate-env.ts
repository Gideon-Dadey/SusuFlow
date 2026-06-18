const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function validateProductionSecrets(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (jwtSecret === 'change-me-in-production-use-64-char-random-string' || jwtSecret === 'dev-secret') {
    throw new Error('JWT_SECRET must not use default value in production');
  }

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters in production');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
}
