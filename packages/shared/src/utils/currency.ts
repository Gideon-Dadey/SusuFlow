export function formatGhs(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(num);
}

export function parseAmount(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num < 0) {
    throw new Error('Invalid amount');
  }
  return Math.round(num * 100) / 100;
}
