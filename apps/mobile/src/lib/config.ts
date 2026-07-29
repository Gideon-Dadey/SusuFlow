import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Runtime config for the mobile app.
 * Production builds set EXPO_PUBLIC_API_URL via EAS env / secrets.
 */

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function isDevRuntime(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configured) {
    return normalizeBaseUrl(configured);
  }

  if (isDevRuntime()) {
    // 1. Dynamic Expo host IP detection for physical devices scanning Expo Go QR
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(":")[0];
      if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
        return `http://${hostIp}:4000`;
      }
    }

    // 2. Android emulator loopback
    if (Platform.OS === "android") {
      return "http://10.0.2.2:4000";
    }

    // 3. Fallback to production Render live API URL
    return "https://susuflow-api.onrender.com";
  }

  return "https://susuflow-api.onrender.com";
}

export function getWebBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_WEB_URL?.trim();
  if (configured) return normalizeBaseUrl(configured);
  if (isDevRuntime()) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(":")[0];
      if (hostIp && hostIp !== "localhost" && hostIp !== "127.0.0.1") {
        return `http://${hostIp}:3000`;
      }
    }
    return "https://susuflow.onrender.com";
  }
  return "https://susuflow.onrender.com";
}

export function getSupportEmail(): string {
  return (
    process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || "support@susuflow.com"
  );
}

export function getSupportPhone(): string {
  return process.env.EXPO_PUBLIC_SUPPORT_PHONE?.trim() || "+233302000000";
}

export function getSupportWhatsApp(): string {
  return process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP?.trim() || "233302000000";
}

export const legalUrls = {
  terms: () => `${getWebBaseUrl()}/terms`,
  privacy: () => `${getWebBaseUrl()}/privacy`,
} as const;

export function openPasswordResetRequest(email?: string) {
  const support = getSupportEmail();
  const subject = encodeURIComponent("Credo password reset request");
  const body = encodeURIComponent(
    email
      ? `Hello Credo support,\n\nPlease help reset the password for:\n${email}\n\nThank you.`
      : "Hello Credo support,\n\nPlease help reset my Credo password.\n\nRegistered email:\n\nThank you.",
  );
  return `mailto:${support}?subject=${subject}&body=${body}`;
}
