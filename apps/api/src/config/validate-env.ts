const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function validateProductionSecrets(): void {
  if (process.env.NODE_ENV !== "production") return;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    console.error(
      "❌ CRITICAL: JWT_SECRET environment variable is missing or less than 32 characters.",
    );
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
  if (
    jwtSecret === "change-me-in-production-use-64-char-random-string" ||
    jwtSecret === "dev-secret"
  ) {
    console.error("❌ CRITICAL: JWT_SECRET is using a default insecure value.");
    throw new Error("JWT_SECRET must not use default value in production");
  }

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length < 32) {
    console.error(
      "❌ CRITICAL: ENCRYPTION_KEY environment variable is missing or less than 32 characters.",
    );
    throw new Error(
      "ENCRYPTION_KEY must be at least 32 characters in production",
    );
  }

  if (!process.env.DATABASE_URL) {
    console.error("❌ CRITICAL: DATABASE_URL environment variable is missing.");
    throw new Error("DATABASE_URL is required in production");
  }

  if (!process.env.SENTRY_DSN) {
    console.warn(
      "⚠️ SENTRY_DSN is not set. Sentry error reporting will be disabled.",
    );
  }
}
