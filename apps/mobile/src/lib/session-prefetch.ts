import { depositApi, userApi, withdrawalApi } from "@/lib/api";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/lib/api";

/** Warm profile + financial queries before the home tab mounts after sign-in. */
export async function prefetchAuthenticatedSession(
  userId: string,
): Promise<User> {
  const profile = await queryClient.fetchQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => userApi.getMe(),
  });

  const customerId = profile.customer?.id;
  if (!customerId) return profile;

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.wallet(userId, customerId),
      queryFn: () => fetchCustomerWallet(customerId),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.deposits(userId, customerId),
      queryFn: () => depositApi.list({ customer_id: customerId }),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.withdrawals(userId, customerId),
      queryFn: () => withdrawalApi.list({ customer_id: customerId }),
    }),
  ]);

  return profile;
}
