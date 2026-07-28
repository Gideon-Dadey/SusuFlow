import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { profileQueryOptions } from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";

/** Profile query scoped to the active auth user — never reuses another user's cache. */
export function useUserProfileQuery() {
  const authUserId = useAuthStore((s) => s.user?.id);

  return useQuery({
    queryKey: queryKeys.userProfile(authUserId ?? ""),
    queryFn: () => userApi.getMe(),
    enabled: !!authUserId,
    ...profileQueryOptions,
  });
}
