import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { userApi } from "@/lib/api";
import { storage } from "@/lib/storage";

export const TRANSACTION_CHANNEL_ID = "transactions";

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

export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(TRANSACTION_CHANNEL_ID, {
    name: "Transactions",
    description: "Deposit and withdrawal alerts",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#059669",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
    showBadge: true,
  });
}

function getExpoProjectId(): string | undefined {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId || projectId === "susuflow-mobile") {
    return undefined;
  }
  return projectId;
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

export async function registerDevicePushToken(): Promise<string | null> {
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

  await ensureAndroidNotificationChannel();

  const projectId = getExpoProjectId();
  if (!projectId) {
    console.warn(
      "[push] Set a valid EAS projectId in app.json (run `eas init` in apps/mobile).",
    );
    return null;
  }

  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const token = tokenResult.data;
    const platform =
      Platform.OS === "ios"
        ? "ios"
        : Platform.OS === "android"
          ? "android"
          : undefined;

    await userApi.registerPushToken({ token, platform });
    await storage.setItem(storage.keys.expoPushToken, token);
    return token;
  } catch (error) {
    console.warn("[push] Failed to register push token:", error);
    return null;
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
}
