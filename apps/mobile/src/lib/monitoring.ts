/**
 * Lightweight crash/error reporting scaffold.
 * Set EXPO_PUBLIC_SENTRY_DSN to enable when @sentry/react-native is installed.
 */
type CaptureContext = Record<string, unknown>;

export const monitoring = {
  init() {
    // Native Sentry wiring belongs in a production EAS build.
    // Keep a no-op here so the app never crashes without a DSN.
  },

  captureException(error: unknown, context?: CaptureContext) {
    if (__DEV__) {
      console.error("[monitoring]", error, context);
    }
  },

  captureMessage(message: string, context?: CaptureContext) {
    if (__DEV__) {
      console.warn("[monitoring]", message, context);
    }
  },
};
