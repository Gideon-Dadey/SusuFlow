import { useUserProfileQuery } from "@/hooks/useUserProfileQuery";
import { useAuthStore } from "@/stores/auth.store";
import type { CustomerSessionScope } from "@/lib/query-keys";

export function useCustomerSession() {
  const authUserId = useAuthStore((s) => s.user?.id);
  const profileQuery = useUserProfileQuery();
  const customerId = profileQuery.data?.customer?.id;

  const sessionKey: CustomerSessionScope | null =
    authUserId && customerId ? { userId: authUserId, customerId } : null;

  const isProfileReady =
    !!authUserId && profileQuery.isSuccess && !!profileQuery.data;

  return {
    authUserId,
    customerId,
    sessionKey,
    isProfileReady,
    profileQuery,
  };
}
