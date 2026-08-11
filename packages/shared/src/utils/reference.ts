export const TRANSACTION_REFERENCE_PATTERN = /^\d{8}$/;

export function isEightDigitReference(reference: string): boolean {
  return TRANSACTION_REFERENCE_PATTERN.test(reference);
}

export function generateTransactionReference(): string {
  return String(10_000_000 + Math.floor(Math.random() * 90_000_000));
}

export async function allocateTransactionReference(
  isTaken: (reference: string) => Promise<boolean>,
  attempts = 16,
): Promise<string> {
  for (let i = 0; i < attempts; i += 1) {
    const reference = generateTransactionReference();
    if (!(await isTaken(reference))) return reference;
  }
  throw new Error("Unable to allocate a unique 8-digit transaction reference");
}

export function formatTransactionReference(reference: string): string {
  return isEightDigitReference(reference) ? reference : reference;
}

export function generateCustomerNumber(sequence: number): string {
  return `CUS-${String(sequence).padStart(6, "0")}`;
}
