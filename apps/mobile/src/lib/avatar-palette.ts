/** Deterministic avatar gradients — emerald / teal / navy only (on-brand fintech). */
const AVATAR_GRADIENTS: readonly [string, string][] = [
  ["#059669", "#047857"],
  ["#0d9488", "#0f766e"],
  ["#1a365d", "#065f46"],
  ["#047857", "#064e3b"],
  ["#0f766e", "#134e4a"],
  ["#065f46", "#1a365d"],
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
