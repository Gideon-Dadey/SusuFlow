import { storage } from "@/lib/storage";

/** Persist the moment of a successful login for home / profile display. */
export async function recordLastLoginAt(at = new Date()): Promise<string> {
  const iso = at.toISOString();
  await storage.setItem(storage.keys.lastLoginAt, iso);
  return iso;
}

export async function readLastLoginAt(): Promise<string | null> {
  return storage.getItem(storage.keys.lastLoginAt);
}

/** SusuFlow last-login line for home / profile. */
export function formatLastLoginLabel(
  iso: string | null | undefined,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const formatted = date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return `Last login · ${formatted}`;
}
