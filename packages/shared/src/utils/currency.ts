export function formatGhs(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const safe = Number.isFinite(num) ? num : 0;
  // en-US avoids Hermes/RN injecting GH₵ or GHS when using en-GH.
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return `₵${formatted}`;
}

export function parseAmount(value: string | number): number {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num < 0) {
    throw new Error("Invalid amount");
  }
  return Math.round(num * 100) / 100;
}
