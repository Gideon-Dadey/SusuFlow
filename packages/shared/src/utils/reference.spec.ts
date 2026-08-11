import {
  allocateTransactionReference,
  formatTransactionReference,
  generateTransactionReference,
  generateCustomerNumber,
  isEightDigitReference,
} from "./reference";

describe("reference utils", () => {
  describe("generateTransactionReference", () => {
    it("returns an 8-digit number", () => {
      expect(generateTransactionReference()).toMatch(/^\d{8}$/);
    });

    it("never starts with zero", () => {
      for (let i = 0; i < 40; i += 1) {
        expect(generateTransactionReference().startsWith("0")).toBe(false);
      }
    });

    it("generates unique references", () => {
      const refs = new Set(
        Array.from({ length: 50 }, () => generateTransactionReference()),
      );
      expect(refs.size).toBe(50);
    });
  });

  describe("allocateTransactionReference", () => {
    it("skips taken values", async () => {
      const taken = new Set<string>();
      const first = generateTransactionReference();
      taken.add(first);

      const allocated = await allocateTransactionReference(async (reference) =>
        taken.has(reference),
      );

      expect(allocated).toMatch(/^\d{8}$/);
      expect(allocated).not.toBe(first);
    });
  });

  describe("isEightDigitReference", () => {
    it("accepts only 8 digits", () => {
      expect(isEightDigitReference("48291037")).toBe(true);
      expect(isEightDigitReference("TXN-20240624-ABC123")).toBe(false);
      expect(isEightDigitReference("1234567")).toBe(false);
    });
  });

  describe("formatTransactionReference", () => {
    it("returns 8-digit references unchanged", () => {
      expect(formatTransactionReference("48291037")).toBe("48291037");
    });

    it("keeps legacy references intact for verify lookups", () => {
      expect(formatTransactionReference("TXN-20240624-ABC123")).toBe(
        "TXN-20240624-ABC123",
      );
    });
  });

  describe("generateCustomerNumber", () => {
    it("pads sequence to 6 digits", () => {
      expect(generateCustomerNumber(1)).toBe("CUS-000001");
      expect(generateCustomerNumber(123456)).toBe("CUS-123456");
    });
  });
});
