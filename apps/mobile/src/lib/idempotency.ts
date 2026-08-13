/**
 * Stable client idempotency keys for money mutations.
 * Generate once per user intent (confirm tap), reuse on retries — never per request attempt.
 */
export function createIdempotencyKey(prefix: "dep" | "wd"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
}
