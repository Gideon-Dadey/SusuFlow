import { userApi } from "@/lib/api";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
  financialQueryOptions,
  profileQueryOptions,
} from "@/lib/financial-queries";
import { fetchCustomerWallet } from "@/lib/customer-wallet";
import { queryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { prefetchTenantBranding } from "@/lib/tenant-branding";
import type { User } from "@/lib/api";

/** Warm profile + financial queries before the home tab mounts after sign-in. */
export async function prefetchAuthenticatedSession(
  userId: string,
  tenantSlug?: string | null,
  customerId?: string | null,
): Promise<User | undefined> {
  const slug = tenantSlug?.trim() || "";
  const cached = queryClient.getQueryData<User>(queryKeys.userProfile(userId));
  let profile = cached;
  let resolvedCustomerId = customerId || cached?.customer?.id;

  const branding = slug ? prefetchTenantBranding(slug) : Promise.resolve();

  if (!resolvedCustomerId) {
    profile = await queryClient.fetchQuery({
      queryKey: queryKeys.userProfile(userId),
      queryFn: () => userApi.getMe(),
      ...profileQueryOptions,
    });
    resolvedCustomerId = profile.customer?.id;
  }

  if (!resolvedCustomerId) {
    await branding;
    return profile;
  }

  await Promise.all([
    branding,
    queryClient.prefetchQuery({
      queryKey: queryKeys.wallet(userId, resolvedCustomerId),
      queryFn: () => fetchCustomerWallet(resolvedCustomerId!),
      ...financialQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.deposits(userId, resolvedCustomerId),
      queryFn: () => fetchCustomerDeposits(resolvedCustomerId!),
      ...financialQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.withdrawals(userId, resolvedCustomerId),
      queryFn: () => fetchCustomerWithdrawals(resolvedCustomerId!),
      ...financialQueryOptions,
    }),
  ]);

  return profile;
}
