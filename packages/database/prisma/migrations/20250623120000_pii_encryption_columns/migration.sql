-- Expand PII columns to store AES-256-GCM ciphertext
ALTER TABLE "customers" ALTER COLUMN "ghana_card_number" TYPE VARCHAR(512);
ALTER TABLE "users" ALTER COLUMN "mfa_secret" TYPE VARCHAR(512);
