export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export function clampPageLimit(limit?: number): number {
  if (limit === undefined || limit === null) return DEFAULT_PAGE_LIMIT;
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_PAGE_LIMIT;
  return Math.min(Math.floor(parsed), MAX_PAGE_LIMIT);
}
