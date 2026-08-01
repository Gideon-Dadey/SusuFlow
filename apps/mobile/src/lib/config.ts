import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Runtime config for the mobile app.
 * Connects Expo mobile app to the live backend server.
 */

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (configured) {
    return normalizeBaseUrl(configured);
  }

  // Live Render backend API base — accessible by physical iPhones/Androids on Expo Go, cellular, & Wi-Fi
  return "https://susuflow.onrender.com";
}

export function getWebBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_WEB_URL?.trim();
  if (configured) return normalizeBaseUrl(configured);
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
  const subject = encodeURIComponent("SusuFlow password reset request");
  const body = encodeURIComponent(
    email
      ? `Hello SusuFlow support,\n\nPlease help reset the password for:\n${email}\n\nThank you.`
      : "Hello SusuFlow support,\n\nPlease help reset my SusuFlow password.\n\nRegistered email:\n\nThank you.",
  );
  return `mailto:${support}?subject=${subject}&body=${body}`;
}
