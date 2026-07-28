import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  buildNotificationFeed,
  countUnreadNotifications,
} from "@/lib/notification-utils";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
  financialQueryOptions,
} from "@/lib/financial-queries";
import { queryKeys } from "@/lib/query-keys";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useNotificationStore } from "@/stores/notification.store";
import type { AppNotification } from "@/types/notification";

export function useNotificationFeed(customerId: string | undefined) {
  const { sessionKey } = useCustomerSession();
  const hydrateForUser = useNotificationStore((s) => s.hydrateForUser);
  const lastSeenAt = useNotificationStore((s) => s.lastSeenAt);
  const isHydrated = useNotificationStore((s) => s.isHydrated);
  const activeUserId = useNotificationStore((s) => s.activeUserId);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  useEffect(() => {
    if (sessionKey?.userId) {
      void hydrateForUser(sessionKey.userId);
    }
  }, [sessionKey?.userId, hydrateForUser]);

  const notificationsReady =
    !!sessionKey &&
    isHydrated &&
    activeUserId === sessionKey.userId &&
    customerId === sessionKey.customerId;

  const depositsQuery = useQuery({
    queryKey: sessionKey
      ? queryKeys.deposits(sessionKey.userId, sessionKey.customerId)
      : ["deposits", "inactive"],
    queryFn: () => fetchCustomerDeposits(sessionKey!.customerId),
    enabled: notificationsReady,
    ...financialQueryOptions,
  });

  const withdrawalsQuery = useQuery({
    queryKey: sessionKey
      ? queryKeys.withdrawals(sessionKey.userId, sessionKey.customerId)
      : ["withdrawals", "inactive"],
    queryFn: () => fetchCustomerWithdrawals(sessionKey!.customerId),
    enabled: notificationsReady,
    ...financialQueryOptions,
  });

  const items = useMemo(
    () =>
      buildNotificationFeed(
        depositsQuery.data?.items ?? [],
        withdrawalsQuery.data?.items ?? [],
      ),
    [depositsQuery.data?.items, withdrawalsQuery.data?.items],
  );

  const unreadCount = useMemo(
    () => countUnreadNotifications(items, lastSeenAt),
    [items, lastSeenAt],
  );

  const hasPending = useMemo(
    () =>
      items.some((item) =>
        ["pending", "processing", "requested"].includes(
          item.status.toLowerCase(),
        ),
      ),
    [items],
  );

  const isLoading =
    (depositsQuery.isPending && !depositsQuery.data) ||
    (withdrawalsQuery.isPending && !withdrawalsQuery.data);

  return {
    items,
    unreadCount,
    hasPending,
    isLoading,
    isError: depositsQuery.isError || withdrawalsQuery.isError,
    refetch: async () => {
      await Promise.all([depositsQuery.refetch(), withdrawalsQuery.refetch()]);
    },
    markAllRead,
  };
}

export type { AppNotification };
