import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  buildNotificationFeed,
  countUnreadNotifications,
} from "@/lib/notification-utils";
import { financialQueryOptions } from "@/lib/financial-queries";
import { depositApi, withdrawalApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useNotificationStore } from "@/stores/notification.store";
import type { AppNotification } from "@/types/notification";

const NOTIFICATION_POLL_MS = 12_000;

async function fetchNotificationFeed(customerId: string) {
  const [deposits, withdrawals] = await Promise.all([
    depositApi.list({ customer_id: customerId }),
    withdrawalApi.list({ customer_id: customerId }),
  ]);
  return buildNotificationFeed(deposits.items, withdrawals.items);
}

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

  const query = useQuery({
    queryKey: sessionKey
      ? queryKeys.notificationFeed(sessionKey.userId, sessionKey.customerId)
      : ["notification-feed", "inactive"],
    queryFn: () => fetchNotificationFeed(sessionKey!.customerId),
    enabled: notificationsReady,
    ...financialQueryOptions,
    refetchInterval: NOTIFICATION_POLL_MS,
  });

  const items = query.data ?? [];

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

  return {
    items,
    unreadCount,
    hasPending,
    isLoading: query.isPending || (query.isFetching && items.length === 0),
    isError: query.isError,
    refetch: query.refetch,
    markAllRead,
  };
}

export type { AppNotification };
