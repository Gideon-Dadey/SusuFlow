import { tenantApi } from "@/lib/api";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { storage } from "@/lib/storage";
import { Image } from "react-native";

export type TenantBranding = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor?: string;
  status?: string;
};

/** Keep branding warm — company renames should still feel instant on home/goals. */
export const tenantBrandingQueryOptions = {
  staleTime: 5 * 60_000,
  gcTime: 24 * 60 * 60_000,
  refetchOnMount: true as const,
  refetchOnReconnect: true as const,
};

export function titleCaseTenantSlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveTenantDisplayName(
  branding: Pick<TenantBranding, "name"> | null | undefined,
  slug: string | null | undefined,
  fallback = "My Susu Group",
): string {
  const live = branding?.name?.trim();
  if (live) return live;
  if (slug?.trim()) return titleCaseTenantSlug(slug.trim());
  return fallback;
}

function cacheKey(slug: string) {
  return `${storage.keys.tenantBranding}_${slug}`;
}

export async function readCachedTenantBranding(
  slug: string,
): Promise<TenantBranding | null> {
  try {
    const raw = await storage.getItem(cacheKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TenantBranding;
    if (!parsed?.name || !parsed?.slug) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeCachedTenantBranding(
  branding: TenantBranding,
): Promise<void> {
  try {
    // SecureStore is tiny (~2KB on Android). Never persist base64 data-URI logos.
    const logoUrl =
      branding.logoUrl &&
      !branding.logoUrl.startsWith("data:") &&
      branding.logoUrl.length < 1500
        ? branding.logoUrl
        : null;
    await storage.setItem(
      cacheKey(branding.slug),
      JSON.stringify({
        id: branding.id,
        name: branding.name,
        slug: branding.slug,
        logoUrl,
        primaryColor: branding.primaryColor,
        status: branding.status,
      }),
    );
  } catch {
    // Non-critical — memory cache still works.
  }
}

export async function clearCachedTenantBranding(slug?: string | null) {
  if (!slug) return;
  try {
    await storage.removeItem(cacheKey(slug));
  } catch {
    // ignore
  }
}

/** Network fetch + disk snapshot so cold starts show the live company name. */
export async function fetchTenantBranding(
  slug: string,
): Promise<TenantBranding> {
  const tenant = await tenantApi.getBySlug(slug);
  const branding: TenantBranding = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logoUrl: tenant.logoUrl ?? null,
    primaryColor: tenant.primaryColor,
    status: tenant.status,
  };
  void writeCachedTenantBranding(branding);
  if (branding.logoUrl && !branding.logoUrl.startsWith("data:")) {
    Image.prefetch(branding.logoUrl).catch(() => undefined);
  }
  return branding;
}

export async function prefetchTenantBranding(slug: string | null | undefined) {
  const trimmed = slug?.trim();
  if (!trimmed) return;

  const cached = await readCachedTenantBranding(trimmed);
  if (cached) {
    queryClient.setQueryData(queryKeys.tenantBranding(trimmed), cached);
    if (cached.logoUrl && !cached.logoUrl.startsWith("data:")) {
      Image.prefetch(cached.logoUrl).catch(() => undefined);
    }
  }

  await queryClient.prefetchQuery({
    queryKey: queryKeys.tenantBranding(trimmed),
    queryFn: () => fetchTenantBranding(trimmed),
    ...tenantBrandingQueryOptions,
  });
}

export async function invalidateTenantBranding(
  slug: string | null | undefined,
) {
  const trimmed = slug?.trim();
  if (!trimmed) return;
  await queryClient.invalidateQueries({
    queryKey: queryKeys.tenantBranding(trimmed),
  });
}
