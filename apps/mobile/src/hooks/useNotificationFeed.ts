import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  buildNotificationFeed,
  buildNotificationFromInbox,
  countUnreadNotifications,
  mergeNotificationFeeds,
} from "@/lib/notification-utils";
import {
  fetchCustomerDeposits,
  fetchCustomerWithdrawals,
  financialQueryOptions,
} from "@/lib/financial-queries";
import { notificationApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { syncAppIconBadge } from "@/lib/push-notifications";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useNotificationStore } from "@/stores/notification.store";
import type { AppNotification } from "@/types/notification";

export function useNotificationFeed(customerId: string | undefined) {
  const queryClient = useQueryClient();
  const { sessionKey } = useCustomerSession();
  const hydrateForUser = useNotificationStore((s) => s.hydrateForUser);
  const lastSeenAt = useNotificationStore((s) => s.lastSeenAt);
  const isHydrated = useNotificationStore((s) => s.isHydrated);
  const activeUserId = useNotificationStore((s) => s.activeUserId);
  const markAllReadLocal = useNotificationStore((s) => s.markAllRead);

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

  const inboxQuery = useQuery({
    queryKey: sessionKey
      ? queryKeys.notificationInbox(sessionKey.userId)
      : ["notification-inbox", "inactive"],
    queryFn: () => notificationApi.listInbox({ limit: 40 }),
    enabled: notificationsReady,
    staleTime: 60_000,
  });

  const localItems = useMemo(
    () =>
      buildNotificationFeed(
        depositsQuery.data?.items ?? [],
        withdrawalsQuery.data?.items ?? [],
      ),
    [depositsQuery.data?.items, withdrawalsQuery.data?.items],
  );

  const inboxItems = useMemo(() => {
    const deposits = depositsQuery.data?.items ?? [];
    const withdrawals = withdrawalsQuery.data?.items ?? [];
    return (inboxQuery.data?.items ?? []).map((item) => {
      const match =
        [...deposits, ...withdrawals].find(
          (txn) =>
            txn.id === item.transactionId || txn.reference === item.reference,
        ) ?? undefined;
      return buildNotificationFromInbox(item, match);
    });
  }, [
    inboxQuery.data?.items,
    depositsQuery.data?.items,
    withdrawalsQuery.data?.items,
  ]);

  const items = useMemo(
    () => mergeNotificationFeeds(inboxItems, localItems),
    [inboxItems, localItems],
  );

  const unreadCount = useMemo(
    () => countUnreadNotifications(items, lastSeenAt),
    [items, lastSeenAt],
  );

  useEffect(() => {
    if (!notificationsReady) return;
    void syncAppIconBadge(unreadCount);
  }, [notificationsReady, unreadCount]);

  const hasPending = useMemo(
    () =>
      items.some((item) =>
        ["pending", "processing", "requested"].includes(
          item.status.toLowerCase(),
        ),
      ),
    [items],
  );

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await markAllReadLocal();
      try {
        await notificationApi.markAllRead();
      } catch {
        // Local cutoff still advances so the badge clears offline.
      }
    },
    onSuccess: () => {
      if (sessionKey) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notificationInbox(sessionKey.userId),
        });
      }
      void syncAppIconBadge(0);
    },
  });

  const isLoading =
    (depositsQuery.isPending && !depositsQuery.data) ||
    (withdrawalsQuery.isPending && !withdrawalsQuery.data);

  return {
    items,
    unreadCount,
    hasPending,
    lastSeenAt,
    isLoading,
    isError: depositsQuery.isError || withdrawalsQuery.isError,
    refetch: async () => {
      await Promise.all([
        depositsQuery.refetch(),
        withdrawalsQuery.refetch(),
        inboxQuery.refetch(),
      ]);
    },
    markAllRead: () => markAllReadMutation.mutateAsync(),
  };
}

export type { AppNotification };
