import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { depositApi, withdrawalApi } from "@/lib/api";
import type { CustomerSessionScope } from "@/lib/query-keys";
import { queryKeys } from "@/lib/query-keys";
import { fetchCustomerWallet } from "@/lib/customer-wallet";

/** How long cached wallet/transaction data stays fresh before a background refetch. */
export const FINANCIAL_STALE_MS = 2 * 60_000;

/** Keep financial cache warm while navigating tabs. */
export const FINANCIAL_GC_MS = 30 * 60_000;

export const TRANSACTION_LIST_LIMIT = 100;

export const financialQueryOptions = {
  staleTime: FINANCIAL_STALE_MS,
  gcTime: FINANCIAL_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
} as const;

export const profileQueryOptions = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
} as const;

export const plansQueryOptions = {
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 2,
} as const;

export function fetchCustomerDeposits(customerId: string) {
  return depositApi.list({
    customer_id: customerId,
    limit: TRANSACTION_LIST_LIMIT,
  });
}

export function fetchCustomerWithdrawals(customerId: string) {
  return withdrawalApi.list({
    customer_id: customerId,
    limit: TRANSACTION_LIST_LIMIT,
  });
}

function isQueryStale(queryClient: QueryClient, queryKey: QueryKey): boolean {
  const state = queryClient.getQueryState(queryKey);
  if (!state?.dataUpdatedAt) return true;
  return Date.now() - state.dataUpdatedAt > FINANCIAL_STALE_MS;
}

/** Silent background refetch — only when cache is stale (unless forced). */
export function refreshCustomerFinancials(
  queryClient: QueryClient,
  scope: CustomerSessionScope,
  options?: { force?: boolean },
) {
  const { userId, customerId } = scope;
  const force = options?.force ?? false;

  const keys: QueryKey[] = [
    queryKeys.wallet(userId, customerId),
    queryKeys.deposits(userId, customerId),
    queryKeys.withdrawals(userId, customerId),
  ];

  const staleKeys = force
    ? keys
    : keys.filter((key) => isQueryStale(queryClient, key));

  if (!staleKeys.length) return;

  void Promise.all(
    staleKeys.map((queryKey) =>
      queryClient.refetchQueries({ queryKey, type: "active" }),
    ),
  );
}

export function invalidateCustomerFinancials(
  queryClient: QueryClient,
  scope: CustomerSessionScope,
) {
  refreshCustomerFinancials(queryClient, scope, { force: true });
}

/** Warm tab data once per session so tab switches feel instant. */
export function prefetchCustomerTabData(
  queryClient: QueryClient,
  scope: CustomerSessionScope,
) {
  const { userId, customerId } = scope;

  void Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.wallet(userId, customerId),
      queryFn: () => fetchCustomerWallet(customerId),
      ...financialQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.deposits(userId, customerId),
      queryFn: () => fetchCustomerDeposits(customerId),
      ...financialQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.withdrawals(userId, customerId),
      queryFn: () => fetchCustomerWithdrawals(customerId),
      ...financialQueryOptions,
    }),
  ]);
}
