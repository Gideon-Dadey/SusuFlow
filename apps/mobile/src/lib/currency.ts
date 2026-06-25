/**
 * Mobile currency display — always ₵ only (no GH / GHS prefix).
 * Kept local so Metro never picks up stale @susuflow/shared dist output.
 */
export function formatGhs(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const safe = Number.isFinite(num) ? num : 0;
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return `₵${formatted}`;
}

export function stripGhCurrencyPrefix(value: string): string {
  return value
    .replace(/^\s*GH\s*₵/i, "₵")
    .replace(/^\s*GH₵/i, "₵")
    .replace(/^\s*GHS\s*/i, "₵")
    .replace(/^\s*GH\s*/i, "₵")
    .trim();
}
