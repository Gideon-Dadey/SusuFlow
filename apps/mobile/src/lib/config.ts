/**
 * Runtime config for the mobile app.
 * Production / preview builds must set EXPO_PUBLIC_* via EAS (see eas.json).
 * Dev may fall back to the shared Render API so Expo Go works without .env.
 */

function isDevRuntime(): boolean {
  if (typeof __DEV__ !== "undefined") return __DEV__;
  return process.env.NODE_ENV !== "production";
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

const DEV_API_FALLBACK = "https://susuflow.onrender.com";
const DEV_WEB_FALLBACK = "https://susuflow.onrender.com";

/** Known placeholder numbers — never ship these to real users as clickable contacts. */
const PLACEHOLDER_PHONES = new Set([
  "+233302000000",
  "233302000000",
  "0302000000",
  "+233 30 200 0000",
]);

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) {
    return normalizeBaseUrl(configured);
  }
  if (isDevRuntime()) {
    return DEV_API_FALLBACK;
  }
  throw new Error(
    "EXPO_PUBLIC_API_URL is not configured. Set it in eas.json / EAS secrets before shipping.",
  );
}

export function getWebBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_WEB_URL?.trim();
  if (configured) return normalizeBaseUrl(configured);
  if (isDevRuntime()) {
    return DEV_WEB_FALLBACK;
  }
  throw new Error(
    "EXPO_PUBLIC_WEB_URL is not configured. Set it in eas.json / EAS secrets before shipping.",
  );
}

export function getSupportEmail(): string {
  return (
    process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || "gideondadey@gmail.com"
  );
}

/**
 * Returns a dialable phone or null when unset / placeholder.
 * UI must hide Call when null.
 */
export function getSupportPhone(): string | null {
  const configured = process.env.EXPO_PUBLIC_SUPPORT_PHONE?.trim();
  if (!configured || PLACEHOLDER_PHONES.has(configured)) return null;
  return configured;
}

/**
 * Returns digits for wa.me or null when unset / placeholder.
 * UI must hide WhatsApp when null.
 */
export function getSupportWhatsApp(): string | null {
  const configured = process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP?.trim();
  if (!configured || PLACEHOLDER_PHONES.has(configured)) return null;
  return configured.replace(/[^\d]/g, "");
}

export function hasLiveSupportChannels(): boolean {
  return Boolean(getSupportPhone() || getSupportWhatsApp());
}

export function openSupportWhatsAppUrl(prefill?: string): string | null {
  const wa = getSupportWhatsApp();
  if (!wa) return null;
  if (!prefill?.trim()) return `https://wa.me/${wa}`;
  return `https://wa.me/${wa}?text=${encodeURIComponent(prefill.trim())}`;
}

export function openSupportEmailUrl(opts?: {
  subject?: string;
  body?: string;
}): string {
  const email = getSupportEmail();
  const subject = encodeURIComponent(opts?.subject ?? "SusuFlow support");
  const body = encodeURIComponent(opts?.body ?? "");
  return `mailto:${email}?subject=${subject}&body=${body}`;
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
