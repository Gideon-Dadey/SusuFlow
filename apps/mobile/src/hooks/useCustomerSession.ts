import { useUserProfileQuery } from "@/hooks/useUserProfileQuery";
import { useAuthStore } from "@/stores/auth.store";
import type { CustomerSessionScope } from "@/lib/query-keys";

export function useCustomerSession() {
  const authUserId = useAuthStore((s) => s.user?.id);
  const authCustomerId = useAuthStore((s) => s.user?.customerId);
  const profileQuery = useUserProfileQuery();
  const customerId = profileQuery.data?.customer?.id ?? authCustomerId;

  const sessionKey: CustomerSessionScope | null =
    authUserId && customerId ? { userId: authUserId, customerId } : null;

  const isProfileReady = !!authUserId && (!!profileQuery.data || !!customerId);

  return {
    authUserId,
    customerId,
    sessionKey,
    isProfileReady,
    profileQuery,
  };
}
