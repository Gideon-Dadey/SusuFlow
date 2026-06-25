import { useUserProfileQuery } from "@/hooks/useUserProfileQuery";
import { useAuthStore } from "@/stores/auth.store";

export function useProfileData() {
  const user = useAuthStore((s) => s.user);
  const tenantSlug = useAuthStore((s) => s.tenantSlug);

  const query = useUserProfileQuery();
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
  const groupName = tenantSlug
    ? tenantSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "My Susu Group";

  return {
    user,
    profile,
    displayName,
    initials,
    email,
    phone,
    groupName,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
