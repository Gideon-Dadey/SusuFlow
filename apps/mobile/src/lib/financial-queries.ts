import type { QueryClient } from "@tanstack/react-query";
import type { CustomerSessionScope } from "@/lib/query-keys";
import { queryKeys } from "@/lib/query-keys";

/** User-scoped financial queries — no cross-user placeholder data. */
export const financialQueryOptions = {
  staleTime: 0,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 2,
} as const;

/** Silent background refetch — no spinners. */
export function refreshCustomerFinancials(
  queryClient: QueryClient,
  scope: CustomerSessionScope,
) {
  const { userId, customerId } = scope;
  void Promise.all([
    queryClient.refetchQueries({
      queryKey: queryKeys.wallet(userId, customerId),
      type: "active",
    }),
    queryClient.refetchQueries({
      queryKey: queryKeys.deposits(userId, customerId),
      type: "active",
    }),
    queryClient.refetchQueries({
      queryKey: queryKeys.withdrawals(userId, customerId),
      type: "active",
    }),
    queryClient.refetchQueries({
      queryKey: queryKeys.notificationFeed(userId, customerId),
      type: "active",
    }),
  ]);
}

export function invalidateCustomerFinancials(
  queryClient: QueryClient,
  scope: CustomerSessionScope,
) {
  void refreshCustomerFinancials(queryClient, scope);
}
