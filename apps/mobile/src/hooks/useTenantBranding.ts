import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  fetchTenantBranding,
  readCachedTenantBranding,
  resolveTenantDisplayName,
  tenantBrandingQueryOptions,
  type TenantBranding,
} from "@/lib/tenant-branding";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";

/** Live company name + logo for the signed-in tenant (shared with receipts). */
export function useTenantBranding() {
  const tenantSlug = useAuthStore((s) => s.tenantSlug);
  const slug = tenantSlug?.trim() || "";
  const [diskSeed, setDiskSeed] = useState<TenantBranding | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setDiskSeed(null);
      return;
    }
    void readCachedTenantBranding(slug).then((cached) => {
      if (!cancelled) setDiskSeed(cached);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const query = useQuery({
    queryKey: queryKeys.tenantBranding(slug),
    queryFn: () => fetchTenantBranding(slug),
    enabled: !!slug,
    placeholderData: diskSeed ?? undefined,
    ...tenantBrandingQueryOptions,
  });

  const branding = query.data ?? diskSeed ?? null;

  return {
    slug: slug || null,
    branding,
    groupName: resolveTenantDisplayName(branding, slug),
    logoUrl: branding?.logoUrl ?? null,
    primaryColor: branding?.primaryColor,
    isLoading: !!slug && query.isPending && !branding,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
