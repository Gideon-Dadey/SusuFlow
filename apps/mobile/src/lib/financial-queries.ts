import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { depositApi, planApi, withdrawalApi } from "@/lib/api";
import type { CustomerSessionScope } from "@/lib/query-keys";
import { queryKeys } from "@/lib/query-keys";
import { fetchCustomerWallet } from "@/lib/customer-wallet";

/** How long cached wallet/transaction data stays fresh before a background refetch. */
export const FINANCIAL_STALE_MS = 2 * 60_000;

/** Goals catalog + enrollments — longer stale window; progress updates via invalidate. */
export const PLANS_STALE_MS = 5 * 60_000;

/** Keep financial cache warm while navigating tabs. */
export const FINANCIAL_GC_MS = 30 * 60_000;

export const TRANSACTION_LIST_LIMIT = 50;

export const financialQueryOptions = {
  staleTime: FINANCIAL_STALE_MS,
  gcTime: FINANCIAL_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: false,
  retry: 1,
} as const;

export const profileQueryOptions = {
  staleTime: PLANS_STALE_MS,
  gcTime: FINANCIAL_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: false,
  retry: 1,
} as const;

export const plansQueryOptions = {
  staleTime: PLANS_STALE_MS,
  gcTime: FINANCIAL_GC_MS,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  refetchOnMount: false,
  retry: 1,
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

function isQueryStale(
  queryClient: QueryClient,
  queryKey: QueryKey,
  staleMs: number,
): boolean {
  const state = queryClient.getQueryState(queryKey);
  if (!state?.dataUpdatedAt) return true;
  return Date.now() - state.dataUpdatedAt > staleMs;
}

function refetchStaleKeys(
  queryClient: QueryClient,
  keys: QueryKey[],
  staleMs: number,
  force: boolean,
) {
  if (force) {
    // refetchType "all" updates inactive caches (e.g. Goals after a deposit).
    void Promise.all(
      keys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey, refetchType: "all" }),
      ),
    );
    return;
  }

  const staleKeys = keys.filter((key) =>
    isQueryStale(queryClient, key, staleMs),
  );

  if (!staleKeys.length) return;

  void Promise.all(
    staleKeys.map((queryKey) =>
      queryClient.refetchQueries({ queryKey, type: "active" }),
    ),
  );
}

/** Silent background refetch — only when cache is stale (unless forced). */
export function refreshCustomerFinancials(
  queryClient: QueryClient,
  scope: CustomerSessionScope,
  options?: { force?: boolean },
) {
  const { userId, customerId } = scope;
  const force = options?.force ?? false;

  refetchStaleKeys(
    queryClient,
    [
      queryKeys.wallet(userId, customerId),
      queryKeys.deposits(userId, customerId),
      queryKeys.withdrawals(userId, customerId),
    ],
    FINANCIAL_STALE_MS,
    force,
  );

  refreshCustomerPlans(queryClient, userId, options);
}

/** Keep Goals catalog + enrollments fresh without blocking tab paints. */
export function refreshCustomerPlans(
  queryClient: QueryClient,
  userId: string,
  options?: { force?: boolean },
) {
  refetchStaleKeys(
    queryClient,
    [queryKeys.plans, queryKeys.enrollments(userId)],
    PLANS_STALE_MS,
    options?.force ?? false,
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
    queryClient.prefetchQuery({
      queryKey: queryKeys.plans,
      queryFn: () => planApi.listPlans(),
      ...plansQueryOptions,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.enrollments(userId),
      queryFn: () => planApi.listEnrollments(),
      ...plansQueryOptions,
    }),
  ]);
}
