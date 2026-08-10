import { useUserProfileQuery } from "@/hooks/useUserProfileQuery";
import { useTenantBranding } from "@/hooks/useTenantBranding";
import { useAuthStore } from "@/stores/auth.store";

export function useProfileData() {
  const user = useAuthStore((s) => s.user);
  const tenantSlug = useAuthStore((s) => s.tenantSlug);

  const query = useUserProfileQuery();
  const branding = useTenantBranding();
  const profile = query.data;
  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.firstName || "Member";
  const initials = (
    profile?.firstName?.[0] ||
    user?.firstName?.[0] ||
    "S"
  ).toUpperCase();
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || "";
  const avatarUrl = profile?.avatarUrl ?? user?.avatarUrl ?? null;

  return {
    user,
    profile,
    displayName,
    initials,
    email,
    phone,
    avatarUrl,
    tenantSlug,
    groupName: branding.groupName,
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor,
    isLoading: (query.isPending && !profile) || branding.isLoading,
    isError: query.isError,
    refetch: async () => {
      await Promise.all([query.refetch(), branding.refetch()]);
    },
  };
}
