import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { refreshCustomerFinancials } from "@/lib/financial-queries";
import {
  configurePushNotificationHandler,
  registerDevicePushToken,
} from "@/lib/push-notifications";
import { useAuthStore } from "@/stores/auth.store";

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
  const registerAttemptedRef = useRef(false);

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
    const refresh = () => {
      if (sessionKey) {
        refreshCustomerFinancials(queryClient, sessionKey);
      }
    };

    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      refresh();
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      () => {
        refresh();
        router.push("/(tabs)/activity");
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [sessionKey, queryClient, router]);

  return <>{children}</>;
}
