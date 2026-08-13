/**
 * Production crash/error reporting.
 * Set EXPO_PUBLIC_SENTRY_DSN in EAS to enable. Without a DSN this stays a no-op.
 *
 * Uses a soft require so Expo Go / missing native modules never crash boot.
 */
import Constants from "expo-constants";

type CaptureContext = Record<string, unknown>;

type SentryModule = {
  init: (options: Record<string, unknown>) => void;
  captureException: (error: unknown, hint?: { extra?: CaptureContext }) => void;
  captureMessage: (message: string, hint?: { extra?: CaptureContext }) => void;
  setUser: (user: { id: string; email?: string } | null) => void;
};

let Sentry: SentryModule | null = null;
let initialized = false;

try {
  // Soft require — package may be absent until pnpm install completes.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Sentry = require("@sentry/react-native") as SentryModule;
} catch {
  Sentry = null;
}

function getDsn(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (fromEnv) return fromEnv;
  const extra = Constants.expoConfig?.extra as
    | { sentryDsn?: string }
    | undefined;
  return extra?.sentryDsn?.trim() || undefined;
}

export const monitoring = {
  init() {
    if (initialized) return;
    const dsn = getDsn();
    if (!dsn || !Sentry) {
      if (__DEV__) {
        console.info(
          "[monitoring] Sentry idle",
          !dsn ? "(no DSN)" : "(SDK not installed)",
        );
      }
      return;
    }

    Sentry.init({
      dsn,
      enableAutoSessionTracking: true,
      tracesSampleRate: __DEV__ ? 1.0 : 0.15,
      environment:
        process.env.EXPO_PUBLIC_APP_ENV?.trim() ||
        (__DEV__ ? "development" : "production"),
      release: Constants.expoConfig?.version
        ? `susuflow-mobile@${Constants.expoConfig.version}`
        : undefined,
      dist: Constants.nativeBuildVersion ?? undefined,
      enableNativeCrashHandling: true,
      sendDefaultPii: false,
    });
    initialized = true;
  },

  captureException(error: unknown, context?: CaptureContext) {
    if (__DEV__) {
      console.error("[monitoring]", error, context);
    }
    if (!initialized || !Sentry) return;
    Sentry.captureException(error, context ? { extra: context } : undefined);
  },

  captureMessage(message: string, context?: CaptureContext) {
    if (__DEV__) {
      console.warn("[monitoring]", message, context);
    }
    if (!initialized || !Sentry) return;
    Sentry.captureMessage(message, context ? { extra: context } : undefined);
  },

  setUser(user: { id: string; email?: string } | null) {
    if (!initialized || !Sentry) return;
    Sentry.setUser(user);
  },
};
