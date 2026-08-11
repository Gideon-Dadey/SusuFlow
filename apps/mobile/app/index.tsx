import { Redirect } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { LaunchSplash } from "@/components/launch/LaunchSplash";
import { useAuthStore } from "@/stores/auth.store";
import { lightColors } from "@/theme/tokens";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [launchComplete, setLaunchComplete] = useState(false);
  const finishLaunch = useCallback(() => setLaunchComplete(true), []);

  if (!isHydrated) {
    return (
      <View
        style={{ flex: 1, backgroundColor: lightColors.splashBackground }}
      />
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (!launchComplete) {
    return <LaunchSplash onFinish={finishLaunch} />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
