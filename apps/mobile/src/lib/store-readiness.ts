/**
 * Store-readiness notes for operators (EAS secrets / support contacts).
 * Keep this in sync with .env.example and eas.json.
 *
 * Before App Store / Play Store submit:
 * 1. Stop Metro, then run: pnpm install (pulls @sentry/react-native)
 * 2. Set EAS secret EXPO_PUBLIC_SENTRY_DSN
 * 3. Set real EXPO_PUBLIC_SUPPORT_PHONE and EXPO_PUBLIC_SUPPORT_WHATSAPP
 *    (placeholder numbers are intentionally hidden in the app)
 * 4. Confirm EXPO_PUBLIC_API_URL / EXPO_PUBLIC_WEB_URL for production
 * 5. Build with: pnpm build:production
 */
export const STORE_READINESS = {
  version: "1.0.0",
  requiredSecrets: [
    "EXPO_PUBLIC_API_URL",
    "EXPO_PUBLIC_WEB_URL",
    "EXPO_PUBLIC_SENTRY_DSN",
    "EXPO_PUBLIC_SUPPORT_PHONE",
    "EXPO_PUBLIC_SUPPORT_WHATSAPP",
  ] as const,
} as const;
