import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { refreshCustomerFinancials } from "@/lib/financial-queries";
import {
  hrefForNotificationRoute,
  parsePushNotificationData,
  resolveNotificationRouteFromPush,
  resolveTransactionForDeepLink,
} from "@/lib/notification-routing";
import { queryKeys } from "@/lib/query-keys";
import {
  configurePushNotificationHandler,
  registerDevicePushToken,
  registerDevicePushTokenWithRetry,
} from "@/lib/push-notifications";
import { useAuthStore } from "@/stores/auth.store";
import { useDeepLinkStore } from "@/stores/deep-link.store";

configurePushNotificationHandler();

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { sessionKey } = useCustomerSession();
  const router = useRouter();
  const setPendingReceipt = useDeepLinkStore((s) => s.setPendingReceipt);
  const registerAttemptedRef = useRef(false);
  const wasAuthenticatedRef = useRef(false);
  const handledResponseIds = useRef(new Set<string>());

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      if (wasAuthenticatedRef.current) {
        registerAttemptedRef.current = false;
      }
      wasAuthenticatedRef.current = false;
      return;
    }

    wasAuthenticatedRef.current = true;
    if (registerAttemptedRef.current) return;
    registerAttemptedRef.current = true;
    void registerDevicePushTokenWithRetry(2);

    const tokenSub = Notifications.addPushTokenListener(() => {
      void registerDevicePushToken();
    });

    return () => {
      tokenSub.remove();
    };
  }, [isHydrated, isAuthenticated]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;

    const refresh = () => {
      if (sessionKey) {
        refreshCustomerFinancials(queryClient, sessionKey, { force: true });
      }
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.notificationInbox(userId),
        });
      }
    };

    const handleResponse = async (
      response: Notifications.NotificationResponse,
    ) => {
      const responseId = response.notification.request.identifier;
      if (handledResponseIds.current.has(responseId)) return;
      handledResponseIds.current.add(responseId);

      refresh();

      const data = parsePushNotificationData(
        response.notification.request.content.data as Record<string, unknown>,
      );
      const fallback = resolveNotificationRouteFromPush(data);

      if (fallback.kind === "kyc" || fallback.kind === "security") {
        router.push(hrefForNotificationRoute(fallback.kind));
        return;
      }
      if (fallback.kind === "plans") {
        router.push(hrefForNotificationRoute("plans"));
        return;
      }

      const transaction = await resolveTransactionForDeepLink(sessionKey, data);
      if (transaction) {
        setPendingReceipt(transaction);
        router.push(hrefForNotificationRoute("activity"));
        return;
      }

      router.push(hrefForNotificationRoute(fallback.kind));
    };

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      refresh();
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        void handleResponse(response);
      },
    );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) void handleResponse(response);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [
    isHydrated,
    isAuthenticated,
    sessionKey,
    queryClient,
    router,
    setPendingReceipt,
    userId,
  ]);

  return <>{children}</>;
}
