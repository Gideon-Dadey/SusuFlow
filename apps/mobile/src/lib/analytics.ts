/**
 * Product analytics scaffold — mirrors monitoring.ts.
 * Wire a vendor (PostHog / Amplitude / Mixpanel) behind track() without
 * scattering SDKs through screens.
 */
type AnalyticsProps = Record<
  string,
  string | number | boolean | null | undefined
>;

let enabled = false;

export const analytics = {
  init() {
    // Enable when EXPO_PUBLIC_ANALYTICS_KEY is set and a vendor SDK is added.
    enabled = Boolean(process.env.EXPO_PUBLIC_ANALYTICS_KEY?.trim());
    if (__DEV__ && !enabled) {
      console.info("[analytics] disabled (no EXPO_PUBLIC_ANALYTICS_KEY)");
    }
  },

  track(event: string, props?: AnalyticsProps) {
    if (__DEV__) {
      console.info("[analytics]", event, props ?? {});
    }
    if (!enabled) return;
    // Vendor hook-up lives here when a key + SDK are configured.
  },

  identify(userId: string, traits?: AnalyticsProps) {
    if (__DEV__) {
      console.info("[analytics] identify", userId, traits ?? {});
    }
    if (!enabled) return;
  },

  reset() {
    if (__DEV__) {
      console.info("[analytics] reset");
    }
    if (!enabled) return;
  },
};

/** Canonical event names — keep funnels consistent. */
export const AnalyticsEvents = {
  loginSuccess: "auth.login_success",
  loginBiometric: "auth.login_biometric",
  registerSuccess: "auth.register_success",
  kycStarted: "kyc.started",
  kycSubmitted: "kyc.submitted",
  depositStarted: "deposit.started",
  depositConfirmed: "deposit.confirmed",
  depositFailed: "deposit.failed",
  withdrawStarted: "withdraw.started",
  withdrawConfirmed: "withdraw.confirmed",
  withdrawFailed: "withdraw.failed",
  supportEscalate: "support.escalate",
} as const;
