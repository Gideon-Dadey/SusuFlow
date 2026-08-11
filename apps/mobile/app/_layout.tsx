import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Platform, View } from "react-native";
import { useAuthStore } from "@/stores/auth.store";
import { useAppLockStore } from "@/stores/app-lock.store";
import { useThemeStore } from "@/stores/theme.store";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { AppLockGate } from "@/components/security/AppLockGate";
import { PushNotificationProvider } from "@/components/notifications/PushNotificationProvider";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { monitoring } from "@/lib/monitoring";
import { lightColors } from "@/theme/tokens";

SplashScreen.preventAutoHideAsync();
monitoring.init();

function useReactNativeFocusManager() {
  useEffect(() => {
    if (Platform.OS === "web") return;

    const onAppState = useAppLockStore.getState().onAppStateChange;

    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
      onAppState(status);
    });

    return () => subscription.remove();
  }, []);
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isHydrated) return;

    const isBootRoute = pathname === "/" || pathname === "/index";
    const inAuth = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuth && !isBootRoute) {
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuth) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isHydrated, pathname, router, segments]);

  return <>{children}</>;
}

function RootShell() {
  const { isDark } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGate>
        <PushNotificationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="transactions"
              options={{
                presentation: "card",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="my-profile"
              options={{
                presentation: "card",
                headerShown: false,
              }}
            />
          </Stack>
          {isAuthenticated ? <AppLockGate /> : null}
        </PushNotificationProvider>
      </AuthGate>
    </>
  );
}

export default function RootLayout() {
  useReactNativeFocusManager();

  const [fontsLoaded, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const hydrateAuth = useAuthStore((s) => s.hydrateFromStorage);
  const hydrateTheme = useThemeStore((s) => s.hydrateFromStorage);
  const hydrateLock = useAppLockStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    void Promise.all([hydrateAuth(), hydrateTheme(), hydrateLock()]);
  }, [hydrateAuth, hydrateTheme, hydrateLock]);

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) {
    return (
      <View
        style={{ flex: 1, backgroundColor: lightColors.splashBackground }}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppErrorBoundary>
          <RootShell />
        </AppErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
