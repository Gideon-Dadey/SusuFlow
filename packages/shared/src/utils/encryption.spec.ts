import { decryptField, encryptField, isEncrypted } from "./encryption";

const KEY = "a".repeat(64);

describe("encryption", () => {
  it("round-trips plaintext", () => {
    const encrypted = encryptField("GHA-123456789-0", KEY);
    expect(isEncrypted(encrypted)).toBe(true);
    expect(decryptField(encrypted, KEY)).toBe("GHA-123456789-0");
  });

  it("returns legacy plaintext unchanged", () => {
    expect(decryptField("GHA-123456789-0", KEY)).toBe("GHA-123456789-0");
  });

  it("does not double-encrypt", () => {
    const once = encryptField("secret", KEY);
    const twice = encryptField(once, KEY);
    expect(twice).toBe(once);
  });
});
