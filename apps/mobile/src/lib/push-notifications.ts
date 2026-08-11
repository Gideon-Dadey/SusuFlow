import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { ANDROID_PUSH_CHANNELS } from "@susuflow/shared/client";
import { appVersion } from "@/lib/app-version";
import { userApi } from "@/lib/api";
import { storage } from "@/lib/storage";

export const TRANSACTION_CHANNEL_ID = ANDROID_PUSH_CHANNELS.transactions;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function allowsNotifications(
  settings: Notifications.NotificationPermissionsStatus,
): boolean {
  const granted = (settings as { granted?: boolean }).granted;
  return (
    granted === true ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

let handlerConfigured = false;

export function configurePushNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureAndroidNotificationChannels() {
  if (Platform.OS !== "android") return;

  await Promise.all([
    Notifications.setNotificationChannelAsync(
      ANDROID_PUSH_CHANNELS.transactions,
      {
        name: "Payments & payouts",
        description: "Deposits, withdrawals, and wallet movement",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#059669",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PRIVATE,
        enableVibrate: true,
        showBadge: true,
      },
    ),
    Notifications.setNotificationChannelAsync(ANDROID_PUSH_CHANNELS.identity, {
      name: "Identity",
      description: "Ghana Card and verification updates",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      showBadge: true,
    }),
    Notifications.setNotificationChannelAsync(ANDROID_PUSH_CHANNELS.security, {
      name: "Security",
      description: "Sign-in, password, and lock alerts",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 400, 200, 400],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      enableVibrate: true,
      showBadge: true,
    }),
    Notifications.setNotificationChannelAsync(ANDROID_PUSH_CHANNELS.account, {
      name: "Account",
      description: "Service messages from your susu company",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      showBadge: true,
    }),
  ]);
}

export async function ensureIosNotificationCategories() {
  if (Platform.OS !== "ios") return;

  await Promise.all([
    Notifications.setNotificationCategoryAsync("transactions", [
      {
        identifier: "view-activity",
        buttonTitle: "View",
        options: { opensAppToForeground: true },
      },
    ]),
    Notifications.setNotificationCategoryAsync("identity", [
      {
        identifier: "open-kyc",
        buttonTitle: "Open verification",
        options: { opensAppToForeground: true },
      },
    ]),
    Notifications.setNotificationCategoryAsync("security", [
      {
        identifier: "open-security",
        buttonTitle: "Review security",
        options: { opensAppToForeground: true },
      },
    ]),
  ]);
}

function getExpoProjectId(): string | undefined {
  const candidates = [
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    Constants.easConfig?.projectId,
    Constants.expoConfig?.extra?.eas?.projectId,
  ];
  for (const value of candidates) {
    if (value && UUID_RE.test(value)) return value;
  }
  return undefined;
}

export async function requestPushPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const current = await Notifications.getPermissionsAsync();
  if (allowsNotifications(current)) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return allowsNotifications(requested);
}

let registerInFlight: Promise<string | null> | null = null;

export async function registerDevicePushToken(): Promise<string | null> {
  if (registerInFlight) return registerInFlight;

  registerInFlight = (async () => {
    configurePushNotificationHandler();

    if (!Device.isDevice) {
      console.warn("[push] Push notifications require a physical device.");
      return null;
    }

    const granted = await requestPushPermissions();
    if (!granted) {
      console.warn("[push] Notification permission not granted.");
      return null;
    }

    await ensureAndroidNotificationChannels();
    await ensureIosNotificationCategories();

    const projectId = getExpoProjectId();
    if (!projectId) {
      console.warn(
        "[push] Missing a valid EAS project UUID. Run `eas init` in apps/mobile.",
      );
      return null;
    }

    try {
      const tokenResult = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenResult.data;
      const stored = await storage.getItem(storage.keys.expoPushToken);
      if (stored === token) return token;

      const platform =
        Platform.OS === "ios"
          ? "ios"
          : Platform.OS === "android"
            ? "android"
            : undefined;

      await userApi.registerPushToken({
        token,
        platform,
        deviceName: Device.deviceName ?? Device.modelName ?? undefined,
        appVersion,
      });
      await storage.setItem(storage.keys.expoPushToken, token);
      return token;
    } catch (error) {
      console.warn("[push] Failed to register push token:", error);
      return null;
    }
  })().finally(() => {
    registerInFlight = null;
  });

  return registerInFlight;
}

export async function registerDevicePushTokenWithRetry(
  attempts = 2,
): Promise<string | null> {
  for (let index = 0; index < attempts; index += 1) {
    const token = await registerDevicePushToken();
    if (token) return token;
    await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** index));
  }
  return null;
}

export async function syncAppIconBadge(count: number) {
  try {
    await Notifications.setBadgeCountAsync(Math.max(0, count));
  } catch {
    // Web / Expo Go may not support badges.
  }
}

export async function unregisterDevicePushToken(): Promise<void> {
  const token = await storage.getItem(storage.keys.expoPushToken);
  if (!token) return;

  try {
    await userApi.removePushToken({ token });
  } catch {
    // Session may already be cleared.
  }

  await storage.removeItem(storage.keys.expoPushToken);
  await syncAppIconBadge(0);
}
