/** Deterministic avatar gradients — emerald / teal / navy only (on-brand fintech). */
const AVATAR_GRADIENTS: readonly [string, string][] = [
  ["#0056d2", "#0043aa"],
  ["#0066cc", "#003585"],
  ["#0043aa", "#002359"],
  ["#3385ff", "#0056d2"],
  ["#0056d2", "#002359"],
  ["#003585", "#0056d2"],
] as const;

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarGradient(seed: string): [string, string] {
  const index =
    hashSeed(seed.trim().toLowerCase() || "member") % AVATAR_GRADIENTS.length;
  return [...AVATAR_GRADIENTS[index]];
}
