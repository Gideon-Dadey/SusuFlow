/**
 * Store-readiness notes for operators (EAS secrets / support contacts).
 * Operator-facing copy: docs/23-MOBILE_CUSTOMER_APP_AND_STORE_READINESS.md
 * and apps/mobile/README.md. Keep this list in sync with .env.example / eas.json.
 *
 * Before App Store / Play Store submit:
 * 1. Stop Metro, then run: pnpm install (pulls @sentry/react-native)
 * 2. Set EAS secret EXPO_PUBLIC_SENTRY_DSN
 * 3. Set real EXPO_PUBLIC_SUPPORT_PHONE and EXPO_PUBLIC_SUPPORT_WHATSAPP
 *    (placeholder numbers are intentionally hidden in the app)
 * 4. Confirm EXPO_PUBLIC_API_URL / EXPO_PUBLIC_WEB_URL for production
 * 5. Run: pnpm smoke:store  (config gate)
 * 6. Build with: pnpm build:production
 * 7. Physical device smoke on the production build
 */
export const STORE_READINESS = {
  version: "1.1.0",
  requiredSecrets: [
    "EXPO_PUBLIC_API_URL",
    "EXPO_PUBLIC_WEB_URL",
    "EXPO_PUBLIC_SENTRY_DSN",
    "EXPO_PUBLIC_SUPPORT_PHONE",
    "EXPO_PUBLIC_SUPPORT_WHATSAPP",
  ] as const,
  deviceSmoke: [
    "deposit confirm",
    "withdraw double-tap / idempotency",
    "biometric login",
    "offline money CTA disabled",
    "support ticket create",
    "push notification",
  ] as const,
} as const;
