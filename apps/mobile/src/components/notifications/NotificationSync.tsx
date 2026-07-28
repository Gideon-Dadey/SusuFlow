import { useEffect } from "react";
import { useNotificationFeed } from "@/hooks/useNotificationFeed";
import { useScopedCustomerId } from "@/hooks/useScopedCustomerId";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";

/**
 * Subscribes to the shared transaction cache for in-app notifications.
 */
export function NotificationSync() {
  const authUserId = useAuthStore((s) => s.user?.id);
  const hydrateForUser = useNotificationStore((s) => s.hydrateForUser);
  const isHydrated = useNotificationStore((s) => s.isHydrated);
  const activeUserId = useNotificationStore((s) => s.activeUserId);

  useEffect(() => {
    if (authUserId) {
      void hydrateForUser(authUserId);
    }
  }, [authUserId, hydrateForUser]);

  const notificationsReady =
    !!authUserId && isHydrated && activeUserId === authUserId;
  const customerId = useScopedCustomerId();

  useNotificationFeed(notificationsReady ? customerId : undefined);

  return null;
}
