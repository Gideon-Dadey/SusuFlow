/** Deterministic avatar gradients — black / charcoal only. */
const AVATAR_GRADIENTS: readonly [string, string][] = [
  ["#18181b", "#09090b"],
  ["#27272a", "#18181b"],
  ["#3f3f46", "#18181b"],
  ["#52525b", "#27272a"],
  ["#09090b", "#27272a"],
  ["#18181b", "#3f3f46"],
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
