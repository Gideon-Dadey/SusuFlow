import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { refreshCustomerFinancials } from "@/lib/financial-queries";
import {
  parsePushNotificationData,
  resolveNotificationRouteFromPush,
  resolveTransactionForDeepLink,
} from "@/lib/notification-routing";
import {
  configurePushNotificationHandler,
  registerDevicePushToken,
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
  const queryClient = useQueryClient();
  const { sessionKey } = useCustomerSession();
  const router = useRouter();
  const setPendingReceipt = useDeepLinkStore((s) => s.setPendingReceipt);
  const registerAttemptedRef = useRef(false);
  const handledResponseIds = useRef(new Set<string>());

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      registerAttemptedRef.current = false;
      return;
    }

    if (registerAttemptedRef.current) return;
    registerAttemptedRef.current = true;
    void registerDevicePushToken();

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

      if (fallback.kind === "kyc") {
        router.push("/(tabs)/profile/kyc");
        return;
      }
      if (fallback.kind === "plans") {
        router.push("/(tabs)/plans");
        return;
      }

      const transaction = await resolveTransactionForDeepLink(sessionKey, data);
      if (transaction) {
        setPendingReceipt(transaction);
        router.push("/(tabs)/activity");
        return;
      }

      if (fallback.kind === "activity") {
        router.push("/(tabs)/activity");
        return;
      }

      router.push("/(tabs)");
    };

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      refresh();
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        void handleResponse(response);
      },
    );

    // Cold start: user tapped a notification while the app was killed.
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
  ]);

  return <>{children}</>;
}
