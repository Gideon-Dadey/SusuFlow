export function generateTransactionReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${dateStr}-${random}`;
}

export function generateCustomerNumber(sequence: number): string {
  return `CUS-${String(sequence).padStart(6, '0')}`;
}
