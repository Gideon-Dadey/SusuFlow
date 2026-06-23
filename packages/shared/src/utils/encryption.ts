import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";
const IV_LENGTH = 12;

function deriveKey(keyMaterial: string): Buffer {
  if (/^[0-9a-f]{64}$/i.test(keyMaterial)) {
    return Buffer.from(keyMaterial, "hex");
  }
  return createHash("sha256").update(keyMaterial).digest();
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

export function encryptField(plaintext: string, keyMaterial: string): string {
  if (!plaintext) return plaintext;
  if (isEncrypted(plaintext)) return plaintext;

  const key = deriveKey(keyMaterial);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptField(ciphertext: string, keyMaterial: string): string {
  if (!ciphertext) return ciphertext;
  if (!isEncrypted(ciphertext)) return ciphertext;

  const payload = ciphertext.slice(PREFIX.length);
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted field format");
  }

  const key = deriveKey(keyMaterial);
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivB64, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
